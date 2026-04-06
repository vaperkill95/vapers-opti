const { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");

const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
let tray = null;
let psProcess = null;

function checkAdmin() {
  try {
    require("child_process").execSync("net session", { stdio: "ignore" });
  } catch {
    const exePath = process.execPath;
    try {
      require("child_process").execSync(
        `powershell -Command "Start-Process '${exePath}' -Verb RunAs"`,
        { stdio: "ignore" }
      );
    } catch {}
    app.quit();
  }
}

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
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  // Use a simple fallback if icon not found
  const iconPath = path.join(__dirname, "../assets/tray-icon.png");
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip("WinForge");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open WinForge", click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.exit(0) },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => { mainWindow?.show(); mainWindow?.focus(); });
}

function getBackendPath() {
  if (isDev) return path.join(__dirname, "../scripts/WinForge-Backend.ps1");
  return path.join(process.resourcesPath, "scripts/WinForge-Backend.ps1");
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
      mainWindow?.webContents.send("ps-error", data.toString());
    });

    ps.on("close", (code) => {
      if (code === 0 || results.length > 0) resolve(results);
      else reject(new Error(`PowerShell exited with code ${code}`));
    });

    ps.on("error", reject);
    psProcess = ps;
  });
}

// IPC Handlers
ipcMain.handle("scan-system", async () => {
  try {
    const data = await runPowerShell(["-Mode", "scan"]);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("apply-tweaks", async (_, { tweakIds, platforms }) => {
  try {
    const args = ["-Mode", "apply", "-TweakIds", tweakIds.join(",")];
    if (platforms?.length) args.push("-Platforms", platforms.join(","));
    const data = await runPowerShell(args);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("save-profile", async (_, profile) => {
  const dir = path.join(os.homedir(), "Documents", "WinForge", "profiles");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${profile.name || "default"}.json`);
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
  return { success: true, path: filePath };
});

ipcMain.handle("load-profiles", async () => {
  const dir = path.join(os.homedir(), "Documents", "WinForge", "profiles");
  if (!fs.existsSync(dir)) return { success: true, profiles: [] };
  const profiles = fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; } })
    .filter(Boolean);
  return { success: true, profiles };
});

ipcMain.handle("get-version", () => app.getVersion());
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on("window-close", () => mainWindow?.hide());
ipcMain.on("window-quit", () => app.exit(0));
ipcMain.on("open-report-folder", () => shell.openPath(path.join(os.homedir(), "Documents", "WinForge")));
ipcMain.on("cancel-operation", () => { if (psProcess && !psProcess.killed) { psProcess.kill(); psProcess = null; } });

// App lifecycle
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });

  app.whenReady().then(() => {
    if (process.platform === "win32") checkAdmin();
    createWindow();
    createTray();
  });

  app.on("before-quit", () => {
    if (psProcess && !psProcess.killed) psProcess.kill();
    tray?.destroy();
  });
}
