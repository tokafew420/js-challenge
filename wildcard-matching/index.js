(function (window, $) {
    "use strict";

    if (localStorage.getItem('js-challenge-wildcard-matching')) {
        app.editor.setValue(localStorage.getItem('js-challenge-wildcard-matching'));
    } else {
        reset();
    }

    function reset(e) {
        if(e) e.preventDefault();

        app.editor.setValue(
            `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
    var i = new RegExp('^' + p.replace(/\\?/g, '.').replace(/\\*/g, '.*') + '$');
    return i.test(s);
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

    function baseSolution(s, p) {
        var i = new RegExp("^" + p.replace(/\?/g, '.').replace(/\*/g, '.*') + "$");
        return i.test(s);
    }

    var $input1 = $('#input-1');
    var $input2 = $('#input-2');
    var $output = $('#output');
    var $summary = $('#summary');
    var $outputTemplate = $('#output-template');
    var $summaryTemplate = $('#summary-template');
    var runs, ran;
    var summary;

    function runTest(input1, input2, callback) {
        var input = {
            s: input1,
            p: input2,
            iterations: 100
        };
        summary.testCases++;

        var isCompareToBase = $('#compare-opt-base').is(':checked');
        var baseFnName = isCompareToBase ? 'baseSolution' : 'isMatch';
        var baseFn = isCompareToBase ? baseSolution : isMatch;

        app.compile(baseFnName, baseFn.toString()).invoke(input, function (err, baseRes) {
            app.progress.update(++ran / runs);
            if (err) {
                return callback(err);
            }

            summary.baseRuntimes.push(baseRes.stats.avg);

            var code = app.compile('isMatch', app.editor.getValue());

            if (code) {
                code.invoke(input, function (err, res) {
                    app.progress.update(++ran / runs);
                    if (err) {
                        return callback(err);
                    }

                    summary.runtimes.push(res.stats.avg);

                    var $clone = $outputTemplate.clone();

                    var $trialInput1 = $('#trial-input-1', $clone);
                    var $trialInput2 = $('#trial-input-2', $clone);
                    var $trialExpected = $('#trial-expected', $clone);
                    var $trialActual = $('#trial-actual', $clone);
                    var $baseTimeMax = $('#base-time-max', $clone);
                    var $baseTimeAvg = $('#base-time-avg', $clone);
                    var $baseTimeMin = $('#base-time-min', $clone);
                    var $yourTimeMax = $('#your-time-max', $clone);
                    var $yourTimeAvg = $('#your-time-avg', $clone);
                    var $yourTimeMin = $('#your-time-min', $clone);
                    var $comparison = $('#comparison', $clone);

                    $trialInput1.text(input.s);
                    $trialInput2.text(input.p);

                    $trialExpected.text(baseRes.answer);
                    $trialActual.text(res.answer);
                    if (baseRes.answer === res.answer) {
                        $trialActual.addClass('text-success');
                        summary.passed++;
                    } else {
                        $trialActual.addClass('text-danger');
                        summary.failed++;
                    }

                    $baseTimeMax.text(baseRes.stats.max + 'ms');
                    $baseTimeAvg.text(baseRes.stats.avg + 'ms');
                    $baseTimeMin.text(baseRes.stats.min + 'ms');

                    $yourTimeMax.text(res.stats.max + 'ms');
                    $yourTimeAvg.text(res.stats.avg + 'ms');
                    $yourTimeMin.text(res.stats.min + 'ms');

                    if (baseRes.stats.max < res.stats.max) {
                        $yourTimeMax.addClass('text-danger');
                    } else if (baseRes.stats.max > res.stats.max) {
                        $yourTimeMax.addClass('text-success');
                    }
                    if (baseRes.stats.avg < res.stats.avg) {
                        $yourTimeAvg.addClass('text-danger');
                        $comparison.text((((res.stats.avg - baseRes.stats.avg) / baseRes.stats.avg) * 100).toFixed(2) + '% slower').addClass('text-danger');
                    } else if (baseRes.stats.avg > res.stats.avg) {
                        $yourTimeAvg.addClass('text-success');
                        $comparison.text((((baseRes.stats.avg - res.stats.avg) / res.stats.avg) * 100).toFixed(2) + '% faster').addClass('text-success');
                    } else {
                        $comparison.text('Same');
                    }

                    if (baseRes.stats.min < res.stats.min) {
                        $yourTimeMin.addClass('text-danger');
                    } else if (baseRes.stats.min > res.stats.min) {
                        $yourTimeMin.addClass('text-success');
                    }

                    $clone.appendTo($output).show();
                    callback(null);
                });
            } else {
                callback(new Error('Failed to compile'));
            }
        });
    }

    $('#run-once').on('click', function () {
        app.progress.show();
        $summary.hide();
        $output.empty();
        runs = 1 * 2;
        ran = 0;
        summary = {
            testCases: 0,
            passed: 0,
            failed: 0,
            runtimes: [],
            baseRuntimes: []
        };
        runTest($input1.val(), $input2.val(), function (err) {
            if (err) {
                console.log(err);
            }
            app.progress.hide();
        });
    });

    $('#test').on('click', function () {
        app.progress.show();
        $summary.hide();
        $summary.empty();
        $output.empty();
        runs = testCases.length * 2;
        ran = 0;
        summary = {
            testCases: 0,
            passed: 0,
            failed: 0,
            runtimes: [],
            baseRuntimes: []
        };

        function test() {
            if (ran < runs) {
                var i = ran / 2;
                runTest(testCases[i][0], testCases[i][1], test);
            } else {
                var $clone = $summaryTemplate.clone();

                var $testCases = $('#test-cases', $clone);
                var $passed = $('#passed', $clone);
                var $failed = $('#failed', $clone);
                var $baseTimeMax = $('#base-time-max', $clone);
                var $baseTimeAvg = $('#base-time-avg', $clone);
                var $baseTimeMin = $('#base-time-min', $clone);
                var $yourTimeMax = $('#your-time-max', $clone);
                var $yourTimeAvg = $('#your-time-avg', $clone);
                var $yourTimeMin = $('#your-time-min', $clone);
                var $comparison = $('#comparison', $clone);

                $testCases.text(summary.testCases);
                $passed.text(summary.passed);
                if (summary.passed > 0) {
                    $passed.addClass('text-success');
                }
                $failed.text(summary.failed);
                if (summary.failed > 0) {
                    $failed.addClass('text-danger');
                }

                summary.baseStats = app.getStats(summary.baseRuntimes);
                summary.stats = app.getStats(summary.runtimes);

                $baseTimeMax.text(summary.baseStats.max + 'ms');
                $baseTimeAvg.text(summary.baseStats.avg + 'ms');
                $baseTimeMin.text(summary.baseStats.min + 'ms');

                $yourTimeMax.text(summary.stats.max + 'ms');
                $yourTimeAvg.text(summary.stats.avg + 'ms');
                $yourTimeMin.text(summary.stats.min + 'ms');

                if (summary.baseStats.max < summary.stats.max) {
                    $yourTimeMax.addClass('text-danger');
                } else if (summary.baseStats.max > summary.stats.max) {
                    $yourTimeMax.addClass('text-success');
                }
                if (summary.baseStats.avg < summary.stats.avg) {
                    $yourTimeAvg.addClass('text-danger');
                    $comparison.text((((summary.stats.avg - summary.baseStats.avg) / summary.baseStats.avg) * 100).toFixed(2) + '% slower').addClass('text-danger');
                } else if (summary.baseStats.avg > summary.stats.avg) {
                    $yourTimeAvg.addClass('text-success');
                    $comparison.text((((summary.baseStats.avg - summary.stats.avg) / summary.stats.avg) * 100).toFixed(2) + '% faster').addClass('text-success');
                } else {
                    $comparison.text('Same');
                }

                if (summary.baseStats.min < summary.stats.min) {
                    $yourTimeMin.addClass('text-danger');
                } else if (summary.baseStats.min > summary.stats.min) {
                    $yourTimeMin.addClass('text-success');
                }

                $clone.appendTo($summary.show()).show();

                app.progress.hide();
            }
        }
        test();
    });

    var testCases = [
        ['aa', 'a'],
        ['aa', '*'],
        ['cb', '?a'],
        ['adceb', '*a*b'],
        ['acdcb', 'a*c?b'],
        ['', ''],
        ['', 'a'],
        ['', '?'],
        ['', '*'],
        ['a', ''],
        ['a', 'a'],
        ['a', 'b'],
        ['a', '?'],
        ['a', '*'],
        ['a', 'aa'],
        ['a', 'ab'],
        ['a', 'ba'],
        ['a', 'a?'],
        ['a', '?a'],
        ['a', '?b'],
        ['a', 'b?'],
        ['a', 'a*'],
        ['a', '*a'],
        ['a', 'b*'],
        ['a', '*b'],
        ['a', '??'],
        ['a', '*?'],
        ['a', '?*'],
        ['a', '**'],
        ['aa', ''],
        ['aa', 'b'],
        ['aa', '?'],
        ['aa', 'aa'],
        ['aa', 'aaa'],
        ['aa', 'ab'],
        ['aa', 'aab'],
        ['aa', 'ba'],
        ['aa', 'baa'],
        ['aa', '?aa'],
        ['aa', 'aa?'],
        ['aa', 'a?a'],
        ['aa', 'a?b'],
        ['aa', 'b?a'],
        ['aa', 'a??'],
        ['aa', '??a'],
        ['aa', '??b'],
        ['aa', 'b??'],
        ['aa', 'a*'],
        ['aa', '*a'],
        ['aa', 'b*'],
        ['aa', '*b'],
        ['aa', 'ab*'],
        ['aa', 'b*a'],
        ['aa', 'b*b'],
        ['aa', '*a*'],
        ['aa', '*b*'],
        ['aa', '??'],
        ['aa', '*?'],
        ['aa', '?*'],
        ['aa', '**'],
        ['aa', '*??'],
        ['aa', '??*'],
        ['aa', '?*?'],
        ['aa', '?*??'],
        ['aa', '*?*?*'],
        ['ab', ''],
        ['ab', 'b'],
        ['ab', '?'],
        ['ab', 'aa'],
        ['ab', 'aaa'],
        ['ab', 'ab'],
        ['ab', 'aab'],
        ['ab', 'ba'],
        ['ab', 'baa'],
        ['ab', '?aa'],
        ['ab', 'aa?'],
        ['ab', 'a?a'],
        ['ab', 'a?b'],
        ['ab', 'b?a'],
        ['ab', 'a??'],
        ['ab', '??a'],
        ['ab', '??b'],
        ['ab', 'b??'],
        ['ab', 'a*'],
        ['ab', '*a'],
        ['ab', 'b*'],
        ['ab', '*b'],
        ['ab', 'ab*'],
        ['ab', 'b*a'],
        ['ab', 'b*b'],
        ['ab', '*a*'],
        ['ab', '*b*'],
        ['ab', '??'],
        ['ab', '*?'],
        ['ab', '?*'],
        ['ab', '**'],
        ['ab', '*??'],
        ['ab', '??*'],
        ['ab', '?*?'],
        ['ab', '?*??'],
        ['ab', '*?*?*'],
        ['xabcabcz', 'x*abcz'],
        ['xabcabcz', 'x*a?cz'],
        ['xabcxaabbcz', 'x*abcz'],
        ['xabcabcz', 'x*abcz'],
        ['xabcabcz', 'x*?bcz'],
        ['xabcabcz', 'x*ab?z'],
        ['xabcabcz', 'x*abc?'],
        ['xabcabca', 'x*ab?a'],
        ['xababba', 'x*abba'],
        ['xabcabcz', 'x*ab*z'],
        ['abababababababab', '*abab'],
        ['ababababababababa', '*abab'],
        ['babababababababab', '*abab'],
        ['ababababababababab', '*abab'],
        ['abababababababababa', '*abab'],
        ['bababababababababab', '*abab'],
        ['abababacdcdcdcdcefefefe', '*ab*cd*ce*'],
        ['abcdefg', 'abcd*?g'],
        ['xabcabcdabcdeabcdfabcdefg', 'x*a?????g*?'],
        ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', '*a*b*c*?*?*?*?*?g*?'],
        ['abcabcd', '?b?'],
        ['abcabcd', '??b??'],
        ['abcabcd', '?b??b?'],
        ['abcabcd', '*b?c?'],
        ['abcabcd', '*?b?c'],
        ['abcabcd', 'ac?*?bc'],
        ['adceb', '?*'],
        ['acdcb', 'a*c?b'],
        ['acdcb', 'a*c?*b'],
        ['abcdefgabcdz', 'a*abcdz'],
        ['xabcdabcd', 'x*abcd']
    ];
})(window, jQuery);