from __future__ import annotations

import json
import math
import re
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests
from matplotlib.ticker import FuncFormatter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_INTERIM = ROOT / "data" / "interim"
DATA_PROCESSED = ROOT / "data" / "processed"
TABLES = ROOT / "outputs" / "tables"
FIGURES = ROOT / "outputs" / "figures"
REPORTS = ROOT / "reports"

BAPANAS_PROVINCIAL_CSV = (
    "https://data.badanpangan.go.id/download/document/dataset/"
    "201/1777265614.csv/csv"
)

SEED = 42
MAIN_THRESHOLD = 0.05
MAIN_HORIZON = 2


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


PROVINCE_COORDS = {
    "Aceh": (5.55, 95.32),
    "Sumatera Utara": (3.59, 98.67),
    "Sumatera Barat": (-0.95, 100.35),
    "Riau": (0.51, 101.45),
    "Jambi": (-1.61, 103.61),
    "Sumatera Selatan": (-2.99, 104.76),
    "Bengkulu": (-3.80, 102.26),
    "Lampung": (-5.45, 105.27),
    "Kepulauan Bangka Belitung": (-2.13, 106.11),
    "Kepulauan Riau": (0.92, 104.45),
    "DKI Jakarta": (-6.21, 106.85),
    "Jawa Barat": (-6.91, 107.61),
    "Jawa Tengah": (-6.99, 110.42),
    "DI Yogyakarta": (-7.80, 110.37),
    "Jawa Timur": (-7.25, 112.75),
    "Banten": (-6.12, 106.15),
    "Bali": (-8.65, 115.22),
    "Nusa Tenggara Barat": (-8.58, 116.12),
    "Nusa Tenggara Timur": (-10.18, 123.61),
    "Kalimantan Barat": (-0.02, 109.34),
    "Kalimantan Tengah": (-2.21, 113.92),
    "Kalimantan Selatan": (-3.32, 114.59),
    "Kalimantan Timur": (-0.50, 117.15),
    "Kalimantan Utara": (3.31, 117.59),
    "Sulawesi Utara": (1.47, 124.84),
    "Sulawesi Tengah": (-0.90, 119.87),
    "Sulawesi Selatan": (-5.15, 119.43),
    "Sulawesi Tenggara": (-3.99, 122.51),
    "Gorontalo": (0.54, 123.06),
    "Sulawesi Barat": (-2.68, 118.89),
    "Maluku": (-3.70, 128.18),
    "Maluku Utara": (0.79, 127.38),
    "Papua": (-2.59, 140.67),
    "Papua Barat": (-0.86, 134.06),
    "Papua Selatan": (-8.49, 140.40),
    "Papua Tengah": (-3.36, 135.50),
    "Papua Pegunungan": (-4.10, 138.95),
    "Papua Barat Daya": (-0.87, 131.25),
}


STRATEGIC_COMMODITIES = [
    "Beras Premium",
    "Beras Medium",
    "Bawang Merah",
    "Bawang Putih (Bonggol)",
    "Cabai Merah Keriting",
    "Cabai Rawit Merah",
    "Daging Sapi Murni",
    "Daging Ayam Ras",
    "Telur Ayam Ras",
    "Gula Pasir Lokal/Curah",
    "Minyak Goreng Kemasan",
    "Minyak Goreng Curah",
]


def ensure_dirs() -> None:
    for path in [DATA_RAW, DATA_INTERIM, DATA_PROCESSED, TABLES, FIGURES, REPORTS]:
        path.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def download_file(url: str, path: Path) -> None:
    if path.exists() and path.stat().st_size > 0:
        return
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    path.write_bytes(response.content)


def parse_price(value: object) -> float:
    if pd.isna(value):
        return np.nan
    text = str(value)
    text = text.replace("Rp", "").replace(".", "").replace(",", "").strip()
    if not text:
        return np.nan
    try:
        return float(text)
    except ValueError:
        return np.nan


def normalize_province(value: object) -> str:
    text = str(value).strip()
    replacements = {
        "D.I Yogyakarta": "DI Yogyakarta",
        "D.I. Yogyakarta": "DI Yogyakarta",
        "Daerah Istimewa Yogyakarta": "DI Yogyakarta",
    }
    return replacements.get(text, text)


def load_price_data() -> pd.DataFrame:
    raw_path = DATA_RAW / "bapanas_harga_pangan_bulanan_konsumen_provinsi.csv"
    download_file(BAPANAS_PROVINCIAL_CSV, raw_path)
    df = pd.read_csv(raw_path)
    df.columns = [c.strip() for c in df.columns]
    df["province_code"] = df["Kode Provinsi"].astype(str).str.strip()
    df["province"] = df["Nama Provinsi"].map(normalize_province)
    df["commodity"] = df["Komoditas"].astype(str).str.strip()
    df["year"] = df["Tahun"].astype(int)
    df["month_name"] = df["Bulan"].astype(str).str.strip().str.lower()
    df["month"] = df["month_name"].map(MONTH_MAP)
    df["price"] = df["Harga"].map(parse_price)
    df = df.dropna(subset=["month"])
    df["month"] = df["month"].astype(int)
    df["date"] = pd.to_datetime(
        {"year": df["year"], "month": df["month"], "day": 1}
    )
    df = df[
        [
            "date",
            "year",
            "month",
            "province_code",
            "province",
            "commodity",
            "price",
        ]
    ].sort_values(["province", "commodity", "date"])
    df = (
        df.groupby(
            ["date", "year", "month", "province_code", "province", "commodity"],
            as_index=False,
            dropna=False,
        )["price"]
        .mean()
        .sort_values(["province", "commodity", "date"])
    )
    df.to_csv(DATA_INTERIM / "prices_clean_monthly.csv", index=False)
    return df


def fetch_weather_for_province(
    province: str, lat: float, lon: float, start: str, end: str
) -> pd.DataFrame:
    cache = DATA_RAW / f"openmeteo_daily_{slugify(province)}.json"
    if cache.exists():
        payload = json.loads(cache.read_text(encoding="utf-8"))
    else:
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start,
            "end_date": end,
            "daily": ",".join(
                [
                    "temperature_2m_mean",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum",
                ]
            ),
            "timezone": "Asia/Jakarta",
        }
        response = requests.get(url, params=params, timeout=60)
        response.raise_for_status()
        payload = response.json()
        cache.write_text(json.dumps(payload), encoding="utf-8")

    daily = payload.get("daily", {})
    if not daily:
        return pd.DataFrame()
    out = pd.DataFrame(daily)
    out["province"] = province
    out["date"] = pd.to_datetime(out["time"])
    return out.drop(columns=["time"])


def load_weather_data(price_df: pd.DataFrame) -> pd.DataFrame:
    weather_path = DATA_INTERIM / "openmeteo_weather_monthly.csv"
    if weather_path.exists():
        return pd.read_csv(weather_path, parse_dates=["date"])

    provinces = sorted(price_df["province"].dropna().unique())
    start = price_df["date"].min().strftime("%Y-%m-%d")
    end = (price_df["date"].max() + pd.offsets.MonthEnd(0)).strftime("%Y-%m-%d")
    frames: list[pd.DataFrame] = []

    for province in provinces:
        coords = PROVINCE_COORDS.get(province)
        if not coords:
            continue
        try:
            frames.append(fetch_weather_for_province(province, coords[0], coords[1], start, end))
        except Exception as exc:
            print(f"Weather fetch failed for {province}: {exc}")

    if not frames:
        return pd.DataFrame(columns=["province", "date"])

    daily = pd.concat(frames, ignore_index=True)
    daily["date"] = daily["date"].dt.to_period("M").dt.to_timestamp()
    monthly = (
        daily.groupby(["province", "date"], as_index=False)
        .agg(
            temp_mean=("temperature_2m_mean", "mean"),
            temp_max_mean=("temperature_2m_max", "mean"),
            temp_min_mean=("temperature_2m_min", "mean"),
            precip_sum=("precipitation_sum", "sum"),
            rainy_days=("precipitation_sum", lambda s: float((s > 1.0).sum())),
        )
        .sort_values(["province", "date"])
    )
    monthly["precip_anomaly"] = monthly["precip_sum"] - monthly.groupby(
        ["province", monthly["date"].dt.month]
    )["precip_sum"].transform("mean")
    monthly.to_csv(weather_path, index=False)
    return monthly


