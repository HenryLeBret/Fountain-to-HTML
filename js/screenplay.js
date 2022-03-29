class Screenplay {

    constructor(domId, parser, display) {

        var t = this;

        const navigationKeys = [
            'Shift', 'Control', 'CapsLock', 'AltGraph',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'PageUp', 'PageDown', 'Home', 'End'
        ];

        t.domId = domId;
        t.parser = parser;
        t.view = display;

        t.typeTimeout = 1000; // Wait ms before assuming user stopped typing

        // React to user typing Fountain
        t.delayTime;
        document.getElementById(t.domId).addEventListener('keyup', event => {
            if (navigationKeys.includes(event.key)
                || event.isComposing || event.keyCode === 229) {
                return;
            }
            startParsing()
        }, false);

        async function startParsing() {
            clearInterval(t.delayTime); // Only parses one time, if the user does not type after the last parse, no new call will be launched
            t.delayTime = setTimeout(function() {
                t.parser.parseFountain(); // Wait before parsing, start parsing when the user isn't typing
            }, t.typeTimeout);
        }

    }

}
