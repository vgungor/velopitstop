const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: (username, password) =>
    ipcRenderer.invoke("login:attempt", username, password),
  getUsers: () => ipcRenderer.invoke("admin:getUsers"),
  addUser: (user) => ipcRenderer.invoke("admin:addUser", user),
  toggleUserSuspension: (id, suspend) =>
    ipcRenderer.invoke("admin:toggleSuspension", id, suspend),
  // müşteri yönetimi
  getAllCustomers: () => ipcRenderer.invoke("customer:getAll"),
  addCustomer: (customer) => ipcRenderer.invoke("customer:add", customer),
  deleteCustomer: (id) => ipcRenderer.invoke("customer:delete", id),
  updateCustomer: (customer) => ipcRenderer.invoke("customer:update", customer),
});
