"use client";

import React from "react";
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const ARJSViewer: any = dynamicImport(
  () => import("../../components/ReportViewer").then((m) => m.default),
  { ssr: false }
);
const ARJSDesigner = dynamicImport(
  () => import("../../components/ReportDesigner").then((m) => m.default),
  { ssr: false }
);

// Nessun DataSource predefinito: il report caricato contiene già i collegamenti ai dati

export default function DesignerPage() {
  const viewerRef = React.useRef<any>(null);
  const [viewMode, setViewMode] = React.useState(false);

  React.useEffect(() => {
    // Nessuna localizzazione extra richiesta
  }, []);

  const onRender = async (reportInfo: any) => {
    // Passa alla modalità viewer e apre la definizione del report
    setViewMode(true);
    viewerRef.current?.open(reportInfo.definition);
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen w-full p-6">
      <h2 className="text-2xl font-semibold mb-4">Designer con Anteprima</h2>
      <p className="text-sm text-zinc-600 mb-2">
        Questo designer apre un report finanziario preconfigurato (3 pagine:
        introduzione, grafici, tabella).
      </p>
      <div hidden={viewMode}>
        <div style={{ height: "80vh", width: "100%" }}>
          <ARJSDesigner
            reportUri="/reports/portfolio.rdlx-json"
            onRender={onRender}
            pageOrientation="Landscape"
          />
        </div>
      </div>
      <div hidden={!viewMode}>
        <div style={{ height: "80vh", width: "100%" }}>
          <ARJSViewer
            reportUri="/reports/portfolio.rdlx-json"
            zoom={"FitToWidth"}
            sidebarVisible={true}
            panelsLayout={"sidebar"}
            availableExports={["pdf", "xlsx"]}
            ref={viewerRef as any}
          />
        </div>
      </div>
    </div>
  );
}
