from __future__ import annotations

import json
import math
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA_PROCESSED = ROOT / "data" / "processed"
TABLES = ROOT / "reports" / "tables"
FIGURES = ROOT / "reports" / "figures"
DASHBOARD = ROOT / "dashboard"

FEATURE_COLUMNS = [
    "nutrition_need",
    "coverage_gap",
    "food_vulnerability",
    "socioeconomic_stress",
    "price_stress",
    "sppg_density_per_100k_beneficiaries",
    "condition_rate_per_1000",
    "allergy_intolerance_rate_per_1000",
    "beneficiaries_per_satpen",
    "support_reach",
]

FEATURE_FAMILIES = {
    "Nutrition": ["nutrition_need", "condition_rate_per_1000", "allergy_intolerance_rate_per_1000"],
    "Coverage": ["coverage_gap", "support_reach", "sppg_density_per_100k_beneficiaries", "beneficiaries_per_satpen"],
    "Food system": ["food_vulnerability", "price_stress"],
    "Socioeconomic": ["socioeconomic_stress"],
}

REASON_COLUMNS = {
    "nutrition_need": "kebutuhan gizi/karakteristik peserta tinggi",
    "coverage_gap": "gap cakupan dan dukungan tinggi",
    "food_vulnerability": "kerentanan pangan struktural tinggi",
    "socioeconomic_stress": "tekanan sosial-ekonomi tinggi",
    "price_stress": "tekanan harga pangan tinggi",
    "sppg_density_per_100k_beneficiaries": "kepadatan SPPG rendah relatif terhadap penerima",
}


def ensure_dirs() -> None:
    for path in [TABLES, FIGURES, DASHBOARD]:
        path.mkdir(parents=True, exist_ok=True)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def sigmoid(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, -30, 30)
    return 1 / (1 + np.exp(-x))


