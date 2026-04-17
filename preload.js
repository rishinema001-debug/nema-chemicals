// ===== NEMA Chemicals — Electron Preload Script =====
// Exposes a safe, minimal API to the renderer process via contextBridge.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ===== Auto Update =====
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("update-status", handler);
    // Return cleanup function
    return () => ipcRenderer.removeListener("update-status", handler);
  },

  // ===== App Info & External Services =====
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  fetchImageOnline: (query, source) => ipcRenderer.invoke("fetch-image-online", query, source),

  // ===== Navigation =====
  navigate: (page) => ipcRenderer.send("navigate", page),

  // ===== Local App Database Handling =====
  getDbData: (key) => ipcRenderer.invoke("get-db-data", key),
  saveDbData: (key, value) => ipcRenderer.invoke("save-db-data", key, value),

  // ===== Platform Info =====
  platform: process.platform,
  isElectron: true,
});
