# Spec Delta: teaching

## ADDED Requirements

### Requirement: Teaching tone is asked once and persisted

On the first session for a topic — after the mission is established and before the first lesson — the teacher SHALL ask the learner their preferred teaching tone/voice, offering a small set of presets plus a free-form option, and SHALL record the choice in the workspace `NOTES.md`. The teacher SHALL honor the recorded tone in every subsequent lesson, and SHALL NOT re-ask once a tone is recorded (though the learner MAY change it at any time).

#### Scenario: Tone asked before the first lesson

- **WHEN** a topic's mission is established and no tone is recorded in `NOTES.md`
- **THEN** the teacher SHALL ask the learner's preferred tone before producing the first lesson, and SHALL write the answer to `NOTES.md`

#### Scenario: Recorded tone is honored and not re-asked

- **WHEN** `NOTES.md` already records a teaching tone
- **THEN** the teacher SHALL apply that tone to new lessons and SHALL NOT ask again

#### Scenario: Learner changes the tone later

- **WHEN** the learner asks for a different tone in a later session
- **THEN** the teacher SHALL update the tone in `NOTES.md` and apply it going forward
