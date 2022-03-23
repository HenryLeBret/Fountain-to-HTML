class FountainParser {

    static HEADING_RE = /^(int\.?\s+|int\.?\/ext\.?\s+|ext\.?\/int\.?\s+|i\/e\s+|est\.?\s+|ext\.?\s+|\.\s*)(.*?)\s*(?:#([\w\d\.\-]+)#)?\s*$/i;
    // Character name forced with @ or in upper case
    static DIALOG_RE = /^\s*(?:@(.*?\p{Ll}.*?)|([\p{Lu}\d_\s]+))(?:\s*\(([^)]*)\))?\s*(\^)?$/u;
    static TRANSITION_RE = /(?:^\s*>\s*(.+)\s*(?<!<)$)|(?:^(?!\.)\s*([^\p{Ll}]*TO:))$/u;

    constructor(domId, display, stats, st) {
        this.view = display;
        this.contents = document.getElementById(domId);
        this.stats = stats;
        this.st = st;
    }


    parseFountain() {

        this.stats.reset();
        this.st.reset();

        var lines = this.clearBoneyard(this.contents.value).split(/\r?\n\r?\n/); // Get content
        if (lines.length <= 1) { return; }
        var titlePageSeen = false;

        for (var i = 0; i < lines.length; i++) {

            var line = this.clearStr(lines[i]); // Clear string from unnecessary spaces and tabs
            if (line.length == 0) { continue; } // Skip empty lines
            if (this.isSection(line) || this.isSynopsis(line)) { continue; } // Skip Section and Synopsis

            if (this.isHeading(line)) {
                var o = this.parseHeading(line);
                this.view.addBlock('heading', this.escape(o['line']));
                this.stats.addLocation(o['location']);
            }

            else if (!titlePageSeen && this.isTitlePage(line)) {
                var o = this.parseTitlePage(line);
                this.view.createTitlePage(o['title'], o['credit'], o['author'], o['draft_date'], o['contact']);
                titlePageSeen = true;
            }

            else if (this.isCentered(line)) {
                this.view.addBlock('center', this.emphasis(this.escape(this.centerText(line))));
            }

            else if (this.isDialog(line)) {
                var o = this.parseDialog(this.clearNote(line));
                this.view.addBlock('character-cue', o['character-cue']);
                this.view.addBlock(o['block'], o['dialog'].map(l => this.emphasis(this.escape(l))).join('<br />').trim());
                var trueDialog = o['dialog'].filter(l => ! l.trim().match( /^\(.*\)$/) );
                var words = trueDialog.join(' ').split(/[^\p{L}\p{N}]+/u);
                this.stats.addCharacter(o['character'], trueDialog.length, words.length);
                this.st.addDialog(o);
            }

            else if (this.isTransition(line)) {
                line = this.parseTransition(line);
                this.view.addBlock('transition', line);
            }

            else {
                if (line[0] == '!') { line = line.slice(1); } // Remove leading !
                var action = this.clearNote(line).split(/\n/g);
                this.view.addBlock('action', action.map(l => (l.trim() == '') ? '' : this.emphasis(this.escape(l))).join('<br />'));
                this.st.addAction(action);
            }

        }

        updateStats();
        this.stats.createStatsSection();
    }

    isTitlePage(str) {
        if (/\w+\s*:\s*\S+/.test(str)) { return true; }
        return false;
    }

    parseTitlePage(line) {
        var obj = {};
        var lastKey = '';
        var parts = line.split(/\r?\n/);

        for (var i = 0; i < parts.length; i++) {

            if (parts[i].length <= 1) { continue; } // No key value paris here

            if (parts[i].indexOf(':') !== -1) {

                // Get key
                var key = parts[i].split(':')[0].trim().toLowerCase().replace(' ', '_');
                lastKey = key; // Store new key
                if (!obj[lastKey]) { obj[lastKey] = []; } // Create key

                // Value on next line
                if (parts[i].split(':').length > 1) {
                    var val = parts[i].split(':')[1].trim();
                    if (val.length <= 1) { continue; }
                    // if (obj[lastKey].length > 0) { obj[lastKey] += '<br />'; }
                    obj[lastKey].push(val);
                }

            }

            // Only the value on this line
            else {
                if (parts[i].trim().length <= 1) { continue; }
                // if (obj[lastKey].length > 0) { obj[lastKey] += '<br />'; }
                obj[lastKey].push(parts[i].trim());
            }

        }

        return obj;
    }

    isHeading(str) {
        return FountainParser.HEADING_RE.test(str);
    }

    parseHeading(line) {
        var obj = [];
        const found = line.match(FountainParser.HEADING_RE);
        obj['INT'] = found[1].toLowerCase().includes('i');
        obj['EXT'] = found[1].toLowerCase().includes('e');
        const res = found[2].split(' - ');
        obj['location'] = res.shift().split('/').map(e => e.trim());
        obj['others'] = res.map(e => e.trim());
        obj['sceneNumber'] = found[3];
        obj['line'] = '';
        obj['line'] += obj['INT'] ? 'INT' : '';
        obj['line'] += obj['INT'] && obj['EXT'] ? '/' : '';
        obj['line'] += obj['EXT'] ? 'EXT' : '';
        obj['line'] += (obj['line'].length == 0 ? '' : '.\u2002') + obj['location'].join('/');
        obj['line'] += obj['others'].length > 0 ? ' – ' : '';
        obj['line'] += obj['others'].join(' – ');
        obj['line'] += obj['sceneNumber'] ? (' #' + obj['sceneNumber'] + '#') : '';
        return obj;
    }

    isDialog(str) {
        var parts = str.split(/\r?\n/);
        return (parts.length >= 2) && (FountainParser.DIALOG_RE.test(parts[0]));
    }

    parseDialog(line) {
        var obj = {};
        var parts = line.split('\n');
        const found = parts[0].match(FountainParser.DIALOG_RE);
        obj['character'] = found[1] ? found[1].trim() : found[2].trim();
        obj['parenthesis'] = found[3];
        obj['character-cue'] = obj['character'] + (found[3] ? ' (' + found[3] + ')' : '');
        obj['dialog'] = parts.slice(1).map(e => e.trim()).filter(e => e.length > 0);
        obj['block'] =  found[4] ? 'dual-dialog' : 'dialog';
        return obj;
    }

    isTransition(str) {
        return FountainParser.TRANSITION_RE.test(str);
    }

    parseTransition(str) {
        const found = str.match(FountainParser.TRANSITION_RE);
        return found[1] ? found[1] : found[2];
    }

    isSynopsis(str) {
        return str[0] == '=';
    }

    isSection(str) {
        return str[0] == '#';
    }

    isLyric(str) {
        return str[0] == '~';
    }

    isCentered(str) {
        str = str.trim();
        return str[0] == '>' && str.slice(-1) == '<';
    }

    centerText(str) {
        str = str.replace(/^\s*>\s*(.+)\s*<\s*$/g, '$1'); // Center
        return str;
    }

    emphasis(str) {
        str = str.replace(/\*\*\*[^\*]*\*\*\*/g, function(s) { // Bold & italics
            return '<span class="bold italic">' + s.slice(3, -3).trim() + '</span>';
        });
        str = str.replace(/\*\*[^\*]*\*\*/g, function(s) { // Bold
            return '<span class="bold">' + s.slice(2, -2).trim() + '</span>';
        });
        str = str.replace(/\*[^\*]*\*/g, function(s) { // Italic
            return '<span class="italic">' + s.slice(1, -1).trim() + '</span>';
        });
        str = str.replace(/_[^\_]*_/g, function(s) { // Underline
            return '<span class="underline">' + s.slice(1, -1).trim() + '</span>';
        });
        return str;
    }

    clearStr(str) {
        str = str.toString().replace(/\r/g, ''); // Remove newlines
        str = str.toString().replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Convert tabs to 4 spaces
        str = str.toString().replace(/ +(?= )/g,''); // Remove double spaces
        str = str.toString().trim(); // Remove leading and trailing spaces
        return str;
    }

    escape(htmlStr) {
       return htmlStr.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#39;");

    }

    clearBoneyard(str) {
        str = str.toString().replace(/\/\*.*?\*\//sg, '');
        return str;
    }

    clearNote(str) {
      str = str.replace(/\[\[[^\]]*\]\]\s*\n?/g, function(s) { // Notes
        console.log('Found user note: ' + s.slice(2, -2));
        return '';
      });
      return str;
    }

};
