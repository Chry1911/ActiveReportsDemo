import { Designer } from "@grapecity/activereports-react";
import { DesignerProps } from "@grapecity/activereports-react";
import React from "react";

export type DesignerWrapperProps = DesignerProps & {
  reportUri: string;
  pageOrientation?: "Portrait" | "Landscape";
};

const DesignerWrapper = (props: DesignerWrapperProps) => {
  const ref = React.useRef<Designer>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [fileNameInput, setFileNameInput] = React.useState<string>("");
  const [pendingReportJson, setPendingReportJson] = React.useState<string>("");
  const [openChoiceDialog, setOpenChoiceDialog] = React.useState(true);
  const [templates, setTemplates] = React.useState<Array<{ name: string }>>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");
  const [openResolver, setOpenResolver] = React.useState<
    ((value: any) => void) | null
  >(null);
  React.useEffect(() => {
    (async () => {
      try {
        const listRes = await fetch("/api/reports/list");
        const list = await listRes.json();
        setTemplates(list ?? []);
        if (Array.isArray(list) && list.length > 0) {
          setSelectedTemplate(list[0].name);
        }
      } catch {
        setTemplates([]);
      }
    })();
  }, []);

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

  const saveToServer = async (fileName: string, content: string) => {
    const name = fileName.endsWith(".rdlx-json")
      ? fileName
      : `${fileName}.rdlx-json`;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      if (!res.ok) throw new Error("save_failed");
      return true;
    } catch {
      downloadReport(content, name);
      return false;
    }
  };

  const openSaveDialog = (reportJson: string, suggestedName?: string) => {
    setPendingReportJson(reportJson);
    setFileNameInput(
      (suggestedName || "portfolio.rdlx-json").replace(/\.rdlx-json$/i, "")
    );
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    const ok = await saveToServer(fileNameInput.trim(), pendingReportJson);
    setSaveDialogOpen(false);
    setPendingReportJson("");
    return ok;
  };

  const handleSave = (info: any) => {
    const reportJson = JSON.stringify(info.definition, null, 2);
    openSaveDialog(reportJson, info.displayName || "portfolio.rdlx-json");
    return Promise.resolve({ displayName: info.displayName });
  };

  const handleSaveAs = (info: any) => {
    const reportJson = JSON.stringify(info.definition, null, 2);
    const fileName = info.displayName || "new-report";
    openSaveDialog(reportJson, `${fileName}.rdlx-json`);
    return Promise.resolve({
      id: fileName,
      displayName: info.displayName,
    });
  };

  return (
    <>
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
            const listRes = await fetch("/api/reports/list");
            const list = await listRes.json();
            setTemplates(list ?? []);
            if (Array.isArray(list) && list.length > 0) {
              setSelectedTemplate(list[0].name);
            }
          } catch {
            setTemplates([]);
          }
          const promise = new Promise<any>((resolve) => {
            setOpenResolver(() => resolve);
            setOpenChoiceDialog(true);
          });
          return promise;
        }}
      />
      {openChoiceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Apri template</h3>
            <div className="grid gap-4">
              <div>
                <div className="mb-2 text-sm text-zinc-600">Esistenti</div>
                <div className="max-h-40 overflow-auto border border-zinc-200 rounded">
                  {templates.length === 0 ? (
                    <div className="p-3 text-sm text-zinc-500">
                      Nessun template
                    </div>
                  ) : (
                    templates.map((t) => (
                      <button
                        key={t.name}
                        className={`w-full text-left px-3 py-2 text-sm ${
                          selectedTemplate === t.name
                            ? "bg-black text-white"
                            : ""
                        }`}
                        onClick={() => setSelectedTemplate(t.name)}
                      >
                        {t.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded border border-zinc-300 px-4 py-2 text-sm"
                  onClick={() => {
                    const def = newReportTemplate;
                    const resolve = openResolver;
                    setOpenChoiceDialog(false);
                    setOpenResolver(null);
                    if (resolve) {
                      resolve({
                        definition: def,
                        displayName: "Nuovo Report",
                      });
                    } else {
                      const inst: any = ref.current as any;
                      if (inst && typeof inst.createReport === "function") {
                        void inst.createReport({
                          definition: def,
                          displayName: "Nuovo Report",
                        });
                      }
                    }
                  }}
                >
                  Crea nuovo
                </button>
                <button
                  className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-[#383838]"
                  onClick={async () => {
                    const name = selectedTemplate || (templates[0]?.name ?? "");
                    if (!name) return;
                    try {
                      const res = await fetch(
                        `/api/reports?name=${encodeURIComponent(name)}`
                      );
                      const reportDefinition = await res.json();
                      const dataResponse = await fetch("/data/realData.json");
                      const data = await dataResponse.json();
                      const reportWithData = {
                        ...reportDefinition,
                        Page: {
                          ...(reportDefinition.Page ?? {}),
                          PaperOrientation:
                            props.pageOrientation ?? "Landscape",
                          PageWidth:
                            (props.pageOrientation ?? "Landscape") ===
                            "Landscape"
                              ? "11in"
                              : "8.5in",
                          PageHeight:
                            (props.pageOrientation ?? "Landscape") ===
                            "Landscape"
                              ? "8.5in"
                              : "11in",
                        },
                        DataSources: reportDefinition.DataSources?.map(
                          (ds: any) => {
                            if (ds.Name === "PortfolioData") {
                              return {
                                ...ds,
                                ConnectionProperties: {
                                  ...ds.ConnectionProperties,
                                  ConnectString: `jsondata=${JSON.stringify(
                                    data
                                  )}`,
                                },
                              };
                            }
                            return ds;
                          }
                        ),
                      };
                      const resolve = openResolver;
                      setOpenChoiceDialog(false);
                      setOpenResolver(null);
                      if (resolve) {
                        resolve({
                          definition: reportWithData,
                          displayName: name,
                        });
                      } else {
                        const inst: any = ref.current as any;
                        if (inst && typeof inst.setReport === "function") {
                          await inst.setReport({
                            definition: reportWithData,
                            displayName: name,
                          });
                        }
                      }
                    } catch {
                      const resolve = openResolver;
                      setOpenChoiceDialog(false);
                      setOpenResolver(null);
                      if (resolve) {
                        resolve({
                          id: name,
                          displayName: name,
                        });
                      }
                    }
                  }}
                >
                  Apri selezionato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSaveDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Salva template come…</h3>
            <label className="block text-sm text-zinc-600 mb-2">
              Nome file
            </label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                placeholder="portfolio"
              />
              <span className="text-sm text-zinc-500">.rdlx-json</span>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded border border-zinc-300 px-4 py-2 text-sm"
                onClick={() => {
                  setSaveDialogOpen(false);
                  setPendingReportJson("");
                }}
              >
                Annulla
              </button>
              <button
                className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-[#383838]"
                onClick={() => {
                  void confirmSave();
                }}
              >
                Salva…
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Ti verrà chiesto dove salvare il file.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignerWrapper;
