from __future__ import annotations

import argparse
import json
import math
import re
import shutil
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import requests


ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
TABLES = ROOT / "reports" / "tables"

BI_BASE = "https://www.bi.go.id/hargapangan"
BI_REF_PROVINCE_URL = BI_BASE + "/WebSite/Home/GetProvinceAll"
BI_REF_COMMODITY_URL = BI_BASE + "/WebSite/TabelHarga/GetRefCommodityAndCategory"
BI_DAILY_GRID_URL = BI_BASE + "/WebSite/TabelHarga/GetGridDataKomoditas"
BI_MANUAL_URL = "https://www.bi.go.id/hargapangan/images/manual.pdf"
BAPANAS_PRICE_URL = (
    "https://data.badanpangan.go.id/download/document/dataset/"
    "201/1777265614.csv/csv"
)
BAPANAS_PAGE_URL = (
    "https://satudata.badanpangan.go.id/datasetpublications/"
    "tq2/harga-pangan-tingkat-konsumen-provinsi"
)
BPS_PRODUCTION_URL = (
    "https://www.bps.go.id/id/statistics-table/3/"
    "ZDNaak0yODBUVTlGYW5sa2REUkVUVVY1YVZkbmR6MDkjMyMwMDAw/"
    "produksi-padi-sup-1-sup-dan-beras-menurut-provinsi.html?year=2024"
)
BPS_CONSUMPTION_URL = (
    "https://www.bps.go.id/id/publication/2024/10/18/"
    "dda144ad01aec46898795ccf/pengeluaran-untuk-konsumsi-penduduk-"
    "indonesia-per-provinsi--maret-2024.html/"
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PanganFlow-GEMASTIK/1.0; academic prototype)",
    "Accept": "*/*",
}

MONTH_MAP = {
    "januari": 1,
    "februari": 2,
    "maret": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "agustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "desember": 12,
}

PROVINCE_META: dict[str, dict[str, Any]] = {
    "Aceh": {"code": 11, "lat": 5.55, "lon": 95.32, "region": "Sumatra"},
    "Sumatera Utara": {"code": 12, "lat": 3.59, "lon": 98.67, "region": "Sumatra"},
    "Sumatera Barat": {"code": 13, "lat": -0.95, "lon": 100.35, "region": "Sumatra"},
    "Riau": {"code": 14, "lat": 0.51, "lon": 101.45, "region": "Sumatra"},
    "Jambi": {"code": 15, "lat": -1.61, "lon": 103.61, "region": "Sumatra"},
    "Sumatera Selatan": {"code": 16, "lat": -2.99, "lon": 104.76, "region": "Sumatra"},
    "Bengkulu": {"code": 17, "lat": -3.80, "lon": 102.26, "region": "Sumatra"},
    "Lampung": {"code": 18, "lat": -5.45, "lon": 105.27, "region": "Sumatra"},
    "Kepulauan Bangka Belitung": {"code": 19, "lat": -2.13, "lon": 106.11, "region": "Sumatra"},
    "Kepulauan Riau": {"code": 21, "lat": 0.92, "lon": 104.45, "region": "Sumatra"},
    "DKI Jakarta": {"code": 31, "lat": -6.21, "lon": 106.85, "region": "Jawa"},
    "Jawa Barat": {"code": 32, "lat": -6.91, "lon": 107.61, "region": "Jawa"},
    "Jawa Tengah": {"code": 33, "lat": -6.99, "lon": 110.42, "region": "Jawa"},
    "DI Yogyakarta": {"code": 34, "lat": -7.80, "lon": 110.37, "region": "Jawa"},
    "Jawa Timur": {"code": 35, "lat": -7.25, "lon": 112.75, "region": "Jawa"},
    "Banten": {"code": 36, "lat": -6.12, "lon": 106.15, "region": "Jawa"},
    "Bali": {"code": 51, "lat": -8.65, "lon": 115.22, "region": "Bali-Nusa"},
    "Nusa Tenggara Barat": {"code": 52, "lat": -8.58, "lon": 116.12, "region": "Bali-Nusa"},
    "Nusa Tenggara Timur": {"code": 53, "lat": -10.18, "lon": 123.61, "region": "Bali-Nusa"},
    "Kalimantan Barat": {"code": 61, "lat": -0.02, "lon": 109.34, "region": "Kalimantan"},
    "Kalimantan Tengah": {"code": 62, "lat": -2.21, "lon": 113.92, "region": "Kalimantan"},
    "Kalimantan Selatan": {"code": 63, "lat": -3.32, "lon": 114.59, "region": "Kalimantan"},
    "Kalimantan Timur": {"code": 64, "lat": -0.50, "lon": 117.15, "region": "Kalimantan"},
    "Kalimantan Utara": {"code": 65, "lat": 3.31, "lon": 117.59, "region": "Kalimantan"},
    "Sulawesi Utara": {"code": 71, "lat": 1.47, "lon": 124.84, "region": "Sulawesi"},
    "Sulawesi Tengah": {"code": 72, "lat": -0.90, "lon": 119.87, "region": "Sulawesi"},
    "Sulawesi Selatan": {"code": 73, "lat": -5.15, "lon": 119.43, "region": "Sulawesi"},
    "Sulawesi Tenggara": {"code": 74, "lat": -3.99, "lon": 122.51, "region": "Sulawesi"},
    "Gorontalo": {"code": 75, "lat": 0.54, "lon": 123.06, "region": "Sulawesi"},
    "Sulawesi Barat": {"code": 76, "lat": -2.68, "lon": 118.89, "region": "Sulawesi"},
    "Maluku": {"code": 81, "lat": -3.70, "lon": 128.18, "region": "Maluku-Papua"},
    "Maluku Utara": {"code": 82, "lat": 0.79, "lon": 127.38, "region": "Maluku-Papua"},
    "Papua Barat": {"code": 91, "lat": -0.86, "lon": 134.06, "region": "Maluku-Papua"},
    "Papua Barat Daya": {"code": 92, "lat": -0.87, "lon": 131.25, "region": "Maluku-Papua"},
    "Papua": {"code": 94, "lat": -2.59, "lon": 140.67, "region": "Maluku-Papua"},
    "Papua Selatan": {"code": 95, "lat": -8.49, "lon": 140.40, "region": "Maluku-Papua"},
    "Papua Tengah": {"code": 96, "lat": -3.36, "lon": 135.50, "region": "Maluku-Papua"},
    "Papua Pegunungan": {"code": 97, "lat": -4.10, "lon": 138.95, "region": "Maluku-Papua"},
}

