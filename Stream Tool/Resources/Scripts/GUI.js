'use strict';

const {
    getPackedSettings
} = require('http2');


var app = angular.module('angularapp', []);
app.controller('AngularAppCtrl', function ($scope) {
    var c = $scope;

    $scope.title = "This is a message";
    // $scope.body = "Welcome Modal";
    $scope.test = 'testing';

    //TODO: Rework this as a directive. It would make it more consistent.
    // this is a weird way to have file svg's that can be recolored by css
    customElements.define("load-svg", class extends HTMLElement {
        async connectedCallback(
            shadowRoot = this.shadowRoot || this.attachShadow({
                mode: "open"
            })
        ) {
            shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
            // let svgClass = this.getAttribute('class');
            // let style = getComputedStyle(this);
            // // this.setAttribute('class', '');

            // // console.log(svgClass);
            // if (svgClass) {
            //     // shadowRoot.innerHTML = shadowRoot.innerHTML.replace('<svg ', '<svg style="height:' + style.height + '; width: '+ style.width +';" ');
            //     shadowRoot.innerHTML = shadowRoot.innerHTML.replace('<svg ', '<svg style="height:100%; width:100%;" ');

            //     // shadowRoot.innerHTML = shadowRoot.innerHTML.replace('<svg ', '<svg class="' + svgClass + '" ');
            // }
            $scope.$apply();
        }
    })

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

    /*
        "/Resources/Games/Rivals of Aether/Characters"
        "/Resources/Games/Rivals Workshop/Characters"
        "/Resources/Games/Multiversus/Characters"
    */

    const randomSkinPath = gamePath + "/Defaults/Random.png";
    const randomIconPath = gamePath + "/Defaults/icon.png"
    const randomSkinPathRel = "/Games/Defaults/Random.png";
    const defaultWbBackground = "/Games/Defaults/BG.webm";


    //Angular Scoped Variables (to be used on HTML)
    c.characterList = [];
    c.colorList = getJson(textPath + "/Color Slots");
    c.roundNames = getJson(textPath + "/RoundNames");
    c.games = [];
    c.useCustomRound = false;
    c.useTeamNames = false;

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
    c.settingsPageNumber = 1;
    c.settingsPageName = 'Settings';
    c.settingsPageNames = [
        "",
        'Settings',
        'Automated Stream Tool Settings',
        'OBS Settings'
    ];
    c.maxPages = c.settingsPageNames.length - 1;
    c.seasonalSkins = [
        "Valentines",
        "Summer",
        "Halloween",
        "Christmas"
    ];
    c.hdOptions = [
        'None',
        'VS Screen',
        'Scoreboard',
        'Both'
    ];
    c.seasonalSkin = c.seasonalSkins[0];
    c.forceHDChoice = c.hdOptions[0];

    //TODO: Move all player socials data into a socials heirarchy instead of needing this garbage.
    c.playerFields = [{
            'label': 'Pronouns',
            'field': 'pronouns',
            'title': "Insert the Player's pronouns here"
        },
        {
            'label': 'Tag',
            'field': 'tag',
            'title': "Insert the tag/team/sponsor here"
        },
        {
            'label': 'Twitter',
            'field': 'twitter',
            'title': "Insert the Player's Twitter here"
        },
        {
            'label': 'Twitch',
            'field': 'twitch',
            'title': "Insert the Player's Twitch here"
        },
        {
            'label': 'Youtube',
            'field': 'youtube',
            'title': "Insert the Player's Youtube here"
        },
        {
            'label': 'Discord',
            'field': 'discord',
            'title': "Insert the Player's Discord here"
        }
    ];


    c.obsSettings = {
        useObsAutomation: false,
        autoChangeScenes: 'manualFromOBS',
        vsScreenName: "",
        scoreboardSceneName: "",
        autoRecordSets: false,
        startScene: "",
        endScene: "",
        currentScene: "",
    };

    let currentIntervalForVsScreen = 0;
    const intervalBeforeVsScreenShows = 8;
    c.addressRockerSettings = {
        useAddressRocker: false,
        enableCharacterUpdate: false,
        enableSkinUpdate: false,
        enableBestOfUpdate: false,
        enableScoreUpdate: false,
        inMatch: false,
        inSet: false,
        showInfo: false,
        setTeamColor: false
    };

    c.showTop8 = false;

    c.top8Settings = {
        useTopText: false,
        topText: "",
        useBottomText: false,
        bottomTextBracket: "",
        bottomTextYoutube: "",
        bottomTextTwitch: "",
        bottomTextTwitter: "",
        top8Ties: true,
        useP1Background: true,
        useCustomBackground: false,
        customBackground: ""
    };

    c.obsSetScreen = function (scene, forced = false) {
        if (!scene) {
            return;
        }
        if (c.obsSettings.autoChangeScenes == 'addressRockerAuto' || forced) {
            c.obsSettings.currentScene = c.obsSettings[scene];
            c.saveOBSSettings();
        }
    }

    c.toggleSetStart = function () {
        c.addressRockerSettings.inSet = true;
        c.updateInterval = 500;
        currentIntervalForVsScreen = 0;
        c.setScore('left', 0);
        c.setScore('right', 0);
        c.obsSetScreen('startScene');
        c.saveGUISettings();

    }

    c.toggleSetStop = function () {
        c.addressRockerSettings.inSet = false;
        currentIntervalForVsScreen = 0;
        c.updateInterval = 1000;
        c.obsSetScreen('endScene');
        c.saveGUISettings();
        // c.renameFilesPython();
    }

    c.showSettingsPagePrevButton = function () {
        return (c.settingsPageNumber > 1);
    }
    c.showSettingsPageNextButton = function () {
        return (c.settingsPageNumber < c.maxPages);
    }

    c.changeSettingsPage = function (value) {
        c.settingsPageNumber += value;
        c.settingsPageName = c.settingsPageNames[c.settingsPageNumber];
    }
    c.getColorList = function () {
        c.colorList = getJson(textPath + "/Color Slots");
    }

    c.saveColorPreset = function (side) {
        let colorExists = false;
        let tempColors = [];
        for (let i = 0; i < c.colorList.length; i++) {
            tempColors.push({
                name: c.colorList[i].name,
                hex: c.colorList[i].hex,
            });
            if (c.sides[side].color.hex == c.colorList[i].hex) {
                colorExists = true;
            }
        }

        if (!colorExists) {
            tempColors.push(c.sides[side].color);
            fs.writeFileSync(textPath + "/Color Slots.json", JSON.stringify(tempColors, null, 2), encoding);
            c.getColorList();
        }
    }

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
                    if (char.game == c.game.name) {
                        let profile = {
                            name: playerInfo.name,
                            pronouns: playerInfo.pronouns,
                            tag: playerInfo.tag,
                            twitter: playerInfo.twitter,
                            twitch: playerInfo.twitch,
                            youtube: playerInfo.youtube,
                            discord: playerInfo.discord,
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
                            pronouns: playerInfo.pronouns,
                            tag: playerInfo.tag,
                            twitter: playerInfo.twitter,
                            twitch: playerInfo.twitch,
                            youtube: playerInfo.youtube,
                            discord: playerInfo.discord,
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

    c.applyProfile = function (index, event) {
        let playerType = 'players';
        if (c.playerFocusOnDeck) {
            playerType = 'onDeckPlayers';
        }

        if (c.showTop8) {
            playerType = 'top8Players'
        }

        if (event.altKey && event.ctrlKey) {
            updatePlayerJson(c.playerProfiles[index], true);
            c.inPlayerField = false;
            c.inProfileSelector = false;
            return;
        }

        for (let i in c.playerFields) {
            c[playerType][c.playerFocus][c.playerFields[i].field] = c.playerProfiles[index][c.playerFields[i].field];
        }
        c[playerType][c.playerFocus].name = c.playerProfiles[index].name;
        c[playerType][c.playerFocus].character = c.playerProfiles[index].character;
        c[playerType][c.playerFocus].skin = c.playerProfiles[index].skin;
        c.markCharacterIndex(c.playerFocus, false, c.playerFocusOnDeck);
        for (let i = 0; i < c.characterList.length; i++) {
            if (c.characterList[i].name == c.playerProfiles[index].character) {
                for (let j = 0; j < c.characterList[i].skins.length; j++) {
                    if (c.characterList[i].skins[j].fileName == c.playerProfiles[index].skin) {
                        c[playerType][c.playerFocus].skinIndex = c.characterList[i].skins[j].index;
                    }
                }
            }
        }
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

    c.getGameAbbr = function(game) {
        let abbr = "RoA";
        if (game == 'Rivals Workshop') {
            return "RoAWS";
        }
        let exp = /\b[a-zA-Z\d]|[A-Z]/g; //gets the first letter of each and capital letters

        let abbrArr = game.match(exp);
        

        if (abbrArr.length > 0) {
            abbr = abbrArr.toString().replaceAll(',', '');
        }

        return abbr;
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
        c.top8Players = setupPlayersVar(true);
        c.saveGUISettings();
    }

    c.markCharacterIndex = function (player, updateSkin = true, onDeck = false) {
        let playerType = "players";
        if (onDeck) {
            playerType = "onDeckPlayers";
        }

        if (c.showTop8) {
            playerType = 'top8Players';
        }


        c[playerType][player].characterIndex = c.characterList.map(e => e.name).indexOf(c[playerType][player].character);
        if (updateSkin) {
            c[playerType][player].skin = (c[playerType][player].character != "Random") ? "Default" : "";
            c[playerType][player].skinIndex = 0;
        }
    }

    c.setSkinBasedOnIndex = function (player, skinIndex = -1, onDeckPlayers = false) {

        let playerType = 'players';
        if (c.playerFocusOnDeck) {
            playerType = 'onDeckPlayers';
        }
        if (c.showTop8) {
            playerType = 'top8Players'
        }

        let skins = c.characterList[c[playerType][player].characterIndex].skins;

        let arrayIndex = -1;
        if (skinIndex == -1) {
            skinIndex = c[playerType][player].skinIndex;
        }

        arrayIndex = skins.map(e => e.index).indexOf(skinIndex);
        try {
            c[playerType][player].skin = skins[arrayIndex].fileName;

            if (c[playerType][player].skin == "Calendar") {
                c[playerType][player].skin = c.seasonalSkin;
            }
        } catch (err) {
            c[playerType][player].skin = "Random";
            c[playerType][player].skinIndex = 0;
        }
    }

    c.updateSeasonalSkins = function () {
        for (let i = 0; i < c.players.length; i++) {
            if (c.seasonalSkins.indexOf(c.players[i].skin) != -1 || c.players[i].skin == 'Calendar') {
                c.players[i].skin = c.seasonalSkin;
            }
        }
        for (let i = 0; i < c.onDeckPlayers.length; i++) {
            if (c.seasonalSkins.indexOf(c.onDeckPlayers[i].skin) != -1 || c.onDeckPlayers[i].skin == 'Calendar') {
                c.onDeckPlayers[i].skin = c.seasonalSkin;
            }
        }
        c.saveGUISettings();
    }

    c.getSkinPathForPlayer = function (player) {
        c.players[player].guiSkinPath = c.getSkinPath(c.players[player].character, c.players[player].skin, player);
        return c.players[player].guiSkinPath;
    }

    c.getSkinPath = function (character, skin, player) {
        if (skin == 'Seasonal') {
            skin = c.seasonalSkin;
        }
        let path = "";
        if (character == "Random") {
            path = randomSkinPath;
        } else {
            path = charPath + character + "/" + skin + ".png";
        }

        return fs.existsSync(path) ? path : randomSkinPath;
    }

    c.getIconPath = function (character) {
        let path = "";
        if (character == "Random") {
            path = randomIconPath;
        } else {
            path = charPath + character + "/icon.png";
        }
        return fs.existsSync(path) ? path : randomIconPath;
    }

    c.getPathsForOverlays = function (top8 = false) {
        let random = c.relativePathOfFile(randomSkinPathRel);

        var players = c.players;
        if (top8) {
            players = c.top8Players;
        }
        for (let i in players) {
            let character = players[i].character;
            let skin = players[i].skin;
            let teamColor = "";
            let altSkin = players[i].skin;
            let vsScreenSkin = skin;
            let scoreboardSkin = skin;
            let playerTeam = 0;

            let defaultSkinPath = "";
            let vsScreenSkinPath = "";
            let scoreboardSkinPath = "";
            let defaultBackground = c.relativePathOfFile(defaultWbBackground);
            let gameDefaultBackground = c.relativePathOfFile(charPathRel + 'BG.webm');

            defaultBackground = (gameDefaultBackground) ? gameDefaultBackground : defaultBackground;
            let characterInfo = getJson(charPath + character + "/_Info");
            let backgroundPath = "";

            if (!top8) {
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
            }


            if (character == 'Random') {
                defaultSkinPath = random;
                vsScreenSkinPath = random;
                scoreboardSkinPath = random;
                skin = 'Random';
                vsScreenSkin = skin;
                scoreboardSkin = skin;
                backgroundPath = defaultBackground;
            } else {
                let defaultPath = c.relativePathOfFile(charPathRel + character + "/" + skin + ".png");

                defaultSkinPath = (defaultPath) ? defaultPath : random;

                backgroundPath = c.relativePathOfFile(charPathRel + character + "/BG.webm");


                let skinBackgroundFilename = characterInfo.skinList.find(({ label }) => label == skin).background;
                let skinSpecificBackground = c.relativePathOfFile(charPathRel + character + "/" + skinBackgroundFilename);

                backgroundPath = (skinSpecificBackground) ? skinSpecificBackground : backgroundPath;
                backgroundPath = (backgroundPath && skinBackgroundFilename != 'USE_DEFAULT') ? backgroundPath : defaultBackground;

                let altPath = "";
                if (c.game.name == 'Rivals of Aether') {
                    if (c.forceHD) {
                        if (skin.indexOf('LoA') != -1 && !c.noLoAHD && skin.indexOf('HD') == -1) {
                            altPath = c.relativePathOfFile(charPathRel + character + "/LoA HD.png");
                            altSkin = "LoA HD";
                        } else if (skin.indexOf('HD') == -1) {
                            altPath = c.relativePathOfFile(charPathRel + character + "/HD.png");
                            altSkin = "HD";
                        }
                    }
                }

                if (c.forceHDChoice == c.hdOptions[0]) {
                    vsScreenSkinPath = defaultSkinPath;
                    scoreboardSkinPath = defaultSkinPath;
                    vsScreenSkin = skin;
                    scoreboardSkin = skin;
                } else if (c.forceHDChoice == c.hdOptions[1]) {
                    vsScreenSkin = (altSkin) ? altSkin : skin;
                    vsScreenSkinPath = (altPath) ? altPath : defaultSkinPath;
                    scoreboardSkinPath = defaultSkinPath;
                    scoreboardSkin = skin;
                } else if (c.forceHDChoice == c.hdOptions[2]) {
                    scoreboardSkinPath = (altPath) ? altPath : defaultSkinPath;
                    scoreboardSkin = (altSkin) ? altSkin : skin;
                    vsScreenSkinPath = defaultSkinPath;
                    vsScreenSkin = skin;
                } else if (c.forceHDChoice == c.hdOptions[3]) {
                    vsScreenSkinPath = (altPath) ? altPath : defaultSkinPath;
                    vsScreenSkin = (altSkin) ? altSkin : skin;
                    scoreboardSkinPath = (altPath) ? altPath : defaultSkinPath;
                    scoreboardSkin = (altSkin) ? altSkin : skin;
                }

            }

            if (c.game.name == 'Rivals of Aether') {
                if (vsScreenSkinPath.indexOf('LoA') != -1) {
                    backgroundPath = c.relativePathOfFile(charPathRel + "BG LoA.webm");
                } 
                //City of the Elements (cote)
                // backgroundPath = c.relativePathOfFile(charPathRel + "Clairen/BG.webm");
            }


            players[i].defaultSkinPath = defaultSkinPath;
            players[i].vsScreenSkinPath = vsScreenSkinPath;
            players[i].scoreboardSkinPath = scoreboardSkinPath;
            players[i].backgroundWebm = backgroundPath;
            players[i].info = characterInfo;
            players[i].teamColor = teamColor;
            players[i].vsScreenSkin = vsScreenSkin;
            players[i].scoreboardSkin = scoreboardSkin;
            players[i].team = playerTeam;
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

        let games = [];

        for (let i = 0; i < gameList.length; i++) {
            let game = {
                name: gameList[i],
                abbr: c.getGameAbbr(gameList[i])
            }
            games.push(game);
        }

        c.games = games;
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
            var skins = [];
            for (let j = 0; j < charInfo.skinList.length; j++) {
                let skin = {
                    label: "",
                    fileName: "",
                    index: "-1"
                };
                try {
                    if (charInfo.skinList[j].label || charInfo.skinList[j].fileName) {
                        skin.label = (charInfo.skinList[j].label) ? charInfo.skinList[j].label : charInfo.skinList[j].fileName;
                        skin.fileName = (charInfo.skinList[j].fileName) ? charInfo.skinList[j].fileName : charInfo.skinList[j].label;
                        skin.index = charInfo.skinList[j].index;
                    }
                } catch (err) {

                }
                if (!skin.label || !skin.fileName || skin.index == -1) {
                    skin.label = charInfo.skinList[j];
                    skin.fileName = charInfo.skinList[j];
                    skin.index = j;
                }

                if (skin.fileName == 'Calendar') {
                    skin.fileName == c.seasonalSkin;
                }

                skins.push(skin);
            }
            var character = {
                name: characterList[i],
                skins: skins
            }
            c.characterList.push(character);
        }
    }

    c.gameChanged = function () {
        c.game.abbr = c.games.find(({ name }) => name == c.game.name).abbr;;
        charPath = gamePath + "/" + c.game.name + "/";
        charPathRel = gamePathRel + "/" + c.game.name + "/";
        if (c.game.name != 'Rivals of Aether') {
            c.addressRockerSettings.useAddressRocker = false;
            c.addressRockerSettings.enableCharacterUpdate = false;
            c.addressRockerSettings.enableSkinUpdate = false;
            if (c.game.name != 'Rivals Workshop') {
                c.obsSettings.autoChangeScenes = 'manualFromOBS';
            }
            c.forceHDChoice = c.hdOptions[0];
            c.HDtoggle();

        }
        c.addressRockerSettings.inMatch = false;
        c.addressRockerSettings.inSet = false;


        c.saveGUISettings();
        c.clearPlayers();
        c.loadCharacters();
    }

    c.profileFilter = function (item) {
        if (item.game == c.game.name) {
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
        if (c.forceHDChoice == c.hdOptions[0]) {
            c.forceHD = false;
            c.noLoAHD = false;
        } else {
            c.forceHD = true;
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

        c.saveTop8Settings();
        c.saveOBSSettings();
        // read the file
        const guiSettings = JSON.parse(fs.readFileSync(textPath + "/GUI Settings.json", "utf-8"));

        guiSettings.allowIntro = c.allowIntro;
        guiSettings.workshop = c.useWorkshop;
        guiSettings.forceMM = c.forceMM;
        guiSettings.forceHD = c.forceHD;
        guiSettings.forceHDChoice = c.forceHDChoice;
        guiSettings.noLoAHD = c.noLoAHD;
        guiSettings.forceWL = c.forceWL;
        guiSettings.usePips = c.usePips;
        guiSettings.alwaysOnTop = c.alwaysOnTop;
        guiSettings.maxPlayers = c.maxPlayers;
        guiSettings.useCustomRound = c.useCustomRound;
        guiSettings.useCustomColors = c.useCustomColors;
        guiSettings.useTeamNames = c.useTeamNames;
        guiSettings.showOnDeck = c.showOnDeck;
        guiSettings.game = c.game;
        guiSettings.addressRockerSettings = c.addressRockerSettings;
        guiSettings.obsSettings = c.obsSettings;
        guiSettings.seasonalSkin = c.seasonalSkin;

        // save the file
        fs.writeFileSync(textPath + "/GUI Settings.json", JSON.stringify(guiSettings, null, 2));
    }


    // called whenever the used clicks on a settings checkbox
    c.saveOBSSettings = function () {

        // read the file
        const obsSettings = JSON.parse(fs.readFileSync(textPath + "/OBS Settings.json", "utf-8"));

        obsSettings.useObsAutomation = c.obsSettings.useObsAutomation;
        if (c.obsSettings.useObsAutomation == false) {
            c.obsSettings.autoChangeScenes = 'manualFromOBS';
        }
        obsSettings.autoChangeScenes = c.obsSettings.autoChangeScenes;
        obsSettings.vsScreenName = c.obsSettings.vsScreenName;
        obsSettings.scoreboardSceneName = c.obsSettings.scoreboardSceneName;
        obsSettings.autoRecordSets = c.obsSettings.autoRecordSets;
        obsSettings.startScene = c.obsSettings.startScene;
        obsSettings.endScene = c.obsSettings.endScene;
        obsSettings.currentScene = c.obsSettings.currentScene;

        // save the file
        fs.writeFileSync(textPath + "/OBS Settings.json", JSON.stringify(obsSettings, null, 2));
    }


    // called whenever the used clicks on a settings checkbox
    c.saveTop8Settings = function () {
        // read the file
        const top8Settings = JSON.parse(fs.readFileSync(textPath + "/Top 8 Settings.json", "utf-8"));

        if (c.top8Settings.top8Ties) {

        }
        for (let i = 0; i < c.top8Players.length; i++) {
            c.top8Players[i].placement = i + 1;
            if (c.top8Settings.top8Ties) {
                if (i == 5 || i == 7) {
                    c.top8Players[i].placement = i
                }
            }
        }
        top8Settings.useTopText = c.top8Settings.useTopText;
        top8Settings.topText = c.top8Settings.topText;
        top8Settings.useBottomText = c.top8Settings.useBottomText;
        top8Settings.bottomTextBracket = c.top8Settings.bottomTextBracket;
        top8Settings.bottomTextYoutube = c.top8Settings.bottomTextYoutube;
        top8Settings.bottomTextTwitch = c.top8Settings.bottomTextTwitch;
        top8Settings.bottomTextTwitter = c.top8Settings.bottomTextTwitter;
        top8Settings.top8Ties = c.top8Settings.top8Ties;
        top8Settings.useP1Background = c.top8Settings.useP1Background;
        top8Settings.useCustomBackground = c.top8Settings.useCustomBackground;
        top8Settings.customBackground = c.top8Settings.customBackground;

        // save the file
        fs.writeFileSync(textPath + "/Top 8 Settings.json", JSON.stringify(top8Settings, null, 2));
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


    function setupPlayersVar(top8 = false) {
        let playerArray = [];
        var maxPlayers = c.maxPlayers;
        if (top8) {
            maxPlayers = 8;
        }
        for (let i = 0; i < maxPlayers; i++) {
            let player = {
                name: "",
                twitter: "",
                pronouns: "",
                tag: "",
                character: "Random",
                characterIndex: 0,
                skin: "",
                skinIndex: 0
            }
            if (top8) {
                player['placement'] = i + 1;
                if (c.top8Settings.top8Ties) {
                    if (i == 5 || i == 7) {
                        player['placement'] = i
                    }
                }

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
    c.game = {
        name: "Rivals of Aether",
        abbr: "RoA"
    };


    c.init = function () {
        c.setScore('left', 0);
        c.setScore('right', 0);
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

        const obsSettings = JSON.parse(fs.readFileSync(textPath + "/OBS Settings.json", "utf-8"));
        for (var key in obsSettings) {
            c.obsSettings[key] = obsSettings[key];
        }

        const top8Settings = JSON.parse(fs.readFileSync(textPath + "/Top 8 Settings.json", "utf-8"));
        for (var key in top8Settings) {
            c.top8Settings[key] = top8Settings[key];
        }

        c.setMaxPlayers();

        c.alwaysOnTopToggle();


        charPath = gamePath + "/" + c.game.name + "/";
        charPathRel = gamePathRel + "/" + c.game.name + "/";

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

        Mousetrap.bind('ctrl+8', () => {
            c.showTop8 = !c.showTop8;
            $scope.$apply();
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

    c.updateInterval = 1000;

    c.setColorBasedOnSlot = function (slot, state) {
        var color = {
            name: "CPU",
            hex: "808080"
        }
        if (state == 'HMN') {
            if (slot == 0) {
                color = {
                    name: "Red",
                    hex: "#ed1c23"
                }
            } else if (slot == 1) {
                color = {
                    name: "Blue",
                    hex: "#00b7ef"
                }
            } else if (slot == 2) {
                color = {
                    name: "Pink",
                    hex: "#ffa3b1"
                }
            } else if (slot == 3) {
                color = {
                    name: "Green",
                    hex: "#a8e61d"
                }
            }
        }

        return color;
    }


    c.init();
    c.mainLoop = async function () {
        const scInfo = await getInfo();
        c.externalUpdateCheck(scInfo);
    }
    c.mainLoop();
    // setInterval(() => {
    //     c.mainLoop();
    // }, c.updateInterval); //update interval

    setTimeout(function run() {
        c.mainLoop();
        setTimeout(run, c.updateInterval);
    }, c.updateInterval);



    c.externalUpdateCheck = function (scInfo) {
        if (c.addressRockerSettings.useAddressRocker && c.addressRockerSettings.inSet && c.game.name == 'Rivals of Aether') {
            let addressRockerData = JSON.parse(fs.readFileSync(textPath + "/RoAState.json", "utf-8"));
            if (addressRockerData.TourneySet.TourneyModeBestOf == -1 || addressRockerData.TourneySet.TourneyModeBestOf == 0) {
                return;
            }

            c.addressRockerSettings.inMatch = addressRockerData.TourneySet.InMatch;

            if (currentIntervalForVsScreen >= intervalBeforeVsScreenShows && c.addressRockerSettings.inMatch == false) {
                c.obsSetScreen('vsScreenName');
            }

            if (c.addressRockerSettings.inMatch == true) {
                c.obsSetScreen('scoreboardSceneName');
            }

            if (currentIntervalForVsScreen < intervalBeforeVsScreenShows) {
                currentIntervalForVsScreen++;
            }

            if (c.addressRockerSettings.enableBestOfUpdate) {
                c.roundInfo.bestOf = "Bo" + addressRockerData.TourneySet.TourneyModeBestOf;
            }

            //new stuff
            let playerCount = 0;
            for (let i = 0; i < addressRockerData.Characters.length; i++) {
                let player = addressRockerData.Characters[i];
                if (player.SlotState != 'OFF') {
                    playerCount++;
                }
            }
            if (playerCount > 2) {
                c.gamemode = 'Teams';
            } else {
                c.gamemode = 'Singles';
            }

            let playerIndex = 0;
            for (let i = 0; i < addressRockerData.Characters.length; i++) {
                let player = addressRockerData.Characters[i];
                if (playerCount > 2 || player.SlotState != 'OFF') {
                    //check to ensure character exists
                    let slotCharacter = (player.Character) ? player.Character : "Random";
                    let character = c.characterList.find(e => e.name.toLocaleLowerCase() === slotCharacter.toLocaleLowerCase());
                    if (character != undefined && c.addressRockerSettings.enableCharacterUpdate) {
                        c.players[playerIndex].character = character.name;
                        if (c.addressRockerSettings.enableSkinUpdate) {
                            break; //Currently does not work because we dont pull this yet.
                            for (let j = 0; j < character.skins.length; j++) {
                                if (player.Skin.SkinIndex == character.skins[j].index) {
                                    c.players[playerIndex].skinIndex = character.skins[j].index;
                                    c.setSkinBasedOnIndex(playerIndex);
                                }
                            }
                        } else {
                            let skinSet = false;
                            if (c.players[playerIndex].name && c.players[playerIndex].character != 'Random') { //Check to see if the player uses a specific Skin before we apply default.
                                c.playerProfiles = c.getPlayerProfiles(c.players[playerIndex].name);
                                for (let j = 0; j < c.playerProfiles.length; j++) {
                                    let playerProfile = c.playerProfiles[j];
                                    if (playerProfile.name == c.players[playerIndex].name && playerProfile.character == c.players[playerIndex].character) {
                                        let charSkin = character.skins.find(e => e.label == playerProfile.skin);
                                        if (charSkin.label && charSkin.index) {
                                            c.players[playerIndex].skin = charSkin.label;
                                            c.players[playerIndex].skinIndex = charSkin.index;
                                            skinSet = true;
                                        }
                                    }
                                }
                            }
                            if (!skinSet) {
                                c.markCharacterIndex(playerIndex);
                            }
                        }
                    }

                    if (c.addressRockerSettings.setTeamColor) {
                        if (playerIndex == 0) {
                            if (playerCount > 2) { //force red on teams
                                c.sides.left.color = c.setColorBasedOnSlot(0, 'HMN');
                            } else {
                                c.sides.left.color = c.setColorBasedOnSlot(i, player.SlotState);
                            }
                        } else if (playerIndex == 1 && playerCount < 3) {
                            c.sides.right.color = c.setColorBasedOnSlot(i, player.SlotState);
                        } else if (playerIndex == 2 && playerCount > 2) {
                            c.sides.right.color = c.setColorBasedOnSlot(1, 'HMN'); //If teams, force Red Vs Blue
                        }
                    }

                    if (c.addressRockerSettings.enableScoreUpdate) {
                        if (playerIndex == 0) {
                            c.setScore('left', player.GameCount);
                        } else if (playerIndex == 1 && playerCount < 3) {
                            c.setScore('right', player.GameCount);
                        } else if (playerIndex == 2 && playerCount == 4) {
                            c.setScore('right', player.GameCount);
                        }
                    }

                    playerIndex++;
                }
            }

            if (c.roundInfo.bestOf == 'Bo3') {
                if (c.sides.left.score == 2 || c.sides.right.score == 2) {
                    if (c.roundInfo.name == 'Grand Finals') {
                        if ((c.sides.left.wl == 'L' && c.sides.left.score == 2) || (c.sides.right.wl == 'L' && c.sides.right.score == 2)) {
                            c.sides.left.wl = 'L';
                            c.sides.right.wl = 'L';
                            c.setScore('left', 0);
                            c.setScore('right', 0);
                        } else {
                            c.toggleSetStop();
                        }
                    } else {
                        c.toggleSetStop();
                    }

                }
            } else if (c.roundInfo.bestOf == 'Bo5') {
                if (c.sides.left.score == 3 || c.sides.right.score == 3) {
                    if (c.roundInfo.name == 'Grand Finals') {
                        if ((c.sides.left.wl == 'L' && c.sides.left.score == 3) || (c.sides.right.wl == 'L' && c.sides.right.score == 3)) {
                            c.sides.left.wl = 'L';
                            c.sides.right.wl = 'L';
                            c.setScore('left', 0);
                            c.setScore('right', 0);
                        } else {
                            c.toggleSetStop();
                        }
                    } else {
                        c.toggleSetStop();
                    }
                }
            }

            c.writeScoreboard();
            c.saveGUISettings();
            $scope.$apply();
        } else {
            c.updateInterval = 1000;
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
            viewport.style.transform = "translateX(-40%)";
            overlayDiv.style.opacity = ".25";
            goBackDiv.style.display = "block"
            movedSettings = true;
        }
    }

    function goBack() {
        viewport.style.transform = "translateX(0)";
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
        if (c.showTop8) {
            playerType = 'top8Players'
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
        if (skin == 'Seasonal') {
            skin = c.seasonalSkin;
        }
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
            if (c.useTeamNames) {
                var leftTeam = (c.sides.left.teamName) ? (c.sides.left.teamName) : c.sides.left.color.name + " Team";
                var rightTeam = (c.sides.right.teamName) ? (c.sides.right.teamName) : c.sides.right.color.name + " Team";
                copiedText += leftTeam + " VS " + rightTeam;
            } else {
                for (let i = 0; i < 4; i++) {
                    if (i == 2) {
                        copiedText += " VS "
                    }
                    if (i == 1 || i == 3) {
                        copiedText += " & ";
                    }

                    // let tag = c.players[i].tag;
                    // copiedText += (tag) ? tag + " | " : "";
                    copiedText += c.players[i].name;
                    // copiedText += " (" + c.players[i].character + ")";
                }
            }
        }

        //send the string to the user's clipboard
        navigator.clipboard.writeText(copiedText);
    }

    //TODO: Split scoreboard from players/gui. 
    function updatePlayerJson(player, deleteSpot = false, forceUpdate = false) {
        if (!player) {
            return;
        }

        let playerInfo = getJson(textPath + "/Player Info/" + player.name);

        if (playerInfo == undefined) {
            playerInfo = {
                "name": player.name,
                "twitter": player.twitter,
                "twitch": player.twitch,
                "youtube": player.youtube,
                "discord": player.discord,
                "pronouns": player.pronouns,
                "tag": player.tag,
                "characters": [{
                    "character": player.character,
                    "skin": player.skin
                }],
                "game": c.game.name
            }
        } else {
            for (let i in c.playerFields) {
                playerInfo[c.playerFields[i].field] = player[c.playerFields[i].field];
            }

            let newCharacter = true;

            let foundCount = 0;
            let foundIndexLast = "";
            let indexToDelete = "";

            for (let i = 0; i < playerInfo.characters.length; i++) {
                if (playerInfo.characters[i].character == player.character) {
                    playerInfo.characters[i].skin = player.skin;
                    playerInfo.characters[i].game = c.game.name;
                    newCharacter = false;
                    foundCount++;
                    foundIndexLast = i;
                }
            }

            if (foundCount > 1) {
                playerInfo.characters.splice(foundIndexLast, 1);
            }
            if (deleteSpot) {
                playerInfo.characters.splice(foundIndexLast, 1);
            }


            if (newCharacter == true) {
                playerInfo.characters.push({
                    "character": player.character,
                    "skin": player.skin,
                    "game": c.game.name
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
    function storeSetSpecificInfo(players, tournamentName, round, gamemode, useTeamNames, teamNames, game) {
        if (usePythonForCreatingSetData) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', [scriptsPath + "/RoAUpdateSetInfo.py"]);
        } else {
            let data = {
                "player": [],
                "tournamentName": tournamentName,
                "round": round,
                "gamemode": gamemode,
                "useTeamNames": useTeamNames,
                "teamNames": teamNames,
                "game": game.name
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


    //TODO: Split scoreboard from players/gui. 
    //time to write it down
    c.writeScoreboard = function () {
        c.saveGUISettings();
        c.getPathsForOverlays();
        c.getPathsForOverlays(true);
        //this is what's going to be in the json file
        const scoreboardJson = {
            player: [], //more lines will be added below
            top8Players: [],
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
            forceHDChoice: c.forceHDChoice,
            noLoAHD: c.noLoAHD,
            forceWL: c.forceWL,
            usePips: c.usePips,
            maxPlayers: c.maxPlayers,
            useCustomRound: c.useCustomRound,
            useCustomColors: c.useCustomColors,
            useTeamNames: c.useTeamNames,
            showOnDeck: c.showOnDeck,
            game: {
                name: c.game.name,
                abbr: c.game.abbr
            },
            seasonalSkin: c.seasonalSkin,
            externalUpdate: false,
            addressRockerSettings: c.addressRockerSettings,
            obsSettings: c.obsSettings,
            top8Settings: c.top8Settings
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

        for (let i = 0; i < c.top8Players.length; i++) {
            let player = {};
            for (let field in c.top8Players[i]) {
                if (field != "$$hashKey") {
                    player[field] = c.top8Players[i][field];
                }
            }
            scoreboardJson.top8Players.push(player);

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


        storeSetSpecificInfo(scoreboardJson.player, scoreboardJson.tournamentName, scoreboardJson.round, scoreboardJson.gamemode, scoreboardJson.useTeamNames, scoreboardJson.teamName, scoreboardJson.game);
        // const spawn = require("child_process").spawn;
        // const pythonProcess = spawn('python',[scriptsPath + "/RoAUpdateScores.py", checkScore(p1Win1, p1Win2, p1Win3), checkScore(p2Win1, p2Win2, p2Win3)]);
    }

    c.renameFilesPython = function () {
        setTimeout(function run() {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', [scriptsPath + "/RoARenameFiles.py"]);
        }, 5000);
    }


});
app.directive("playerInfoModal", function () {
    return {
        restrict: "E",
        templateUrl: "Scripts/playerInfoModal.html",
        // scope: true,
        scope: {
            'player': '=',
            'index': '@',
            'number': '@',
            'fields': '='
        },
        transclude: true,
        controller: function ($scope) {
            $scope.hidden = true;
            $scope.open = function () {
                $scope.hidden = false;
            };
        },
        link: function (scope, ele, attrs) {
            $(ele).find('.trans-layer').on('click', function (event) {
                scope.hidden = true;
                scope.$apply();
            })
        }
    }
});

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    let origPath = changeEvent.target.files[0].path
                    if (origPath.indexOf('\\Stream Tool\\') == -1) {
                        console.log('Must be within a Stream Tool folder');
                        scope.fileread = "";
                    } else {
                        scope.fileread = origPath.split('\\Stream Tool\\')[1];
                    }
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
}]);