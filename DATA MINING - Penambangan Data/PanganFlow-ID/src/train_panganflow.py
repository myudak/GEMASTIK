from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Iterable

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import ndcg_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer


ROOT = Path(__file__).resolve().parents[1]
DATA_PROCESSED = ROOT / "data" / "processed"
TABLES = ROOT / "reports" / "tables"
FIGURES = ROOT / "reports" / "figures"

SEED = 42
TOP_K = 10

FEATURE_GROUPS = {
    "price": [
        "price",
        "price_14d_change",
        "national_median_gap",
        "price_zscore_past6",
        "price_gap_score",
        "change_score",
        "anomaly_score",
    ],
    "balance": [
        "production_ton_year",
        "need_ton_year",
        "surplus_proxy_ton",
        "balance_deficit_score",
        "balance_surplus_score",
        "deficit_score",
        "surplus_score",
    ],
    "spatial": ["lat", "lon"],
}
CATEGORICAL_FEATURES = ["region"]


def ensure_dirs() -> None:
    for path in [TABLES, FIGURES]:
        path.mkdir(parents=True, exist_ok=True)


def minmax(series: pd.Series, fill: float = 0.5) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce").astype(float)
    if values.notna().sum() == 0:
        return pd.Series(fill, index=series.index)
    values = values.replace([np.inf, -np.inf], np.nan).fillna(values.median())
    lo = values.min()
    hi = values.max()
    if math.isclose(float(lo), float(hi)):
        return pd.Series(fill, index=series.index)
    return (values - lo) / (hi - lo)


def load_panel() -> pd.DataFrame:
    path = DATA_PROCESSED / "province_commodity_panel.csv"
    if not path.exists():
        raise FileNotFoundError(f"Run build_dataset.py first: {path}")
    panel = pd.read_csv(path, parse_dates=["date"])
    panel = panel.sort_values(["province", "commodity", "date"]).copy()
    panel["price_gap_score"] = panel.groupby("date", group_keys=False)["national_median_gap"].transform(lambda s: minmax(s.clip(lower=0), 0.0))
    panel["change_score"] = minmax(panel["price_14d_change"].clip(lower=0).fillna(0), 0.0)
    panel["balance_deficit_score"] = minmax((-panel["surplus_proxy_ton"]).clip(lower=0), 0.0)
    panel["balance_surplus_score"] = minmax(panel["surplus_proxy_ton"].clip(lower=0), 0.0)
    panel["future_priority"] = panel.groupby(["province", "commodity"])["monitoring_priority_proxy"].shift(-1)
    panel["future_label"] = panel.groupby("date")["future_priority"].transform(lambda s: (s >= s.quantile(0.75)).astype(int))
    panel = panel.dropna(subset=["future_priority"])
    return panel


def all_features() -> list[str]:
    result: list[str] = []
    for cols in FEATURE_GROUPS.values():
        result.extend(cols)
    return result


def make_preprocessor(numeric_features: list[str]) -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", Pipeline([("scale", StandardScaler())]), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )


def make_model(numeric_features: list[str]) -> Pipeline:
    return Pipeline(
        [
            ("prep", make_preprocessor(numeric_features)),
            (
                "rf",
                RandomForestRegressor(
                    n_estimators=260,
                    min_samples_leaf=3,
                    random_state=SEED,
                    n_jobs=-1,
                ),
            ),
        ]
    )


