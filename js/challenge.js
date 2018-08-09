(function (window, $) {
    "use strict";

    var app = window.app = window.app || {};

    // Taken from MDN https://developer.mozilla.org/en-US/docs/DOM/window.btoa
    // utf8 to Base64 encoder.
    app.utf8_to_b64 = function (str) {
        return window.btoa(unescape(encodeURIComponent(str)));
    };

    // Base64 to utf8 decoder.
    app.b64_to_utf8 = function (str) {
        return decodeURIComponent(escape(window.atob(str)));
    };

    // This will never get called, it's just nicer to write and call `toString()` on.
    function handler(evt) {
        var res = {};
        try {
            if (typeof fn !== 'function') {
                throw new Error('function [fn] is not defined.');
            }

            // https://stackoverflow.com/a/31194949
            var paramNames = (typeof fn === 'function' ? Function.toString.call(fn) : fn + '')
                .replace(/[/][/].*$/mg, '') // strip single-line comments
                .replace(/\s+/g, '') // strip white space
                .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
                .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
                .replace(/=[^,]+/g, '') // strip any ES6 defaults  
                .split(',').filter(Boolean); // split & filter [""]

            var args = paramNames.map(function (p) {
                return evt.data[p];
            });
            res.start = performance.now();
            res.answer = fn.apply(null, args);
            res.end = performance.now();

            evt.source.postMessage(res, evt.origin);
        } catch (err) {
            res.err = err.message;
            return evt.source.postMessage(res, evt.origin);
        }
    }

    // Keep a reference to the current iframe so we can remove it, once the eval has finished.
    var $currFrame = null;
    var timer;

    // https://github.com/AshHeskes/eval-extension/blob/master/client/js/app.js
    app.compile = function (fnName, code) {
        if (fnName && code) {
            if ($currFrame) $currFrame.remove();
            $currFrame = null;
            clearTimeout(timer);

            var $frame = $('<iframe></iframe>');
            var content = '<html><head><script>window.addEventListener("message",' + handler.toString().replace(
                    /fn/g, fnName) +
                ', false); ' + code + '<' + '/script></head><body></body' + '></html>';
            var dataURI = 'data:text/html;base64,' + app.utf8_to_b64(content);

            $frame.attr('src', dataURI);
            $frame.appendTo('body');

            $frame.invoke = app.debounce(function (data, timeout) {
                setTimeout(function () {
                    $frame[0].contentWindow.postMessage(data, '*');
                    timer = setTimeout(function () {
                        clearTimeout(timer);

                        if ($currFrame) {
                            $currFrame.remove();
                            $currFrame = null;

                            onResult({
                                data: {
                                    err: 'Script timeout'
                                }
                            });
                        }
                    }, timeout || 3 * 1000);
                }, 100);
            }, 100);

            return $currFrame = $frame;
        }
    };

    app.onResult = function () {};

    function onResult(evt) {
        if ($currFrame) {
            $currFrame.remove();
            $currFrame = null;
            clearTimeout(timer);
        }

        var res = evt.data || {};
        if (typeof app.onResult === 'function') {
            app.onResult(res.err, res);
        } else {
            console.log(res);
        }
    }

    // listen to events coming from iframes.
    window.addEventListener('message', onResult);

    app.editor = CodeMirror.fromTextArea($('#editor')[0], {
        lineNumbers: true,
        mode: {
            name: "javascript",
            json: true
        },
        theme: 'neat'
    });
})(window, jQuery);