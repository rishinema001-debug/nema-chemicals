// ===== NEMA Chemicals — Electron Main Process =====
// Desktop app with auto-update, navigation between pages, and native window controls.

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");

// ===== Database Storage Path =====
let DB_PATH = "";
app.on("ready", () => {
  DB_PATH = path.join(app.getPath("userData"), "nema_storage.json");
  // Initialize storage if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ products: null, categories: null }, null, 2));
  }
});

// ===== Configuration =====
const IS_DEV = process.argv.includes("--dev");

// Keep a global reference to prevent garbage collection
let mainWindow = null;

// ===== Auto Updater Configuration =====
function setupAutoUpdater() {
  // Only check for updates in production builds
  if (IS_DEV) {
    console.log("[AutoUpdater] Skipping updates in dev mode");
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates every 30 minutes
  const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;

  autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking for update...");
    sendToWindow("update-status", { status: "checking", message: "Checking for updates..." });
  });

  autoUpdater.on("update-available", (info) => {
    console.log("[AutoUpdater] Update available:", info.version);
    sendToWindow("update-status", {
      status: "available",
      message: `Update v${info.version} is available. Downloading...`,
      version: info.version,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("[AutoUpdater] App is up to date:", info.version);
    sendToWindow("update-status", {
      status: "up-to-date",
      message: `You're running the latest version (v${info.version})`,
      version: info.version,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`[AutoUpdater] Download progress: ${percent}%`);
    sendToWindow("update-status", {
      status: "downloading",
      message: `Downloading update: ${percent}%`,
      percent: percent,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("[AutoUpdater] Update downloaded:", info.version);
    sendToWindow("update-status", {
      status: "downloaded",
      message: `Update v${info.version} ready to install. Restart to apply.`,
      version: info.version,
    });

    // Show native dialog for restart
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready",
        message: `NEMA Chemicals v${info.version} has been downloaded.`,
        detail: "The update will be installed when you restart the application. Restart now?",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
  });

  autoUpdater.on("error", (err) => {
    console.error("[AutoUpdater] Error:", err.message);
    sendToWindow("update-status", {
      status: "error",
      message: `Update error: ${err.message}`,
    });
  });

  // Initial check
  autoUpdater.checkForUpdatesAndNotify();

  // Periodic checks
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, UPDATE_CHECK_INTERVAL);
}

// ===== Send messages to the renderer =====
function sendToWindow(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// ===== Create Main Window =====
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "NEMA Chemicals — Wholesale FMCG Catalog",
    backgroundColor: "#0a0e1a",
    show: false, // Show after ready-to-show for smooth launch
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: "hiddenInset", // Sleek macOS-style titlebar
    trafficLightPosition: { x: 15, y: 15 },
  });

  // Load the main page
  mainWindow.loadFile("index.html");

  // Show window when ready (prevents white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in dev mode
    if (IS_DEV) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  // Handle external links — open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Handle navigation within the app (admin.html <-> index.html)
  mainWindow.webContents.on("will-navigate", (event, url) => {
    // Allow local file navigation
    if (url.startsWith("file://")) {
      return;
    }
    // Open external URLs in the default browser
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ===== Application Menu =====
function createMenu() {
  const template = [
    // macOS App Menu
    ...(process.platform === "darwin"
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              {
                label: "Check for Updates...",
                click: () => {
                  if (!IS_DEV) {
                    autoUpdater.checkForUpdatesAndNotify();
                  } else {
                    dialog.showMessageBox(mainWindow, {
                      type: "info",
                      title: "Development Mode",
                      message: "Auto-updates are disabled in development mode.",
                    });
                  }
                },
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),

    // File Menu
    {
      label: "File",
      submenu: [
        {
          label: "Product Catalog",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            if (mainWindow) mainWindow.loadFile("index.html");
          },
        },
        {
          label: "Admin Panel",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            if (mainWindow) mainWindow.loadFile("admin.html");
          },
        },
        { type: "separator" },
        process.platform === "darwin" ? { role: "close" } : { role: "quit" },
      ],
    },

    // Edit Menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },

    // View Menu
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },

    // Window Menu
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(process.platform === "darwin"
          ? [{ type: "separator" }, { role: "front" }]
          : [{ role: "close" }]),
      ],
    },

    // Help Menu
    {
      label: "Help",
      submenu: [
        {
          label: `About NEMA Chemicals v${app.getVersion()}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "NEMA Chemicals",
              message: `NEMA Chemicals v${app.getVersion()}`,
              detail:
                "Wholesale FMCG Product Catalog\n\nDesktop application for managing and browsing FMCG product inventory.\n\n© 2026 NEMA Chemicals",
            });
          },
        },
        {
          label: "Check for Updates...",
          click: () => {
            if (!IS_DEV) {
              autoUpdater.checkForUpdatesAndNotify();
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ===== IPC Handlers =====
function setupIPC() {
  // Manual update check from renderer
  ipcMain.handle("check-for-updates", async () => {
    if (IS_DEV) {
      return { status: "dev", message: "Updates disabled in dev mode" };
    }
    try {
      const result = await autoUpdater.checkForUpdatesAndNotify();
      return { status: "checking", version: result?.updateInfo?.version };
    } catch (err) {
      return { status: "error", message: err.message };
    }
  });

  // Install update now
  ipcMain.handle("install-update", () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // Get app version
  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  // Fetch real image from Google Images
  ipcMain.handle("fetch-image-online", async (event, query, source) => {
    return new Promise((resolve) => {
      const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
      
      let siteModifier = "";
      if (source === "amazon") siteModifier = "site:amazon.in ";
      else if (source === "flipkart") siteModifier = "site:flipkart.com ";
      else if (source === "blinkit") siteModifier = "site:blinkit.com ";

      const encodedQuery = encodeURIComponent(siteModifier + query + " product pack front");

      win.loadURL(`https://www.google.com/search?tbm=isch&q=${encodedQuery}`);
      win.webContents.on('did-finish-load', async () => {
        try {
          const imageUrl = await win.webContents.executeJavaScript(`
            (function() {
               let imgs = Array.from(document.querySelectorAll('img[src^="http"]'));
               // Find first image that isn't a tiny logo/icon
               let target = imgs.find(img => img.width > 50 && img.height > 50 && img.src.indexOf('logo') === -1);
               return target ? target.src : null;
            })();
          `);
          if (!win.isDestroyed()) win.close();
          resolve(imageUrl);
        } catch (err) {
          if (!win.isDestroyed()) win.close();
          resolve(null);
        }
      });
      // Fallback timeout
      setTimeout(() => {
        if (!win.isDestroyed()) win.close();
        resolve(null);
      }, 8000);
    });
  });

  // Navigate between pages
  ipcMain.on("navigate", (event, page) => {
    if (mainWindow) {
      mainWindow.loadFile(page);
    }
  });

  // ===== Local App Database Handling =====
  ipcMain.handle("get-db-data", (event, key) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        const data = JSON.parse(raw);
        return data[key] || null;
      }
      return null;
    } catch (err) {
      console.error("[DB Read Error]:", err);
      return null;
    }
  });

  ipcMain.handle("save-db-data", (event, key, value) => {
    try {
      let data = {};
      if (fs.existsSync(DB_PATH)) {
        data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      }
      data[key] = value;
      // Atomic save to prevent corruption
      const tempPath = DB_PATH + ".tmp";
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, DB_PATH);
      return { success: true };
    } catch (err) {
      console.error("[DB Save Error]:", err);
      return { success: false, error: err.message };
    }
  });
}

// ===== App Lifecycle =====
app.on("ready", () => {
  createWindow();
  createMenu();
  setupIPC();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
