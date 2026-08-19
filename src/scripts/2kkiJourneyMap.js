const { parseGameName } = require('./utils');






async function fetchLocationText(webContents) {
  try {
    return await webContents.executeJavaScript(`
      (() => {
        const el = document.querySelector('#locationText a');
        return el
          ? { locationText: el.innerText || null, locationUrl: el.href || null }
          : { locationText: null, locationUrl: null };
      })()
    `);
  } catch {
    return { locationText: null, locationUrl: null };
  }
}
function setupMapHook(mainWindow) {
    var currentUrl = mainWindow.webContents.getURL();
    if(currentUrl == "https://ynoproject.net/2kki/") {
        setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
            var oldMethod = syncLocationChange;
            syncLocationChange = function() {
                var tempNames = cachedLocations ? cachedLocations.map(l => get2kkiWikiLocationName(l)) : [];
                for (var i = 0; i < tempNames.length; i++) {
                    window.electronAPI.logMapChange(tempNames[i]);
                    console.log("sending api, : " + tempNames[i]);
                }
                oldMethod();
            }
            console.log("Journey Map hook installed.");
        `) }, 3000);

    }
}
function loadMapHook(mapId) {

}

module.exports = { setupMapHook };