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
function checkUpdateLocationHook(mapId, mapChanged) {
  preloadFilesFromMapId(mapId);
  if (gameLocalizedMapLocations[gameId]?.hasOwnProperty(mapId)) {
    const localizedLocations = gameLocalizedMapLocations[gameId][mapId];
    const locations = gameMapLocations[gameId][mapId];
    if (localizedLocations.hasTitle()) {
      let urlTitle = localizedLocations.urlTitle || localizedLocations.title;
      let wikiLink = (gameLocationUrlRoots[gameId] || locationUrlRoot) + (urlTitle);
      let locationTitle = localizedLocations.title;
      console.log("sending api,UniversalHook : " + mapId + " " + locationTitle + " " + wikiLink);
      window.electronAPI.logMapChange(mapId, locationTitle, wikiLink);

    }
  } else {
    console.log("checkUpdateLocationHook: mapId " + mapId + " not found in gameLocalizedMapLocations for game " + gameId + ", this some bullshit u gotta fix!");
  }
  //run original code
  originalCheckUpdateLocation(mapId, mapChanged);
}

function set2kkiClientLocationHook(mapId, prevMapId, locations, prevLocations, cacheLocation, saveLocation) {
  let location = locations;
  if(locations.length) {
    if(locations.length > 1) {
      console.log("theres multiple locations(?) or its an array, just heads up, submitting the first one for now");
    }
    location = locations[0];
  }
  
  let urlTitle = location.urlTitle || location.title;
  let wikiLink = (gameLocationUrlRoots['2kki'] || locationUrlRoot) + (urlTitle);
  let locationTitle = location.title;
  window.electronAPI.logMapChange(mapId, locationTitle, wikiLink);
  console.log("sending api,2kkiHook : " + mapId + " " + locationTitle + " " + wikiLink);
  originalSet2kkiClientLocation(mapId, prevMapId, locations, prevLocations, cacheLocation, saveLocation);
}

            var originalCheckUpdateLocation = checkUpdateLocation;
            var originalSet2kkiClientLocation = set2kkiClientLocation;
            set2kkiClientLocation = set2kkiClientLocationHook;
            checkUpdateLocation = checkUpdateLocationHook;
            console.log("Journey Map hooks installed.");
        `) }, 3000);

    }
}

function mapUpdate(mapId, locationTitle, wikiLink) {
  // yayyy now we start mutating our json
}

module.exports = { setupMapHook };

//hooks to
//- onLoad2kkiMap(set2kkiClientLocation) and -checkUpdateLocation
//OR 
// addChatMapLocation
/*
function checkUpdateLocationHook(mapId, mapChanged) {
  preloadFilesFromMapId(mapId);
  if (gameLocalizedMapLocations[gameId]?.hasOwnProperty(mapId)) {
    const localizedLocations = gameLocalizedMapLocations[gameId][mapId];
    const locations = gameMapLocations[gameId][mapId];
    if (localizedLocations.hasTitle()) {
      console.log("checkUpdateLocationHook: mapId " + mapId + " found in gameLocalizedMapLocations for game " + gameId);
      let urlTitle = location.urlTitle || location.title;
      let wikiLink = (gameLocationUrlRoots[gameId] || locationUrlRoot) + urlTitle;
      let locationTitle = localizedLocations.title;
      console.log("sending api, : " + mapId + " " + locationTitle + " " + wikiLink);
      window.electronAPI.logMapChange(mapId, locationTitle, wikiLink);

    }
  } else {
    console.log("checkUpdateLocationHook: mapId " + mapId + " not found in gameLocalizedMapLocations for game " + gameId + ", this some bullshit u gotta fix!");
  }
  //run original code
  originalCheckUpdateLocation(mapId, mapChanged);
}

function set2kkiClientLocationHook(mapId, prevMapId, locations, prevLocations, cacheLocation, saveLocation) {
  let location = locations;
  if(locations.length) {
    if(locations.length > 1) {
      console.log("theres multiple locations(?) or its an array, just heads up, submitting the first one for now");
    }
    location = locations[0];
  }
  
  let urlTitle = location.urlTitle || location.title;
  let wikiLink = (gameLocationUrlRoots['2kki'] || locationUrlRoot) + urlTitle;
  let locationTitle = location.title;
  window.electronAPI.logMapChange(mapId, locationTitle, wikiLink);
  console.log("sending api, : " + mapId + " " + locationTitle + " " + wikiLink);
  originalSet2kkiClientLocation(mapId, prevMapId, locations, prevLocations, cacheLocation, saveLocation);
}
function onLoad2kkiMapHook(mapId) {
    console.log("onLoad2kkiMap called with mapId: " + mapId + "running hook");

}
*/