def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["month_num"] = out["date"].dt.month
    out["year_num"] = out["date"].dt.year
    out["month_index"] = (
        (out["year_num"] - out["year_num"].min()) * 12 + out["month_num"]
    )
    out["month_sin"] = np.sin(2 * np.pi * out["month_num"] / 12)
    out["month_cos"] = np.cos(2 * np.pi * out["month_num"] / 12)
    eid_months = {
        2021: [4, 5],
        2022: [4, 5],
        2023: [3, 4],
        2024: [3, 4],
        2025: [3, 4],
    }
    out["is_ramadan_eid_window"] = [
        int(month in eid_months.get(year, []))
        for year, month in zip(out["year_num"], out["month_num"], strict=False)
    ]
    out["is_year_end_window"] = out["month_num"].isin([11, 12, 1]).astype(int)
    out["is_mid_year_window"] = out["month_num"].isin([6, 7]).astype(int)
    return out


def select_scope(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    df = df[df["commodity"].isin(STRATEGIC_COMMODITIES)].copy()
    coverage = (
        df.groupby("commodity")
        .agg(
            rows=("price", "size"),
            non_missing=("price", "count"),
            missing=("price", lambda s: int(s.isna().sum())),
            mean_price=("price", "mean"),
        )
        .reset_index()
    )
    coverage["coverage_rate"] = coverage["non_missing"] / coverage["rows"]
    keep = coverage.loc[coverage["coverage_rate"] >= 0.70, "commodity"].tolist()
    scoped = df[df["commodity"].isin(keep)].copy()
    coverage.to_csv(TABLES / "dataset_commodity_coverage.csv", index=False)
    return scoped, coverage


def build_panel(price_df: pd.DataFrame, weather_df: pd.DataFrame) -> pd.DataFrame:
    scoped, _ = select_scope(price_df)
    scoped = add_calendar_features(scoped)
    if not weather_df.empty:
        scoped = scoped.merge(weather_df, on=["province", "date"], how="left")

    scoped = scoped.sort_values(["province", "commodity", "date"])
    scoped["price_missing"] = scoped["price"].isna().astype(int)
    scoped["price_filled"] = (
        scoped.groupby(["province", "commodity"])["price"]
        .transform(lambda s: s.ffill(limit=2).bfill(limit=1))
    )
    scoped = scoped.dropna(subset=["price_filled"]).copy()

    g = scoped.groupby(["province", "commodity"], group_keys=False)
    for lag in [1, 2, 3, 6, 12]:
        scoped[f"price_lag_{lag}"] = g["price_filled"].shift(lag)
        scoped[f"return_lag_{lag}"] = (
            scoped["price_filled"] / scoped[f"price_lag_{lag}"] - 1
        )
    for window in [3, 6, 12]:
        scoped[f"rolling_mean_{window}"] = g["price_filled"].transform(
            lambda s, w=window: s.rolling(w, min_periods=2).mean()
        )
        scoped[f"rolling_std_{window}"] = g["price_filled"].transform(
            lambda s, w=window: s.rolling(w, min_periods=2).std()
        )
        scoped[f"rolling_min_{window}"] = g["price_filled"].transform(
            lambda s, w=window: s.rolling(w, min_periods=2).min()
        )
        scoped[f"rolling_max_{window}"] = g["price_filled"].transform(
            lambda s, w=window: s.rolling(w, min_periods=2).max()
        )

    scoped["momentum_3"] = scoped["price_filled"] / scoped["rolling_mean_3"] - 1
    scoped["momentum_6"] = scoped["price_filled"] / scoped["rolling_mean_6"] - 1
    scoped["volatility_ratio_3_12"] = scoped["rolling_std_3"] / scoped[
        "rolling_std_12"
    ]

    scoped["commodity_month_mean"] = scoped.groupby(["commodity", "date"])[
        "price_filled"
    ].transform("mean")
    scoped["gap_to_national_commodity_mean"] = (
        scoped["price_filled"] / scoped["commodity_month_mean"] - 1
    )
    scoped["province_month_mean"] = scoped.groupby(["province", "date"])[
        "price_filled"
    ].transform("mean")
    scoped["price_rank_in_commodity_month"] = scoped.groupby(["commodity", "date"])[
        "price_filled"
    ].rank(pct=True)

    scoped["commodity_slug"] = scoped["commodity"].map(slugify)
    scoped["province_slug"] = scoped["province"].map(slugify)
    scoped = pd.get_dummies(
        scoped,
        columns=["commodity_slug", "province_slug"],
        prefix=["commodity", "province"],
        dtype=int,
    )

    for horizon in [1, 2]:
        future_prices = [
            g["price_filled"].shift(-step).rename(f"future_price_{step}")
            for step in range(1, horizon + 1)
        ]
        future = pd.concat(future_prices, axis=1)
        scoped[f"target_price_h{horizon}"] = future[f"future_price_{horizon}"]
        scoped[f"target_return_h{horizon}"] = (
            scoped[f"target_price_h{horizon}"] / scoped["price_filled"] - 1
        )
        scoped[f"future_max_return_h{horizon}"] = (
            future.max(axis=1) / scoped["price_filled"] - 1
        )
        for threshold in [0.05, 0.08, 0.10]:
            col = f"spike_h{horizon}_t{int(threshold * 100)}"
            scoped[col] = (scoped[f"future_max_return_h{horizon}"] >= threshold).astype(
                int
            )

    panel_path = DATA_PROCESSED / "panganshock_monthly_panel.csv"
    scoped.to_csv(panel_path, index=False)
    return scoped


def feature_columns(panel: pd.DataFrame) -> dict[str, list[str]]:
    price_features = [
        "price_filled",
        "price_missing",
        "price_lag_1",
        "price_lag_2",
        "price_lag_3",
        "price_lag_6",
        "price_lag_12",
        "return_lag_1",
        "return_lag_2",
        "return_lag_3",
        "return_lag_6",
        "return_lag_12",
        "rolling_mean_3",
        "rolling_mean_6",
        "rolling_mean_12",
        "rolling_std_3",
        "rolling_std_6",
        "rolling_std_12",
        "rolling_min_3",
        "rolling_max_3",
        "rolling_min_6",
        "rolling_max_6",
        "momentum_3",
        "momentum_6",
        "volatility_ratio_3_12",
        "commodity_month_mean",
        "gap_to_national_commodity_mean",
        "province_month_mean",
        "price_rank_in_commodity_month",
    ]
    calendar_features = [
        "month_num",
        "year_num",
        "month_index",
        "month_sin",
        "month_cos",
        "is_ramadan_eid_window",
        "is_year_end_window",
        "is_mid_year_window",
    ]
    weather_features = [
        c
        for c in [
            "temp_mean",
            "temp_max_mean",
            "temp_min_mean",
            "precip_sum",
            "rainy_days",
            "precip_anomaly",
        ]
        if c in panel.columns
    ]
    encoded = [
        c
        for c in panel.columns
        if c.startswith("commodity_") or c.startswith("province_")
    ]
    all_features = price_features + calendar_features + weather_features + encoded
    return {
        "price_only": price_features + encoded,
        "price_calendar": price_features + calendar_features + encoded,
        "price_calendar_weather": (
            price_features + calendar_features + weather_features + encoded
        ),
        "all": all_features,
    }


def split_data(df: pd.DataFrame, horizon: int, threshold: float) -> pd.DataFrame:
    target_reg = f"target_return_h{horizon}"
    target_cls = f"spike_h{horizon}_t{int(threshold * 100)}"
    out = df.dropna(subset=[target_reg, target_cls, "price_lag_12"]).copy()
    out["split"] = "train"
    out.loc[(out["date"] >= "2024-01-01") & (out["date"] <= "2024-12-01"), "split"] = (
        "validation"
    )
    out.loc[out["date"] >= "2025-01-01", "split"] = "test"
    return out


def make_regressor(model_name: str):
    if model_name == "Ridge":
        return Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
                ("model", Ridge(alpha=1.0)),
            ]
        )
    if model_name == "RandomForest":
        return Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                (
                    "model",
                    RandomForestRegressor(
                        n_estimators=160,
                        min_samples_leaf=4,
                        random_state=SEED,
                        n_jobs=-1,
                    ),
                ),
            ]
        )
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                HistGradientBoostingRegressor(
                    max_iter=160,
                    learning_rate=0.06,
                    max_leaf_nodes=31,
                    l2_regularization=0.05,
                    random_state=SEED,
                ),
            ),
        ]
    )


