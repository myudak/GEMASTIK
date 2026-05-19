from __future__ import annotations

import argparse
import concurrent.futures
import difflib
import html
import io
import json
import math
import re
import ssl
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
TABLES = ROOT / "reports" / "tables"

BGN_SPPG_URL = "https://www.bgn.go.id/operasional-sppg"
MBG_BASE = "https://mbg.pdm.kemendikdasmen.go.id"
MBG_PROVINCE_URL = MBG_BASE + "/rekapsatpen/getrekapprovinsi?jenjang=SD"
BAPANAS_IKP_URL = "https://data.badanpangan.go.id/download/document/dataset/90/1760069765.csv/csv"
BAPANAS_PRICE_URL = "https://data.badanpangan.go.id/download/document/dataset/176/1777271372.csv/csv"
BPS_POVERTY_URL = "https://www.bps.go.id/id/statistics-table/2/NjIxIzI=/persentase-penduduk-miskin--p0--menurut-kabupaten-kota.html"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; GiziRank-GEMASTIK/1.0; academic prototype)",
    "Accept": "*/*",
}

JAVA_PROVINCES = {
    "BANTEN",
    "DKI JAKARTA",
    "JAWA BARAT",
    "JAWA TENGAH",
    "DI YOGYAKARTA",
    "YOGYAKARTA",
    "JAWA TIMUR",
}

EASTERN_PROVINCES = {
    "NUSA TENGGARA BARAT",
    "NUSA TENGGARA TIMUR",
    "MALUKU",
    "MALUKU UTARA",
    "PAPUA",
    "PAPUA BARAT",
    "PAPUA BARAT DAYA",
    "PAPUA PEGUNUNGAN",
    "PAPUA SELATAN",
    "PAPUA TENGAH",
    "SULAWESI UTARA",
    "SULAWESI TENGAH",
    "SULAWESI SELATAN",
    "SULAWESI TENGGARA",
    "GORONTALO",
    "SULAWESI BARAT",
}


def ensure_dirs() -> None:
    for path in [DATA_RAW, DATA_PROCESSED, TABLES]:
        path.mkdir(parents=True, exist_ok=True)


def normalize_name(value: Any) -> str:
    text = "" if value is None else str(value)
    text = html.unescape(text).upper()
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.replace("D.I.", "DI").replace("D.K.I.", "DKI").replace("D. K. I.", "DKI").replace("D K I", "DKI")
    text = re.sub(r"\b(KOTA ADMINISTRASI|KOTA ADM\.|ADM\. KOTA)\b", "KOTA", text)
    text = re.sub(r"\b(PROVINSI|PROV\.|KABUPATEN|KAB\.|KAB|ADM\.|ADM)\b", " ", text)
    text = text.replace("KEP.", "KEPULAUAN")
    text = text.replace("NANGGROE ACEH DARUSSALAM", "ACEH")
    text = text.replace("DAERAH ISTIMEWA YOGYAKARTA", "YOGYAKARTA")
    text = re.sub(r"[^A-Z0-9]+", " ", text)
    text = text.replace("D K I", "DKI")
    return re.sub(r"\s+", " ", text).strip()


def merge_key(province: Any, district: Any) -> str:
    return f"{normalize_name(province)}|{normalize_name(district)}"


def safe_int(value: Any) -> int:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return 0
    text = str(value).replace(".", "").replace(",", "").strip()
    if text == "":
        return 0
    try:
        return int(float(text))
    except ValueError:
        return 0


def minmax(series: pd.Series, fill: float = 0.5) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").astype(float)
    if values.notna().sum() == 0:
        return pd.Series(fill, index=series.index)
    values = values.fillna(values.median())
    lo = values.min()
    hi = values.max()
    if hi == lo:
        return pd.Series(fill, index=series.index)
    return (values - lo) / (hi - lo)


