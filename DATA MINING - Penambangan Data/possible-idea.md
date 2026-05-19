Yes — **this is the right direction**.

What you’re showing in that screenshot is not just “an idea list.”
It’s **winner-style decomposition**:

* **problem statement**
* **data and preprocessing**
* **modeling stack + feature design**
* **evaluation + compute + role split**
* **why it won**

If you want something **more advanced, more “deep research,” more latest-tech**, then we should stop thinking in “one model = one project” style.

We should think like this:

> **winner projects = multi-view pipeline + metric-aware design + fusion + aggressive validation + carefully chosen latest components**

And yes — **this is very transferable to GEMASTIK Data Mining**.

---

# The key lesson from those winners

From the examples you showed, the pattern is usually:

## 1. They do **not** rely on one giant model

They use:

* multiple views
* multiple branches
* retrieval + rerank
* tabular + sequence + graph
* first-level models + second-level fusion

## 2. They optimize for the **actual metric**

Not just “accuracy.”

They optimize:

* AP / PR-AUC
* Recall@K
* ranking quality
* onset/wakeup alignment
* hidden distribution shift robustness
* threshold tuning
* post-processing

## 3. They win by **pipeline design**

Not just model size.

Examples from your screenshot:

* hard-example mining
* multi-path retrieval
* ensemble branches
* graph construction
* post-processing tuned to evaluation

That is exactly how you should think for GEMASTIK too.

---

# So here’s the upgraded version:

# **Winner-Level GEMASTIK Data Mining ideas with latest-tech flavor**

I’ll give you **4 advanced ideas**, in the same spirit as your screenshot.

---

# 1) **DengueCast-X**

## **Spatiotemporal Outbreak Forecasting for Dengue Early Warning**

This is my **best “serious winner” pick**.

---

## Problem statement

Predict **district-week dengue outbreak risk** **2–4 weeks ahead** in Indonesia, then output a **ranked intervention priority list** for fogging, larva surveillance, PSN, and hospital preparedness.

This is much stronger than just:

> “predict DBD cases”

because the real framing is:

> **Which districts should be prioritized next, before an outbreak spikes?**

---

## Data and preprocessing

**Possible data views:**

* historical dengue cases by district/week
* rainfall, humidity, temperature
* population density / urbanization
* elevation / land use / flood-prone proxy
* health-facility access
* mobility proxy
* holiday/school calendar
* lagged case-growth features

**Preprocessing stack:**

* weekly aggregation
* rolling lag windows: 1, 2, 4, 8 weeks
* district normalization
* missing-value imputation
* outlier handling
* spatial adjacency graph between districts
* optional pseudo-label smoothing for outbreak threshold definition

---

## Modeling stack and feature design

This is where you make it feel **latest-tech**.

### Branch A — strong tabular baseline

* **CatBoost / LightGBM / XGBoost**
* engineered lag and interaction features
* class imbalance handling
* very hard baseline to beat

### Branch B — temporal deep model

* **Temporal Fusion Transformer (TFT)** for multihorizon forecasting【turn207574search10】
* interpretable attention over time
* good for sequential weather + case inputs

### Branch C — graph branch

* district graph using geographic adjacency / mobility approximation
* **GraphSAGE / GAT / Hetero GNN** with PyTorch Geometric
* captures spillover across neighboring districts

### Branch D — optional text signal branch

* outbreak/news signals from local reports
* use **Qwen3 Embedding** or **BGE-M3** to embed text/news【turn682289search1】【turn827465search0】
* aggregate district-level text risk features weekly

### Final fusion

* late fusion / stacking:

  * CatBoost score
  * TFT score
  * GNN score
  * text-signal score
* calibrated final rank score

---

## Evaluation, compute, role split

### Evaluation

Use:

* PR-AUC
* Recall@Top-10% districts
* Recall@Top-20% districts
* F1
* temporal backtesting
* lead-time gain
* calibration

### Compute

* Baseline version: can run on one decent GPU or even CPU + modest GPU
* Advanced version: 1 GPU enough for TFT/GNN experiments if the dataset is not too huge