def make_classifier(model_name: str):
    if model_name == "LogisticRegression":
        return Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
                (
                    "model",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        random_state=SEED,
                    ),
                ),
            ]
        )
    if model_name == "RandomForest":
        return Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                (
                    "model",
                    RandomForestClassifier(
                        n_estimators=220,
                        min_samples_leaf=4,
                        class_weight="balanced_subsample",
                        random_state=SEED,
                        n_jobs=-1,
                    ),
                ),
            ]
        )
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                HistGradientBoostingClassifier(
                    max_iter=180,
                    learning_rate=0.055,
                    max_leaf_nodes=31,
                    l2_regularization=0.05,
                    class_weight="balanced",
                    random_state=SEED,
                ),
            ),
        ]
    )


def recall_precision_at_top_k(y_true: np.ndarray, score: np.ndarray, k_pct: float) -> tuple[float, float]:
    if len(y_true) == 0:
        return np.nan, np.nan
    n_top = max(1, int(math.ceil(len(y_true) * k_pct)))
    idx = np.argsort(score)[::-1][:n_top]
    selected_true = y_true[idx]
    positives = y_true.sum()
    recall = float(selected_true.sum() / positives) if positives else np.nan
    precision = float(selected_true.mean()) if len(selected_true) else np.nan
    return recall, precision


def safe_roc_auc(y_true: np.ndarray, score: np.ndarray) -> float:
    if len(np.unique(y_true)) < 2:
        return np.nan
    return float(roc_auc_score(y_true, score))


def best_threshold(y_true: np.ndarray, score: np.ndarray) -> float:
    thresholds = np.linspace(0.05, 0.95, 91)
    best_f1 = -1.0
    best_t = 0.5
    for threshold in thresholds:
        pred = (score >= threshold).astype(int)
        f1 = f1_score(y_true, pred, zero_division=0)
        if f1 > best_f1:
            best_f1 = f1
            best_t = threshold
    return best_t


def classify_metrics(
    y_true: np.ndarray,
    score: np.ndarray,
    threshold: float,
    prefix: str = "",
) -> dict[str, float]:
    pred = (score >= threshold).astype(int)
    recall_top10, precision_top10 = recall_precision_at_top_k(y_true, score, 0.10)
    recall_top20, precision_top20 = recall_precision_at_top_k(y_true, score, 0.20)
    return {
        f"{prefix}pr_auc": float(average_precision_score(y_true, score)),
        f"{prefix}roc_auc": safe_roc_auc(y_true, score),
        f"{prefix}f1": float(f1_score(y_true, pred, zero_division=0)),
        f"{prefix}recall": float(recall_score(y_true, pred, zero_division=0)),
        f"{prefix}precision": float(precision_score(y_true, pred, zero_division=0)),
        f"{prefix}recall_top10": recall_top10,
        f"{prefix}precision_top10": precision_top10,
        f"{prefix}recall_top20": recall_top20,
        f"{prefix}precision_top20": precision_top20,
        f"{prefix}brier": float(brier_score_loss(y_true, score)),
    }


def regression_metrics(y_true_return: np.ndarray, pred_return: np.ndarray, base_price: np.ndarray) -> dict[str, float]:
    y_price = base_price * (1 + y_true_return)
    pred_price = base_price * (1 + pred_return)
    mae = mean_absolute_error(y_price, pred_price)
    rmse = math.sqrt(mean_squared_error(y_price, pred_price))
    wmape = float(np.sum(np.abs(y_price - pred_price)) / np.sum(np.abs(y_price)))
    return {"mae": float(mae), "rmse": float(rmse), "wmape": wmape}


def calibrate_scores(y_val: np.ndarray, p_val: np.ndarray, p_test: np.ndarray) -> np.ndarray:
    if len(np.unique(y_val)) < 2:
        return p_test
    calibrator = LogisticRegression(max_iter=1000)
    calibrator.fit(p_val.reshape(-1, 1), y_val)
    return calibrator.predict_proba(p_test.reshape(-1, 1))[:, 1]


def run_main_experiments(panel: pd.DataFrame) -> dict[str, pd.DataFrame]:
    features = feature_columns(panel)
    results: dict[str, pd.DataFrame] = {}
    model_rows = []
    regression_rows = []
    threshold_rows = []
    horizon_rows = []
    ablation_rows = []

    for horizon in [1, 2]:
        for threshold in [0.05, 0.08, 0.10]:
            data = split_data(panel, horizon, threshold)
            feats = [c for c in features["all"] if c in data.columns]
            train = data[data["split"] == "train"]
            val = data[data["split"] == "validation"]
            test = data[data["split"] == "test"]
            target_cls = f"spike_h{horizon}_t{int(threshold * 100)}"
            if train.empty or val.empty or test.empty:
                continue
            for name in ["LogisticRegression", "RandomForest", "HistGradientBoosting"]:
                clf = make_classifier(name)
                clf.fit(train[feats], train[target_cls])
                val_score = clf.predict_proba(val[feats])[:, 1]
                test_score = clf.predict_proba(test[feats])[:, 1]
                opt_t = best_threshold(val[target_cls].to_numpy(), val_score)
                test_score_cal = calibrate_scores(
                    val[target_cls].to_numpy(), val_score, test_score
                )
                row = {
                    "horizon_months": horizon,
                    "threshold": threshold,
                    "model": name,
                    "validation_threshold": opt_t,
                    "test_positive_rate": float(test[target_cls].mean()),
                    "n_test": int(len(test)),
                }
                row.update(
                    classify_metrics(test[target_cls].to_numpy(), test_score, opt_t)
                )
                cal_metrics = classify_metrics(
                    test[target_cls].to_numpy(), test_score_cal, opt_t, prefix="cal_"
                )
                row.update(cal_metrics)
                model_rows.append(row)

    model_results = pd.DataFrame(model_rows)
    model_results.to_csv(TABLES / "classification_model_results.csv", index=False)
    results["classification_model_results"] = model_results

    for horizon in [1, 2]:
        data = split_data(panel, horizon, MAIN_THRESHOLD)
        feats = [c for c in features["all"] if c in data.columns]
        train = data[data["split"] == "train"]
        test = data[data["split"] == "test"]
        target_reg = f"target_return_h{horizon}"
        if train.empty or test.empty:
            continue

        persistence_pred = np.zeros(len(test))
        regression_rows.append(
            {
                "horizon_months": horizon,
                "model": "Persistence",
                **regression_metrics(
                    test[target_reg].to_numpy(),
                    persistence_pred,
                    test["price_filled"].to_numpy(),
                ),
            }
        )
        ma_pred = test["rolling_mean_3"].to_numpy() / test["price_filled"].to_numpy() - 1
        regression_rows.append(
            {
                "horizon_months": horizon,
                "model": "MovingAverage3",
                **regression_metrics(
                    test[target_reg].to_numpy(),
                    ma_pred,
                    test["price_filled"].to_numpy(),
                ),
            }
        )
        for name in ["Ridge", "RandomForest", "HistGradientBoosting"]:
            reg = make_regressor(name)
            reg.fit(train[feats], train[target_reg])
            pred = reg.predict(test[feats])
            regression_rows.append(
                {
                    "horizon_months": horizon,
                    "model": name,
                    **regression_metrics(
                        test[target_reg].to_numpy(),
                        pred,
                        test["price_filled"].to_numpy(),
                    ),
                }
            )

    regression_results = pd.DataFrame(regression_rows)
    regression_results.to_csv(TABLES / "regression_model_results.csv", index=False)
    results["regression_model_results"] = regression_results

    for threshold in [0.05, 0.08, 0.10]:
        subset = model_results[
            (model_results["horizon_months"] == MAIN_HORIZON)
            & (model_results["threshold"] == threshold)
            & (model_results["model"] == "HistGradientBoosting")
        ]
        if subset.empty:
            continue
        row = subset.iloc[0].to_dict()
        threshold_rows.append(
            {
                "threshold": threshold,
                "test_positive_rate": row["test_positive_rate"],
                "pr_auc": row["pr_auc"],
                "recall_top10": row["recall_top10"],
                "precision_top10": row["precision_top10"],
                "brier": row["brier"],
            }
        )
    threshold_results = pd.DataFrame(threshold_rows)
    threshold_results.to_csv(TABLES / "threshold_comparison.csv", index=False)
    results["threshold_comparison"] = threshold_results

    for horizon in [1, 2]:
        subset = model_results[
            (model_results["horizon_months"] == horizon)
            & (model_results["threshold"] == MAIN_THRESHOLD)
            & (model_results["model"] == "HistGradientBoosting")
        ]
        reg_subset = regression_results[
            (regression_results["horizon_months"] == horizon)
            & (regression_results["model"] == "HistGradientBoosting")
        ]
        if subset.empty or reg_subset.empty:
            continue
        row = subset.iloc[0]
        rrow = reg_subset.iloc[0]
        horizon_rows.append(
            {
                "horizon_months": horizon,
                "pr_auc": row["pr_auc"],
                "recall_top10": row["recall_top10"],
                "brier": row["brier"],
                "mae": rrow["mae"],
                "wmape": rrow["wmape"],
            }
        )
    horizon_results = pd.DataFrame(horizon_rows)
    horizon_results.to_csv(TABLES / "horizon_comparison.csv", index=False)
    results["horizon_comparison"] = horizon_results

    data = split_data(panel, MAIN_HORIZON, MAIN_THRESHOLD)
    target_cls = f"spike_h{MAIN_HORIZON}_t{int(MAIN_THRESHOLD * 100)}"
    train = data[data["split"] == "train"]
    val = data[data["split"] == "validation"]
    test = data[data["split"] == "test"]
    for set_name, cols in features.items():
        feats = [c for c in cols if c in data.columns]
        clf = make_classifier("HistGradientBoosting")
        clf.fit(train[feats], train[target_cls])
        val_score = clf.predict_proba(val[feats])[:, 1]
        opt_t = best_threshold(val[target_cls].to_numpy(), val_score)
        score = clf.predict_proba(test[feats])[:, 1]
        row = {"feature_set": set_name}
        row.update(classify_metrics(test[target_cls].to_numpy(), score, opt_t))
        ablation_rows.append(row)
    ablation_results = pd.DataFrame(ablation_rows)
    ablation_results.to_csv(TABLES / "feature_ablation.csv", index=False)
    results["feature_ablation"] = ablation_results

    final_bundle = train_final_models(panel)
    results.update(final_bundle)
    return results


