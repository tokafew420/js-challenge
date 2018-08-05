module.exports = {
    /**
     * Get the stats from an array of run times.
     * @param {Array(number)} runtimes An array containing the run times.
     * @returns {object} A stats object containing, the max, min, sum, and avg of all run times.
     */
    getStat: function (runtimes) {
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
            avg: sum / len
        };
    }
}