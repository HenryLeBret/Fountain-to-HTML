class Stats {

    static WORD_PER_MINUTE = 150;

    constructor(locationStats, characterStats) {
        this.location_stats = document.getElementById(locationStats);
        this.character_stats = document.getElementById(characterStats);
        this.characters = {};
        this.locations = [];
    }

    /**
     * Remove the placeholders.
     */
    reset() {
        this.location_stats.innerHTML = '';
        this.character_stats.innerHTML = '';
        this.characters = {}; // Clear characters
        this.locations = []; // Clear locations
    }

    addCharacter(name, lines, words) {
        if (this.characters.hasOwnProperty(name)) {
              this.characters[name].dialogs++;
              this.characters[name].lines += lines;
              this.characters[name].words += words;
          } else {
              this.characters[name] = { dialogs: 1, lines: lines, words: words };
          }
    }

    addLocation(locations) {
        for (const l of locations) {
            let local = l.trim().toUpperCase();
            if (this.locations.hasOwnProperty(local)) {
                this.locations[local]++;
            } else {
                this.locations[local] = 1;
            }
        }
    }

    getCharacterCount() {
        return Object.keys(this.characters).length;
    }

    getLocationCount() {
        return Object.keys(this.locations).length;
    }

    createStatsSection() {
        Object.entries(this.locations).forEach(([l, sc]) => {
            this.location_stats.innerHTML += '<li>' + l + ' (<b>' + sc + '</b>)</li>';
        });
        Object.entries(this.characters).forEach(([c, sc]) => {
            var minTime = Math.round(sc.words / Stats.WORD_PER_MINUTE * 60);
            this.character_stats.innerHTML += `<li>${c} (<b>${sc.dialogs}</b> tirades; <b>${sc.lines}</b> lignes; <b>${sc.words}</b> mots; ${minTime} s @${Stats.WORD_PER_MINUTE}WPM)</li>`;
            // this.character_stats.innerHTML += '<li>' + c + ' (<b>' + sc.dialogs + '</b> tirades; <b>' + sc.lines + '</b> lignes; <b>' + sc.words + '</b> mots; ' + minTime +' secondes)</li>';
        });
    }

    toggleVisibility(id) {
        [this.location_stats, this.character_stats].forEach((item, i) => {
            if (id == item.id) {
                item.style.display = ((item.style.display!='none') ? 'none' : 'block');
            } else {
                item.style.display = 'none';
            }
        });
    }
}