def train_final_models(panel: pd.DataFrame) -> dict[str, pd.DataFrame]:
    horizon = MAIN_HORIZON
    threshold = MAIN_THRESHOLD
    data = split_data(panel, horizon, threshold)
    feats = [c for c in feature_columns(panel)["all"] if c in data.columns]
    target_cls = f"spike_h{horizon}_t{int(threshold * 100)}"
    target_reg = f"target_return_h{horizon}"
    train = data[data["split"] == "train"]
    val = data[data["split"] == "validation"]
    test = data[data["split"] == "test"]
    trainval = data[data["split"].isin(["train", "validation"])]

    clf = make_classifier("HistGradientBoosting")
    clf.fit(train[feats], train[target_cls])
    val_score = clf.predict_proba(val[feats])[:, 1]
    opt_t = best_threshold(val[target_cls].to_numpy(), val_score)
    raw_test_score = clf.predict_proba(test[feats])[:, 1]
    cal_test_score = calibrate_scores(val[target_cls].to_numpy(), val_score, raw_test_score)

    reg = make_regressor("HistGradientBoosting")
    reg.fit(trainval[feats], trainval[target_reg])
    pred_return = reg.predict(test[feats])
    expected_increase = np.maximum(pred_return, 0)
    priority_score = cal_test_score * expected_increase

    alert_cols = [
        "date",
        "province",
        "commodity",
        "price_filled",
        target_cls,
        target_reg,
        "momentum_3",
        "momentum_6",
        "rolling_std_3",
        "rolling_std_12",
        "gap_to_national_commodity_mean",
        "price_rank_in_commodity_month",
        "is_ramadan_eid_window",
        "is_year_end_window",
        "precip_anomaly",
        "precip_sum",
    ]
    alert_cols = [c for c in alert_cols if c in test.columns]
    alerts = test[alert_cols].copy()
    alerts["spike_probability_raw"] = raw_test_score
    alerts["spike_probability_calibrated"] = cal_test_score
    alerts["predicted_return"] = pred_return
    alerts["forecast_price"] = alerts["price_filled"] * (1 + pred_return)
    alerts["expected_increase_pct"] = expected_increase * 100
    alerts["priority_score"] = priority_score
    q80 = alerts["priority_score"].quantile(0.80)
    q60 = alerts["priority_score"].quantile(0.60)
    q40 = alerts["priority_score"].quantile(0.40)
    alerts["priority_level"] = np.select(
        [
            alerts["priority_score"] >= q80,
            alerts["priority_score"] >= q60,
            alerts["priority_score"] >= q40,
        ],
        ["Critical", "High", "Medium"],
        default="Low",
    )
    alerts = alerts.sort_values("priority_score", ascending=False)
    alerts = pd.concat([alerts, alert_driver_columns(alerts)], axis=1)
    alerts["rank"] = np.arange(1, len(alerts) + 1)

    latest_alerts = alerts[alerts["date"] == alerts["date"].max()].copy()
    if latest_alerts.empty:
        latest_alerts = alerts.head(50).copy()
    latest_alerts = latest_alerts.sort_values("priority_score", ascending=False)
    latest_alerts["rank"] = np.arange(1, len(latest_alerts) + 1)
    latest_alerts.to_csv(TABLES / "latest_alert_ranking.csv", index=False)
    alerts.to_csv(TABLES / "test_alert_ranking_all.csv", index=False)

    rf = make_classifier("RandomForest")
    rf.fit(trainval[feats], trainval[target_cls])
    model = rf.named_steps["model"]
    importances = pd.DataFrame(
        {"feature": feats, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)
    importances.to_csv(TABLES / "feature_importance.csv", index=False)

    try:
        perm = permutation_importance(
            clf,
            test[feats],
            test[target_cls],
            n_repeats=5,
            random_state=SEED,
            scoring="average_precision",
            n_jobs=-1,
        )
        perm_df = pd.DataFrame(
            {
                "feature": feats,
                "importance_mean": perm.importances_mean,
                "importance_std": perm.importances_std,
            }
        ).sort_values("importance_mean", ascending=False)
        perm_df.to_csv(TABLES / "permutation_importance.csv", index=False)
    except Exception:
        perm_df = importances.rename(columns={"importance": "importance_mean"})

    pr_curve = pd.DataFrame(
        {
            "precision": precision_recall_curve(test[target_cls], raw_test_score)[0],
            "recall": precision_recall_curve(test[target_cls], raw_test_score)[1],
        }
    )
    pr_curve.to_csv(TABLES / "precision_recall_curve.csv", index=False)

    calibration = calibration_table(test[target_cls].to_numpy(), raw_test_score, cal_test_score)
    calibration.to_csv(TABLES / "calibration_bins.csv", index=False)

    final_metrics = {
        "selected_horizon_months": horizon,
        "selected_threshold": threshold,
        "classification_threshold": opt_t,
        "n_train": int(len(train)),
        "n_validation": int(len(val)),
        "n_test": int(len(test)),
        "test_positive_rate": float(test[target_cls].mean()),
    }
    final_metrics.update(classify_metrics(test[target_cls].to_numpy(), raw_test_score, opt_t))
    final_metrics.update(
        classify_metrics(test[target_cls].to_numpy(), cal_test_score, opt_t, prefix="cal_")
    )
    final_metrics.update(
        regression_metrics(test[target_reg].to_numpy(), pred_return, test["price_filled"].to_numpy())
    )
    (REPORTS / "final_metrics.json").write_text(
        json.dumps(final_metrics, indent=2), encoding="utf-8"
    )
    return {
        "latest_alert_ranking": latest_alerts,
        "feature_importance": importances,
        "permutation_importance": perm_df,
        "calibration_bins": calibration,
        "final_metrics": pd.DataFrame([final_metrics]),
    }


def alert_driver_columns(alerts: pd.DataFrame) -> pd.DataFrame:
    if alerts.empty:
        return pd.DataFrame(index=alerts.index)
    vol_q75 = alerts["rolling_std_3"].quantile(0.75) if "rolling_std_3" in alerts else np.nan
    gap_q75 = (
        alerts["gap_to_national_commodity_mean"].quantile(0.75)
        if "gap_to_national_commodity_mean" in alerts
        else np.nan
    )
    rank_q75 = (
        alerts["price_rank_in_commodity_month"].quantile(0.75)
        if "price_rank_in_commodity_month" in alerts
        else np.nan
    )
    rows = []
    for _, row in alerts.iterrows():
        labels: list[str] = []
        if row.get("momentum_3", 0) > 0.04:
            labels.append("Momentum harga 3 bulan meningkat")
        if row.get("momentum_6", 0) > 0.06:
            labels.append("Momentum harga 6 bulan tinggi")
        if not pd.isna(vol_q75) and row.get("rolling_std_3", 0) >= vol_q75:
            labels.append("Volatilitas harga terbaru tinggi")
        if not pd.isna(gap_q75) and row.get("gap_to_national_commodity_mean", 0) >= gap_q75:
            labels.append("Harga di atas rata-rata nasional komoditas")
        if not pd.isna(rank_q75) and row.get("price_rank_in_commodity_month", 0) >= rank_q75:
            labels.append("Peringkat harga provinsi relatif tinggi")
        if row.get("is_ramadan_eid_window", 0) == 1:
            labels.append("Periode Ramadan/Idul Fitri")
        if row.get("is_year_end_window", 0) == 1:
            labels.append("Jendela akhir/tahun baru")
        if row.get("precip_anomaly", 0) > 50:
            labels.append("Curah hujan di atas pola historis")
        if row.get("precip_anomaly", 0) < -50:
            labels.append("Curah hujan di bawah pola historis")
        if not labels:
            labels.append("Pola historis provinsi-komoditas")
        while len(labels) < 3:
            labels.append("-")
        rows.append(
            {
                "top_driver_1": labels[0],
                "top_driver_2": labels[1],
                "top_driver_3": labels[2],
            }
        )
    return pd.DataFrame(rows, index=alerts.index)


def calibration_table(y_true: np.ndarray, raw: np.ndarray, cal: np.ndarray) -> pd.DataFrame:
    rows = []
    for label, scores in [("raw", raw), ("calibrated", cal)]:
        bins = pd.qcut(pd.Series(scores), q=8, duplicates="drop")
        temp = pd.DataFrame({"y": y_true, "score": scores, "bin": bins})
        grouped = (
            temp.groupby("bin", observed=False)
            .agg(mean_score=("score", "mean"), observed_rate=("y", "mean"), n=("y", "size"))
            .reset_index(drop=True)
        )
        grouped["kind"] = label
        rows.append(grouped)
    return pd.concat(rows, ignore_index=True)


def dataset_summary(panel: pd.DataFrame, raw_price: pd.DataFrame) -> dict[str, float | int | str]:
    summary = {
        "raw_rows": int(len(raw_price)),
        "processed_rows": int(len(panel)),
        "start_date": panel["date"].min().strftime("%Y-%m"),
        "end_date": panel["date"].max().strftime("%Y-%m"),
        "provinces": int(panel["province"].nunique()),
        "commodities": int(panel["commodity"].nunique()),
        "missing_price_raw_pct": float(raw_price["price"].isna().mean() * 100),
        "missing_price_processed_pct": float(panel["price_filled"].isna().mean() * 100),
    }
    (REPORTS / "dataset_summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    pd.DataFrame([summary]).to_csv(TABLES / "dataset_summary.csv", index=False)
    spike_rows = []
    for horizon in [1, 2]:
        for threshold in [0.05, 0.08, 0.10]:
            col = f"spike_h{horizon}_t{int(threshold * 100)}"
            valid = panel.dropna(subset=[f"target_return_h{horizon}"])
            spike_rows.append(
                {
                    "horizon_months": horizon,
                    "threshold": threshold,
                    "positive_rate": float(valid[col].mean()),
                    "valid_rows": int(len(valid)),
                }
            )
    pd.DataFrame(spike_rows).to_csv(TABLES / "spike_distribution.csv", index=False)
    return summary


def save_table_markdown(df: pd.DataFrame, path: Path, max_rows: int = 12) -> None:
    path.write_text(df.head(max_rows).to_markdown(index=False), encoding="utf-8")


def make_figures(panel: pd.DataFrame, results: dict[str, pd.DataFrame]) -> None:
    plt.rcParams.update({"font.size": 9, "figure.dpi": 140})

    summary = (
        panel.groupby(["date", "commodity"], as_index=False)["price_filled"]
        .mean()
        .pivot(index="date", columns="commodity", values="price_filled")
    )
    selected = [c for c in ["Beras Medium", "Cabai Rawit Merah", "Telur Ayam Ras", "Minyak Goreng Curah"] if c in summary.columns]
    ax = summary[selected].plot(figsize=(9, 4), linewidth=1.8)
    ax.set_title("Rata-rata Harga Pangan Bulanan Nasional (berdasarkan provinsi)")
    ax.set_xlabel("")
    ax.set_ylabel("Harga rata-rata (Rp)")
    ax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f"{x:,.0f}"))
    ax.grid(alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "price_trends.png")
    plt.close()

    spike = pd.read_csv(TABLES / "spike_distribution.csv")
    pivot = spike.pivot(index="threshold", columns="horizon_months", values="positive_rate")
    ax = (pivot * 100).plot(kind="bar", figsize=(7, 4), color=["#2f6fbb", "#f08a24"])
    ax.set_title("Proporsi Label Lonjakan Harga")
    ax.set_ylabel("Positif (%)")
    ax.set_xlabel("Threshold lonjakan")
    ax.grid(axis="y", alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "spike_distribution.png")
    plt.close()

    cls = results["classification_model_results"]
    cls_main = cls[
        (cls["horizon_months"] == MAIN_HORIZON) & (cls["threshold"] == MAIN_THRESHOLD)
    ].copy()
    fig, axes = plt.subplots(1, 2, figsize=(9, 4))
    axes[0].bar(cls_main["model"], cls_main["pr_auc"], color="#2f6fbb")
    axes[0].set_title("PR-AUC Model Klasifikasi")
    axes[0].set_ylim(0, max(0.2, cls_main["pr_auc"].max() * 1.2))
    axes[0].tick_params(axis="x", rotation=20)
    axes[1].bar(cls_main["model"], cls_main["recall_top10"], color="#0f9d77")
    axes[1].set_title("Recall@Top-10%")
    axes[1].set_ylim(0, 1)
    axes[1].tick_params(axis="x", rotation=20)
    for ax in axes:
        ax.grid(axis="y", alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "classification_model_comparison.png")
    plt.close()

    reg = results["regression_model_results"]
    reg_main = reg[reg["horizon_months"] == MAIN_HORIZON].copy()
    ax = reg_main.plot(
        kind="bar",
        x="model",
        y="wmape",
        figsize=(8, 4),
        legend=False,
        color="#f08a24",
    )
    ax.set_title("wMAPE Model Regresi")
    ax.set_ylabel("wMAPE")
    ax.set_xlabel("")
    ax.grid(axis="y", alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "regression_model_comparison.png")
    plt.close()

    pr = pd.read_csv(TABLES / "precision_recall_curve.csv")
    ax = pr.plot(x="recall", y="precision", figsize=(6, 4), color="#2f6fbb", legend=False)
    ax.set_title("Precision-Recall Curve Model Final")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.grid(alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "precision_recall_curve.png")
    plt.close()

    cal = results["calibration_bins"]
    fig, ax = plt.subplots(figsize=(6, 4))
    for kind, grp in cal.groupby("kind"):
        ax.plot(grp["mean_score"], grp["observed_rate"], marker="o", label=kind)
    ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="ideal")
    ax.set_title("Kurva Kalibrasi Probabilitas")
    ax.set_xlabel("Rata-rata probabilitas")
    ax.set_ylabel("Frekuensi aktual")
    ax.legend()
    ax.grid(alpha=0.25)
    plt.tight_layout()
    plt.savefig(FIGURES / "calibration_curve.png")
    plt.close()

    importance = results["feature_importance"].head(18).sort_values("importance")
    ax = importance.plot(
        kind="barh",
        x="feature",
        y="importance",
        figsize=(8, 6),
        color="#0f9d77",
        legend=False,
    )
    ax.set_title("Feature Importance Model Random Forest")
    ax.set_xlabel("Importance")
    ax.set_ylabel("")
    plt.tight_layout()
    plt.savefig(FIGURES / "feature_importance.png")
    plt.close()

    alerts = results["latest_alert_ranking"].head(15)
    if not alerts.empty:
        heat = alerts.pivot_table(
            index="province",
            columns="commodity",
            values="priority_score",
            aggfunc="max",
            fill_value=0,
        )
        fig, ax = plt.subplots(figsize=(10, max(4, len(heat) * 0.25)))
        im = ax.imshow(heat.values, aspect="auto", cmap="YlOrRd")
        ax.set_xticks(range(len(heat.columns)), heat.columns, rotation=45, ha="right")
        ax.set_yticks(range(len(heat.index)), heat.index)
        ax.set_title("Heatmap Prioritas Alert Teratas")
        fig.colorbar(im, ax=ax, label="Priority score")
        plt.tight_layout()
        plt.savefig(FIGURES / "alert_heatmap.png")
        plt.close()


