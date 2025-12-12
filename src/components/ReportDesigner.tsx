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
          // Carica il report definition
          const reportResponse = await fetch(props.reportUri);
          const reportDefinition = await reportResponse.json();

          // Carica i dati finanziari
          const dataResponse = await fetch("/data/finance.json");
          const data = await dataResponse.json();

          // Modifica il report definition per includere i dati
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

          // Imposta il report con i dati inclusi
          await ref.current.setReport({
            definition: reportWithData,
          });
        } catch (error) {
          console.error("Error loading report data:", error);
          // Fallback: carica il report senza dati
          ref.current?.setReport({ id: props.reportUri });
        }
      }
    };

    loadReportWithData();
  }, [props.reportUri]);

  return <Designer {...props} ref={ref} />;
};

export default DesignerWrapper;
export { DesignerWrapper };
