const { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let tray = null;
let psProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#020202",
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", (e) => { e.preventDefault(); mainWindow.hide(); });
}

function createTray() {
  let icon;
  try {
    const iconPath = path.join(__dirname, "../assets/tray-icon.png");
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    icon = nativeImage.createEmpty();
  }
  tray = new Tray(icon);
  tray.setToolTip("Vapers Opti");
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Vapers Opti", click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.exit(0) },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => { mainWindow?.show(); mainWindow?.focus(); });
}

function getBackendPath() {
  if (isDev) return path.join(__dirname, "../scripts/VapersOpti-Backend.ps1");
  return path.join(process.resourcesPath, "scripts/VapersOpti-Backend.ps1");
}

function runPowerShell(args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = getBackendPath();
    const psArgs = ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args];
    const ps = spawn("powershell.exe", psArgs, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const results = [];

    ps.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(l => l.trim());
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          results.push(json);
          mainWindow?.webContents.send("ps-event", json);
        } catch {}
      }
    });

    ps.stderr.on("data", (data) => {
      console.error("PS STDERR:", data.toString());
      mainWindow?.webContents.send("ps-error", data.toString());
    });

    ps.on("close", (code) => {
      console.log("PS closed code:", code, "results:", results.length);
      if (code === 0 || results.length > 0) resolve(results);
      else reject(new Error(`PowerShell exited with code ${code}`));
    });

    ps.on("error", reject);
    psProcess = ps;
  });
}

// IPC HANDLERS
ipcMain.handle("scan-system", async () => {
  try { return { success: true, data: await runPowerShell(["-Mode", "scan"]) }; }
  catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("apply-tweaks", async (_, { tweakIds, platforms }) => {
  try {
    const args = ["-Mode", "apply", "-TweakIds", tweakIds.join(",")];
    if (platforms?.length) args.push("-Platforms", platforms.join(","));
    const data = await runPowerShell(args);
    mainWindow?.webContents.send("ps-event", { type: "apply_complete" });
    return { success: true, data };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("get-startup-apps", async () => {
  try { return { success: true, data: await runPowerShell(["-Mode", "startup"]) }; }
  catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("get-thermals", async () => {
  try { return { success: true, data: await runPowerShell(["-Mode", "thermal"]) }; }
  catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("run-ping", async () => {
  try { return { success: true, data: await runPowerShell(["-Mode", "ping"]) }; }
  catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("get-installed-games", async () => {
  try { return { success: true, data: await runPowerShell(["-Mode", "games"]) }; }
  catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("save-profile", async (_, profile) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Vapers Opti Profile",
      defaultPath: `VapersOpti-${profile.name || "MyProfile"}.json`,
      filters: [{ name: "Vapers Opti Profile", extensions: ["json"] }]
    });
    if (result.canceled) return { success: false, canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(profile, null, 2));
    return { success: true, path: result.filePath };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("load-profiles", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Import Vapers Opti Profile",
      filters: [{ name: "Vapers Opti Profile", extensions: ["json"] }],
      properties: ["openFile"]
    });
    if (result.canceled) return { success: false, canceled: true };
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], "utf8"));
    return { success: true, profiles: [data] };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle("get-version", () => app.getVersion());
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on("window-close", () => mainWindow?.hide());
ipcMain.on("window-quit", () => app.exit(0));
ipcMain.on("open-report-folder", () => shell.openPath(path.join(os.homedir(), "Documents", "VapersOpti")));
ipcMain.on("cancel-operation", () => { if (psProcess && !psProcess.killed) { psProcess.kill(); psProcess = null; } });

// APP LIFECYCLE
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); }
  });
  app.whenReady().then(() => {
    createWindow();
    createTray();
    setTimeout(() => { try { autoUpdater.checkForUpdatesAndNotify(); } catch(e) {} }, 8000);
  });

  autoUpdater.on("update-available", () => { mainWindow?.webContents.send("ps-event", { type: "update_available" }); });
  autoUpdater.on("update-downloaded", () => { mainWindow?.webContents.send("ps-event", { type: "update_ready" }); });
  app.on("before-quit", () => {
    if (psProcess && !psProcess.killed) psProcess.kill();
    tray?.destroy();
  });
  app.on("window-all-closed", () => {});
}
