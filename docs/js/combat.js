        /* =====================================================================
           combat.js — shared damage formulas (v4: "base + skill")
           Pure functions (no DOM, no game state). The single source of truth used
           by combat resolution, the AI, and the live card display — so the number
           on a card is exactly what it does. Loaded after config.js.

           Damage is intentionally trivial to do by hand:
             Strike      = card base + Striking  (+1 per prior strike this turn)
             Ground&Pound= card base + Grappling (+1 per prior strike this turn)
             Takedown    = card base + Grappling  (lands unless answered by a card)
             Submission  = card base (x0.6 if not from top) + Grappling
           There is NO Defense stat and NO stamina fatigue — the defender mitigates
           only by playing a reaction card.
           ===================================================================== */

        // Each prior strike this turn adds a flat step to the next strike.
        function comboBonus(priorStrikes) {
            return (priorStrikes || 0) * CONFIG.comboStrikeStep;
        }

        // Standup strikes scale with Striking; Ground & Pound (card.skill === 'grappling')
        // scales with Grappling. Intense Training adds a temporary Striking bonus.
        function calcStrikeDamage(card, atkState, defState) {
            const atk = atkState.activeFighter;
            if (!atk) return card.damage;
            const usesGrappling = card.skill === 'grappling';
            const skill = usesGrappling ? atk.grappling : atk.striking;
            const trainingBonus = usesGrappling ? 0 : (atk.strikingBonus || 0);
            // Accumulated leg damage (from the opponent's Leg Kicks) saps ALL of your strikes.
            const legDmg = (atk.status && atk.status.legDamage) || 0;
            const dmg = card.damage + skill + trainingBonus + comboBonus(atkState.comboStrikes) - legDmg;
            return Math.max(1, dmg);
        }

        // Submissions: from DOMINANT top control you add your Grappling (base + Grappling); off the
        // top (clinch / guard) a submission does its BASE damage only — that gap is grappling's reward
        // for getting on top. Armbar is the exception (adds Grappling from anywhere); Triangle gets a
        // flat guard bonus off your back.
        function calcSubmissionDamage(card, atkState, defState) {
            const atk = atkState.activeFighter;
            if (!atk) return card.damage;
            const fromTop = !!atkState.positionalAdvantage;
            const fromBottom = !!defState.positionalAdvantage; // opponent on top => I'm working off my back
            let dmg = card.damage;
            if (fromTop || card.addsGrapplingOffTop) dmg += atk.grappling; // Grappling only counts from the top
            if (card.guardBonus && fromBottom) dmg += card.guardBonus;     // Triangle: +2 off your back (guard)
            return Math.max(1, dmg);
        }

        // Takedowns are deterministic (they land unless a reaction stops them). Impact = base + Grappling.
        function calcTakedownImpact(card, atkState, defState) {
            const atk = atkState.activeFighter;
            if (!atk) return card.damage;
            return Math.max(card.damage, card.damage + atk.grappling);
        }

        // Position rules — the single source of truth for what a technique can do from where.
        // Five states: open standing (neutral), clinch, top, bottom (position is sticky).
        //   neutral: standup strikes, takedowns, enter the clinch
        //   clinch:  takedowns, flying ('any') submissions, stand up (break)
        //   top:     Ground & Pound, any submission (full), Stand Up
        //   bottom:  'any' submissions (60%), Stand Up, Reversal
        function isTechniquePositionLegal(card, meState, foeState) {
            const onTop = !!meState.positionalAdvantage;
            const onBottom = !!foeState.positionalAdvantage;
            const grounded = onTop || onBottom;
            const inClinch = !!meState.inClinch;
            // Teep "spacing": a fighter kept at range can't shoot or tie up this turn.
            if (meState.cantGrappleNextTurn && (card.subtype === 'grappling' || card.subtype === 'clinch')) return false;
            switch (card.subtype) {
                case 'strike':
                    if (card.strikeType === 'ground') return onTop;    // Ground & Pound: top control only
                    if (card.strikeType === 'upkick') return onBottom; // Upkick: from the bottom only
                    if (card.groundStrike) return onTop;               // Cutting Elbow: top control (for stagnation relief)
                    if (grounded) return false;                        // no standup strikes on the ground
                    if (inClinch) return !!card.clinchLegal;           // only short inside strikes (Uppercut/Elbow) in the clinch
                    return true;                                       // standup strikes: open standing
                case 'grappling':
                    return !grounded;                                // takedowns: from open standing or clinch (reversals handle bottom)
                case 'submission':
                    if (card.subPosition === 'dominant') return onTop; // Rear Naked Choke: top control only
                    if (card.subPosition === 'ground') return grounded; // Kimura / D'Arce: top or bottom, NOT the clinch
                    return inClinch || grounded;                     // 'any' (flying) subs: clinch, top, or bottom
                case 'clinch':
                    return !grounded && !inClinch;                   // tie up from open standing
                case 'escape':
                    if (card.escapeType === 'reversal') return onBottom; // sweep only from the bottom
                    return grounded || inClinch;                     // stand up from the ground or break the clinch
                case 'defense':
                    return false;                                    // reactions are not main-phase plays
                default:
                    return true;                                     // corner cards, etc.
            }
        }
