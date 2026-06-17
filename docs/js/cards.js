        /* =====================================================================
           cards.js — the card database (v4 physical-playable model)

           Fighters have THREE stats: Striking (1-5), Grappling (1-5), HP.
           Damage is simply: card base + the relevant skill (+ strike combo).
           No Defense stat, no stamina-fatigue math — defending is done with cards.

           Per-card fields:
             damage        base damage printed on the card
             energy        energy cost to play
             copies        how many are in each deck (rarity: stronger = rarer)
             skill         which stat a strike scales with ('striking' default,
                           'grappling' for Ground & Pound)
             strikeType    'punch' | 'kick' | 'elbow' | 'ground' (for reactions)
             subPosition   submissions: 'any' (flying from clinch / guard / top)
                           | 'ground' (top or bottom only — NOT the clinch)
                           | 'dominant' (top control only)
             clinchLegal   strike: a short inside strike that can also be thrown in the clinch
             onHitSeparate strike: a clean hit breaks back to neutral (Upkick)
             guardBonus    submission: bonus damage added when thrown from the bottom (guard)
             addsGrapplingOffTop  submission: adds Grappling even off the top (Armbar finishes anywhere)
             // Submission damage: DOMINANT top = base + Grappling; off the top (clinch/guard) = BASE ONLY.
             onHitStatus   strike: clean-hit status — { type:'bleed'|'legDamage', amount, turns? }
             onHitSpacing  strike: clean hit keeps them at range (no clinch/takedown next turn)
             energyDrain   strike: clean hit saps this much opponent energy (cardio)
             ignoresReduce strike: a 'reduce' reaction (Block) can't soften it
             canKnockdown  strike: a power strike that knocks down on a clean 8+ (cheap pokes never do)
             escapeType    'standup' | 'reversal'
             reactsTo      reaction: which attack subtypes it can answer
             reactsToStrikeType  reaction: only answers this strike type (e.g. 'kick')
             mitigation    reaction: 'reduce' | 'negate' | 'reverse'
             reduction     reaction: amount reduced when mitigation === 'reduce'
             counter       reaction: counter damage dealt to the attacker
           ===================================================================== */
        const cardDatabase = {
            fighters: [
                { id: 'fighter_1',  name: 'Ilia Topuria',          type: 'fighter', striking: 5, grappling: 4, hp: 26, maxHp: 26, style: 'Balanced' },
                { id: 'fighter_2',  name: 'Islam Makhachev',       type: 'fighter', striking: 3, grappling: 5, hp: 28, maxHp: 28, style: 'Grappler' },
                { id: 'fighter_3',  name: 'Merab Dvalishvili',     type: 'fighter', striking: 3, grappling: 5, hp: 32, maxHp: 32, style: 'Grappler' },
                { id: 'fighter_4',  name: 'Khamzat Chimaev',       type: 'fighter', striking: 4, grappling: 5, hp: 28, maxHp: 28, style: 'Grappler' },
                { id: 'fighter_5',  name: 'Alexandre Pantoja',     type: 'fighter', striking: 3, grappling: 5, hp: 25, maxHp: 25, style: 'Grappler' },
                { id: 'fighter_6',  name: 'Alex Pereira',          type: 'fighter', striking: 5, grappling: 1, hp: 22, maxHp: 22, style: 'Striker' },
                { id: 'fighter_7',  name: 'Alexander Volkanovski', type: 'fighter', striking: 4, grappling: 4, hp: 30, maxHp: 30, style: 'Balanced' },
                { id: 'fighter_8',  name: 'Jack Della Maddalena',  type: 'fighter', striking: 5, grappling: 2, hp: 25, maxHp: 25, style: 'Striker' },
                { id: 'fighter_9',  name: 'Tom Aspinall',          type: 'fighter', striking: 5, grappling: 4, hp: 27, maxHp: 27, style: 'Balanced' },
                { id: 'fighter_10', name: 'Dricus Du Plessis',     type: 'fighter', striking: 4, grappling: 4, hp: 28, maxHp: 28, style: 'Balanced' },
                { id: 'fighter_11', name: 'Magomed Ankalaev',      type: 'fighter', striking: 4, grappling: 4, hp: 28, maxHp: 28, style: 'Balanced' },
                { id: 'fighter_12', name: 'Max Holloway',          type: 'fighter', striking: 5, grappling: 3, hp: 32, maxHp: 32, style: 'Striker' },
                { id: 'fighter_13', name: 'Belal Muhammad',        type: 'fighter', striking: 3, grappling: 5, hp: 30, maxHp: 30, style: 'Grappler' },
                { id: 'fighter_14', name: 'Arman Tsarukyan',       type: 'fighter', striking: 4, grappling: 4, hp: 26, maxHp: 26, style: 'Balanced' },
                { id: 'fighter_15', name: 'Charles Oliveira',      type: 'fighter', striking: 4, grappling: 5, hp: 25, maxHp: 25, style: 'Grappler' },
                { id: 'fighter_16', name: 'Petr Yan',              type: 'fighter', striking: 5, grappling: 3, hp: 28, maxHp: 28, style: 'Striker' },
                { id: 'fighter_17', name: 'Justin Gaethje',        type: 'fighter', striking: 5, grappling: 2, hp: 25, maxHp: 25, style: 'Striker' },
                { id: 'fighter_18', name: 'Sean Strickland',       type: 'fighter', striking: 4, grappling: 3, hp: 32, maxHp: 32, style: 'Striker' },
                { id: 'fighter_19', name: 'Joshua Van',            type: 'fighter', striking: 4, grappling: 3, hp: 29, maxHp: 29, style: 'Striker' },
                { id: 'fighter_20', name: 'Ciryl Gane',            type: 'fighter', striking: 5, grappling: 2, hp: 26, maxHp: 26, style: 'Striker' }
            ],
            techniques: [
                // === STANDUP STRIKES (damage = base + Striking, only from neutral) ===
                { id: 'tech_jab',      name: 'Quick Jab',          type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 1, damage: 2, copies: 4, effect: 'Strike: 2 + Striking. Cheap — great for stacking a combo.' },
                { id: 'tech_teep',     name: 'Teep Kick',          type: 'technique', subtype: 'strike', strikeType: 'kick',  energy: 1, damage: 2, copies: 3, onHitSpacing: true, effect: 'Strike: 2 + Striking. Push kick — keeps them at range (no clinch or takedown on their next turn).' },
                { id: 'tech_legkick',  name: 'Leg Kick',           type: 'technique', subtype: 'strike', strikeType: 'kick',  energy: 1, damage: 3, copies: 3, onHitStatus: { type: 'legDamage', amount: CONFIG.legDamagePerHit }, effect: 'Strike: 3 + Striking. Chops the legs: stacking -1 to ALL their strikes (clean hit).' },
                { id: 'tech_bodyshot', name: 'Body Shot',          type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 2, damage: 3, copies: 3, clinchLegal: true, energyDrain: CONFIG.bodyShotEnergyDrain, effect: 'Strike: 3 + Striking. To the body: saps 2 energy (cardio) on a clean hit. A short inside shot — also legal in the clinch.' },
                { id: 'tech_cross',    name: 'Power Cross',        type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 2, damage: 4, copies: 2, ignoresReduce: true, effect: 'Strike: 4 + Striking. Straight power — a Block can\'t soften it; only a full Parry or Slip stops it.' },
                { id: 'tech_elbow',    name: 'Cutting Elbow',      type: 'technique', subtype: 'strike', strikeType: 'elbow', energy: 2, damage: 4, copies: 2, clinchLegal: true, groundStrike: true, onHitStatus: { type: 'bleed', amount: 2, turns: 2 }, effect: 'Strike: 4 + Striking. Bleed (2 dmg for 2 turns) on a clean hit. Legal standing, in the clinch, and from top control.' },
                { id: 'tech_uppercut', name: 'Uppercut',           type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 3, damage: 5, copies: 2, clinchLegal: true, effect: 'Strike: 5 + Striking. A short, heavy inside punch — also legal in the clinch.' },
                { id: 'tech_hook',     name: 'Heavy Hook',         type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 3, damage: 6, copies: 2, clinchLegal: true, canKnockdown: true, effect: 'Strike: 6 + Striking. A clean shot landing 8+ on its own power (not combo) scores a KNOCKDOWN. A short hook — also legal in the clinch.' },
                { id: 'tech_spinning', name: 'Spinning Back Fist', type: 'technique', subtype: 'strike', strikeType: 'punch', energy: 3, damage: 6, copies: 1, effect: 'Strike: 6 + Striking. Clean hit staggers — opponent skips their next turn.' },
                { id: 'tech_kick',     name: 'Head Kick',          type: 'technique', subtype: 'strike', strikeType: 'kick',  energy: 4, damage: 8, copies: 1, canKnockdown: true, effect: 'Strike: 8 + Striking. A clean hit is a KNOCKDOWN — they drop, you take top control.' },
                // === GROUND STRIKE (scales with Grappling, only from top control, keeps position) ===
                { id: 'tech_gnp',      name: 'Ground and Pound',   type: 'technique', subtype: 'strike', strikeType: 'ground', skill: 'grappling', energy: 1, damage: 3, copies: 3, effect: 'Top control only: deal 3 + Grappling for just 1 energy. Keeps you on top.' },
                // === UPKICK (from the bottom only; a clean hit kicks them off and you scramble up) ===
                { id: 'tech_upkick',   name: 'Upkick',             type: 'technique', subtype: 'strike', strikeType: 'upkick', energy: 2, damage: 3, copies: 2, onHitSeparate: true, effect: 'Bottom only: 3 + Striking. A clean upkick knocks the top fighter off — both back to neutral.' },

                // === TAKEDOWNS (deterministic — land unless answered by a takedown defense) ===
                { id: 'tech_clinch',   name: 'Clinch',             type: 'technique', subtype: 'clinch', energy: 1, copies: 3, effect: 'Tie up in the clinch. From here you can throw short inside strikes (Uppercut, Heavy Hook, Body Shot, Cutting Elbow), shoot a takedown, or hit a flying submission.' },
                { id: 'tech_singleleg',name: 'Single Leg Takedown',type: 'technique', subtype: 'grappling', energy: 2, damage: 2, copies: 3, effect: 'Takedown: top control (2 + Grappling impact). Stopped by a takedown defense.' },
                { id: 'tech_takedown', name: 'Double Leg Takedown',type: 'technique', subtype: 'grappling', energy: 3, damage: 3, copies: 2, effect: 'Takedown: top control (3 + Grappling impact). Stopped by a takedown defense.' },
                { id: 'tech_suplex',   name: 'Suplex',             type: 'technique', subtype: 'grappling', energy: 4, damage: 5, copies: 1, effect: 'Takedown: a big slam (5 + Grappling impact), top control. Stopped by a takedown defense.' },

                // === SUBMISSIONS — from DOMINANT top: base + Grappling. Off the top (clinch/guard): BASE ONLY. ===
                { id: 'tech_guillotine',name: 'Guillotine Choke',  type: 'technique', subtype: 'submission', subPosition: 'any',      energy: 3, damage: 4, copies: 2, effect: 'Submission. From top control: 4 + Grappling. Off the top (clinch/guard): 4 (base only). Stopped by Submission Defense.' },
                { id: 'tech_kimura',   name: 'Kimura',             type: 'technique', subtype: 'submission', subPosition: 'ground',   energy: 3, damage: 5, copies: 2, effect: 'Submission (ground only — top or bottom, NOT the clinch). From top: 5 + Grappling. From the bottom: 5 (base only). Stopped by Submission Defense.' },
                { id: 'tech_triangle', name: 'Triangle Choke',     type: 'technique', subtype: 'submission', subPosition: 'any', guardBonus: 2,             energy: 4, damage: 6, copies: 1, effect: 'Submission. From top: 6 + Grappling. Off the top: 6 (base), +2 from your back (guard). Stopped by Submission Defense.' },
                { id: 'tech_armbar',   name: 'Armbar',             type: 'technique', subtype: 'submission', subPosition: 'any', addsGrapplingOffTop: true, energy: 4, damage: 6, copies: 1, effect: 'Submission: 6 + Grappling from ANY position (top, guard, or flying) — it finishes anywhere. Stopped by Submission Defense.' },
                { id: 'tech_darce',    name: 'D\'Arce Choke',      type: 'technique', subtype: 'submission', subPosition: 'ground',   energy: 4, damage: 7, copies: 1, effect: 'Submission (ground only — top or bottom, NOT the clinch). From top: 7 + Grappling. From the bottom: 7 (base only). Stopped by Submission Defense.' },
                { id: 'tech_choke',    name: 'Rear Naked Choke',   type: 'technique', subtype: 'submission', subPosition: 'dominant', energy: 4, damage: 8, copies: 1, effect: 'Submission (TOP control only): 8 + Grappling. Stopped by Submission Defense.' },

                // === ESCAPES (change ground position; reliable) ===
                { id: 'tech_standup',  name: 'Stand Up / Separate',type: 'technique', subtype: 'escape', escapeType: 'standup',  energy: 2, copies: 3, effect: 'From the bottom or the clinch: get back to a neutral standing position. (From top control you stand up for free — no card needed.)' },
                { id: 'tech_reversal', name: 'Reversal',           type: 'technique', subtype: 'escape', escapeType: 'reversal', energy: 3, copies: 2, effect: 'From the bottom: sweep and reverse to top control.' },

                // === REACTIONS (played in response to an attack — bank energy to use) ===
                // -- vs strikes --
                { id: 'tech_block', name: 'Block',         type: 'technique', subtype: 'defense', reactsTo: ['strike'], mitigation: 'reduce', reduction: 3, energy: 0, copies: 3, effect: 'Reaction to a strike: cover up, reduce it by 3. Free.' },
                { id: 'tech_parry', name: 'Parry',         type: 'technique', subtype: 'defense', reactsTo: ['strike'], mitigation: 'negate', energy: 0, copies: 2, effect: 'Reaction to a strike: deflect it completely (no damage). Free.' },
                { id: 'tech_slip',  name: 'Slip Counter',  type: 'technique', subtype: 'defense', reactsTo: ['strike'], mitigation: 'negate', counter: 3, energy: 1, copies: 2, effect: 'Reaction to a strike: slip it (no damage) and counter for 3.' },
                { id: 'tech_checkkick', name: 'Check Kick', type: 'technique', subtype: 'defense', reactsTo: ['strike'], reactsToStrikeType: 'kick', mitigation: 'negate', counter: 4, energy: 1, copies: 2, effect: 'Reaction to a KICK only: check it (no damage) and counter for 4 — eating a checked kick hurts.' },
                // -- vs takedowns --
                { id: 'tech_stuff',  name: 'Stuff',           type: 'technique', subtype: 'defense', reactsTo: ['grappling'], mitigation: 'negate', energy: 0, copies: 2, effect: 'Reaction to a takedown: stuff it, stay standing. Free.' },
                { id: 'tech_sprawl', name: 'Sprawl',          type: 'technique', subtype: 'defense', reactsTo: ['grappling'], mitigation: 'negate', counter: 2, energy: 1, copies: 2, effect: 'Reaction to a takedown: sprawl, stay standing and counter for 2.' },
                { id: 'tech_counterTd', name: 'Counter Takedown', type: 'technique', subtype: 'defense', reactsTo: ['grappling'], mitigation: 'reverse', energy: 1, copies: 1, effect: 'Reaction to a takedown: reverse it — YOU take them down to top control.' },
                // -- vs submissions --
                { id: 'tech_subdef', name: 'Submission Defense', type: 'technique', subtype: 'defense', reactsTo: ['submission'], mitigation: 'negate', energy: 0, copies: 3, effect: 'Reaction to a submission: defend the lock completely (no damage). Free.' }
            ],
            corners: [
                { id: 'corner_coach',    name: 'Master Coach',     type: 'corner', energy: 3, copies: 1, effect: 'Permanently +1 Striking and +1 Grappling to your fighter. Draw a card.' },
                { id: 'corner_training', name: 'Intense Training', type: 'corner', energy: 2, copies: 2, effect: '+2 Striking until your next strike.' },
                { id: 'corner_medic',    name: 'Ringside Medic',   type: 'corner', energy: 2, copies: 2, effect: 'Restore 6 HP to your fighter.' },
                { id: 'corner_energy',   name: 'Second Wind',      type: 'corner', energy: 0, copies: 2, effect: 'Free: gain +4 energy right now (up to your cap).' }
            ]
        };