def temporal_split(panel: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    months = sorted(panel["date"].drop_duplicates())
    holdout = max(6, min(10, len(months) // 5))
    test_months = set(months[-holdout:])
    train = panel[~panel["date"].isin(test_months)].copy()
    test = panel[panel["date"].isin(test_months)].copy()
    return train, test


def precision_recall_at_k(labels: Iterable[int], scores: Iterable[float], k: int = TOP_K) -> tuple[float, float]:
    df = pd.DataFrame({"label": list(labels), "score": list(scores)})
    if df.empty:
        return 0.0, 0.0
    top = df.sort_values("score", ascending=False).head(k)
    positives = max(int(df["label"].sum()), 1)
    precision = float(top["label"].sum() / max(len(top), 1))
    recall = float(top["label"].sum() / positives)
    return precision, recall


def ranking_metrics(df: pd.DataFrame, score_col: str, k: int = TOP_K) -> dict[str, float]:
    rows = []
    for _, group in df.groupby("date"):
        labels = group["future_label"].astype(int).to_numpy()
        scores = group[score_col].astype(float).to_numpy()
        if len(np.unique(labels)) < 2:
            continue
        try:
            ndcg = float(ndcg_score(labels.reshape(1, -1), scores.reshape(1, -1), k=min(k, len(labels))))
        except ValueError:
            ndcg = 0.0
        precision, recall = precision_recall_at_k(labels, scores, min(k, len(group)))
        rows.append({"ndcg_at_k": ndcg, "precision_at_k": precision, "recall_at_k": recall})
    if not rows:
        return {"ndcg_at_k": 0.0, "precision_at_k": 0.0, "recall_at_k": 0.0}
    metrics = pd.DataFrame(rows).mean(numeric_only=True).to_dict()
    return {k: float(v) for k, v in metrics.items()}


def evaluate_models(train: pd.DataFrame, test: pd.DataFrame) -> tuple[Pipeline, pd.DataFrame, pd.DataFrame]:
    numeric_features = all_features()
    train_x = train[numeric_features + CATEGORICAL_FEATURES]
    test_x = test[numeric_features + CATEGORICAL_FEATURES]
    model = make_model(numeric_features)
    model.fit(train_x, train["future_priority"])
    test = test.copy()
    rng = np.random.default_rng(SEED)
    test["score_random"] = rng.random(len(test))
    test["score_price_gap"] = test["price_gap_score"].fillna(0)
    test["score_balance"] = test["deficit_score"].fillna(0)
    test["score_weighted_index"] = test["monitoring_priority_proxy"].fillna(0)
    test["_rf_prediction"] = model.predict(test_x)
    test["_rf_prediction_norm"] = test.groupby("date", group_keys=False)["_rf_prediction"].transform(lambda s: minmax(s, 0.5))
    test["score_panganflow"] = (0.72 * test["score_weighted_index"] + 0.28 * test["_rf_prediction_norm"]).clip(0, 1)

    metric_rows = []
    for name, col in [
        ("Random ranking", "score_random"),
        ("Price-gap baseline", "score_price_gap"),
        ("Deficit baseline", "score_balance"),
        ("Weighted priority index", "score_weighted_index"),
        ("PanganFlow hybrid model", "score_panganflow"),
    ]:
        values = ranking_metrics(test, col)
        values["model"] = name
        metric_rows.append(values)
    metrics = pd.DataFrame(metric_rows)[["model", "ndcg_at_k", "precision_at_k", "recall_at_k"]]
    weighted = metrics.loc[metrics["model"].eq("Weighted priority index"), "ndcg_at_k"].iloc[0]
    metrics["lift_over_weighted"] = metrics["ndcg_at_k"] / weighted if weighted else np.nan
    return model, test, metrics


def run_ablation(train: pd.DataFrame, test: pd.DataFrame) -> pd.DataFrame:
    rows = []
    base_features = all_features()
    for removed_group, removed_cols in FEATURE_GROUPS.items():
        features = [c for c in base_features if c not in removed_cols]
        model = make_model(features)
        model.fit(train[features + CATEGORICAL_FEATURES], train["future_priority"])
        temp = test.copy()
        temp["score"] = model.predict(test[features + CATEGORICAL_FEATURES])
        metrics = ranking_metrics(temp, "score")
        rows.append({"setting": f"without_{removed_group}", **metrics})
    model = make_model(base_features)
    model.fit(train[base_features + CATEGORICAL_FEATURES], train["future_priority"])
    temp = test.copy()
    temp["score"] = model.predict(test[base_features + CATEGORICAL_FEATURES])
    rows.append({"setting": "all_features", **ranking_metrics(temp, "score")})
    return pd.DataFrame(rows).sort_values("ndcg_at_k", ascending=False)


def feature_importance(model: Pipeline, test: pd.DataFrame) -> pd.DataFrame:
    features = all_features()
    try:
        result = permutation_importance(
            model,
            test[features + CATEGORICAL_FEATURES],
            test["future_priority"],
            n_repeats=8,
            random_state=SEED,
            n_jobs=-1,
        )
        names = features + CATEGORICAL_FEATURES
        df = pd.DataFrame({"feature": names, "importance": result.importances_mean, "std": result.importances_std})
    except Exception:
        rf = model.named_steps["rf"]
        names = model.named_steps["prep"].get_feature_names_out()
        df = pd.DataFrame({"feature": names, "importance": rf.feature_importances_, "std": 0.0})
    return df.sort_values("importance", ascending=False).head(20)


def latest_predictions(panel: pd.DataFrame, model: Pipeline) -> pd.DataFrame:
    features = all_features()
    latest_date = panel["date"].max()
    latest = panel[panel["date"].eq(latest_date)].copy()
    latest["_rf_prediction"] = model.predict(latest[features + CATEGORICAL_FEATURES])
    latest["_rf_prediction_norm"] = minmax(latest["_rf_prediction"], 0.5)
    latest["model_priority_score"] = (0.72 * latest["monitoring_priority_proxy"] + 0.28 * latest["_rf_prediction_norm"]).clip(0, 1)
    iso_features = [
        "price",
        "price_14d_change",
        "national_median_gap",
        "price_zscore_past6",
        "anomaly_score",
    ]
    iso = Pipeline([("scale", StandardScaler()), ("iso", IsolationForest(contamination=0.18, random_state=SEED))])
    iso.fit(panel[iso_features].replace([np.inf, -np.inf], np.nan).fillna(0))
    latest["isolation_anomaly_score"] = -iso.decision_function(latest[iso_features].replace([np.inf, -np.inf], np.nan).fillna(0))
    latest["isolation_anomaly_score"] = minmax(latest["isolation_anomaly_score"], 0.0)
    latest["rank"] = latest["model_priority_score"].rank(ascending=False, method="first").astype(int)
    latest = latest.sort_values("rank")
    latest["top_reasons"] = latest.apply(priority_reasons, axis=1)
    return latest


def priority_reasons(row: pd.Series) -> str:
    reasons = []
    if row["national_median_gap"] > 0.08:
        reasons.append("harga di atas median nasional")
    if row["price_14d_change"] > 0.02:
        reasons.append("kenaikan harga bulanan positif")
    if row["surplus_proxy_ton"] < 0:
        reasons.append("proxy neraca beras defisit")
    if row["anomaly_score"] > 0.55:
        reasons.append("sinyal anomali harga tinggi")
    if not reasons:
        reasons.append("skor prioritas moderat berdasarkan kombinasi fitur")
    return "; ".join(reasons[:4])


def build_clusters(latest: pd.DataFrame) -> pd.DataFrame:
    features = [
        "price_gap_score",
        "anomaly_score",
        "deficit_score",
        "surplus_score",
        "national_median_gap",
        "price_14d_change",
    ]
    x = latest[features].replace([np.inf, -np.inf], np.nan).fillna(0)
    scaled = StandardScaler().fit_transform(x)
    kmeans = KMeans(n_clusters=4, random_state=SEED, n_init=20)
    cluster_id = kmeans.fit_predict(scaled)
    pca = PCA(n_components=2, random_state=SEED)
    coords = pca.fit_transform(scaled)
    out = latest.copy()
    out["cluster_id"] = cluster_id
    out["pca_x"] = coords[:, 0]
    out["pca_y"] = coords[:, 1]
    labels = {}
    for cid, group in out.groupby("cluster_id"):
        if group["surplus_score"].median() > 0.6 and group["anomaly_score"].median() < 0.5:
            label = "Surplus relatif stabil"
        elif group["deficit_score"].median() > 0.55 and group["price_gap_score"].median() > 0.45:
            label = "Defisit dan harga tinggi"
        elif group["anomaly_score"].median() > 0.55:
            label = "Rawan shock harga"
        else:
            label = "Transisi/moderat"
        labels[cid] = label
    out["cluster_label"] = out["cluster_id"].map(labels)
    cluster_summary = (
        out.groupby(["cluster_id", "cluster_label"], as_index=False)
        .agg(
            province_count=("province", "count"),
            avg_price=("price", "mean"),
            avg_deficit_score=("deficit_score", "mean"),
            avg_surplus_score=("surplus_score", "mean"),
            avg_anomaly_score=("anomaly_score", "mean"),
        )
        .sort_values("avg_deficit_score", ascending=False)
    )
    cluster_summary.to_csv(TABLES / "cluster_summary.csv", index=False)
    out.to_csv(TABLES / "cluster_snapshot.csv", index=False)
    return out


def build_flow_recommendations(latest: pd.DataFrame) -> pd.DataFrame:
    distances = pd.read_csv(DATA_PROCESSED / "province_distance_matrix.csv")
    origins = latest[(latest["surplus_proxy_ton"] > 0) & (latest["surplus_score"] >= latest["surplus_score"].quantile(0.55))].copy()
    destinations = latest[(latest["deficit_score"] >= latest["deficit_score"].quantile(0.55)) | (latest["model_priority_score"] >= latest["model_priority_score"].quantile(0.65))].copy()
    rows = []
    for _, origin in origins.iterrows():
        for _, dest in destinations.iterrows():
            if origin["province"] == dest["province"]:
                continue
            distance = distances[
                distances["origin_province"].eq(origin["province"]) & distances["destination_province"].eq(dest["province"])
            ]["distance_km"].iloc[0]
            price_gap = max(float(dest["price"]) - float(origin["price"]), 0.0)
            rows.append(
                {
                    "commodity": "Beras Medium",
                    "origin_province": origin["province"],
                    "destination_province": dest["province"],
                    "origin_region": origin["region"],
                    "destination_region": dest["region"],
                    "origin_price": origin["price"],
                    "destination_price": dest["price"],
                    "price_gap_raw": price_gap,
                    "origin_surplus_ton": origin["surplus_proxy_ton"],
                    "destination_surplus_ton": dest["surplus_proxy_ton"],
                    "origin_surplus_score": origin["surplus_score"],
                    "destination_deficit_score": dest["deficit_score"],
                    "destination_model_score": dest["model_priority_score"],
                    "destination_anomaly_score": dest["anomaly_score"],
                    "distance_km": distance,
                }
            )
    flows = pd.DataFrame(rows)
    if flows.empty:
        raise RuntimeError("No valid surplus-deficit flow candidates were produced.")
    flows["price_gap_score"] = minmax(flows["price_gap_raw"], 0.0)
    flows["distance_penalty"] = minmax(flows["distance_km"], 0.0)
    flows["priority_score_raw"] = (
        0.31 * flows["price_gap_score"]
        + 0.27 * flows["destination_deficit_score"]
        + 0.23 * flows["origin_surplus_score"]
        + 0.14 * flows["destination_model_score"]
        + 0.10 * flows["destination_anomaly_score"]
        - 0.15 * flows["distance_penalty"]
    )
    flows["priority_score"] = (100 * minmax(flows["priority_score_raw"], 0.0)).round(2)
    flows = flows.sort_values("priority_score", ascending=False).reset_index(drop=True)
    flows["rank"] = np.arange(1, len(flows) + 1)
    flows["top_reasons"] = flows.apply(flow_reasons, axis=1)
    flows["review_action"] = np.where(flows["rank"] <= 10, "review first", "review if capacity allows")
    cols = [
        "rank",
        "commodity",
        "origin_province",
        "destination_province",
        "priority_score",
        "price_gap_score",
        "origin_surplus_score",
        "destination_deficit_score",
        "destination_model_score",
        "distance_km",
        "top_reasons",
        "review_action",
        "origin_price",
        "destination_price",
        "origin_surplus_ton",
        "destination_surplus_ton",
        "origin_region",
        "destination_region",
    ]
    flows[cols].to_csv(DATA_PROCESSED / "flow_recommendations.csv", index=False)
    flows[cols].to_csv(TABLES / "flow_recommendations.csv", index=False)
    return flows[cols]


def flow_reasons(row: pd.Series) -> str:
    reasons = [
        f"selisih harga Rp{row['destination_price'] - row['origin_price']:,.0f}/kg",
        f"asal surplus proxy {row['origin_surplus_ton']/1_000_000:.2f} juta ton",
    ]
    if row["destination_surplus_ton"] < 0:
        reasons.append(f"tujuan defisit proxy {abs(row['destination_surplus_ton'])/1_000_000:.2f} juta ton")
    if row["distance_km"] < 900:
        reasons.append("jarak relatif dekat")
    else:
        reasons.append("perlu kajian logistik lintas wilayah")
    return "; ".join(reasons)


def ranking_stability(latest: pd.DataFrame) -> pd.DataFrame:
    rows = []
    rng = np.random.default_rng(SEED)
    base = latest.sort_values("model_priority_score", ascending=False).head(TOP_K)["province"].tolist()
    for i in range(120):
        noisy = latest.copy()
        noisy["score"] = (
            noisy["model_priority_score"]
            + rng.normal(0, 0.025, len(noisy))
            + rng.normal(0, 0.020, len(noisy)) * noisy["anomaly_score"].fillna(0)
        )
        sample = noisy.sort_values("score", ascending=False).head(TOP_K)["province"].tolist()
        overlap = len(set(base).intersection(sample)) / TOP_K
        rows.append({"bootstrap_id": i + 1, "top10_overlap": overlap})
    df = pd.DataFrame(rows)
    summary = pd.DataFrame(
        [
            {
                "mean_top10_overlap": df["top10_overlap"].mean(),
                "min_top10_overlap": df["top10_overlap"].min(),
                "max_top10_overlap": df["top10_overlap"].max(),
                "runs": len(df),
            }
        ]
    )
    summary.to_csv(TABLES / "ranking_stability.csv", index=False)
    return summary


def subgroup_fairness(latest: pd.DataFrame) -> pd.DataFrame:
    top10 = set(latest.sort_values("model_priority_score", ascending=False).head(TOP_K)["province"])
    rows = []
    for region, group in latest.groupby("region"):
        rows.append(
            {
                "region": region,
                "province_count": len(group),
                "top10_count": int(group["province"].isin(top10).sum()),
                "top10_share": float(group["province"].isin(top10).mean()),
                "avg_priority_score": float(group["model_priority_score"].mean()),
                "avg_deficit_score": float(group["deficit_score"].mean()),
            }
        )
    df = pd.DataFrame(rows).sort_values("avg_priority_score", ascending=False)
    df.to_csv(TABLES / "subgroup_fairness.csv", index=False)
    return df


def case_studies(latest: pd.DataFrame, flows: pd.DataFrame) -> pd.DataFrame:
    selected = latest.sort_values("model_priority_score", ascending=False).head(4)
    rows = []
    for _, row in selected.iterrows():
        flow = flows[flows["destination_province"].eq(row["province"])].head(1)
        candidate_origin = flow["origin_province"].iloc[0] if not flow.empty else "-"
        rows.append(
            {
                "province": row["province"],
                "region": row["region"],
                "price": round(row["price"], 0),
                "deficit_score": round(row["deficit_score"], 3),
                "anomaly_score": round(row["anomaly_score"], 3),
                "recommended_origin": candidate_origin,
                "interpretation": row["top_reasons"],
            }
        )
    df = pd.DataFrame(rows)
    df.to_csv(TABLES / "case_studies.csv", index=False)
    return df


def save_ranking_snapshot(latest: pd.DataFrame) -> pd.DataFrame:
    out = latest[
        [
            "rank",
            "province",
            "region",
            "price",
            "model_priority_score",
            "deficit_score",
            "surplus_score",
            "anomaly_score",
            "national_median_gap",
            "surplus_proxy_ton",
            "top_reasons",
        ]
    ].copy()
    out.to_csv(TABLES / "ranking_snapshot.csv", index=False)
    return out


def plot_outputs(metrics: pd.DataFrame, importance: pd.DataFrame, latest: pd.DataFrame, clusters: pd.DataFrame, flows: pd.DataFrame) -> None:
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})

    fig, ax = plt.subplots(figsize=(8.2, 4.5))
    ordered = metrics.sort_values("ndcg_at_k")
    ax.barh(ordered["model"], ordered["ndcg_at_k"], color=["#9aa5b1", "#8aa6a3", "#6f9ec7", "#427aa1", "#0b6b5f"])
    ax.set_xlabel("NDCG@10")
    ax.set_title("Perbandingan Model Ranking Prioritas")
    ax.grid(axis="x", alpha=0.25)
    fig.tight_layout()
    fig.savefig(FIGURES / "model_comparison.png", dpi=220)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 4.7))
    top = importance.head(12).sort_values("importance")
    ax.barh(top["feature"], top["importance"], color="#0b6b5f")
    ax.set_title("Permutation Feature Importance")
    ax.set_xlabel("Penurunan skor saat fitur diacak")
    ax.grid(axis="x", alpha=0.25)
    fig.tight_layout()
    fig.savefig(FIGURES / "feature_importance.png", dpi=220)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 5))
    scatter = ax.scatter(latest["lon"], latest["lat"], c=latest["model_priority_score"], s=120, cmap="YlOrRd", edgecolor="#1e2a2f", linewidth=0.5)
    for _, row in latest.sort_values("model_priority_score", ascending=False).head(8).iterrows():
        ax.text(row["lon"] + 0.35, row["lat"] + 0.18, row["province"], fontsize=7)
    ax.set_title("Peta Centroid Tekanan Beras PanganFlow.ID")
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.grid(alpha=0.15)
    fig.colorbar(scatter, ax=ax, label="Skor prioritas model")
    fig.tight_layout()
    fig.savefig(FIGURES / "pressure_centroid_map.png", dpi=220)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(7.6, 4.8))
    for label, group in clusters.groupby("cluster_label"):
        ax.scatter(group["pca_x"], group["pca_y"], s=90, label=label, alpha=0.85)
    for _, row in clusters.sort_values("model_priority_score", ascending=False).head(6).iterrows():
        ax.text(row["pca_x"] + 0.05, row["pca_y"] + 0.05, row["province"], fontsize=7)
    ax.set_title("Clustering Provinsi Berdasarkan Harga dan Neraca Beras")
    ax.set_xlabel("PCA-1")
    ax.set_ylabel("PCA-2")
    ax.legend(fontsize=7, loc="best")
    ax.grid(alpha=0.18)
    fig.tight_layout()
    fig.savefig(FIGURES / "cluster_pca.png", dpi=220)
    plt.close(fig)

    top_flows = flows.head(10).copy()
    fig, ax = plt.subplots(figsize=(8.8, 5))
    labels = top_flows["origin_province"] + " -> " + top_flows["destination_province"]
    ax.barh(labels[::-1], top_flows["priority_score"][::-1], color="#145c72")
    ax.set_xlabel("Priority Score")
    ax.set_title("Top-10 Rekomendasi Aliran Beras")
    ax.grid(axis="x", alpha=0.22)
    fig.tight_layout()
    fig.savefig(FIGURES / "top_flow_recommendations.png", dpi=220)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.scatter(latest["lon"], latest["lat"], s=60, color="#d7e2df", edgecolor="#344", linewidth=0.4)
    province_pos = latest.set_index("province")[["lon", "lat"]].to_dict("index")
    for _, row in flows.head(12).iterrows():
        a = province_pos[row["origin_province"]]
        b = province_pos[row["destination_province"]]
        ax.annotate(
            "",
            xy=(b["lon"], b["lat"]),
            xytext=(a["lon"], a["lat"]),
            arrowprops={"arrowstyle": "->", "lw": 1.0 + row["priority_score"] / 80, "color": "#b43b2a", "alpha": 0.65},
        )
    for _, row in latest.sort_values("model_priority_score", ascending=False).head(8).iterrows():
        ax.text(row["lon"] + 0.25, row["lat"] + 0.18, row["province"], fontsize=7)
    ax.set_title("Graph Recommendation: Aliran Surplus ke Defisit")
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.grid(alpha=0.15)
    fig.tight_layout()
    fig.savefig(FIGURES / "flow_network.png", dpi=220)
    plt.close(fig)

    fig = plt.figure(figsize=(10, 6))
    grid = fig.add_gridspec(2, 2, width_ratios=[1.2, 1], height_ratios=[1, 1], hspace=0.35, wspace=0.28)
    ax1 = fig.add_subplot(grid[:, 0])
    sc = ax1.scatter(latest["lon"], latest["lat"], c=latest["model_priority_score"], s=90, cmap="YlOrRd", edgecolor="#1f2933", linewidth=0.4)
    ax1.set_title("Tekanan Beras Nasional")
    ax1.set_xticks([])
    ax1.set_yticks([])
    fig.colorbar(sc, ax=ax1, fraction=0.04, label="Priority")
    ax2 = fig.add_subplot(grid[0, 1])
    ax2.barh(latest.sort_values("model_priority_score").tail(6)["province"], latest.sort_values("model_priority_score").tail(6)["model_priority_score"], color="#0b6b5f")
    ax2.set_title("Top Provinsi Tujuan")
    ax3 = fig.add_subplot(grid[1, 1])
    ax3.barh((flows.head(5)["origin_province"] + " -> " + flows.head(5)["destination_province"])[::-1], flows.head(5)["priority_score"][::-1], color="#b43b2a")
    ax3.set_title("Top Flow")
    fig.suptitle("PanganFlow.ID Dashboard Preview", fontsize=14, weight="bold")
    fig.tight_layout()
    fig.savefig(FIGURES / "dashboard_preview.png", dpi=220)
    plt.close(fig)