### Role split

* **Member 1:** data engineering + spatiotemporal feature pipeline
* **Member 2:** modeling (CatBoost/TFT/GNN)
* **Member 3:** evaluation, explainability, ablation, report writing

---

## Why it can win

Because it looks like a **real research pipeline**:

* multi-view
* time-series
* graph
* explainability
* ranking output
* public-health impact
* latest but still realistic

---

# 2) **JudolFlow-X**

## **Hybrid NLP + Retrieval + Graph Mining for Online Gambling Promotion Networks**

This is the **coolest / most “latest-tech”** one.

If you want something that feels more like modern KDD / WSDM / SIGIR flavored pipeline, this is it.

---

## Problem statement

Detect and cluster **online gambling promotion ecosystems** in Indonesian social/digital channels:

* promotional text/comments
* suspicious domains
* Telegram handles
* QRIS aliases
* payment clues
* cross-platform identity linkage

Goal is not just classification.
Goal is:

> **Find high-risk clusters and rank the most suspicious coordinated networks.**

---

## Data and preprocessing

**Data views:**

* comments/posts from social platforms
* domain/URL lists
* Telegram handle mentions
* OCR from screenshots if available
* QRIS/payment text clues
* public blocklists / reports
* entity co-occurrence graph

**Preprocessing:**

* slang normalization
* OCR cleaning
* URL canonicalization
* deobfuscation of coded language
* entity extraction:

  * domain
  * handle
  * phone
  * payment alias
  * QRIS alias
* graph node unification and deduplication

---

## Modeling stack and feature design

This is where you can go **very modern**.

### Stage 1 — retrieval-style candidate mining

Use embeddings to find semantically similar suspicious content.

* **Qwen3 Embedding** for embedding and reranking【turn682289search1】
* or **BGE-M3**, which supports dense, sparse, and multi-vector retrieval in one model【turn827465search0】

This is a huge upgrade over plain TF-IDF.

### Stage 2 — classification

* fine-tuned Indo/Multilingual encoder
* or light instruction-tuned classifier using **Qwen3-4B / 8B**
* weak-supervision labels from rules + human verification

### Stage 3 — reranking

Use **CrossEncoder / reranker** for better precision on borderline samples【turn207574search7】.

### Stage 4 — graph mining

Create heterogeneous graph:

* post/comment
* domain
* Telegram handle
* QRIS alias
* phone
* account/payment clue

Then run:

* community detection
* link prediction
* node classification
* anomaly scoring
* Heterogeneous GNN / GraphSAGE

### Stage 5 — hard-example mining

This is important and very “winner style.”

After first model:

* collect false positives / false negatives
* relabel the hardest examples
* retrain

This is exactly the kind of thing winning teams do.

### Stage 6 — risk fusion

Final risk score combines:

* text risk
* entity risk
* graph-centrality risk
* community risk
* blocklist overlap
* novelty score

---

## Evaluation, compute, role split

### Evaluation

* macro F1 for suspicious-content classification
* PR-AUC
* entity extraction F1
* cluster purity / NMI
* precision@K for suspicious clusters
* case-study evaluation on top clusters

### Compute

* base version possible on moderate GPU
* reranker + GNN makes it more advanced but still manageable
* embeddings can be cached

### Role split

* **Member 1:** data scraping / preprocessing / entity extraction
* **Member 2:** NLP embeddings / classifier / reranker
* **Member 3:** graph construction / clustering / evaluation / report

---

## Why it can win

Because it screams:

* **latest tech**
* retrieval + rerank
* graph mining
* weak supervision
* hard-example mining
* multi-view fusion

This is probably the **most KDD-like** idea.

---

# 3) **PanganShock-X**

## **Multiview Food-Price Spike Forecasting and Intervention Ranking**

This is the **safest technically** and still strong.

---

## Problem statement

Predict **price-spike risk** for strategic food commodities across Indonesian regions **7–14 days ahead**, and rank areas/commodities for intervention.

Not just:

> “forecast chili prices”

But:

