import { Viewer } from "@grapecity/activereports-react";
import { Props as ViewerProps } from "@grapecity/activereports-react";
import React from "react";
import "@grapecity/activereports/styles/ar-js-ui.css";
import "@grapecity/activereports/styles/ar-js-viewer.css";

export type ViewerWrapperProps = ViewerProps & { reportUri: string };
export type ViewerHandle = {
  open: (definition: any) => Promise<void>;
};

const ViewerWrapper = React.forwardRef<ViewerHandle, ViewerWrapperProps>(
  (props, ref) => {
    const innerRef = React.useRef<Viewer>(null);

    React.useEffect(() => {
      const loadReport = async () => {
        if (innerRef.current && props.reportUri) {
          try {
            const reportResponse = await fetch(props.reportUri);
            const reportDefinition = await reportResponse.json();

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

            await innerRef.current.Viewer.open(reportWithData);
          } catch (error) {
            console.error("Error loading report:", error);
          }
        }
      };

      loadReport();
    }, [props.reportUri]);

    React.useImperativeHandle(
      ref,
      () => ({
        open: async (definition: any) => {
          try {
            const dataResponse = await fetch("/data/finance.json");
            const data = await dataResponse.json();

            // Modifica il definition per includere i dati
            const reportWithData = {
              ...definition,
              DataSources: definition.DataSources?.map((ds: any) => {
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

            await innerRef.current?.Viewer.open(reportWithData);
          } catch (error) {
            console.error("Error opening report:", error);
          }
        },
      }),
      []
    );

    return <Viewer {...props} ref={innerRef} />;
  }
);

ViewerWrapper.displayName = "ViewerWrapper";

export default ViewerWrapper;