def save_model_card(panel: pd.DataFrame, train: pd.DataFrame, test: pd.DataFrame, metrics: pd.DataFrame, flows: pd.DataFrame) -> None:
    card = {
        "model_name": "PanganFlow.ID weighted-index calibrated RandomForest ranker",
        "task": "Province-level rice monitoring priority and interprovincial flow scoring",
        "training_rows": int(len(train)),
        "test_rows": int(len(test)),
        "date_min": str(panel["date"].min().date()),
        "date_max": str(panel["date"].max().date()),
        "test_month_min": str(test["date"].min().date()),
        "test_month_max": str(test["date"].max().date()),
        "top_k": TOP_K,
        "best_model_metrics": metrics[metrics["model"].eq("PanganFlow hybrid model")].iloc[0].to_dict(),
        "flow_candidates": int(len(flows)),
        "limitations": [
            "Surplus-deficit is a proxy from annual production and consumption assumptions.",
            "Flow score is a policy-review prioritization score, not a final logistics optimization.",
            "BI daily price endpoint is attempted but Bapanas monthly data is used when coverage is more stable.",
        ],
    }
    (TABLES / "model_card.json").write_text(json.dumps(card, indent=2, ensure_ascii=False), encoding="utf-8")


def train_pipeline() -> None:
    ensure_dirs()
    panel = load_panel()
    train, test = temporal_split(panel)
    model, scored_test, metrics = evaluate_models(train, test)
    ablation = run_ablation(train, test)
    importance = feature_importance(model, test)
    latest = latest_predictions(panel, model)
    ranking = save_ranking_snapshot(latest)
    clusters = build_clusters(latest)
    flows = build_flow_recommendations(latest)
    stability = ranking_stability(latest)
    fairness = subgroup_fairness(latest)
    cases = case_studies(latest, flows)

    metrics.to_csv(TABLES / "metrics_summary.csv", index=False)
    scored_test.to_csv(TABLES / "test_scored_panel.csv", index=False)
    ablation.to_csv(TABLES / "feature_ablation.csv", index=False)
    importance.to_csv(TABLES / "feature_importance.csv", index=False)
    plot_outputs(metrics, importance, latest, clusters, flows)
    save_model_card(panel, train, test, metrics, flows)
    validation_rows = [
        {"check": "flow_no_self_pairs", "status": "pass" if (flows["origin_province"] != flows["destination_province"]).all() else "fail", "value": int((flows["origin_province"] == flows["destination_province"]).sum())},
        {"check": "flow_origin_surplus_positive", "status": "pass" if (flows["origin_surplus_ton"] > 0).all() else "fail", "value": int((flows["origin_surplus_ton"] <= 0).sum())},
        {"check": "ranking_snapshot_rows", "status": "pass" if len(ranking) >= 34 else "review", "value": len(ranking)},
        {"check": "stability_mean_top10_overlap", "status": "pass" if stability["mean_top10_overlap"].iloc[0] >= 0.7 else "review", "value": round(float(stability["mean_top10_overlap"].iloc[0]), 3)},
        {"check": "case_studies_generated", "status": "pass" if len(cases) >= 3 else "review", "value": len(cases)},
        {"check": "subgroup_fairness_regions", "status": "pass" if fairness["region"].nunique() >= 5 else "review", "value": int(fairness["region"].nunique())},
    ]
    existing = pd.read_csv(TABLES / "validation_checks.csv") if (TABLES / "validation_checks.csv").exists() else pd.DataFrame()
    pd.concat([existing, pd.DataFrame(validation_rows)], ignore_index=True).to_csv(TABLES / "validation_checks.csv", index=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train PanganFlow.ID ranking and flow recommendation models.")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()
    train_pipeline()
    if not args.quiet:
        metrics = pd.read_csv(TABLES / "metrics_summary.csv")
        flows = pd.read_csv(TABLES / "flow_recommendations.csv")
        print(metrics.to_string(index=False))
        print(f"Top flow: {flows.iloc[0]['origin_province']} -> {flows.iloc[0]['destination_province']} ({flows.iloc[0]['priority_score']})")


if __name__ == "__main__":
    main()