> **Which regions and commodities are most likely to experience disruptive spikes soon?**

---

## Data and preprocessing

**Data views:**

* daily market price data
* regional inflation context
* weather
* transport disruption proxy
* harvest season/calendar
* holiday effects
* news sentiment
* optional social discussion signals

**Preprocessing:**

* panel time-series construction
* lag features
* rolling mean/std
* spike labeling
* commodity grouping
* region encoding
* missing price interpolation
* holiday/event flags

---

## Modeling stack and feature design

### Branch A — tabular booster

* LightGBM / CatBoost / XGBoost
* lag features + cross-features

### Branch B — time-series deep model

* TFT
* N-HiTS / TiDE if you want to experiment
* multihorizon forecasting

### Branch C — text signal branch

* embed regional food/economic news using **Qwen3 Embedding** or **BGE-M3**【turn682289search1】【turn827465search0】
* aggregate sentiment / event-risk indicators

### Final objective

Do both:

* **regression** for expected price
* **classification** for spike/no-spike

Then fuse them:

* spike probability
* expected magnitude
* uncertainty band

---

## Evaluation, compute, role split

### Evaluation

* wMAPE / MAE for regression
* PR-AUC / F1 for spike detection
* Recall@Top-K alerts
* calibration for risk probabilities

### Compute

* very manageable
* can win without huge GPUs

### Role split

* **Member 1:** data engineering + time-series pipeline
* **Member 2:** models + ensemble
* **Member 3:** explainability, evaluation, reporting

---

## Why it can win

Because:

* data is cleaner
* metrics are clear
* evaluation is strong
* easier to execute with fewer failures
* still looks sophisticated if you add multiview fusion

---

# 4) **MBGWatch-X**

## **Food-Safety Risk Ranking for SPPG with Multisource Risk Fusion**

This is an upgraded version of your earlier MBG idea.

---

## Problem statement

Predict the **risk of food-safety incidents** for MBG kitchens / SPPG sites in the next 7–30 days and produce a ranked inspection priority list.

---

## Data and preprocessing

**Data views:**

* incident reports
* certification / audit status
* operational load
* meal counts
* staffing ratio
* supplier info
* weather
* distance/logistics features
* sanitation keywords from reports
* optional news text branch

**Preprocessing:**

* incident labeling
* aggregation by SPPG-week
* class imbalance handling
* compliance score normalization
* feature unions

---

## Modeling stack and feature design

### Branch A

* CatBoost / XGBoost tabular risk model

### Branch B

* news/report text embeddings using **Qwen3 Embedding / BGE-M3**【turn682289search1】【turn827465search0】

### Branch C

* graph of SPPG ↔ supplier ↔ location ↔ incident similarity
* anomaly detection / graph score

### Final fusion

* inspection-priority score
* SHAP-based explanation
* uncertainty-aware ranking

---

## Evaluation, compute, role split

### Evaluation

* PR-AUC
* Recall@Top-10% kitchens
* ranking gain
* early-warning lead time
* SHAP analysis

### Why it can win

Because it is:

* timely
* impactful
* explainable
* government-useful

But I still think it is slightly less “clean” than DengueCast or PanganShock in pure data-mining rigor.

---

# If you want **latest-tech ingredients**, use these

These are the kinds of “modern ingredients” that make your project feel like the deep-research examples.

## A. **Retrieval + rerank**

Very strong for text-heavy projects.

* first-stage embeddings
* second-stage cross-encoder reranking

Useful tools:

* **Qwen3 Embedding** for embedding and reranking【turn682289search1】
* **BGE-M3** for dense + sparse + multi-vector retrieval【turn827465search0】
* **SentenceTransformers v5.4**, which added multimodal support and generative reranker support【turn207574search8】

---

## B. **Hard-example mining**

Super underrated.

After first training round:

* inspect false positives
* inspect false negatives
* relabel / augment hard samples
* retrain

This is very competition-coded.

---

## C. **Multi-view fusion**

Do not trust one feature space only.

Examples:

* tabular + time-series
* text + graph
* weather + historical cases + news
* domain metadata + content + link graph

