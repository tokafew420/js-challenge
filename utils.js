var fs = require("fs");
var path = require('path');
var process = require('process');
var vm = require("vm");

var utils = module.exports = {
    /**
     * Get the stats from an array of run times.
     * @param {Array(number)} runtimes An array containing the run times.
     * @returns {object} A stats object containing, the max, min, sum, and avg of all run times.
     */
    getStats: function (runtimes) {
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
            sun: sum,
            avg: sum / len,
            runs: len
        };
    },
    
    /**
     * Loads the solution file for this problem.
     * @param {string} filepath The path to the solution file
     * @returns {object}
     */
    loadSolution: function (filepath) {
        // Assuming test.js and solution.js are in the same dir
        solutionPath = filepath || path.join(process.mainModule.filename, '../solution.js');
        var context = {};
        var data = fs.readFileSync(solutionPath);

        // Include the solution from solution.js
        vm.runInNewContext(data, context, solutionPath);

        return context;
    },

    /**
     * Print the status to the console.
     * 
     * @param {object} stats The object containing the stats. Result from getStats()
     * @param {string} name Optional name of the stats.
     * @returns {object} this
     */
    printStats: function (stats, name) {
        name = name || '';
        console.log('%s => Runs: %s; Max: %sns; Min: %sns; Avg: %sns;', stats.runs, stats.max, stats.min, stats.avg);

        return utils;
    },

    /**
     *  Utility function to print stats and comparison.
     * 
     * @param {object} base The object containing the base stats.
     * @param {object} sln The object containing the solution stats.
     * @returns {object} this
     */
    printStatsCompare: function (base, sln) {
        console.log('Base => Max: ' + base.max + 'ns; Min: ' + base.min + 'ns; Avg: ' + base.avg + 'ns;');
        console.log('Solution => Max: ' + (sln.max < base.max ? '\x1b[32m' : '\x1b[31m') + sln.max +
            'ns\x1b[0m; Min: ' + (sln.min < base.min ? '\x1b[32m' : '\x1b[31m') + sln.min +
            'ns\x1b[0m; Avg: ' + (sln.avg < base.avg ? '\x1b[32m' : '\x1b[31m') + sln.avg + 'ns\x1b[0m;');

        var comparison = 'Comparison => Max: ';
        if (base.max <= sln.max) {
            comparison += '\x1b[31m' + (((sln.max - base.max) / base.max) * 100).toFixed(2) + '% slower\x1b[0m'
        } else {
            comparison += '\x1b[32m' + (((base.max - sln.max) / sln.max) * 100).toFixed(2) + '% faster\x1b[0m'
        }
        comparison += '; Min: ';
        if (base.min <= sln.min) {
            comparison += '\x1b[31m' + (((sln.min - base.min) / base.min) * 100).toFixed(2) + '% slower\x1b[0m'
        } else {
            comparison += '\x1b[32m' + (((base.min - sln.min) / sln.min) * 100).toFixed(2) + '% faster\x1b[0m'
        }
        comparison += '; Avg: ';
        if (base.avg <= sln.avg) {
            comparison += '\x1b[31m' + (((sln.avg - base.avg) / base.avg) * 100).toFixed(2) + '% slower\x1b[0m'
        } else {
            comparison += '\x1b[32m' + (((base.avg - sln.avg) / sln.avg) * 100).toFixed(2) + '% faster\x1b[0m'
        }

        console.log(comparison);
    }
}