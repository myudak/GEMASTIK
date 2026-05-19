from __future__ import annotations

import hashlib
import itertools
import json
import math
import random
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
TABLE_DIR = ROOT / "reports" / "tables"

SEED = 1845


SOURCE_CATALOG = [
    {
        "source": "Komdigi - content takedown and public reporting",
        "url": "https://portal.komdigi.go.id/kanal-publik/berita-kini/9397",
        "role": "Official framing and reported takedown count; used as context, not row-level labels.",
        "status": "catalogued",
    },
    {
        "source": "Komdigi - SAMAN and judol monitoring",
        "url": "https://portal.komdigi.go.id/kanal-publik/berita-kini/9623",
        "role": "Official monitoring-system context and scale of content enforcement.",
        "status": "catalogued",
    },
    {
        "source": "Komdigi - reporting channels",
        "url": "https://portal.komdigi.go.id/kanal-publik/berita-kini/9712",
        "role": "Official public reporting-channel context for AduanKonten and CekRekening.",
        "status": "catalogued",
    },
    {
        "source": "PPATK - judol transaction exposure",
        "url": "https://www.ppatk.go.id/news/read/1555/pemerintah-tegaskan-perang-total-terhadap-judi-online-dan-pencucian-uang.html",
        "role": "Financial-risk context for social impact and motivation.",
        "status": "catalogued",
    },
    {
        "source": "OJK - banking response to online gambling accounts",
        "url": "https://www.ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Documents/Pages/OJK-Memerintahkan-Bank-untuk-Memblokir-Rekening-yang-Terlibat-dalam-Kegiatan-Judi-Online/SP%20-%20OJK%20MEMERINTAHKAN%20BANK%20UNTUK%20MEMBLOKIR%20REKENING%20YANG%20TERLIBAT%20DALAM%20KEGIATAN%20JUDI%20ONLINE.pdf",
        "role": "Financial-sector policy context; not used for individual account labeling.",
        "status": "catalogued",
    },
]


KEYWORD_GROUPS = {
    "gambling": [
        "slot",
        "togel",
        "casino",
        "scatter",
        "jackpot",
        "maxwin",
        "rtp",
        "spin",
        "parlay",
        "pola",
    ],
    "payment": [
        "deposit",
        "depo",
        "withdraw",
        "wd",
        "qris",
        "saldo",
        "ewallet",
        "rekening",
        "bonus",
    ],
    "promotion": [
        "member baru",
        "bonus harian",
        "gratis",
        "claim",
        "klaim",
        "link bio",
        "daftar",
        "promo",
        "vip",
    ],
    "urgency": [
        "buruan",
        "malam ini",
        "limited",
        "anti rungkad",
        "auto",
        "pasti",
        "cuan",
    ],
    "contact": [
        "telegram",
        "wa",
        "admin",
        "cs",
        "hubungi",
        "inbox",
        "dm",
    ],
    "benign": [
        "turnamen",
        "kelas",
        "edukasi",
        "literasi",
        "komunitas",
        "sekolah",
        "olahraga",
        "laporan",
        "anti judi",
    ],
}

OBFUSCATION_MAP = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "$": "s"})


DOMAIN_RE = re.compile(r"\b[a-z0-9][a-z0-9-]{2,50}(?:\.|\[\.\]|\(dot\))[a-z]{2,12}\b", re.I)
HANDLE_RE = re.compile(r"(?<!\w)@[a-zA-Z0-9_]{4,32}\b")
PHONE_RE = re.compile(r"\b(?:\+?62|0)8[\d\s\-xX]{7,17}\b")
PAYMENT_RE = re.compile(r"\b(?:qris|merchant|rek|rekening|ewallet|dana|ovo|gopay)[\s:_-]*[a-z0-9x\-]{3,24}\b", re.I)


@dataclass
class ExtractedEntity:
    entity_type: str
    raw_value: str
    canonical: str
    masked: str


def ensure_dirs() -> None:
    for path in [RAW_DIR, PROCESSED_DIR, TABLE_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def stable_hash(value: str, n: int = 10) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:n]


