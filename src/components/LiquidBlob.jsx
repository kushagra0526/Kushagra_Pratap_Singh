import React, { Suspense, lazy } from "react";

const LiquidBlobScene = lazy(() => import("./LiquidBlobScene"));

/** Thin wrapper so the WebGL code splits into its own chunk, loaded after
 * everything the first paint actually needs. */
export default function LiquidBlob({ reduced = false }) {
  return (
    <Suspense fallback={null}>
      <LiquidBlobScene reduced={reduced} />
    </Suspense>
  );
}
