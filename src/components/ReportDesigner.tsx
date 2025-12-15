import { Designer } from "@grapecity/activereports-react";
import { DesignerProps } from "@grapecity/activereports-react";
import React from "react";

export type DesignerWrapperProps = DesignerProps & {
  reportUri: string;
  pageOrientation?: "Portrait" | "Landscape";
};

const DesignerWrapper = (props: DesignerWrapperProps) => {
  const ref = React.useRef<Designer>(null);

  const newReportTemplate = React.useMemo(
    () => ({
      Name: "NuovoReport",
      Page: {
        PageWidth:
          (props.pageOrientation ?? "Landscape") === "Landscape"
            ? "11in"
            : "8.5in",
        PageHeight:
          (props.pageOrientation ?? "Landscape") === "Landscape"
            ? "8.5in"
            : "11in",
        RightMargin: "0.5in",
        LeftMargin: "0.5in",
        TopMargin: "0.5in",
        BottomMargin: "0.5in",
        PaperOrientation: props.pageOrientation ?? "Landscape",
      },
      DataSources: [
        {
          Name: "PortfolioData",
          ConnectionProperties: {
            DataProvider: "JSON",
            ConnectString: "endpoint=/data/realData.json",
          },
        },
      ],
      Body: {
        ReportItems: [],
      },
    }),
    [props.pageOrientation]
  );

  const downloadReport = (reportJson: string, fileName: string) => {
    const blob = new Blob([reportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handler per Save (sovrascrive il report esistente)
  const handleSave = (info: any) => {
    console.log("Saving report:", info);

    const reportJson = JSON.stringify(info.definition, null, 2);
    downloadReport(reportJson, "portfolio.rdlx-json");

    alert(
      "Report salvato! Sostituisci il file in public/reports/portfolio.rdlx-json"
    );

    return Promise.resolve({ displayName: info.displayName });
  };

  // Handler per Save As (salva con un nuovo nome)
  const handleSaveAs = (info: any) => {
    console.log("Saving report as:", info);

    const reportJson = JSON.stringify(info.definition, null, 2);
    const fileName = info.displayName || "new-report";
    downloadReport(reportJson, `${fileName}.rdlx-json`);

    alert(`Report salvato come ${fileName}.rdlx-json`);

    return Promise.resolve({
      id: fileName,
      displayName: info.displayName,
    });
  };

  return (
    <Designer
      {...props}
      ref={ref}
      onSave={handleSave}
      onSaveAs={handleSaveAs}
      onCreate={() =>
        Promise.resolve({
          definition: newReportTemplate,
          displayName: "Nuovo Report",
        })
      }
      onOpen={async () => {
        try {
          const reportResponse = await fetch(props.reportUri);
          const reportDefinition = await reportResponse.json();
          const dataResponse = await fetch("/data/realData.json");
          const data = await dataResponse.json();
          const reportWithData = {
            ...reportDefinition,
            Page: {
              ...(reportDefinition.Page ?? {}),
              PaperOrientation: props.pageOrientation ?? "Landscape",
              PageWidth:
                (props.pageOrientation ?? "Landscape") === "Landscape"
                  ? "11in"
                  : "8.5in",
              PageHeight:
                (props.pageOrientation ?? "Landscape") === "Landscape"
                  ? "8.5in"
                  : "11in",
            },
            DataSources: reportDefinition.DataSources?.map((ds: any) => {
              if (ds.Name === "PortfolioData") {
                return {
                  ...ds,
                  ConnectionProperties: {
                    ...ds.ConnectionProperties,
                    ConnectString: `jsondata=${JSON.stringify(data)}`,
                  },
                };
              }
              return ds;
            }),
          };
          return Promise.resolve({
            definition: reportWithData,
            displayName: "Template",
          });
        } catch (error) {
          console.error("Error opening report:", error);
          return Promise.resolve({
            id: props.reportUri,
            displayName: "Template",
          });
        }
      }}
    />
  );
};

export default DesignerWrapper;