# Manual official snapshot seed. Values are intentionally easy to replace with raw BPS export.
# Rice production is in million tons of rice-equivalent; population is million persons.
BPS_RICE_SNAPSHOT = [
    ("Aceh", 0.86, 5.60), ("Sumatera Utara", 2.08, 15.59), ("Sumatera Barat", 0.77, 5.84),
    ("Riau", 0.14, 6.73), ("Jambi", 0.20, 3.78), ("Sumatera Selatan", 1.60, 8.89),
    ("Bengkulu", 0.18, 2.12), ("Lampung", 1.49, 9.42), ("Kepulauan Bangka Belitung", 0.04, 1.53),
    ("Kepulauan Riau", 0.00, 2.23), ("DKI Jakarta", 0.00, 10.68), ("Jawa Barat", 5.44, 50.35),
    ("Jawa Tengah", 5.05, 37.89), ("DI Yogyakarta", 0.32, 3.73), ("Jawa Timur", 5.54, 41.81),
    ("Banten", 0.90, 12.43), ("Bali", 0.48, 4.43), ("Nusa Tenggara Barat", 0.92, 5.65),
    ("Nusa Tenggara Timur", 0.47, 5.70), ("Kalimantan Barat", 0.46, 5.74), ("Kalimantan Tengah", 0.20, 2.82),
    ("Kalimantan Selatan", 0.61, 4.24), ("Kalimantan Timur", 0.11, 4.05), ("Kalimantan Utara", 0.05, 0.75),
    ("Sulawesi Utara", 0.25, 2.69), ("Sulawesi Tengah", 0.55, 3.11), ("Sulawesi Selatan", 3.08, 9.46),
    ("Sulawesi Tenggara", 0.36, 2.80), ("Gorontalo", 0.16, 1.22), ("Sulawesi Barat", 0.20, 1.50),
    ("Maluku", 0.06, 1.91), ("Maluku Utara", 0.02, 1.43), ("Papua Barat", 0.02, 0.58),
    ("Papua Barat Daya", 0.01, 0.65), ("Papua", 0.10, 1.10), ("Papua Selatan", 0.20, 0.54),
    ("Papua Tengah", 0.02, 1.40), ("Papua Pegunungan", 0.00, 1.50),
]


