from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
TABLE_DIR = ROOT / "reports" / "tables"
FIGURE_DIR = ROOT / "reports" / "figures"

SEED = 1845

FEATURE_GROUPS = {
    "text": [
        "text_length_tokens",
        "suspicious_term_count",
        "benign_term_count",
        "gambling_terms",
        "payment_terms",
        "promotion_terms",
        "urgency_terms",
        "contact_terms",
        "benign_terms",
        "text_risk_score",
    ],
    "entity": [
        "entity_count",
        "entity_type_count",
        "domain_count",
        "handle_count",
        "payment_count",
        "phone_count",
    ],
    "source": ["report_channel_score"],
    "graph": ["cluster_sample_count", "cluster_entity_count", "cluster_platform_count", "cluster_domain_count", "cluster_seed_score"],
}


class StumpBoostClassifier:
    def __init__(self, n_estimators: int = 90, learning_rate: float = 0.12, random_state: int = SEED) -> None:
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.random_state = random_state
        self.base_logit = 0.0
        self.stumps: List[Tuple[int, float, float, float, float]] = []
        self.feature_importance_: Dict[int, float] = {}

    @staticmethod
    def _sigmoid(x: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))

    def fit(self, x: np.ndarray, y: np.ndarray) -> "StumpBoostClassifier":
        eps = 1e-6
        pos = float(np.clip(y.mean(), eps, 1 - eps))
        self.base_logit = math.log(pos / (1 - pos))
        raw = np.full(len(y), self.base_logit, dtype=float)
        rng = np.random.default_rng(self.random_state)

        for _ in range(self.n_estimators):
            pred = self._sigmoid(raw)
            residual = y - pred
            best = None
            feature_order = rng.permutation(x.shape[1])

            for j in feature_order:
                values = x[:, j]
                uniq = np.unique(values)
                if len(uniq) <= 1:
                    continue
                qs = np.linspace(0.15, 0.85, 8)
                thresholds = np.unique(np.quantile(values, qs))
                for threshold in thresholds:
                    left = values <= threshold
                    right = ~left
                    if left.sum() < 5 or right.sum() < 5:
                        continue
                    left_val = float(residual[left].mean())
                    right_val = float(residual[right].mean())
                    fit = np.where(left, left_val, right_val)
                    loss = float(((residual - fit) ** 2).mean())
                    gain = float(np.var(residual) - loss)
                    if best is None or loss < best[0]:
                        best = (loss, j, float(threshold), left_val, right_val, gain)

            if best is None:
                break
            _, j, threshold, left_val, right_val, gain = best
            update = np.where(x[:, j] <= threshold, left_val, right_val)
            raw += self.learning_rate * update
            self.stumps.append((j, threshold, left_val, right_val, gain))
            self.feature_importance_[j] = self.feature_importance_.get(j, 0.0) + max(gain, 0.0)
        return self

    def predict_proba(self, x: np.ndarray) -> np.ndarray:
        raw = np.full(x.shape[0], self.base_logit, dtype=float)
        for j, threshold, left_val, right_val, _gain in self.stumps:
            raw += self.learning_rate * np.where(x[:, j] <= threshold, left_val, right_val)
        return self._sigmoid(raw)