---

## D. **Metric-aware post-processing**

This is where strong teams gain points.

Examples:

* threshold tuning on validation
* top-K calibration
* smoothing
* temporal consistency constraints
* class-specific thresholding

---

## E. **Explainability**

For GEMASTIK judges, this matters a lot.

Use:

* SHAP for tabular models
* attention visualizations for sequence models
* graph explanations / community summaries
* error analysis per subgroup

---

## F. **Modern open models**

A few “latest” names you can confidently mention:

* **Qwen3** family (reasoning/instruction open models)【turn682289search0】
* **Qwen3 Embedding** for retrieval/reranking【turn682289search1】
* **BGE-M3** for multilingual dense+sparse+multi-vector retrieval【turn827465search0】
* **Temporal Fusion Transformer** for interpretable multihorizon forecasting【turn207574search10】
* **CatBoost** because it handles categorical, text, and embeddings features well in tabular settings【turn207574search5】

---

# My honest ranking for you

## If you want **highest chance of winning**

### **1. DengueCast-X**

Best balance of:

* serious problem
* real data-mining
* latest-tech potential
* explainability
* ranking output
* strong research story

---

## If you want **coolest / most cutting-edge**

### **2. JudolFlow-X**

Best if you want:

* graph mining
* retrieval/rerank
* LLM-assisted entity extraction
* “wow” factor

But it’s riskier because the data pipeline is harder.

---

## If you want **most practical and safest to execute**

### **3. PanganShock-X**

Very clean competition project.
Less sexy, but easier to do really well.

---

## If you want **very current national issue**

### **4. MBGWatch-X**

Good story, but label quality may be harder.

---

# My direct recommendation

If I were building this **for GEMASTIK Data Mining**, and I wanted it to feel like the kind of deep-research winner table you showed, I would pick:

## **DengueCast-X**

with this exact framing:

> **A multi-view spatiotemporal risk ranking system that fuses tabular boosters, Temporal Fusion Transformer, district graph learning, and optional news/text signals to predict district-level dengue outbreak risk 2–4 weeks ahead.**

That sounds **way more advanced** than:

> “predict DBD cases using XGBoost”

and it feels much more like the winner examples you showed.

---

If you want, next I can make you a **full deep-research table** in the exact style of your screenshot, like this:

| Project | Problem statement | Data and preprocessing | Modeling stack and feature design | Evaluation, compute, role split | Why it can win |
| ------- | ----------------- | ---------------------- | --------------------------------- | ------------------------------- | -------------- |

for:

1. **DengueCast-X**
2. **JudolFlow-X**
3. **PanganShock-X**
4. **MBGWatch-X**

and I can make it **super detailed, winner-style, and brutal-honest**.

# NILAI

Yes. Based on the **penyisihan rubric** in your screenshot, I would score the ideas like this:

|  Rank | Idea                          | Keaslian 20 | Kebaruan dataset/metode 20 | Manfaat 20 | Kejelasan tulisan 20 | Kelengkapan laporan 20 |  Total |
| ----: | ----------------------------- | ----------: | -------------------------: | ---------: | -------------------: | ---------------------: | -----: |
| **1** | **DengueCast-X**              |          18 |                         19 |         20 |                   17 |                     17 | **91** |
| **2** | **PanganShock-X**             |          17 |                         17 |         19 |                   19 |                     19 | **91** |
| **3** | **JudolFlow-X**               |          19 |                         20 |         18 |                   15 |                     15 | **87** |
| **4** | **HydroRisk-ID**              |          16 |                         17 |         20 |                   18 |                     18 | **89** |
| **5** | **MBGWatch-X**                |          18 |                         17 |         20 |                   16 |                     14 | **85** |
| **6** | **ScamLens-ID / PinjolGraph** |          18 |                         19 |         18 |                   15 |                     15 | **85** |
| **7** | **AirGuard Sekolah**          |          16 |                         16 |         18 |                   18 |                     17 | **85** |

My honest top 3:

## **1. DengueCast-X — Best winner-style idea**

