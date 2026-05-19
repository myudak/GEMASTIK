from __future__ import annotations

from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "processed"
TABLES = ROOT / "reports" / "tables"


st.set_page_config(page_title="PanganFlow.ID", page_icon="PF", layout="wide")

st.markdown(
    """
    <style>
    :root {
      --ink:#172226;
      --muted:#60737b;
      --panel:#f7f5ee;
      --line:#d8d0c1;
      --teal:#0b6b5f;
      --rust:#b5442d;
    }
    .stApp {
      background:
        linear-gradient(90deg, rgba(11,107,95,.06) 1px, transparent 1px),
        linear-gradient(0deg, rgba(11,107,95,.045) 1px, transparent 1px),
        #fbfaf5;
      background-size: 28px 28px;
      color: var(--ink);
    }
    [data-testid="stSidebar"] {
      background: #eee7d8;
      border-right: 1px solid var(--line);
    }
    .block-container {
      padding-top: 1.5rem;
      padding-bottom: 2rem;
    }
    h1, h2, h3 {
      letter-spacing: 0;
      color: #172226;
    }
    .metric-strip {
      display:grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: .75rem;
      margin-bottom: .8rem;
    }
    .pf-metric {
      background:#fffdf8;
      border:1px solid var(--line);
      border-left:4px solid var(--teal);
      padding:.8rem .9rem;
      min-height:80px;
    }
    .pf-metric small {
      color:var(--muted);
      display:block;
      font-size:.72rem;
      margin-bottom:.2rem;
    }
    .pf-metric strong {
      font-size:1.45rem;
      line-height:1.2;
    }
    .stTabs [data-baseweb="tab-list"] {
      gap: .3rem;
      border-bottom: 1px solid var(--line);
    }
    .stTabs [data-baseweb="tab"] {
      border-radius:0;
      padding:.55rem .85rem;
      background:#fffaf0;
      border:1px solid var(--line);
      border-bottom:none;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def load_data() -> dict[str, pd.DataFrame]:
    return {
        "panel": pd.read_csv(DATA / "province_commodity_panel.csv", parse_dates=["date"]),
        "latest": pd.read_csv(TABLES / "ranking_snapshot.csv"),
        "flows": pd.read_csv(TABLES / "flow_recommendations.csv"),
        "metrics": pd.read_csv(TABLES / "metrics_summary.csv"),
        "importance": pd.read_csv(TABLES / "feature_importance.csv"),
        "sources": pd.read_csv(TABLES / "source_status.csv"),
        "validation": pd.read_csv(TABLES / "validation_checks.csv"),
        "clusters": pd.read_csv(TABLES / "cluster_snapshot.csv"),
    }


def rupiah(value: float) -> str:
    return "Rp " + f"{value:,.0f}".replace(",", ".")


def million_ton(value: float) -> str:
    return f"{value / 1_000_000:.2f} jt ton"


def pressure_map(latest: pd.DataFrame, flows: pd.DataFrame, selected_region: str, top_k: int) -> go.Figure:
    data = latest if selected_region == "Semua" else latest[latest["region"].eq(selected_region)]
    fig = go.Figure()
    fig.add_trace(
        go.Scattergeo(
            lon=data["lon"],
            lat=data["lat"],
            mode="markers+text",
            text=data["province"],
            textposition="top center",
            marker={
                "size": 9 + data["model_priority_score"] * 25,
                "color": data["model_priority_score"],
                "colorscale": "YlOrRd",
                "line": {"width": 0.7, "color": "#172226"},
                "colorbar": {"title": "Priority"},
            },
            hovertemplate="<b>%{text}</b><br>Priority=%{marker.color:.3f}<extra></extra>",
            name="Provinsi",
        )
    )
    position = latest.set_index("province")[["lat", "lon"]].to_dict("index")
    flow_view = flows.head(top_k)
    for _, row in flow_view.iterrows():
        if row["origin_province"] not in position or row["destination_province"] not in position:
            continue
        a = position[row["origin_province"]]
        b = position[row["destination_province"]]
        fig.add_trace(
            go.Scattergeo(
                lon=[a["lon"], b["lon"]],
                lat=[a["lat"], b["lat"]],
                mode="lines",
                line={"width": 1.2 + row["priority_score"] / 35, "color": "rgba(181,68,45,.58)"},
                hoverinfo="skip",
                showlegend=False,
            )
        )
    fig.update_geos(
        projection_type="natural earth",
        lataxis_range=[-12, 7],
        lonaxis_range=[94, 142],
        showland=True,
        landcolor="#ece6d8",
        showcountries=False,
        showcoastlines=True,
        coastlinecolor="#8b9ca3",
        showocean=True,
        oceancolor="#d8e8eb",
        bgcolor="rgba(0,0,0,0)",
    )
    fig.update_layout(
        height=560,
        margin={"l": 0, "r": 0, "t": 10, "b": 0},
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
    )
    return fig


def flow_bar(flows: pd.DataFrame, top_k: int) -> go.Figure:
    view = flows.head(top_k).iloc[::-1].copy()
    labels = view["origin_province"] + " -> " + view["destination_province"]
    fig = go.Figure(
        go.Bar(
            x=view["priority_score"],
            y=labels,
            orientation="h",
            marker={"color": view["priority_score"], "colorscale": "Tealgrn"},
            hovertemplate="<b>%{y}</b><br>Priority=%{x:.1f}<extra></extra>",
        )
    )
    fig.update_layout(
        height=max(340, 32 * len(view)),
        xaxis_title="Priority Score",
        yaxis_title="",
        margin={"l": 8, "r": 12, "t": 8, "b": 28},
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="#fffdf8",
    )
    return fig


def province_trend(panel: pd.DataFrame, province: str) -> go.Figure:
    view = panel[panel["province"].eq(province)].sort_values("date")
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=view["date"], y=view["price"], mode="lines", name="Harga", line={"color": "#0b6b5f", "width": 2.5}))
    fig.add_trace(
        go.Scatter(
            x=view["date"],
            y=view["national_median_price"],
            mode="lines",
            name="Median nasional",
            line={"color": "#b5442d", "dash": "dash"},
        )
    )
    fig.update_layout(
        height=300,
        yaxis_title="Rp/kg",
        margin={"l": 8, "r": 12, "t": 8, "b": 26},
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="#fffdf8",
        legend={"orientation": "h"},
    )
    return fig


data = load_data()
panel = data["panel"]
latest = data["latest"].merge(
    panel[panel["date"].eq(panel["date"].max())][["province", "lat", "lon", "price_14d_change", "national_median_price", "production_ton_year", "need_ton_year"]],
    on="province",
    how="left",
)
flows = data["flows"]

regions = ["Semua"] + sorted(latest["region"].dropna().unique().tolist())
selected_region = st.sidebar.selectbox("Region", regions)
top_k = st.sidebar.slider("Top-K flow", 5, 20, 10)
province_options = latest.sort_values("model_priority_score", ascending=False)["province"].tolist()
selected_province = st.sidebar.selectbox("Provinsi", province_options)

st.title("PanganFlow.ID")
st.caption("Prioritas review ketimpangan pasokan beras antarprovinsi berbasis harga, produksi, konsumsi, dan jarak.")

top_flow = flows.iloc[0]
top_priority = latest.sort_values("model_priority_score", ascending=False).iloc[0]
latest_month = panel["date"].max().strftime("%Y-%m")
mean_price = latest["price"].mean()

st.markdown(
    f"""
    <div class="metric-strip">
      <div class="pf-metric"><small>Snapshot</small><strong>{latest_month}</strong></div>
      <div class="pf-metric"><small>Harga rata-rata</small><strong>{rupiah(mean_price)}</strong></div>
      <div class="pf-metric"><small>Provinsi prioritas</small><strong>{top_priority['province']}</strong></div>
      <div class="pf-metric"><small>Flow teratas</small><strong>{top_flow['origin_province']} -> {top_flow['destination_province']}</strong></div>
    </div>
    """,
    unsafe_allow_html=True,
)

tab_map, tab_flow, tab_profile, tab_model, tab_sources = st.tabs(["Peta", "Flow", "Profil", "Model", "Sumber"])

with tab_map:
    st.plotly_chart(pressure_map(latest, flows, selected_region, top_k), use_container_width=True)
    cols = [
        "rank",
        "province",
        "region",
        "price",
        "model_priority_score",
        "deficit_score",
        "surplus_score",
        "anomaly_score",
        "top_reasons",
    ]
    view = latest[cols].copy()
    st.dataframe(view, use_container_width=True, hide_index=True)

with tab_flow:
    left, right = st.columns([1.15, 1])
    with left:
        st.plotly_chart(flow_bar(flows, top_k), use_container_width=True)
    with right:
        st.dataframe(
            flows[
                [
                    "rank",
                    "origin_province",
                    "destination_province",
                    "priority_score",
                    "distance_km",
                    "top_reasons",
                ]
            ].head(top_k),
            use_container_width=True,
            hide_index=True,
        )

with tab_profile:
    row = latest[latest["province"].eq(selected_province)].iloc[0]
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Harga", rupiah(row["price"]))
    c2.metric("Gap median", f"{row['national_median_gap'] * 100:.1f}%")
    c3.metric("Surplus proxy", million_ton(row["surplus_proxy_ton"]))
    c4.metric("Priority", f"{row['model_priority_score']:.3f}")
    st.plotly_chart(province_trend(panel, selected_province), use_container_width=True)
    st.write(row["top_reasons"])
    st.dataframe(
        flows[flows["destination_province"].eq(selected_province)][
            ["rank", "origin_province", "priority_score", "distance_km", "top_reasons"]
        ].head(8),
        use_container_width=True,
        hide_index=True,
    )

with tab_model:
    left, right = st.columns(2)
    with left:
        st.dataframe(data["metrics"], use_container_width=True, hide_index=True)
        st.dataframe(data["validation"], use_container_width=True, hide_index=True)
    with right:
        st.dataframe(data["importance"].head(15), use_container_width=True, hide_index=True)
        st.dataframe(data["clusters"][["province", "cluster_label", "model_priority_score", "deficit_score", "surplus_score"]], use_container_width=True, hide_index=True)

with tab_sources:
    st.dataframe(data["sources"], use_container_width=True, hide_index=True)

