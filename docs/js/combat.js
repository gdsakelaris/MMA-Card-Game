        /* =====================================================================
           combat.js — shared damage formulas (v4: "base + skill")
           Pure functions (no DOM, no game state). The single source of truth used
           by combat resolution, the AI, and the live card display — so the number
           on a card is exactly what it does. Loaded after config.js.

           Damage is intentionally trivial to do by hand:
             Strike      = card base + Striking  (+1 per prior strike this turn)
             Ground&Pound= card base + Grappling (+1 per prior strike this turn)
             Takedown    = card base + Grappling  (lands unless answered by a card)
             Submission  = card base + Grappling from dominant top; off the top = base only
           There is NO Defense stat and NO stamina fatigue — the defender mitigates
           only by playing a reaction card.
           ===================================================================== */

        // Signature ability lookup — the ONE place fighter ability data is read. Returns the value
        // for `key` on this fighter's signature, or undefined if the fighter has no such ability.
        // (Safe on null/undefined fighters.)
        function sig(fighter, key) {
            return (fighter && fighter.signature) ? fighter.signature[key] : undefined;
        }

        // Each prior strike this turn adds a flat step to the next strike. Topuria's Combination
        // Boxing (comboStep) raises that step.
        function comboBonus(priorStrikes, fighter) {
            const step = sig(fighter, 'comboStep') || CONFIG.comboStrikeStep;
            return (priorStrikes || 0) * step;
        }

        // Standup strikes scale with Striking; Ground & Pound (card.skill === 'grappling')
        // scales with Grappling. Intense Training adds a temporary Striking bonus.
        function calcStrikeDamage(card, atkState, defState) {
            const atk = atkState.activeFighter;
            if (!atk) return card.damage;
            const def = defState && defState.activeFighter;
            const usesGrappling = card.skill === 'grappling';
            const skill = usesGrappling ? atk.grappling : atk.striking;
            const trainingBonus = usesGrappling ? 0 : (atk.strikingBonus || 0);
            // Accumulated leg damage (from the opponent's Leg Kicks) saps ALL of your strikes.
            const legDmg = (atk.status && atk.status.legDamage) || 0;
            // Gane's Footwork nullifies the attacker's combo bonus against him.
            const combo = sig(def, 'negatesCombo') ? 0 : comboBonus(atkState.comboStrikes, atk);
            // Signature strike bonuses: Aspinall's first strike of the turn, Volkanovski hurt-and-dangerous,
            // Ankalaev's Cage Pressure (clinch strikes only).
            let bonus = 0;
            if (sig(atk, 'firstStrikeBonus') && (atkState.comboStrikes || 0) === 0) bonus += sig(atk, 'firstStrikeBonus');
            if (sig(atk, 'strikeBonusWhenHurt') && atk.hp <= atk.maxHp / 2) bonus += sig(atk, 'strikeBonusWhenHurt');
            if (sig(atk, 'clinchStrikeBonus') && atkState.inClinch) bonus += sig(atk, 'clinchStrikeBonus');
            // Strickland's Philly Shell softens every strike he eats.
            const reduction = sig(def, 'incomingStrikeReduction') || 0;
            // Fighter STYLE trait in the damage math: a BALANCED fighter deals +2 inside the clinch
            // (In the Pocket — the transition zone is their home). The Striker's Sprawl-and-Brawl and the
            // Grappler's relentless takedowns are NOT damage effects — they live in the takedown resolution
            // and in actionEnergyCost (cheaper Stand Up / cheaper takedowns), not here.
            let styleAdj = 0;
            if (atk.style === 'Balanced' && atkState.inClinch && !usesGrappling) styleAdj += 2;
            const dmg = card.damage + skill + trainingBonus + combo + bonus - legDmg - reduction + styleAdj;
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
            dmg += sig(atk, 'subBonusAnywhere') || 0;                      // Oliveira: +2 from any position
            return Math.max(1, dmg);
        }

        // Takedowns are deterministic (they land unless a reaction stops them). Impact = base + Grappling.
        function calcTakedownImpact(card, atkState, defState) {
            const atk = atkState.activeFighter;
            if (!atk) return card.damage;
            const bonus = sig(atk, 'takedownImpactBonus') || 0; // Arman: explosive shots
            return Math.max(card.damage, card.damage + atk.grappling + bonus);
        }

        // Position rules — the single source of truth for what a technique can do from where.
        // Five states: open standing (neutral), clinch, top, bottom (position is sticky).
        //   neutral: standup strikes, takedowns, enter the clinch
        //   clinch:  takedowns, flying ('any') submissions, stand up (break)
        //   top:     Ground & Pound, any submission (full), Stand Up
        //   bottom:  'any' submissions (base only), Stand Up, Reversal
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
                    if (onTop) return !!card.groundStrike;             // from top, only ground-legal standup strikes (Cutting Elbow)
                    if (onBottom) return false;                        // no standup strikes off your back (use Upkick)
                    if (inClinch) return !!card.clinchLegal;           // only short inside strikes (Uppercut/Elbow) in the clinch
                    return true;                                       // standup strikes: open standing (neutral)
                case 'grappling':
                    return !grounded;                                // takedowns: from open standing or clinch (reversals handle bottom)
                case 'submission':
                    // Belal's Smothering Top: a fighter under his control can't work submissions off their back.
                    if (onBottom && sig(foeState.activeFighter, 'blockBottomSubs')) return false;
                    if (card.subPosition === 'dominant') return onTop; // Rear Naked Choke: top control only
                    if (card.subPosition === 'ground') return grounded; // Kimura / D'Arce: top or bottom, NOT the clinch
                    return inClinch || grounded;                     // 'any' (flying) subs: clinch, top, or bottom
                case 'clinch':
                    return !grounded && !inClinch;                   // tie up from open standing
                case 'escape':
                    if (card.escapeType === 'reversal') return onBottom; // sweep only from the bottom
                    if (onTop) return false;                         // on top you stand up for FREE (the button) — the card would just waste a card + 2 energy
                    return onBottom || inClinch;                     // Stand Up: escape the bottom or break the clinch
                case 'defense':
                    return false;                                    // reactions are not main-phase plays
                default:
                    return true;                                     // corner cards, etc.
            }
        }

        // The energy a card actually costs to play right now. Usually just card.energy, but two STYLE
        // traits discount it: a Striker's Sprawl-and-Brawl makes the Stand Up escape cost 1 less (they
        // scramble back to their feet), and a Grappler's Relentless Takedowns make takedowns cost 1 less
        // (cheap, repeatable level changes). Pure; routed through every cost check (play, affordability,
        // the AI, and the live card badge) so the printed cost always equals what's charged. A discounted
        // card floors at 1; 0-cost cards (Second Wind, reactions) never match a discount, so they stay 0.
        function actionEnergyCost(card, meState) {
            const cost = card.energy || 0;
            const me = meState && meState.activeFighter;
            if (!me) return cost;
            let discount = 0;
            if (me.style === 'Striker' && card.subtype === 'escape' && card.escapeType === 'standup') discount = 1;
            if (me.style === 'Grappler' && card.subtype === 'grappling') discount = 1; // takedowns
            return discount ? Math.max(1, cost - discount) : cost;
        }
