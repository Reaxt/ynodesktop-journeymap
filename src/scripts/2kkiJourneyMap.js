const { parseGameName } = require('./utils');
const { dialog } = require('electron')
const fs  = require('fs');
const { app } = require('electron');

const notDreamingMapIds = [
  "0002", // urotsuki's room
  "0003", // urotsuki's balcony
  "0620", // sound room
]

const dreamJson = {
  dreaming: false,
  game: "2kki",
  dreams: []
}
let currentDream = {
  dreamID: null,
  timestamp: null,
  locations: []
}
function startupCheck() {

}
function loadJourneyMap(mainWindow) {
  let path = app.getAppPath()
  console.log("loading journey map from " + path + "\\journeyMap.json");
  var mapToLoad = dialog.showOpenDialogSync({
    title: 'Load Journey Map',
    defaultPath: path + "\\journeyMap.json",
    filters: [{ name: 'JSON File', extensions: ['json'] }],
    properties: ['openFile']
  });
  let data = fs.readFileSync(mapToLoad, 'utf-8');
  dreamJson = JSON.parse(data);
}
function saveJourneyMap(mainWindow) {
  let path = app.getAppPath()
  console.log("saving journey map to " + path + "\\journeyMap.json");
  var mapToSave = dialog.showSaveDialogSync({
    title: 'Save Journey Map',
    defaultPath: "journeyMap.json",
    filters: [{ name: 'JSON File', extensions: ['json'] }],
    properties: ['createDirectory', "dontAddToRecent"]
  });
  fs.writeFileSync(mapToSave, JSON.stringify(dreamJson, null, 2), 'utf-8');
}
function mapUpdate(mapId, locationTitle, wikiLink) {
  console.log(dreamJson)
  console.log()
  // yayyy now we start mutating our json
  if (dreamJson.dreaming) {
    if(notDreamingMapIds.includes(mapId)) {
      // we have finished the dream.
      dreamJson.dreaming = false;
      dreamJson.dreams.push(currentDream);
      //if autosaving is on, save to the json file
    } else {
      currentDream.locations.push({
        timestamp: Math.floor(Date.now() / 1000),
        mapId: mapId,
        title: locationTitle,
        wikiLink: wikiLink
      })
    }
  } else {
    if(!notDreamingMapIds.includes(mapId)) {
      // we have started a dream.
      dreamJson.dreaming = true;
      currentDream = {
          dreamID: dreamJson.dreams.length,
          timestamp: Math.floor(Date.now() / 1000),
          locations: []
      }
      currentDream.locations = [{
        timestamp: Math.floor(Date.now() / 1000),
        mapId: mapId,
        title: locationTitle,
        wikiLink: wikiLink
      }];
    }
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

module.exports = { setupMapHook, loadJourneyMap, saveJourneyMap, mapUpdate, startupCheck };

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