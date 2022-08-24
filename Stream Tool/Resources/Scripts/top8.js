'use strict';
var app = angular.module('angularapp', []);
app.controller('AngularAppCtrl', function ($scope) {
	var c = $scope;

	customElements.define("load-svg", class extends HTMLElement {
		async connectedCallback(
			shadowRoot = this.shadowRoot || this.attachShadow({
				mode: "open"
			})
		) {
			shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
			$scope.$apply();
		}
	})


	c.loaded = false;

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
	c.gui = {};

	c.gui.players = [];
	c.gui.teams = [];
	c.gui.tournament = "";

	c.gui.game = 'Rivals of Aether';
	c.gui.top8Settings = {
		useP1Background: true,
		useCustomBackground: false,
		customBackground: ""
	};


	c.prev = {};

	c.prev.players = [];
	c.prev.tournament = "";

	c.prev.game = 'Rivals of Aether';

	c.prev.top8Settings = {
		useP1Background: true,
		useCustomBackground: false,
		customBackground: ""
	};



	//animation stuff
	c.fadeInTime = .4; //(seconds)
	c.fadeOutTime = .3;
	c.introDelay = .05; //all animations will get this delay when the html loads (use this so it times with your transition)
	let delay = 0;



	//max text sizes (used when resizing back)
	const playerSize = '90px';
	const tournamentSize = '28px';

	//to store the current character info
	const pCharInfo = [];

	//the characters image file path will change depending if they're workshop or not
	let charPath;
	const charPathBase = "Resources/Characters/";

	c.randomSkinPath = charPathBase + "/Random/P1.png";


	let prevDifFromGuiCount = 0;
	const iterationsBeforePrevUpdate = 1;
	let prevSameAsGui = false;

	let firstRun = true;

	c.mainLoop = async function () {
		const scInfo = await getInfo();
		// const guiInfo = await getGuiInfo();
		c.getData(scInfo);
	}
	c.mainLoop();

	c.displayCustomVideoBackground = function () {
		return (
			!c.prev.top8Settings.useP1Background &&
			c.prev.top8Settings.useCustomBackground &&
			c.prev.top8Settings.customBackground &&
			c.prev.top8Settings.customBackground.indexOf('.webm') != -1 &&
			c.prev.top8Settings.customBackground
		);
	}

	c.displayCustomImageBackground = function () {
		return (
			!c.prev.top8Settings.useP1Background &&
			c.prev.top8Settings.useCustomBackground &&
			c.prev.top8Settings.customBackground &&
			c.prev.top8Settings.customBackground.indexOf('.webm') == -1 &&
			c.prev.top8Settings.customBackground
		);
	}

	c.fadeInCharacter = function (player) {
		try {
			if (c.gui.players[player].character != c.prev.players[player].character || c.gui.players[player].vsScreenSkin != c.prev.players[player].vsScreenSkin) {
				prevSameAsGui = false;
				return {
					animation: `charaMoveOut ${c.fadeOutTime}s both, fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				return {
					animation: `charaMoveIn ${c.fadeInTime + .1}s ${delay + .2}s both, fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
				};
			}
		} catch (e) {

		}

	}

	c.fadeInPlayerName = function (player) {
		try {
			if (
				c.gui.players[player].name != c.prev.players[player].name ||
				c.gui.players[player].tag != c.prev.players[player].tag
				// c.gui.players[player].pronouns != c.prev.players[player].pronouns
			) {
				prevSameAsGui = false;
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				if (prevDifFromGuiCount == -1) {
					c.setPlayerFontSizeToDefault(player);
					c.resizeText('p' + (player + 1) + "Wrapper", true);
				}

				return {
					animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .42}s both`
				};
			}
		} catch (e) {

		}

	}

	c.setPlayerFontSizeToDefault = function (player) {
		let p = player + 1;

		document.getElementById('p' + p + 'Tag').style.fontSize = tagSize;
		document.getElementById('p' + p + 'Name').style.fontSize = playerSize;
		// document.getElementById('p' + p + 'Pronouns').style.fontSize = tagSize;

	}

	c.fadeInPlayerFields = function (player) {
		try {
			for (let i in c.playerFields) {
				if (c.playerFields[i].field == 'tag') {
					continue;
				}
				if (c.gui.players[player][c.playerFields[i].field] != c.prev.players[player][c.playerFields[i].field]) {
					prevSameAsGui = false;
					return {
						animation: `fadeOut ${c.fadeOutTime}s both`
					};
				}
			}

			if (prevDifFromGuiCount == -1) {
				c.setPlayerFieldsFontSizeToDefault(player);
				// c.resizeText('p' + (player + 1) + "FieldsWrapper", true);

			}

			return {
				animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .42}s both`
			};
		} catch (e) {
			console.log(e);
		}

	}



	c.setPlayerFieldsFontSizeToDefault = function (player) {
		let p = player + 1;

		for (let i in c.playerFields) {
			if (c.playerFields[i].field == 'tag') {
				continue;
			}
			// document.getElementById('p' + p + c.playerFields[i].label).style.fontSize = tagSize;
		}
	}

	c.fadeInTeamName = function (team) {
		let teamId = (team == 0) ? 'teamNameL' : 'teamNameR';
		if (c.prev.teams[team] != c.gui.teams[team]) {
			prevSameAsGui = false;
			return {
				animation: `fadeOut ${c.fadeOutTime}s both`
			};
		} else {
			if (prevDifFromGuiCount == -1) {
				document.getElementById(teamId + 'Text').style.fontSize = teamSize;
				c.resizeText(teamId);
			}
			return {
				animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
			};
		}
	}

	c.fadeInTournamentName = function () {
		if (c.prev.tournament != c.gui.tournament) {
			prevSameAsGui = false;
			return {
				animation: `fadeOut ${c.fadeOutTime}s both`
			};
		} else {
			if (prevDifFromGuiCount == -1) {
				document.getElementById('tournamentText').style.fontSize = tournamentSize;
				c.resizeText('tournament');
			}

			return {
				animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
			};
		}
	}


	c.getFadeInOutAnim = function (getFadeIn) {
		if (getFadeIn) {
			return {
				animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
			};
		} else {
			return {
				animation: `fadeOut ${c.fadeOutTime}s both`
			}
		}
	}

	c.fadeInBGVid = function (player) {
		try {
			//We fade in differently for the character. see fadeInCharacter for that.
			if (c.gui.players[player].backgroundWebm != c.prev.players[player].backgroundWebm) {
				prevSameAsGui = false;
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				return {
					animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
				};
			}
		} catch (e) {

		}

	}

	c.fadeInScreen = function () {
		if (c.gui.gamemode != c.prev.gamemode) {
			prevSameAsGui = false;
			return {
				animation: `fadeOut ${c.fadeOutTime}s both`
			};
		} else {
			return {
				animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
			};
		}
	}



	c.getTransformInformation = function (player) {
		return;
		try {
			let info = "";
			if (player.info) {
				info = player.info.top8;
			}
			let skin = player.vsScreenSkin;

			let usePixelation = true;

			if (((c.prev.game == 'Rivals Workshop' || c.prev.game == 'Rivals of Aether') && skin == 'HD')) {
				usePixelation = false;
			} else if (c.prev.game != 'Rivals Workshop' && c.prev.game != 'Rivals of Aether') {
				usePixelation = false;
			}
			let x = 0;
			let y = 0;
			let scale = 1.25;
			// let imageRendering = (usePixelation) ? 'pixelated' : 'auto';
			//CB - Combo Breaker
			// let filter =  "grayscale(1)" + c.getDropShadowWithHex(player);


			if (skin != "Random" && info) {
				if (info[skin]) {
					x = info[skin].x;
					y = info[skin].y;
					scale = info[skin].scale;
				} else {
					x = info.neutral.x;
					y = info.neutral.y;
					scale = info.neutral.scale;
				}
			}



			let style = {
				// 'object-position': `${x}px, ${y}px`
				transform: `translate(${x}px, ${y}px) scale(${scale})`,

				// imageRendering: imageRendering,
				// animation: `charaMoveIn ${fadeInTime + .1}s ${delay + .2}s both, fadeIn ${fadeInTime + .1}s ${delay + .2}s both`
			}

			return style;
		} catch (e) {
			return {};
		}

	}

	c.areArraysTheSame = function (arr1, arr2) {
		for (let i = 0; i < arr1.length; i++) {
			if (Array.isArray(arr1[i])) {
				if (!c.areArraysTheSame(arr1[i], arr2[i])) {
					return false;
				}
				continue;
			}
			if (typeof arr1[i] === 'object') {
				if (!c.areObjectsTheSame(arr1[i], arr2[i])) {
					return false;
				}
				continue;
			}

			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	c.areObjectsTheSame = function (object1, object2) {
		for (const property in object1) {
			if (property == '$$hashKey') {
				continue;
			}
			if (Array.isArray(object1[property])) {
				if (!c.areArraysTheSame(object1[property], object2[property])) {
					return false;
				}
				continue;
			}
			if (typeof object1[property] === 'object') {
				if (!c.areObjectsTheSame(object1[property], object2[property])) {
					return false;
				}
				continue;
			}



			if (object1[property] != object2[property]) {
				return false;
			}
		}
		return true;
	}

	c.mainLoop();
	setInterval(() => {

		if ((prevSameAsGui || prevDifFromGuiCount == iterationsBeforePrevUpdate) && prevDifFromGuiCount >= 0) {
			prevDifFromGuiCount = 0;
		} else {
			prevDifFromGuiCount++;
		}

		c.mainLoop();
	}, 2000); //update interval



	c.getData = function (scInfo) {
		if (firstRun) {
			firstRun = false;
			return;
		}


		c.gui.players = scInfo['top8Players'];
		c.gui.tournament = scInfo['tournamentName'];
		c.gui.game = scInfo['game'];
		c.gui.top8Settings = scInfo['top8Settings'];

		if (prevDifFromGuiCount == iterationsBeforePrevUpdate) {
			c.prev.players = c.gui.players;
			c.prev.tournament = c.gui.tournament;
			c.prev.game = c.gui.game;
			c.prev.top8Settings = c.gui.top8Settings
			prevSameAsGui = true;


			// firstRun = false;
			prevDifFromGuiCount = -2;

			c.loaded = true
		}

		if (
			c.prev.tournament != c.gui.tournament ||
			!c.areArraysTheSame(c.prev.players, c.gui.players) ||
			!c.areObjectsTheSame(c.prev.top8Settings, c.gui.top8Settings)
		) {
			prevSameAsGui = false;
		}


		$scope.$apply();

	}

	c.resizeText = function (elementId, playerWrapper = false) {
		try {
			let el = document.getElementById(elementId);
			resizeText(el, playerWrapper);
		} catch (e) {
			console.log(e);
		}

	}

	//text resize, keeps making the text smaller until it fits
	function resizeText(textEL, playerWrapper = false) {
		try {
			let childrens = "";
			if (playerWrapper) {
				childrens = textEL.children[0].children;
			} else {
				childrens = textEL.children
			}
			while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
				if (childrens.length > 0) { //for tag+player texts
					Array.from(childrens).forEach(function (child) {
						child.style.fontSize = getFontSize(child);
					});
				} else {

					textEL.style.fontSize = getFontSize(textEL);
				}
			}
		} catch (e) {
			console.log(e);
		}

	}

	//returns a smaller fontSize for the given element
	function getFontSize(textElement) {
		return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
	}

	//searches for the main json file
	function getInfo() {
		return new Promise(function (resolve) {
			const oReq = new XMLHttpRequest();
			oReq.addEventListener("load", reqListener);
			oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
			oReq.send();

			//will trigger when file loads
			function reqListener() {
				resolve(JSON.parse(oReq.responseText))
			}
		})
		//i would gladly have used fetch, but OBS local files wont support that :(
	}
});