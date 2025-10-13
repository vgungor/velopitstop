const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: (username, password) =>
    ipcRenderer.invoke("login:attempt", username, password),
  getUsers: () => ipcRenderer.invoke("admin:getUsers"),
  addUser: (user) => ipcRenderer.invoke("admin:addUser", user),
  toggleUserSuspension: (id, suspend) =>
    ipcRenderer.invoke("admin:toggleSuspension", id, suspend),
});