def mask_entity(entity_type: str, canonical: str) -> str:
    return f"{entity_type}_{stable_hash(entity_type + ':' + canonical, 12)}"


def normalize_entity_value(value: str) -> str:
    out = value.strip().lower()
    out = out.replace("[.]", ".").replace("(dot)", ".")
    out = re.sub(r"\s+", "", out)
    return out


def normalize_text(text: str) -> str:
    base = str(text).lower()
    base = base.replace("[.]", ".").replace("(dot)", ".")
    base = base.translate(OBFUSCATION_MAP)
    base = re.sub(r"https?://", "", base)
    base = re.sub(r"[^a-z0-9@._\-\s]", " ", base)
    base = re.sub(r"\s+", " ", base).strip()
    return base


def count_group(text: str, group: str) -> int:
    return sum(1 for token in KEYWORD_GROUPS[group] if token in text)


def extract_entities(text: str) -> List[ExtractedEntity]:
    entities: List[ExtractedEntity] = []
    patterns = [
        ("domain", DOMAIN_RE),
        ("handle", HANDLE_RE),
        ("phone", PHONE_RE),
        ("payment", PAYMENT_RE),
    ]
    seen = set()
    for entity_type, pattern in patterns:
        for match in pattern.findall(str(text)):
            canonical = normalize_entity_value(match)
            key = (entity_type, canonical)
            if not canonical or key in seen:
                continue
            seen.add(key)
            entities.append(
                ExtractedEntity(
                    entity_type=entity_type,
                    raw_value=match,
                    canonical=canonical,
                    masked=mask_entity(entity_type, canonical),
                )
            )
    return entities


def safe_demo_entity_pool() -> List[Dict[str, str]]:
    names = [
        "alpha",
        "bravo",
        "cendana",
        "dahlia",
        "elang",
        "fajar",
        "galaksi",
        "halimun",
        "intan",
        "jayakarta",
        "kartika",
        "lintas",
        "merapi",
        "nusantara",
        "orion",
        "purnama",
        "rajawali",
        "sagara",
        "tanjung",
        "utara",
        "varuna",
        "waringin",
    ]
    pool: List[Dict[str, str]] = []
    for idx, name in enumerate(names, start=1):
        pool.append(
            {
                "domain": f"{name}{idx:02d}[.]invalid",
                "handle": f"@{name}_review{idx:02d}",
                "phone": f"08xx-xxx-{1000 + idx}",
                "payment": f"QRIS-{name.upper()}-{idx:02d}",
            }
        )
    return pool


