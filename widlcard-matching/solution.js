function isMatch(s, p) {
    var sLen = s.length;    // The length of the string
    var sIdx = 0;           // The current string position being compared
    var pLen = p.length;    // The length of the pattern
    var pIdx = 0;           // The current pattern position being processed
    var wild = false;       // Whether we've seen a wildcard '*'
    var wIdx = -1;          // The wildcard position in the pattern
    var wsIdx = -1;         // The wildcard position in the string

    // Since we need to match the entire string
    // ensure that we don't end until all string characters have been compared
    while (true) {
        // Loop through each character in the pattern
        while (pIdx < pLen) {
            var c = p[pIdx];

            if (c === '*') {
                // Save the most recent '*' position
                // Since the '*' sequence can be empty, we don't increment the string position
                wild = true;
                wIdx = pIdx;
                // Save the current string position where we see a wildcard for backtracking (if needed)
                wsIdx = sIdx;
            } else {
                if (sIdx >= sLen) {
                    // If we already exceeded the string length then
                    // this means that there are more characters in the pattern than
                    // the string, return not match
                    return false;
                }

                if (c === '?' || c == s[sIdx]) {
                    // Found '?' character or the characters are the same
                    // Increment string position.
                    sIdx++;
                } else {
                    // The characters are not the same.
                    if (!wild) {
                        // And since we didn't see a previous wildcard, then return not match.
                        return false;
                    } else {
                        // There was a previous wildcard so consider all characters previous
                        // to this point part of the wildcard.

                        // Reset the string position to the last wildcard plus one
                        // We can't skip because we might miss recurring patterns
                        sIdx = wsIdx++;

                        // Reset the pattern to the last wildcard and start matching again from there.
                        // Note: +1 is done below.
                        pIdx = wIdx;
                    }
                }
            }

            // Increment pattern position
            pIdx += 1;
        }
        // If we got here then we've match the entire pattern.

        // If there are still characters in the string and there was
        // a wildcard AND the wildcard wasn't the last character
        if (sIdx < sLen && wild && wIdx !== pLen - 1) {
            // Reset the string position to the last wildcard plus one
            // We can't skip because we might miss recurring patterns
            sIdx = wsIdx++;
            // Reset the pattern to the last wildcard and start matching again from there.
            pIdx = wIdx + 1;
        } else {
            break;
        }
    }

    // If the string position == the string length then we matched everything
    // or if there was a wildcard and it was the last character in the pattern
    // then consider that a match as well.
    return sLen === sIdx || (wild && wIdx === pLen - 1);
}
