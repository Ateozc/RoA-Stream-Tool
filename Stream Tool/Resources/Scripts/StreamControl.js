'use strict';
let lockout = false;
let lockoutDuration = 20;
let currentLockoutDur = 0;
let gettingScene = false;
async function mainLoop() {

    const scInfo = await getInfo();
    // const guiInfo = await getGuiInfo();
    try {
        getData(scInfo);
    } catch (e) {
        console.log(e);
    }
    
}
mainLoop();
setInterval(() => {
    if (lockout) {
        if (currentLockoutDur >= lockoutDuration) {
            lockout = false;
            currentLockoutDur = 0;
        } else {
            currentLockoutDur++;
        }
    } else {
        mainLoop();
    }

}, 100); //update interval

async function getData(scInfo) {
    let obsSettings = scInfo['obsSettings'];
    let addressRockerSettings = scInfo['addressRockerSettings'];
    if (obsSettings.useObsAutomation && addressRockerSettings.useAddressRocker && addressRockerSettings.inSet && obsSettings.autoChangeScenes != 'manualFromOBS' && obsSettings.currentScene) {
        window.obsstudio.getCurrentScene(function (scene) {
            if (scene.name != obsSettings.currentScene) {
                if (obsSettings.currentScene == obsSettings.startScene) {
                    lockoutDuration = 50;
                } else {
                    lockoutDuration = 20;
                }
                lockout = true;
                window.obsstudio.setCurrentScene(obsSettings.currentScene);
                return;
            }
        });
    }
}


function getInfo() {
    return new Promise(function (resolve) {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);
        oReq.open("GET", 'Resources/Texts/GUI Settings.json');
        oReq.send();

        //will trigger when file loads
        function reqListener() {
            resolve(JSON.parse(oReq.responseText))
        }
    })
    //i would gladly have used fetch, but OBS local files wont support that :(
}