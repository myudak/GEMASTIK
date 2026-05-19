# 05 - Dashboard And Visual Concept

The dashboard is optional. For GEMASTIK Data Mining, the report and experiments matter more than the app. Still, a clean dashboard concept can strengthen presentation and make the final output concrete.

## Design Principle

This should feel like an operational monitoring tool, not a marketing landing page.

Style:

- dense but readable
- map/table/chart focused
- restrained colors
- red/orange only for risk
- green/blue for stable/low-risk states
- no decorative clutter

## Main Dashboard Pages

### 1. Alert Ranking

Purpose:

Show the province-commodity pairs that need attention first.

Key components:

- ranked table
- filters: horizon, commodity, province, priority level
- risk score
- spike probability
- expected increase
- top drivers
- link to detail page

Wireframe:

```text
PanganShock-X | Alert Ranking | Horizon: 7d / 14d

[Summary cards]
Critical alerts | High alerts | Avg spike probability | Top commodity

[Filters]
Commodity | Province | Priority | Date

[Ranked table]
Rank | Province | Commodity | Current Price | Forecast | P(spike) | Expected Increase | Priority | Top Driver
```

### 2. Province-Commodity Heatmap

Purpose:

Show risk distribution across Indonesia and commodities.

Views:

- province map colored by max risk
- heatmap matrix: province x commodity
- hover/click shows risk detail

Report figure:

Use a heatmap even if no interactive map is built. It is easier and still effective.

### 3. Commodity Trend View

Purpose:

Explain one commodity over time.

Components:

- actual price line
- forecast line
- spike threshold band
- holiday markers
- weather/event annotations
- model alert markers

### 4. Alert Detail / Explanation

Purpose:

Show why one alert is high-risk.

Components:

- province and commodity header
- current price, forecast price, spike probability
- SHAP local explanation
- recent trend chart
- top positive drivers
- top negative drivers
- previous similar periods

Example:

```text
East Java - Red Chili
Priority: Critical
P(spike): 0.78
Expected increase: +29.3%

Top drivers:
1. 7-day price momentum is high
2. 14-day volatility increased
3. Idul Fitri is approaching
4. Rainfall anomaly is above normal
```

### 5. Model Evaluation

Purpose:

Make the data mining work visible.

Components:

- model comparison table
- PR curve
- calibration curve
- feature ablation chart
- feature importance chart
- rolling backtest summary

## Report Visuals To Prioritize

Even without building a dashboard, generate these visuals later:

1. pipeline diagram
2. data coverage summary
3. spike distribution chart
4. model comparison table
5. PR curve
6. calibration curve
7. ablation chart
8. SHAP feature importance
9. province-commodity heatmap
10. ranked alert table

## Poster / Infographic Layout

Recommended one-page visual structure:

```text
Title: PanganShock-X
Subtitle: Multiview Time-Series Data Mining for Food Price Spike Early Warning

1. Problem
   Food price spikes are costly and often detected late.

2. Data Sources
   Prices, calendar, weather, metadata, optional news.

3. Feature Engineering
   Lags, rolling volatility, momentum, holiday proximity, weather anomalies.

4. Modeling
   Baselines -> LightGBM/CatBoost/XGBoost -> calibration -> risk score.

5. Evaluation
   Time split, rolling backtest, PR-AUC, Recall@Top-K, wMAPE, Brier.

6. Output
   Ranked province-commodity alerts with explanations.
```

## Suggested Color System

Risk:

- critical: red
- high: orange
- medium: amber
- low: green

Neutral:

- background: near white
- text: dark slate
- borders: light gray
- charts: blue/green base with risk highlights

Avoid making everything green/orange. Use risk colors only where they carry meaning.

## Dashboard Data Contract

If a demo is built later, it can run from static CSV/JSON outputs.

Expected files:

```text
outputs/alerts_latest.csv
outputs/model_metrics.json
outputs/feature_importance.csv
outputs/backtest_summary.csv
outputs/province_commodity_heatmap.csv
```

Alert schema:

| Field | Description |
| --- | --- |
| date | alert date |
| horizon | 7d or 14d |
| province | province name |
| commodity | commodity name |
| current_price | latest observed price |
| forecast_price | predicted price |
| spike_probability | calibrated probability |
| expected_increase_pct | expected increase |
| priority_score | final ranking score |
| priority_level | critical/high/medium/low |
| top_driver_1 | first explanation |
| top_driver_2 | second explanation |
| top_driver_3 | third explanation |

## What Not To Build Yet

- account system
- live scraping UI
- complex map interactions
- policy simulation engine
- notification system
- role-based access

Those are software-product features. The Data Mining submission needs proof of method first.