def generate_demo_corpus(n_samples: int = 620) -> pd.DataFrame:
    rng = random.Random(SEED)
    np_rng = np.random.default_rng(SEED)
    entities = safe_demo_entity_pool()
    platforms = ["short_video", "comment", "forum", "image_ocr", "bio_text", "public_report"]
    source_types = ["public_post", "ocr_snapshot", "manual_report", "platform_export"]
    start_date = datetime(2025, 1, 1)

    suspicious_templates = [
        "info {term} {pay} via admin {handle}, cek domain {domain}",
        "{term} sedang ramai, pola malam ini dibagikan di {handle}, pembayaran {payment}",
        "akun baru diarahkan ke {domain} lalu chat {handle} untuk {pay}",
        "ocr tangkapan layar memuat {term}, {pay}, dan kontak {phone}",
        "komentar berulang menyebut {domain} dengan ajakan {promo}",
    ]
    benign_templates = [
        "kampanye literasi digital anti judi online untuk siswa dan keluarga",
        "kelas keamanan siber membahas pelaporan konten ilegal melalui kanal resmi",
        "turnamen e-sport komunitas tanpa taruhan dan tanpa transaksi uang",
        "artikel edukasi dampak sosial ekonomi judi online bagi remaja",
        "laporan warga meminta verifikasi konten mencurigakan tanpa menyebarkan tautan",
        "diskusi sekolah tentang cara menjaga ruang digital produktif",
    ]
    borderline_templates = [
        "komentar singkat berisi ajakan dm admin dan klaim bonus tanpa tautan jelas",
        "bio akun menyebut cuan cepat dan link bio, konteks perlu ditinjau manual",
        "caption berisi istilah scatter tapi juga membahas bahaya judi online",
        "unggahan edukasi menampilkan contoh tersensor dari pola promosi ilegal",
    ]

    terms = ["slot", "togel", "scatter", "maxwin", "rtp tinggi", "parlay"]
    pay_terms = ["deposit kecil", "qris cepat", "wd harian", "saldo ewallet", "bonus member baru"]
    promo_terms = ["link bio", "claim bonus", "daftar vip", "promo malam ini", "buruan klaim"]

    rows = []
    for i in range(n_samples):
        month_offset = int(np_rng.integers(0, 16))
        timestamp = start_date + timedelta(days=30 * month_offset + int(np_rng.integers(0, 28)))
        cluster_idx = int(np_rng.choice(len(entities), p=np.array([0.08] * 6 + [0.035] * 16) / (0.08 * 6 + 0.035 * 16)))
        ent = entities[cluster_idx]
        label_roll = rng.random()
        if label_roll < 0.43:
            human_label = "benign"
            text = rng.choice(benign_templates)
            if rng.random() < 0.16:
                text += f" contoh tautan disamarkan {ent['domain']}"
        elif label_roll < 0.68:
            human_label = "suspicious"
            text = rng.choice(borderline_templates)
            if rng.random() < 0.55:
                text += f" kontak {ent['handle']}"
            if rng.random() < 0.35:
                text += f" kanal {ent['domain']}"
        else:
            human_label = "promotional"
            text = rng.choice(suspicious_templates).format(
                term=rng.choice(terms),
                pay=rng.choice(pay_terms),
                promo=rng.choice(promo_terms),
                domain=ent["domain"],
                handle=ent["handle"],
                phone=ent["phone"],
                payment=ent["payment"],
            )
            if rng.random() < 0.28:
                ent2 = entities[(cluster_idx + rng.randint(1, 5)) % len(entities)]
                text += f" mirror {ent2['domain']} admin {ent2['handle']}"

        rows.append(
            {
                "sample_id": f"demo_{i + 1:04d}",
                "platform": rng.choice(platforms),
                "timestamp": timestamp.strftime("%Y-%m-%d"),
                "text": text,
                "source_type": rng.choice(source_types),
                "human_label": human_label,
                "url": "",
                "report_channel": rng.choice(["none", "aduankonten", "cekrekening", "platform_report"]),
                "reviewer_note": "demo_anonymized_synthetic_public_signal",
                "demo_cluster_seed": f"seed_{cluster_idx + 1:02d}",
            }
        )

    return pd.DataFrame(rows)


def load_or_generate_raw() -> Tuple[pd.DataFrame, str]:
    manual_path = RAW_DIR / "content_samples.csv"
    if manual_path.exists():
        df = pd.read_csv(manual_path)
        required = {"sample_id", "platform", "timestamp", "text", "source_type", "human_label"}
        missing = sorted(required - set(df.columns))
        if missing:
            raise ValueError(f"content_samples.csv missing columns: {missing}")
        for optional in ["url", "report_channel", "reviewer_note", "demo_cluster_seed"]:
            if optional not in df.columns:
                df[optional] = ""
        return df, "manual_content_samples.csv"

    df = generate_demo_corpus()
    demo_path = RAW_DIR / "demo_anonymized_content_samples.csv"
    df.to_csv(demo_path, index=False)
    return df, "generated_demo_anonymized_content_samples.csv"


