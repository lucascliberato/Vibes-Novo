const allSongs = require("./songs.js").allSongs;
const locationSet = new Set();

for(const song of allSongs) {
    if (song.location) {
        locationSet.add(song.location);
    }
}

module.exports = [...locationSet].sort();