# 02 - Dataset And Feature Plan

## Target Dataset Shape

Recommended grain:

```text
province x commodity x date
```

Each row represents one commodity in one province on one date.

Target table:

| Column | Type | Description |
| --- | --- | --- |
| date | date | Observation date |
| province_id | categorical | Standard province code |
| province_name | categorical | Province name |
| commodity_id | categorical | Standard commodity code |
| commodity_name | categorical | Commodity name |
| price | numeric | Observed retail/market price |
| target_price_h7 | numeric | Price 7 days ahead |
| target_price_h14 | numeric | Price 14 days ahead |
| spike_h7 | binary | Whether a spike occurs within 7 days |
| spike_h14 | binary | Whether a spike occurs within 14 days |

## Recommended Public Data Sources

Use primary/public data sources first. Treat site availability as something to verify at implementation time.

| Data Need | Candidate Source | Notes |
| --- | --- | --- |
| Food price time series | PIHPS Nasional / Bank Indonesia at https://hargapangan.id/ and https://www.bi.go.id/hargapangan | Strong candidate for daily food prices by region/commodity. Verify export/API route during implementation. |
| Food price and food-security data | Badan Pangan Nasional data portal at https://data.badanpangan.go.id/ | Good official source for food-related datasets and references. |
| Weather data | BMKG data surfaces such as https://data.bmkg.go.id/prakiraan-cuaca/ and https://dataonline.bmkg.go.id/ | Use official BMKG when practical. Historical access may need manual download/account/session. |
| Historical weather fallback | Open-Meteo Historical Weather API at https://open-meteo.com/en/docs/historical-weather-api | Practical fallback for reproducible historical weather features. Clearly label as fallback, not primary Indonesian agency data. |
| Region metadata | BPS Web API at https://webapi.bps.go.id/ and BPS publications | Useful for province codes, administrative metadata, and socioeconomic context. |
| Calendar events | Government holiday calendars, manually curated official holiday list | Use for Ramadan, Idul Fitri, national holidays, school holiday proxy. |
| Macro context | BPS, BI, official fuel price references | Optional. Keep lightweight unless easy to merge. |

## Minimum Viable Dataset

The minimum strong version needs:

1. food price by date, province, commodity
2. commodity mapping
3. calendar features
4. weather by province/date or nearest weather station

This is enough to produce a defensible report with baselines, boosted trees, backtesting, ablation, and explainability.

## Data Acquisition Strategy

### Step 1: Food Prices

Goal:

```text
date, province, commodity, price
```

Priority:

1. PIHPS/BI daily price data.
2. Bapanas data portal.
3. Local government market-price datasets if national source is incomplete.

Selection rules:

- Prefer longer daily history over more commodities.
- Prefer consistent province coverage over noisy market-level coverage.
- Keep a raw snapshot and document collection date.

### Step 2: Province And Commodity Standardization

Normalize:

- province spelling
- commodity spelling
- units
- currency format
- missing or duplicated rows

Create mapping tables:

```text
province_mapping.csv
commodity_mapping.csv
```

### Step 3: Calendar Features

Build a deterministic calendar table:

```text
date, day_of_week, month, week_of_year, is_weekend, is_national_holiday, days_to_holiday, days_after_holiday, is_ramadan_period, days_to_idul_fitri
```

### Step 4: Weather Features

Recommended early version:

- map each province to capital-city coordinates
- pull daily weather variables
- aggregate by province/date

Weather variables:

- rainfall or precipitation
- temperature mean/max/min
- humidity if available
- extreme rainfall flag
- rolling rainfall 7/14 days
- weather anomaly relative to province-month average

### Step 5: Optional News/Event Signals

Only add this after the core pipeline works.

Possible lightweight features:

- count of food-price related news per province/day
- event categories: harvest, import, distribution, weather, policy
- simple keyword/rule-based category count
- optional embeddings/sentiment if time allows

Do not let this branch block the main project.

## Target Definition

### Regression Targets

For each horizon `h`:

```text
target_price_h = price at date + h
target_return_h = (target_price_h - price_t) / price_t
```

Use:

- `h = 7`
- `h = 14`

### Classification Targets

For each horizon `h`, define spike by maximum forward increase:

```text
future_max_h = max(price[t+1], ..., price[t+h])
max_return_h = (future_max_h - price_t) / price_t
spike_h = 1 if max_return_h >= threshold
```

Recommended thresholds to test:

- 5%
- 8%
- 10%

Main threshold should be chosen after checking class balance. If 10% creates too few positive cases, use 5% or 8%.

## Feature Groups

### Price History Features

| Feature | Windows |
| --- | --- |
| lag price | 1, 3, 7, 14, 21, 28 days |
| lag return | 1, 3, 7, 14 days |
| rolling mean | 7, 14, 28 days |
| rolling std / volatility | 7, 14, 28 days |
| rolling min/max | 7, 14, 28 days |
| momentum | price_t / rolling_mean - 1 |
| z-score | commodity-province normalized |
| recent spike flag | whether spike happened in previous 14/28 days |

### Cross-Section Features

| Feature | Description |
| --- | --- |
| province commodity average | historical mean price |
| commodity national average | daily average across provinces |
| province gap to national | province price minus national commodity price |
| relative rank | province price rank among provinces for same commodity/date |

### Calendar Features

- day of week
- month
- week of year
- weekend flag
- national holiday flag
- days to next holiday
- days after previous holiday
- Ramadan flag
- Idul Fitri proximity
- Christmas/New Year proximity if relevant

### Weather Features

- daily rainfall
- 7-day cumulative rainfall
- 14-day cumulative rainfall
- temperature mean/max
- humidity
- extreme rainfall indicator
- rainfall anomaly
- temperature anomaly

### Region And Commodity Metadata

- island group
- commodity category
- staple/non-staple flag
- volatility bucket
- province population or expenditure proxy if available

## Leakage Rules

Strictly avoid future leakage:

- Rolling features must use only dates `<= t`.
- Weather forecast features can use only forecasts that would have been available at date `t`.
- If using historical weather, use it as observed context only up to `t`, not future weather.
- Calendar future dates are allowed because holidays are known in advance.
- Target labels must never enter feature columns.
- Scaling/encoding must be fit on train fold only.

## Missing Data Strategy

Recommended hierarchy:

1. Preserve raw missingness indicators.
2. Forward fill short gaps within same province-commodity.
3. Use rolling median for small gaps.
4. Drop province-commodity series with excessive missingness.
5. Report missingness percentage before and after cleaning.

Suggested thresholds:

- Drop series with more than 30% missing values.
- Interpolate only gaps up to 3-7 consecutive days.

## Dataset Quality Tables For Report

Include these in the technical report:

| Summary | Columns |
| --- | --- |
| Dataset coverage | date range, provinces, commodities, rows |
| Missingness | feature group, missing percentage |
| Spike distribution | threshold, horizon, positive rate |
| Commodity coverage | commodity, number of observations, mean price, spike rate |
| Province coverage | province, number of commodities, missing rate |

## Recommended Final Dataset Naming

When implementation starts:

```text
data/raw/food_prices_raw.csv
data/interim/food_prices_clean.csv
data/interim/calendar_features.csv
data/interim/weather_features.csv
data/processed/panganshock_panel_daily.csv
```

