class SousTitre {

    static PREFIX_CHANGEMENT_DE_PERSONNAGE = '- ';
    static LONGUEUR_LINE = 36;

    static HORS_CHAMP_RE = /^H\.C\.$/;
    static OFF_RE = /^OFF$/i;
    static MUSIC_RE = /^~(.+)$/;
    static ETRANGERE_RE = /``(.+?)``/g;

    constructor(htmlElement) {
        this.soustitre = htmlElement;
        this.lastCharacter = '';
    }

    reset() {
        this.soustitre.innerHTML = '';
        this.lastCharacter = '';
    }

    addDialog(dialog) {
        var prefix = dialog['character'] != this.lastCharacter ? SousTitre.PREFIX_CHANGEMENT_DE_PERSONNAGE : '';
        this.lastCharacter = dialog['character'];
        var clazz = '';
        if (SousTitre.HORS_CHAMP_RE.test(dialog['parenthesis'])) { clazz = ' class="horsChamp"'; }
        if (SousTitre.OFF_RE.test(dialog['parenthesis'])) { clazz = ' class="off"'; }

        dialog['dialog'].forEach((item, i) => {
            item = item.trim();
            if (!item.match( /^\(.*\)$/)) {
                if (SousTitre.MUSIC_RE.test(item)) {
                    clazz = ' class="music"';
                    item = item.slice(0);
                }
                var d = this.emphasis(item);
                var line = '';
                var etrangere = false
                var len = prefix.length;
                var arr = d.split(/(?<=\p{L})(?=\P{L})|(?<=\P{L})(?=\p{L})|(?<=``)(?=[^`])|(?<=[^`])(?=``)/u);
                arr.forEach((item, i) => {
                    if (item == '``') {
                        line += etrangere ? '</span>' : '<span class="etrangere">';
                        etrangere = !etrangere;
                    } else {
                        if ((len + item.length +1) > SousTitre.LONGUEUR_LINE) {
                            line = line.trim();
                            this.soustitre.innerHTML += `<li${clazz}>${prefix}${line}</li>\n`;
                            prefix = '';
                            line = '';
                            len = 0;
                        }
                        line += item;
                        len += item.length;
                    }
                });
                line = line.trim();
                this.soustitre.innerHTML += `<li${clazz}>${prefix}${line}</li>\n`;
                prefix = '';
            }
        });
    }

    addAction(action) {
        action.filter(line => /`.+`/.test(line.text)).forEach((item, i) => {
            var bruit = item.text.match(/`([^``]+)`/);
            this.soustitre.innerHTML += `<li class="bruit">${bruit[1]}</li>\n`;
        });

    }

    emphasis(str) {
        str = str.replace(SousTitre.MUSIC_RE, '$1');
        // str = str.replace(SousTitre.ETRANGERE_RE, '<span class="etrangere">$1</span>');
        str = str.replace(/\*\*\*([^\*]*)\*\*\*/g, '$1');
        str = str.replace(/\*\*([^\*]*)\*\*/g, '$1');
        str = str.replace(/\*([^\*]*)\*/g, '$1');
        str = str.replace(/_([^\_]*)_/g, '$1');
        return str;
    }
}
