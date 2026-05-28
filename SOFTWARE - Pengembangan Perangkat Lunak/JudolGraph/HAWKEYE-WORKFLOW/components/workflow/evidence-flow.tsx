"use client";

import {
  Desktop,
  GlobeHemisphereWest,
  ImageSquare,
  PaperPlaneTilt,
  Wallet,
} from "@phosphor-icons/react";
import {
  BaseEdge,
  Background,
  BackgroundVariant,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  getBezierPath,
} from "@xyflow/react";

import { cn } from "@/lib/utils";

type EvidenceNodeData = {
  icon: "channel" | "payment" | "domain" | "mirror" | "image";
  title: string;
  subtitle: string;
  focus?: boolean;
};

type EvidenceEdgeData = {
  label: string;
};

const evidenceNodes = [
  {
    id: "channel",
    type: "evidence",
    position: { x: 20, y: 28 },
    data: {
      icon: "channel",
      title: "promo-tg88",
      subtitle: "kanal publik",
    },
  },
  {
    id: "payment",
    type: "evidence",
    position: { x: 560, y: 28 },
    data: {
      icon: "payment",
      title: "DANA 0812-xxxx-5678",
      subtitle: "indikasi pembayaran",
    },
  },
  {
    id: "domain",
    type: "evidence",
    position: { x: 280, y: 190 },
    data: {
      icon: "domain",
      title: "slot-gacor88.xyz",
      subtitle: "Domain Utama",
      focus: true,
    },
  },
  {
    id: "mirror",
    type: "evidence",
    position: { x: 42, y: 342 },
    data: {
      icon: "mirror",
      title: "Mirror Cluster A",
      subtitle: "mirror",
    },
  },
  {
    id: "screenshot",
    type: "evidence",
    position: { x: 570, y: 342 },
    data: {
      icon: "image",
      title: "screenshot_001",
      subtitle: "bukti visual",
    },
  },
] satisfies Node<EvidenceNodeData>[];

const evidenceEdges = [
  {
    id: "channel-domain",
    source: "channel",
    target: "domain",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "labeled",
    data: { label: "mengarah ke" },
  },
  {
    id: "payment-domain",
    source: "payment",
    target: "domain",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "labeled",
    data: { label: "menerima bayar dari" },
  },
  {
    id: "domain-mirror",
    source: "domain",
    target: "mirror",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "labeled",
    data: { label: "mirror dari" },
  },
  {
    id: "domain-screenshot",
    source: "domain",
    target: "screenshot",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "labeled",
    data: { label: "bukti visual" },
  },
] satisfies Edge<EvidenceEdgeData>[];

const nodeTypes = {
  evidence: EvidenceNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

export function EvidenceFlow() {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg">
      <ReactFlow
        className="hawkeye-flow"
        colorMode="dark"
        defaultEdges={evidenceEdges}
        defaultNodes={evidenceNodes}
        edgesFocusable={false}
        edgeTypes={edgeTypes}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        maxZoom={1.1}
        minZoom={0.68}
        nodesFocusable={false}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        nodesDraggable={false}
        panOnDrag={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
        preventScrolling={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
      >
        <Background
          bgColor="transparent"
          color="color-mix(in oklch, var(--border) 48%, transparent)"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}

function EvidenceNode({ data }: NodeProps<Node<EvidenceNodeData>>) {
  const Icon = {
    channel: PaperPlaneTilt,
    payment: Wallet,
    domain: GlobeHemisphereWest,
    mirror: Desktop,
    image: ImageSquare,
  }[data.icon];

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-lg border border-border bg-card/90 p-5 shadow-xl",
        data.focus ? "w-[336px] border-primary bg-primary/10" : "w-72",
      )}
    >
      <Handle className="opacity-0" id="top" position={Position.Top} type="target" />
      <Handle className="opacity-0" id="bottom" position={Position.Bottom} type="source" />
      <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
        <Icon aria-hidden size={34} weight="duotone" />
      </span>
      <div>
        <p className="text-xl font-bold text-foreground">{data.title}</p>
        <p className="mt-1 text-lg text-muted-foreground">{data.subtitle}</p>
      </div>
    </div>
  );
}

function LabeledEdge({
  data,
  id,
  markerEnd,
  sourceX,
  sourceY,
  sourcePosition,
  style,
  targetX,
  targetY,
  targetPosition,
}: EdgeProps<Edge<EvidenceEdgeData>>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          ...style,
          stroke: "color-mix(in oklch, var(--primary) 58%, var(--border))",
          strokeDasharray: "7 7",
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
