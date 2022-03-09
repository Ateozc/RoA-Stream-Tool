'use strict';

const {
    getPackedSettings
} = require('http2');


angular.module('angularapp', []);
angular.module('angularapp').controller('AngularAppCtrl', function ($scope) {
    var c = $scope;

    //Global Variables
    const fs = require('fs');
    const path = require('path');
    const electron = require('electron');
    const ipc = electron.ipcRenderer;
    const encoding = 'utf8';

    // yes we all like global variables
    const textPath = __dirname + '/Texts';
    const scriptsPath = __dirname + '/Scripts';
    const gamePathRel = "/Games";
    const gamePath = __dirname + '/Games';

    let charPath;
    let charPathRel;

    // "/Resources/Games/Rivals of Aether/Characters"
    // "/Resources/Games/Rivals Workshop/Characters"

    const randomSkinPath = gamePath + "/Defaults/Random.png";
    const randomSkinPathRel = "/Games/Defaults/Random.png";
    const defaultWbBackground = "/Games/Defaults/BG.webm";

    // const defaultWbLoABackground = gamePath + "/BG LoA.webm";

    //Angular Scoped Variables (to be used on HTML)
    c.characterList = [];
    c.colorList = getJson(textPath + "/Color Slots");
    c.roundNames = getJson(textPath + "/RoundNames");
    c.games = [];
    c.useCustomRound = false;

    c.roundInfo = {
        name: "Friendlies",
        number: 0,
        bestOf: 'Bo3'
    }
    c.onDeckRoundInfo = {
        name: "Friendlies",
        number: 0,
        bestOf: 'Bo3'
    }
    c.tournamentName = "";
    c.gamemode = "Singles";
    c.bestOf = "Bo3";
    c.onDeckBestOf = "Bo3";
    c.playerFocus = 0;
    c.playerFocusOnDeck = false;
    c.inPlayerField = false;
    c.inProfileSelector = false;



    //Angular Scoped Function (to be called from HTML)
    c.getPlayerProfiles = function (playerName, checkForLength = true) {
        let playerProfiles = [];
        if (checkForLength) {
            if (playerName.length < 3) {
                return playerProfiles;
            }
        }
        const files = fs.readdirSync(textPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(playerName.toLocaleLowerCase())) {

                //go inside that file to get the player info
                const playerInfo = getJson(textPath + "/Player Info/" + file);
                //for each character that player plays
                playerInfo.characters.forEach(char => {
                    if (char.game == c.game) {
                        let profile = {
                            name: playerInfo.name,
                            tag: playerInfo.tag,
                            twitter: playerInfo.twitter,
                            pronouns: playerInfo.pronouns,
                            character: char.character,
                            skin: char.skin,
                        }
                        playerProfiles.push(profile);
                    }
                });
            }
        });
        return playerProfiles;
    }

    c.fixProfilesForCurrentGame = function () {
        let playerProfiles = [];
        const files = fs.readdirSync(textPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //go inside that file to get the player info
            const playerInfo = getJson(textPath + "/Player Info/" + file);

            //for each character that player plays
            playerInfo.characters.forEach(char => {
                for (let i = 0; i < c.characterList.length; i++) {
                    if (c.characterList[i].name == char.character) {
                        let profile = {
                            name: playerInfo.name,
                            tag: playerInfo.tag,
                            twitter: playerInfo.twitter,
                            pronouns: playerInfo.pronouns,
                            character: char.character,
                            skin: char.skin
                        }
                        playerProfiles.push(profile);
                    }
                }
            });
        });
        for (let i = 0; i < playerProfiles.length; i++) {
            updatePlayerJson(playerProfiles[i], true);
        }
        
    }

    c.applyProfile = function (index) {
        let playerType = 'players';
        if (c.playerFocusOnDeck) {
            playerType = 'onDeckPlayers';
        }
        c[playerType][c.playerFocus].name = c.playerProfiles[index].name;
        c[playerType][c.playerFocus].tag = c.playerProfiles[index].tag;
        c[playerType][c.playerFocus].twitter = c.playerProfiles[index].twitter;
        c[playerType][c.playerFocus].pronouns = c.playerProfiles[index].pronouns;
        c[playerType][c.playerFocus].character = c.playerProfiles[index].character;
        c[playerType][c.playerFocus].skin = c.playerProfiles[index].skin;
        c.markCharacterIndex(c.playerFocus, false, c.playerFocusOnDeck);
        c.inPlayerField = false;
        c.inProfileSelector = false;
    }

    c.setGamemode = function () {
        if (c.gamemode == "Singles") {
            c.gamemode = "Teams";
        } else {
            c.gamemode = "Singles";
        }
    }

    c.setBestOf = function (value, onDeck = false) {
        let roundType = 'roundInfo';
        if (onDeck) {
            roundType = 'onDeckRoundInfo'
        }
        c[roundType].bestOf = value;
    }

    c.setMaxPlayers = function () {
        c.players = setupPlayersVar();
        c.onDeckPlayers = setupPlayersVar();
        c.saveGUISettings();
    }

    c.markCharacterIndex = function (player, updateSkin = true, onDeck = false) {
        let playerType = "players";
        if (onDeck) {
            playerType = "onDeckPlayers";
        }
        c[playerType][player].characterIndex = c.characterList.map(e => e.name).indexOf(c[playerType][player].character);
        if (updateSkin) {
            c[playerType][player].skin = (c[playerType][player].character != "Random") ? "Default" : "";
        }

    }

    c.getSkinPathForPlayer = function (player) {
        c.players[player].guiSkinPath = c.getSkinPath(c.players[player].character, c.players[player].skin, player);
        return c.players[player].guiSkinPath;
    }

    c.getSkinPath = function (character, skin, player) {
        let path = "";
        if (character == "Random") {
            path = randomSkinPath;
        } else {
            path = charPath + character + "/" + skin + ".png";
        }

        return fs.existsSync(path) ? path : randomSkinPath;
    }

    c.getPathsForOverlays = function () {
        let random = c.relativePathOfFile(randomSkinPathRel);
        for (let i in c.players) {
            let character = c.players[i].character;
            let skin = c.players[i].skin;
            let teamColor = "";
            let vsScreenSkin = c.players[i].skin;
            let playerTeam = 0;

            let defaultSkinPath = "";
            let vsScreenSkinPath = "";
            let scoreboardSkinPath = "";
            let backgroundPath = c.relativePathOfFile(defaultWbBackground);
            let characterInfo = getJson(charPath + character + "/_Info");

            if (c.gamemode == 'Singles') {
                if (i == 0) {
                    teamColor = c.sides.left.color;
                } else {
                    playerTeam = 1;
                    teamColor = c.sides.right.color;
                }
            } else {
                if (i < c.maxPlayers / 2) {
                    teamColor = c.sides.left.color;
                } else {
                    teamColor = c.sides.right.color;
                    playerTeam = 1;
                }
            }

            if (character == 'Random') {
                defaultSkinPath = random;
                vsScreenSkinPath = random;
                scoreboardSkinPath = random;
                vsScreenSkin = "Random";
            } else {
                let defaultPath = c.relativePathOfFile(charPathRel + character + "/" + skin + ".png");

                defaultSkinPath = (defaultPath) ? defaultPath : random;

                let defaultBackground = c.relativePathOfFile(charPathRel + character + "/BG.webm");

                backgroundPath = (defaultBackground) ? defaultBackground : backgroundPath;

                let altPath = "";
                if (c.forceHD && c.game == 'Rivals of Aether') {
                    if (skin.indexOf('LoA') != -1 && !c.noLoAHD) {
                        altPath = c.relativePathOfFile(charPathRel + character + "/LoA HD.png");
                        vsScreenSkin = "LoA HD";
                    } else {
                        altPath = c.relativePathOfFile(charPathRel + character + "/HD.png");
                        vsScreenSkin = "HD";
                    }
                }
                vsScreenSkinPath = (altPath) ? altPath : defaultPath;
            }

            if (c.game == 'Rivals of Aether') {
                if (vsScreenSkinPath.indexOf('LoA') != -1) {
                    backgroundPath = c.relativePathOfFile(charPathRel + "/LoA.webm");
                } else if (skin == 'Ragnir') {
                    backgroundPath = c.relativePathOfFile(defaultWbBackground);
                } else if (character == 'Shovel Knight' && skin == 'Golden') {
                    let checkSpecialPath = c.relativePathOfFile(charPathRel + "/BG Golden.webm");
                    backgroundPath = (checkSpecialPath) ? checkSpecialPath : backgroundPath;
                }
            }


            c.players[i].defaultSkinPath = defaultSkinPath;
            c.players[i].vsScreenSkinPath = vsScreenSkinPath;
            c.players[i].scoreboardSkinPath = defaultSkinPath;
            c.players[i].backgroundWebm = backgroundPath;
            c.players[i].info = characterInfo;
            c.players[i].teamColor = teamColor;
            c.players[i].vsScreenSkin = vsScreenSkin;
            c.players[i].team = playerTeam;
        }
    }

    c.relativePathOfFile = function (path) {
        if (fs.existsSync(__dirname + path)) {
            return "Resources" + path;
        } else {
            return "";
        }
    }

    c.showWLBoxes = function () {
        return (c.forceWL || c.roundInfo.name.indexOf('Grand Finals') != -1);
    }

    c.loadGames = function () {
        //if the folder name contains '_Workshop' or 'Random', exclude it
        const gameList = fs.readdirSync(__dirname + "/Games/").filter(name => {
            if (name != "Defaults") {
                return true;
            }
        });

        c.games = gameList;
    }
    c.loadGames();

    c.loadCharacters = function () {
        //if the folder name contains '_Workshop' or 'Random', exclude it
        const characterList = fs.readdirSync(charPath).filter(name => {
            if (name != "Random" && name.indexOf('.webm') == -1) {
                return true;
            }
        });

        c.characterList = [];

        c.characterList.push({
            name: "Random",
            skins: []
        });
        for (let i = 0; i < characterList.length; i++) {
            let charInfo = getJson(charPath + "/" + characterList[i] + "/_Info");
            var character = {
                name: characterList[i],
                skins: charInfo.skinList
            }
            c.characterList.push(character);
        }
    }

    c.gameChanged = function () {
        charPath = gamePath + "/" + c.game + "/";
        charPathRel = gamePathRel + "/" + c.game + "/";

        c.saveGUISettings();
        c.clearPlayers();
        c.loadCharacters();
    }

    c.profileFilter = function (item) {
        if (item.game == c.game) {
            return true;
        }
        return false;
    }

    c.scoreboxChanged = function (side, index) {

        if (!c.sides[side].checkboxes[index]) {
            if (!c.sides[side].checkboxes[2]) {}
            if (!c.sides[side].checkboxes[1]) {
                c.sides[side].checkboxes[2] = false;
            }
            if (!c.sides[side].checkboxes[0]) {
                c.sides[side].checkboxes[1] = c.sides[side].checkboxes[2] = false;
            }
            c.sides[side].score = c.calcScore(side);
            return;
        }
        if (c.sides[side].checkboxes[index]) {
            if (c.sides[side].checkboxes[2]) {
                c.sides[side].checkboxes[0] = c.sides[side].checkboxes[1] = true;
            } else if (c.sides[side].checkboxes[1]) {
                c.sides[side].checkboxes[0] = true;
            } else if (c.sides[side].checkboxes[0]) {

            }
        }

        c.sides[side].score = c.calcScore(side);
    }

    c.calcScore = function (side) {
        if (c.sides[side].checkboxes[2]) {
            return 3;
        } else if (c.sides[side].checkboxes[1]) {
            return 2;
        } else if (c.sides[side].checkboxes[0]) {
            return 1;
        } else {
            return 0;
        }
    }

    c.updateCheckboxes = function (side) {
        let value = c.sides[side].score;
        if (value >= 3) {
            c.sides[side].checkboxes[0] = c.sides[side].checkboxes[1] = c.sides[side].checkboxes[2] = true;
        } else if (value == 2) {
            c.sides[side].checkboxes[2] = false;
            c.sides[side].checkboxes[1] = c.sides[side].checkboxes[1] = true;
        } else if (value == 1) {
            c.sides[side].checkboxes[2] = c.sides[side].checkboxes[1] = false;
            c.sides[side].checkboxes[0] = true;
        } else {
            c.sides[side].checkboxes[2] = c.sides[side].checkboxes[1] = c.sides[side].checkboxes[0] = false;
        }
    }

    c.setScore = function (side, value) {
        c.sides[side].score = value;

        c.updateCheckboxes(side, value);
    }

    c.setWL = function (side, value) {
        c.sides[side].wl = value;
    }

    c.checkIfRoundSupportsPips = function () {
        if (c.roundInfo.name.indexOf("First to") != -1 || c.onDeckRoundInfo.name.indexOf("First to") != -1) {
            return false;
        }
        return true;
    }

    c.roundChange = function () {
        // we dont want to force people to use them. Only prevent them from using pips when it doesnt make sense
        if (!c.checkIfRoundSupportsPips()) {
            c.usePips = false;
        }
    }

    c.showRoundNumber = function (onDeck = false) {
        let roundType = 'roundInfo';
        if (onDeck) {
            roundType = 'onDeckRoundInfo';
        }
        return (!c.useCustomRound && (c[roundType].name.indexOf("Round") != -1 || c[roundType].name.indexOf("First to") != -1));
    }

    c.buildRoundName = function (onDeck = false) {
        let roundType = 'roundInfo';
        if (onDeck) {
            roundType = 'onDeckRoundInfo';
        }
        let roundName = (!c.useCustomRound && (c[roundType].name.indexOf("Round") != -1 || c[roundType].name.indexOf("First to") != -1) && c[roundType].number > 0) ? c[roundType].name + " " + c[roundType].number : c[roundType].name;

        return (roundName == "Grand Finals" && (c.sides.left.wl == "L" && c.sides.right.wl == "L")) ? roundName += " - Reset" : roundName;
    }

    c.saveWLData = function () {
        return (c.buildRoundName().indexOf('Grand Finals') != -1 || c.forceWL);
    }

    c.setSideColor = function (side, name, hex) {
        c.sides[side].color.name = name;
        c.sides[side].color.hex = hex;
    }

    c.setSideColorFromHex = function (side, ) {
        var n_match = ntc.name(c.sides[side].color.hex);

        c.sides[side].color.name = n_match[1];
    }

    c.getBackgroundGradient = function (side) {
        return {
            "backgroundImage": "linear-gradient(to bottom left, " + c.sides[side].color.hex + "50, #00000000, #00000000)"
        }

    }

    c.setPlayerFieldFocus = function (bool) {
        c.inPlayerField = bool;
    }
    c.setProfileSelectorFocus = function (bool) {
        c.inProfileSelector = bool;
    }

    c.showProfileList = function () {
        return (c.inPlayerField === true || c.inProfileSelector === true);
    }

    c.getPlayerIndexRightSide = function (index) {
        return (c.gamemode == 'Singles') ? index + 1 : index + c.players.length / 2;
    }

    c.getPlayerNumberRightSide = function (index) {
        return c.getPlayerIndexRightSide + 1;
    }

    // whenever the user clicks on the HD renders checkbox
    c.HDtoggle = function () {
        // enables or disables the second forceHD option
        if (c.forceHD) {
            c.noLoAHD = false;
        }

        // save current checkbox value to the settings file
        c.saveGUISettings();

    }

    // sends the signal to electron to activate always on top
    c.alwaysOnTopToggle = function () {
        ipc.send('alwaysOnTop', c.alwaysOnTop);
        c.saveGUISettings();
    }

    // called whenever the used clicks on a settings checkbox
    c.saveGUISettings = function () {
        // read the file
        const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));

        guiSettings.allowIntro = c.allowIntro;
        guiSettings.workshop = c.useWorkshop;
        guiSettings.forceMM = c.forceMM;
        guiSettings.forceHD = c.forceHD;
        guiSettings.noLoAHD = c.noLoAHD;
        guiSettings.forceWL = c.forceWL;
        guiSettings.usePips = c.usePips;
        guiSettings.alwaysOnTop = c.alwaysOnTop;
        guiSettings.maxPlayers = c.maxPlayers;
        guiSettings.useCustomRound = c.useCustomRound;
        guiSettings.useCustomColors = c.useCustomColors;
        guiSettings.showOnDeck = c.showOnDeck;
        guiSettings.game = c.game;

        // save the file
        fs.writeFileSync(textPath + "/GUI Settings.json", JSON.stringify(guiSettings, null, 2));
    }

    // c.showPlayerFinder = function() {
    //     return inPF;
    // }

    //Python stuff. If you would prefer to use some python scripts (easier to modify after exe is created) place them here.
    const usePythonForPlayerJson = false;
    const usePythonForScores = false; //Buggy since it overwrites the files. Best left alone. Script is also deactivated, even if you enable this. The score portion is also deactived on the python script and will only update player jsons.
    const usePythonForCreatingSetData = false;
    const usePythonForClearingSetData = false;

    let movedSettings = false;

    let currentFocus = -1;

    c.maxPlayers = 4;



    //preload  Right Navbar
    const viewport = document.getElementById('viewport');
    const overlayDiv = document.getElementById('overlay');
    const goBackDiv = document.getElementById('goBack');


    function setupPlayersVar() {
        let playerArray = [];
        for (let i = 0; i < c.maxPlayers; i++) {
            let player = {
                name: "",
                twitter: "",
                pronouns: "",
                tag: "",
                character: "Random",
                characterIndex: 0,
                skin: ""
            }
            playerArray.push(player);
        }
        return playerArray;
    }
    c.players = [];
    c.onDeckPlayers = [];
    c.playerProfiles = c.getPlayerProfiles("");

    c.casters = [{
            name: "",
            twitter: "",
            twitch: "",
        },
        {
            name: "",
            twitter: "",
            twitch: ""
        }
    ]
    c.sides = {
        left: {
            teamName: "",
            color: {
                name: "Red",
                hex: "#ed1c23"
            },
            showColorPicker: false,
            wl: 'W',
            score: 0,
            checkboxes: [
                false,
                false,
                false
            ]
        },
        right: {
            teamName: "",
            color: {
                name: "Blue",
                hex: "#00b7ef"
            },
            showColorPicker: false,
            wl: 'L',
            score: 0,
            checkboxes: [
                false,
                false,
                false
            ]
        }
    };


    c.allowIntro = false;
    c.useWorkshop = false; ///This is temporary. Add support for any game, be it Rivals Workshop, or TF2
    c.forceMM = false;
    c.forceHD = false;
    c.noLoAHD = false;
    c.forceWL = false;
    c.usePips = false;
    c.alwaysOnTop = false;
    c.showOnDeck = true;
    c.game = "Rivals of Aether";

    c.init = function () {
        // setup Settings region and go back.
        document.getElementById('settingsRegion').addEventListener("click", moveViewport);

        //if the viewport is moved, click anywhere on the center to go back
        document.getElementById('goBack').addEventListener("click", goBack);

        //move the viewport to the center (this is to avoid animation bugs)
        // viewport.style.right = "100%";

        //Load GUI.
        const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));
        for (var key in guiSettings) {
            c[key] = guiSettings[key];
        }

        c.setMaxPlayers();

        c.alwaysOnTopToggle();


        charPath = gamePath + "/" + c.game + "/";
        charPathRel = gamePathRel + "/" + c.game + "/";

        c.loadCharacters();

        /* KEYBOARD SHORTCUTS */

        //enter
        Mousetrap.bind('enter', () => {

            // if (isPresetOpen()) {
            //     //if a player presets menu is open, load preset
            //     for (let i = 0; i < pFinders.length; i++) {
            //         if (pFinders[i].style.display == "block" && currentFocus > -1) {
            //             pFinders[i].getElementsByClassName("finderEntry")[currentFocus].click();
            //         }
            //     }
            // } else {
            //update scoreboard info (updates botBar color for visual feedback)
            c.writeScoreboard();
            // document.getElementById('botBar').style.backgroundColor = "var(--bg3)";
            // }

        }, 'keydown');
        //when releasing enter, change bottom bar's color back to normal
        Mousetrap.bind('enter', () => {
            document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
        }, 'keyup');

        //esc to clear player info
        Mousetrap.bind('esc', () => {
            if (movedSettings) { //if settings are open, close them
                goBack();
            } else if (c.showProfileList()) { //if a player preset is open, close it
                c.inPlayerField = false;
                c.inProfileSelector = false;
            } else {
                c.clearPlayers(); //by default, clear player info
            }

        });

        //F1 or F2 to give players a score tick
        Mousetrap.bind('f1', () => {
            c.setScore('left', c.sides.left.score + 1);
        });
        Mousetrap.bind('f2', () => {
            c.setScore('right', c.sides.left.score + 1);
        });

        // //up/down, to navigate the player presets menu (only when a menu is shown)
        // Mousetrap.bind('down', () => {
        //     for (let i = 0; i < pFinders.length; i++) {
        //         if (pFinders[i].style.display == "block") {
        //             currentFocus++;
        //             addActive(pFinders[i].getElementsByClassName("finderEntry"));
        //         }
        //     }
        // });
        // Mousetrap.bind('up', () => {
        //     for (let i = 0; i < pFinders.length; i++) {
        //         if (pFinders[i].style.display == "block") {
        //             currentFocus--;
        //             addActive(pFinders[i].getElementsByClassName("finderEntry"));
        //         }
        //     }
        // });
    }


    c.init();
    c.mainLoop = async function () {
        const scInfo = await getInfo();
        c.externalUpdateCheck(scInfo);
    }
    c.mainLoop();
    setInterval(() => {
        c.mainLoop();
    }, 1000); //update interval

    c.externalUpdateCheck = function (scInfo) {
        if (scInfo['externalUpdate'] == true) {
            //Update player data
            const player = scInfo['player'];
            if (player[0].name == "" && player[1].name == "") {
                c.clearPlayers();
                c.writeScoreboard();
                return;
            }

            //Update score data
            const score = scInfo['score'];

            c.setScore('left', score[0]);
            c.setScore('right', score[1]);

            //Other stuff?
            c.writeScoreboard();
            $scope.$apply();
        }
    }
    //searches for the main json file
    function getInfo() {
        return new Promise(function (resolve) {
            const oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("GET", textPath + '/ScoreboardInfo.json');
            oReq.send();

            //will trigger when file loads
            function reqListener() {
                resolve(JSON.parse(oReq.responseText))
            }
        })
        //i would gladly have used fetch, but OBS local files wont support that :(
    }

    function moveViewport() {
        if (!movedSettings) {
            viewport.style.transform = "translateX(calc(-140% / 3))";
            overlayDiv.style.opacity = ".25";
            goBackDiv.style.display = "block"
            movedSettings = true;
        }
    }

    function goBack() {
        viewport.style.transform = "translateX(calc(-100% / 3))";
        overlayDiv.style.opacity = "1";
        goBackDiv.style.display = "none";
        movedSettings = false;
    }


    //called whenever we need to read a json file
    function getJson(jPath) {
        try {
            return JSON.parse(fs.readFileSync(jPath + ".json"), 'utf-8');
        } catch (error) {
            return null;
        }
    }

    //called whenever the user types something in the player name box
    c.checkPlayerPreset = function (playerIndex, onDeck = false) {
        let playerType = "players";
        c.playerFocus = playerIndex;
        c.playerFocusOnDeck = onDeck;
        if (onDeck) {
            playerType = 'onDeckPlayers';
        }
        c.playerProfiles = c.getPlayerProfiles(c[playerType][playerIndex].name);
    }


    c.addFlipIfRandom = function (player) {
        let randomSelected = false;

        if (c.players[player].character == 'Random' || c.getSkinPath(player).indexOf(randomSkinPath) != -1) {
            randomSelected = true;
        }

        if (randomSelected) {
            return {
                '-webkit-transform': "scaleX(-1)"
            };
        } else {
            return {
                '-webkit-transform': "scaleX(1)"
            };
        }
    }

    c.getTransformForCharImage = function (character, skin) {
        const charInfo = getJson(charPath + "/" + character + "/_Info");
        const charSkinPath = c.getSkinPath(character, skin);

        let randomSelected = false;

        if (character == 'Random' || charSkinPath.indexOf(randomSkinPath) != -1) {
            randomSelected = true;
        }

        let left = 0;
        let top = 0;
        let scale = 0;

        if (charInfo != null && !randomSelected) {
            if (charInfo.gui[skin]) { //if the skin has a specific position
                left = charInfo.gui[skin].x;
                top = charInfo.gui[skin].y;
                scale = charInfo.gui[skin].scale;
            } else { //if none of the above, use a default position
                left = charInfo.gui.neutral.x;
                top = charInfo.gui.neutral.y;
                scale = charInfo.gui.neutral.scale;
            }
        } else { //if the character isnt on the database, set positions for the "?" image
            left = 0;
            top = 0;
            scale = 1.2;
        }

        let scaleX, scaleY = scale;
        scaleX = (randomSelected) ? -scale : scale

        let style = {
            left: left + "px",
            top: top + "px",
            transform: "scale(" + scaleX + ", " + scaleY + ")"
        }

        return style;
    }


    //visual feedback to navigate the player presets menu
    function addActive(x) {
        //clears active from all entries
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("finderEntry-active");
        }

        //if end of list, cicle
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);

        //add to the selected entry the active class
        x[currentFocus].classList.add("finderEntry-active");
    }


    function checkCustomSkin(pNum) {

        pNum -= 1

        //get the player preset list for the current text
        const playerList = getJson(textPath + "/Player Info/" + pNameInps[pNum].value);

        if (playerList != null) { //safety check

            playerList.characters.forEach(char => { //for each possible character

                //if the current character is on the list
                if (char.character == charLists[pNum].selectedOptions[0].text) {
                    if (char.character != "Random") {

                        //first, check if theres a custom skin already
                        if (skinLists[pNum].selectedOptions[0].className == "playerCustom") {
                            skinLists[pNum].remove(skinLists[pNum].selectedIndex);
                        }

                        const option = document.createElement('option'); //create new entry
                        option.className = "playerCustom"; //set class so the background changes
                        option.text = char.skin; //set the text of entry
                        skinLists[pNum].add(option, 0); //add the entry to the beginning of the list
                        skinLists[pNum].selectedIndex = 0; //leave it selected
                        skinChange(skinLists[pNum]); //update the image
                    }
                }
            });
        }
    }

    c.onDeckToStream = function () {
        for (let i = 0; i < c.players.length; i++) {
            for (let field in c.players[i]) {
                if (c.players[i][field] != "$$hashKey") {
                    let tempData = c.players[i][field];
                    c.players[i][field] = c.onDeckPlayers[i][field];
                    c.onDeckPlayers[i][field] = tempData;
                }
            }
        }
        for (let field in c.roundInfo) {
            if (c.roundInfo[field] != "$$hashKey") {
                let tempData = c.roundInfo[field];
                c.roundInfo[field] = c.onDeckRoundInfo[field];
                c.onDeckRoundInfo[field] = tempData;
            }
        }
    }

    c.swap = function (onDeckPlayers = false) {
        let playerType = 'players';
        if (onDeckPlayers) {
            playerType = 'onDeckPlayers';
        }

        let playersPerSide = c.maxPlayers / 2;

        if (c.gamemode == "Singles") {
            playersPerSide = 1;
        }

        for (let i = 0; i < playersPerSide; i++) {
            for (let field in c[playerType][i]) {
                if (c[playerType][i][field] != "$$hashKey") {
                    let tempData = c[playerType][i][field];
                    c[playerType][i][field] = c[playerType][i + playersPerSide][field];
                    c[playerType][i + playersPerSide][field] = tempData;
                }
            }
        }

        if (c.gamemode == 'Singles') {
            let tempColor = c.sides.left.color;
            c.sides.left.color = c.sides.right.color;
            c.sides.right.color = tempColor;
        }
        let tempSide = c.sides.left;
        c.sides.left = c.sides.right;
        c.sides.right = tempSide;
    }

    c.clearPlayers = function (onDeckPlayers = false) {
        let playerType = 'players';
        if (onDeckPlayers) {
            playerType = 'onDeckPlayers';
        } else {
            c.setScore('left', 0);
            c.setScore('right', 0);
        }

        c[playerType] = setupPlayersVar();
    }

    //to force the list to use a specific entry
    function changeListValue(list, name) {
        for (let i = 0; i < list.length; i++) {
            if (list.options[i].text == name) {
                list.selectedIndex = i;
            }
        }
    }


    c.copyToClipboard = function () {

        //initialize the string
        let copiedText = c.tournamentName + " - " + c.buildRoundName() + " - ";

        if (c.gamemode == 'Singles') { //for singles matches
            //check if the player has a tag to add
            for (let i = 0; i < 2; i++) {
                if (i == 1) {
                    copiedText += " VS "
                }
                let tag = c.players[i].tag;
                copiedText += (tag) ? tag + " | " : "";
                copiedText += c.players[i].name;
                copiedText += " (" + c.players[i].character + ")";
            }
        } else { //for team matches
            copiedText += c.sides.left.teamName + " VS " + c.sides.right.teamName;
        }

        //send the string to the user's clipboard
        navigator.clipboard.writeText(copiedText);
    }

    function updatePlayerJson(player, forceUpdate = false) {
        if (!player) {
            return;
        }

        let playerInfo = getJson(textPath + "/Player Info/" + player.name);

        if (playerInfo == undefined) {
            playerInfo = {
                "name": player.name,
                "twitter": player.twitter,
                "pronouns": player.pronouns,
                "tag": player.tag,
                "characters": [{
                    "character": player.character,
                    "skin": player.skin
                }],
                "game": c.game
            }
        } else {
            playerInfo.twitter = player.twitter;
            playerInfo.tag = player.tag;
            playerInfo.pronouns = player.pronouns;

            let newCharacter = true;

            let foundCount = 0;
            let foundIndexLast = "";

            for (let i = 0; i < playerInfo.characters.length; i++) {
                if (playerInfo.characters[i].character == player.character) {
                    playerInfo.characters[i].skin = player.skin;
                    playerInfo.characters[i].game = c.game;
                    newCharacter = false;
                    foundCount++;
                    foundIndexLast = i;
                }
            }

            if (foundCount > 1) {
                playerInfo.characters.splice(foundIndexLast, 1);
            }
            

            if (newCharacter == true) {
                playerInfo.characters.push({
                    "character": player.character,
                    "skin": player.skin,
                    "game": c.game
                });
            }
        }

        if (usePythonForPlayerJson) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', [scriptsPath + "/RoAUpdatePlayerJson.py", JSON.stringify(player, null, 2)])
        } else {
            fs.writeFileSync(textPath + "/Player Info/" + player.name + '.json', JSON.stringify(playerInfo, null, 2), encoding);
        }
    }

    //This is used to identify information when renaming files with python. Not needed unless using the extra python scripts.
    function storeSetSpecificInfo(players, tournamentName, round) {
        if (usePythonForCreatingSetData) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', [scriptsPath + "/RoAUpdateSetInfo.py"]);
        } else {
            let data = {
                "player": [],
                "tournamentName": tournamentName,
                "round": round,
            };
            for (let i = 0; i < players.length; i++) {
                data.player.push({
                    "name": players[i].name,
                    "twitter": players[i].twitter,
                    "pronouns": players[i].pronouns,
                    "tag": players[i].tag,
                    "characters": [players[i].character]
                });
            }

            if (fs.existsSync(textPath + "/SetDataInfo.json")) {
                // load data and try to update it.
                let jsonData = getJson(textPath + "/SetDataInfo");
                for (let i = 0; i < data.player.length; i++) {
                    for (let j = 0; j < jsonData.player.length; j++) {
                        if (data.player[i].name == jsonData.player[j].name) {
                            let tempCharactersArray = [];
                            for (let c = 0; c < jsonData.player[j].characters.length; c++) {
                                if (!data.player[i].characters.includes(jsonData.player[j].characters[c])) {
                                    tempCharactersArray.push(jsonData.player[j].characters[c]);
                                }
                            }
                            data.player[i].characters = tempCharactersArray.concat(data.player[i].characters);
                        }
                    }
                }
            }

            fs.writeFileSync(textPath + "/SetDataInfo.json", JSON.stringify(data, null, 2), encoding);
        }

    }


    //time to write it down
    c.writeScoreboard = function () {
        c.getPathsForOverlays();
        //this is what's going to be in the json file
        const scoreboardJson = {
            player: [], //more lines will be added below
            teamName: [
                (c.sides.left.teamName) ? (c.sides.left.teamName) : c.sides.left.color.name + " Team",
                (c.sides.right.teamName) ? (c.sides.right.teamName) : c.sides.right.color.name + " Team"
            ],
            color: [
                c.sides.left.color,
                c.sides.right.color
            ],
            score: [
                c.sides.left.score,
                c.sides.right.score
            ],
            wl: [
                (c.saveWLData()) ? c.sides.left.wl : "",
                (c.saveWLData()) ? c.sides.right.wl : "",
            ],
            bestOf: c.roundInfo.bestOf,
            gamemode: c.gamemode,
            round: c.buildRoundName(),
            tournamentName: c.tournamentName,
            caster: [],
            allowIntro: c.allowIntro,
            workshop: c.workshop,
            forceMM: c.forceMM,
            forceHD: c.forceHD,
            noLoAHD: c.noLoAHD,
            forceWL: c.forceWL,
            usePips: c.usePips,
            maxPlayers: c.maxPlayers,
            useCustomRound: c.useCustomRound,
            useCustomColors: c.useCustomColors,
            showOnDeck: c.showOnDeck,
            game: c.game,
            externalUpdate: false
        };
        //add the player's info to the player section of the json
        for (let i = 0; i < c.players.length; i++) {
            let player = {};
            for (let field in c.players[i]) {
                if (field != "$$hashKey") {
                    player[field] = c.players[i][field];
                }
            }
            scoreboardJson.player.push(player);

            updatePlayerJson(scoreboardJson.player[i])
        }

        for (let i = 0; i < c.casters.length; i++) {
            let caster = {};
            for (let field in c.casters[i]) {
                if (field != "$$hashKey") {
                    caster[field] = c.casters[i][field];
                }
            }
            scoreboardJson.caster.push(caster);
        }

        //now convert it to a text we can save intro a file
        const data = JSON.stringify(scoreboardJson, null, 2);
        fs.writeFileSync(textPath + "/ScoreboardInfo.json", data, encoding);


        //simple .txt files
        for (let i = 0; i < c.players.length; i++) {
            fs.writeFileSync(textPath + "/Simple Texts/Player " + (i + 1) + ".txt", c.players[i].name, encoding);
        }

        fs.writeFileSync(textPath + "/Simple Texts/Team 1.txt", c.sides.left.teamName, encoding);
        fs.writeFileSync(textPath + "/Simple Texts/Team 2.txt", c.sides.right.teamName, encoding);

        fs.writeFileSync(textPath + "/Simple Texts/Score L.txt", c.sides.left.score.toString(), encoding);
        fs.writeFileSync(textPath + "/Simple Texts/Score R.txt", c.sides.right.score.toString(), encoding);

        fs.writeFileSync(textPath + "/Simple Texts/Round.txt", c.buildRoundName(), encoding);
        fs.writeFileSync(textPath + "/Simple Texts/Tournament Name.txt", c.tournamentName, encoding);

        for (let i = 0; i < c.casters.length; i++) {
            fs.writeFileSync(textPath + "/Simple Texts/Caster " + (i + 1) + " Name.txt", c.casters[i].name, encoding);
            fs.writeFileSync(textPath + "/Simple Texts/Caster " + (i + 1) + " Twitter.txt", c.casters[i].twitter, encoding);
            fs.writeFileSync(textPath + "/Simple Texts/Caster " + (i + 1) + " Twitch.txt", c.casters[i].twitch, encoding);
        }


        storeSetSpecificInfo(scoreboardJson.player, scoreboardJson.tournamentName, scoreboardJson.round);
        // const spawn = require("child_process").spawn;
        // const pythonProcess = spawn('python',[scriptsPath + "/RoAUpdateScores.py", checkScore(p1Win1, p1Win2, p1Win3), checkScore(p2Win1, p2Win2, p2Win3)]);
    }


});