import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

// The election app reads browser storage and window state on first render,
// so it is loaded only in the browser.
const App = lazy(() => import("./App"));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center apc-diamond-pattern">
      <div className="h-10 w-10 rounded-full border-4 border-[#D0DFEE] border-t-[#0060A8] animate-spin" />
    </div>
  );
}

export function ElectionClient() {
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </ClientOnly>
  );
}
