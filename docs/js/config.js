        /* =====================================================================
           config.js — tunable game constants (v4)
           One place to balance the game. Loaded first, before everything else.
           Numbers are kept small on purpose so the game is playable with a
           physical deck and a handful of tokens.
           ===================================================================== */
        const CONFIG = {
            // Energy economy — small numbers, but enough to chain a few cards for combos
            energyStart: 4,        // both players' fixed energy on turn 1
            energyGain: 2,         // gained at the start of each later turn
            energyMax: 10,         // cap

            // Hand / deck
            handLimit: 12,         // playable cards (techniques) — UI shows 2 rows of 6

            // Match — last of your fighters standing wins (no separate health pool)
            rosterSize: 3,         // fighters drawn into your roster at the start; lose when your last one is KO'd

            // Combat tuning  (skills are on a 1-5 scale; HP ~22-32 to match)
            comboStrikeStep: 1,            // each prior strike this turn adds +1 to the next strike
            // Submissions add Grappling only from dominant top control; off the top they do base only.

            // Subsystems (v4.2) — knockdowns + cardio, all token-trackable
            knockdownThreshold: 8,         // a CLEAN standup strike dealing >= this drops them (knockdown -> you take top)
            bodyShotEnergyDrain: 2,        // Body Shot saps this much opponent energy on a clean hit (cardio)
            takedownEnergyDrain: 1,        // a landed takedown saps this much opponent energy (the scramble)
            legDamagePerHit: 1,            // each clean Leg Kick stacks -1 to ALL the victim's strikes

            // Corner cards
            masterCoachBonus: 1,   // +1 Striking and +1 Grappling (permanent)
            intenseTrainingBonus: 2, // +2 Striking until next strike
            medicHeal: 6,          // HP restored by Ringside Medic
            secondWindEnergy: 4    // free energy granted by Second Wind
        };
