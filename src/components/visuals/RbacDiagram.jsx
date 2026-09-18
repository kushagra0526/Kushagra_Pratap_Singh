import React, { useRef } from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useRevealed from "../../hooks/useRevealed";
import VisualFrame from "./VisualFrame";

// Least privileged first, so "granted: n" reads as the first n permissions.
const PERMISSIONS = ["view", "reports", "content", "users", "billing"];

const TIERS = [
  { name: "Owner", granted: 5 },
  { name: "Manager", granted: 3 },
  { name: "Member", granted: 1 },
];

const FLOW = ["checkout", "order.created", "webhook · verify", "captured"];

export default function RbacDiagram() {
  const ref = useRef(null);
  const inView = useRevealed(ref, "-15% 0px");
  const reduced = usePrefersReducedMotion();
  const show = reduced || inView;

  return (
    <VisualFrame caption="three configurable tiers, and the payment path they guard">
      <div ref={ref} className="grid gap-6 md:grid-cols-[1.35fr_1fr] md:gap-8">
        {/* tiers */}
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.08em] text-dim uppercase">
            role → permissions
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {TIERS.map((tier, tierIndex) => (
              <motion.div
                key={tier.name}
                initial={reduced ? false : { opacity: 0, x: -10 }}
                animate={show ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: reduced ? 0 : 0.15 + tierIndex * 0.14 }}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3"
              >
                <span className="w-[4.6rem] font-display text-sm text-fg">{tier.name}</span>
                <div className="flex flex-wrap gap-1.5">
                  {PERMISSIONS.map((permission, permissionIndex) => {
                    const granted = permissionIndex < tier.granted;
                    return (
                      <span
                        key={permission}
                        className={`rounded-md px-2 py-1 font-mono text-[0.58rem] ${
                          granted
                            ? "bg-gold/15 text-gold ring-1 ring-gold/30"
                            : "bg-white/[0.03] text-white/22 ring-1 ring-white/6"
                        }`}
                      >
                        {permission}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* payment flow */}
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.08em] text-dim uppercase">
            razorpay path
          </p>

          <ol className="relative mt-4 flex flex-col gap-3 pl-5">
            <span className="absolute top-2 bottom-2 left-[5px] w-px bg-white/10" />
            {FLOW.map((step, stepIndex) => (
              <motion.li
                key={step}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={show ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: reduced ? 0 : 0.35 + stepIndex * 0.16 }}
                className="relative font-mono text-[0.68rem] text-muted"
              >
                <span
                  className={`absolute top-[0.42rem] -left-5 h-[9px] w-[9px] rounded-full ${
                    stepIndex === FLOW.length - 1 ? "bg-gold" : "bg-white/25"
                  }`}
                  style={
                    stepIndex === FLOW.length - 1 && !reduced
                      ? { animation: "pulse-dot 2.4s ease-in-out infinite" }
                      : undefined
                  }
                />
                {step}
              </motion.li>
            ))}
          </ol>

          <p className="mt-5 font-mono text-[0.6rem] text-dim">
            100+ / day · 99.9% uptime held
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}
