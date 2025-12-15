import { Designer } from "@grapecity/activereports-react";
import { DesignerProps } from "@grapecity/activereports-react";
import React from "react";

export type DesignerWrapperProps = DesignerProps & { reportUri: string };

const DesignerWrapper = (props: DesignerWrapperProps) => {
  const ref = React.useRef<Designer>(null);

  React.useEffect(() => {
    const loadReportWithData = async () => {
      if (ref.current && props.reportUri) {
        try {
          const reportResponse = await fetch(props.reportUri);
          const reportDefinition = await reportResponse.json();

          const dataResponse = await fetch("/data/finance.json");
          const data = await dataResponse.json();

          const reportWithData = {
            ...reportDefinition,
            DataSources: reportDefinition.DataSources?.map((ds: any) => {
              if (ds.Name === "FinanceJSON") {
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

          await ref.current.setReport({
            definition: reportWithData,
          });
        } catch (error) {
          console.error("Error loading report data:", error);
          ref.current?.setReport({ id: props.reportUri });
        }
      }
    };

    loadReportWithData();
  }, [props.reportUri]);

  // Funzione helper per scaricare il report
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
    downloadReport(reportJson, "financial.rdlx-json");

    alert(
      "Report salvato! Sostituisci il file in public/reports/financial.rdlx-json"
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
    />
  );
};

export default DesignerWrapper;
