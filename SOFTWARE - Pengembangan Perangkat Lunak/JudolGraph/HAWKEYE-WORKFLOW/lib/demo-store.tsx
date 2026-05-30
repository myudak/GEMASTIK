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
  auditTrail: AuditEvent[];
  casePipeline: Record<string, number>;
  cases: DemoCase[];
  entities: DetectedEntity[];
  evidence: EvidenceItem[];
  graphEdges: GraphEdge[];
  graphNodes: GraphNode[];
  linkCheckResult: LinkCheckResult;
  publicReportMessage: string | null;
  riskSignals: RiskSignal[];
  selectedCaseId: string;
  selectedEvidenceId: string;
  selectedGraphNodeId: string;
};

type DemoAction =
  | { type: "advanceCasePipeline"; caseId: string; progress: number }
  | { type: "createCase"; input: SeedInput }
  | { type: "resetDemo" }
  | { type: "runLinkCheck"; input: string }
  | { type: "selectCase"; caseId: string }
  | { type: "selectEvidence"; evidenceId: string }
  | { type: "selectGraphNode"; nodeId: string }
  | { type: "setEntityReview"; decision: ReviewDecision; entityId: string }
  | { type: "setEvidenceReview"; decision: ReviewDecision; evidenceId: string }
  | { type: "setGraphNodeReview"; decision: ReviewDecision; nodeId: string }
  | { type: "setReviewDecision"; decision: ReviewDecision }
  | { type: "submitPublicReport"; input: string };

type DemoActions = {
  advanceCasePipeline: (caseId: string, progress: number) => void;
  createCase: (input: SeedInput) => { caseId?: string; message: string; ok: boolean };
  resetDemo: () => void;
  runLinkCheck: (input: string) => void;
  selectCase: (caseId: string) => void;
  selectEvidence: (evidenceId: string) => void;
  selectGraphNode: (nodeId: string) => void;
  setEntityReview: (entityId: string, decision: ReviewDecision) => void;
  setEvidenceReview: (evidenceId: string, decision: ReviewDecision) => void;
  setGraphNodeReview: (nodeId: string, decision: ReviewDecision) => void;
  setReviewDecision: (decision: ReviewDecision) => void;
  submitPublicReport: (input: string) => void;
};

const listeners = new Set<() => void>();
let state = createInitialState();

