        // Game State
        const HAND_LIMIT = CONFIG.handLimit;
        const gameState = {
            turn: 1,
            currentPlayer: 'player',
            phase: 'setup',
            difficulty: 'hard', // easy | medium | hard | nightmare
            gameOver: false,
            awaitingReaction: false,
            player: {
                energy: 0,
                maxEnergy: CONFIG.energyMax,
                deck: [],          // technique + corner cards only
                fighterDeck: [],   // shuffled fighter pile
                roster: [],        // your drawn fighters ("player cards") — own zone, not the hand
                hand: [],          // playable cards (techniques/corners), max 12
                activeFighter: null,
                positionalAdvantage: false,
                inClinch: false,
                cantGrappleNextTurn: false,
                comboStrikes: 0,
                comboGrapples: 0
            },
            opponent: {
                energy: 0,
                maxEnergy: CONFIG.energyMax,
                deck: [],
                fighterDeck: [],
                roster: [],
                hand: [],
                activeFighter: null,
                positionalAdvantage: false,
                inClinch: false,
                comboStrikes: 0,
                comboGrapples: 0
            }
        };

        // Initialize game
        function initGame() {
            buildDeck('player');
            buildDeck('opponent');
            shuffleDeck('player');
            shuffleDeck('opponent');

            // Each player draws their roster of fighters ("player cards") and an opening hand.
            drawRoster('player', CONFIG.rosterSize);
            drawRoster('opponent', CONFIG.rosterSize);
            drawOpeningHand('player');
            drawOpeningHand('opponent');

            // Opponent auto-deploys its best fighter from its roster.
            const opponentFighter = pickBestFighter(gameState.opponent.roster);
            if (opponentFighter) {
                deployFighter('opponent', opponentFighter.uniqueId, true);
                gameState.opponent.energy = CONFIG.energyStart; // show starting energy upfront
                updateUI();
            }

            // Player chooses which of their 3 roster fighters to deploy.
            promptOpeningFighterSelection();
        }

        function drawOpeningHand(player) {
            gameState[player].hand = [];
            for (let i = 0; i < 6 && gameState[player].deck.length > 0; i++) {
                gameState[player].hand.push(gameState[player].deck.pop());
            }
        }

        // Move a fighter from a player's roster into the active slot.
        function deployFighter(player, uniqueId, isAuto) {
            const f = gameState[player].roster.find(c => c.uniqueId === uniqueId);
            if (!f) return false;
            if (typeof f.strikingBonus === 'undefined') f.strikingBonus = 0;
            applyDifficultyBoost(f);
            gameState[player].activeFighter = f;
            gameState[player].roster = gameState[player].roster.filter(c => c.uniqueId !== uniqueId);
            addLog(`${player === 'player' ? 'You deploy' : 'Opponent deploys'} ${f.name} to the arena!`, player, '', 'card-fighter');
            return true;
        }

        // Player clicks a roster fighter to deploy it (only when no active fighter).
        function deployFromRoster(uniqueId) {
            if (gameState.currentPlayer !== 'player' || gameState.player.activeFighter) return;
            if (deployFighter('player', uniqueId)) {
                updateUI();
                maybeAutoEndTurn();
            }
        }

        function pickBestFighter(hand) {
            const fighters = hand.filter(c => c.type === 'fighter');
            if (fighters.length === 0) return null;
            return fighters.reduce((best, cur) => {
                const score = cur.striking + cur.grappling + cur.hp / 10;
                const bestScore = best.striking + best.grappling + best.hp / 10;
                return score > bestScore ? cur : best;
            }, fighters[0]);
        }

        // Shared modal: pick one fighter from the player's roster.
        function showFighterChoiceModal(onPick) {
            const modal = document.getElementById('selectFighterModal');
            const grid = document.getElementById('selectFighterGrid');
            grid.innerHTML = '';
            gameState.player.roster.forEach(f => {
                const el = document.createElement('div');
                el.className = 'select-card';
                el.innerHTML = `
                    <div class="card-header">${f.name}</div>
                    <div class="card-type">${f.style}</div>
                    <div class="card-stats">
                        <div class="card-stat"><span class="card-stat-label">Striking:</span><span class="card-stat-value">${f.striking}</span></div>
                        <div class="card-stat"><span class="card-stat-label">Grappling:</span><span class="card-stat-value">${f.grappling}</span></div>
                        <div class="card-stat"><span class="card-stat-label">HP:</span><span class="card-stat-value">${f.hp}/${f.maxHp}</span></div>
                    </div>
                `;
                el.onclick = () => onPick(f.uniqueId);
                grid.appendChild(el);
            });
            modal.classList.add('active');
        }

        function promptOpeningFighterSelection() {
            const roster = gameState.player.roster;
            if (roster.length === 0) { startAfterOpeningSelection(); return; }
            if (roster.length === 1) {
                deployFighter('player', roster[0].uniqueId);
                startAfterOpeningSelection();
                return;
            }
            showFighterChoiceModal(selectOpeningFighter);
        }

        function closeFighterSelect() {
            document.getElementById('selectFighterModal').classList.remove('active');
        }

        function selectOpeningFighter(uniqueId) {
            if (!deployFighter('player', uniqueId)) return;
            closeFighterSelect();
            startAfterOpeningSelection();
        }

        function promptReplacementFighterSelection() {
            if (gameState.player.roster.length === 0) {
                addLog('You have no fighters left in your roster!', 'player');
                updateUI();
                setTimeout(() => endGame('opponent', 'No fighters left'), 1000);
                return;
            }
            updateUI();
            showFighterChoiceModal(selectReplacementFighter);
        }

        function selectReplacementFighter(uniqueId) {
            if (!deployFighter('player', uniqueId)) return;
            closeFighterSelect();
            updateUI();
        }

        function startAfterOpeningSelection() {
            // Start game after opening selection
            gameState.phase = 'energy';
            gameState.currentPlayer = 'player';
            startPlayerTurn();
        }

        function buildDeck(player) {
            const deck = [];

            // Fighters live in their OWN pile (the roster deck); techniques/corners are the play deck.
            const fighterDeck = [];
            cardDatabase.fighters.forEach((f, i) => {
                const fighter = JSON.parse(JSON.stringify(f));
                fighter.uniqueId = `${player}_${fighter.id}_${Date.now()}_${i}`;
                fighter.strikingBonus = 0;
                fighterDeck.push(fighter);
            });

            const addCopies = (list) => list.forEach((proto, i) => {
                const n = proto.copies || 1;
                for (let copy = 0; copy < n; copy++) {
                    const c = JSON.parse(JSON.stringify(proto));
                    c.uniqueId = `${player}_${c.id}_${Date.now()}_${copy}_${i}`;
                    deck.push(c);
                }
            });
            addCopies(cardDatabase.techniques);
            addCopies(cardDatabase.corners);

            gameState[player].deck = deck;
            gameState[player].fighterDeck = fighterDeck;
        }

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        function shuffleDeck(player) {
            shuffle(gameState[player].deck);
            shuffle(gameState[player].fighterDeck);
        }

        // Draw n fighters from the fighter pile into the roster ("player cards").
        function drawRoster(player, n) {
            for (let i = 0; i < n && gameState[player].fighterDeck.length > 0; i++) {
                gameState[player].roster.push(gameState[player].fighterDeck.pop());
            }
        }

        function drawCardToHand(player, silent = false) {
            if (gameState[player].deck.length === 0) {
                if (!silent) {
                    addLog(`${player === 'player' ? 'You' : 'Opponent'} cannot draw - deck is empty!`, player);
                    endGame(player === 'player' ? 'opponent' : 'player', 'Deck Out');
                }
                return null;
            }

            // The play deck is techniques/corners only — fighters are a separate pile, so a normal
            // draw can never be a fighter.
            let card = gameState[player].deck.pop();
            if (!silent && player === 'player') {
                addLog(`You drew: ${card.name}`);
            }

            // If hand is full, need to discard
            if (gameState[player].hand.length >= HAND_LIMIT) {
                if (player === 'player' && !silent) {
                    // Player chooses which card to discard
                    promptCardDiscard(card);
                    return card; // Card will be added after discard selection
                } else {
                    // Opponent or silent draw: auto-discard oldest
                    const discarded = gameState[player].hand.shift();
                    if (!silent) {
                        addLog(`Opponent's hand is full. Discarded ${discarded.name} to draw ${card.name}.`, 'opponent');
                    }
                }
            }

            gameState[player].hand.push(card);

            return card;
        }

        let pendingDrawnCard = null; // Store card waiting to be added after discard

        function promptCardDiscard(drawnCard) {
            // Store the drawn card
            pendingDrawnCard = drawnCard;

            // Show modal with current hand + the drawn card preview
            const modal = document.getElementById('discardCardModal');
            const grid = document.getElementById('discardCardGrid');
            grid.innerHTML = '';

            addLog(`Your hand is full! Choose a card to discard.`);

            // Show the drawn card prominently at the top
            const drawnEl = document.createElement('div');
            drawnEl.className = 'select-card drawn-card-preview';
            const drawnDisplay = drawnCard.type === 'fighter'
                ? `<div class="card-header">${drawnCard.name}</div><div class="card-type">${drawnCard.style}</div><div class="card-body"><p><strong>Striking:</strong> ${drawnCard.striking}</p><p><strong>Grappling:</strong> ${drawnCard.grappling}</p><p><strong>HP:</strong> ${drawnCard.hp}/${drawnCard.maxHp}</p></div>`
                : `<div class="card-header">${drawnCard.name}</div><div class="card-type">${drawnCard.type.toUpperCase()}</div><div class="card-body"><p><strong>Energy:</strong> ${drawnCard.energy}</p><p>${drawnCard.effect}</p></div>`;
            drawnEl.innerHTML = `<div class="drawn-label">You just drew:</div>${drawnDisplay}`;
            grid.appendChild(drawnEl);

            gameState.player.hand.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'select-card';

                let cardDisplay = '';
                if (card.type === 'fighter') {
                    cardDisplay = `
                        <div class="card-header">${card.name}</div>
                        <div class="card-type">${card.style}</div>
                        <div class="card-body">
                            <p><strong>Striking:</strong> ${card.striking}</p>
                            <p><strong>Grappling:</strong> ${card.grappling}</p>
                            <p><strong>HP:</strong> ${card.hp}/${card.maxHp}</p>
                        </div>
                    `;
                } else {
                    cardDisplay = `
                        <div class="card-header">${card.name}</div>
                        <div class="card-type">${card.type.toUpperCase()}</div>
                        <div class="card-body">
                            <p><strong>Energy:</strong> ${card.energy}</p>
                            <p>${card.effect}</p>
                        </div>
                    `;
                }

                cardEl.innerHTML = cardDisplay;
                cardEl.onclick = () => selectCardToDiscard(card.uniqueId);
                grid.appendChild(cardEl);
            });

            modal.classList.add('active');
        }

        function selectCardToDiscard(cardId) {
            // Remove the selected card from hand
            const discarded = gameState.player.hand.find(c => c.uniqueId === cardId);
            gameState.player.hand = gameState.player.hand.filter(c => c.uniqueId !== cardId);

            // Add the drawn card
            gameState.player.hand.push(pendingDrawnCard);

            addLog(`You discarded ${discarded.name} to draw ${pendingDrawnCard.name}.`);

            // Close modal
            document.getElementById('discardCardModal').classList.remove('active');
            pendingDrawnCard = null;

            updateUI();
        }

        function drawCard() {
            if (gameState.phase !== 'draw') {
                addLog('You can only draw during the Draw Phase!');
                return;
            }

            const drawn = drawCardToHand('player');
            gameState.phase = 'main';

            document.getElementById('drawCardBtn').disabled = true;
            document.getElementById('endTurnBtn').disabled = false;

            updateUI();
            if (!drawn) {
                addLog(`Hand is full (${HAND_LIMIT}). You must play a card.`);
            }

            // If no actions are available, end the turn automatically
            maybeAutoEndTurn();
        }

        // Friendly explanation for why a technique can't be played from the current position.
        function positionIllegalMessage(card) {
            if (gameState.player.cantGrappleNextTurn && (card.subtype === 'grappling' || card.subtype === 'clinch')) return 'They teeped you to the end of range — no takedown or clinch this turn.';
            if (card.id === 'tech_gnp') return 'Ground and Pound needs top control — take them down first!';
            if (card.subtype === 'submission') return 'Submissions need the fight on the ground.';
            if (card.subtype === 'strike') return 'You can only throw standup strikes from neutral. Stand up first!';
            if (card.subtype === 'grappling') return 'You can only shoot a takedown from a neutral standing position.';
            if (card.subtype === 'escape' && card.escapeType === 'reversal') return 'You can only reverse from the bottom position.';
            if (card.subtype === 'escape') return 'Stand Up can only be used when the fight is on the ground.';
            return 'You cannot do that from this position.';
        }

        function playCard(card, player) {
            if (player !== 'player' || gameState.currentPlayer !== 'player') return;
            if (gameState.phase !== 'main') {
                addLog('You can only play cards during your Main Phase!');
                return;
            }

            // Fighters are deployed from the roster zone (deployFromRoster), not played from hand.
            if (card.type === 'technique') {
                if (card.subtype === 'defense') {
                    addLog('Defensive cards are reactions — they trigger when an opponent attacks. Keep energy in reserve to use them.');
                    return;
                }
                if (!gameState.player.activeFighter) {
                    addLog('You need an active fighter to use techniques!');
                    return;
                }

                if (card.energy > gameState.player.energy) {
                    addLog(`Not enough energy! Need ${card.energy}, have ${gameState.player.energy}`);
                    return;
                }

                // Position rules (sticky ground): standup strikes/takedowns from neutral, GnP from
                // top, submissions on the ground, escapes from the appropriate ground position.
                if (!isTechniquePositionLegal(card, gameState.player, gameState.opponent)) {
                    addLog(positionIllegalMessage(card));
                    return;
                }

                // Check if opponent has active fighter for techniques that require one
                if ((card.subtype === 'strike' || card.subtype === 'submission' || card.subtype === 'grappling') && !gameState.opponent.activeFighter) {
                    addLog('Opponent needs an active fighter to attack!');
                    return;
                }

                // The result line (damage / takedown / etc.) is the only notification — no redundant "uses" banner.
                executeTechnique(card, 'player');
            } else if (card.type === 'corner') {
                if (!gameState.player.activeFighter) {
                    addLog('You need an active fighter to use corner cards!');
                    return;
                }

                if (card.energy > gameState.player.energy) {
                    addLog(`Not enough energy! Need ${card.energy}, have ${gameState.player.energy}`);
                    return;
                }

                executeCornerCard(card, 'player');
            }

            // After any play, if it's still your main phase and nothing else can be done, auto-end
            maybeAutoEndTurn();
        }

        function executeTechnique(card, player, onComplete) {
            onComplete = onComplete || function () {};
            const attacker = gameState[player];
            const defender = player === 'player' ? gameState.opponent : gameState.player;
            const cardTypeClass = card.subtype === 'defense' ? 'card-defense' : 'card-technique';

            // Safety check - this should have been caught earlier in playCard
            if (!attacker.activeFighter) {
                addLog('You need an active fighter to use techniques!');
                onComplete();
                return;
            }

            attacker.energy -= card.energy;
            attacker.hand = attacker.hand.filter(c => c.uniqueId !== card.uniqueId);

            const finish = function () { updateUI(); onComplete(); };

            // Strikes, submissions, and takedowns can all be answered with a reaction before they resolve.
            if ((card.subtype === 'strike' || card.subtype === 'submission' || card.subtype === 'grappling') && defender.activeFighter) {
                openReactionWindow(card, player, attacker, defender, function () {
                    resolveTechniqueEffect(card, player, attacker, defender, cardTypeClass);
                    finish();
                });
                return;
            }

            resolveTechniqueEffect(card, player, attacker, defender, cardTypeClass);
            finish();
        }

        // Apply a waiting strike/submission reaction: negate (full) or reduce, plus any counter.
        // Returns the final damage and whether the attack was defended (defended => no on-hit status).
        function applyIncomingReaction(damage, attacker, defender, player, card) {
            const b = defender.defenseBuff;
            if (!b) return { damage: damage, defended: false };
            defender.defenseBuff = null;
            const defenderName = player === 'player' ? 'opponent' : 'player';
            if (b.mitigation === 'negate') {
                damage = 0;
                showAction(`${b.name}: negated!`, defenderName, 'advantage', 'card-defense');
            } else if (card && card.ignoresReduce) {
                // Power Cross — a Block can't soften straight power; it lands clean.
                showAction(`${b.name} can't soften ${card.name} — it gets through!`, player, 'damage', 'card-defense');
            } else {
                damage = Math.max(0, damage - (b.reduction || 0));
                showAction(`${b.name}: -${b.reduction} damage`, defenderName, 'advantage', 'card-defense');
            }
            if (b.counter && attacker.activeFighter) {
                attacker.activeFighter.hp -= b.counter;
                showAction(`${b.name} counter: ${b.counter} damage!`, defenderName, 'damage', 'card-defense');
                floatTextOverFighter(player, `-${b.counter}`, 'damage');
                checkFighterKO(attacker, player);
            }
            return { damage: damage, defended: true };
        }

        function resolveTechniqueEffect(card, player, attacker, defender, cardTypeClass) {
            const defenderName = player === 'player' ? 'opponent' : 'player';
            if (card.subtype === 'strike') {
                // Ground and Pound needs top control (legality enforced upstream; guard anyway)
                if (card.strikeType === 'ground' && !attacker.positionalAdvantage) {
                    addLog('Ground and Pound needs top control!', player);
                    attacker.energy += card.energy;
                    attacker.hand.push(card);
                    return;
                }
                const strikeCombo = attacker.comboStrikes || 0;
                let damage = calcStrikeDamage(card, attacker, defender);

                const struck = applyIncomingReaction(damage, attacker, defender, player, card);
                damage = struck.damage;

                if (damage > 0 && defender.activeFighter) {
                    defender.activeFighter.hp -= damage;
                    attacker.comboStrikes = strikeCombo + 1; // only a strike that LANDS builds the combo
                    const comboTag = strikeCombo > 0 ? ` [combo +${comboBonus(strikeCombo)}]` : '';
                    showAction(`${card.name}: ${damage} damage!${comboTag}`, player, 'damage', cardTypeClass);
                    floatTextOverFighter(defenderName, `-${damage}`, 'damage');
                    if (strikeCombo >= 1) floatTextOverFighter(player, `COMBO x${strikeCombo + 1}`, 'info');
                }

                // On-hit effects only on a clean (undefended) landing hit
                if (!struck.defended && damage > 0 && defender.activeFighter) {
                    if (card.onHitStatus && card.onHitStatus.type === 'bleed') {
                        defender.activeFighter.status = defender.activeFighter.status || {};
                        defender.activeFighter.status.bleed = { amount: card.onHitStatus.amount, turns: card.onHitStatus.turns };
                        showAction(`Bleed applied (${card.onHitStatus.amount} for ${card.onHitStatus.turns} turns)`, player, 'advantage', cardTypeClass);
                    }
                    // Leg Kick — stacking leg damage saps ALL of their future strikes.
                    if (card.onHitStatus && card.onHitStatus.type === 'legDamage') {
                        defender.activeFighter.status = defender.activeFighter.status || {};
                        defender.activeFighter.status.legDamage = (defender.activeFighter.status.legDamage || 0) + card.onHitStatus.amount;
                        showAction(`Leg chopped — -${defender.activeFighter.status.legDamage} to their strikes`, player, 'advantage', cardTypeClass);
                        floatTextOverFighter(defenderName, 'LEG DMG', 'info');
                    }
                    // Body Shot — saps cardio (energy).
                    if (card.energyDrain) {
                        const drained = Math.min(card.energyDrain, defender.energy);
                        defender.energy = Math.max(0, defender.energy - card.energyDrain);
                        if (drained > 0) {
                            showAction(`To the body! -${drained} energy (gassed)`, player, 'advantage', cardTypeClass);
                            floatTextOverFighter(defenderName, `-${drained}⚡`, 'info');
                        }
                    }
                    // Teep — spacing: they can't shoot or clinch on their next turn.
                    if (card.onHitSpacing) {
                        defender.cantGrappleNextTurn = true;
                        showAction('Kept at range — no takedown or clinch for them next turn', player, 'advantage', cardTypeClass);
                    }
                    // Upkick — a clean kick off the bottom scrambles both fighters back to neutral.
                    if (card.onHitSeparate) {
                        attacker.positionalAdvantage = false;
                        defender.positionalAdvantage = false;
                        attacker.inClinch = false;
                        defender.inClinch = false;
                        showAction(`${attacker.activeFighter.name} kicks free — back to neutral!`, player, 'advantage', cardTypeClass);
                        floatTextOverFighter(player, 'SEPARATE', 'info');
                    }
                    if (card.id === 'tech_spinning') {
                        defender.skipNextTurn = true;
                        showAction('Staggered! Opponent skips their next turn.', player, 'advantage', cardTypeClass);
                        floatTextOverFighter(defenderName, 'STAGGERED', 'info');
                    }
                    // Knockdown — only a POWER strike (canKnockdown) that lands clean for 8+ drops them;
                    // a jab/teep/leg kick that happens to reach 8 never knocks anyone down.
                    if (defender.activeFighter.hp > 0
                        && card.canKnockdown
                        && damage >= CONFIG.knockdownThreshold
                        && !attacker.positionalAdvantage && !defender.positionalAdvantage) {
                        attacker.positionalAdvantage = true;
                        defender.positionalAdvantage = false;
                        attacker.inClinch = false;
                        defender.inClinch = false;
                        showAction(`KNOCKDOWN! ${defender.activeFighter.name} drops — ${attacker.activeFighter.name} takes top control!`, player, 'advantage', cardTypeClass);
                        floatTextOverFighter(defenderName, 'KNOCKDOWN', 'info');
                    }
                }

                // Intense Training (striking bonus) is consumed only by a striking-based strike
                if (attacker.activeFighter && card.strikeType !== 'ground') attacker.activeFighter.strikingBonus = 0;

                checkFighterKO(defender, defenderName);

            } else if (card.subtype === 'grappling') {
                // Takedowns are deterministic — they land UNLESS answered by a takedown reaction.
                if (defender.takedownReaction) {
                    const r = defender.takedownReaction;
                    defender.takedownReaction = null;
                    if (r.mitigation === 'reverse') {
                        // Counter Takedown — the defender reverses and takes top control.
                        defender.positionalAdvantage = true;
                        attacker.positionalAdvantage = false;
                        showAction(`${defender.activeFighter.name} reverses with a Counter Takedown — top control!`, defenderName, 'advantage', cardTypeClass);
                        floatTextOverFighter(defenderName, 'REVERSAL', 'info');
                    } else {
                        // Stuff / Sprawl — the shot is defended, fight stays standing.
                        showAction(`${defender.activeFighter.name} stuffs the takedown with ${r.name}!`, defenderName, 'advantage', cardTypeClass);
                        floatTextOverFighter(defenderName, 'STUFFED', 'info');
                        if (r.counter && attacker.activeFighter) {
                            attacker.activeFighter.hp -= r.counter;
                            showAction(`${r.name} counter: ${r.counter} damage!`, defenderName, 'damage', cardTypeClass);
                            floatTextOverFighter(player, `-${r.counter}`, 'damage');
                            checkFighterKO(attacker, player);
                        }
                    }
                    return;
                }

                // Unanswered — the takedown lands. Attacker gains top control (clinch breaks).
                attacker.positionalAdvantage = true;
                defender.positionalAdvantage = false;
                attacker.inClinch = false;
                defender.inClinch = false;
                const impact = calcTakedownImpact(card, attacker, defender);
                defender.activeFighter.hp -= impact;
                showAction(`${attacker.activeFighter.name} takes them down! Impact: ${impact}`, player, 'damage', cardTypeClass);
                floatTextOverFighter(defenderName, `-${impact}`, 'damage');
                // The scramble saps cardio — a downed fighter has less in the tank to defend.
                if (CONFIG.takedownEnergyDrain && defender.energy > 0) {
                    const drained = Math.min(CONFIG.takedownEnergyDrain, defender.energy);
                    defender.energy = Math.max(0, defender.energy - CONFIG.takedownEnergyDrain);
                    if (drained > 0) floatTextOverFighter(defenderName, `-${drained}⚡`, 'info');
                }
                checkFighterKO(defender, defenderName);

            } else if (card.subtype === 'clinch') {
                // Tie up — both fighters are now in the clinch (enables flying submissions).
                attacker.inClinch = true;
                defender.inClinch = true;
                showAction(`${attacker.activeFighter.name} ties up in the clinch!`, player, 'advantage', cardTypeClass);
                floatTextOverFighter(player, 'CLINCH', 'info');

            } else if (card.subtype === 'submission') {
                // A flying submission is thrown from the clinch (neither fighter grounded yet).
                const flyingFromClinch = attacker.inClinch && !attacker.positionalAdvantage && !defender.positionalAdvantage;
                let damage = calcSubmissionDamage(card, attacker, defender);
                const subbed = applyIncomingReaction(damage, attacker, defender, player, card);
                damage = subbed.damage;

                if (damage > 0 && defender.activeFighter) {
                    defender.activeFighter.hp -= damage;
                    const posTag = attacker.positionalAdvantage ? ' locked in' : (defender.positionalAdvantage ? ' from bottom' : ' (flying)');
                    showAction(`${card.name}${posTag}: ${damage} damage!`, player, 'damage', cardTypeClass);
                    floatTextOverFighter(defenderName, `-${damage}`, 'damage');
                }

                // Committing to a flying submission drags the fight to the mat — you land in top control.
                if (flyingFromClinch && defender.activeFighter && defender.activeFighter.hp > 0) {
                    attacker.inClinch = false;
                    defender.inClinch = false;
                    attacker.positionalAdvantage = true;
                    defender.positionalAdvantage = false;
                    showAction(`${attacker.activeFighter.name} drags it to the mat — top control!`, player, 'advantage', cardTypeClass);
                    floatTextOverFighter(player, 'TOP CONTROL', 'info');
                }
                checkFighterKO(defender, defenderName);
            } else if (card.subtype === 'escape') {
                // Reliable escapes — they always work, the cost is the energy + the turn's tempo.
                if (card.escapeType === 'reversal') {
                    // Sweep from the bottom to top control (positions swap).
                    attacker.positionalAdvantage = true;
                    defender.positionalAdvantage = false;
                    showAction(`${attacker.activeFighter.name} reverses to top control!`, player, 'advantage', cardTypeClass);
                    floatTextOverFighter(player, 'REVERSAL', 'info');
                } else {
                    // Stand Up — back to neutral footing (also breaks the clinch).
                    const wasClinch = attacker.inClinch;
                    attacker.positionalAdvantage = false;
                    defender.positionalAdvantage = false;
                    attacker.inClinch = false;
                    defender.inClinch = false;
                    showAction(`${attacker.activeFighter.name} ${wasClinch ? 'breaks the clinch' : 'stands up'} — back to neutral!`, player, 'advantage', cardTypeClass);
                    floatTextOverFighter(player, wasClinch ? 'BREAK' : 'STAND UP', 'info');
                }
            }
        }

        function executeCornerCard(card, player) {
            const p = gameState[player];

            if (!p.activeFighter) {
                addLog(`${player === 'player' ? 'You need' : 'Opponent needs'} an active fighter to use corner cards!`, player);
                return;
            }

            p.energy -= card.energy;
            p.hand = p.hand.filter(c => c.uniqueId !== card.uniqueId);

            if (card.id === 'corner_coach') {
                p.activeFighter.striking += CONFIG.masterCoachBonus;
                p.activeFighter.grappling += CONFIG.masterCoachBonus;
                const drawnCard = drawCardToHand(player);
                showAction(drawnCard ? `${card.name}: +${CONFIG.masterCoachBonus} Striking & Grappling, drew ${drawnCard.name}` : `${card.name}: +${CONFIG.masterCoachBonus} Striking & Grappling`, player, '', '');
            } else if (card.id === 'corner_training') {
                p.activeFighter.strikingBonus = (p.activeFighter.strikingBonus || 0) + CONFIG.intenseTrainingBonus;
                showAction(`${card.name}: +${CONFIG.intenseTrainingBonus} Striking until your next strike`, player, '', '');
            } else if (card.id === 'corner_medic') {
                const old = p.activeFighter.hp;
                p.activeFighter.hp = Math.min(p.activeFighter.maxHp, p.activeFighter.hp + CONFIG.medicHeal);
                const actualHeal = p.activeFighter.hp - old;
                floatTextOverFighter(player, `+${actualHeal}`, 'heal');
                showAction(`${card.name}: restored ${actualHeal} HP`, player, '', '');
            } else if (card.id === 'corner_energy') {
                const old = p.energy;
                p.energy = Math.min(p.maxEnergy, p.energy + CONFIG.secondWindEnergy);
                const gained = p.energy - old;
                floatTextOverFighter(player, `+${gained}⚡`, 'heal');
                showAction(`${card.name}: +${gained} energy`, player, '', '');
            }

            updateUI();
        }

        function checkFighterKO(defender, defenderName) {
            if (defender.activeFighter.hp <= 0) {
                showAction(`${defender.activeFighter.name} KO'd!`, defenderName, 'ko', 'card-technique');
                defender.activeFighter = null;

                // Reset position/clinch/spacing when a fighter is KO'd (a fresh fight starts)
                gameState.player.positionalAdvantage = false;
                gameState.opponent.positionalAdvantage = false;
                gameState.player.inClinch = false;
                gameState.opponent.inClinch = false;
                gameState.player.cantGrappleNextTurn = false;
                gameState.opponent.cantGrappleNextTurn = false;

                floatTextOverFighter(defenderName, 'KO', 'damage');

                // Last fighter standing wins: you lose when your active fighter is KO'd and your roster is empty.
                if (defender.roster.length === 0) {
                    addLog(`${defenderName === 'player' ? 'You have' : 'Opponent has'} no fighters left!`, defenderName);
                    updateUI();
                    setTimeout(() => endGame(defenderName === 'player' ? 'opponent' : 'player', 'No fighters left'), 1000);
                    return;
                }

                if (defenderName === 'player') {
                    setTimeout(() => promptReplacementFighterSelection(), 800);
                } else {
                    // Opponent auto-deploys its best roster fighter.
                    const newFighter = pickBestFighter(defender.roster);
                    setTimeout(() => {
                        deployFighter('opponent', newFighter.uniqueId, true);
                        updateUI();
                    }, 800);
                }

                updateUI();
            }
        }

        function startPlayerTurn() {
            gameState.currentPlayer = 'player';
            gameState.phase = 'energy';

            // Fresh turn — combo momentum resets.
            gameState.player.comboStrikes = 0;
            gameState.player.comboGrapples = 0;
            // The spacing we put on the opponent has now covered their turn — clear it.
            gameState.opponent.cantGrappleNextTurn = false;

            // Energy phase
            if (gameState.turn === 1) {
                gameState.player.energy = CONFIG.energyStart; // fixed first-turn energy
            } else {
                gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + CONFIG.energyGain);
            }

            // Start-of-turn status effects (e.g., Bleed)
            if (gameState.player.activeFighter && gameState.player.activeFighter.status && gameState.player.activeFighter.status.bleed) {
                const b = gameState.player.activeFighter.status.bleed;
                gameState.player.activeFighter.hp -= b.amount;
                b.turns -= 1;
                showAction(`Bleed: ${b.amount} damage (${Math.max(0,b.turns)} turns left)`, 'player', 'damage', 'card-technique');
                floatTextOverFighter('player', `-${b.amount}`, 'damage');
                if (b.turns <= 0) {
                    delete gameState.player.activeFighter.status.bleed;
                }
                checkFighterKO(gameState.player, 'player');
            }

            // Handle skip-next-turn effect (after energy is applied)
            if (gameState.player.skipNextTurn) {
                gameState.player.skipNextTurn = false;
                addLog('You are staggered and skip this turn!');
                updateUI();
                setTimeout(() => opponentTurn(), 500);
                return;
            }
            
            // Always allow draw phase, even if hand is full (will auto-discard oldest)
            gameState.phase = 'draw';
            document.getElementById('drawCardBtn').disabled = false;
            document.getElementById('endTurnBtn').disabled = false; // Can skip draw and end turn

            if (gameState.player.hand.length >= HAND_LIMIT) {
                addLog(`Your hand is full (${HAND_LIMIT}). Draw to replace oldest card, or skip to Main Phase.`);
            }
            
            addLog(`--- Turn ${gameState.turn}: Your Turn ---`);
            addLog(`You gained energy! Current: ${gameState.player.energy}`);
            
            updateUI();
            if (gameState.phase === 'main') {
                maybeAutoEndTurn();
            }
        }

        function endTurn(isAuto = false) {
            if (gameState.currentPlayer !== 'player') return;

            // If in draw phase, "End Turn" button skips draw and goes to main phase
            if (gameState.phase === 'draw') {
                gameState.phase = 'main';
                document.getElementById('drawCardBtn').disabled = true;
                document.getElementById('endTurnBtn').disabled = false;
                addLog('Skipped draw. Main Phase: Play cards from your hand.');
                updateUI();
                maybeAutoEndTurn();
                return;
            }

            gameState.phase = 'end';

            // Discard down to HAND_LIMIT cards
            while (gameState.player.hand.length > HAND_LIMIT) {
                gameState.player.hand.pop();
            }

            document.getElementById('endTurnBtn').disabled = true;

            if (!isAuto) {
                addLog('Your turn ended.');
            }
            updateUI();

            setTimeout(() => {
                opponentTurn();
            }, 1000);
        }

        function opponentTurn() {
            gameState.currentPlayer = 'opponent';
            gameState.phase = 'energy';
            gameState.turn++;

            // Fresh turn — combo momentum resets.
            gameState.opponent.comboStrikes = 0;
            gameState.opponent.comboGrapples = 0;
            // The spacing the opponent put on us has now covered our turn — clear it.
            gameState.player.cantGrappleNextTurn = false;

            addLog(`--- Turn ${gameState.turn}: Opponent's Turn ---`, 'opponent');
            
            // Energy phase
            if (gameState.turn === 2) {
                gameState.opponent.energy = CONFIG.energyStart; // fixed first opponent turn energy
            } else {
                gameState.opponent.energy = Math.min(gameState.opponent.maxEnergy, gameState.opponent.energy + CONFIG.energyGain);
            }

            // Start-of-turn status effects for opponent
            if (gameState.opponent.activeFighter && gameState.opponent.activeFighter.status && gameState.opponent.activeFighter.status.bleed) {
                const b = gameState.opponent.activeFighter.status.bleed;
                gameState.opponent.activeFighter.hp -= b.amount;
                b.turns -= 1;
                showAction(`Bleed: ${b.amount} damage (${Math.max(0,b.turns)} turns left)`, 'opponent', 'damage', 'card-technique');
                floatTextOverFighter('opponent', `-${b.amount}`, 'damage');
                if (b.turns <= 0) {
                    delete gameState.opponent.activeFighter.status.bleed;
                }
                checkFighterKO(gameState.opponent, 'opponent');
            }

            // Handle skip-next-turn effect (after energy is applied)
            if (gameState.opponent.skipNextTurn) {
                gameState.opponent.skipNextTurn = false;
                addLog('Opponent is staggered and skips their turn!', 'opponent');
                updateUI();
                setTimeout(() => { startPlayerTurn(); }, 500);
                return;
            }
            
            // Opponent draw phase (skip draw if hand full)
            gameState.phase = 'draw';
            updateUI();
            
            setTimeout(() => {
                // Draw card if hand not full
                if (gameState.opponent.hand.length < HAND_LIMIT) {
                    drawCardToHand('opponent');
                    addLog('Opponent draws a card', 'opponent');
                } else {
                    addLog(`Opponent hand is full (${HAND_LIMIT}).`, 'opponent');
                }
                
                gameState.phase = 'main';
                updateUI();
                
                setTimeout(() => {
                    executeOpponentAI();
                }, 1500);
            }, 1000);
        }

        function executeOpponentAI() {
            // Must deploy a fighter from the roster if none is active.
            if (!gameState.opponent.activeFighter) {
                const fighter = pickBestFighter(gameState.opponent.roster);
                if (fighter) {
                    deployFighter('opponent', fighter.uniqueId, true);
                    updateUI();
                    setTimeout(() => continueOpponentAI(), 1000);
                    return;
                } else {
                    addLog('Opponent has no fighter to deploy!', 'opponent');
                    endOpponentTurn();
                    return;
                }
            }

            continueOpponentAI();
        }

        function continueOpponentAI() {
            const me = gameState.opponent, foe = gameState.player;
            if (gameState.gameOver) return;
            // Wait while the player is choosing a reaction.
            if (gameState.awaitingReaction) { setTimeout(continueOpponentAI, 300); return; }
            if (!me.activeFighter || !foe.activeFighter) {
                endOpponentTurn();
                return;
            }

            // Easy difficulty keeps the original random behavior.
            if (gameState.difficulty === 'easy') {
                continueOpponentAIRandom();
                return;
            }

            // On Hard/Nightmare, bank energy to keep a defensive reaction available.
            const hard = gameState.difficulty === 'hard' || gameState.difficulty === 'nightmare';
            const hasReaction = me.hand.some(c => c.subtype === 'defense');
            const reserve = (hard && hasReaction && foe.activeFighter) ? 2 : 0;

            const choice = aiChooseAction(me, foe, reserve);
            if (!choice) {
                // Stuck: if it holds top/clinch but has no use for it (no play even without banking
                // energy), disengage to neutral for free rather than dead-ending on the ground.
                if ((me.positionalAdvantage || me.inClinch) && !aiChooseAction(me, foe, 0) && freeStandUp('opponent')) {
                    updateUI();
                    setTimeout(() => { if (!gameState.gameOver) continueOpponentAI(); }, 900);
                    return;
                }
                endOpponentTurn();
                return;
            }

            const next = function () { setTimeout(() => { if (!gameState.gameOver) continueOpponentAI(); }, 1200); };
            if (choice.card.type === 'corner') {
                executeCornerCard(choice.card, 'opponent');
                next();
            } else {
                // executeTechnique may pause for the player's reaction; resume only when it completes.
                executeTechnique(choice.card, 'opponent', next);
            }
        }

        function continueOpponentAIRandom() {
            // Can only play techniques if both players have fighters
            if (!gameState.opponent.activeFighter || !gameState.player.activeFighter) {
                endOpponentTurn();
                return;
            }

            // Check if low stamina - prioritize healing with corner cards
            const needsHealing = gameState.opponent.activeFighter.hp < (gameState.opponent.activeFighter.maxHp * 0.4);
            if (needsHealing) {
                const healCard = gameState.opponent.hand.find(c => c.type === 'corner' && c.effect.includes('Restore') && c.energy <= gameState.opponent.energy);
                if (healCard) {
                    executeCornerCard(healCard, 'opponent');
                    setTimeout(() => {
                        if (gameState.opponent.energy > 0 && Math.random() > 0.4) {
                            continueOpponentAI();
                        } else {
                            endOpponentTurn();
                        }
                    }, 1500);
                    return;
                }
            }

            // Sometimes play corner cards strategically
            if (Math.random() > 0.7 && gameState.opponent.energy >= 3) {
                const cornerCard = gameState.opponent.hand.find(c => c.type === 'corner' && c.energy <= gameState.opponent.energy);
                if (cornerCard) {
                    executeCornerCard(cornerCard, 'opponent');
                    setTimeout(() => {
                        if (gameState.opponent.energy > 0 && Math.random() > 0.4) {
                            continueOpponentAI();
                        } else {
                            endOpponentTurn();
                        }
                    }, 1500);
                    return;
                }
            }

            // Simple AI: play a random position-legal technique (aiCanPlay enforces all the rules)
            const playableTechs = gameState.opponent.hand.filter(c =>
                c.type === 'technique' && aiCanPlay(c, gameState.opponent, gameState.player));

            if (playableTechs.length > 0) {
                const tech = playableTechs[Math.floor(Math.random() * playableTechs.length)];
                // Execute directly; executeTechnique will display the action and results
                executeTechnique(tech, 'opponent');

                setTimeout(() => {
                    const stillHasPlayable = gameState.opponent.hand.some(c =>
                        c.type === 'technique' && aiCanPlay(c, gameState.opponent, gameState.player));
                    if (stillHasPlayable && Math.random() > 0.3) {
                        continueOpponentAI();
                    } else {
                        endOpponentTurn();
                    }
                }, 1500);
            } else {
                endOpponentTurn();
            }
        }

        function endOpponentTurn() {
            // Don't end the turn while the player is still resolving a reaction.
            if (gameState.awaitingReaction) { setTimeout(endOpponentTurn, 300); return; }
            gameState.phase = 'end';

            while (gameState.opponent.hand.length > HAND_LIMIT) {
                gameState.opponent.hand.pop();
            }
            
            addLog('Opponent ends their turn', 'opponent');
            updateUI();
            
            setTimeout(() => {
                startPlayerTurn();
            }, 1000);
        }

        // Attack button removed; clicking cards triggers plays directly


        function setDifficulty(value) {
            gameState.difficulty = value;
            addLog(`AI difficulty set to ${value.charAt(0).toUpperCase() + value.slice(1)}.`);
            // Nightmare boosts only apply to fighters deployed after the change.
            if (value === 'nightmare' && gameState.opponent.activeFighter) {
                applyDifficultyBoost(gameState.opponent.activeFighter);
                updateUI();
            }
        }

        function endGame(winner, reason) {
            gameState.gameOver = true;
            const modal = document.getElementById('gameOverModal');
            const title = document.getElementById('gameOverTitle');
            const message = document.getElementById('gameOverMessage');
            const content = modal.querySelector('.modal-content');
            
            if (winner === 'player') {
                title.textContent = 'VICTORY!';
                message.textContent = `You defeated the opponent! ${reason}`;
                content.classList.remove('defeat');
            } else {
                title.textContent = 'DEFEAT';
                message.textContent = `You were defeated! ${reason}`;
                content.classList.add('defeat');
            }
            
            modal.classList.add('active');
        }

        function addLog(message, player = null, type = '', cardType = '') {
            // Suppress non-critical and redundant messages
            const suppressList = [
                'You drew:',
                'Opponent draws a card',
                '--- Turn',
                'No available actions. Ending turn automatically.',
                'You gained energy!',
                'Main Phase: Play cards from your hand.',
                'Opponent ends their turn',
                'Your turn ended.'
            ];
            for (const marker of suppressList) {
                if (message.startsWith(marker)) return;
            }
            // Route to action banners only (log UI removed)
            showAction(message, player, type, cardType);
        }

        function showAction(message, player = null, type = '', cardType = '') {
            // Resolve owner: if not provided, infer from current turn
            let owner = player;
            if (owner !== 'player' && owner !== 'opponent') {
                owner = (gameState.currentPlayer === 'opponent') ? 'opponent' : 'player';
            }

            // Get the feed for this player
            const feedId = owner === 'opponent' ? 'opponentActionFeed' : 'playerActionFeed';
            let feed = document.getElementById(feedId);

            // If feed doesn't exist yet, create it
            if (!feed) {
                const zoneId = owner === 'opponent' ? 'opponentFighterZone' : 'playerFighterZone';
                const zone = document.getElementById(zoneId);
                if (zone) {
                    feed = document.createElement('div');
                    feed.id = feedId;
                    feed.className = 'inline-action-feed';
                    zone.appendChild(feed);
                }
            }

            if (!feed) return;

            // Create and add the message to the log. Color is by CORNER only (blue = player, red =
            // opponent) — every message from a fighter shares that fighter's theme. 'ko' just bolds it.
            const item = document.createElement('div');
            item.className = 'action-item new-message ' + owner;
            if (type === 'ko') item.classList.add('ko');
            item.textContent = message;

            // Remove animation class after animation completes
            setTimeout(() => {
                item.classList.remove('new-message');
            }, 300);

            // Append to bottom so newest is at bottom
            feed.appendChild(item);

            // Keep only the 4 most recent messages (remove from top) so the feed stays compact
            while (feed.children.length > 4) {
                feed.removeChild(feed.firstChild);
            }
        }

        function floatTextOverFighter(owner, text, cls = 'info') {
            const zoneId = owner === 'player' ? 'playerFighterZone' : 'opponentFighterZone';
            const zone = document.getElementById(zoneId);
            if (!zone) return;
            const ft = document.createElement('div');
            ft.className = `float-text ${cls}`;
            ft.textContent = text;
            // attach to first child (card) if present for better positioning
            const target = zone.firstChild && zone.firstChild.classList ? zone.firstChild : zone;
            target.style.position = target.style.position || 'relative';
            target.appendChild(ft);
            setTimeout(() => ft.remove(), 900);
        }

        function updateUI() {
            // Update turn counter
            document.getElementById('turnCounter').textContent = gameState.turn;
            document.getElementById('currentPhase').textContent = gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1);
            
            // Fighters remaining (active + roster) — last one standing wins.
            const fightersLeft = side => gameState[side].roster.length + (gameState[side].activeFighter ? 1 : 0);
            const fighterLabel = n => `${n} ${n === 1 ? 'Fighter' : 'Fighters'}`;

            // Update player stats
            document.getElementById('playerEnergy').textContent = `${gameState.player.energy}/${gameState.player.maxEnergy}`;
            document.getElementById('playerHealthBar').style.width = `${(fightersLeft('player') / CONFIG.rosterSize) * 100}%`;
            document.getElementById('playerFightersRemaining').textContent = fighterLabel(fightersLeft('player'));
            document.getElementById('playerDeckCount').textContent = gameState.player.deck.length;
            document.getElementById('playerHandCount').textContent = gameState.player.hand.length;
            document.getElementById('playerRosterCount').textContent = gameState.player.roster.length;

            // Update opponent stats
            document.getElementById('opponentEnergy').textContent = `${gameState.opponent.energy}/${gameState.opponent.maxEnergy}`;
            document.getElementById('opponentHealthBar').style.width = `${(fightersLeft('opponent') / CONFIG.rosterSize) * 100}%`;
            document.getElementById('opponentFightersRemaining').textContent = fighterLabel(fightersLeft('opponent'));
            document.getElementById('opponentHandCount').textContent = gameState.opponent.hand.length;
            document.getElementById('opponentDeckCount').textContent = gameState.opponent.deck.length;
            document.getElementById('opponentRosterCount').textContent = gameState.opponent.roster.length;
            document.getElementById('opponentRosterCount2').textContent = gameState.opponent.roster.length;

            // Update turn indicator
            const turnIndicator = document.getElementById('turnIndicator');
            turnIndicator.textContent = gameState.currentPlayer === 'player' ? 'YOUR TURN' : 'OPPONENT\'S TURN';

            // Update position indicator
            const posIndicator = document.getElementById('positionIndicator');
            const me = gameState[gameState.currentPlayer === 'player' ? 'player' : 'opponent'];
            if (me.inClinch) {
                posIndicator.textContent = 'Clinch';
            } else if (me.positionalAdvantage) {
                posIndicator.textContent = 'Top Control';
            } else if (gameState[gameState.currentPlayer === 'player' ? 'opponent' : 'player'].positionalAdvantage) {
                posIndicator.textContent = 'Bottom';
            } else {
                posIndicator.textContent = 'Standing';
            }

            // Render fighters, rosters, and hand
            renderFighter('player');
            renderFighter('opponent');
            renderRoster('player');
            renderRoster('opponent');
            renderHand();
        }

        // Render a player's roster ("player cards"). The player's are face-up and deployable
        // when no fighter is active; the opponent's are face-down.
        function renderRoster(player) {
            const zone = document.getElementById(player === 'player' ? 'playerRoster' : 'opponentRoster');
            if (!zone) return;
            zone.innerHTML = '';
            const canDeploy = player === 'player' && !gameState.player.activeFighter && gameState.currentPlayer === 'player' && gameState.phase !== 'setup';
            gameState[player].roster.forEach(f => {
                const el = document.createElement('div');
                if (player === 'opponent') {
                    el.className = 'roster-card facedown';
                    el.innerHTML = '<div class="roster-back">🥊</div>';
                } else {
                    el.className = 'roster-card' + (canDeploy ? ' deployable' : '');
                    el.innerHTML = `
                        <div class="roster-name">${f.name}</div>
                        <div class="roster-stats">STR ${f.striking} · GRP ${f.grappling}</div>
                        <div class="roster-hp">HP ${f.hp}/${f.maxHp}</div>
                    `;
                    if (canDeploy) el.onclick = () => deployFromRoster(f.uniqueId);
                }
                zone.appendChild(el);
            });
        }

        // Determine if the player has any valid action to perform in Main Phase
        function hasPlayableAction() {
            if (gameState.currentPlayer !== 'player' || gameState.phase !== 'main') return false;
            const p = gameState.player;
            const o = gameState.opponent;

            // Deploy a fighter from the roster if none is active
            if (!p.activeFighter && p.roster.length > 0) return true;

            // Play a corner card (requires energy and an active fighter to avoid errors)
            if (p.activeFighter && p.hand.some(c => c.type === 'corner' && c.energy <= p.energy)) return true;

            // Techniques (position-gated; defense cards are reactions, excluded by the helper)
            const hasTechnique = p.hand.some(c => {
                if (c.type !== 'technique') return false;
                if (c.energy > p.energy) return false;
                if (!p.activeFighter || !o.activeFighter) return false;
                return isTechniquePositionLegal(c, p, o);
            });
            if (hasTechnique) return true;

            return false;
        }

        // The dominant (top) or clinched fighter can disengage to NEUTRAL for free — no card, no energy.
        // The fighter on the BOTTOM cannot (they must spend a card / Reversal), so a takedown still costs
        // the downed fighter tempo. This is the escape valve that prevents a ground stalemate.
        function freeStandUp(side) {
            const me = gameState[side];
            const foe = side === 'player' ? gameState.opponent : gameState.player;
            if (!me.positionalAdvantage && !me.inClinch) return false; // only the dominant/clinched side
            const wasClinch = me.inClinch;
            me.positionalAdvantage = false;
            foe.positionalAdvantage = false;
            me.inClinch = false;
            foe.inClinch = false;
            const name = me.activeFighter ? me.activeFighter.name : (side === 'player' ? 'You' : 'Opponent');
            showAction(`${name} ${wasClinch ? 'breaks the clinch' : 'stands up'} — back to neutral!`, side, '', '');
            floatTextOverFighter(side, wasClinch ? 'BREAK' : 'STAND UP', 'info');
            return true;
        }

        // Player clicks the free Stand Up button (shown only when on top or in the clinch).
        function playerStandUpFree() {
            if (gameState.currentPlayer !== 'player' || gameState.phase !== 'main') return;
            if (freeStandUp('player')) {
                updateUI();
                maybeAutoEndTurn();
            }
        }

        // End the player's turn automatically if no actions are left
        function maybeAutoEndTurn() {
            if (gameState.currentPlayer === 'player' && gameState.phase === 'main' && !hasPlayableAction()) {
                addLog('No available actions. Ending turn automatically.');
                endTurn(true);
            }
        }

        function renderFighter(player) {
            const zone = document.getElementById(player === 'player' ? 'playerFighterZone' : 'opponentFighterZone');
            const feedId = (player === 'player' ? 'player' : 'opponent') + 'ActionFeed';

            // Find and temporarily detach the existing action feed to preserve all messages
            let existingFeed = document.getElementById(feedId);
            let feedToRestore = null;

            if (existingFeed && existingFeed.parentNode === zone) {
                // Detach it so it won't be cleared with innerHTML
                feedToRestore = zone.removeChild(existingFeed);
            }

            // Clear the zone
            zone.innerHTML = '';

            // Add fighter card or empty slot
            if (!gameState[player].activeFighter) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'empty-slot';
                emptySlot.textContent = 'No Active Fighter';
                zone.appendChild(emptySlot);
            } else {
                const fighter = gameState[player].activeFighter;
                const card = createFighterCard(fighter, player);
                zone.appendChild(card);
            }

            // Restore the preserved feed with all messages, or create new one if first time
            if (feedToRestore) {
                zone.appendChild(feedToRestore);
            } else {
                const feed = document.createElement('div');
                feed.id = feedId;
                feed.className = 'inline-action-feed';
                zone.appendChild(feed);
            }
        }

        function createFighterCard(fighter, owner) {
            const card = document.createElement('div');
            // Full corner theme: player = blue, opponent = red (driven by these classes in CSS).
            card.className = `card fighter-card ${owner === 'opponent' ? 'opponent-card' : 'player-card'}`;

            const staminaPercent = (fighter.hp / fighter.maxHp) * 100;

            // Show striking with bonus if active
            const strikingBonus = fighter.strikingBonus || 0;
            const strikingDisplay = strikingBonus > 0
                ? `${fighter.striking} <span class="stat-bonus">+${strikingBonus}</span>`
                : fighter.striking;

            card.innerHTML = `
                <div class="card-header">${fighter.name}</div>
                <div class="card-type">${fighter.style}</div>
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="card-stat-label">Striking:</span>
                        <span class="card-stat-value">${strikingDisplay}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">Grappling:</span>
                        <span class="card-stat-value">${fighter.grappling}</span>
                    </div>
                    <div class="card-stat">
                        <span class="card-stat-label">HP:</span>
                        <span class="card-stat-value">${fighter.hp}/${fighter.maxHp}</span>
                    </div>
                </div>
                <div class="stamina-bar-bg">
                    <div class="stamina-bar-fill" style="width: ${staminaPercent}%"></div>
                </div>
                ${gameState[owner].positionalAdvantage ? '<span class="positional-advantage">ADVANTAGE</span>' : ''}
            `;
            
            return card;
        }

        function renderHand() {
            const handArea = document.getElementById('playerHand');
            handArea.innerHTML = '';
            
            gameState.player.hand.forEach(card => {
                const cardElement = createHandCard(card);
                handArea.appendChild(cardElement);
            });
        }

        // Live stat rows for a technique card — reflect the CURRENT board (striking/grappling,
        // current stamina/fatigue, this turn's combo, positional advantage, defender's stats).
        // Green = better than printed, red = worse, so the player sees the payoff of chaining.
        function techniqueStatsHTML(card) {
            const me = gameState.player, foe = gameState.opponent;
            const live = !!(me.activeFighter && foe.activeFighter);
            const tone = (val, base) => (!live || val === base) ? '#fff' : (val > base ? '#51ff90' : '#ff7a7a');

            if (card.subtype === 'grappling') {
                // Takedowns are deterministic now — show the impact (lands unless stuffed).
                const impact = live ? calcTakedownImpact(card, me, foe) : card.damage;
                return `<div class="card-stat"><span class="card-stat-label">Impact:</span><span class="card-stat-value" style="color:${tone(impact, card.damage)}">${impact}</span></div>`;
            }

            if (card.subtype === 'strike' || card.subtype === 'submission') {
                const base = card.damage;
                const val = !live ? base : (card.subtype === 'strike' ? calcStrikeDamage(card, me, foe) : calcSubmissionDamage(card, me, foe));
                return `<div class="card-stat"><span class="card-stat-label">Damage:</span><span class="card-stat-value" style="color:${tone(val, base)}">${val}</span></div>`;
            }

            // Reactions and anything else: keep the printed value (if any).
            return card.damage ? `<div class="card-stat"><span class="card-stat-label">Damage:</span><span class="card-stat-value">${card.damage}</span></div>` : '';
        }

        function createHandCard(card) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            if (card.type === 'fighter') {
                cardElement.className += ' fighter-card';
            } else if (card.type === 'technique') {
                cardElement.className += ' technique-card';
                if (card.subtype === 'defense') {
                    cardElement.className += ' defense-card';
                }
            } else if (card.type === 'corner') {
                cardElement.className += ' corner-card';
            }

            let canPlay = false;
            if (card.type === 'fighter') {
                // Can play fighter if no active fighter
                canPlay = !gameState.player.activeFighter;
            } else if (card.type === 'technique') {
                // Enough energy, an active fighter, and legal from the current position
                // (defense/reaction cards are never "playable" on your own turn).
                canPlay = card.energy <= gameState.player.energy
                    && !!gameState.player.activeFighter
                    && card.subtype !== 'defense'
                    && isTechniquePositionLegal(card, gameState.player, gameState.opponent);
            } else if (card.type === 'corner') {
                // Can play corner if have enough energy AND have active fighter
                canPlay = card.energy <= gameState.player.energy && gameState.player.activeFighter;
            }

            if (!canPlay || gameState.currentPlayer !== 'player' || gameState.phase !== 'main') {
                cardElement.classList.add('disabled');
            } else {
                // Highlight playable cards
                cardElement.classList.add('glow');
            }
            
            if (card.type === 'fighter') {
                const staminaPercent = (card.hp / card.maxHp) * 100;
                const staminaColor = staminaPercent > 50 ? '#4ecca3' : staminaPercent > 25 ? '#ffd700' : '#e94560';

                cardElement.innerHTML = `
                    <div class="card-header">${card.name}</div>
                    <div class="card-type">${card.style}</div>
                    <div class="card-stats">
                        <div class="card-stat">
                            <span class="card-stat-label">Striking:</span>
                            <span class="card-stat-value">${card.striking}</span>
                        </div>
                        <div class="card-stat">
                            <span class="card-stat-label">Grappling:</span>
                            <span class="card-stat-value">${card.grappling}</span>
                        </div>
                        <div class="card-stat">
                            <span class="card-stat-label">HP:</span>
                            <span class="card-stat-value" style="color: ${staminaColor}">${card.hp}/${card.maxHp}</span>
                        </div>
                    </div>
                    <div class="stamina-bar-bg">
                        <div class="stamina-bar-fill" style="width: ${staminaPercent}%;"></div>
                    </div>
                `;
            } else if (card.type === 'technique') {
                cardElement.innerHTML = `
                    <div class="card-energy">${card.energy}</div>
                    <div class="card-header">${card.name}</div>
                    <div class="card-type">${card.subtype === 'defense' ? '⚡ Reaction' : card.subtype.charAt(0).toUpperCase() + card.subtype.slice(1)}</div>
                    ${techniqueStatsHTML(card)}
                    <div class="card-ability">${card.effect}</div>
                `;
            } else if (card.type === 'corner') {
                cardElement.innerHTML = `
                    <div class="card-energy">${card.energy}</div>
                    <div class="card-header">${card.name}</div>
                    <div class="card-type">Corner Card</div>
                    <div class="card-ability">${card.effect}</div>
                `;
            }
            
            cardElement.onclick = () => playCard(card, 'player');
            
            return cardElement;
        }

        // Start the game when page loads
        window.onload = initGame;
