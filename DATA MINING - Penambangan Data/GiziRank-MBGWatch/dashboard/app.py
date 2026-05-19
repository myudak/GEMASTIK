from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st


ROOT = Path(__file__).resolve().parents[1]
TABLES = ROOT / "reports" / "tables"
DATA = ROOT / "data" / "processed"


st.set_page_config(page_title="MBGWatch - GiziRank", layout="wide")

st.markdown(
    """
    <style>
    :root {
      --ink: #12343b;
      --muted: #52676f;
      --line: #d7e1dc;
      --paper: #f4f7f5;
      --accent: #2a9d8f;
      --alert: #d1495b;
    }
    .stApp { background: var(--paper); color: var(--ink); }
    [data-testid="stSidebar"] { background: #e9f1ed; border-right: 1px solid var(--line); }
    .block-container { padding-top: 1.2rem; }
    h1, h2, h3 { color: var(--ink); letter-spacing: 0; }
    .hero {
      background: var(--ink);
      color: white;
      border-radius: 8px;
      padding: 22px 26px;
      border: 1px solid #0b252a;
      margin-bottom: 18px;
    }
    .hero h1 { color: white; margin: 0; font-size: 2.1rem; }
    .hero p { margin: 8px 0 0; color: #d9e8df; }
    .metric-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px 18px;
      min-height: 112px;
    }
    .metric-label { color: var(--muted); font-size: .86rem; }
    .metric-value { color: var(--ink); font-weight: 760; font-size: 2rem; margin-top: 4px; }
    .reason-chip {
      display: inline-block;
      background: #e8f2ee;
      color: #12343b;
      border: 1px solid #cfe0d7;
      border-radius: 999px;
      padding: 4px 9px;
      margin: 2px 4px 2px 0;
      font-size: .82rem;
    }
    div[data-testid="stDataFrame"] { border: 1px solid var(--line); border-radius: 8px; }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def load_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    ranking = pd.read_csv(TABLES / "ranking_snapshot.csv")
    panel = pd.read_csv(DATA / "district_panel.csv")
    metrics = pd.read_csv(TABLES / "metrics_summary.csv")
    return ranking, panel, metrics


ranking, panel, metrics = load_data()

st.markdown(
    """
    <div class="hero">
      <h1>MBGWatch - GiziRank Priority Queue</h1>
      <p>Prioritas dukungan kualitas layanan MBG pada level kabupaten/kota. Tidak memeringkat individu, rumah tangga, atau dapur sebagai objek risiko.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("Filter")
    provinces = ["All"] + sorted(ranking["province"].dropna().unique().tolist())
    selected_province = st.selectbox("Province", provinces)
    top_k = st.slider("Top-K", min_value=10, max_value=min(100, len(ranking)), value=30, step=5)
    min_score = st.slider("Minimum score", 0.0, 1.0, 0.0, 0.01)
    reason_search = st.text_input("Reason contains", "")

filtered = ranking.copy()
if selected_province != "All":
    filtered = filtered[filtered["province"] == selected_province]
if min_score > 0:
    filtered = filtered[filtered["final_priority_score"] >= min_score]
if reason_search.strip():
    filtered = filtered[filtered["top_reasons"].str.contains(reason_search, case=False, na=False)]
filtered = filtered.sort_values("final_priority_score", ascending=False).head(top_k)

model_row = metrics[metrics["model"] == "StumpBoost Ranker"].iloc[0]
card_cols = st.columns(4)
cards = [
    ("Districts ranked", f"{len(ranking):,}"),
    ("Precision@K", f"{model_row['Precision@K']:.2f}"),
    ("NDCG@K", f"{model_row['NDCG@K']:.2f}"),
    ("Lift@K", f"{model_row['Lift@K']:.1f}x"),
]
for col, (label, value) in zip(card_cols, cards):
    col.markdown(
        f"""<div class="metric-card"><div class="metric-label">{label}</div><div class="metric-value">{value}</div></div>""",
        unsafe_allow_html=True,
    )

queue_col, profile_col = st.columns([1.35, 1])

with queue_col:
    st.subheader("Priority Queue")
    st.dataframe(
        filtered[
            [
                "rank",
                "district",
                "province",
                "final_priority_score",
                "coverage_gap",
                "nutrition_need",
                "food_vulnerability",
                "top_reasons",
            ]
        ],
        hide_index=True,
        use_container_width=True,
    )
    chart_data = filtered.set_index("district")["final_priority_score"].head(15)
    st.bar_chart(chart_data, height=320)

with profile_col:
    st.subheader("District Profile")
    district_options = filtered["district"].tolist() if len(filtered) else ranking["district"].head(1).tolist()
    selected_district = st.selectbox("District", district_options)
    selected = ranking[ranking["district"] == selected_district].iloc[0]
    panel_row = panel[(panel["district"] == selected["district"]) & (panel["province"] == selected["province"])].iloc[0]
    st.markdown(f"### #{int(selected['rank'])} {selected['district']}, {selected['province']}")
    st.markdown(
        "".join(f"<span class='reason-chip'>{reason.strip()}</span>" for reason in str(selected["top_reasons"]).split(";")),
        unsafe_allow_html=True,
    )
    profile_metrics = pd.DataFrame(
        {
            "Signal": [
                "Final score",
                "Coverage gap",
                "Nutrition need",
                "Food vulnerability",
                "Socioeconomic stress",
                "Price stress",
                "Operational SPPG",
                "MBG beneficiaries",
            ],
            "Value": [
                selected["final_priority_score"],
                selected["coverage_gap"],
                selected["nutrition_need"],
                selected["food_vulnerability"],
                selected["socioeconomic_stress"],
                selected["price_stress"],
                selected["sppg_operational_count"],
                selected["mbg_beneficiaries"],
            ],
        }
    )
    st.dataframe(profile_metrics, hide_index=True, use_container_width=True)
    signal_chart = pd.Series(
        {
            "Nutrition": panel_row["nutrition_need"],
            "Coverage": panel_row["coverage_gap"],
            "Food": panel_row["food_vulnerability"],
            "Socioeconomic": panel_row["socioeconomic_stress"],
            "Price": panel_row["price_stress"],
        }
    )
    st.bar_chart(signal_chart, height=260)

st.subheader("Province Summary")
province_summary = (
    ranking.groupby("province", as_index=False)
    .agg(
        districts=("district", "count"),
        mean_score=("final_priority_score", "mean"),
        top_30=("rank", lambda s: int((s <= 30).sum())),
        mean_gap=("coverage_gap", "mean"),
        mean_need=("nutrition_need", "mean"),
    )
    .sort_values(["top_30", "mean_score"], ascending=False)
)
st.dataframe(province_summary, hide_index=True, use_container_width=True)