**Score: 91/100**

This is the strongest if you can get/construct decent data.

| Criteria                | Score | Why                                                                                                                             |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------- |
| Keaslian                | 18/20 | DBD prediction exists, but district-week early-warning + intervention ranking + graph/time-series fusion feels original enough. |
| Kebaruan dataset/metode | 19/20 | Strong if you combine climate, cases, geospatial, lag features, graph adjacency, TFT/GNN, and SHAP.                             |
| Manfaat                 | 20/20 | Very clear public-health benefit: early intervention before outbreak spikes.                                                    |
| Kejelasan tulisan       | 17/20 | More complex, but still explainable if framed as “ranking wilayah prioritas intervensi.”                                        |
| Kelengkapan laporan     | 17/20 | Can be complete, but dataset construction may be hard.                                                                          |

**Main weakness:** dataset availability.
If you cannot get good district-week dengue data, this drops from **91 → maybe 82**.

Best title:

> **DengueCast-X: Prediksi Risiko Kejadian DBD Berbasis Spatiotemporal Data Mining untuk Prioritas Intervensi Wilayah**

---

## **2. PanganShock-X — Safest high-score idea**

**Score: 91/100**

This might be the **most realistic to execute well**.

| Criteria                | Score | Why                                                                                                      |
| ----------------------- | ----: | -------------------------------------------------------------------------------------------------------- |
| Keaslian                | 17/20 | Food price forecasting is common, but “price-spike risk ranking” is stronger.                            |
| Kebaruan dataset/metode | 17/20 | Not as flashy as JudolFlow/DengueCast, but can be strong with multiview time-series + news/text signals. |
| Manfaat                 | 19/20 | Clear benefit for inflation, household food security, market intervention.                               |
| Kejelasan tulisan       | 19/20 | Very easy to explain: predict price spike before it happens.                                             |
| Kelengkapan laporan     | 19/20 | Easiest to make complete: data, metrics, baselines, backtesting, ablation.                               |

**Main weakness:** may feel less “wow” unless you make the method advanced.

Best title:

> **PanganShock-X: Prediksi Risiko Lonjakan Harga Pangan Strategis Berbasis Multiview Time-Series Data Mining**

This is probably the best idea if you want **low execution risk**.

---

## **3. JudolFlow-X — Most advanced / coolest**

**Score: 87/100**

This has the highest **tech wow factor**, but also the highest execution risk.

| Criteria                | Score | Why                                                                                               |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------------- |
| Keaslian                | 19/20 | Very distinctive if framed as NLP + entity extraction + graph mining.                             |
| Kebaruan dataset/metode | 20/20 | Strongest novelty: embeddings, reranker, weak supervision, graph clustering, hard-example mining. |
| Manfaat                 | 18/20 | Strong social/cyber benefit, but must be handled carefully and ethically.                         |
| Kejelasan tulisan       | 15/20 | Harder to explain cleanly because it has many components.                                         |
| Kelengkapan laporan     | 15/20 | Dataset labeling, graph construction, and evaluation can get messy.                               |

**Main weakness:** data ethics + evaluation difficulty.
If executed badly, it becomes “scraping comments + classifier,” which is not enough.
If executed well, it can look like a mini-KDD paper.

Best title:

> **JudolFlow-X: Deteksi dan Klasterisasi Ekosistem Promosi Judi Online Berbasis NLP, Retrieval-Reranking, dan Graph Mining**

This is best if you want **most advanced latest-tech project**.

---

## **4. HydroRisk-ID — Strong but common**

**Score: 89/100**

| Criteria                | Score | Why                                                                         |
| ----------------------- | ----: | --------------------------------------------------------------------------- |
| Keaslian                | 16/20 | Flood/landslide prediction is common.                                       |
| Kebaruan dataset/metode | 17/20 | Can be novel if you predict **impact severity**, not just event occurrence. |
| Manfaat                 | 20/20 | Disaster preparedness benefit is very clear.                                |
| Kejelasan tulisan       | 18/20 | Easy to write and explain.                                                  |
| Kelengkapan laporan     | 18/20 | Public data and evaluation are manageable.                                  |

