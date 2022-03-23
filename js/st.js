class SousTitre {

    static PREFIX_CHANGEMENT_DE_PERSONNAGE = '- ';
    static HORS_CHAMP_TAG = 'H.C.';
    static OFF_TAG = 'OFF';
    static LONGUEUR_LINE = 36;

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
        var clazz = dialog['parenthesis'] == SousTitre.HORS_CHAMP_TAG ? ' class="horsChamp"' : '';
        dialog['dialog'].forEach((item, i) => {
            if (!item.trim().match( /^\(.*\)$/)) {
                var d = this.emphasis(item.trim());
                var line = '';
                d.split(/\s+/).forEach((item, i) => {
                    if ((line.length + item.length +1) > SousTitre.LONGUEUR_LINE) {
                        this.soustitre.innerHTML += `<li${clazz}>${prefix}${line}</li>\n`;
                        prefix = '';
                        line = '';
                    } else if (line.length > 0) {
                        line += ' ';
                    }
                    line += item;
                });
                this.soustitre.innerHTML += `<li${clazz}>${prefix}${line}</li>\n`;
                prefix = '';
            }
        });
    }

    addAction(action) {
        action.filter(line => /`.+`/.test(line)).forEach((item, i) => {
            var bruit = item.match(/`([^``]+)`/);
            this.soustitre.innerHTML += `<li class="bruit">${bruit[1]}</li>\n`;
        });

    }

    emphasis(str) {
        str = str.replace(/\*\*\*([^\*]*)\*\*\*/g, '$1');
        str = str.replace(/\*\*([^\*]*)\*\*/g, '$1');
        str = str.replace(/\*([^\*]*)\*/g, '$1');
        str = str.replace(/_([^\_]*)_/g, '$1');
        return str;
    }
}
