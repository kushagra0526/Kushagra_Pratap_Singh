import React from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import VisualFrame from "./VisualFrame";

const NODES = [
  { x: 110, label: "user" },
  { x: 320, label: "product" },
  { x: 530, label: "order" },
];

const NODE_Y = 122;
const NODE_W = 132;
const NODE_H = 40;
const BUS_Y = 206;

function Node({ x, y, w, h, label, sub, accent }) {
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx="12"
        fill="rgba(255,253,238,0.04)"
        stroke={accent ? "rgba(237,179,88,0.5)" : "rgba(255,253,238,0.16)"}
      />
      <text
        x={x}
        y={sub ? y - 1 : y + 4}
        textAnchor="middle"
        className="fill-[#fffdee] font-mono"
        style={{ fontSize: 11 }}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x}
          y={y + 12}
          textAnchor="middle"
          className="fill-[#7c8794] font-mono"
          style={{ fontSize: 8 }}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export default function ServiceGraph() {
  const reduced = usePrefersReducedMotion();

  return (
    <VisualFrame caption="jwt + rbac at the gateway; services never call each other directly">
      <svg viewBox="0 0 640 250" className="h-auto w-full" role="img" aria-label="Three services behind a GraphQL gateway, communicating over a Kafka event bus">
        {/* gateway → services */}
        {NODES.map((node) => (
          <path
            key={`edge-${node.label}`}
            d={`M320,58 C320,88 ${node.x},72 ${node.x},${NODE_Y - NODE_H / 2}`}
            fill="none"
            stroke="rgba(255,253,238,0.16)"
            strokeWidth="1"
          />
        ))}

        {/* services → bus */}
        {NODES.map((node) => (
          <line
            key={`bus-${node.label}`}
            x1={node.x}
            y1={NODE_Y + NODE_H / 2}
            x2={node.x}
            y2={BUS_Y - 14}
            stroke="rgba(255,253,238,0.14)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        {/* kafka bus */}
        <rect
          x="60"
          y={BUS_Y - 14}
          width="520"
          height="28"
          rx="14"
          fill="rgba(125,155,214,0.07)"
          stroke="rgba(125,155,214,0.3)"
        />
        <text
          x="320"
          y={BUS_Y + 4}
          textAnchor="middle"
          className="fill-[#7d9bd6] font-mono"
          style={{ fontSize: 9, letterSpacing: "0.08em" }}
        >
          kafka · event log
        </text>

        {/* nodes */}
        <Node x={320} y={38} w={190} h={40} label="GraphQL gateway" sub="apollo · jwt · rbac" accent />
        {NODES.map((node) => (
          <Node
            key={node.label}
            x={node.x}
            y={NODE_Y}
            w={NODE_W}
            h={NODE_H}
            label={node.label}
            sub="node · express"
          />
        ))}

        {/* travelling events */}
        {!reduced ? (
          <>
            <circle r="3.2" fill="#7d9bd6">
              <animateMotion
                dur="4.2s"
                repeatCount="indefinite"
                path={`M110,${NODE_Y + NODE_H / 2} L110,${BUS_Y} L530,${BUS_Y} L530,${NODE_Y + NODE_H / 2}`}
              />
            </circle>
            <circle r="3.2" fill="#edb358">
              <animateMotion
                dur="5.4s"
                begin="1.4s"
                repeatCount="indefinite"
                path={`M320,${NODE_Y + NODE_H / 2} L320,${BUS_Y} L110,${BUS_Y} L110,${NODE_Y + NODE_H / 2}`}
              />
            </circle>
          </>
        ) : null}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.6rem] text-dim">
        <span>order.created</span>
        <span>stock.reserved</span>
        <span>user.updated</span>
        <span className="text-mint">docker · github actions</span>
      </div>
    </VisualFrame>
  );
}
