(function (window, $) {
    "use strict";

    if (localStorage.getItem('js-challenge-wildcard-matching')) {
        app.editor.setValue(localStorage.getItem('js-challenge-wildcard-matching'));
    } else {
        reset();
    }

    function reset() {
        app.editor.setValue(
            `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
    
};`
        );
    }

    $('#reset').click(reset);

    app.editor.on('change', function () {
        var code = app.editor.getValue();

        if (code) {
            localStorage.setItem('js-challenge-wildcard-matching', code);
            app.compile('isMatch', code);
        }
    });

    function isMatchRegex(s, p) {
        var i = new RegExp("^" + p.replace(/\?/g, '.').replace(/\*/g, '.*') + "$");
        return i.test(s);
    }

    var $string = $('#string');
    var $pattern = $('#pattern');
    var $inputString = $('#inputString');
    var $inputPattern = $('#inputPattern');
    var $expectedOutput = $('#expectedOutput');
    var $actualOutput = $('#actualOutput');
    var $baseTime = $('#baseTime');
    var $yourTime = $('#yourTime');
    var $comparison = $('#comparison');

    function test(s, p) {
        $inputString.text(s);
        $inputPattern.text(p);

        if (s && p) {
            var t0 = performance.now();
            var r0 = isMatchRegex(s, p);
            var t1 = performance.now() - t0;

            $expectedOutput.text(r0);
            $baseTime.text(t1 + 'ms');
        }
    }

    function onRunOnceResult(err, res) {
        if (err) {
            console.log(err);
            return;
        }

        var expectedOutput = $expectedOutput.text() === 'true';
        var baseTime = +$baseTime.text().replace('ms', '');

        var t0 = res.start;
        var answer = res.answer;
        var yourTime = res.end - t0;

        $actualOutput.text(answer);
        if (expectedOutput === answer) {
            $actualOutput.removeClass('text-danger').addClass('text-success');
        } else {
            $actualOutput.removeClass('text-success').addClass('text-danger');
        }
        $yourTime.text(yourTime + 'ms');
        if (baseTime <= yourTime) {
            $yourTime.removeClass('text-success').addClass('text-danger');
            $comparison.text((((yourTime - baseTime) / baseTime) * 100).toFixed(2) + '% slower').removeClass(
                'text-success').addClass(
                'text-danger');
        } else {
            $yourTime.removeClass('text-danger').addClass('text-success');
            $comparison.text((((baseTime - yourTime) / yourTime) * 100).toFixed(2) + '% faster').removeClass(
                'text-danger').addClass(
                'text-success');
        }
    }

    function runOnce() {
        var input = {
            s: $string.val(),
            p: $pattern.val()
        };

        $inputString.text(input.s);
        $inputPattern.text(input.p);

        var t0 = performance.now();
        var r0 = isMatchRegex(input.s, input.p);
        var t1 = performance.now() - t0;

        $expectedOutput.text(r0);
        $baseTime.text(t1 + 'ms');

        app.onResult = onRunOnceResult;

        var code = app.compile('isMatch', app.editor.getValue());

        if (code) {
            code.invoke(input);
        }
    }

    $('#run-once').on('click', runOnce);
})(window, jQuery);