const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  toggleDiscordRpc: () => ipcRenderer.invoke("toggleDiscordRpc"),
  loadJourneyMap: () => ipcRenderer.invoke("loadJourneyMap"),
  saveJourneyMap: () => ipcRenderer.invoke("saveJourneyMap"),
  logMapChange: (mapId, locationTitle, wikiLink) => ipcRenderer.invoke("logMapChange", mapId, locationTitle, wikiLink),
  getDiscordRpcEnabled: () => ipcRenderer.invoke("getDiscordRpcEnabled"),
});

ipcRenderer.on("zoomin", () => {
  webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
});

ipcRenderer.on("zoomout", () => {
  webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
});
