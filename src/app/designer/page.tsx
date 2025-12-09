"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import dei CSS del Viewer/Designer e della localizzazione
import "@grapecity/activereports-localization";

// Disabilita SSR per i componenti ARJS
const ARJSViewer = dynamic(async () => {
  const mod = await import("@grapecity/activereports-react");
  const Comp = mod.Viewer as any;
  return React.forwardRef<any, React.ComponentProps<typeof Comp>>((props, ref) => (
    <Comp {...props} ref={ref} />
  ));
}, { ssr: false });

const ARJSDesigner = dynamic(() => import("@grapecity/activereports-react").then(m => m.Designer), { ssr: false });

// Template di DataSource/Datasets predefiniti (Northwind API)
const dataSources = [
  {
    id: "Northwind",
    title: "Northwind",
    template: {
      Name: "Northwind",
      ConnectionProperties: {
        DataProvider: "JSON",
        ConnectString: "endpoint=https://demodata.grapecity.com/northwind/api/v1",
      },
    },
    canEdit: true,
    shouldEdit: false,
    datasets: [
      {
        id: "Products",
        title: "Products",
        template: {
          Name: "Products",
          Query: {
            DataSourceName: "Northwind",
            CommandText: "uri=/Products;jpath=$.[*]",
          },
        },
        canEdit: true,
      },
      {
        id: "Orders",
        title: "Orders",
        template: {
          Name: "Orders",
          Query: {
            DataSourceName: "Northwind",
            CommandText: "uri=/Orders;jpath=$.[*]",
          },
        },
        canEdit: true,
      },
    ],
  },
];

export default function DesignerPage() {
  const viewerRef = React.useRef<any>(null);
  const [viewMode, setViewMode] = React.useState(false);

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
        Suggerimento: usa i DataSource predefiniti (Northwind) per creare grafici, tabelle e calcoli.
      </p>
      <div hidden={viewMode}>
        <ARJSDesigner onRender={onRender} dataSources={dataSources as any} />
      </div>
      <div hidden={!viewMode}>
        <ARJSViewer ref={viewerRef} />
      </div>
    </div>
  );
}