def fmt_pct(value: float) -> str:
    if pd.isna(value):
        return "-"
    return f"{value * 100:.1f}%"


def fmt_num(value: float, digits: int = 3) -> str:
    if pd.isna(value):
        return "-"
    return f"{value:.{digits}f}"


def fmt_currency(value: float) -> str:
    if pd.isna(value):
        return "-"
    return f"Rp{value:,.0f}".replace(",", ".")


def dataframe_for_pdf(df: pd.DataFrame, columns: list[str], max_rows: int = 8) -> list[list[str]]:
    visible = df.loc[:, columns].head(max_rows).copy()
    rows = [columns]
    for _, row in visible.iterrows():
        rows.append([str(row[c]) for c in columns])
    return rows


def table_flowable(rows: list[list[str]], col_widths: list[float] | None = None) -> Table:
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0b3b66")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cccccc")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f9fb")]),
            ]
        )
    )
    return table


def add_paragraph(story: list, text: str, style) -> None:
    for part in textwrap.dedent(text).strip().split("\n\n"):
        if part.strip():
            story.append(Paragraph(part.strip().replace("\n", " "), style))
            story.append(Spacer(1, 0.12 * cm))


def generate_markdown_report(summary: dict, results: dict[str, pd.DataFrame]) -> None:
    final_metrics = json.loads((REPORTS / "final_metrics.json").read_text(encoding="utf-8"))
    cls = results["classification_model_results"]
    cls_main = cls[
        (cls["horizon_months"] == MAIN_HORIZON) & (cls["threshold"] == MAIN_THRESHOLD)
    ][
        [
            "model",
            "pr_auc",
            "recall_top10",
            "precision_top10",
            "brier",
            "cal_pr_auc",
            "cal_brier",
        ]
    ].copy()
    reg = results["regression_model_results"]
    reg_main = reg[reg["horizon_months"] == MAIN_HORIZON][["model", "mae", "rmse", "wmape"]].copy()
    reg_main = pd.concat(
        [
            reg_main,
            pd.DataFrame(
                [
                    {
                        "model": "HistGradientBoosting Final Train+Val",
                        "mae": final_metrics["mae"],
                        "rmse": final_metrics["rmse"],
                        "wmape": final_metrics["wmape"],
                    }
                ]
            ),
        ],
        ignore_index=True,
    )
    alerts = results["latest_alert_ranking"].head(10).copy()

    md = f"""# PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining

> **Status:** draft teknis berbasis eksperimen. Tim wajib memeriksa ulang, menyunting, dan mempertanggungjawabkan seluruh analisis sebelum dikumpulkan sebagai technical report final.

## Abstrak

Lonjakan harga pangan strategis dapat mengganggu daya beli masyarakat dan menyulitkan pengambilan keputusan intervensi pasar. Penelitian ini mengusulkan PanganShock-X, pipeline data mining berbasis panel time-series untuk memprediksi risiko lonjakan harga pangan pada level provinsi-komoditas. Implementasi awal menggunakan dataset terbuka Badan Pangan Nasional berupa rata-rata harga pangan bulanan tingkat konsumen provinsi periode {summary['start_date']} sampai {summary['end_date']}. Karena dataset terbuka yang konsisten tersedia dalam bentuk bulanan, horizon prediksi diimplementasikan sebagai 1 dan 2 bulan ke depan. Model melakukan dua tugas: regresi perubahan harga dan klasifikasi risiko lonjakan. Evaluasi menggunakan time-based split, PR-AUC, Recall@Top-K, Brier score, MAE, RMSE, dan wMAPE. Pada konfigurasi utama horizon {MAIN_HORIZON} bulan dan threshold lonjakan {int(MAIN_THRESHOLD*100)}%, model final memperoleh PR-AUC {final_metrics['pr_auc']:.3f}, Recall@Top-10% {final_metrics['recall_top10']:.3f}, Brier score {final_metrics['brier']:.3f}, MAE {final_metrics['mae']:.0f}, dan wMAPE {final_metrics['wmape']:.3f}. Output akhir berupa ranking prioritas provinsi-komoditas yang dilengkapi probabilitas lonjakan, estimasi kenaikan harga, skor prioritas, dan faktor penjelas.

## Pendahuluan

Harga pangan strategis seperti beras, cabai, bawang, telur, daging ayam, gula, dan minyak goreng berpengaruh langsung terhadap kebutuhan rumah tangga. Perubahan harga yang tajam dapat dipicu oleh cuaca, pola musiman, perubahan permintaan saat hari besar, distribusi, dan perbedaan kondisi antarwilayah. Monitoring harga saja belum cukup apabila pengambil kebijakan harus menentukan wilayah dan komoditas mana yang perlu diprioritaskan.

Tujuan penelitian ini adalah membangun pipeline data mining yang mengubah data harga pangan historis dan fitur pendukung menjadi sistem peringatan dini berbasis ranking prioritas. Manfaat yang diharapkan adalah membantu monitoring pasar, prioritas observasi wilayah, serta analisis faktor yang berkaitan dengan lonjakan harga.

Batasan penelitian ini adalah penggunaan data bulanan terbuka, sehingga horizon prediksi yang dihasilkan adalah 1-2 bulan. Pipeline tetap dirancang agar dapat ditingkatkan ke data harian PIHPS apabila akses ekspor/API harian tersedia bagi tim.

## Dataset

Dataset utama berasal dari Portal Data Badan Pangan Nasional: `Rata-rata Harga Pangan Bulanan Tingkat Konsumen Provinsi (Angka Juni 2025)`. Dataset diperkaya dengan fitur kalender dan data cuaca historis Open-Meteo berdasarkan koordinat ibu kota provinsi. Data cuaca digunakan sebagai fallback terbuka dan perlu diganti/diperkuat dengan BMKG bila tim memiliki akses historis resmi yang lebih rinci.

- Baris raw: {summary['raw_rows']:,}
- Baris panel terproses: {summary['processed_rows']:,}
- Rentang waktu: {summary['start_date']} sampai {summary['end_date']}
- Jumlah provinsi: {summary['provinces']}
- Jumlah komoditas strategis terpakai: {summary['commodities']}
- Missing harga raw: {summary['missing_price_raw_pct']:.2f}%

## Metode

Unit analisis adalah `provinsi x komoditas x bulan`. Target regresi adalah return harga pada horizon 1 dan 2 bulan. Target klasifikasi didefinisikan sebagai lonjakan apabila harga maksimum pada horizon ke depan naik minimal 5%, 8%, atau 10% dibanding harga bulan observasi. Konfigurasi utama menggunakan threshold {int(MAIN_THRESHOLD * 100)}%.

Fitur yang digunakan meliputi lag harga, return historis, rolling mean, rolling volatility, momentum, gap harga provinsi terhadap rata-rata komoditas nasional, fitur kalender, jendela Ramadan/Idul Fitri, fitur cuaca bulanan, dan encoding provinsi serta komoditas.

Model baseline meliputi persistence, moving average, ridge regression, dan logistic regression. Model utama menggunakan Random Forest dan HistGradientBoosting untuk regresi dan klasifikasi. Probabilitas klasifikasi dikalibrasi menggunakan Platt scaling pada validation set.

## Hasil Eksperimen

### Klasifikasi Risiko Lonjakan

{cls_main.to_markdown(index=False)}

### Regresi Perubahan Harga

{reg_main.to_markdown(index=False)}

### Ablation Study

{results['feature_ablation'].to_markdown(index=False)}

### Ranking Alert Terbaru

{alerts[['rank','date','province','commodity','price_filled','spike_probability_calibrated','predicted_return','priority_score','priority_level','top_driver_1']].to_markdown(index=False)}

## Analisis

Hasil eksperimen menunjukkan bahwa tugas deteksi lonjakan harga lebih cocok dievaluasi dengan PR-AUC dan Recall@Top-K daripada akurasi biasa karena kelas positif relatif tidak seimbang. Model gradient boosting dipilih sebagai model final karena mampu menangkap hubungan non-linear dari fitur momentum, volatilitas, kalender, cuaca, dan perbedaan harga antarwilayah. Kalibrasi probabilitas digunakan agar skor risiko lebih layak dijadikan dasar ranking.

Ranking prioritas tidak hanya bergantung pada probabilitas lonjakan, tetapi juga memperhitungkan estimasi kenaikan harga. Dengan demikian, provinsi-komoditas yang diprioritaskan adalah kombinasi dengan risiko dan dampak harga yang relatif tinggi. Analisis feature importance membantu menjelaskan apakah model terutama dipengaruhi oleh pola harga historis, volatilitas, faktor kalender, atau fitur cuaca.

Keterbatasan utama adalah granularitas bulanan. Untuk kebutuhan operasional 7-14 hari, tim perlu memperoleh data harian yang konsisten dari PIHPS/BI atau sumber resmi lain. Selain itu, data cuaca Open-Meteo merupakan fallback terbuka; penggunaan data BMKG historis akan lebih kuat untuk versi final.

## Kesimpulan

PanganShock-X berhasil diimplementasikan sebagai pipeline data mining end-to-end untuk prediksi risiko lonjakan harga pangan strategis pada level provinsi-komoditas. Pipeline mencakup akuisisi data, pembersihan, feature engineering, model baseline, model utama, evaluasi berbasis waktu, kalibrasi, feature importance, dan ranking prioritas. Hasil ini dapat menjadi dasar technical report GEMASTIK, dengan catatan bahwa tim perlu melakukan verifikasi substansi, menyunting narasi akhir, dan menyesuaikan identitas tim sebelum pengumpulan.

## Sumber Data

- Badan Pangan Nasional, Portal Data: https://data.badanpangan.go.id/
- Dataset Bapanas: https://data.badanpangan.go.id/datasetpublications/3xv/rata-rata-harga-pangan-bulanan-konsumen-provinsi
- Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
- PIHPS/Bank Indonesia sebagai kandidat upgrade data harian: https://hargapangan.id/ dan https://www.bi.go.id/hargapangan
"""
    (REPORTS / "technical-report-draft.md").write_text(md, encoding="utf-8")


