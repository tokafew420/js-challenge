(function (app, window, $) {
    "use strict";

    app.loadSolution('https://raw.githubusercontent.com/tokafew420/js-challenge/master/circular-array-loop/solution.js');

    if (localStorage.getItem('js-challenge-circular-array-loop')) {
        app.editor.setValue(localStorage.getItem('js-challenge-circular-array-loop'));
    } else {
        reset();
    }

    function reset(e) {
        if (e) e.preventDefault();

        app.editor.setValue(
            `/**
* @param {number[]} nums
* @return {boolean}
*/
function circularArrayLoop(nums) {
}
`);
    }

    $('#reset').click(reset);

    app.editor.on('change', function () {
        var code = app.editor.getValue();

        if (code) {
            localStorage.setItem('js-challenge-circular-array-loop', code);
            app.compile('circularArrayLoop', code);
        }
    });

    $('#input-size').on('change', function () {
        var $this = $(this);
        var size = +$this.val();

        if (isNaN(size) || size < 1) $this.addClass('is-invalid');
        else $this.removeClass('is-invalid');
    });

    $('#input-min').on('change', function () {
        var $this = $(this);
        var $max = $('#input-max');
        var min = +$this.val();
        var max = $max.val();

        if (isNaN(min) || (!isNaN(max) && min > max)) {
            $this.addClass('is-invalid');
            $max.removeClass('is-invalid');
        } else {
            $this.removeClass('is-invalid');
            $max.removeClass('is-invalid');
        }
    });

    $('#input-max').on('change', function () {
        var $this = $(this);
        var $min = $('#input-min');
        var max = +$this.val();
        var min = $min.val();

        if (isNaN(max) || (!isNaN(min) && max < min)) {
            $this.addClass('is-invalid');
            $min.removeClass('is-invalid');
        } else {
            $this.removeClass('is-invalid');
            $min.removeClass('is-invalid');
        }
    });

    $('#create-data').on('click', function () {
        var size = +($('#input-size').val());
        var min = +($('#input-min').val());
        var max = +($('#input-max').val());

        if (isNaN(size) || size < 1) return;
        if (isNaN(min) || isNaN(max) || min > max) return;

        var range = max - min;
        var array = app.getArray(size, function () {
            var x;
            while (!(x = Math.round(Math.random() * range + min)));

            return x;
        });

        $('#input-1').val('[' + array + ']');
    });

    var $input1 = $('#input-1');
    var $output = $('#output');
    var $summary = $('#summary');
    var $outputTemplate = $('#output-template');
    var $summaryTemplate = $('#summary-template');
    var runs, ran;
    var summary;

    function runTest(input1, callback) {
        var input = {
            nums: input1,
            iterations: 100
        };
        summary.testCases++;

        var baseFnName = 'solution';
        var baseFn = app.solution;

        app.compile(baseFnName, app.solution).invoke(input, function (err, baseRes) {
            app.progress.update(++ran / runs);
            if (err) {
                return callback(err);
            }

            summary.baseRuntimes.push(baseRes.stats.avg);

            var code = app.compile('circularArrayLoop', app.editor.getValue());

            if (code) {
                code.invoke(input, function (err, res) {
                    app.progress.update(++ran / runs);
                    if (err) {
                        return callback(err);
                    }

                    summary.runtimes.push(res.stats.avg);

                    var $clone = $outputTemplate.clone();

                    var $trialInput1 = $('#trial-input-1', $clone);
                    var $trialExpected = $('#trial-expected', $clone);
                    var $trialActual = $('#trial-actual', $clone);
                    var $baseTimeMax = $('#base-time-max', $clone);
                    var $baseTimeAvg = $('#base-time-avg', $clone);
                    var $baseTimeMin = $('#base-time-min', $clone);
                    var $yourTimeMax = $('#your-time-max', $clone);
                    var $yourTimeAvg = $('#your-time-avg', $clone);
                    var $yourTimeMin = $('#your-time-min', $clone);
                    var $comparison = $('#comparison', $clone);

                    $trialInput1.text('[' + input.nums + ']');

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

        var nums = $input1.val().split(',').map(function (num) {
            return +(num.replace('[', '').replace(']', ''));
        });

        runTest(nums, function (err) {
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
                runTest(testCases[i], test);
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
        /**********
         * Test scenarios from problem examples
         ***********/
        [2, -1, 1, 2, 2],
        [-1, 2],

        /**********
         * Test other different scenarios
         ***********/
        [-9],
        [10, 9],
        [9, 9],
        [10, -2, 7],
        [8, -6, 1, 9],
        [8, -5, -1, -5, -6],
        [7, 2, -7, 2, 2, 2],
        [-5, -2, -7, 9, -4, -8, 6],
        [-1, 4, 6, 3, 8, 3, 7, 6],
        [-5, 5, 5, 2, -4, 8, -4, 3, 9],
        [7, -1, -9, 10, -7, -9, -2, 5, 4, -4],
        [7, 1, 1, 1, 5, 9, 4, 8, -10, 4, 7],
        [4, -4, 7, 5, 1, -9, 10, -4, -7, -8, 5, -7],
        [-6, -9, -3, -6, -6, -2, 8, -2, 4, 9, -7, 8, 2],
        [9, 5, -6, 7, 3, -7, 7, -5, -10, -3, 8, 1, 3, -6],
        [-5, 6, 9, 9, -9, 8, 2, -3, 7, 6, 10, -2, -5, 9, 1],
        [-7, -2, 5, 7, 9, 6, -6, -2, -10, 2, 1, -1, 8, 6, 8, 3],
        [-5, 8, -10, -8, -3, -9, 5, -1, -10, 1, -7, -7, 8, 1, 1, 6, 1],
        [-2, -8, -8, 9, -7, 1, -4, 2, -2, 9, 8, -2, -1, 10, -9, -2, 9, -6],
        [-8, -6, -5, 2, -7, -2, -4, -9, -3, 6, 2, -4, 4, -4, 2, -8, -1, 10, -4],
        [-4, -3, -4, 1, 3, 10, 7, 10, -7, -5],
        [10],
        [-1, -6],
        [-5, -6, 2],
        [-7, -5, -1, -3],
        [-5, -7, 7, -9, -6],
        [6, 2, 3, -7, -4, 1],
        [-1, -10, -8, 3, -10, -8, 8],
        [-3, 3, -3, -4, -7, -8, -1, 9],
        [-1, -4, -6, -1, -2, 6, 7, -8, 8],
        [4, 9, 5, -9, 8, -7, -1, 5, 5, 8],
        [-9, 4, 9, -5, 5, -4, -8, -1, -9, -9, 3],
        [8, -6, -9, -5, -1, -8, 5, 2, -5, -6, -2, -1],
        [10, -3, -3, 8, -10, 4, 9, 9, 3, 2, 3, -5, -9],
        [-9, -7, 5, 5, 4, -9, -3, 10, -7, 1, 9, -4, 10, 9],
        [-9, 2, -3, 4, -9, 6, 3, -4, 6, 3, 6, -7, 6, 10, -4],
        [5, -3, -6, 9, -1, 6, -6, 8, 3, 5, -6, 7, -8, -3, -10, -7],
        [-8, -4, 1, 7, -9, -8, -6, 2, -4, -3, -8, -9, -9, 3, 8, 3, 1],
        [-1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2],
        [2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3],
        [-3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3],
        [3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6],
        [6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4],
        [-4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3],
        [3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5],
        [5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1],
        [1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2, 9],
        [9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6, 2],
        [2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1, 6],
        [6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1, 1],
        [1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7, -1],
        [-1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5, -7],
        [-7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9, 5],
        [5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5, 9],
        [9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10, -5],
        [-5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1, 10],
        [10, -5, 9, 5, -7, -1, 1, 6, 2, 9, 1, 5, 3, -4, 6, 3, -3, 2, -1],

        [-7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7],
        [-7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4],
        [-4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5],
        [-5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4],
        [-4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7],
        [7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5],
        [-5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10],
        [10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1, -6],
        [-6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10, 1],
        [1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3, 10],
        [10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6, 3],
        [3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7, -6],
        [-6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7, -7],
        [-7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9, -7],
        [-7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9, 9],
        [9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6, 9],
        [9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7, -6],
        [-6, 9, 9, -7, -7, -6, 3, 10, 1, -6, 10, -5, 7, -4, -5, -4, -7, -7],
    ];
})(window.app = window.app || {}, window, jQuery);