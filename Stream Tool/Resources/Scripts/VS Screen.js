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
    c.playerFields = [
        {'label': 'Pronouns',   'field': 'pronouns','title':"Insert the Player's pronouns here"},
        {'label': 'Tag',        'field': 'tag',     'title':"Insert the tag/team/sponsor here"},
        {'label': 'Twitter',    'field': 'twitter', 'title':"Insert the Player's Twitter here"},
        {'label': 'Twitch',     'field': 'twitch',  'title':"Insert the Player's Twitch here"},
        {'label': 'Youtube',    'field': 'youtube', 'title':"Insert the Player's Youtube here"},
        {'label': 'Discord',    'field': 'discord', 'title':"Insert the Player's Discord here"}
    ];
	c.gui = {};

	c.gui.players = [];
	c.gui.teams = [];
	c.gui.tournament = "";
	c.gui.round = "";
	c.gui.casters = [    
		{
		"name": "",
		"twitter": "",
		"twitch": ""
	  },
	  {
		"name": "",
		"twitter": "",
		"twitch": ""
	  }
	];
	c.gui.wl = [];
	c.gui.bestOf = "Bo3";
	c.gui.usePips = true;
	c.gui.useWorkshop = false;
	c.gui.score = [];
	c.gui.maxPlayersOnScreen = 2;
	c.gui.gamemode = 'Singles';
	c.gui.colors = [
		{
		"name": "Red",
		"hex": "#ed1c23"
	  },
	  {
		"name": "Blue",
		"hex": "#00b7ef"
	  }
	];
	c.gui.game = 'Rivals of Aether';


	c.prev = {};

	c.prev.players = [];
	c.prev.teams = [];
	c.prev.tournament = "";
	c.prev.round = "";
	c.prev.casters = [    
		{
		"name": "",
		"twitter": "",
		"twitch": ""
	  },
	  {
		"name": "",
		"twitter": "",
		"twitch": ""
	  }
	];
	c.prev.wl = [];
	c.prev.bestOf = "Bo3";
	c.prev.usePips = false;
	c.prev.useWorkshop = true;
	c.prev.score = [];
	c.prev.maxPlayersOnScreen = 2;
	c.prev.gamemode = 'Singles';
	c.prev.colors = [
		{
		"name": "Red",
		"hex": "#ed1c23"
	  },
	  {
		"name": "Blue",
		"hex": "#00b7ef"
	  }
	];
	c.prev.game = 'Rivals of Aether';

	//animation stuff
	c.fadeInTime = .4; //(seconds)
	c.fadeOutTime = .3;
	c.introDelay = .05; //all animations will get this delay when the html loads (use this so it times with your transition)
	let delay = 0;


	
	//max text sizes (used when resizing back)
	const playerSize = '90px';
	const tagSize = '50px';
	const teamSize = '80px';
	const roundSize = '38px';
	const tournamentSize = '28px';
	const casterSize = '25px';
	const twitterSize = '20px';

	//to store the current character info
	const pCharInfo = [];

	//the characters image file path will change depending if they're workshop or not
	let charPath;
	const charPathBase = "Resources/Characters/";

	c.randomSkinPath = charPathBase + "/Random/P1.png";

	//to consider how many loops will we do
	let maxPlayers = 2; //will change when doubles comes
	const maxSides = 2;

	let startup = true;


	let prevDifFromGuiCount = 0;
	const iterationsBeforePrevUpdate = 1;
	let prevSameAsGui = false;

	let socialChangeTimer = 0;
	const socialChangeTimerMax = 8;

	let showTwitter = true;

	c.scoreEmpty = true;

	/* script begin */
	let gettingScene = false;

	let firstRun = true;

	c.mainLoop = async function () {
		const scInfo = await getInfo();
		// const guiInfo = await getGuiInfo();
		c.getData(scInfo);
	}
	c.mainLoop();


	const pSBC = (p, c0, c1, l) => {
		let r, g, b, P, f, t, h, i = parseInt,
			m = Math.round,
			a = typeof (c1) == "string";
		if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
		if (!this.pSBCr) this.pSBCr = (d) => {
			let n = d.length,
				x = {};
			if (n > 9) {
				[r, g, b, a] = d = d.split(","), n = d.length;
				if (n < 3 || n > 4) return null;
				x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
				else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
			}
			return x
		};
		h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? {
			r: 0,
			g: 0,
			b: 0,
			a: -1
		} : {
			r: 255,
			g: 255,
			b: 255,
			a: -1
		}, p = P ? p * -1 : p, P = 1 - p;
		if (!f || !t) return null;
		if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
		else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
		a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
		if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
		else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
	}

	c.getHexColor = function (team) {
		let returnValue = "000000";
		if (c.prev.colors.length == 0) {} else {

			if (c.prev.colors[team].hex != c.gui.colors[team].hex) {
				prevSameAsGui = false;
			}
			returnValue = c.prev.colors[team].hex;
		}

		return returnValue;
	}

	c.getAdjustedColorFilter = function (team) {
		try {
			return "brightness(50%) sepia(1) " + hexToFilter(c.prev.colors[team].hex);
		} catch (err) {
			return "brightness(50%) sepia(1)";
		}
	}

	c.getGradientBackground = function (player, iterations = 5) {
		let team = 0;
		if (player == 0) {
			team = 0;
		} else if (player == 1 && c.prev.gamemode == 'Singles') {
			team = 1;
		} else if (player > 1) {
			team = 1;
		} else {
			team = 0;
		}
		let hex = c.getHexColor(team);
		if (hex) {
			let gradients = hex + ", ";
			for (let i = 0; i < iterations; i++) {
				hex = pSBC(.035, hex)
				gradients += hex;
				gradients += (i + 1 < iterations) ? ", " : "";
			}
			return "linear-gradient(-180deg, " + gradients + ")";
		} else {
			return "linear-gradient(180deg, black, black)";
		}
	}

	c.getDropShadowWithHex = function (player) {
		let hex = "#000000";
		try {
			hex = c.prev.players[player].teamColor.hex;
		} catch (err) {
			//do nothing;
		}

		let defaultShadowPosition = -24;

		if (c.prev.players[player].vsScreenSkin == 'Random' && c.prev.players[player].team == 1) {
			defaultShadowPosition = 24;
		}

		let dropShadowString = "drop-shadow(" + defaultShadowPosition + "px 5px 0px " + hex + " )";
		return dropShadowString;
	}

	c.getScoreColor = function (pipNumber, team) {
		let score = c.prev.score[team];

		if (score != c.gui.score[team]) {
			prevSameAsGui = false;
		}
		if (score >= pipNumber) {
			return c.getHexColor(team);
		} else {
			return 'grey';
		}
	}

	c.getScoreBorderOverlay = function () {
		if (c.scoreEmpty) {
			return "";
		}
		if (c.prev.usePips) {
			return "Resources/Overlay/VS Screen/Score Border " + c.prev.bestOf + ".png"
		} else {
			return "Resources/Overlay/VS Screen/Score Border - Numbers.png"
		}

	}

	c.getMainOverlay = function () {
		if (c.prev.gamemode == 'Singles') {
			return "Resources/Overlay/VS Screen/VS Overlay.png";
		} else {
			return "Resources/Overlay/VS Screen/VS Overlay Dubs.png";
		}
	}

	c.getSkinPathForPlayer = function (player) {
		return c.getSkinPath(c.prev.players[player].character, c.prev.players[player].vsScreenSkin);
	}

	c.getSkinPath = function (character, skin) {
		let path = "";
		if (character == "Random") {
			path = c.randomSkinPath;
		} else {
			path = charPath + "/" + character + "/" + skin + ".png";
		}
		return path;
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
			console.log(c.playerFields[i])
			console.log('p' + p + c.playerFields[i].label);
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

	c.fadeInRoundName = function () {
		if (c.prev.round != c.gui.round) {
			prevSameAsGui = false;
			return {
				animation: `fadeOut ${c.fadeOutTime}s both`
			};
		} else {
			if (prevDifFromGuiCount == -1) {
				document.getElementById('roundText').style.fontSize = roundSize;
				c.resizeText('round');
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
	c.fadeInCasterName = function (caster) {
		try {
			if (c.prev.casters[caster].name != c.gui.casters[caster].name) {
				prevSameAsGui = false;
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				if (prevDifFromGuiCount == -1) {
					document.getElementById('caster' + (caster + 1) + 'Text').style.fontSize = casterSize;
					c.resizeText('caster' + (caster + 1));
				}
				return {
					animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
				};
			}
		} catch (e) {
			
		}

	}

	c.fadeInCasterTwitter = function (caster) {
		try {
			if (c.prev.casters[caster].twitter != c.gui.casters[caster].twitter) {
				prevSameAsGui = false;
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else if ((c.prev.casters[caster].twitch && !showTwitter) || !c.prev.casters[caster].twitter) {
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				if (prevDifFromGuiCount == -1) {
					document.getElementById('twitter' + (caster + 1) + 'Text').style.fontSize = twitterSize;
					c.resizeText('twitter' + (caster + 1));
				}
				
				return {
					animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
				};
			}
		} catch (e) {
			
		}

	}

	c.fadeInCasterTwitch = function (caster) {
		try {
			if (c.prev.casters[caster].twitch != c.gui.casters[caster].twitch) {
				prevSameAsGui = false;
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else if ((c.prev.casters[caster].twitter && showTwitter) || !c.prev.casters[caster].twitch) {
				return {
					animation: `fadeOut ${c.fadeOutTime}s both`
				};
			} else {
				if (prevDifFromGuiCount == -1) {
					document.getElementById('twitch' + (caster + 1) + 'Text').style.fontSize = twitterSize;
					c.resizeText('twitch' + (caster + 1));
				}
				
				return {
					animation: `fadeIn ${c.fadeInTime + .1}s ${delay + .2}s both`
				};
			}
		} catch (e) {

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
		try {
			let info = "";
			if (c.prev.players[player].info) {
				info = c.prev.players[player].info.vsScreen;
			}
			let skin = c.prev.players[player].vsScreenSkin;
	
			let usePixelation = true;

			if(((c.prev.game == 'Rivals Workshop' || c.prev.game == 'Rivals of Aether') && skin == 'HD')) {
				usePixelation = false;
			} else if (c.prev.game != 'Rivals Workshop' && c.prev.game != 'Rivals of Aether') {
				usePixelation = false;
			}
			let x, y = 0;
			let scale = 1;
			let scaleX = 1;
			let imageRendering = (usePixelation) ? 'pixelated' : 'auto';
			let filter = c.getDropShadowWithHex(player);
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
			} else {
				if (c.prev.gamemode == 'Singles') {
					if (player == 0) {
						x = -475;
					} else {
						x = -500;
					}
					if (skin == 'Random' && player == 1) {
						scaleX = -1;
					}
				} else {
					y = -125;
					if (player < c.prev.players.length / 2) {
						x = -475;
					} else {
						x = -500;
						scaleX = -1;
					}
				}
				scale = .8;
			}
	
			scaleX = scale * scaleX;
			let style = {
				transform: `translate(${x}px, ${y}px) scale(${scaleX} , ${scale})`,
				imageRendering: imageRendering,
				filter: filter,
				// animation: `charaMoveIn ${fadeInTime + .1}s ${delay + .2}s both, fadeIn ${fadeInTime + .1}s ${delay + .2}s both`
			}
			return style;
		} catch (e) {
			return {};
		}
		
	}

	c.mainLoop();
	setInterval(() => {

		if ((prevSameAsGui || prevDifFromGuiCount == iterationsBeforePrevUpdate) && prevDifFromGuiCount >= 0) {
			prevDifFromGuiCount = 0;
		} else {
			prevDifFromGuiCount++;
		}

		if (socialChangeTimer == socialChangeTimerMax) {
			showTwitter = !showTwitter;
			socialChangeTimer = 0;
		}

		socialChangeTimer++;

		c.mainLoop();
	}, 500); //update interval



	c.getData = function (scInfo) {
		if (firstRun) {
			firstRun = false;
			return;
		}
		
		c.gui.usePips = scInfo['usePips'];
		c.gui.players = scInfo['player'];
		c.gui.teams = scInfo['teamName'];
		c.gui.colors = scInfo['color'];
		c.gui.score = scInfo['score'];
		c.gui.bestOf = scInfo['bestOf'];
		c.gui.gamemode = scInfo['gamemode'];
		c.gui.wl = scInfo['wl'];
		c.gui.round = scInfo['round'];
		c.gui.tournament = scInfo['tournamentName'];
		c.gui.casters = scInfo['caster'];
		c.gui.game = scInfo['game'];

		if (prevDifFromGuiCount == iterationsBeforePrevUpdate) {
			c.prev.usePips = c.gui.usePips;
			c.prev.players = c.gui.players;
			c.prev.teams = c.gui.teams;
			c.prev.colors = c.gui.colors;
			c.prev.score = c.gui.score;
			c.prev.bestOf = c.gui.bestOf;
			c.prev.gamemode = c.gui.gamemode;
			c.prev.wl = c.gui.wl;
			c.prev.round = c.gui.round;
			c.prev.tournament = c.gui.tournament;
			c.prev.casters = c.gui.casters;
			c.prev.game = c.gui.game;
			prevSameAsGui = true;
			// firstRun = false;
			prevDifFromGuiCount = -2;
			if (c.prev.score[0] > 0 || c.prev.score[1] > 0) {
				c.scoreEmpty = false;
			} else {
				c.scoreEmpty = true;
			}
			c.loaded = true
		}

		if (
			c.prev.usePips != c.gui.usePips ||
			c.prev.bestOf != c.gui.bestOf ||
			c.prev.gamemode != c.gui.gamemode ||
			c.prev.round != c.gui.round ||
			c.prev.tournament != c.gui.tournament
		) {
			prevSameAsGui = false;
		}


		$scope.$apply();

	}

	function hexToFilter(H) {
		// Convert hex to RGB first
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = "0x" + H[1] + H[1];
			g = "0x" + H[2] + H[2];
			b = "0x" + H[3] + H[3];
		} else if (H.length == 7) {
			r = "0x" + H[1] + H[2];
			g = "0x" + H[3] + H[4];
			b = "0x" + H[5] + H[6];
		}
		// Then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0)
			h = 0;
		else if (cmax == r)
			h = ((g - b) / delta) % 6;
		else if (cmax == g)
			h = (b - r) / delta + 2;
		else
			h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0)
			h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		let hueRotate = h - 38;
		let saturate = 100 + (s - 24);
		let brightness = 100 + (l - 57);

		return "hue-rotate(" + hueRotate + "deg) saturate(" + saturate + "%) brightness(" + brightness + "%)";

		// return "hsl(" + h + "," + s + "%," + l + "%)";
	}

	//the logic behind the twitter/twitch constant change
	function socialChange1(twitterWrapperEL, twitchWrapperEL) {

		if (startup) {

			//if first time, set initial opacities so we can read them later
			if (!twitter1 && !twitch1) { //if all blank
				twitterWrapperEL.style.opacity = 0;
				twitchWrapperEL.style.opacity = 0;
			} else if (!twitter1 && !!twitch1) { //if twitter blank
				twitterWrapperEL.style.opacity = 0;
				twitchWrapperEL.style.opacity = 1;
			} else {
				twitterWrapperEL.style.opacity = 1;
				twitchWrapperEL.style.opacity = 0;
			}


		} else if (!!twitter1 && !!twitch1) {

			if (socialSwitch) {
				fadeOut(twitterWrapperEL).then(() => {
					fadeIn(twitchWrapperEL);
				});
			} else {
				fadeOut(twitchWrapperEL).then(() => {
					fadeIn(twitterWrapperEL);
				});
			}

		}
	}
	//i didnt know how to make it a single function im sorry ;_;
	function socialChange2(twitterWrapperEL, twitchWrapperEL) {

		if (startup) {

			if (!twitter2 && !twitch2) {
				twitterWrapperEL.style.opacity = 0;
				twitchWrapperEL.style.opacity = 0;
			} else if (!twitter2 && !!twitch2) {
				twitterWrapperEL.style.opacity = 0;
				twitchWrapperEL.style.opacity = 1;
			} else {
				twitterWrapperEL.style.opacity = 1;
				twitchWrapperEL.style.opacity = 0;
			}

		} else if (!!twitter2 && !!twitch2) {

			if (socialSwitch) {
				fadeOut(twitterWrapperEL).then(() => {
					fadeIn(twitchWrapperEL);
				});
			} else {
				fadeOut(twitchWrapperEL).then(() => {
					fadeIn(twitterWrapperEL);
				});
			}

		}
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
		console.log('Hit resize');
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
app.directive("playerNameWrapper", function () {
    return {
        restrict: "E",
        templateUrl: "Resources/Scripts/vsScreenPlayerNameDisplay.html",
        // scope: true,
        scope: {
            'player': '=',
            'index':'@',
            'number':'@'
		},
        transclude: true,
        controller: function ($scope) {
        },
        link: function (scope, ele, attrs) {
        }
    }
});

app.directive("playerSocialsWrapper", function () {
    return {
        restrict: "E",
        templateUrl: "Resources/Scripts/vsScreenPlayerSocials.html",
        // scope: true,
        scope: {
            'player': '=',
            'index':'@',
            'number':'@',
			'fields':'=',
			'gamemode':'@',
			'fadeControl': '&'
		},
        transclude: true,
        controller: function ($scope) {
        },
        link: function (scope, ele, attrs) {
		}
    }
});