def zscore_to_01(series: pd.Series) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").astype(float)
    values = values.fillna(values.median() if values.notna().any() else 0)
    std = values.std(ddof=0)
    if std == 0 or np.isnan(std):
        return pd.Series(0.5, index=series.index)
    z = (values - values.mean()) / std
    return pd.Series(1 / (1 + np.exp(-z)), index=series.index)


def fetch_bytes(url: str, timeout: int = 60, retries: int = 3, verify_ssl: bool = True) -> bytes:
    context = None if verify_ssl else ssl._create_unverified_context()
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout, context=context) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError, ssl.SSLError) as exc:
            last_error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Could not fetch {url}: {last_error}")


def fetch_text(url: str, timeout: int = 60, retries: int = 3, verify_ssl: bool = True) -> str:
    return fetch_bytes(url, timeout=timeout, retries=retries, verify_ssl=verify_ssl).decode("utf-8", "replace")


def fetch_json(url: str, timeout: int = 60, retries: int = 3) -> dict[str, Any]:
    return json.loads(fetch_text(url, timeout=timeout, retries=retries))


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def source_row(source: str, status: str, rows: int, output: Path | str, notes: str) -> dict[str, Any]:
    return {
        "source": source,
        "status": status,
        "rows": rows,
        "output": str(output),
        "retrieved_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "notes": notes,
    }


def parse_bgn_total_and_pages(first_page_html: str) -> tuple[int | None, int]:
    total = None
    total_match = re.search(r'id="total-sppg-count"[^>]*>\s*([0-9.]+)\s*</span>', first_page_html)
    if total_match:
        total = safe_int(total_match.group(1))
    pages = [int(x) for x in re.findall(r"\?page=(\d+)(?:&|&#38;)", first_page_html)]
    return total, max(pages) if pages else 1