function createInitialState(): DemoState {
  return {
    auditTrail: initialAuditEvents,
    casePipeline: {
      "case-bonus-aman": 66,
      "case-mirror-cluster": 100,
      "case-public-report": 40,
      "case-slot-gacor88": 86,
    },
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

  if (action.type === "selectCase") return selectCaseState(current, action.caseId);
  if (action.type === "selectEvidence")
    return { ...current, selectedEvidenceId: action.evidenceId };
  if (action.type === "selectGraphNode") return { ...current, selectedGraphNodeId: action.nodeId };

  if (action.type === "advanceCasePipeline") {
    return {
      ...current,
      casePipeline: {
        ...current.casePipeline,
        [action.caseId]: Math.max(0, Math.min(100, action.progress)),
      },
    };
  }

  if (action.type === "createCase") return createCaseState(current, action.input);
  if (action.type === "setEvidenceReview")
    return setEvidenceReviewState(current, action.evidenceId, action.decision);
  if (action.type === "setEntityReview")
    return setEntityReviewState(current, action.entityId, action.decision);
  if (action.type === "setGraphNodeReview")
    return setGraphNodeReviewState(current, action.nodeId, action.decision);
  if (action.type === "setReviewDecision") return setCaseReviewState(current, action.decision);
  if (action.type === "runLinkCheck") return runLinkCheckState(current, action.input);

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

function selectCaseState(current: DemoState, caseId: string): DemoState {
  const selectedCase = current.cases.find((item) => item.id === caseId);
  const firstEvidenceId = selectedCase?.evidenceIds[0] ?? current.selectedEvidenceId;
  const firstGraphNodeId =
    current.graphNodes.find((item) => item.caseId === caseId)?.id ?? current.selectedGraphNodeId;

  return {
    ...current,
    selectedCaseId: caseId,
    selectedEvidenceId: firstEvidenceId,
    selectedGraphNodeId: firstGraphNodeId,
  };
}

function createCaseState(current: DemoState, input: SeedInput): DemoState {
  const seed = input.seed.trim();
  const caseName = input.caseName.trim() || `Investigasi ${seed}`;
  const now = "30 Mei 2026, 10:05 WIB";
  const caseId = nextCaseId(current);
  const newEvidenceId = `ev-demo-seed-${current.cases.length + 1}`;
  const newCase: DemoCase = {
    id: caseId,
    name: caseName,
    seed,
    status: "Investigasi",
    riskLevel: "Medium",
    riskScore: 48,
    updatedAt: now,
    summary: input.note.trim() || "Case demo dibuat dari input seed investigator.",
    evidenceIds: [newEvidenceId],
    entityIds: [],
    signalIds: ["sig-keyword-density"],
    reviewDecision: "Draft",
  };
  const newEvidence: EvidenceItem = {
    caseId,
    collectedAt: now,
    confidence: 72,
    description: "Seed masuk antrean demo untuk pengumpulan metadata dan screenshot publik.",
    entityIds: [],
    hash: "pending-demo-hash",
    id: newEvidenceId,
    kind: input.seedType === "url" ? "metadata" : "html",
    progress: 18,
    source: "Input investigator",
    status: "Draft",
    title: "Seed divalidasi",
    url: seed,
  };

  return {
    ...current,
    auditTrail: [
      {
        actor: "Andi Pratama",
        at: now,
        caseId,
        detail: `Seed ${seed} divalidasi sebagai sumber publik untuk simulasi.`,
        id: `audit-${caseId}`,
        action: "Case demo dibuat",
      },
      ...current.auditTrail,
    ],
    casePipeline: {
      ...current.casePipeline,
      [caseId]: 8,
    },
    cases: [newCase, ...current.cases],
    evidence: [newEvidence, ...current.evidence],
    selectedCaseId: caseId,
    selectedEvidenceId: newEvidenceId,
  };
}

function setEvidenceReviewState(
  current: DemoState,
  evidenceId: string,
  decision: ReviewDecision,
): DemoState {
  const evidence = current.evidence.find((item) => item.id === evidenceId);
  if (!evidence) return current;

  return {
    ...current,
    auditTrail: [
      reviewAudit(evidence.caseId, `Bukti ${decision}`, evidence.title),
      ...current.auditTrail,
    ],
    evidence: current.evidence.map((item) =>
      item.id === evidenceId
        ? { ...item, progress: decision === "Verified" ? 100 : item.progress, status: decision }
        : item,
    ),
  };
}

function setEntityReviewState(
  current: DemoState,
  entityId: string,
  decision: ReviewDecision,
): DemoState {
  const entity = current.entities.find((item) => item.id === entityId);
  if (!entity) return current;

  return {
    ...current,
    auditTrail: [
      reviewAudit(entity.caseId, `Entitas ${decision}`, entity.value),
      ...current.auditTrail,
    ],
    entities: current.entities.map((item) =>
      item.id === entityId ? { ...item, status: decision } : item,
    ),
  };
}

function setGraphNodeReviewState(
  current: DemoState,
  nodeId: string,
  decision: ReviewDecision,
): DemoState {
  const node = current.graphNodes.find((item) => item.id === nodeId);
  if (!node) return current;

  return {
    ...current,
    auditTrail: [
      reviewAudit(node.caseId, `Node graph ${decision}`, node.label),
      ...current.auditTrail,
    ],
    graphEdges: current.graphEdges.map((item) =>
      item.caseId === node.caseId &&
      (item.source === nodeId || item.target === nodeId) &&
      item.status !== "Rejected"
        ? { ...item, status: decision }
        : item,
    ),
    graphNodes: current.graphNodes.map((item) =>
      item.id === nodeId ? { ...item, status: decision } : item,
    ),
  };
}

function setCaseReviewState(current: DemoState, decision: ReviewDecision): DemoState {
  const selectedCase = current.cases.find((item) => item.id === current.selectedCaseId);
  const caseEvidenceIds = new Set(selectedCase?.evidenceIds ?? []);
  const caseEntityIds = new Set(selectedCase?.entityIds ?? []);
  const shouldApply = decision === "Verified" || decision === "Rejected";
  const now = "30 Mei 2026, 10:12 WIB";

  return {
    ...current,
    auditTrail: [
      {
        actor: "Andi Pratama",
        at: now,
        caseId: current.selectedCaseId,
        detail:
          decision === "Verified"
            ? "Bukti pending diset Verified dan dapat masuk laporan final."
            : decision === "Rejected"
              ? "Bukti pending tidak akan masuk laporan final."
              : "Investigator meminta bukti tambahan sebelum laporan final.",
        id: `audit-review-${Date.now()}`,
        action:
          decision === "Verified"
            ? "Case diverifikasi"
            : decision === "Rejected"
              ? "Case ditandai rejected"
              : "Case tetap perlu review",
      },
      ...current.auditTrail,
    ],
    cases: current.cases.map((item) =>
      item.id === current.selectedCaseId
        ? {
            ...item,
            reviewDecision: decision,
            status:
              decision === "Verified"
                ? "Verified"
                : decision === "Rejected"
                  ? "Rejected"
                  : "Need Review",
            updatedAt: now,
          }
        : item,
    ),
    entities: current.entities.map((item) =>
      shouldApply && caseEntityIds.has(item.id) && item.status === "Need Review"
        ? { ...item, status: decision }
        : item,
    ),
    evidence: current.evidence.map((item) =>
      shouldApply && caseEvidenceIds.has(item.id) && item.status === "Need Review"
        ? { ...item, progress: 100, status: decision }
        : item,
    ),
    graphEdges: current.graphEdges.map((item) =>
      shouldApply && item.caseId === current.selectedCaseId && item.status === "Need Review"
        ? { ...item, status: decision }
        : item,
    ),
    graphNodes: current.graphNodes.map((item) =>
      shouldApply && item.caseId === current.selectedCaseId && item.status === "Need Review"
        ? { ...item, status: decision }
        : item,
    ),
    riskSignals: current.riskSignals.map((item) =>
      shouldApply && item.status === "Need Review" ? { ...item, status: decision } : item,
    ),
  };
}

function runLinkCheckState(current: DemoState, inputValue: string): DemoState {
  const input = inputValue.trim();
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

export function useDemoStore(): DemoState & { actions: DemoActions } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const actions = useMemo<DemoActions>(
    () => ({
      advanceCasePipeline: (caseId, progress) =>
        dispatch({ caseId, progress, type: "advanceCasePipeline" }),
      createCase(input) {
        const seed = input.seed.trim();
        const isValid =
          seed.length > 3 &&
          (seed.startsWith("http://") || seed.startsWith("https://") || seed.includes("."));

        if (!isValid) {
          return {
            message: "Seed harus berupa URL atau domain publik yang dapat divalidasi.",
            ok: false,
          };
        }

        const caseId = nextCaseId(state);
        dispatch({ input, type: "createCase" });

        return { caseId, message: "Case demo dibuat dan masuk antrean crawler.", ok: true };
      },
      resetDemo: () => dispatch({ type: "resetDemo" }),
      runLinkCheck: (input) => dispatch({ input, type: "runLinkCheck" }),
      selectCase: (caseId) => dispatch({ caseId, type: "selectCase" }),
      selectEvidence: (evidenceId) => dispatch({ evidenceId, type: "selectEvidence" }),
      selectGraphNode: (nodeId) => dispatch({ nodeId, type: "selectGraphNode" }),
      setEntityReview: (entityId, decision) =>
        dispatch({ decision, entityId, type: "setEntityReview" }),
      setEvidenceReview: (evidenceId, decision) =>
        dispatch({ decision, evidenceId, type: "setEvidenceReview" }),
      setGraphNodeReview: (nodeId, decision) =>
        dispatch({ decision, nodeId, type: "setGraphNodeReview" }),
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

export function getCaseById(state: DemoState, caseId: string) {
  return state.cases.find((item) => item.id === caseId) ?? getSelectedCase(state);
}

export function getCaseRoute(caseId: string) {
  return `/cases/${caseId}`;
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

export function getCaseProgress(state: DemoState, caseId = state.selectedCaseId) {
  const evidence = getCaseEvidence(state, caseId);
  if (state.casePipeline[caseId] !== undefined) return state.casePipeline[caseId];
  if (evidence.length === 0) return 0;

  return Math.round(evidence.reduce((total, item) => total + item.progress, 0) / evidence.length);
}

export function getCaseReviewSummary(state: DemoState, caseId = state.selectedCaseId) {
  const evidence = getCaseEvidence(state, caseId);
  const entities = getCaseEntities(state, caseId);
  const graphNodes = state.graphNodes.filter((item) => item.caseId === caseId);
  const unresolvedEvidence = evidence.filter((item) => item.status === "Need Review").length;
  const unresolvedEntities = entities.filter((item) => item.status === "Need Review").length;
  const unresolvedGraphNodes = graphNodes.filter((item) => item.status === "Need Review").length;

  return {
    draft:
      evidence.filter((item) => item.status === "Draft").length +
      entities.filter((item) => item.status === "Draft").length +
      graphNodes.filter((item) => item.status === "Draft").length,
    rejected:
      evidence.filter((item) => item.status === "Rejected").length +
      entities.filter((item) => item.status === "Rejected").length +
      graphNodes.filter((item) => item.status === "Rejected").length,
    unresolvedEntities,
    unresolvedEvidence,
    unresolvedGraphNodes,
    unresolvedTotal: unresolvedEvidence + unresolvedEntities + unresolvedGraphNodes,
    verified:
      evidence.filter((item) => item.status === "Verified").length +
      entities.filter((item) => item.status === "Verified").length +
      graphNodes.filter((item) => item.status === "Verified").length,
  };
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
  const pendingReviewCount = getCaseReviewSummary(state).unresolvedTotal;

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

function nextCaseId(current: DemoState) {
  return `case-demo-${current.cases.length + 1}`;
}

function reviewAudit(caseId: string, action: string, detail: string): AuditEvent {
  return {
    action,
    actor: "Andi Pratama",
    at: "30 Mei 2026, 10:18 WIB",
    caseId,
    detail,
    id: `audit-${caseId}-${Date.now()}`,
  };
}
