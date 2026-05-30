"use client";

import {
  Code,
  GlobeHemisphereWest,
  ImageSquare,
  Link as LinkIcon,
  PaperPlaneTilt,
  Tag,
  UserCircle,
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
import { useMemo } from "react";

import { useThemeMode } from "@/components/workflow/theme-mode";
import { cn } from "@/lib/utils";
import type { GraphEdge, GraphNode, GraphNodeType, VerificationStatus } from "@/lib/workflow-data";

type EvidenceNodeData = GraphNode & {
  selected: boolean;
};

type EvidenceEdgeData = {
  label: string;
  status: VerificationStatus;
};

type FlowColorMode = "dark" | "light";

const nodeTypes = {
  evidence: EvidenceNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

export function EvidenceFlow({
  edges,
  nodes,
  onSelectNode,
  selectedNodeId,
}: {
  edges: GraphEdge[];
  nodes: GraphNode[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
}) {
  const colorMode: FlowColorMode = useThemeMode();
  const flowNodes = useMemo<Node<EvidenceNodeData>[]>(
    () =>
      nodes.map((node) => ({
        data: { ...node, selected: node.id === selectedNodeId },
        id: node.id,
        position: node.position,
        type: "evidence",
      })),
    [nodes, selectedNodeId],
  );
  const visibleNodeIds = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const flowEdges = useMemo<Edge<EvidenceEdgeData>[]>(() => {
    const nextEdges: Edge<EvidenceEdgeData>[] = [];

    for (const edge of edges) {
      if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
        nextEdges.push({
          data: { label: edge.relation, status: edge.status },
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "labeled",
        });
      }
    }

    return nextEdges;
  }, [edges, visibleNodeIds]);

  return (
    <div className="h-[520px] overflow-hidden rounded-lg">
      <ReactFlow
        className="hawkeye-flow"
        colorMode={colorMode}
        edges={flowEdges}
        edgesFocusable={false}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        maxZoom={1.16}
        minZoom={0.56}
        nodes={flowNodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectNode(node.id)}
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
    alias: UserCircle,
    channel: PaperPlaneTilt,
    domain: GlobeHemisphereWest,
    html: Code,
    keyword: Tag,
    mirror: GlobeHemisphereWest,
    payment: Wallet,
    referral: LinkIcon,
    screenshot: ImageSquare,
  } satisfies Record<GraphNodeType, typeof GlobeHemisphereWest>;

  const NodeIcon = Icon[data.type];

  return (
    <button
      className={cn(
        "relative flex w-[238px] items-center gap-3 rounded-lg border border-border bg-card/95 p-4 text-left shadow-xl transition",
        data.riskLevel === "Critical" && "border-destructive/45 bg-destructive/10",
        data.status === "Verified" && "border-emerald-500/35",
        data.status === "Rejected" && "opacity-55",
        data.selected && "border-primary bg-primary/14 ring-2 ring-primary/30",
      )}
      type="button"
    >
      <Handle className="opacity-0" id="top" position={Position.Top} type="target" />
      <Handle className="opacity-0" id="bottom" position={Position.Bottom} type="source" />
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
        <NodeIcon aria-hidden size={28} weight="duotone" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold text-foreground">{data.label}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {data.subtitle} · {data.score}
        </span>
      </span>
    </button>
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
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });
  const rejected = data?.status === "Rejected";

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          ...style,
          opacity: rejected ? 0.36 : 0.88,
          stroke: rejected
            ? "color-mix(in oklch, var(--muted-foreground) 48%, transparent)"
            : "color-mix(in oklch, var(--primary) 58%, var(--border))",
          strokeDasharray: rejected ? "3 7" : "7 7",
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
