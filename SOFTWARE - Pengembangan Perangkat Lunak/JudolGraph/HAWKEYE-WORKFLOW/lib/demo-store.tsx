"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  type AuditEvent,
  type DemoCase,
  type DetectedEntity,
  type EvidenceItem,
  type GraphEdge,
  type GraphNode,
  type LinkCheckResult,
  type ReportDocumentData,
  type ReviewDecision,
  type SeedInput,
  type VerificationStatus,
  initialAuditEvents,
  initialCases,
  initialEntities,
  initialEvidence,
  initialGraphEdges,
  initialGraphNodes,
  initialLinkCheckResult,
  initialRiskSignals,
  type RiskSignal,
} from "@/lib/workflow-data";

export type DemoState = {
  cases: DemoCase[];
  evidence: EvidenceItem[];
  entities: DetectedEntity[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  riskSignals: RiskSignal[];
  auditTrail: AuditEvent[];
  selectedCaseId: string;
  selectedEvidenceId: string;
  selectedGraphNodeId: string;
  linkCheckResult: LinkCheckResult;
  publicReportMessage: string | null;
};

type DemoAction =
  | { type: "selectCase"; caseId: string }
  | { type: "selectEvidence"; evidenceId: string }
  | { type: "selectGraphNode"; nodeId: string }
  | { type: "createCase"; input: SeedInput }
  | { type: "setReviewDecision"; decision: ReviewDecision }
  | { type: "runLinkCheck"; input: string }
  | { type: "submitPublicReport"; input: string }
  | { type: "resetDemo" };

type DemoActions = {
  createCase: (input: SeedInput) => { ok: boolean; message: string };
  selectCase: (caseId: string) => void;
  selectEvidence: (evidenceId: string) => void;
  selectGraphNode: (nodeId: string) => void;
  runLinkCheck: (input: string) => void;
  setReviewDecision: (decision: ReviewDecision) => void;
  submitPublicReport: (input: string) => void;
  resetDemo: () => void;
};

const listeners = new Set<() => void>();
let state = createInitialState();

function createInitialState(): DemoState {
  return {
    auditTrail: initialAuditEvents,
    cases: initialCases,
    entities: initialEntities,
    evidence: initialEvidence,
    graphEdges: initialGraphEdges,
    graphNodes: initialGraphNodes,
    linkCheckResult: initialLinkCheckResult,
    publicReportMessage: null,
    riskSignals: initialRiskSignals,
    selectedCaseId: "case-slot-gacor88",
    selectedEvidenceId: "ev-screenshot-promo",
    selectedGraphNodeId: "node-domain-root",
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function dispatch(action: DemoAction) {
  state = reducer(state, action);
  listeners.forEach((listener) => listener());
}

function reducer(current: DemoState, action: DemoAction): DemoState {
  if (action.type === "resetDemo") return createInitialState();

  if (action.type === "selectCase") {
    const selectedCase = current.cases.find((item) => item.id === action.caseId);
    const firstEvidenceId = selectedCase?.evidenceIds[0] ?? current.selectedEvidenceId;
    const firstGraphNodeId =
      current.graphNodes.find((item) => item.caseId === action.caseId)?.id ??
      current.selectedGraphNodeId;

    return {
      ...current,
      selectedCaseId: action.caseId,
      selectedEvidenceId: firstEvidenceId,
      selectedGraphNodeId: firstGraphNodeId,
    };
  }

  if (action.type === "selectEvidence")
    return { ...current, selectedEvidenceId: action.evidenceId };
  if (action.type === "selectGraphNode") return { ...current, selectedGraphNodeId: action.nodeId };

  if (action.type === "createCase") {
    const seed = action.input.seed.trim();
    const caseName = action.input.caseName.trim() || `Investigasi ${seed}`;
    const now = "30 Mei 2026, 10:05 WIB";
    const caseId = `case-demo-${current.cases.length + 1}`;
    const newEvidenceId = `ev-demo-seed-${current.cases.length + 1}`;
    const newCase: DemoCase = {
      id: caseId,
      name: caseName,
      seed,
      status: "Investigasi",
      riskLevel: "Medium",
      riskScore: 48,
      updatedAt: now,
      summary: action.input.note.trim() || "Case demo dibuat dari input seed investigator.",
      evidenceIds: [newEvidenceId],
      entityIds: [],
      signalIds: ["sig-keyword-density"],
      reviewDecision: "Draft",
    };
    const newEvidence: EvidenceItem = {
      id: newEvidenceId,
      caseId,
      kind: action.input.seedType === "url" ? "metadata" : "html",
      title: "Seed divalidasi",
      source: "Input investigator",
      url: seed,
      status: "Draft",
      collectedAt: now,
      progress: 18,
      confidence: 72,
      hash: "pending-demo-hash",
      description: "Seed masuk antrean demo untuk pengumpulan metadata dan screenshot publik.",
      entityIds: [],
    };

    return {
      ...current,
      auditTrail: [
        {
          id: `audit-${caseId}`,
          caseId,
          at: now,
          actor: "Andi Pratama",
          action: "Case demo dibuat",
          detail: `Seed ${seed} divalidasi sebagai sumber publik untuk simulasi.`,
        },
        ...current.auditTrail,
      ],
      cases: [newCase, ...current.cases],
      evidence: [newEvidence, ...current.evidence],
      selectedCaseId: caseId,
      selectedEvidenceId: newEvidenceId,
    };
  }

  if (action.type === "setReviewDecision") {
    const selectedCase = current.cases.find((item) => item.id === current.selectedCaseId);
    const caseEvidenceIds = new Set(selectedCase?.evidenceIds ?? []);
    const caseEntityIds = new Set(selectedCase?.entityIds ?? []);
    const nextStatus = action.decision;
    const now = "30 Mei 2026, 10:12 WIB";
    const shouldApply = action.decision === "Verified" || action.decision === "Rejected";

    return {
      ...current,
      auditTrail: [
        {
          id: `audit-review-${Date.now()}`,
          caseId: current.selectedCaseId,
          at: now,
          actor: "Andi Pratama",
          action:
            action.decision === "Verified"
              ? "Case diverifikasi"
              : action.decision === "Rejected"
                ? "Case ditandai rejected"
                : "Case tetap perlu review",
          detail:
            action.decision === "Verified"
              ? "Bukti pending diset Verified dan dapat masuk laporan final."
              : action.decision === "Rejected"
                ? "Bukti pending tidak akan masuk laporan final."
                : "Investigator meminta bukti tambahan sebelum laporan final.",
        },
        ...current.auditTrail,
      ],
      cases: current.cases.map((item) =>
        item.id === current.selectedCaseId
          ? {
              ...item,
              reviewDecision: nextStatus,
              status:
                action.decision === "Verified"
                  ? "Verified"
                  : action.decision === "Rejected"
                    ? "Rejected"
                    : "Need Review",
              updatedAt: now,
            }
          : item,
      ),
      entities: current.entities.map((item) =>
        shouldApply && caseEntityIds.has(item.id) && item.status === "Need Review"
          ? { ...item, status: nextStatus }
          : item,
      ),
      evidence: current.evidence.map((item) =>
        shouldApply && caseEvidenceIds.has(item.id) && item.status === "Need Review"
          ? { ...item, status: nextStatus, progress: 100 }
          : item,
      ),
      graphEdges: current.graphEdges.map((item) =>
        shouldApply && item.caseId === current.selectedCaseId && item.status === "Need Review"
          ? { ...item, status: nextStatus }
          : item,
      ),
      graphNodes: current.graphNodes.map((item) =>
        shouldApply && item.caseId === current.selectedCaseId && item.status === "Need Review"
          ? { ...item, status: nextStatus }
          : item,
      ),
      riskSignals: current.riskSignals.map((item) =>
        shouldApply && item.status === "Need Review" ? { ...item, status: nextStatus } : item,
      ),
    };
  }

  if (action.type === "runLinkCheck") {
    const input = action.input.trim();
    const normalized = input.toLowerCase();
    const highSignals = ["slot", "gacor", "rtp", "deposit", "bonus"];
    const mediumSignals = ["promo", "ref", ".xyz", "mirror"];
    const highMatches = highSignals.filter((item) => normalized.includes(item));
    const mediumMatches = mediumSignals.filter((item) => normalized.includes(item));
    const score = Math.min(92, 18 + highMatches.length * 19 + mediumMatches.length * 11);
    const level =
      score >= 70 ? "Indikasi Tinggi" : score >= 40 ? "Indikasi Sedang" : "Indikasi Rendah";

    return {
      ...current,
      linkCheckResult: {
        input: input || "example.com",
        level,
        score,
        description:
          level === "Indikasi Tinggi"
            ? "Pola kata kunci dan referral publik terlihat kuat. Hasil tetap indikatif dan perlu investigator."
            : level === "Indikasi Sedang"
              ? "Ada beberapa pola umum yang layak ditinjau, tetapi belum cukup untuk laporan investigasi."
              : "Tidak ada sinyal kuat pada pencocokan terbatas publik.",
        signals: [...highMatches, ...mediumMatches].map((item) => `pola "${item}" terdeteksi`),
      },
    };
  }

  if (action.type === "submitPublicReport") {
    return {
      ...current,
      publicReportMessage: action.input.trim()
        ? "Laporan demo masuk antrean kurasi investigator."
        : "Masukkan URL atau domain sebelum mengirim laporan demo.",
    };
  }

  return current;
}

export function useDemoStore(): DemoState & { actions: DemoActions } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const actions = useMemo<DemoActions>(
    () => ({
      createCase(input) {
        const seed = input.seed.trim();
        const isValid =
          seed.length > 3 &&
          (seed.startsWith("http://") || seed.startsWith("https://") || seed.includes("."));

        if (!isValid) {
          return {
            ok: false,
            message: "Seed harus berupa URL atau domain publik yang dapat divalidasi.",
          };
        }

        dispatch({ input, type: "createCase" });

        return { ok: true, message: "Case demo dibuat dan masuk antrean crawler." };
      },
      resetDemo: () => dispatch({ type: "resetDemo" }),
      runLinkCheck: (input) => dispatch({ input, type: "runLinkCheck" }),
      selectCase: (caseId) => dispatch({ caseId, type: "selectCase" }),
      selectEvidence: (evidenceId) => dispatch({ evidenceId, type: "selectEvidence" }),
      selectGraphNode: (nodeId) => dispatch({ nodeId, type: "selectGraphNode" }),
      setReviewDecision: (decision) => dispatch({ decision, type: "setReviewDecision" }),
      submitPublicReport: (input) => dispatch({ input, type: "submitPublicReport" }),
    }),
    [],
  );

  return useMemo(() => ({ ...snapshot, actions }), [actions, snapshot]);
}

export function getSelectedCase(state: DemoState) {
  return state.cases.find((item) => item.id === state.selectedCaseId) ?? state.cases[0];
}

export function getCaseEvidence(state: DemoState, caseId = state.selectedCaseId) {
  const selectedCase = state.cases.find((item) => item.id === caseId);
  const ids = new Set(selectedCase?.evidenceIds ?? []);

  return state.evidence.filter((item) => ids.has(item.id));
}

export function getCaseEntities(state: DemoState, caseId = state.selectedCaseId) {
  const selectedCase = state.cases.find((item) => item.id === caseId);
  const ids = new Set(selectedCase?.entityIds ?? []);

  return state.entities.filter((item) => ids.has(item.id));
}

export function getSelectedEvidence(state: DemoState) {
  return (
    state.evidence.find((item) => item.id === state.selectedEvidenceId) ??
    getCaseEvidence(state)[0] ??
    state.evidence[0]
  );
}

export function getSelectedGraphNode(state: DemoState) {
  const selectedCase = getSelectedCase(state);

  return (
    state.graphNodes.find(
      (item) => item.id === state.selectedGraphNodeId && item.caseId === selectedCase.id,
    ) ??
    state.graphNodes.find((item) => item.caseId === selectedCase.id) ??
    state.graphNodes[0]
  );
}

export function createReportData(state: DemoState): ReportDocumentData {
  const selectedCase = getSelectedCase(state);
  const evidence = getCaseEvidence(state).filter((item) => item.status === "Verified");
  const entities = getCaseEntities(state).filter((item) => item.status === "Verified");
  const graphNodeCount = state.graphNodes.filter((item) => item.caseId === selectedCase.id).length;
  const graphEdgeCount = state.graphEdges.filter((item) => item.caseId === selectedCase.id).length;
  const riskSignals = state.riskSignals.filter((item) => item.status === "Verified");
  const pendingReviewCount = getCaseEvidence(state).filter(
    (item) => item.status === "Need Review",
  ).length;

  return {
    auditTrail: state.auditTrail.filter((item) => item.caseId === selectedCase.id).slice(0, 8),
    case: selectedCase,
    entities,
    evidence,
    executiveSummary:
      "Laporan demo ini memuat bukti dan entitas yang sudah diverifikasi manusia. Bukti berstatus Need Review atau Rejected tidak dimasukkan ke lampiran final.",
    generatedAt: "30 Mei 2026, 10:15 WIB",
    graphSummary: `${graphNodeCount} node dan ${graphEdgeCount} relasi tersedia pada evidence graph case terpilih.`,
    pendingReviewCount,
    riskSignals,
    title: "Laporan Investigasi HAWKEYE",
  };
}

export function statusTone(status: VerificationStatus) {
  if (status === "Verified") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Need Review") return "warn";

  return "neutral";
}