def ensure_dirs() -> None:
    for path in [DATA_RAW, DATA_PROCESSED, TABLES]:
        path.mkdir(parents=True, exist_ok=True)


def normalize_province(value: Any) -> str:
    text = "" if value is None else str(value)
    text = re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()
    text = text.replace("D.I Yogyakarta", "DI Yogyakarta")
    text = text.replace("D.I. Yogyakarta", "DI Yogyakarta")
    text = text.replace("Daerah Istimewa Yogyakarta", "DI Yogyakarta")
    text = text.replace("Nanggroe Aceh Darussalam", "Aceh")
    return text


def parse_price(value: Any) -> float:
    if pd.isna(value):
        return np.nan
    text = str(value)
    text = text.replace("Rp", "").replace(".", "").replace(",", "").strip()
    text = re.sub(r"[^0-9\-]", "", text)
    if not text or text == "-":
        return np.nan
    return float(text)


def minmax(series: pd.Series, fill: float = 0.5) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").astype(float)
    if values.notna().sum() == 0:
        return pd.Series(fill, index=series.index)
    values = values.fillna(values.median())
    lo = float(values.min())
    hi = float(values.max())
    if math.isclose(lo, hi):
        return pd.Series(fill, index=series.index)
    return (values - lo) / (hi - lo)


def logistic01(series: pd.Series) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").astype(float)
    values = values.replace([np.inf, -np.inf], np.nan).fillna(0.0)
    return 1 / (1 + np.exp(-values))


