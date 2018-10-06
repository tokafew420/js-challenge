function solution(nums) {
    var len = nums.length;
    var i = 0;
    var dir; // Direction: 0 = forward; 1 = backward;
    var marker; // Use to mark current path
    var cur; // Current value
    var curIdx; // Current index
    var next; // Next value
    var nextIdx; // Next index

    while (i < len) {
        cur = nums[i];

        if (typeof cur === 'string') {
            // Node already visited, move on to next  
            i++;
            continue;
        }

        // Set current index
        curIdx = i;
        // Create new unique marker for path
        marker = '' + i++;
        // Get starting direction
        dir = cur > 0 ? 0 : 1;

        while (true) {
            // Mark as visited
            nums[curIdx] = marker;

            // Get next element index
            nextIdx = mod(cur + curIdx, len);

            if (nextIdx === curIdx) break; // Found self loop.

            next = nums[nextIdx];

            if (next === marker) {
                // Found loop
                return true;
            }

            // Hit previously traveled path
            if (typeof next === 'string') {
                break;
            }

            if ((dir === 0 && next < 0) ||
                (dir === 1 && next > 0)) {
                // Switch direction
                break;
            }

            cur = next;
            curIdx = nextIdx;
        }
    }

    // Went through the whole array and found no loop
    return false;
};

// Get n mod m
function mod(n, m) {
    return ((n % m) + m) % m;
}
