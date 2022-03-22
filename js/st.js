class SousTitre {

    static HORS_CHAMP_TAG = 'H.C.';
    static OFF_TAG = 'OFF';
    static LONGUEUR_LINE = 36;

    reset() {
        this.soustitre = document.getElementById('soustitre');
        this.soustitre.innerHTML = '';
        this.lastCharacter = '';
    }

    addDialog(dialog) {
        var prefix = dialog['character'] != this.lastCharacter ? '- ' : '';
        this.lastCharacter = dialog['character'];
        dialog['dialog'].forEach((item, i) => {
            if (!item.trim().match( /^\(.*\)$/)) {
                var d = this.emphasis(item.trim());
                var clazz = dialog['parenthesis'] == SousTitre.HORS_CHAMP_TAG ? 'horsChamp' : '';
                var line = '';
                this.emphasis(item.trim()).split(/\s+/).forEach((item, i) => {
                    if ((line.length + item.length +1) > SousTitre.LONGUEUR_LINE) {
                        document.getElementById('soustitre').innerHTML += `<li class="${clazz}">${prefix}${line}</li>\n`;
                        prefix = '';
                        line = '';
                    } else {
                        line += ' ';
                    }
                    line += item;
                });
                document.getElementById('soustitre').innerHTML += `<li class="${clazz}">${prefix}${line}</li>\n`;
                prefix = '';
            }
        });
    }

    addAction(action) {
        action.filter(line => /`.+`/.test(line)).forEach((item, i) => {
            var bruit = item.match(/`([^``]+)`/);
            document.getElementById('soustitre').innerHTML += `<li class="bruit">${bruit[1]}</li>\n`;
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
