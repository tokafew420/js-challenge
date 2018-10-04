var utils = require('../utils.js');

var context = utils.loadSolution();
var isMatch = context.isMatch;

// This is the base method that we will use to compare run times.
function isMatchRegex(s, p) {
    var i = new RegExp("^" + p.replace(/\?/g, '.').replace(/\*/g, '.*') + "$");
    return i.test(s);
}

var correctCt = 0;
var wrongCt = 0;
var baseAverages = [];
var slnAverages = [];

// This will run both the base function and the solution and compare the results.
function test(s, p) {
    const NS_PER_SEC = 1e9;
    var baseTimes = [];
    var solutionTimes = [];
    var iteration = 100;
    var i = 0;
    var t0, t1;

    var r0 = isMatchRegex(s, p);
    var r1 = isMatch(s, p);

    // If the results do not match then don't even bother doing a run time comparison.
    if (r0 === r1) {
        // Run base function to get runtimes
        for (; i < iteration; i++) {
            t0 = process.hrtime();
            isMatchRegex(s, p);
            t1 = process.hrtime(t0);
            baseTimes.push(t1[0] * NS_PER_SEC + t1[1]);
        }

        // Run solution function to get runtimes
        i = 0;
        for (; i < iteration; i++) {
            t0 = process.hrtime();
            isMatch(s, p);
            t1 = process.hrtime(t0);
            solutionTimes.push(t1[0] * NS_PER_SEC + t1[1]);
        }
    }

    // Print result
    console.log('String: ' + s + '; Pattern: ' + p);
    console.log('Regex: ' + r0 + '; Solution: ' + r1);
    if (r0 === r1) {
        correctCt++;
        console.log('\x1b[32mCorrect!!\x1b[0m');

        // Get stats then print comparison
        var baseStat = utils.getStats(baseTimes);
        var slnStat = utils.getStats(solutionTimes);

        // Save averages for summary
        baseAverages.push(baseStat.avg);
        slnAverages.push(slnStat.avg);

        utils.printStatsCompare(baseStat, slnStat);
    } else {
        wrongCt++;
        console.log('\x1b[31mWrong :(\x1b[0m');
    }
    console.log();
}

/**********
* Test scenarios from problem examples
***********/
test('aa', 'a');
test('aa', '*');
test('cb', '?a');
test('adceb', '*a*b');
test('acdcb', 'a*c?b');

/**********
* Test other different scenarios
***********/
test('', '');
test('', 'a');
test('', '?');
test('', '*');
test('a', '');
test('a', 'a');
test('a', 'b');
test('a', '?');
test('a', '*');
test('a', 'aa');
test('a', 'ab');
test('a', 'ba');
test('a', 'a?');
test('a', '?a');
test('a', '?b');
test('a', 'b?');
test('a', 'a*');
test('a', '*a');
test('a', 'b*');
test('a', '*b');
test('a', '??');
test('a', '*?');
test('a', '?*');
test('a', '**');
test('aa', '');
test('aa', 'b');
test('aa', '?');
test('aa', 'aa');
test('aa', 'aaa');
test('aa', 'ab');
test('aa', 'aab');
test('aa', 'ba');
test('aa', 'baa');
test('aa', '?aa');
test('aa', 'aa?');
test('aa', 'a?a');
test('aa', 'a?b');
test('aa', 'b?a');
test('aa', 'a??');
test('aa', '??a');
test('aa', '??b');
test('aa', 'b??');
test('aa', 'a*');
test('aa', '*a');
test('aa', 'b*');
test('aa', '*b');
test('aa', 'ab*');
test('aa', 'b*a');
test('aa', 'b*b');
test('aa', '*a*');
test('aa', '*b*');
test('aa', '??');
test('aa', '*?');
test('aa', '?*');
test('aa', '**');
test('aa', '*??');
test('aa', '??*');
test('aa', '?*?');
test('aa', '?*??');
test('aa', '*?*?*');
test('ab', '');
test('ab', 'b');
test('ab', '?');
test('ab', 'aa');
test('ab', 'aaa');
test('ab', 'ab');
test('ab', 'aab');
test('ab', 'ba');
test('ab', 'baa');
test('ab', '?aa');
test('ab', 'aa?');
test('ab', 'a?a');
test('ab', 'a?b');
test('ab', 'b?a');
test('ab', 'a??');
test('ab', '??a');
test('ab', '??b');
test('ab', 'b??');
test('ab', 'a*');
test('ab', '*a');
test('ab', 'b*');
test('ab', '*b');
test('ab', 'ab*');
test('ab', 'b*a');
test('ab', 'b*b');
test('ab', '*a*');
test('ab', '*b*');
test('ab', '??');
test('ab', '*?');
test('ab', '?*');
test('ab', '**');
test('ab', '*??');
test('ab', '??*');
test('ab', '?*?');
test('ab', '?*??');
test('ab', '*?*?*');
test('xabcabcz', 'x*abcz');
test('xabcabcz', 'x*a?cz');
test('xabcxaabbcz', 'x*abcz');
test('xabcabcz', 'x*abcz');
test('xabcabcz', 'x*?bcz');
test('xabcabcz', 'x*ab?z');
test('xabcabcz', 'x*abc?');
test('xabcabca', 'x*ab?a');
test('xababba', 'x*abba');
test('xabcabcz', 'x*ab*z');
test('abababababababab', '*abab');
test('ababababababababa', '*abab');
test('babababababababab', '*abab');
test('ababababababababab', '*abab');
test('abababababababababa', '*abab');
test('bababababababababab', '*abab');
test('abababacdcdcdcdcefefefe', '*ab*cd*ce*');
test('abcdefg', 'abcd*?g');
test('xabcabcdabcdeabcdfabcdefg', 'x*a?????g*?');
test('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', '*a*b*c*?*?*?*?*?g*?');
test('abcabcd', '?b?');
test('abcabcd', '??b??');
test('abcabcd', '?b??b?');
test('abcabcd', '*b?c?');
test('abcabcd', '*?b?c');
test('abcabcd', 'ac?*?bc');
test('adceb', '?*');
test('acdcb', 'a*c?b');
test('acdcb', 'a*c?*b');
test('abcdefgabcdz', 'a*abcdz');
test('xabcdabcd', 'x*abcd');


console.log('============ Summary =============');
console.log('Passed: ' + correctCt);
console.log('Failed: ' + wrongCt);
// Get stats then print comparison
var baseAvgStat = utils.getStats(baseAverages);
var slnAvgStat = utils.getStats(slnAverages);

utils.printStatsCompare(baseAvgStat, slnAvgStat);
