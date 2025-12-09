"use client";

import React from "react";
import dynamic from "next/dynamic";

import "@grapecity/activereports-localization";

const ARJSViewer = dynamic(() => import("@grapecity/activereports-react").then(m => m.Viewer), { ssr: false });

export default function ViewerPage() {
  const viewerRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Esempio di report semplice (RDLX JSON) con una tabella
    const report = {
      Name: "SampleReport",
      DataSources: [
        {
          Name: "Northwind",
          ConnectionProperties: {
            DataProvider: "JSON",
            ConnectString: "endpoint=https://demodata.grapecity.com/northwind/api/v1",
          },
        },
      ],
      Body: {
        ReportItems: [
          {
            Type: "Table",
            Name: "ProductsTable",
            DataSetName: "Products",
            Data: {
              Columns: [
                { Name: "ProductName" },
                { Name: "UnitPrice" },
              ],
            },
          },
        ],
      },
      DataSets: [
        {
          Name: "Products",
          Query: {
            DataSourceName: "Northwind",
            CommandText: "uri=/Products;jpath=$.[*]",
          },
        },
      ],
    } as any;

    viewerRef.current?.Viewer.open(report);
  }, []);

  return (
    <div className="min-h-screen w-full p-6">
      <h2 className="text-2xl font-semibold mb-4">Viewer</h2>
      <ARJSViewer ref={viewerRef} />
    </div>
  );
}
