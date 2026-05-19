# JudolFlow-X Research Spec

## Working Title

**JudolFlow-X: Hybrid NLP, Entity Mining, and Graph Ranking for Prioritizing Online Gambling Promotion Networks**

## Competition Framing

Theme alignment: *Penambangan Data untuk Peningkatan TIK menuju Kemandirian Bangsa*. JudolFlow-X supports healthier Indonesian digital spaces by helping reviewers prioritize clusters of public content that appear to promote online gambling.

The system does **not** label individual citizens as gamblers, does **not** publish live illegal domains, and does **not** automate punishment. It ranks masked public-signal clusters for human review.

## Decision Target

When monitoring capacity is limited, which coordinated content/entity clusters should be reviewed first?

## Official Source Spine

- Komdigi portal and public statements on judi online content takedown, SAMAN, AduanKonten, and CekRekening.
- PPATK public statements and reports on transaction exposure from judi online.
- OJK public statements on financial-sector blocking and AML/CFT duties.
- Public complaint channels such as AduanKonten and CekRekening, used only as reporting-channel references unless a team obtains lawful data access.

## Data Plan

Main unit: **content cluster**.

Input views:

- Public text snippets, comments, titles, bios, or captions.
- OCR text from public screenshots, if manually reviewed.
- URL/domain mentions, Telegram-style handles, phone/contact hints, and payment clues.
- Public blocklist/report overlap, if legally obtained.
- Time and platform metadata.

Processed tables:

- `content_features.csv`: one row per anonymized content sample.
- `entity_graph_edges.csv`: masked sample-entity and entity-entity links.
- `cluster_snapshot.csv`: graph cluster aggregates.
- `ranking_snapshot.csv`: human-review priority queue.

## Labels and Target

Primary target: **review priority**, defined by a fusion of:

- text-level promotion signal,
- entity evidence density,
- graph/community centrality,
- cross-platform spread,
- novelty or domain-churn behavior,
- optional public report/blocklist overlap.

Weak labels are generated from rules and should be replaced or audited by human review for a real submission. The report treats the demo corpus as an end-to-end prototype, not as a claim about real individuals or live services.

## Methods

Baselines:

- Random ranking.
- Transparent rule/weighted index.

Main model:

- Lightweight boosted decision-stump model over text, entity, and graph features.
- Graph connected components for entity-linked cluster mining.
- Feature-family ablations for text, entity, graph, and source metadata.

Planned extension:

- Embedding retrieval with BGE-M3 or Qwen embeddings.
- Cross-encoder reranking for borderline samples.
- Heterogeneous GNN or GraphSAGE when enough labeled data exists.

## Evaluation

- Macro F1 and PR-AUC for suspicious-content classification.
- Precision@K, Recall@K, and NDCG@K for ranked cluster review.
- Brier score for calibration.
- Entity extraction proxy F1 on the synthetic demo corpus.
- Ablation lift by feature family.
- Stability via bootstrap Top-K overlap.
- Case-study explanations for 3-5 top clusters.

## Safety and Ethics

- All identifiers are masked before appearing in processed artifacts.
- Outputs are "needs review", not "illegal".
- Dashboard copy avoids exposing live domains or operational details that could help evasion.
- Incident/news signals are validation context, not ground truth.

## Test Plan

- Validate no duplicate `sample_id`.
- Validate all processed identifiers are masked.
- Validate no future data leakage in time-based split.
- Compare the main model against random and weighted-index baselines.
- Check Top-K stability under bootstrap.
- Confirm report citations are real URLs, not temporary citation markers.
- Render the DOCX to page PNGs before delivery.
- Smoke-test the dashboard locally.