def generate_pdf_report(summary: dict, results: dict[str, pd.DataFrame]) -> Path:
    final_metrics = json.loads((REPORTS / "final_metrics.json").read_text(encoding="utf-8"))
    pdf_path = (
        REPORTS
        / "GEMASTIK XVIII Penambangan Data - ID_TIM - NAMA_TIM - PanganShock-X.pdf"
    )
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=1.4 * cm,
        leftMargin=1.4 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
    )
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCenter",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontSize=15,
            leading=18,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Heading",
            parent=styles["Heading2"],
            fontSize=11,
            leading=14,
            spaceBefore=8,
            spaceAfter=4,
            textColor=colors.HexColor("#0b3b66"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodySmall",
            parent=styles["BodyText"],
            fontSize=8.5,
            leading=11,
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Note",
            parent=styles["BodyText"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#555555"),
            backColor=colors.HexColor("#f4f7fb"),
            borderColor=colors.HexColor("#d7e3f0"),
            borderWidth=0.4,
            borderPadding=5,
        )
    )
    story: list = []
    story.append(
        Paragraph(
            "PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining",
            styles["TitleCenter"],
        )
    )
    story.append(
        Paragraph(
            "Technical Report Draft untuk GEMASTIK XVIII Penambangan Data",
            styles["BodySmall"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        Paragraph(
            "Catatan: dokumen ini adalah draft berbasis eksperimen yang wajib diperiksa, disunting, dan dipertanggungjawabkan oleh tim sebelum dikumpulkan. Ganti ID_TIM dan NAMA_TIM pada nama file resmi.",
            styles["Note"],
        )
    )

    story.append(Paragraph("Abstrak", styles["Heading"]))
    add_paragraph(
        story,
        f"""
        Lonjakan harga pangan strategis dapat mengganggu daya beli masyarakat dan menyulitkan prioritas intervensi pasar. Penelitian ini mengimplementasikan PanganShock-X, pipeline data mining berbasis panel time-series untuk memprediksi risiko lonjakan harga pangan pada level provinsi-komoditas. Dataset utama adalah data terbuka Badan Pangan Nasional periode {summary['start_date']} sampai {summary['end_date']}, diperkaya fitur kalender dan cuaca historis terbuka. Karena data terbuka yang konsisten tersedia pada granularitas bulanan, horizon prediksi diimplementasikan sebagai 1 dan 2 bulan. Pada konfigurasi utama horizon {MAIN_HORIZON} bulan dan threshold {int(MAIN_THRESHOLD * 100)}%, model final memperoleh PR-AUC {final_metrics['pr_auc']:.3f}, Recall@Top-10% {final_metrics['recall_top10']:.3f}, Brier {final_metrics['brier']:.3f}, MAE {final_metrics['mae']:.0f}, dan wMAPE {final_metrics['wmape']:.3f}. Output akhir berupa ranking prioritas provinsi-komoditas dengan probabilitas lonjakan, estimasi kenaikan, skor prioritas, dan penjelasan fitur.
        """,
        styles["BodySmall"],
    )

    sections = [
        (
            "1. Pendahuluan",
            """
            Harga pangan strategis seperti beras, cabai, bawang, telur, daging ayam, gula, dan minyak goreng berpengaruh langsung terhadap kebutuhan rumah tangga. Perubahan harga yang tajam dapat dipicu oleh cuaca, pola musiman, hari besar, distribusi, dan perbedaan kondisi antarwilayah. Tujuan penelitian ini adalah membangun sistem peringatan dini berbasis data mining yang tidak hanya memprediksi harga, tetapi juga mengurutkan provinsi-komoditas yang perlu diprioritaskan. Manfaatnya adalah membantu monitoring pasar, prioritas observasi wilayah, dan analisis faktor risiko. Batasan utama adalah penggunaan data bulanan terbuka, sehingga output awal bersifat early warning bulanan, bukan operasional harian.
            """,
        ),
        (
            "2. Kajian Terkait",
            """
            Prediksi harga pangan umumnya menggunakan pendekatan time-series klasik dan machine learning. Namun, prediksi nilai harga saja belum langsung menjawab kebutuhan prioritas intervensi. Penelitian ini memformulasikan masalah sebagai kombinasi regresi perubahan harga dan klasifikasi lonjakan harga yang tidak seimbang. Karena tujuan akhir adalah alert ranking, metrik PR-AUC dan Recall@Top-K digunakan bersama MAE, RMSE, wMAPE, serta Brier score untuk kalibrasi probabilitas.
            """,
        ),
        (
            "3. Solusi Usulan",
            """
            Unit analisis adalah provinsi x komoditas x bulan. Dataset dibangun dari data harga pangan bulanan tingkat konsumen provinsi, fitur kalender, jendela Ramadan/Idul Fitri, dan fitur cuaca historis. Fitur utama meliputi lag harga, return historis, rolling mean, rolling volatility, momentum, gap harga terhadap rata-rata nasional komoditas, encoding provinsi, dan encoding komoditas. Model baseline meliputi persistence, moving average, ridge regression, dan logistic regression. Model utama menggunakan Random Forest dan HistGradientBoosting. Skor prioritas dihitung dari probabilitas lonjakan terkalibrasi dikalikan estimasi kenaikan harga positif.
            """,
        ),
    ]
    for title, body in sections:
        story.append(Paragraph(title, styles["Heading"]))
        add_paragraph(story, body, styles["BodySmall"])

    story.append(Paragraph("4. Dataset", styles["Heading"]))
    ds_rows = [
        ["Komponen", "Nilai"],
        ["Baris raw", f"{summary['raw_rows']:,}"],
        ["Baris panel terproses", f"{summary['processed_rows']:,}"],
        ["Rentang waktu", f"{summary['start_date']} sampai {summary['end_date']}"],
        ["Jumlah provinsi", str(summary["provinces"])],
        ["Jumlah komoditas", str(summary["commodities"])],
        ["Missing harga raw", f"{summary['missing_price_raw_pct']:.2f}%"],
    ]
    story.append(table_flowable(ds_rows, [6 * cm, 10 * cm]))

    story.append(Paragraph("5. Hasil Eksperimen", styles["Heading"]))
    cls_main = results["classification_model_results"]
    cls_main = cls_main[
        (cls_main["horizon_months"] == MAIN_HORIZON)
        & (cls_main["threshold"] == MAIN_THRESHOLD)
    ].copy()
    cls_display = cls_main[["model", "pr_auc", "recall_top10", "precision_top10", "brier", "cal_brier"]].round(3)
    story.append(Paragraph("Klasifikasi risiko lonjakan", styles["BodySmall"]))
    story.append(table_flowable(dataframe_for_pdf(cls_display, list(cls_display.columns)), [3.4 * cm, 2.3 * cm, 2.4 * cm, 2.6 * cm, 2.1 * cm, 2.1 * cm]))

    reg_main = results["regression_model_results"]
    reg_main = reg_main[reg_main["horizon_months"] == MAIN_HORIZON][["model", "mae", "rmse", "wmape"]].copy()
    reg_main = pd.concat(
        [
            reg_main,
            pd.DataFrame(
                [
                    {
                        "model": "HistGradientBoosting Final Train+Val",
                        "mae": final_metrics["mae"],
                        "rmse": final_metrics["rmse"],
                        "wmape": final_metrics["wmape"],
                    }
                ]
            ),
        ],
        ignore_index=True,
    )
    reg_main["mae"] = reg_main["mae"].round(0).astype(int)
    reg_main["rmse"] = reg_main["rmse"].round(0).astype(int)
    reg_main["wmape"] = reg_main["wmape"].round(3)
    story.append(Spacer(1, 0.15 * cm))
    story.append(Paragraph("Regresi perubahan harga", styles["BodySmall"]))
    story.append(table_flowable(dataframe_for_pdf(reg_main, list(reg_main.columns)), [4.5 * cm, 3 * cm, 3 * cm, 3 * cm]))

    story.append(PageBreak())
    story.append(Paragraph("Figur Eksperimen", styles["Heading"]))
    for fig_name, caption in [
        ("price_trends.png", "Tren harga pangan rata-rata."),
        ("classification_model_comparison.png", "Perbandingan model klasifikasi."),
        ("precision_recall_curve.png", "Precision-recall curve model final."),
        ("calibration_curve.png", "Kurva kalibrasi probabilitas."),
        ("feature_importance.png", "Feature importance model."),
        ("alert_heatmap.png", "Heatmap alert prioritas."),
    ]:
        fig_path = FIGURES / fig_name
        if fig_path.exists():
            story.append(KeepTogether([Image(str(fig_path), width=16 * cm, height=7.5 * cm), Paragraph(caption, styles["BodySmall"])]))
            story.append(Spacer(1, 0.2 * cm))

    story.append(PageBreak())
    story.append(Paragraph("6. Ranking Prioritas", styles["Heading"]))
    alerts = results["latest_alert_ranking"].head(10).copy()
    alerts_display = alerts[
        [
            "rank",
            "province",
            "commodity",
            "price_filled",
            "spike_probability_calibrated",
            "predicted_return",
            "priority_level",
            "top_driver_1",
        ]
    ].copy()
    alerts_display["price_filled"] = alerts_display["price_filled"].map(fmt_currency)
    alerts_display["spike_probability_calibrated"] = alerts_display[
        "spike_probability_calibrated"
    ].map(lambda x: fmt_pct(x))
    alerts_display["predicted_return"] = alerts_display["predicted_return"].map(lambda x: fmt_pct(x))
    story.append(
        table_flowable(
            dataframe_for_pdf(alerts_display, list(alerts_display.columns), 10),
            [
                0.9 * cm,
                2.3 * cm,
                2.6 * cm,
                1.8 * cm,
                1.8 * cm,
                1.7 * cm,
                1.5 * cm,
                3.4 * cm,
            ],
        )
    )

    story.append(Paragraph("7. Analisis", styles["Heading"]))
    add_paragraph(
        story,
        """
        Hasil eksperimen perlu dibaca sebagai bukti awal bahwa ranking risiko dapat dibangun dari data harga bulanan. PR-AUC dan Recall@Top-K lebih relevan daripada akurasi karena kelas lonjakan tidak seimbang. Model final menggunakan hubungan non-linear dari momentum, volatilitas, fitur kalender, cuaca, dan perbedaan harga antarwilayah. Ranking prioritas menggabungkan probabilitas dan dampak estimasi kenaikan sehingga alert teratas lebih dekat dengan kebutuhan monitoring.

        Keterbatasan utama adalah granularitas bulanan dan penggunaan Open-Meteo sebagai fallback cuaca. Versi final yang lebih kuat sebaiknya memakai data harian PIHPS/BI dan data historis BMKG bila akses tersedia. Tim juga perlu memeriksa apakah alert teratas sesuai dengan pengetahuan domain dan peristiwa harga pangan pada periode uji.
        """,
        styles["BodySmall"],
    )

    story.append(Paragraph("8. Kesimpulan", styles["Heading"]))
    add_paragraph(
        story,
        """
        PanganShock-X telah diimplementasikan sebagai pipeline end-to-end untuk prediksi risiko lonjakan harga pangan strategis dan penyusunan ranking prioritas provinsi-komoditas. Pipeline mencakup data acquisition, preprocessing, feature engineering, baseline, model utama, evaluasi berbasis waktu, kalibrasi, feature importance, visualisasi, dan report-ready alert ranking. Dokumen ini dapat menjadi dasar technical report GEMASTIK setelah tim melakukan verifikasi, penyuntingan, dan pengisian identitas resmi.
        """,
        styles["BodySmall"],
    )

    story.append(Paragraph("Sumber Data", styles["Heading"]))
    add_paragraph(
        story,
        """
        Badan Pangan Nasional, Portal Data: https://data.badanpangan.go.id/
        Dataset Bapanas: https://data.badanpangan.go.id/datasetpublications/3xv/rata-rata-harga-pangan-bulanan-konsumen-provinsi
        Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
        PIHPS/Bank Indonesia sebagai kandidat upgrade data harian: https://hargapangan.id/ dan https://www.bi.go.id/hargapangan
        """,
        styles["BodySmall"],
    )

    doc.build(story)
    return pdf_path


def generate_output_summaries(results: dict[str, pd.DataFrame]) -> None:
    for name, df in results.items():
        if isinstance(df, pd.DataFrame):
            save_table_markdown(df, TABLES / f"{name}.md")


def main() -> None:
    ensure_dirs()
    price_df = load_price_data()
    weather_df = load_weather_data(price_df)
    panel = build_panel(price_df, weather_df)
    summary = dataset_summary(panel, price_df)
    results = run_main_experiments(panel)
    generate_output_summaries(results)
    make_figures(panel, results)
    generate_markdown_report(summary, results)
    pdf_path = generate_pdf_report(summary, results)
    print(f"Done. PDF: {pdf_path}")


if __name__ == "__main__":
    main()