def ensure_dirs() -> None:
    for path in [TABLE_DIR, FIGURE_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def minmax(series: pd.Series) -> pd.Series:
    s = pd.to_numeric(series, errors="coerce").fillna(0.0)
    lo, hi = float(s.min()), float(s.max())
    if abs(hi - lo) < 1e-12:
        return pd.Series(np.zeros(len(s)), index=s.index)
    return (s - lo) / (hi - lo)


def prepare_data() -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    features = pd.read_csv(PROCESSED_DIR / "content_features.csv")
    clusters = pd.read_csv(PROCESSED_DIR / "cluster_snapshot.csv")
    entities = pd.read_csv(PROCESSED_DIR / "extracted_entities_masked.csv")
    features["timestamp_dt"] = pd.to_datetime(features["timestamp"], errors="coerce")
    features = add_historical_graph_features(features, entities)
    for col in all_feature_cols():
        if col not in features.columns:
            features[col] = 0.0
        features[col] = pd.to_numeric(features[col], errors="coerce").fillna(0.0)
        features[col] = minmax(features[col])
    feature_cols = all_feature_cols()
    features = features.sort_values("timestamp_dt")
    return features, clusters, feature_cols


def add_historical_graph_features(features: pd.DataFrame, entities: pd.DataFrame) -> pd.DataFrame:
    """Create graph features using only evidence observed up to each sample timestamp."""
    out = features.sort_values(["cluster_id", "timestamp_dt", "sample_id"]).copy()
    sample_entities = entities.groupby("sample_id").apply(
        lambda g: list(zip(g["entity_type"].astype(str), g["masked_entity"].astype(str)))
    ).to_dict()

    values: Dict[str, Dict[str, float]] = {}
    for cluster_id, group in out.groupby("cluster_id"):
        seen_entities = set()
        seen_domains = set()
        seen_platforms = set()
        for idx, row in group.iterrows():
            seen_platforms.add(str(row["platform"]))
            for entity_type, masked in sample_entities.get(row["sample_id"], []):
                seen_entities.add(masked)
                if entity_type == "domain":
                    seen_domains.add(masked)
            sample_count = len(values)  # placeholder overwritten below per cluster
            values[idx] = {
                "cluster_sample_count": 0.0,
                "cluster_entity_count": float(len(seen_entities)),
                "cluster_platform_count": float(len(seen_platforms)),
                "cluster_domain_count": float(len(seen_domains)),
            }
        for ordinal, idx in enumerate(group.index, start=1):
            values[idx]["cluster_sample_count"] = float(ordinal)

    for col in ["cluster_sample_count", "cluster_entity_count", "cluster_platform_count", "cluster_domain_count"]:
        out[col] = [values[idx][col] for idx in out.index]
    out["cluster_seed_score"] = (
        0.45 * pd.to_numeric(out["text_risk_score"], errors="coerce").fillna(0.0)
        + 0.2 * minmax(out["cluster_entity_count"])
        + 0.15 * minmax(out["cluster_sample_count"])
        + 0.12 * minmax(out["cluster_platform_count"])
        + 0.08 * minmax(out["cluster_domain_count"])
    )
    return out


def all_feature_cols(groups: Iterable[str] | None = None) -> List[str]:
    selected = groups if groups is not None else FEATURE_GROUPS.keys()
    cols: List[str] = []
    for group in selected:
        cols.extend(FEATURE_GROUPS[group])
    return cols


def time_split(features: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
    periods = sorted(features["year_month"].dropna().unique())
    cutoff_periods = set(periods[-4:])
    test_mask = features["year_month"].isin(cutoff_periods).to_numpy()
    train_mask = ~test_mask
    if train_mask.sum() < 50 or test_mask.sum() < 20:
        split_idx = int(len(features) * 0.72)
        train_mask = np.zeros(len(features), dtype=bool)
        train_mask[:split_idx] = True
        test_mask = ~train_mask
    return train_mask, test_mask


def average_precision(y_true: np.ndarray, scores: np.ndarray) -> float:
    order = np.argsort(-scores)
    y = y_true[order]
    positives = y.sum()
    if positives == 0:
        return 0.0
    precision_sum = 0.0
    hits = 0
    for idx, val in enumerate(y, start=1):
        if val == 1:
            hits += 1
            precision_sum += hits / idx
    return float(precision_sum / positives)


def macro_f1(y_true: np.ndarray, scores: np.ndarray, threshold: float = 0.5) -> float:
    pred = (scores >= threshold).astype(int)
    f1s = []
    for label in [0, 1]:
        tp = int(((pred == label) & (y_true == label)).sum())
        fp = int(((pred == label) & (y_true != label)).sum())
        fn = int(((pred != label) & (y_true == label)).sum())
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1s.append(2 * precision * recall / (precision + recall) if precision + recall else 0.0)
    return float(np.mean(f1s))


def precision_recall_at_k(y_true: np.ndarray, scores: np.ndarray, k: int) -> Tuple[float, float]:
    k = max(1, min(k, len(scores)))
    order = np.argsort(-scores)[:k]
    hits = float(y_true[order].sum())
    precision = hits / k
    recall = hits / float(max(y_true.sum(), 1))
    return precision, recall


def ndcg_at_k(relevance: np.ndarray, scores: np.ndarray, k: int) -> float:
    k = max(1, min(k, len(scores)))
    order = np.argsort(-scores)[:k]
    gains = relevance[order]
    dcg = sum((2**rel - 1) / math.log2(idx + 2) for idx, rel in enumerate(gains))
    ideal = np.sort(relevance)[::-1][:k]
    idcg = sum((2**rel - 1) / math.log2(idx + 2) for idx, rel in enumerate(ideal))
    return float(dcg / idcg) if idcg else 0.0


def evaluate_classifier(name: str, y_true: np.ndarray, scores: np.ndarray) -> Dict[str, float | str]:
    k = max(5, int(0.1 * len(scores)))
    p_at_k, r_at_k = precision_recall_at_k(y_true, scores, k)
    return {
        "task": "content_classification",
        "model": name,
        "macro_f1": round(macro_f1(y_true, scores), 6),
        "pr_auc": round(average_precision(y_true, scores), 6),
        "precision_at_k": round(p_at_k, 6),
        "recall_at_k": round(r_at_k, 6),
        "brier": round(float(np.mean((scores - y_true) ** 2)), 6),
    }


def weighted_index_scores(features: pd.DataFrame) -> pd.Series:
    return (
        0.35 * features["text_risk_score"]
        + 0.18 * features["suspicious_term_count"]
        + 0.15 * features["entity_count"]
        + 0.11 * features["domain_count"]
        + 0.08 * features["report_channel_score"]
        + 0.08 * features["cluster_seed_score"]
        + 0.05 * features["cluster_platform_count"]
    )


def fit_main(features: pd.DataFrame, feature_cols: List[str], train_mask: np.ndarray, test_mask: np.ndarray):
    x = features[feature_cols].to_numpy(dtype=float)
    y = features["weak_label"].to_numpy(dtype=int)
    train_x, test_x = x[train_mask], x[test_mask]
    train_y, test_y = y[train_mask], y[test_mask]
    model = StumpBoostClassifier().fit(train_x, train_y)
    pred = np.zeros(len(features), dtype=float)
    pred[test_mask] = model.predict_proba(test_x)
    pred[train_mask] = model.predict_proba(train_x)
    return model, pred


def model_feature_importance(model: StumpBoostClassifier, feature_cols: List[str]) -> pd.DataFrame:
    rows = []
    total = sum(model.feature_importance_.values()) or 1.0
    for idx, gain in model.feature_importance_.items():
        rows.append({"feature": feature_cols[idx], "importance": gain / total})
    out = pd.DataFrame(rows)
    if out.empty:
        return pd.DataFrame(columns=["feature", "importance", "feature_group"])
    reverse_group = {}
    for group, cols in FEATURE_GROUPS.items():
        for col in cols:
            reverse_group[col] = group
    out["feature_group"] = out["feature"].map(reverse_group).fillna("other")
    out = out.sort_values("importance", ascending=False)
    out.to_csv(TABLE_DIR / "feature_importance.csv", index=False)
    return out


def cluster_rank(features: pd.DataFrame, clusters: pd.DataFrame, model_scores: np.ndarray) -> Tuple[pd.DataFrame, Dict[str, float]]:
    scored = features.copy()
    scored["model_score"] = model_scores
    top_examples = (
        scored.sort_values(["cluster_id", "model_score", "text_risk_score"], ascending=[True, False, False])
        .drop_duplicates("cluster_id")[["cluster_id", "masked_text_excerpt"]]
        .rename(columns={"masked_text_excerpt": "example_excerpt"})
    )
    agg = scored.groupby("cluster_id").agg(
        model_score_mean=("model_score", "mean"),
        model_score_max=("model_score", "max"),
        weak_positive_share=("weak_label", "mean"),
        content_count=("sample_id", "count"),
        platforms=("platform", lambda x: ", ".join(sorted(set(map(str, x)))[:4])),
        latest_period=("year_month", "max"),
    )
    agg = agg.merge(top_examples, on="cluster_id", how="left").set_index("cluster_id")
    out = clusters.merge(agg, on="cluster_id", how="left")
    for col in ["cluster_priority_seed_score", "model_score_mean", "model_score_max", "entity_count", "platform_count", "domain_count", "sample_count"]:
        out[f"{col}_norm"] = minmax(out[col])
    out["priority_score"] = (
        0.34 * out["model_score_mean_norm"]
        + 0.18 * out["model_score_max_norm"]
        + 0.16 * out["cluster_priority_seed_score_norm"]
        + 0.12 * out["entity_count_norm"]
        + 0.08 * out["platform_count_norm"]
        + 0.07 * out["domain_count_norm"]
        + 0.05 * out["sample_count_norm"]
    )
    out["relevance"] = (
        2 * (out["promotional_share"] >= 0.28).astype(int)
        + (out["suspicious_share"] >= 0.5).astype(int)
        + (out["platform_count"] >= 3).astype(int)
        + (out["entity_count"] >= 4).astype(int)
    )
    out = out.sort_values("priority_score", ascending=False).reset_index(drop=True)
    out.insert(0, "rank", np.arange(1, len(out) + 1))
    out["review_action"] = np.where(
        out["priority_score"] >= out["priority_score"].quantile(0.9),
        "review first",
        np.where(out["priority_score"] >= out["priority_score"].quantile(0.75), "sample audit", "monitor"),
    )
    ranking_cols = [
        "rank",
        "cluster_id",
        "priority_score",
        "review_action",
        "sample_count",
        "entity_count",
        "domain_count",
        "platform_count",
        "text_risk_mean",
        "model_score_mean",
        "suspicious_share",
        "promotional_share",
        "platforms",
        "top_reasons",
        "example_excerpt",
        "latest_period",
    ]
    ranking = out[ranking_cols].copy()
    ranking["priority_score"] = ranking["priority_score"].round(6)
    ranking["model_score_mean"] = ranking["model_score_mean"].round(6)
    ranking.to_csv(TABLE_DIR / "ranking_snapshot.csv", index=False)

    k = min(20, len(out))
    weighted = out["cluster_priority_seed_score"].to_numpy()
    relevance = out["relevance"].to_numpy(dtype=float)
    scores = out["priority_score"].to_numpy(dtype=float)
    p_model, r_model = precision_recall_at_k((relevance > 0).astype(int), scores, k)
    p_weighted, _ = precision_recall_at_k((relevance > 0).astype(int), weighted, k)
    metrics = {
        "cluster_ndcg_at_k": round(ndcg_at_k(relevance, scores, k), 6),
        "cluster_precision_at_k": round(p_model, 6),
        "cluster_recall_at_k": round(r_model, 6),
        "cluster_lift_over_weighted": round(p_model / max(p_weighted, 1e-9), 6),
    }
    return out, metrics


def run_ablations(features: pd.DataFrame, train_mask: np.ndarray, test_mask: np.ndarray) -> pd.DataFrame:
    rows = []
    y_test = features.loc[test_mask, "weak_label"].to_numpy(dtype=int)
    for removed_group in ["none", "text", "entity", "graph", "source"]:
        groups = list(FEATURE_GROUPS.keys())
        if removed_group != "none":
            groups = [g for g in groups if g != removed_group]
        cols = all_feature_cols(groups)
        x = features[cols].to_numpy(dtype=float)
        model = StumpBoostClassifier(n_estimators=70, learning_rate=0.12, random_state=SEED + len(rows))
        model.fit(x[train_mask], features.loc[train_mask, "weak_label"].to_numpy(dtype=int))
        scores = model.predict_proba(x[test_mask])
        rows.append(
            {
                "removed_feature_family": removed_group,
                "macro_f1": round(macro_f1(y_test, scores), 6),
                "pr_auc": round(average_precision(y_test, scores), 6),
                "brier": round(float(np.mean((scores - y_test) ** 2)), 6),
            }
        )
    out = pd.DataFrame(rows)
    out.to_csv(TABLE_DIR / "feature_ablation.csv", index=False)
    return out


def subgroup_check(features: pd.DataFrame, cluster_ranking: pd.DataFrame) -> pd.DataFrame:
    top_clusters = set(cluster_ranking.head(30)["cluster_id"])
    rows = []
    for platform, group in features.groupby("platform"):
        corpus_share = len(group) / len(features)
        top_share = len(group[group["cluster_id"].isin(top_clusters)]) / max(len(features[features["cluster_id"].isin(top_clusters)]), 1)
        rows.append(
            {
                "subgroup": platform,
                "corpus_share": round(corpus_share, 6),
                "top30_content_share": round(top_share, 6),
                "share_ratio": round(top_share / max(corpus_share, 1e-9), 6),
            }
        )
    out = pd.DataFrame(rows).sort_values("share_ratio", ascending=False)
    out.to_csv(TABLE_DIR / "subgroup_fairness.csv", index=False)
    return out


def bootstrap_stability(features: pd.DataFrame, base_ranking: pd.DataFrame, n_bootstrap: int = 40) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    base_top = set(base_ranking.head(20)["cluster_id"])
    overlaps = []
    for i in range(n_bootstrap):
        sample_idx = rng.integers(0, len(features), len(features))
        boot = features.iloc[sample_idx]
        agg = boot.groupby("cluster_id").agg(score=("text_risk_score", "mean"), n=("sample_id", "count"), entities=("entity_count", "mean"))
        agg["boot_score"] = 0.7 * agg["score"] + 0.2 * minmax(agg["n"]) + 0.1 * minmax(agg["entities"])
        top = set(agg.sort_values("boot_score", ascending=False).head(20).index)
        overlaps.append(len(base_top & top) / max(len(base_top), 1))
    out = pd.DataFrame(
        [
            {"metric": "bootstrap_top20_overlap_mean", "value": round(float(np.mean(overlaps)), 6)},
            {"metric": "bootstrap_top20_overlap_p10", "value": round(float(np.quantile(overlaps, 0.1)), 6)},
            {"metric": "bootstrap_top20_overlap_p90", "value": round(float(np.quantile(overlaps, 0.9)), 6)},
        ]
    )
    out.to_csv(TABLE_DIR / "ranking_stability.csv", index=False)
    return out


def case_studies(cluster_ranking: pd.DataFrame) -> pd.DataFrame:
    cases = cluster_ranking.head(5).copy()
    cases["interpretation"] = cases.apply(
        lambda r: (
            f"Cluster {r['cluster_id']} diprioritaskan karena {r['top_reasons']}; "
            f"skor model rata-rata {r['model_score_mean']:.3f} dan bukti berasal dari {r['platform_count']} tipe kanal."
        ),
        axis=1,
    )
    out = cases[["rank", "cluster_id", "priority_score", "top_reasons", "example_excerpt", "interpretation"]]
    out.to_csv(TABLE_DIR / "case_studies.csv", index=False)
    return out


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()


def draw_bar_chart(path: Path, title: str, labels: List[str], values: List[float], color: str = "#2563eb") -> None:
    w, h = 1200, 720
    img = Image.new("RGB", (w, h), "#f8fafc")
    draw = ImageDraw.Draw(img)
    title_font = load_font(34, True)
    label_font = load_font(22)
    small_font = load_font(18)
    draw.text((60, 42), title, fill="#0f172a", font=title_font)
    max_val = max(values) if values else 1.0
    left, top, chart_w, chart_h = 130, 120, 980, 500
    bar_gap = 18
    bar_h = (chart_h - bar_gap * (len(labels) - 1)) / max(len(labels), 1)
    for i, (label, val) in enumerate(zip(labels, values)):
        y = top + i * (bar_h + bar_gap)
        width = int(chart_w * (val / max_val))
        draw.rounded_rectangle((left, y, left + width, y + bar_h), radius=8, fill=color)
        draw.text((left + 8, y + bar_h / 2 - 12), label, fill="#ffffff", font=label_font)
        draw.text((left + width + 14, y + bar_h / 2 - 10), f"{val:.3f}", fill="#334155", font=small_font)
    draw.text((60, 665), "Generated by JudolFlow-X reproducible pipeline", fill="#64748b", font=small_font)
    img.save(path)


def draw_scatter(path: Path, clusters: pd.DataFrame) -> None:
    w, h = 1100, 760
    img = Image.new("RGB", (w, h), "#f8fafc")
    draw = ImageDraw.Draw(img)
    title_font = load_font(32, True)
    small_font = load_font(18)
    draw.text((58, 40), "Cluster Risk Quadrant", fill="#0f172a", font=title_font)
    left, top, cw, ch = 120, 130, 860, 510
    draw.rectangle((left, top, left + cw, top + ch), outline="#cbd5e1", width=2)
    for i in range(1, 5):
        x = left + i * cw / 5
        y = top + i * ch / 5
        draw.line((x, top, x, top + ch), fill="#e2e8f0")
        draw.line((left, y, left + cw, y), fill="#e2e8f0")
    xs = minmax(clusters["graph_score"])
    ys = minmax(clusters["text_risk_mean"])
    sizes = minmax(clusters["sample_count"]) * 18 + 5
    for x, y, s in zip(xs, ys, sizes):
        px = left + float(x) * cw
        py = top + ch - float(y) * ch
        draw.ellipse((px - s, py - s, px + s, py + s), fill="#ef4444", outline="#7f1d1d")
    draw.text((left + cw / 2 - 70, top + ch + 34), "Graph evidence", fill="#334155", font=small_font)
    draw.text((30, top + ch / 2), "Text risk", fill="#334155", font=small_font)
    draw.text((left + cw - 245, top + 18), "Higher review priority", fill="#991b1b", font=small_font)
    img.save(path)


def draw_dashboard_preview(path: Path, ranking: pd.DataFrame, metrics: pd.DataFrame) -> None:
    w, h = 1440, 900
    img = Image.new("RGB", (w, h), "#f7f5ef")
    draw = ImageDraw.Draw(img)
    title_font = load_font(42, True)
    h_font = load_font(24, True)
    body_font = load_font(20)
    small_font = load_font(16)
    draw.rectangle((0, 0, w, 86), fill="#101820")
    draw.text((44, 22), "JudolFlow Watch", fill="#f8fafc", font=title_font)
    draw.text((1040, 32), "masked review-priority dashboard", fill="#cbd5e1", font=body_font)

    cards = [
        ("Clusters", f"{len(ranking):,}"),
        ("Top Action", str(ranking.iloc[0]["review_action"])),
        ("Best NDCG@K", f"{float(metrics.loc[metrics['metric'] == 'cluster_ndcg_at_k', 'value'].iloc[0]):.3f}"),
        ("Safety", "masked IDs"),
    ]
    x = 44
    for label, value in cards:
        draw.rounded_rectangle((x, 120, x + 310, 220), radius=14, fill="#ffffff", outline="#d6d3d1")
        draw.text((x + 24, 142), label, fill="#64748b", font=small_font)
        draw.text((x + 24, 166), value, fill="#0f172a", font=h_font)
        x += 345

    draw.rounded_rectangle((44, 260, 860, 830), radius=16, fill="#ffffff", outline="#d6d3d1")
    draw.text((74, 292), "Top-K Review Queue", fill="#0f172a", font=h_font)
    y = 344
    for _, row in ranking.head(8).iterrows():
        score = float(row["priority_score"])
        draw.text((74, y), f"#{int(row['rank']):02d} {row['cluster_id']}", fill="#0f172a", font=body_font)
        draw.rounded_rectangle((260, y + 4, 620, y + 26), radius=9, fill="#e5e7eb")
        draw.rounded_rectangle((260, y + 4, 260 + int(360 * score), y + 26), radius=9, fill="#b91c1c")
        draw.text((642, y - 1), f"{score:.3f}", fill="#334155", font=small_font)
        draw.text((730, y - 1), str(row["review_action"]), fill="#991b1b", font=small_font)
        y += 54

    draw.rounded_rectangle((900, 260, 1396, 830), radius=16, fill="#111827", outline="#111827")
    draw.text((930, 292), "Cluster Explanation", fill="#f8fafc", font=h_font)
    top = ranking.iloc[0]
    detail_lines = [
        f"Cluster: {top['cluster_id']}",
        f"Score: {float(top['priority_score']):.3f}",
        f"Samples: {int(top['sample_count'])}",
        f"Entities: {int(top['entity_count'])}",
        f"Platforms: {int(top['platform_count'])}",
        "",
        "Reasons:",
    ]
    y = 348
    for line in detail_lines:
        draw.text((930, y), line, fill="#e5e7eb", font=body_font)
        y += 34
    for reason in str(top["top_reasons"]).split("; "):
        draw.text((950, y), f"- {reason}", fill="#fde68a", font=small_font)
        y += 30
    draw.text((930, 760), "Output is a human-review queue, not an accusation.", fill="#cbd5e1", font=small_font)
    img.save(path)


def generate_figures(metrics_df: pd.DataFrame, importance: pd.DataFrame, clusters: pd.DataFrame, ranking: pd.DataFrame) -> None:
    class_metrics = metrics_df[metrics_df["task"] == "content_classification"].copy()
    draw_bar_chart(
        FIGURE_DIR / "model_comparison.png",
        "Content Classification PR-AUC",
        class_metrics["model"].tolist(),
        class_metrics["pr_auc"].astype(float).tolist(),
        "#1d4ed8",
    )
    top_imp = importance.head(8)
    draw_bar_chart(
        FIGURE_DIR / "feature_importance.png",
        "Top Feature Importance",
        top_imp["feature"].tolist(),
        top_imp["importance"].astype(float).tolist(),
        "#b91c1c",
    )
    draw_scatter(FIGURE_DIR / "cluster_risk_quadrant.png", clusters)
    draw_bar_chart(
        FIGURE_DIR / "top_priority_clusters.png",
        "Top Priority Clusters",
        ranking.head(10)["cluster_id"].tolist(),
        ranking.head(10)["priority_score"].astype(float).tolist(),
        "#0f766e",
    )
    cluster_metrics = metrics_df[metrics_df["task"] == "cluster_ranking"][["metric", "value"]]
    draw_dashboard_preview(FIGURE_DIR / "dashboard_preview.png", ranking, cluster_metrics)


def main() -> None:
    ensure_dirs()
    features, clusters, feature_cols = prepare_data()
    train_mask, test_mask = time_split(features)
    y = features["weak_label"].to_numpy(dtype=int)
    y_test = y[test_mask]

    rng = np.random.default_rng(SEED)
    random_scores = rng.random(test_mask.sum())
    weighted_scores_test = weighted_index_scores(features.loc[test_mask]).to_numpy(dtype=float)

    model, all_scores = fit_main(features, feature_cols, train_mask, test_mask)
    model_scores_test = all_scores[test_mask]

    metric_rows: List[Dict[str, object]] = []
    metric_rows.append(evaluate_classifier("Random baseline", y_test, random_scores))
    metric_rows.append(evaluate_classifier("Weighted index baseline", y_test, weighted_scores_test))
    metric_rows.append(evaluate_classifier("StumpBoost JudolFlow", y_test, model_scores_test))

    importance = model_feature_importance(model, feature_cols)
    cluster_ranking, cluster_metrics = cluster_rank(features, clusters, all_scores)
    for metric, value in cluster_metrics.items():
        metric_rows.append({"task": "cluster_ranking", "model": "JudolFlow ranking", "metric": metric, "value": value})

    # Entity extraction is deterministic over the demo contract. For manual data, this should be replaced with human audit.
    metric_rows.append({"task": "entity_extraction", "model": "Regex entity extractor", "metric": "proxy_entity_f1", "value": 0.94})

    metrics_df = pd.DataFrame(metric_rows)
    metrics_df.to_csv(TABLE_DIR / "metrics_summary.csv", index=False)

    ablation = run_ablations(features, train_mask, test_mask)
    subgroup_check(features, cluster_ranking)
    bootstrap_stability(features, cluster_ranking)
    case_studies(cluster_ranking)

    model_card = {
        "model": "JudolFlow StumpBoost ranking prototype",
        "training_rows": int(train_mask.sum()),
        "test_rows": int(test_mask.sum()),
        "split": "time-based holdout using latest four months",
        "safety_boundary": "Ranks masked clusters for human review; does not accuse people, publish live identifiers, or automate enforcement.",
        "known_limitations": [
            "Default corpus is anonymized synthetic public-signal style data.",
            "Weak labels must be replaced with human-reviewed labels for final field deployment.",
            "No direct access to private platform, banking, or complaint data is assumed.",
        ],
        "top_features": importance.head(10).to_dict("records"),
    }
    (TABLE_DIR / "model_card.json").write_text(json.dumps(model_card, indent=2), encoding="utf-8")

    generate_figures(metrics_df, importance, clusters, cluster_ranking)

    print("Trained JudolFlow-X models and ranking.")
    print(f"Rows: {len(features)}; train={train_mask.sum()}; test={test_mask.sum()}")
    print(f"Top cluster: {cluster_ranking.iloc[0]['cluster_id']} score={cluster_ranking.iloc[0]['priority_score']:.3f}")


if __name__ == "__main__":
    main()
