"use client";

import React from "react";
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const ARJSViewer: any = dynamicImport(
  () => import("../../components/ReportViewer").then((m) => m.default),
  { ssr: false }
);

export default function ViewerPage() {
  const viewerRef = React.useRef<any>(null);

  React.useEffect(() => {}, []);

  return (
    <div className="min-h-screen w-full p-6">
      <h2 className="text-2xl font-semibold mb-4">Viewer</h2>
      <div style={{ height: "80vh", width: "100%" }}>
        <ARJSViewer
          reportUri="/reports/financial.rdlx-json"
          zoom={"FitToWidth"}
        />
      </div>
    </div>
  );
}
