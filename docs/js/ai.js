/* =====================================================================
   ai.js — opponent AI decision engine (offensive scoring + difficulty)
   Depends on combat.js formulas and the global gameState (both at
   call time). Loaded after combat.js, before game.js.
   ===================================================================== */

        // ===== AI DECISION ENGINE (Smart AI) =====

        // Nightmare difficulty: opponent fighters get +1 to all combat stats on deploy.
        function applyDifficultyBoost(fighter) {
            if (gameState.difficulty === 'nightmare' && fighter && !fighter._boosted) {
                fighter.striking += 1;
                fighter.grappling += 1;
                fighter._boosted = true;
            }
        }

        // Is this card legally playable by the AI right now? (energy + fighters + position rules)
        function aiCanPlay(card, me, foe) {
            if (actionEnergyCost(card, me) > me.energy) return false;
            if (card.type === 'corner') return true;
            if (card.type !== 'technique') return false;
            if (card.subtype === 'defense') return false; // reaction-only, never played proactively
            if (!foe.activeFighter) return false;
            return isTechniquePositionLegal(card, me, foe);
        }

        // Score how valuable playing this card is right now. Higher = better.
        function aiScoreAction(card, me, foe) {
            const atk = me.activeFighter, def = foe.activeFighter;

            if (card.type === 'corner') {
                if (card.id === 'corner_medic') {
                    const missing = atk.maxHp - atk.hp;
                    if (missing <= 0) return -1;
                    const heal = Math.min(CONFIG.medicHeal, missing);
                    const pct = atk.hp / atk.maxHp;
                    return heal * (pct < 0.4 ? 2.2 : (pct < 0.7 ? 1.0 : 0.3));
                }
                if (card.id === 'corner_training') {
                    // Only worth it if a strike can follow this turn with the leftover energy.
                    const canFollow = me.hand.some(c => c.subtype === 'strike' && c.id !== 'tech_gnp' && (c.energy + card.energy) <= me.energy);
                    return canFollow ? 5 : -1;
                }
                if (card.id === 'corner_coach') {
                    return gameState.turn < 8 ? 6 : 4; // permanent value, better earlier
                }
                if (card.id === 'corner_energy') {
                    // Worthwhile only if there's room to gain AND a card worth the fresh energy.
                    const room = me.maxEnergy - me.energy;
                    if (room <= 1) return -1;
                    const wantsMore = me.hand.some(c => (c.type === 'technique' || c.type === 'corner') && c.id !== 'corner_energy' && c.energy > me.energy && c.energy <= me.energy + CONFIG.secondWindEnergy);
                    return wantsMore ? 7 : (me.energy <= 2 ? 4 : -1);
                }
                return 1;
            }

            if (card.subtype === 'strike') {
                if (card.id === 'tech_gnp') {
                    if (!me.positionalAdvantage) return -1;
                    const dmg = calcStrikeDamage(card, me, foe);
                    return dmg + 2 + (dmg >= def.hp ? 100 : 0); // +2 for keeping top control
                }
                if (card.strikeType === 'upkick') {
                    if (!foe.positionalAdvantage) return -1; // only legal off the bottom
                    const dmg = calcStrikeDamage(card, me, foe);
                    return dmg + 3 + (dmg >= def.hp ? 100 : 0); // damage + escaping the bottom back to neutral
                }
                // standup strikes are legal from neutral (a few short ones also in the clinch) —
                // never from the ground here, so the neutral/clinch damage math applies
                const dmg = calcStrikeDamage(card, me, foe);
                let s = dmg;
                if (card.id === 'tech_spinning') s += 4; // stagger skips their turn
                if (card.id === 'tech_elbow') s += 3;    // bleed
                // Knockdown: a clean 8+ POWER strike hands us top control + a ground follow-up.
                // Gate on the shot's OWN power (base + Striking, minus the combo bonus) — the same
                // value the real knockdown rule uses, so the AI doesn't over-credit a combo-padded hit.
                const knockdownPower = dmg - comboBonus(me.comboStrikes, me.activeFighter);
                const kThreshold = sig(me.activeFighter, 'knockdownThreshold') || CONFIG.knockdownThreshold;
                if (card.canKnockdown && knockdownPower >= kThreshold && !me.positionalAdvantage && !foe.positionalAdvantage && !sig(def, 'cannotBeKnockedDown')) s += 6;
                if (card.energyDrain) s += Math.min(card.energyDrain, foe.energy); // body shot denies their reactions
                if (card.onHitStatus && card.onHitStatus.type === 'legDamage') s += 2; // compounding leg damage
                if (card.onHitSpacing && def.grappling >= 4) s += 3;  // teep shuts down a wrestler's shot
                if (dmg >= def.hp) s += 100;        // lethal finish
                return s;
            }

            if (card.subtype === 'grappling') {
                if (me.positionalAdvantage) return -1; // already on top
                const impact = calcTakedownImpact(card, me, foe);
                // Deterministic takedown: value the impact + the follow-up it unlocks (submission /
                // GnP) + the control/tempo of putting them down (sticky — they must spend a turn up).
                let followValue = 0;
                me.hand.forEach(c => {
                    if (c.subtype === 'submission') followValue = Math.max(followValue, calcSubmissionDamage(c, me, foe));
                });
                if (me.hand.some(c => c.id === 'tech_gnp')) followValue = Math.max(followValue, 6);
                return impact + 3 + followValue * 0.7 + (impact >= def.hp ? 100 : 0);
            }

            if (card.subtype === 'submission') {
                const dmg = calcSubmissionDamage(card, me, foe);
                return dmg + (me.positionalAdvantage ? 4 : 0) + (dmg >= def.hp ? 100 : 0);
            }

            if (card.subtype === 'escape') {
                const onBottom = foe.positionalAdvantage, onTop = me.positionalAdvantage;
                // What could I do after each kind of escape?
                let bestStrike = 0, groundOffense = 0;
                me.hand.forEach(c => {
                    if (c.subtype === 'strike' && c.id !== 'tech_gnp') bestStrike = Math.max(bestStrike, c.damage + atk.striking);
                    if (c.subtype === 'submission') groundOffense = Math.max(groundOffense, calcSubmissionDamage(c, me, foe));
                });
                if (me.hand.some(c => c.id === 'tech_gnp')) groundOffense = Math.max(groundOffense, 6);

                if (card.escapeType === 'reversal') {
                    if (!onBottom) return -1;
                    // Sweep to top only really pays off if I have a ground attack to follow with.
                    return groundOffense > 0 ? 6 + groundOffense * 0.6 : 2;
                }
                // Stand Up
                if (onBottom) return 5 + bestStrike * 0.3;          // escape to striking range
                if (onTop) return -1;                                // never spend the card from top — freeStandUp() is free
                if (me.inClinch) return bestStrike > 0 ? 3 + bestStrike * 0.2 : 1;  // break the clinch to strike
                return -1; // not grounded
            }

            if (card.subtype === 'clinch') {
                if (me.inClinch || me.positionalAdvantage || foe.positionalAdvantage) return -1;
                // Tie up mainly to threaten a flying submission.
                let flyingSub = 0;
                me.hand.forEach(c => {
                    if (c.subtype === 'submission' && c.subPosition !== 'dominant') {
                        flyingSub = Math.max(flyingSub, calcSubmissionDamage(c, me, foe));
                    }
                });
                return flyingSub > 0 ? 4 + flyingSub * 0.5 : -1;
            }

            if (card.subtype === 'defense') {
                // Reactions are never played proactively (handled by aiCanPlay), kept as a guard.
                return -1;
            }
            return 0;
        }

        // Should the AI tag in a fresh fighter? Only when the active one is badly hurt (<35% HP) AND a
        // benched teammate is clearly healthier (>= half HP and at least 8 HP more) — switching costs the
        // whole turn, so it's a deliberate retreat, not a reflex. Returns the fighter to bring in, or null.
        // (canSwitch enforces the neutral-only / has-bench gating; defined in game.js, in scope here.)
        function aiShouldSwitch(me, foe) {
            if (!canSwitch('opponent')) return null;
            const cur = me.activeFighter;
            if (!cur || cur.hp > cur.maxHp * 0.35) return null;
            let best = null;
            me.roster.forEach(f => {
                if (f.hp >= f.maxHp * 0.5 && f.hp >= cur.hp + 8 && (!best || f.hp > best.hp)) best = f;
            });
            return best;
        }

        // Choose the single best action, or null to end the turn.
        // `reserve` keeps energy banked for reactions; lethal plays (score >= 100) ignore it.
        function aiChooseAction(me, foe, reserve) {
            reserve = reserve || 0;
            const ranked = me.hand
                .filter(c => (c.type === 'corner' || c.type === 'technique') && aiCanPlay(c, me, foe))
                .map(c => ({ card: c, score: aiScoreAction(c, me, foe) }))
                .filter(x => x.score > 0)
                .filter(x => x.score >= 100 || actionEnergyCost(x.card, me) <= me.energy - reserve)
                .sort((a, b) => b.score - a.score);
            return ranked.length ? ranked[0] : null;
        }
