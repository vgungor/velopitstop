const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  checkLogin,
  initDB,
  logLoginAttempt,
  getAllUsers,
  addUser,
  toggleUserSuspension,
} = require("./src/db/database");

let mainWindow;

app.whenReady().then(() => {
  initDB();
  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
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