def clean_cell(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", " ", fragment)
    text = html.unescape(text)
    text = text.replace("\r", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", text).strip()


def parse_sppg_rows(page_html: str) -> list[dict[str, Any]]:
    rows = []
    for row_html in re.findall(r'<tr class="divide-x divide-gray-200 text-sm[^>]*>(.*?)</tr>', page_html, flags=re.S):
        cells = [clean_cell(cell) for cell in re.findall(r"<td[^>]*>(.*?)</td>", row_html, flags=re.S)]
        if len(cells) >= 7:
            rows.append(
                {
                    "no": safe_int(cells[0]),
                    "province": cells[1],
                    "district": cells[2],
                    "subdistrict": cells[3],
                    "village": cells[4],
                    "address": cells[5],
                    "sppg_name": cells[6],
                }
            )
    return rows


def fetch_bgn_sppg(max_pages: int | None, workers: int, status: list[dict[str, Any]]) -> pd.DataFrame:
    raw_path = DATA_RAW / "bgn_sppg_operasional_scrape.csv"
    first_html = fetch_text(BGN_SPPG_URL, timeout=60, retries=3)
    DATA_RAW.joinpath("bgn_sppg_page_1.html").write_text(first_html, encoding="utf-8")
    total_count, last_page = parse_bgn_total_and_pages(first_html)
    target_pages = last_page if max_pages is None else min(max_pages, last_page)

    def fetch_page(page_no: int) -> tuple[int, list[dict[str, Any]], str | None]:
        try:
            if page_no == 1:
                page_html = first_html
            else:
                page_html = fetch_text(f"{BGN_SPPG_URL}?page={page_no}&search=", timeout=45, retries=2)
            return page_no, parse_sppg_rows(page_html), None
        except Exception as exc:  # noqa: BLE001 - saved for source-status audit
            return page_no, [], str(exc)

    rows: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    print(f"Fetching BGN SPPG pages: {target_pages}/{last_page} pages with {workers} workers")
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(fetch_page, page_no): page_no for page_no in range(1, target_pages + 1)}
        for i, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            page_no, page_rows, error = future.result()
            rows.extend(page_rows)
            if error:
                errors.append({"page": page_no, "error": error})
            if i % 250 == 0 or i == target_pages:
                print(f"  BGN SPPG progress: {i}/{target_pages} pages, {len(rows)} rows")

    df = pd.DataFrame(rows)
    df.to_csv(raw_path, index=False)
    if errors:
        pd.DataFrame(errors).to_csv(DATA_RAW / "bgn_sppg_scrape_errors.csv", index=False)
    notes = f"Parsed {target_pages} of {last_page} pages; page total label={total_count}; failed_pages={len(errors)}"
    status.append(source_row("BGN SPPG Operasional", "ok" if len(df) else "empty", len(df), raw_path, notes))
    return df


def fetch_mbg_kabupaten(status: list[dict[str, Any]]) -> pd.DataFrame:
    raw_path = DATA_RAW / "mbg_rekap_kabupaten.json"
    prov_json = fetch_json(MBG_PROVINCE_URL, timeout=60, retries=3)
    save_json(DATA_RAW / "mbg_rekap_provinsi.json", prov_json)
    province_items = list(prov_json.get("data", {}).values())

    all_payload: dict[str, Any] = {}
    rows: list[dict[str, Any]] = []
    for idx, province in enumerate(province_items, start=1):
        code = province.get("kode_prov")
        url = f"{MBG_BASE}/rekapsatpen/getrekapkabupaten?kode_prov={code}&jenjang=SD"
        try:
            payload = fetch_json(url, timeout=60, retries=3)
            all_payload[str(code)] = payload
        except Exception as exc:  # noqa: BLE001
            all_payload[str(code)] = {"status": "error", "error": str(exc)}
            continue
        for item in payload.get("data", {}).values():
            jenjang_rows = item.get("jenjang") or []
            if not jenjang_rows:
                continue
            sums = {
                "mbg_satpen": 0,
                "mbg_satpen_negeri": 0,
                "mbg_satpen_swasta": 0,
                "mbg_beneficiaries": 0,
                "mbg_laki": 0,
                "mbg_perempuan": 0,
                "mbg_alergi": 0,
                "mbg_fobia": 0,
                "mbg_intoleransi": 0,
                "mbg_kondisi_khusus": 0,
            }
            date_pull = None
            for level in jenjang_rows:
                date_pull = date_pull or level.get("date_pull")
                sums["mbg_satpen"] += safe_int(level.get("jumlah_satuan_pendidikan"))
                sums["mbg_satpen_negeri"] += safe_int(level.get("jumlah_satpen_negeri"))
                sums["mbg_satpen_swasta"] += safe_int(level.get("jumlah_satpen_swasta"))
                laki = safe_int(level.get("jumlah_laki"))
                perempuan = safe_int(level.get("jumlah_perempuan"))
                sums["mbg_laki"] += laki
                sums["mbg_perempuan"] += perempuan
                sums["mbg_beneficiaries"] += safe_int(level.get("jumlah_penerima_manfaat")) or (laki + perempuan)
                sums["mbg_alergi"] += safe_int(level.get("jumlah_alergi"))
                sums["mbg_fobia"] += safe_int(level.get("jumlah_fobia"))
                sums["mbg_intoleransi"] += safe_int(level.get("jumlah_intoleransi"))
                sums["mbg_kondisi_khusus"] += safe_int(level.get("jumlah_kondisi_khusus"))
            rows.append(
                {
                    "region_code": item.get("kode_kabkota"),
                    "province_code": code,
                    "province": re.sub(r"^Prov\.\s*", "", str(item.get("provinsi", province.get("provinsi", ""))), flags=re.I),
                    "district": item.get("kabupaten_kota"),
                    "date_pull": date_pull,
                    **sums,
                }
            )
        print(f"  MBG kabupaten progress: {idx}/{len(province_items)} provinces")

    save_json(raw_path, all_payload)
    df = pd.DataFrame(rows)
    df.to_csv(DATA_RAW / "mbg_rekap_kabupaten.csv", index=False)
    status.append(source_row("Dashboard MBG Kemendikdasmen", "ok" if len(df) else "empty", len(df), raw_path, "Public dashboard JSON endpoints"))
    return df


def fetch_bapanas_ikp(status: list[dict[str, Any]]) -> pd.DataFrame:
    raw_path = DATA_RAW / "bapanas_ikp_kab_kota_2024.csv"
    content = fetch_bytes(BAPANAS_IKP_URL, timeout=90, retries=3)
    raw_path.write_bytes(content)
    df = pd.read_csv(io.BytesIO(content))
    latest_year = int(df["Tahun"].max())
    latest = df[df["Tahun"] == latest_year].copy()
    latest["province_key"] = latest["Nama Provinsi"].map(normalize_name)
    city_mask = latest["Tipe"].astype(str).str.upper().str.contains("KOTA")
    already_city = latest["Nama Kabupaten"].astype(str).str.upper().str.strip().str.startswith("KOTA")
    latest["district_for_key"] = np.where(city_mask & ~already_city, "Kota " + latest["Nama Kabupaten"].astype(str), latest["Nama Kabupaten"].astype(str))
    latest["district_key"] = latest["district_for_key"].map(normalize_name)
    latest["merge_key"] = latest["Nama Provinsi"].combine(latest["district_for_key"], merge_key)
    latest = latest.rename(
        columns={
            "IKP": "ikp",
            "KELOMPOK IKP": "ikp_group",
            "Kriteria Kerentanan Pangan": "food_security_class",
            "Nama Provinsi": "ikp_province",
            "Nama Kabupaten": "ikp_district",
        }
    )
    status.append(source_row("Bapanas IKP/FSVA", "ok", len(latest), raw_path, f"Latest year={latest_year}"))
    return latest[["merge_key", "province_key", "district_key", "ikp", "ikp_group", "food_security_class", "ikp_province", "ikp_district"]]


def rupiah_to_float(value: Any) -> float:
    text = str(value)
    text = text.replace("Rp", "").replace(".", "").replace(",", ".").strip()
    try:
        return float(text)
    except ValueError:
        return np.nan


def month_number(month: str) -> int:
    months = {
        "JANUARI": 1,
        "FEBRUARI": 2,
        "MARET": 3,
        "APRIL": 4,
        "MEI": 5,
        "JUNI": 6,
        "JULI": 7,
        "AGUSTUS": 8,
        "SEPTEMBER": 9,
        "OKTOBER": 10,
        "NOVEMBER": 11,
        "DESEMBER": 12,
    }
    return months.get(str(month).upper(), 1)


def fetch_bapanas_prices(status: list[dict[str, Any]]) -> pd.DataFrame:
    raw_path = DATA_RAW / "bapanas_harga_pangan_konsumen_provinsi.csv"
    content = fetch_bytes(BAPANAS_PRICE_URL, timeout=120, retries=3)
    raw_path.write_bytes(content)
    df = pd.read_csv(io.BytesIO(content))
    df["price"] = df["Harga"].map(rupiah_to_float)
    df["month"] = df["Bulan"].map(month_number)
    df["period"] = pd.to_datetime(dict(year=df["Tahun"], month=df["month"], day=1), errors="coerce")
    grouped = (
        df.groupby(["Nama Provinsi", "period"], as_index=False)["price"]
        .mean()
        .sort_values(["Nama Provinsi", "period"])
    )
    grouped["pct_change"] = grouped.groupby("Nama Provinsi")["price"].pct_change()
    latest_period = grouped["period"].max()
    rows = []
    for province, group in grouped.groupby("Nama Provinsi"):
        tail = group.tail(12)
        rows.append(
            {
                "province": province,
                "province_key": normalize_name(province),
                "latest_food_price_mean": float(tail["price"].iloc[-1]),
                "price_volatility_12m": float(tail["pct_change"].std(skipna=True) if tail["pct_change"].notna().any() else 0),
                "latest_price_period": str(latest_period.date()) if pd.notna(latest_period) else "",
            }
        )
    out = pd.DataFrame(rows)
    out = (
        out.groupby("province_key", as_index=False)
        .agg(
            province=("province", "first"),
            latest_food_price_mean=("latest_food_price_mean", "mean"),
            price_volatility_12m=("price_volatility_12m", "mean"),
            latest_price_period=("latest_price_period", "max"),
        )
    )
    out["price_stress"] = 0.55 * zscore_to_01(out["latest_food_price_mean"]) + 0.45 * zscore_to_01(out["price_volatility_12m"])
    status.append(source_row("Bapanas harga pangan", "ok", len(df), raw_path, f"Latest period={latest_period.date() if pd.notna(latest_period) else 'unknown'}"))
    return out


def fetch_bps_poverty(status: list[dict[str, Any]]) -> pd.DataFrame:
    raw_path = DATA_RAW / "bps_poverty_table.html"
    try:
        text = fetch_text(BPS_POVERTY_URL, timeout=120, retries=2)
        raw_path.write_text(text, encoding="utf-8")
        start = text.find('{\\\"status\\\":\\\"OK\\\"')
        end = text.find(',\\\"dict\\\"', start)
        if start != -1 and end != -1:
            escaped = text[start:end]
            decoded = escaped.encode("utf-8").decode("unicode_escape")
        else:
            decoded_page = text.encode("utf-8").decode("unicode_escape")
            start = decoded_page.find('{"status":"OK"')
            end = decoded_page.find(',"dict"', start)
            if start == -1 or end == -1:
                raise ValueError("Could not locate embedded BPS table JSON")
            decoded = decoded_page[start:end]
        obj = json.loads(decoded)
        year_id = str(obj["tahun"][0]["val"])
        year_label = str(obj["tahun"][0]["label"])
        marker = "6210" + year_id + "0"
        labels = {str(x["val"]): re.sub(r"<[^>]+>", "", str(x["label"])) for x in obj["vervar"]}
        province_labels = {code[:2]: label for code, label in labels.items() if code.endswith("00")}
        rows = []
        for key, value in obj["datacontent"].items():
            if marker in key:
                region_code = key.split(marker)[0]
            else:
                region_code = key[:4]
            if region_code.endswith("00"):
                continue
            rows.append(
                {
                    "bps_region_code": region_code,
                    "province": province_labels.get(region_code[:2], ""),
                    "district": labels.get(region_code, ""),
                    "poverty_rate": float(value),
                    "poverty_year": year_label,
                    "merge_key": merge_key(province_labels.get(region_code[:2], ""), labels.get(region_code, "")),
                }
            )
        df = pd.DataFrame(rows)
        df.to_csv(DATA_RAW / "bps_poverty_kab_kota.csv", index=False)
        status.append(source_row("BPS poverty table", "ok", len(df), raw_path, f"Parsed embedded table year={year_label}"))
        return df
    except Exception as exc:  # noqa: BLE001
        status.append(source_row("BPS poverty table", "unavailable", 0, raw_path, f"Optional fetch failed: {exc}"))
        return pd.DataFrame(columns=["merge_key", "poverty_rate", "poverty_year"])


def load_optional_stunting(status: list[dict[str, Any]]) -> pd.DataFrame:
    path = DATA_RAW / "stunting_kabupaten.csv"
    if not path.exists():
        status.append(
            source_row(
                "Dashboard Stunting TP2S",
                "manual_optional_missing",
                0,
                path,
                "No direct tabular snapshot supplied; v1 uses MBG learner-condition proxy and supports this manual CSV.",
            )
        )
        return pd.DataFrame(columns=["merge_key", "stunting_rate"])
    df = pd.read_csv(path)
    required = {"province", "district", "stunting_rate"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"{path} is missing columns: {sorted(missing)}")
    df["merge_key"] = df["province"].combine(df["district"], merge_key)
    status.append(source_row("Dashboard Stunting TP2S", "manual_loaded", len(df), path, "Manual stunting snapshot"))
    return df[["merge_key", "stunting_rate"]]


def build_panel(
    mbg: pd.DataFrame,
    sppg: pd.DataFrame,
    ikp: pd.DataFrame,
    prices: pd.DataFrame,
    poverty: pd.DataFrame,
    stunting: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    panel = mbg.copy()
    panel["province_key"] = panel["province"].map(normalize_name)
    panel["district_key"] = panel["district"].map(normalize_name)
    panel["merge_key"] = panel["province"].combine(panel["district"], merge_key)
    panel["year_month"] = pd.to_datetime(panel["date_pull"], errors="coerce").dt.strftime("%Y-%m")
    if panel["year_month"].isna().all():
        panel["year_month"] = datetime.now().strftime("%Y-%m")
    panel["year_month"] = panel["year_month"].fillna(panel["year_month"].mode().iloc[0])

    if len(sppg):
        sppg = sppg.copy()
        sppg["province_key"] = sppg["province"].map(normalize_name)
        sppg["district_key"] = sppg["district"].map(normalize_name)
        sppg_counts = (
            sppg.groupby(["province_key", "district_key"], as_index=False)
            .size()
            .rename(columns={"size": "sppg_operational_count"})
        )
    else:
        sppg_counts = pd.DataFrame(columns=["province_key", "district_key", "sppg_operational_count"])

    panel = panel.merge(sppg_counts, on=["province_key", "district_key"], how="left")
    panel = panel.merge(ikp.drop(columns=["province_key", "district_key"], errors="ignore"), on="merge_key", how="left")
    if panel["ikp"].isna().any() and len(ikp):
        fuzzy_cols = ["ikp", "ikp_group", "food_security_class", "ikp_province", "ikp_district"]
        candidates_by_province = {province: group.copy() for province, group in ikp.groupby("province_key")}
        for idx, row in panel[panel["ikp"].isna()].iterrows():
            candidates = candidates_by_province.get(row["province_key"])
            if candidates is None or candidates.empty:
                continue
            scores = candidates["district_key"].map(lambda value: difflib.SequenceMatcher(None, row["district_key"], value).ratio())
            best_idx = scores.idxmax()
            if float(scores.loc[best_idx]) >= 0.86:
                for col in fuzzy_cols:
                    panel.at[idx, col] = candidates.at[best_idx, col]
    panel = panel.merge(prices.drop(columns=["province"], errors="ignore"), on="province_key", how="left")
    panel = panel.merge(poverty[["merge_key", "poverty_rate", "poverty_year"]], on="merge_key", how="left")
    panel = panel.merge(stunting, on="merge_key", how="left")

    panel["sppg_operational_count"] = panel["sppg_operational_count"].fillna(0).astype(int)
    panel["mbg_beneficiaries"] = panel["mbg_beneficiaries"].fillna(0).astype(int)
    panel["mbg_satpen"] = panel["mbg_satpen"].fillna(0).astype(int)
    panel["education_exposure"] = panel["mbg_beneficiaries"]
    panel["beneficiaries_per_satpen"] = panel["mbg_beneficiaries"] / panel["mbg_satpen"].replace(0, np.nan)
    panel["beneficiaries_per_satpen"] = panel["beneficiaries_per_satpen"].replace([np.inf, -np.inf], np.nan).fillna(0)
    panel["sppg_density_per_100k_beneficiaries"] = (
        panel["sppg_operational_count"] / panel["mbg_beneficiaries"].replace(0, np.nan) * 100000
    ).replace([np.inf, -np.inf], np.nan).fillna(0)

    panel["condition_rate_per_1000"] = panel["mbg_kondisi_khusus"] / panel["mbg_beneficiaries"].replace(0, np.nan) * 1000
    panel["allergy_intolerance_rate_per_1000"] = (
        (panel["mbg_alergi"] + panel["mbg_intoleransi"]) / panel["mbg_beneficiaries"].replace(0, np.nan) * 1000
    )
    panel["condition_rate_per_1000"] = panel["condition_rate_per_1000"].replace([np.inf, -np.inf], np.nan).fillna(0)
    panel["allergy_intolerance_rate_per_1000"] = panel["allergy_intolerance_rate_per_1000"].replace([np.inf, -np.inf], np.nan).fillna(0)

    panel["ikp"] = pd.to_numeric(panel["ikp"], errors="coerce")
    panel["food_vulnerability"] = 1 - minmax(panel["ikp"])
    panel["price_stress"] = pd.to_numeric(panel["price_stress"], errors="coerce").fillna(panel["price_stress"].median() if panel["price_stress"].notna().any() else 0.5)

    if panel["poverty_rate"].notna().any():
        panel["poverty_rate_filled"] = panel["poverty_rate"].fillna(panel["poverty_rate"].median())
        panel["socioeconomic_stress"] = minmax(panel["poverty_rate_filled"])
    else:
        panel["poverty_rate_filled"] = np.nan
        panel["socioeconomic_stress"] = 0.6 * panel["food_vulnerability"] + 0.4 * panel["price_stress"]

    has_stunting = panel["stunting_rate"].notna().any()
    base_nutrition = (
        0.45 * minmax(panel["condition_rate_per_1000"])
        + 0.25 * minmax(panel["allergy_intolerance_rate_per_1000"])
        + 0.30 * panel["food_vulnerability"]
    )
    if has_stunting:
        panel["nutrition_need"] = 0.55 * minmax(panel["stunting_rate"]) + 0.45 * base_nutrition
        panel["nutrition_need_source"] = "manual_stunting_plus_mbg_condition"
    else:
        panel["nutrition_need"] = base_nutrition
        panel["nutrition_need_source"] = "mbg_condition_plus_food_vulnerability_proxy"

    panel["support_reach"] = (
        0.40 * minmax(np.log1p(panel["mbg_beneficiaries"]))
        + 0.35 * minmax(np.log1p(panel["mbg_satpen"]))
        + 0.25 * minmax(np.log1p(panel["sppg_operational_count"]))
    )
    panel["need_pressure"] = (
        0.45 * panel["nutrition_need"]
        + 0.25 * panel["food_vulnerability"]
        + 0.20 * panel["socioeconomic_stress"]
        + 0.10 * panel["price_stress"]
    )
    panel["coverage_gap"] = minmax(panel["need_pressure"] - panel["support_reach"])
    panel["reference_priority_score"] = (
        0.35 * panel["nutrition_need"]
        + 0.25 * panel["coverage_gap"]
        + 0.20 * panel["food_vulnerability"]
        + 0.15 * panel["socioeconomic_stress"]
        + 0.05 * panel["price_stress"]
    )
    panel["priority_label"] = (panel["reference_priority_score"] >= panel["reference_priority_score"].quantile(0.80)).astype(int)
    panel["is_java"] = panel["province_key"].isin(JAVA_PROVINCES).astype(int)
    panel["is_eastern_indonesia"] = panel["province_key"].isin(EASTERN_PROVINCES).astype(int)
    panel["data_completeness"] = panel[["ikp", "price_stress", "poverty_rate", "stunting_rate"]].notna().mean(axis=1)
    panel["data_density_group"] = np.where(panel["data_completeness"] >= panel["data_completeness"].median(), "higher-data", "lower-data")

    wanted = [
        "region_code",
        "province",
        "district",
        "year_month",
        "mbg_beneficiaries",
        "mbg_satpen",
        "sppg_operational_count",
        "sppg_density_per_100k_beneficiaries",
        "nutrition_need",
        "nutrition_need_source",
        "poverty_rate",
        "poverty_rate_filled",
        "ikp",
        "ikp_group",
        "food_security_class",
        "food_vulnerability",
        "price_stress",
        "education_exposure",
        "condition_rate_per_1000",
        "allergy_intolerance_rate_per_1000",
        "beneficiaries_per_satpen",
        "support_reach",
        "need_pressure",
        "coverage_gap",
        "socioeconomic_stress",
        "reference_priority_score",
        "priority_label",
        "is_java",
        "is_eastern_indonesia",
        "data_density_group",
        "data_completeness",
    ]
    panel = panel[wanted].sort_values("reference_priority_score", ascending=False).reset_index(drop=True)

    unmatched = panel[panel["ikp"].isna()][["region_code", "province", "district"]].copy()
    return panel, unmatched


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the GiziRank district-level dataset from public official sources.")
    parser.add_argument("--sppg-pages", default="all", help="'all' or a positive page count for BGN SPPG scraping.")
    parser.add_argument("--sppg-workers", type=int, default=16, help="Concurrent workers for BGN SPPG page scraping.")
    parser.add_argument("--reuse-raw", action="store_true", help="Reuse raw CSV/JSON files if they already exist.")
    args = parser.parse_args()

    ensure_dirs()
    status: list[dict[str, Any]] = []
    max_pages = None if str(args.sppg_pages).lower() == "all" else int(args.sppg_pages)

    if args.reuse_raw and (DATA_RAW / "mbg_rekap_kabupaten.csv").exists():
        mbg = pd.read_csv(DATA_RAW / "mbg_rekap_kabupaten.csv")
        status.append(source_row("Dashboard MBG Kemendikdasmen", "reused", len(mbg), DATA_RAW / "mbg_rekap_kabupaten.csv", "Existing raw snapshot"))
    else:
        mbg = fetch_mbg_kabupaten(status)

    if args.reuse_raw and (DATA_RAW / "bgn_sppg_operasional_scrape.csv").exists():
        sppg = pd.read_csv(DATA_RAW / "bgn_sppg_operasional_scrape.csv")
        status.append(source_row("BGN SPPG Operasional", "reused", len(sppg), DATA_RAW / "bgn_sppg_operasional_scrape.csv", "Existing raw snapshot"))
    else:
        sppg = fetch_bgn_sppg(max_pages=max_pages, workers=args.sppg_workers, status=status)

    ikp = fetch_bapanas_ikp(status) if not (args.reuse_raw and (DATA_RAW / "bapanas_ikp_kab_kota_2024.csv").exists()) else fetch_bapanas_ikp(status)
    prices = fetch_bapanas_prices(status) if not (args.reuse_raw and (DATA_RAW / "bapanas_harga_pangan_konsumen_provinsi.csv").exists()) else fetch_bapanas_prices(status)
    poverty = fetch_bps_poverty(status)
    stunting = load_optional_stunting(status)

    panel, unmatched = build_panel(mbg, sppg, ikp, prices, poverty, stunting)
    out_path = DATA_PROCESSED / "district_panel.csv"
    panel.to_csv(out_path, index=False)
    unmatched.to_csv(TABLES / "unmatched_districts_for_manual_review.csv", index=False)

    dataset_summary = pd.DataFrame(
        [
            {"metric": "district_rows", "value": len(panel)},
            {"metric": "provinces", "value": panel["province"].nunique()},
            {"metric": "year_month", "value": panel["year_month"].mode().iloc[0]},
            {"metric": "mbg_beneficiaries", "value": int(panel["mbg_beneficiaries"].sum())},
            {"metric": "mbg_satpen", "value": int(panel["mbg_satpen"].sum())},
            {"metric": "sppg_rows_scraped", "value": int(len(sppg))},
            {"metric": "sppg_district_matches", "value": int((panel["sppg_operational_count"] > 0).sum())},
            {"metric": "ikp_missing_rows", "value": int(panel["ikp"].isna().sum())},
            {"metric": "poverty_missing_rows", "value": int(panel["poverty_rate"].isna().sum())},
            {"metric": "stunting_missing_rows", "value": int(panel["nutrition_need_source"].str.contains("proxy").sum())},
        ]
    )
    dataset_summary.to_csv(TABLES / "dataset_summary.csv", index=False)
    pd.DataFrame(status).to_csv(TABLES / "source_status.csv", index=False)
    print(f"Wrote {out_path} with {len(panel)} district rows")
    print(f"Wrote source status and manual-review tables to {TABLES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
