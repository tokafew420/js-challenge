(function (window, $) {

    if (localStorage.getItem('js-challenge-edit-distance')) {
        app.editor.setValue(localStorage.getItem('js-challenge-edit-distance'));
    } else {
        reset();
    }

    function reset(e) {
        e.preventDefault();

        app.editor.setValue(
            `/**
* @param {string} word1
* @param {string} word2
* @return {number}
*/
function minDistance(word1, word2) {
    
};`
        );
    }

    $('#reset').click(reset);

    app.editor.on('change', function () {
        var code = app.editor.getValue();

        if (code) {
            localStorage.setItem('js-challenge-edit-distance', code);
            app.compile('minDistance', code);
        }
    });

    function baseSolution(word1, word2) {
        return 3;
    }

    var $input1 = $('#input-1');
    var $input2 = $('#input-2');
    var $output = $('#output');
    var $summary = $('#summary');
    var $outputTemplate = $('#output-template');
    var $summaryTemplate = $('#summary-template');
    var runs, ran;
    var summary;

    function runTest(word1, word2, callback) {
        var input = {
            word1: word1,
            word2: word2,
            iterations: 100
        };
        summary.testCases++;

        var isCompareToBase = $('#compare-opt-base').is(':checked');
        var baseFnName = isCompareToBase ? 'baseSolution' : 'minDistance';
        var baseFn = isCompareToBase ? baseSolution : minDistance;

        app.compile(baseFnName, baseFn.toString()).invoke(input, function (err, baseRes) {
            app.progress.update(++ran / runs);
            if (err) {
                return callback(err);
            }

            summary.baseRuntimes.push(baseRes.stats.avg);

            var code = app.compile('minDistance', app.editor.getValue());

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

                    $trialInput1.text(input.word1);
                    $trialInput2.text(input.word2);

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
        ['horse', 'ros'],
        ['intention', 'execution']
    ];
})(window, jQuery);