# First-digit triage is solid; 401 vs 403 remains unstable

Bruno reliably triages by status class — given an unfamiliar code (422, 503) he correctly maps first digit → whose side to debug. The 502/504 and 301/302 pairs landed after one re-explanation (receptionist model; moving-house model). But 401 vs 403 survived three different mental models ("question vs verdict", bouncer-style, and the two-step authn→authz pipeline) only halfway: he now maps *credentials problems → 401* correctly, yet still answers 401 for *permission* failures (valid user without the required role → answered 401, is 403).

**Evidence**: lesson-0001 quiz 3/5; rechecks: 502 ✓, 301 ✓, expired-key→401 ✓, missing-role→403 ✗ (twice, across two question framings).

**Implications**: next session should attack 401/403 from the authorization side first (start from a 403 scenario, e.g. role-based access in an API he maintains), not from definitions. Under the no-gate card policy adopted the same day, the 401/403 pair was carded anyway (note IDs 1781312321730–31) — expect lapses on those two cards; treat them as the signal to re-teach, per the leech loop. All lesson-0001 cards are in [[ANKI.md]] provenance.
