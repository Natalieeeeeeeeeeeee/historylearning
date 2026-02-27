"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SectionKey = "causes" | "developments" | "results" | "significance";

const sectionLabels: Record<SectionKey, string> = {
  causes: "Nguyên nhân",
  developments: "Diễn biến",
  results: "Kết quả",
  significance: "Ý nghĩa"
};

export function Mindmap({ data }: { data: HistoryResponse }) {
  const initial = useMemo(() => buildNodesEdges(data), [data]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [labelEdit, setLabelEdit] = useState("");
  const [newText, setNewText] = useState("");
  const [newSection, setNewSection] = useState<SectionKey>("causes");
  const [fullscreen, setFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
    setSelectedId(null);
    setLabelEdit("");
  }, [initial.nodes, initial.edges, setNodes, setEdges]);

  const handleNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
    setLabelEdit(String(node.data?.label || ""));
  }, []);

  const handleSaveLabel = () => {
    if (!selectedId) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, label: labelEdit || "..." } } : n))
    );
  };

  const handleAddNode = () => {
    if (!newText.trim()) return;
    const baseId = `${newSection}-${Date.now()}`;
    const parent = nodes.find((n) => n.id === newSection);
    const pos = parent
      ? { x: parent.position.x + 100 * Math.random(), y: parent.position.y + 80 + Math.random() * 40 }
      : { x: Math.random() * 200, y: Math.random() * 200 };
    setNodes((nds) => [
      ...nds,
      {
        id: baseId,
        data: { label: newText },
        position: pos,
        style: {
          padding: 8,
          borderRadius: 10,
          background: "#fff",
          border: "1px solid #e2e8f0",
          fontSize: 12,
          maxWidth: 180
        }
      }
    ]);
    setEdges((eds) => [...eds, { id: `edge-${baseId}`, source: newSection, target: baseId, type: "smoothstep" }]);
    setNewText("");
  };

  const handleExport = async () => {
    if (!wrapperRef.current) return;
    try {
      const dataUrl = await toPng(wrapperRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = "mindmap.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export mindmap error", err);
    }
  };

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 bg-white p-4 sm:p-6"
    : "relative rounded-2xl border bg-white shadow-inner";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setFullscreen((v) => !v)}>
          {fullscreen ? "Thoát toàn màn" : "Phóng to"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
          Xuất hình
        </Button>
        <Button size="sm" variant="outline" onClick={() => setNodes(initial.nodes)}>
          Reset layout
        </Button>
      </div>

      <div className={containerClass} ref={wrapperRef} style={{ height: fullscreen ? "90vh" : 420 }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange as OnNodesChange}
            onEdgesChange={onEdgesChange as OnEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            nodesDraggable
            nodesConnectable={false}
            panOnScroll
            selectionOnDrag
            zoomOnScroll
            zoomOnPinch
            proOptions={{ hideAttribution: true }}
          >
            <Background className="opacity-60" />
            <MiniMap pannable zoomable />
            <Controls showInteractive />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start">
        <div className="text-sm text-muted-foreground">
          Chọn node để sửa nội dung, kéo thả tự do. Enter để lưu.
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Input
            placeholder="Sửa tiêu đề node"
            value={labelEdit}
            onChange={(e) => setLabelEdit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveLabel();
              }
            }}
            disabled={!selectedId}
          />
          <Button onClick={handleSaveLabel} disabled={!selectedId}>
            Lưu
          </Button>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Input
            placeholder="Thêm nội dung mới"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNode();
              }
            }}
          />
          <select
            className="h-10 rounded-md border px-2 text-sm"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value as SectionKey)}
          >
            <option value="causes">Nguyên nhân</option>
            <option value="developments">Diễn biến</option>
            <option value="results">Kết quả</option>
            <option value="significance">Ý nghĩa</option>
          </select>
          <Button onClick={handleAddNode}>Thêm</Button>
        </div>
      </div>
    </div>
  );
}

function buildNodesEdges(data: HistoryResponse) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: "event",
    data: { label: data.event_name },
    position: { x: 0, y: 0 },
    style: {
      padding: 12,
      borderRadius: 12,
      background: "#2563eb",
      color: "white",
      fontWeight: 700
    }
  });

  const radius = 200;
  const sections: SectionKey[] = ["causes", "developments", "results", "significance"];

  sections.forEach((key, index) => {
    const angle = (index / sections.length) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const nodeId = key;
    nodes.push({
      id: nodeId,
      data: { label: sectionLabels[key] },
      position: { x, y },
      style: {
        padding: 10,
        borderRadius: 10,
        background: "#e0ecff",
        border: "1px solid #bfdbfe",
        fontWeight: 600
      }
    });
    edges.push({ id: `edge-${nodeId}`, source: "event", target: nodeId, animated: true });

    const items = data[key];
    items.forEach((item, idx) => {
      const childId = `${nodeId}-${idx}`;
      nodes.push({
        id: childId,
        data: { label: "title" in item ? item.title : "step" in item ? item.step : "" },
        position: { x: x + 120 * Math.cos(angle) + (idx % 2 === 0 ? 30 : -30), y: y + idx * 55 },
        style: {
          padding: 8,
          borderRadius: 10,
          background: "#fff",
          border: "1px solid #e2e8f0",
          fontSize: 12,
          maxWidth: 180
        }
      });
      edges.push({ id: `edge-${nodeId}-${idx}`, source: nodeId, target: childId, animated: false, type: "smoothstep" });
    });
  });

  return { nodes, edges };
}