def feature_rows(raw: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    feature_records = []
    entity_records = []

    for row in raw.to_dict("records"):
        text = str(row.get("text", ""))
        clean = normalize_text(text)
        entities = extract_entities(text)

        group_counts = {f"{group}_terms": count_group(clean, group) for group in KEYWORD_GROUPS}
        text_length = max(len(clean.split()), 1)
        suspicious_terms = (
            group_counts["gambling_terms"]
            + group_counts["payment_terms"]
            + group_counts["promotion_terms"]
            + group_counts["urgency_terms"]
            + group_counts["contact_terms"]
        )
        benign_terms = group_counts["benign_terms"]
        entity_count = len(entities)
        entity_type_count = len({e.entity_type for e in entities})
        domain_count = sum(1 for e in entities if e.entity_type == "domain")
        handle_count = sum(1 for e in entities if e.entity_type == "handle")
        payment_count = sum(1 for e in entities if e.entity_type == "payment")
        phone_count = sum(1 for e in entities if e.entity_type == "phone")
        report_channel = str(row.get("report_channel", "none")).lower()
        report_channel_score = 1.0 if report_channel in {"aduankonten", "cekrekening", "platform_report"} else 0.0

        raw_rule_score = (
            1.3 * group_counts["gambling_terms"]
            + 0.9 * group_counts["payment_terms"]
            + 0.8 * group_counts["promotion_terms"]
            + 0.5 * group_counts["urgency_terms"]
            + 0.4 * group_counts["contact_terms"]
            + 0.35 * entity_count
            + 0.4 * report_channel_score
            - 0.7 * benign_terms
        )
        text_risk_score = 1 / (1 + math.exp(-raw_rule_score / 3.0))

        human_label = str(row.get("human_label", "unknown")).lower().strip()
        weak_label = 1 if human_label in {"suspicious", "promotional"} else 0
        if human_label == "unknown":
            weak_label = int(text_risk_score >= 0.62)

        feature_records.append(
            {
                "sample_id": row["sample_id"],
                "platform": row.get("platform", ""),
                "timestamp": row.get("timestamp", ""),
                "year_month": str(row.get("timestamp", ""))[:7],
                "source_type": row.get("source_type", ""),
                "human_label": human_label,
                "weak_label": weak_label,
                "clean_text": clean,
                "masked_text_excerpt": mask_text_excerpt(text),
                "text_length_tokens": text_length,
                "suspicious_term_count": suspicious_terms,
                "benign_term_count": benign_terms,
                "entity_count": entity_count,
                "entity_type_count": entity_type_count,
                "domain_count": domain_count,
                "handle_count": handle_count,
                "payment_count": payment_count,
                "phone_count": phone_count,
                "report_channel_score": report_channel_score,
                "text_risk_score": round(text_risk_score, 6),
                **group_counts,
            }
        )

        for ent in entities:
            entity_records.append(
                {
                    "sample_id": row["sample_id"],
                    "entity_type": ent.entity_type,
                    "masked_entity": ent.masked,
                    "canonical_hash": stable_hash(ent.canonical, 16),
                }
            )

    features = pd.DataFrame(feature_records)
    entities_df = pd.DataFrame(entity_records)
    if entities_df.empty:
        entities_df = pd.DataFrame(columns=["sample_id", "entity_type", "masked_entity", "canonical_hash"])
    return features, entities_df


def mask_text_excerpt(text: str, max_words: int = 24) -> str:
    out = str(text)
    out = DOMAIN_RE.sub("[DOMAIN]", out)
    out = HANDLE_RE.sub("[HANDLE]", out)
    out = PHONE_RE.sub("[PHONE]", out)
    out = PAYMENT_RE.sub("[PAYMENT]", out)
    words = out.split()
    if len(words) > max_words:
        out = " ".join(words[:max_words]) + " ..."
    return out


class UnionFind:
    def __init__(self) -> None:
        self.parent: Dict[str, str] = {}

    def find(self, item: str) -> str:
        if item not in self.parent:
            self.parent[item] = item
        if self.parent[item] != item:
            self.parent[item] = self.find(self.parent[item])
        return self.parent[item]

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def build_graph(features: pd.DataFrame, entities: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    edge_records: List[Dict[str, object]] = []
    uf = UnionFind()

    sample_to_entities = entities.groupby("sample_id")["masked_entity"].apply(list).to_dict()
    entity_type_lookup = dict(zip(entities["masked_entity"], entities["entity_type"]))

    for sample_id, ents in sample_to_entities.items():
        sample_node = f"S:{sample_id}"
        for ent in ents:
            entity_node = f"E:{ent}"
            uf.union(sample_node, entity_node)
            edge_records.append(
                {
                    "source": sample_node,
                    "target": entity_node,
                    "source_type": "sample",
                    "target_type": entity_type_lookup.get(ent, "entity"),
                    "edge_type": "mentions",
                    "weight": 1.0,
                }
            )
        for a, b in itertools.combinations(sorted(set(ents)), 2):
            uf.union(f"E:{a}", f"E:{b}")
            edge_records.append(
                {
                    "source": f"E:{a}",
                    "target": f"E:{b}",
                    "source_type": entity_type_lookup.get(a, "entity"),
                    "target_type": entity_type_lookup.get(b, "entity"),
                    "edge_type": "co_mentions",
                    "weight": 1.0,
                }
            )

    if not edge_records:
        edges = pd.DataFrame(columns=["source", "target", "source_type", "target_type", "edge_type", "weight"])
    else:
        edges = pd.DataFrame(edge_records)

    sample_cluster = {}
    for sample_id in features["sample_id"]:
        sample_cluster[sample_id] = uf.find(f"S:{sample_id}")

    cluster_roots = {root: f"C{idx + 1:03d}" for idx, root in enumerate(sorted(set(sample_cluster.values())))}
    features_clustered = features.copy()
    features_clustered["cluster_id"] = features_clustered["sample_id"].map(lambda x: cluster_roots[sample_cluster[x]])

    entity_cluster_records = []
    for ent in sorted(set(entities["masked_entity"])):
        root = uf.find(f"E:{ent}")
        entity_cluster_records.append({"masked_entity": ent, "cluster_id": cluster_roots.get(root, "C000")})
    entity_clusters = pd.DataFrame(entity_cluster_records)

    if not entity_clusters.empty:
        entities = entities.merge(entity_clusters, on="masked_entity", how="left")
    else:
        entities["cluster_id"] = ""

    cluster_rows = []
    for cluster_id, group in features_clustered.groupby("cluster_id"):
        sample_ids = set(group["sample_id"])
        ents = entities[entities["sample_id"].isin(sample_ids)]
        platform_count = group["platform"].nunique()
        entity_count = ents["masked_entity"].nunique()
        domain_count = ents.loc[ents["entity_type"] == "domain", "masked_entity"].nunique()
        suspicious_share = float(group["weak_label"].mean()) if len(group) else 0.0
        promo_share = float((group["human_label"] == "promotional").mean()) if len(group) else 0.0
        avg_text_risk = float(group["text_risk_score"].mean()) if len(group) else 0.0
        try:
            dates = pd.to_datetime(group["timestamp"], errors="coerce").dropna()
            span_days = int((dates.max() - dates.min()).days) if len(dates) > 1 else 0
        except Exception:
            span_days = 0
        entity_density = entity_count / max(len(group), 1)
        cross_platform_score = min(platform_count / 4.0, 1.0)
        graph_score = min(math.log1p(entity_count) / math.log(12), 1.0)
        score = (
            0.36 * avg_text_risk
            + 0.22 * suspicious_share
            + 0.16 * graph_score
            + 0.12 * cross_platform_score
            + 0.08 * min(domain_count / 3.0, 1.0)
            + 0.06 * min(span_days / 120.0, 1.0)
        )
        cluster_rows.append(
            {
                "cluster_id": cluster_id,
                "sample_count": len(group),
                "entity_count": entity_count,
                "domain_count": domain_count,
                "platform_count": platform_count,
                "time_span_days": span_days,
                "suspicious_share": round(suspicious_share, 6),
                "promotional_share": round(promo_share, 6),
                "text_risk_mean": round(avg_text_risk, 6),
                "entity_density": round(entity_density, 6),
                "graph_score": round(graph_score, 6),
                "cluster_priority_seed_score": round(score, 6),
                "top_reasons": cluster_reasons(group, ents, platform_count, domain_count),
            }
        )

    clusters = pd.DataFrame(cluster_rows).sort_values("cluster_priority_seed_score", ascending=False)
    features_clustered.to_csv(PROCESSED_DIR / "content_features.csv", index=False)
    entities.to_csv(PROCESSED_DIR / "extracted_entities_masked.csv", index=False)
    edges.to_csv(PROCESSED_DIR / "entity_graph_edges.csv", index=False)
    clusters.to_csv(PROCESSED_DIR / "cluster_snapshot.csv", index=False)
    clusters.to_csv(TABLE_DIR / "cluster_snapshot.csv", index=False)
    return features_clustered, clusters


def cluster_reasons(group: pd.DataFrame, ents: pd.DataFrame, platform_count: int, domain_count: int) -> str:
    reasons = []
    if float(group["text_risk_score"].mean()) >= 0.65:
        reasons.append("high text promotion signal")
    if platform_count >= 3:
        reasons.append("cross-platform recurrence")
    if domain_count >= 2:
        reasons.append("multiple masked domains")
    if ents["entity_type"].nunique() >= 3:
        reasons.append("multi-entity evidence")
    if float(group["report_channel_score"].mean()) > 0.25:
        reasons.append("public-report channel overlap")
    if not reasons:
        reasons.append("low-confidence review candidate")
    return "; ".join(reasons[:4])


def write_source_status(raw_source: str, features: pd.DataFrame, clusters: pd.DataFrame) -> None:
    now = datetime.now().strftime("%Y-%m-%d")
    status_rows = []
    for item in SOURCE_CATALOG:
        status_rows.append(
            {
                **item,
                "retrieval_date": now,
                "row_level_used": "no",
                "notes": "Context source only unless lawful row-level export is supplied manually.",
            }
        )
    status_rows.append(
        {
            "source": raw_source,
            "url": str((RAW_DIR / raw_source).as_posix()),
            "role": "Row-level corpus for reproducible prototype.",
            "status": "loaded",
            "retrieval_date": now,
            "row_level_used": "yes",
            "notes": "Identifiers are masked in processed artifacts.",
        }
    )
    source_status = pd.DataFrame(status_rows)
    source_status.to_csv(TABLE_DIR / "source_status.csv", index=False)

    summary = pd.DataFrame(
        [
            {"metric": "content_samples", "value": len(features)},
            {"metric": "clusters", "value": len(clusters)},
            {"metric": "platforms", "value": features["platform"].nunique()},
            {"metric": "periods", "value": features["year_month"].nunique()},
            {"metric": "weak_positive_share", "value": round(float(features["weak_label"].mean()), 4)},
            {"metric": "processed_identifiers_masked", "value": "yes"},
            {"metric": "raw_source", "value": raw_source},
        ]
    )
    summary.to_csv(TABLE_DIR / "dataset_summary.csv", index=False)


def validate(features: pd.DataFrame, entities: pd.DataFrame) -> pd.DataFrame:
    checks = []
    checks.append({"check": "duplicate_sample_id", "status": "pass" if not features["sample_id"].duplicated().any() else "fail"})
    checks.append({"check": "missing_timestamp", "status": "pass" if features["timestamp"].notna().all() else "fail"})
    checks.append({"check": "missing_cluster_id", "status": "pass" if features["cluster_id"].astype(str).ne("").all() else "fail"})
    if len(entities):
        masked_ok = entities["masked_entity"].astype(str).str.match(r"^(domain|handle|phone|payment)_[a-f0-9]{12}$").all()
    else:
        masked_ok = True
    checks.append({"check": "processed_entities_masked", "status": "pass" if masked_ok else "fail"})
    checks.append({"check": "no_duplicate_sample_period", "status": "pass" if not features.duplicated(["sample_id", "year_month"]).any() else "fail"})
    out = pd.DataFrame(checks)
    out.to_csv(TABLE_DIR / "validation_checks.csv", index=False)
    if (out["status"] != "pass").any():
        raise RuntimeError("Dataset validation failed. See reports/tables/validation_checks.csv")
    return out


def main() -> None:
    ensure_dirs()
    raw, raw_source = load_or_generate_raw()
    features, entities = feature_rows(raw)
    features, clusters = build_graph(features, entities)
    masked_entities = pd.read_csv(PROCESSED_DIR / "extracted_entities_masked.csv")
    validate(features, masked_entities)
    write_source_status(raw_source, features, clusters)
    print(f"Built JudolFlow-X dataset: {len(features)} samples, {len(clusters)} clusters.")
    print(f"Source: {raw_source}")
    print(f"Outputs: {PROCESSED_DIR}")


if __name__ == "__main__":
    main()
