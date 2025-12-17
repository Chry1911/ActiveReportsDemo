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
  const [defaultDirHandle, setDefaultDirHandle] = React.useState<any>(null);
  const dbName = "arjs-fsa";
  const storeName = "handles";
  const openDb = React.useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }, []);
  const getStoredDirHandle = React.useCallback(async () => {
    const db = await openDb();
    return await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get("defaultSaveDir");
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }, [openDb]);
  const setStoredDirHandle = React.useCallback(
    async (handle: any) => {
      const db = await openDb();
      return await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).put(handle, "defaultSaveDir");
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    },
    [openDb]
  );
  React.useEffect(() => {
    (async () => {
      try {
        const h = await getStoredDirHandle();
        if (h) setDefaultDirHandle(h);
      } catch {}
    })();
  }, [getStoredDirHandle]);

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

  const showSavePicker = async (fileName: string, content: string) => {
    const suggestedName = fileName.endsWith(".rdlx-json")
      ? fileName
      : `${fileName}.rdlx-json`;
    if ("showSaveFilePicker" in window) {
      try {
        if (defaultDirHandle) {
          let perm = await defaultDirHandle.queryPermission?.({
            mode: "readwrite",
          });
          if (perm !== "granted") {
            perm = await defaultDirHandle.requestPermission?.({
              mode: "readwrite",
            });
          }
          if (perm === "granted") {
            const fileHandle = await defaultDirHandle.getFileHandle(
              suggestedName,
              { create: true }
            );
            const writable = await fileHandle.createWritable();
            await writable.write(
              new Blob([content], { type: "application/json" })
            );
            await writable.close();
            return true;
          }
        }
        const dir = await (window as any).showDirectoryPicker();
        await setStoredDirHandle(dir);
        setDefaultDirHandle(dir);
        const fileHandle = await dir.getFileHandle(suggestedName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(new Blob([content], { type: "application/json" }));
        await writable.close();
        return true;
      } catch (err: any) {
        if (
          err &&
          (err.name === "AbortError" || /aborted/i.test(err.message))
        ) {
          return false;
        }
        downloadReport(content, suggestedName);
        return false;
      }
    } else {
      downloadReport(content, suggestedName);
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
    const ok = await showSavePicker(fileNameInput.trim(), pendingReportJson);
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
