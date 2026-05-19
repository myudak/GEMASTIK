from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st


ROOT = Path(__file__).resolve().parents[1]
TABLE_DIR = ROOT / "reports" / "tables"
FIGURE_DIR = ROOT / "reports" / "figures"


st.set_page_config(page_title="JudolFlow Watch", layout="wide", initial_sidebar_state="expanded")

st.markdown(
    """
    <style>
    :root {
      --ink: #101820;
      --paper: #f7f5ef;
      --line: #d9d2c3;
      --rust: #b91c1c;
      --teal: #0f766e;
      --slate: #475569;
    }
    .stApp {
      background: var(--paper);
      color: var(--ink);
    }
    [data-testid="stHeader"] {
      background: rgba(247, 245, 239, 0.92);
      border-bottom: 1px solid var(--line);
    }
    .block-container {
      padding-top: 1.2rem;
      padding-bottom: 2.5rem;
    }
    h1, h2, h3 {
      letter-spacing: 0 !important;
      color: var(--ink);
    }
    div[data-testid="stMetric"] {
      background: #fffefa;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.9rem 1rem;
      min-height: 108px;
    }
    div[data-testid="stMetric"] label {
      color: var(--slate);
    }
    .safety-note {
      border-left: 5px solid var(--rust);
      background: #fff7ed;
      padding: 0.85rem 1rem;
      border-radius: 6px;
      color: #7f1d1d;
      font-size: 0.96rem;
    }
    .queue-row {
      background: #fffefa;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.75rem 0.9rem;
      margin-bottom: 0.55rem;
    }
    .cluster-id {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-weight: 700;
      color: var(--rust);
    }
    .small-muted {
      color: #64748b;
      font-size: 0.86rem;
    }
    .scorebar {
      height: 9px;
      border-radius: 999px;
      background: #e7e5df;
      margin-top: 0.45rem;
      overflow: hidden;
    }
    .scorebar > span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #0f766e, #b91c1c);
      border-radius: 999px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def load_tables() -> dict[str, pd.DataFrame]:
    tables = {
        "ranking": pd.read_csv(TABLE_DIR / "ranking_snapshot.csv"),
        "metrics": pd.read_csv(TABLE_DIR / "metrics_summary.csv"),
        "features": pd.read_csv(ROOT / "data" / "processed" / "content_features.csv"),
        "importance": pd.read_csv(TABLE_DIR / "feature_importance.csv"),
        "ablation": pd.read_csv(TABLE_DIR / "feature_ablation.csv"),
        "fairness": pd.read_csv(TABLE_DIR / "subgroup_fairness.csv"),
        "cases": pd.read_csv(TABLE_DIR / "case_studies.csv"),
    }
    return tables


tables = load_tables()
ranking = tables["ranking"]
metrics = tables["metrics"]
features = tables["features"]

st.title("JudolFlow Watch")
st.caption("Masked review-priority dashboard for public online gambling promotion clusters")

st.markdown(
    """
    <div class="safety-note">
    Output dashboard ini adalah antrian tinjauan manusia. Skor tidak membuktikan pelanggaran, tidak memuat domain/handle live,
    dan tidak digunakan untuk menuduh individu.
    </div>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("Queue Filter")
    max_rank = int(ranking["rank"].max())
    top_k = st.slider("Top-K", 5, min(80, max_rank), 20)
    action_options = ["all"] + sorted(ranking["review_action"].dropna().unique().tolist())
    action = st.selectbox("Review action", action_options)
    min_score = st.slider("Minimum score", 0.0, 1.0, 0.0, 0.01)

filtered = ranking[ranking["rank"] <= top_k].copy()
if action != "all":
    filtered = filtered[filtered["review_action"] == action]
filtered = filtered[filtered["priority_score"] >= min_score]

cluster_metric = metrics[(metrics["task"] == "cluster_ranking") & (metrics["metric"] == "cluster_ndcg_at_k")]
ndcg = float(cluster_metric["value"].iloc[0]) if len(cluster_metric) else 0.0
stability = pd.read_csv(TABLE_DIR / "ranking_stability.csv")
stab = float(stability.loc[stability["metric"] == "bootstrap_top20_overlap_mean", "value"].iloc[0])

c1, c2, c3, c4 = st.columns(4)
c1.metric("Clusters", f"{len(ranking):,}")
c2.metric("Content Samples", f"{len(features):,}")
c3.metric("Cluster NDCG@K", f"{ndcg:.3f}")
c4.metric("Top-20 Stability", f"{stab:.3f}")

left, right = st.columns([1.08, 0.92], gap="large")

with left:
    st.subheader("Top-K Review Queue")
    if filtered.empty:
        st.info("No clusters match the selected filter.")
    for row in filtered.head(20).itertuples(index=False):
        width = int(float(row.priority_score) * 100)
        st.markdown(
            f"""
            <div class="queue-row">
              <div><span class="cluster-id">#{int(row.rank):02d} {row.cluster_id}</span>
              <span class="small-muted"> - {row.review_action}</span></div>
              <div class="small-muted">{row.top_reasons}</div>
              <div class="scorebar"><span style="width:{width}%"></span></div>
              <div class="small-muted">score {float(row.priority_score):.3f} | samples {int(row.sample_count)} | entities {int(row.entity_count)} | platforms {int(row.platform_count)}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

with right:
    st.subheader("Cluster Profile")
    cluster_choice = st.selectbox("Cluster", ranking["cluster_id"].tolist(), index=0)
    selected = ranking[ranking["cluster_id"] == cluster_choice].iloc[0]
    st.metric("Priority Score", f"{float(selected['priority_score']):.3f}", selected["review_action"])
    p1, p2, p3 = st.columns(3)
    p1.metric("Samples", int(selected["sample_count"]))
    p2.metric("Entities", int(selected["entity_count"]))
    p3.metric("Platforms", int(selected["platform_count"]))
    st.write("Reasons")
    st.write(selected["top_reasons"])
    st.write("Masked example")
    st.code(str(selected["example_excerpt"]))

    cluster_samples = features[features["cluster_id"] == cluster_choice].copy()
    platform_counts = cluster_samples["platform"].value_counts().rename_axis("platform").reset_index(name="samples")
    st.bar_chart(platform_counts.set_index("platform"))

st.subheader("Model Evidence")
m1, m2 = st.columns([0.58, 0.42], gap="large")
with m1:
    st.image(str(FIGURE_DIR / "feature_importance.png"))
with m2:
    st.dataframe(tables["ablation"], use_container_width=True, hide_index=True)

st.subheader("Operational Checks")
f1, f2 = st.columns(2, gap="large")
with f1:
    st.dataframe(tables["fairness"], use_container_width=True, hide_index=True)
with f2:
    class_metrics = metrics[metrics["task"] == "content_classification"][
        ["model", "macro_f1", "pr_auc", "precision_at_k", "recall_at_k", "brier"]
    ]
    st.dataframe(class_metrics, use_container_width=True, hide_index=True)

st.subheader("Case Studies")
st.dataframe(tables["cases"], use_container_width=True, hide_index=True)
