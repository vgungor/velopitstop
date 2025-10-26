const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  checkLogin,
  initDB,
  logLoginAttempt,
  getAllUsers,
  addUser,
  toggleUserSuspension,
  getAllCustomers,
  addCustomer,
  deleteCustomer,
  updateCustomer,
} = require("./src/db/database");

let mainWindow;

app.whenReady().then(() => {
  initDB();
  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("./src/renderer/login.html");
}

// Login kontrolü
ipcMain.handle("login:attempt", async (event, username, password) => {
  const result = await checkLogin(username, password);
  await logLoginAttempt(username, result.success);
  return result;
});

// Kullanıcı yönetimi
ipcMain.handle("admin:getUsers", async () => getAllUsers());
ipcMain.handle("admin:addUser", async (event, user) => addUser(user));
ipcMain.handle("admin:toggleSuspension", async (event, id, suspend) =>
  toggleUserSuspension(id, suspend)
);
// Müşteri yönetimi
ipcMain.handle("customer:getAll", async () => getAllCustomers());
ipcMain.handle("customer:add", async (event, customer) =>
  addCustomer(customer)
);
ipcMain.handle("customer:delete", async (event, id) => deleteCustomer(id));
ipcMain.handle("customer:update", async (event, customer) =>
  updateCustomer(customer)
);