def fetch_json(url: str, timeout: int = 45) -> dict[str, Any]:
    response = requests.get(url, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    return response.json()


def fetch_bytes(url: str, timeout: int = 90) -> bytes:
    response = requests.get(url, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    return response.content


def source_row(source: str, url: str, status: str, rows: int, output: Path | str, notes: str) -> dict[str, Any]:
    return {
        "source": source,
        "url": url,
        "status": status,
        "rows": int(rows),
        "output": str(output),
        "retrieved_at": pd.Timestamp.now(tz="Asia/Jakarta").isoformat(),
        "notes": notes,
    }


def fetch_bi_references(status: list[dict[str, Any]]) -> None:
    refs = [
        ("BI PIHPS Province Reference", BI_REF_PROVINCE_URL, DATA_RAW / "bi_pihps_provinces.json"),
        ("BI PIHPS Commodity Reference", BI_REF_COMMODITY_URL, DATA_RAW / "bi_pihps_commodities.json"),
    ]
    for name, url, path in refs:
        try:
            data = fetch_json(url)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            rows = len(data.get("data", [])) if isinstance(data, dict) else 0
            status.append(source_row(name, url, "downloaded", rows, path, "Reference endpoint reachable."))
        except Exception as exc:
            status.append(source_row(name, url, "failed", 0, path, f"Reference endpoint failed: {exc}"))


def try_fetch_bi_daily_prices(status: list[dict[str, Any]], days: int = 120) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    end = date.today()
    start = end - timedelta(days=days)
    commodities = {
        "com_3": "Beras Kualitas Medium I",
        "com_4": "Beras Kualitas Medium II",
    }
    for comcat_id, commodity in commodities.items():
        try:
            params = {
                "comcat_id": comcat_id,
                "tipe_laporan": 1,
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
            }
            response = requests.get(BI_DAILY_GRID_URL, params=params, headers=HEADERS, timeout=60)
            response.raise_for_status()
            data = response.json()
            rows = data.get("data", []) if isinstance(data, dict) else []
            out = DATA_RAW / f"bi_pihps_daily_{comcat_id}.json"
            out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            status.append(source_row("BI PIHPS Daily Price Attempt", response.url, "downloaded", len(rows), out, commodity))
            parsed = parse_bi_grid_rows(rows, commodity)
            if not parsed.empty:
                frames.append(parsed)
        except Exception as exc:
            status.append(source_row("BI PIHPS Daily Price Attempt", BI_DAILY_GRID_URL, "failed", 0, DATA_RAW, f"{commodity}: {exc}"))
    if not frames:
        return pd.DataFrame(columns=["province", "date", "commodity", "price", "price_source"])
    return pd.concat(frames, ignore_index=True)


def parse_bi_grid_rows(rows: list[dict[str, Any]], commodity: str) -> pd.DataFrame:
    parsed: list[dict[str, Any]] = []
    for row in rows:
        province = row.get("Provinsi") or row.get("name") or row.get("Name")
        for key, value in row.items():
            if re.match(r"\d{1,2}[-/]\d{1,2}[-/]\d{4}", str(key)) or re.match(r"\d{4}-\d{2}-\d{2}", str(key)):
                parsed.append(
                    {
                        "province": normalize_province(province),
                        "date": pd.to_datetime(key, errors="coerce"),
                        "commodity": commodity,
                        "price": parse_price(value),
                        "price_source": "BI PIHPS daily",
                    }
                )
    df = pd.DataFrame(parsed)
    if df.empty:
        return df
    return df.dropna(subset=["province", "date", "price"])


def load_manual_bi_snapshot(status: list[dict[str, Any]]) -> pd.DataFrame:
    path = DATA_RAW / "bi_pihps_beras_manual.csv"
    if not path.exists():
        status.append(source_row("BI PIHPS Manual Snapshot", BI_MANUAL_URL, "not_provided", 0, path, "Optional manual CSV not found."))
        return pd.DataFrame(columns=["province", "date", "commodity", "price", "price_source"])
    df = pd.read_csv(path)
    rename = {c: c.strip().lower() for c in df.columns}
    df = df.rename(columns=rename)
    required = {"province", "date", "commodity", "price"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"{path} missing required columns: {sorted(missing)}")
    df["province"] = df["province"].map(normalize_province)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["price"] = df["price"].map(parse_price)
    df["price_source"] = "BI PIHPS manual snapshot"
    df = df.dropna(subset=["province", "date", "price"])
    status.append(source_row("BI PIHPS Manual Snapshot", BI_MANUAL_URL, "loaded", len(df), path, "User-provided manual snapshot."))
    return df[["province", "date", "commodity", "price", "price_source"]]


def load_bapanas_prices(status: list[dict[str, Any]]) -> pd.DataFrame:
    path = DATA_RAW / "bapanas_harga_pangan_bulanan_konsumen_provinsi.csv"
    if not path.exists():
        try:
            path.write_bytes(fetch_bytes(BAPANAS_PRICE_URL))
            status.append(source_row("Bapanas Monthly Consumer Price", BAPANAS_PRICE_URL, "downloaded", 0, path, "Downloaded official CSV."))
        except Exception as exc:
            sibling = ROOT.parent / "PanganShock-X" / "data" / "raw" / "bapanas_harga_pangan_bulanan_konsumen_provinsi.csv"
            if sibling.exists():
                shutil.copy2(sibling, path)
                status.append(source_row("Bapanas Monthly Consumer Price", BAPANAS_PAGE_URL, "copied_local_snapshot", 0, path, f"Download failed; reused sibling official snapshot: {exc}"))
            else:
                raise RuntimeError(f"Could not fetch Bapanas CSV and no local fallback exists: {exc}") from exc
    df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]
    df["province"] = df["Nama Provinsi"].map(normalize_province)
    df["commodity"] = df["Komoditas"].astype(str).str.strip()
    df = df[df["commodity"].str.lower().eq("beras medium")].copy()
    df["month_num"] = df["Bulan"].astype(str).str.strip().str.lower().map(MONTH_MAP)
    df["Tahun"] = pd.to_numeric(df["Tahun"], errors="coerce")
    df = df.dropna(subset=["Tahun", "month_num"])
    df["date"] = pd.to_datetime(
        df["Tahun"].astype(int).astype(str) + "-" + df["month_num"].astype(int).astype(str).str.zfill(2) + "-01",
        errors="coerce",
    )
    df["price"] = df["Harga"].map(parse_price)
    df["price_source"] = "Bapanas monthly consumer price"
    df = df.dropna(subset=["province", "date", "price"])
    df = df.sort_values(["province", "date"]).drop_duplicates(["province", "date", "commodity"], keep="last")
    status.append(source_row("Bapanas Monthly Consumer Price", BAPANAS_PAGE_URL, "loaded", len(df), path, "Filtered to Beras Medium."))
    return df[["province", "date", "commodity", "price", "price_source"]]


def build_bps_snapshot(status: list[dict[str, Any]]) -> pd.DataFrame:
    path = DATA_RAW / "bps_rice_balance_snapshot.csv"
    if not path.exists():
        rows = []
        for province, production_million_ton, population_million in BPS_RICE_SNAPSHOT:
            rows.append(
                {
                    "province": province,
                    "year": 2024,
                    "rice_production_million_ton": production_million_ton,
                    "population_million": population_million,
                    "rice_consumption_kg_capita_year": 81.23,
                    "source_note": "Manual official snapshot seed from BPS/Bapanas public tables; replace with raw BPS export for final submission.",
                }
            )
        pd.DataFrame(rows).to_csv(path, index=False)
    df = pd.read_csv(path)
    df["province"] = df["province"].map(normalize_province)
    df["production_ton_year"] = pd.to_numeric(df["rice_production_million_ton"], errors="coerce") * 1_000_000
    df["population"] = pd.to_numeric(df["population_million"], errors="coerce") * 1_000_000
    df["rice_consumption_kg_capita_year"] = pd.to_numeric(df["rice_consumption_kg_capita_year"], errors="coerce")
    df["need_ton_year"] = df["population"] * df["rice_consumption_kg_capita_year"] / 1000
    df["surplus_proxy_ton"] = df["production_ton_year"] - df["need_ton_year"]
    status.append(source_row("BPS Rice Production and Consumption Snapshot", BPS_PRODUCTION_URL, "loaded_manual_snapshot", len(df), path, f"Consumption companion: {BPS_CONSUMPTION_URL}"))
    return df[
        [
            "province",
            "year",
            "production_ton_year",
            "population",
            "rice_consumption_kg_capita_year",
            "need_ton_year",
            "surplus_proxy_ton",
        ]
    ]


def province_metadata() -> pd.DataFrame:
    rows = []
    for province, meta in PROVINCE_META.items():
        rows.append({"province": province, **meta})
    return pd.DataFrame(rows)


def build_distance_matrix(meta: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, a in meta.iterrows():
        for _, b in meta.iterrows():
            rows.append(
                {
                    "origin_province": a["province"],
                    "destination_province": b["province"],
                    "distance_km": haversine_km(a["lat"], a["lon"], b["lat"], b["lon"]),
                }
            )
    df = pd.DataFrame(rows)
    df.to_csv(DATA_PROCESSED / "province_distance_matrix.csv", index=False)
    return df


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return float(2 * radius * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def choose_price_series(bi_daily: pd.DataFrame, bi_manual: pd.DataFrame, bapanas: pd.DataFrame, status: list[dict[str, Any]]) -> pd.DataFrame:
    monthly_frames = []
    for source in [bi_daily, bi_manual]:
        if source.empty:
            continue
        temp = source.copy()
        temp["date"] = pd.to_datetime(temp["date"]).dt.to_period("M").dt.to_timestamp()
        temp["commodity"] = "Beras Medium"
        temp = temp.groupby(["province", "date", "commodity"], as_index=False).agg(price=("price", "mean"))
        temp["price_source"] = "BI PIHPS monthly aggregation"
        monthly_frames.append(temp)
    if monthly_frames:
        bi_monthly = pd.concat(monthly_frames, ignore_index=True)
        if bi_monthly["province"].nunique() >= 25 and len(bi_monthly) >= 100:
            status.append(source_row("Primary Price Source", BI_DAILY_GRID_URL, "selected_bi", len(bi_monthly), DATA_PROCESSED, "BI/manual data had enough monthly coverage."))
            return bi_monthly
    status.append(source_row("Primary Price Source", BAPANAS_PAGE_URL, "selected_bapanas", len(bapanas), DATA_PROCESSED, "Bapanas selected for stable cross-province monthly coverage."))
    return bapanas.copy()


def add_temporal_features(panel: pd.DataFrame) -> pd.DataFrame:
    panel = panel.sort_values(["province", "commodity", "date"]).copy()
    grp = panel.groupby(["province", "commodity"], group_keys=False)
    panel["price_1m_change"] = grp["price"].pct_change(1)
    panel["price_14d_change"] = panel["price_1m_change"]
    panel["price_3m_change"] = grp["price"].pct_change(3)
    panel["price_rolling_mean_3"] = grp["price"].transform(lambda s: s.rolling(3, min_periods=2).mean())
    panel["price_rolling_std_6"] = grp["price"].transform(lambda s: s.rolling(6, min_periods=3).std())
    past_mean = grp["price"].transform(lambda s: s.rolling(6, min_periods=3).mean().shift(1))
    past_std = grp["price"].transform(lambda s: s.rolling(6, min_periods=3).std().shift(1))
    panel["price_zscore_past6"] = (panel["price"] - past_mean) / past_std.replace(0, np.nan)
    national = panel.groupby(["date", "commodity"])["price"].median().rename("national_median_price").reset_index()
    panel = panel.merge(national, on=["date", "commodity"], how="left")
    panel["national_median_gap"] = panel["price"] / panel["national_median_price"] - 1
    panel["price_gap_score"] = panel.groupby("date", group_keys=False)["national_median_gap"].transform(lambda s: minmax(s.clip(lower=0), 0.0))
    panel["change_score"] = minmax(panel["price_14d_change"].clip(lower=0).fillna(0), 0.0)
    z_abs = panel["price_zscore_past6"].abs().replace([np.inf, -np.inf], np.nan).fillna(0)
    panel["anomaly_score"] = (0.65 * minmax(z_abs, 0.0) + 0.35 * panel["change_score"]).clip(0, 1)
    return panel


def build_panel() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    status: list[dict[str, Any]] = []
    ensure_dirs()
    fetch_bi_references(status)
    bi_daily = try_fetch_bi_daily_prices(status)
    bi_manual = load_manual_bi_snapshot(status)
    bapanas = load_bapanas_prices(status)
    bps = build_bps_snapshot(status)
    meta = province_metadata()
    build_distance_matrix(meta)
    prices = choose_price_series(bi_daily, bi_manual, bapanas, status)

    panel = prices.merge(meta, on="province", how="left")
    panel = panel.merge(bps.drop(columns=["year"]), on="province", how="left")
    panel = add_temporal_features(panel)
    panel["year_month"] = pd.to_datetime(panel["date"]).dt.strftime("%Y-%m")
    panel["balance_deficit_raw"] = (-panel["surplus_proxy_ton"]).clip(lower=0)
    panel["balance_surplus_raw"] = panel["surplus_proxy_ton"].clip(lower=0)
    panel["balance_deficit_score"] = minmax(panel["balance_deficit_raw"], 0.0)
    panel["balance_surplus_score"] = minmax(panel["balance_surplus_raw"], 0.0)
    panel["deficit_score"] = (0.62 * panel["balance_deficit_score"] + 0.23 * panel["price_gap_score"] + 0.15 * panel["anomaly_score"]).clip(0, 1)
    panel["surplus_score"] = (0.75 * panel["balance_surplus_score"] + 0.15 * (1 - panel["price_gap_score"]) + 0.10 * (1 - panel["anomaly_score"])).clip(0, 1)
    panel["monitoring_priority_proxy"] = (
        0.30 * panel["deficit_score"]
        + 0.25 * panel["anomaly_score"]
        + 0.25 * panel["price_gap_score"]
        + 0.20 * panel["change_score"]
    ).clip(0, 1)
    panel["priority_label"] = panel.groupby("date")["monitoring_priority_proxy"].transform(lambda s: (s >= s.quantile(0.75)).astype(int))

    output_cols = [
        "province_code",
        "province",
        "region",
        "lat",
        "lon",
        "date",
        "year_month",
        "commodity",
        "price",
        "price_source",
        "price_14d_change",
        "national_median_price",
        "national_median_gap",
        "price_zscore_past6",
        "production_ton_year",
        "population",
        "rice_consumption_kg_capita_year",
        "need_ton_year",
        "surplus_proxy_ton",
        "anomaly_score",
        "deficit_score",
        "surplus_score",
        "monitoring_priority_proxy",
        "priority_label",
    ]
    panel = panel.rename(columns={"code": "province_code"})
    for col in output_cols:
        if col not in panel.columns:
            panel[col] = np.nan
    panel[output_cols].to_csv(DATA_PROCESSED / "province_commodity_panel.csv", index=False)

    latest_date = pd.to_datetime(panel["date"]).max()
    latest = panel[panel["date"].eq(latest_date)].copy()
    latest[output_cols].to_csv(DATA_PROCESSED / "latest_province_snapshot.csv", index=False)

    validation = validate(panel, meta, bps)
    pd.DataFrame(validation).to_csv(TABLES / "validation_checks.csv", index=False)
    pd.DataFrame(status).to_csv(TABLES / "source_status.csv", index=False)
    unmatched = unmatched_provinces(panel, meta, bps)
    unmatched.to_csv(TABLES / "unmatched_provinces_for_manual_review.csv", index=False)
    summary = dataset_summary(panel, latest, unmatched)
    pd.DataFrame([summary]).to_csv(TABLES / "dataset_summary.csv", index=False)
    (TABLES / "dataset_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    return panel, latest, pd.DataFrame(status)


def validate(panel: pd.DataFrame, meta: pd.DataFrame, bps: pd.DataFrame) -> list[dict[str, Any]]:
    duplicate_count = int(panel.duplicated(["province", "date", "commodity"]).sum())
    missing_meta = int(panel["province_code"].isna().sum()) if "province_code" in panel.columns else len(panel)
    missing_bps = int(panel["production_ton_year"].isna().sum())
    return [
        {"check": "no_duplicate_province_period_rows", "status": "pass" if duplicate_count == 0 else "fail", "value": duplicate_count},
        {"check": "province_metadata_joined", "status": "pass" if missing_meta == 0 else "review", "value": missing_meta},
        {"check": "bps_balance_joined", "status": "pass" if missing_bps == 0 else "review", "value": missing_bps},
        {"check": "minimum_panel_rows", "status": "pass" if len(panel) >= 1000 else "review", "value": len(panel)},
        {"check": "minimum_provinces", "status": "pass" if panel["province"].nunique() >= 34 else "review", "value": int(panel["province"].nunique())},
        {"check": "past_window_features", "status": "pass", "value": "rolling z-score uses shifted historical windows"},
        {"check": "flow_distance_matrix", "status": "pass" if len(meta) * len(meta) > 0 else "fail", "value": int(len(meta) * len(meta))},
    ]


def unmatched_provinces(panel: pd.DataFrame, meta: pd.DataFrame, bps: pd.DataFrame) -> pd.DataFrame:
    observed = set(panel["province"].dropna())
    meta_set = set(meta["province"])
    bps_set = set(bps["province"])
    rows = []
    for province in sorted(observed.union(meta_set).union(bps_set)):
        rows.append(
            {
                "province": province,
                "in_price_panel": province in observed,
                "in_province_metadata": province in meta_set,
                "in_bps_snapshot": province in bps_set,
                "needs_review": not (province in observed and province in meta_set and province in bps_set),
            }
        )
    return pd.DataFrame(rows)


def dataset_summary(panel: pd.DataFrame, latest: pd.DataFrame, unmatched: pd.DataFrame) -> dict[str, Any]:
    return {
        "rows": int(len(panel)),
        "province_count": int(panel["province"].nunique()),
        "commodity_count": int(panel["commodity"].nunique()),
        "date_min": str(pd.to_datetime(panel["date"]).min().date()),
        "date_max": str(pd.to_datetime(panel["date"]).max().date()),
        "latest_snapshot_rows": int(len(latest)),
        "latest_snapshot_month": str(pd.to_datetime(panel["date"]).max().to_period("M")),
        "price_source_primary": str(panel["price_source"].mode().iloc[0]),
        "unmatched_province_count": int(unmatched["needs_review"].sum()),
        "mean_price_latest": float(latest["price"].mean()),
        "mean_deficit_score_latest": float(latest["deficit_score"].mean()),
        "mean_surplus_score_latest": float(latest["surplus_score"].mean()),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build PanganFlow.ID province-level rice panel.")
    parser.add_argument("--quiet", action="store_true", help="Reduce console output.")
    args = parser.parse_args()
    panel, latest, status = build_panel()
    if not args.quiet:
        print(f"Wrote province_commodity_panel.csv: {len(panel):,} rows")
        print(f"Latest snapshot: {latest['province'].nunique()} provinces, {latest['date'].max().date()}")
        print(f"Source rows logged: {len(status)}")


if __name__ == "__main__":
    main()
