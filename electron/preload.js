const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("winforge", {
  scanSystem: () => ipcRenderer.invoke("scan-system"),
  applyTweaks: (tweakIds, platforms) => ipcRenderer.invoke("apply-tweaks", { tweakIds, platforms }),
  saveProfile: (profile) => ipcRenderer.invoke("save-profile", profile),
  loadProfiles: () => ipcRenderer.invoke("load-profiles"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  quit: () => ipcRenderer.send("window-quit"),
  openReportFolder: () => ipcRenderer.send("open-report-folder"),
  cancelOperation: () => ipcRenderer.send("cancel-operation"),

  onEvent: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on("ps-event", handler);
    return () => ipcRenderer.removeListener("ps-event", handler);
  },
  onError: (callback) => {
    const handler = (_, err) => callback(err);
    ipcRenderer.on("ps-error", handler);
    return () => ipcRenderer.removeListener("ps-error", handler);
  },

  platform: process.platform,
  isWindows: process.platform === "win32",
});
