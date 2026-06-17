        /* =====================================================================
           reactions.js — the reaction window (player + AI defensive responses)
           Data-driven by each card's `mitigation` field:
             reduce  -> subtract `reduction` from the strike
             negate  -> fully prevent the attack (no damage)
             reverse -> Counter Takedown: defender takes top control instead
           Strike defenses: Block (reduce), Parry (negate), Slip (negate+counter),
             Check Kick (negate a KICK + counter).
           Takedown defenses: Stuff (negate), Sprawl (negate+counter), Counter
             Takedown (reverse).
           Submission defense: Submission Defense (negate).
           Loaded after combat.js, before game.js.
           ===================================================================== */

        let pendingReaction = null;

        // Can this reaction card answer this specific incoming attack?
        // (Check Kick only answers kicks — you can't check a punch.)
        function canReactTo(reactionCard, incoming) {
            if (reactionCard.subtype !== 'defense') return false;
            if (!(reactionCard.reactsTo || []).includes(incoming.subtype)) return false;
            if (reactionCard.reactsToStrikeType && incoming.strikeType !== reactionCard.reactsToStrikeType) return false;
            return true;
        }

        function affordableReactions(defenderState, incoming) {
            return defenderState.hand.filter(c => c.energy <= defenderState.energy && canReactTo(c, incoming));
        }

        // Decide whether the AI (as defender) answers an incoming attack. Instant, no UI.
        function aiDecideReaction(card, attackerState, defenderState) {
            if (gameState.difficulty === 'easy') return null;
            const atk = attackerState.activeFighter, def = defenderState.activeFighter;
            if (!atk || !def) return null;
            const hard = gameState.difficulty === 'hard' || gameState.difficulty === 'nightmare';

            const options = affordableReactions(defenderState, card);
            if (!options.length) return null;

            // Takedowns are deterministic — being put on bottom is bad, so defend the shot.
            if (card.subtype === 'grappling') {
                if (!hard && atk.grappling < 4) return null; // medium only bothers vs real wrestlers
                const reverse = options.find(c => c.mitigation === 'reverse');
                if (reverse && def.grappling >= atk.grappling) return reverse; // grapplers steal top
                const negates = options.filter(c => c.mitigation === 'negate');
                if (negates.length) {
                    negates.sort((a, b) => (a.energy - b.energy) || ((b.counter || 0) - (a.counter || 0)));
                    return negates[0];
                }
                return reverse || options[0];
            }

            // A flying submission thrown from the clinch isn't just about its (base-only) damage:
            // if it LANDS the attacker rides it down into top control, but if we DEFEND it we sweep
            // them under and take top ourselves. That positional swing is worth a free Submission
            // Defense even when the raw damage is low — so answer it whenever we hold the free negate.
            if (card.subtype === 'submission'
                && attackerState.inClinch && !attackerState.positionalAdvantage && !defenderState.positionalAdvantage) {
                const negate = options.find(c => c.mitigation === 'negate' && c.energy <= defenderState.energy);
                if (negate) return negate;
            }

            // Strike / submission: weigh the incoming damage.
            const incoming = card.subtype === 'submission'
                ? calcSubmissionDamage(card, attackerState, defenderState)
                : calcStrikeDamage(card, attackerState, defenderState);
            const lethal = incoming >= def.hp;
            const big = incoming >= Math.max(4, def.maxHp * 0.25);
            if (!lethal && !big) return null;
            if (!hard && !lethal && incoming < def.maxHp * 0.35) return null;

            // How much does each option actually stop? negate = all, reduce = its reduction
            // (but a Block can't soften a Power Cross — ignoresReduce makes reduce worthless).
            const stopped = c => (c.mitigation === 'negate' ? incoming : (card.ignoresReduce ? 0 : (c.reduction || 0)));
            if (lethal || incoming >= def.maxHp * 0.4) {
                // Big threat: stop the most damage (ties: cheaper, then more counter).
                options.sort((a, b) => stopped(b) - stopped(a) || (a.energy - b.energy) || ((b.counter || 0) - (a.counter || 0)));
                return options[0];
            }
            // Medium: spend economically — cheapest card that still helps.
            options.sort((a, b) => (a.energy - b.energy) || (stopped(b) - stopped(a)));
            return options[0];
        }

        // Open a reaction window before a strike / submission / takedown resolves.
        // For the AI defender it resolves instantly; for the human it pauses for input.
        function openReactionWindow(card, attackerPlayer, attacker, defender, continuation) {
            const defenderSide = attackerPlayer === 'player' ? 'opponent' : 'player';

            if (defenderSide === 'opponent') {
                const reaction = aiDecideReaction(card, attacker, defender);
                if (reaction) applyReactionCard(reaction, defender, defenderSide, card);
                continuation();
                return;
            }

            const options = affordableReactions(defender, card);
            if (options.length === 0) {
                continuation();
                return;
            }

            gameState.awaitingReaction = true;
            pendingReaction = { defender, defenderSide, continuation, incoming: card };
            showReactionModal(card, attacker, options);
        }

        function applyReactionCard(reactionCard, defender, defenderSide, incoming) {
            defender.energy -= reactionCard.energy;
            defender.hand = defender.hand.filter(c => c.uniqueId !== reactionCard.uniqueId);

            if ((reactionCard.reactsTo || []).includes('grappling')) {
                // Takedown reaction — resolved in the grappling branch.
                defender.takedownReaction = { mitigation: reactionCard.mitigation, counter: reactionCard.counter || 0, name: reactionCard.name };
            } else {
                // Strike / submission reaction.
                defender.defenseBuff = {
                    mitigation: reactionCard.mitigation,         // 'reduce' | 'negate'
                    reduction: reactionCard.reduction || 0,
                    counter: reactionCard.counter || 0,
                    name: reactionCard.name
                };
            }
            showAction(`${reactionCard.name}!`, defenderSide, 'advantage', 'card-defense');
        }

        // Short human-readable summary of what a reaction does (for the modal).
        function reactionSummary(c) {
            if (c.mitigation === 'reverse') return 'Reverse — take top control';
            if (c.mitigation === 'negate') return c.counter ? `Negate + counter ${c.counter}` : 'Negate completely';
            return c.counter ? `Reduce ${c.reduction} + counter ${c.counter}` : `Reduce by ${c.reduction}`;
        }

        function showReactionModal(card, attacker, options) {
            const modal = document.getElementById('reactionModal');
            const title = document.getElementById('reactionTitle');
            const grid = document.getElementById('reactionGrid');
            title.textContent = `⚡ ${attacker.activeFighter.name} throws ${card.name}!`;
            grid.innerHTML = '';
            options.forEach(c => {
                const el = document.createElement('div');
                el.className = 'select-card';
                el.innerHTML = `
                    <div class="card-energy">${c.energy}</div>
                    <div class="card-header">${c.name}</div>
                    <div class="card-type">⚡ Reaction</div>
                    <div class="card-ability">${reactionSummary(c)}</div>
                `;
                el.onclick = () => resolvePlayerReaction(c.uniqueId);
                grid.appendChild(el);
            });
            document.getElementById('reactionTakeBtn').onclick = () => resolvePlayerReaction(null);
            modal.classList.add('active');
        }

        function resolvePlayerReaction(uniqueId) {
            document.getElementById('reactionModal').classList.remove('active');
            const pending = pendingReaction;
            pendingReaction = null;
            gameState.awaitingReaction = false;
            if (!pending) return;
            if (uniqueId) {
                const card = pending.defender.hand.find(c => c.uniqueId === uniqueId);
                if (card) applyReactionCard(card, pending.defender, pending.defenderSide, pending.incoming);
            }
            updateUI();
            pending.continuation();
        }