def standardize(train: np.ndarray, test: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    mean = train.mean(axis=0)
    std = train.std(axis=0)
    std[std == 0] = 1
    return (train - mean) / std, (test - mean) / std, mean, std


@dataclass
class Stump:
    feature_idx: int
    threshold: float
    left_value: float
    right_value: float
    gain: float


class StumpBoostRanker:
    def __init__(self, n_estimators: int = 90, learning_rate: float = 0.08, quantiles: int = 12) -> None:
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.quantiles = quantiles
        self.init_logit = 0.0
        self.stumps: list[Stump] = []

    def fit(self, x: np.ndarray, y: np.ndarray) -> "StumpBoostRanker":
        y = y.astype(float)
        pos = np.clip(y.mean(), 1e-4, 1 - 1e-4)
        self.init_logit = float(np.log(pos / (1 - pos)))
        logits = np.full(len(y), self.init_logit, dtype=float)
        self.stumps = []

        for _ in range(self.n_estimators):
            pred = sigmoid(logits)
            residual = y - pred
            base_mse = float(np.mean(residual**2))
            best: Stump | None = None
            best_mse = base_mse
            for j in range(x.shape[1]):
                values = x[:, j]
                thresholds = np.unique(np.quantile(values, np.linspace(0.08, 0.92, self.quantiles)))
                for threshold in thresholds:
                    left = values <= threshold
                    right = ~left
                    if left.sum() < 8 or right.sum() < 8:
                        continue
                    left_value = float(residual[left].mean())
                    right_value = float(residual[right].mean())
                    stump_pred = np.where(left, left_value, right_value)
                    mse = float(np.mean((residual - stump_pred) ** 2))
                    if mse < best_mse:
                        best_mse = mse
                        best = Stump(j, float(threshold), left_value, right_value, base_mse - mse)
            if best is None or best.gain <= 1e-8:
                break
            self.stumps.append(best)
            logits += self.learning_rate * np.where(x[:, best.feature_idx] <= best.threshold, best.left_value, best.right_value)
        return self

    def predict_proba(self, x: np.ndarray) -> np.ndarray:
        logits = np.full(x.shape[0], self.init_logit, dtype=float)
        for stump in self.stumps:
            logits += self.learning_rate * np.where(x[:, stump.feature_idx] <= stump.threshold, stump.left_value, stump.right_value)
        return sigmoid(logits)

    def feature_importance(self, feature_names: list[str]) -> pd.DataFrame:
        gains = {name: 0.0 for name in feature_names}
        for stump in self.stumps:
            gains[feature_names[stump.feature_idx]] += max(stump.gain, 0)
        total = sum(gains.values()) or 1
        return (
            pd.DataFrame({"feature": list(gains), "importance": [value / total for value in gains.values()]})
            .sort_values("importance", ascending=False)
            .reset_index(drop=True)
        )

    def to_dict(self, feature_names: list[str], mean: np.ndarray, std: np.ndarray) -> dict[str, Any]:
        return {
            "model": "NumPy logistic gradient boosting with decision stumps",
            "n_estimators_requested": self.n_estimators,
            "n_estimators_fit": len(self.stumps),
            "learning_rate": self.learning_rate,
            "init_logit": self.init_logit,
            "feature_names": feature_names,
            "feature_mean": mean.tolist(),
            "feature_std": std.tolist(),
            "stumps": [stump.__dict__ for stump in self.stumps],
        }


def precision_recall_at_k(y: np.ndarray, scores: np.ndarray, k: int) -> tuple[float, float]:
    order = np.argsort(-scores)[:k]
    hits = y[order].sum()
    precision = hits / max(k, 1)
    recall = hits / max(y.sum(), 1)
    return float(precision), float(recall)


def ndcg_at_k(relevance: np.ndarray, scores: np.ndarray, k: int) -> float:
    order = np.argsort(-scores)[:k]
    gains = (2 ** relevance[order] - 1) / np.log2(np.arange(2, k + 2))
    ideal_order = np.argsort(-relevance)[:k]
    ideal = (2 ** relevance[ideal_order] - 1) / np.log2(np.arange(2, k + 2))
    denom = ideal.sum()
    return float(gains.sum() / denom) if denom > 0 else 0.0


def brier(y: np.ndarray, prob: np.ndarray) -> float:
    return float(np.mean((prob - y) ** 2))


def evaluate(y: np.ndarray, relevance: np.ndarray, scores: np.ndarray, k: int) -> dict[str, float]:
    p, r = precision_recall_at_k(y, scores, k)
    prevalence = float(y.mean())
    return {
        "NDCG@K": ndcg_at_k(relevance, scores, k),
        "Precision@K": p,
        "Recall@K": r,
        "Lift@K": p / prevalence if prevalence > 0 else 0,
        "Brier": brier(y, np.clip(scores, 0, 1)),
    }


def holdout_by_province(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    provinces = sorted(df["province"].unique())
    validation_provinces = set(provinces[::4])
    validation = df["province"].isin(validation_provinces).to_numpy()
    train = ~validation
    if validation.sum() < 40 or train.sum() < 100:
        rng = np.random.default_rng(42)
        idx = np.arange(len(df))
        rng.shuffle(idx)
        split = int(len(df) * 0.75)
        train = np.zeros(len(df), dtype=bool)
        train[idx[:split]] = True
        validation = ~train
    return train, validation


def top_reasons(row: pd.Series, normalized_reason_frame: pd.DataFrame) -> str:
    values = normalized_reason_frame.loc[row.name, list(REASON_COLUMNS)]
    ordered = values.sort_values(ascending=False)
    return "; ".join(REASON_COLUMNS[col] for col in ordered.index[:3])


def wrap(draw: ImageDraw.ImageDraw, text: str, width: int, fnt: ImageFont.ImageFont) -> list[str]:
    lines: list[str] = []
    for paragraph in str(text).split("\n"):
        words = paragraph.split()
        current = ""
        for word in words:
            trial = (current + " " + word).strip()
            if draw.textlength(trial, font=fnt) <= width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def draw_bar_chart(path: Path, title: str, labels: list[str], values: list[float], color: str = "#22577a", suffix: str = "") -> None:
    w, h = 1400, 850
    img = Image.new("RGB", (w, h), "#f8faf9")
    d = ImageDraw.Draw(img)
    title_font = font(40, True)
    body_font = font(24)
    small_font = font(19)
    d.text((70, 50), title, fill="#17324d", font=title_font)
    left, top, right, bottom = 330, 130, 1290, 770
    max_value = max(values) if values else 1
    bar_h = max(28, int((bottom - top) / max(len(labels), 1) * 0.58))
    gap = int((bottom - top) / max(len(labels), 1))
    for i, (label, value) in enumerate(zip(labels, values)):
        y = top + i * gap
        d.text((70, y + 5), label[:30], fill="#22313a", font=body_font)
        bar_w = int((right - left) * (value / max_value)) if max_value else 0
        d.rounded_rectangle((left, y, left + bar_w, y + bar_h), radius=8, fill=color)
        d.text((left + bar_w + 12, y + 4), f"{value:.3f}{suffix}", fill="#22313a", font=small_font)
    d.line((left, bottom + 10, right, bottom + 10), fill="#a7b7c2", width=2)
    img.save(path)


def draw_scatter(path: Path, df: pd.DataFrame) -> None:
    w, h = 1300, 850
    img = Image.new("RGB", (w, h), "#f8faf9")
    d = ImageDraw.Draw(img)
    d.text((70, 45), "Quadrant Risiko: Nutrition Need vs Coverage Gap", fill="#17324d", font=font(38, True))
    left, top, right, bottom = 120, 130, 1170, 750
    d.rectangle((left, top, right, bottom), outline="#9fb2bf", width=2)
    d.line(((left + right) // 2, top, (left + right) // 2, bottom), fill="#d6dee4", width=2)
    d.line((left, (top + bottom) // 2, right, (top + bottom) // 2), fill="#d6dee4", width=2)
    d.text((left, bottom + 25), "Coverage gap rendah", fill="#43545f", font=font(20))
    d.text((right - 210, bottom + 25), "Coverage gap tinggi", fill="#43545f", font=font(20))
    d.text((35, top - 4), "Need tinggi", fill="#43545f", font=font(20))
    d.text((35, bottom - 20), "Need rendah", fill="#43545f", font=font(20))
    top10 = set(df.nlargest(10, "final_priority_score").index)
    for idx, row in df.iterrows():
        x = left + int(float(row["coverage_gap"]) * (right - left))
        y = bottom - int(float(row["nutrition_need"]) * (bottom - top))
        radius = 8 if idx in top10 else 4
        fill = "#d1495b" if idx in top10 else "#2a9d8f"
        d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill, outline="white")
    for _, row in df.nlargest(5, "final_priority_score").iterrows():
        x = left + int(float(row["coverage_gap"]) * (right - left))
        y = bottom - int(float(row["nutrition_need"]) * (bottom - top))
        d.text((x + 10, y - 8), str(row["district"])[:24], fill="#17202a", font=font(16, True))
    img.save(path)


def draw_dashboard_preview(path: Path, ranking: pd.DataFrame, metrics: pd.DataFrame) -> None:
    w, h = 1500, 950
    img = Image.new("RGB", (w, h), "#f4f7f5")
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((40, 35, 1460, 150), radius=16, fill="#12343b")
    d.text((75, 65), "MBGWatch - GiziRank Priority Queue", fill="white", font=font(38, True))
    d.text((75, 112), "District-level monitoring support, not individual/kitchen risk labeling", fill="#d9e8df", font=font(20))
    cards = [
        ("Districts", f"{len(ranking):,}"),
        ("Top-K precision", f"{metrics.loc[metrics['model']=='StumpBoost Ranker','Precision@K'].iloc[0]:.2f}"),
        ("NDCG@K", f"{metrics.loc[metrics['model']=='StumpBoost Ranker','NDCG@K'].iloc[0]:.2f}"),
        ("Lift@K", f"{metrics.loc[metrics['model']=='StumpBoost Ranker','Lift@K'].iloc[0]:.1f}x"),
    ]
    for i, (label, value) in enumerate(cards):
        x = 50 + i * 360
        d.rounded_rectangle((x, 180, x + 320, 300), radius=12, fill="white", outline="#d7e1dc")
        d.text((x + 25, 205), label, fill="#50616a", font=font(19))
        d.text((x + 25, 235), value, fill="#12343b", font=font(38, True))
    d.rounded_rectangle((50, 335, 900, 890), radius=12, fill="white", outline="#d7e1dc")
    d.text((80, 365), "Top Priority Districts", fill="#12343b", font=font(28, True))
    y = 420
    for _, row in ranking.head(10).iterrows():
        d.text((80, y), f"{int(row['rank']):02d}", fill="#d1495b", font=font(22, True))
        d.text((130, y), f"{row['district']}, {row['province']}", fill="#1d2b2f", font=font(22, True))
        d.text((650, y), f"{row['final_priority_score']:.3f}", fill="#1d2b2f", font=font(22))
        y += 45
    d.rounded_rectangle((930, 335, 1450, 890), radius=12, fill="white", outline="#d7e1dc")
    d.text((960, 365), "Why Scores Move", fill="#12343b", font=font(28, True))
    top = ranking.iloc[0]
    y = 420
    for label, value in [
        ("Nutrition need", top["nutrition_need"]),
        ("Coverage gap", top["coverage_gap"]),
        ("Food vulnerability", top["food_vulnerability"]),
        ("Socioeconomic stress", top["socioeconomic_stress"]),
        ("Price stress", top["price_stress"]),
    ]:
        d.text((960, y), label, fill="#30464f", font=font(20))
        bar_w = int(380 * float(value))
        d.rounded_rectangle((960, y + 28, 1340, y + 48), radius=7, fill="#e8efeb")
        d.rounded_rectangle((960, y + 28, 960 + bar_w, y + 48), radius=7, fill="#2a9d8f")
        d.text((1360, y + 22), f"{float(value):.2f}", fill="#30464f", font=font(18))
        y += 85
    img.save(path)


def build_static_dashboard_html(ranking: pd.DataFrame, metrics: pd.DataFrame) -> None:
    top_rows = "\n".join(
        f"<tr><td>{int(r.rank)}</td><td>{r.district}</td><td>{r.province}</td><td>{r.final_priority_score:.3f}</td><td>{r.top_reasons}</td></tr>"
        for r in ranking.head(30).itertuples()
    )
    model = metrics[metrics["model"] == "StumpBoost Ranker"].iloc[0]
    html = f"""<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>MBGWatch Static Preview</title>
  <style>
    body {{ margin:0; font-family: Georgia, 'Times New Roman', serif; background:#f4f7f5; color:#193238; }}
    header {{ background:#12343b; color:white; padding:30px 46px; }}
    h1 {{ margin:0; font-size:38px; letter-spacing:0; }}
    .sub {{ color:#d9e8df; margin-top:8px; }}
    .cards {{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; padding:24px 46px; }}
    .card {{ background:white; border:1px solid #d7e1dc; border-radius:8px; padding:18px; }}
    .label {{ color:#5b6d72; font-size:14px; }}
    .value {{ font-size:34px; font-weight:700; margin-top:6px; }}
    main {{ padding:0 46px 46px; }}
    table {{ border-collapse:collapse; width:100%; background:white; border:1px solid #d7e1dc; }}
    th,td {{ padding:10px 12px; border-bottom:1px solid #e3ebe7; text-align:left; vertical-align:top; }}
    th {{ background:#e9f1ed; }}
  </style>
</head>
<body>
  <header><h1>MBGWatch - GiziRank Priority Queue</h1><div class="sub">District-level monitoring support, not individual/kitchen risk labeling.</div></header>
  <section class="cards">
    <div class="card"><div class="label">Districts</div><div class="value">{len(ranking):,}</div></div>
    <div class="card"><div class="label">Precision@K</div><div class="value">{model['Precision@K']:.2f}</div></div>
    <div class="card"><div class="label">NDCG@K</div><div class="value">{model['NDCG@K']:.2f}</div></div>
    <div class="card"><div class="label">Lift@K</div><div class="value">{model['Lift@K']:.1f}x</div></div>
  </section>
  <main>
    <table>
      <thead><tr><th>Rank</th><th>District</th><th>Province</th><th>Score</th><th>Top Reasons</th></tr></thead>
      <tbody>{top_rows}</tbody>
    </table>
  </main>
</body>
</html>
"""
    (DASHBOARD / "static_preview.html").write_text(html, encoding="utf-8")


def main() -> int:
    ensure_dirs()
    panel_path = DATA_PROCESSED / "district_panel.csv"
    if not panel_path.exists():
        raise FileNotFoundError(f"Run build_dataset.py first: {panel_path}")
    df = pd.read_csv(panel_path)
    df = df.drop_duplicates(subset=["region_code", "year_month"]).reset_index(drop=True)

    feature_frame = df[FEATURE_COLUMNS].apply(pd.to_numeric, errors="coerce")
    feature_frame = feature_frame.fillna(feature_frame.median(numeric_only=True)).fillna(0)
    target = df["priority_label"].astype(int).to_numpy()
    relevance = df["reference_priority_score"].rank(pct=True).to_numpy()
    train_mask, val_mask = holdout_by_province(df)
    x_train_raw = feature_frame.loc[train_mask].to_numpy(dtype=float)
    x_val_raw = feature_frame.loc[val_mask].to_numpy(dtype=float)
    y_train = target[train_mask]
    y_val = target[val_mask]
    relevance_val = relevance[val_mask]
    x_train, x_val, mean, std = standardize(x_train_raw, x_val_raw)

    model = StumpBoostRanker().fit(x_train, y_train)
    model_scores_val = model.predict_proba(x_val)
    rng = np.random.default_rng(42)
    k = max(10, int(math.ceil(len(y_val) * 0.10)))
    random_metrics = []
    for _ in range(100):
        random_metrics.append(evaluate(y_val, relevance_val, rng.random(len(y_val)), k))
    random_avg = {key: float(np.mean([m[key] for m in random_metrics])) for key in random_metrics[0]}

    weighted_val = (
        0.35 * df.loc[val_mask, "nutrition_need"].to_numpy()
        + 0.25 * df.loc[val_mask, "food_vulnerability"].to_numpy()
        + 0.25 * df.loc[val_mask, "socioeconomic_stress"].to_numpy()
        + 0.15 * df.loc[val_mask, "price_stress"].to_numpy()
    )
    model_eval = evaluate(y_val, relevance_val, model_scores_val, k)
    weighted_eval = evaluate(y_val, relevance_val, weighted_val, k)
    metrics = pd.DataFrame(
        [
            {"model": "Random baseline", **random_avg},
            {"model": "Weighted index baseline", **weighted_eval},
            {"model": "StumpBoost Ranker", **model_eval},
        ]
    )
    metrics.to_csv(TABLES / "metrics_summary.csv", index=False)

    # Fit final model on all data for final ranking.
    x_all_raw = feature_frame.to_numpy(dtype=float)
    x_all, _, mean_all, std_all = standardize(x_all_raw, x_all_raw)
    final_model = StumpBoostRanker().fit(x_all, target)
    df["model_priority_score"] = final_model.predict_proba(x_all)
    df["weighted_index_score"] = (
        0.35 * df["nutrition_need"]
        + 0.25 * df["food_vulnerability"]
        + 0.25 * df["socioeconomic_stress"]
        + 0.15 * df["price_stress"]
    )
    df["final_priority_score"] = 0.65 * df["model_priority_score"] + 0.35 * df["reference_priority_score"]
    df = df.sort_values("final_priority_score", ascending=False).reset_index(drop=True)
    df["rank"] = np.arange(1, len(df) + 1)

    normalized_reasons = df[list(REASON_COLUMNS)].copy()
    normalized_reasons["sppg_density_per_100k_beneficiaries"] = 1 - (
        (normalized_reasons["sppg_density_per_100k_beneficiaries"] - normalized_reasons["sppg_density_per_100k_beneficiaries"].min())
        / (normalized_reasons["sppg_density_per_100k_beneficiaries"].max() - normalized_reasons["sppg_density_per_100k_beneficiaries"].min() + 1e-9)
    )
    for col in [c for c in normalized_reasons.columns if c != "sppg_density_per_100k_beneficiaries"]:
        vals = pd.to_numeric(normalized_reasons[col], errors="coerce").fillna(0)
        normalized_reasons[col] = (vals - vals.min()) / (vals.max() - vals.min() + 1e-9)
    df["top_reasons"] = df.apply(lambda row: top_reasons(row, normalized_reasons), axis=1)

    ranking_cols = [
        "rank",
        "region_code",
        "province",
        "district",
        "final_priority_score",
        "model_priority_score",
        "reference_priority_score",
        "coverage_gap",
        "nutrition_need",
        "food_vulnerability",
        "socioeconomic_stress",
        "price_stress",
        "sppg_operational_count",
        "mbg_beneficiaries",
        "top_reasons",
    ]
    ranking = df[ranking_cols]
    ranking.to_csv(TABLES / "ranking_snapshot.csv", index=False)

    importance = final_model.feature_importance(FEATURE_COLUMNS)
    importance["family"] = importance["feature"].map({feature: family for family, feats in FEATURE_FAMILIES.items() for feature in feats})
    importance.to_csv(TABLES / "feature_importance.csv", index=False)
    with (TABLES / "model_card.json").open("w", encoding="utf-8") as handle:
        json.dump(final_model.to_dict(FEATURE_COLUMNS, mean_all, std_all), handle, ensure_ascii=False, indent=2)

    ablation_rows = []
    for family, family_features in FEATURE_FAMILIES.items():
        kept = [feature for feature in FEATURE_COLUMNS if feature not in family_features]
        kept_idx = [FEATURE_COLUMNS.index(feature) for feature in kept]
        x_tr = x_train[:, kept_idx]
        x_va = x_val[:, kept_idx]
        ab_model = StumpBoostRanker(n_estimators=70).fit(x_tr, y_train)
        ab_eval = evaluate(y_val, relevance_val, ab_model.predict_proba(x_va), k)
        ablation_rows.append({"removed_family": family, **ab_eval})
    ablation = pd.DataFrame(ablation_rows).sort_values("NDCG@K")
    ablation.to_csv(TABLES / "feature_ablation.csv", index=False)

    subgroup_rows = []
    scored = df.copy()
    scored["top_k_pred"] = (scored["rank"] <= max(10, int(math.ceil(len(scored) * 0.10)))).astype(int)
    for group_name, mask in {
        "Java": scored["is_java"] == 1,
        "Non-Java": scored["is_java"] == 0,
        "Eastern Indonesia": scored["is_eastern_indonesia"] == 1,
        "Western/Central Indonesia": scored["is_eastern_indonesia"] == 0,
        "Higher-data districts": scored["data_density_group"] == "higher-data",
        "Lower-data districts": scored["data_density_group"] == "lower-data",
    }.items():
        subset = scored[mask]
        if len(subset) == 0:
            continue
        subgroup_rows.append(
            {
                "group": group_name,
                "districts": len(subset),
                "mean_score": subset["final_priority_score"].mean(),
                "top10_share": subset["top_k_pred"].mean(),
                "mean_data_completeness": subset["data_completeness"].mean(),
            }
        )
    pd.DataFrame(subgroup_rows).to_csv(TABLES / "subgroup_fairness.csv", index=False)

    case_studies = ranking.head(5).copy()
    case_studies["case_note"] = case_studies.apply(
        lambda row: (
            f"{row['district']} masuk Top-5 karena {row['top_reasons']}. "
            f"Skor gap={row['coverage_gap']:.2f}, need={row['nutrition_need']:.2f}, "
            f"kerentanan pangan={row['food_vulnerability']:.2f}."
        ),
        axis=1,
    )
    case_studies.to_csv(TABLES / "case_studies.csv", index=False)

    # Bootstrap stability: overlap of Top-20 against noisy score perturbations.
    base_top = set(ranking.head(20)["region_code"].astype(str))
    overlaps = []
    for seed in range(200):
        noise = np.random.default_rng(seed).normal(0, 0.025, len(df))
        order = df.assign(noisy=df["final_priority_score"] + noise).sort_values("noisy", ascending=False).head(20)
        overlaps.append(len(base_top & set(order["region_code"].astype(str))) / 20)
    pd.DataFrame([{"bootstrap_top20_overlap_mean": float(np.mean(overlaps)), "bootstrap_top20_overlap_p10": float(np.quantile(overlaps, 0.1))}]).to_csv(
        TABLES / "ranking_stability.csv", index=False
    )

    draw_bar_chart(
        FIGURES / "model_comparison.png",
        "Model Comparison on Province Holdout",
        metrics["model"].tolist(),
        metrics["NDCG@K"].tolist(),
        color="#2a9d8f",
    )
    draw_bar_chart(
        FIGURES / "top_priority_districts.png",
        "Top Priority Districts",
        [f"{row.district}, {row.province}" for row in ranking.head(12).itertuples()],
        ranking.head(12)["final_priority_score"].tolist(),
        color="#d1495b",
    )
    draw_bar_chart(
        FIGURES / "feature_importance.png",
        "Feature Importance - StumpBoost Ranker",
        importance["feature"].head(10).tolist(),
        importance["importance"].head(10).tolist(),
        color="#22577a",
    )
    fairness = pd.read_csv(TABLES / "subgroup_fairness.csv")
    draw_bar_chart(
        FIGURES / "subgroup_top10_share.png",
        "TransferRisk Check: Top-K Share by Group",
        fairness["group"].tolist(),
        fairness["top10_share"].tolist(),
        color="#6a994e",
    )
    draw_scatter(FIGURES / "risk_quadrant.png", df)
    draw_dashboard_preview(FIGURES / "dashboard_preview.png", ranking, metrics)
    build_static_dashboard_html(ranking, metrics)

    print(f"Wrote ranking snapshot to {TABLES / 'ranking_snapshot.csv'}")
    print(f"Wrote metrics, ablation, fairness, and figures to {ROOT / 'reports'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
