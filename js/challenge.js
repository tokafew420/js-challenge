(function (app, window, $) {
    "use strict";

    /**
     * Get an array on random numbers
     * 
     * @param {number} size The size of the resulting array. Default 10.
     * @param {number|function} min The mininum inclusive range of the random number. Or a function used to fill the array
     * @param {number} max The maximum inclusive range of the random number. Ignored if min is a function.
     * @returns {Array} An array filled with random numbers.
     */
    app.getArray = function (size, min, max) {
        var fn;
        size = size || 10;
        if (typeof min === 'function') {
            fn = min;
        } else {
            min = min || -10;
            max = max || 10;
            var range = max - min;
            fn = function () {
                return Math.round(Math.random() * range + min);
            };
        }

        return Array.apply(null, Array(size)).map(fn);
    };

    /**
     * Load the solution from github.
     * @param {string} url The github url to the raw solution file.
     */
    app.loadSolution = function (url) {
        $.get(url, function (res) {
            app.solution = res || '';
        });
    };

    // Taken from MDN https://developer.mozilla.org/en-US/docs/DOM/window.btoa
    // utf8 to Base64 encoder.
    app.utf8_to_b64 = function (str) {
        return window.btoa(unescape(encodeURIComponent(str)));
    };

    // Base64 to utf8 decoder.
    app.b64_to_utf8 = function (str) {
        return decodeURIComponent(escape(window.atob(str)));
    };

    app.getStats = function (runtimes) {
        if (!Array.isArray(runtimes)) {
            runtimes = [];
        }
        var len = runtimes.length;
        var max = runtimes[0];
        var min = runtimes[0];
        var sum = runtimes[0];

        for (var i = 1; i < len; i++) {
            if (runtimes[i] > max) {
                max = runtimes[i];
            }
            if (runtimes[i] < min) {
                min = runtimes[i];
            }
            sum = sum + runtimes[i];
        }

        return {
            max: max,
            min: min,
            sum: sum,
            avg: sum / len
        };
    };

    // This will never get called, it's just nicer to write and call `toString()` on.
    // fn is a place holder for the function name.
    function handler(evt) {
        var res = {
            answer: null,
            runtimes: []
        };
        var paramNames, args, start, i, iterations;

        try {
            if (typeof fn !== 'function') {
                throw new Error('function [fn] is not defined.');
            }

            // Get the function parameter names
            // https://stackoverflow.com/a/31194949
            paramNames = (typeof fn === 'function' ? Function.toString.call(fn) : fn + '')
                .replace(/[/][/].*$/mg, '') // strip single-line comments
                .replace(/\s+/g, '') // strip white space
                .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
                .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
                .replace(/=[^,]+/g, '') // strip any ES6 defaults  
                .split(',').filter(Boolean); // split & filter [""]

            // Create arguments array
            args = paramNames.map(function (p) {
                return evt.data[p];
            });
            iterations = evt.data.iterations;

            start = performance.now();
            // Save the first result
            res.answer = fn.apply(null, args);
            res.runtimes.push(performance.now() - start);

            for (i = 1; i < iterations; i++) {
                start = performance.now();
                fn.apply(null, args);
                res.runtimes.push(performance.now() - start);
            }

            evt.source.postMessage(res, evt.origin);
        } catch (err) {
            res.err = err.message;
            return evt.source.postMessage(res, evt.origin);
        }
    }

    // Keep a reference to the current iframe so we can remove it, once the eval has finished.
    var $currFrame = null;
    var timer;
    var _callback;

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

            $frame.invoke = app.debounce(function (data, iterations, timeout, callback) {
                if (typeof iterations === 'function') {
                    callback = iterations;
                    iterations = 1;
                    timeout = null;
                } else if (typeof timeout === 'function') {
                    callback = timeout;
                    timeout = null;
                }
                if (typeof iterations !== 'number') {
                    iterations = 1;
                }
                _callback = callback || function () {};

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

    function onResult(evt) {
        if ($currFrame) {
            $currFrame.remove();
            $currFrame = null;
            clearTimeout(timer);
        }

        var res = evt.data || {};

        res.stats = app.getStats(res.runtimes);

        if (typeof _callback === 'function') {
            _callback(res.err, res);
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
})(window.app = window.app || {}, window, jQuery);