Actually, this can beat JudolFlow if you write it better. But it needs a sharper angle:

> **not flood prediction, but impact-priority prediction.**

Best title:

> **HydroRisk-ID: Prediksi Risiko Dampak Banjir dan Longsor untuk Prioritas Kesiapsiagaan Wilayah**

---

## **5. MBGWatch-X — Very timely, but data risk**

**Score: 85/100**

| Criteria                | Score | Why                                                                                         |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------- |
| Keaslian                | 18/20 | Current and specific. Not many people will use MBG food-safety risk as a data-mining topic. |
| Kebaruan dataset/metode | 17/20 | Good if using multisource risk fusion, weather, certification, incident text, and ranking.  |
| Manfaat                 | 20/20 | Very strong public benefit.                                                                 |
| Kejelasan tulisan       | 16/20 | Need careful framing so it does not look like software/dashboard.                           |
| Kelengkapan laporan     | 14/20 | Weakest part: real labels may be hard and incomplete.                                       |

Main risk: **label quality**. If you only have scattered news incidents, the report may look less rigorous.

Best title:

> **MBGWatch-X: Data Mining untuk Prediksi Risiko Keamanan Pangan dan Prioritas Inspeksi SPPG Program MBG**

Good idea, but more dangerous for Data Mining unless you can build a convincing dataset.

---

## **6. ScamLens-ID / PinjolGraph — Cool but risky**

**Score: 85/100**

| Criteria                | Score | Why                                                             |
| ----------------------- | ----: | --------------------------------------------------------------- |
| Keaslian                | 18/20 | Strong topic, socially relevant.                                |
| Kebaruan dataset/metode | 19/20 | NLP + graph + scam entity clustering can be very advanced.      |
| Manfaat                 | 18/20 | Clear benefit, but maybe less direct than health/disaster/food. |
| Kejelasan tulisan       | 15/20 | Hard to explain and scope-control.                              |
| Kelengkapan laporan     | 15/20 | Dataset collection and labeling can become messy.               |

This is like JudolFlow but slightly more legally/ethically sensitive.

Best title:

> **ScamLens-ID: Deteksi Klaster Pinjaman Online Ilegal Berbasis NLP dan Graph Mining**

---

## **7. AirGuard Sekolah — Clean but less winner-level**

**Score: 85/100**

| Criteria                | Score | Why                                                                      |
| ----------------------- | ----: | ------------------------------------------------------------------------ |
| Keaslian                | 16/20 | Air pollution forecasting is not new.                                    |
| Kebaruan dataset/metode | 16/20 | Can be improved with school-hour exposure ranking, but still less novel. |
| Manfaat                 | 18/20 | Health/children angle is good.                                           |
| Kejelasan tulisan       | 18/20 | Easy to explain.                                                         |
| Kelengkapan laporan     | 17/20 | Manageable, but sensor coverage may be limited.                          |

Good, but not my first choice.

Best title:

> **AirGuard Sekolah: Prediksi Risiko Paparan PM2.5 Jam Sekolah Berbasis Data Mining**

---

# Final recommendation

If you want **highest chance to look like a serious winner**:

## **Pick DengueCast-X**

But if you are scared about data availability:

## **Pick PanganShock-X**

If you want the most advanced, latest-tech, “KDD-style” project:

## **Pick JudolFlow-X**

My brutally honest ranking:

```text
1. DengueCast-X      = best research + impact if data is available
2. PanganShock-X     = safest to execute and easiest to make complete
3. HydroRisk-ID      = strong, but needs novelty angle
4. JudolFlow-X       = coolest, but hardest to execute cleanly
5. MBGWatch-X        = timely, but dataset/label risk
6. ScamLens-ID       = cool, but data ethics risk
7. AirGuard Sekolah  = clean, but less novel
```

For GEMASTIK penyisihan, I would personally choose:

> **PanganShock-X if you want to maximize score stability.**
> **DengueCast-X if you want to maximize winner potential.**
