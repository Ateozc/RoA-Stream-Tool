/** these are set when their respective views are visible */
export const inside = {
    settings : false,
    bracket : false,
    finder : false,
    electron : typeof process !== 'undefined' // if in executable or remote gui
};

/** Paths used for all of the Stream Tool */
export const realPath = inside.electron ? __dirname : ""; // local file path if in executable
export const stPath = {
    gamesDir: realPath + '/Games',
    char : "",
    defaultCharRandom: realPath + '/Games/Rivals of Aether/Random',
    charRandom : realPath + '/Games/Default/Random',
    charBase : realPath + '/Games/Rivals of Aether',
    charWork : realPath + '/Games/Rivals Workshop',
    overlay: realPath + '/Overlay',
    text : realPath + '/Texts',
    scripts: realPath + '/Scripts'
};

/** Current values for stuff */
export const current = {
    focus : -1,
    game: 'Rivals of Aether',
    gameAbbr: 'RoA',
    prevGame: 'Rivals of Aether'
}
