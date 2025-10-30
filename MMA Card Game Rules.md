# OCTAGON WARRIORS - MMA Card Game Rules

## Game Overview
Octagon Warriors is a 1v1 MMA-themed card game where players build decks of fighters and techniques to defeat their opponent. Players manage energy, deploy fighters, and use striking, grappling, and submission techniques in strategic combat.

---

## Game Components

### Deck Composition (50 cards total)
- **8 Fighter Cards** - Randomly selected from a pool of 15 UFC fighters
- **32 Technique Cards** - Strikes, grappling moves, submissions, and defensive techniques
- **10 Corner Cards** - Support cards that provide buffs and healing

### Player Resources
- **Health**: 100 (shared across all fighters)
- **Energy**: Starts at 7, max 12
- **Hand Limit**: 10 cards maximum

---

## Fighter Cards

### Fighter Stats
Each fighter has four core stats:

1. **Striking** - Offensive power for strikes, adds to strike damage
2. **Grappling** - Offensive power for takedowns and submissions
3. **Defense** - Reduces incoming strike damage AND defends against takedowns
4. **Stamina** - Fighter's health pool (when reduced to 0, fighter is KO'd)

### Fighter Styles
Fighters have one of three styles that provide bonuses:

- **Striker** - +2 damage to all strikes
- **Grappler** - +2 to all grappling attempts (takedowns and submissions)
- **Balanced** - No specific bonus

### Example Fighters
- **Islam Makhachev** - Grappler (Striking: 6, Grappling: 10, Defense: 8, Stamina: 40)
- **Alex Pereira** - Striker (Striking: 10, Grappling: 4, Defense: 6, Stamina: 34)
- **Alexander Volkanovski** - Balanced (Striking: 8, Grappling: 8, Defense: 9, Stamina: 42)

---

## Technique Cards

### Strikes
**Cost damage and reset fight to standing position (unless Ground and Pound)**

#### Low Cost Strikes (1-2 Energy)
- **Quick Jab** - 1 Energy, 3 damage
- **Leg Kick** - 2 Energy, 4 damage
- **Body Shot** - 2 Energy, 4 damage
- **Teep Kick** - 2 Energy, 3 damage

#### Medium Cost Strikes (3 Energy)
- **Power Cross** - 3 Energy, 6 damage
- **Cutting Elbow** - 3 Energy, 5 damage + Bleed (2 damage for 2 turns)
- **Uppercut** - 3 Energy, 6 damage

#### High Cost Strikes (4-5 Energy)
- **Heavy Hook** - 4 Energy, 8 damage
- **Spinning Back Fist** - 4 Energy, 7 damage (opponent skips next turn if lands)
- **Head Kick** - 5 Energy, 10 damage

#### Special Strike
- **Ground and Pound** - 3 Energy, 6 damage + 3 bonus (requires positional advantage, keeps fight on ground)

**Strike Damage Formula:**
```
Damage = Card Damage + Striker's Striking + Striking Bonus - Defender's Defense
+ Style Bonus (+2 if Striker)
- Defense Buffs (if active)
Minimum 1 damage
```

### Grappling (Takedowns)
**Attempt to gain positional advantage**

- **Clinch** - 2 Energy, +2 bonus, 1 damage on success
- **Single Leg Takedown** - 3 Energy, +2 bonus, 2 damage on success
- **Double Leg Takedown** - 4 Energy, +3 bonus, 3 damage on success
- **Suplex** - 5 Energy, +4 bonus, 5 damage on success

**Takedown Success (Probabilistic):**
1. Calculate Attacker's Score = Grappling + Card Bonus + Style Bonus (+2 if Grappler)
2. Calculate Defender's Score = Defense - Stamina Penalties
3. Success Chance = 50% base + 10% per point of advantage
4. Clamped between 10% minimum and 90% maximum
5. Roll random number to determine success

**Stamina Penalties to Defense:**
- 100-70% stamina: No penalty
- 70-50% stamina: -1 defense
- 50-30% stamina: -2 defense
- Below 30% stamina: -3 defense

### Submissions
**Deal heavy damage while on the ground (requires ground position)**

- **Guillotine Choke** - 3 Energy, 10 damage
- **Armbar** - 4 Energy, 12 damage
- **Kimura** - 4 Energy, 11 damage
- **Triangle Choke** - 4 Energy, 13 damage
- **Rear Naked Choke** - 5 Energy, 15 damage
- **D'Arce Choke** - 5 Energy, 14 damage

**Submission Requirements:**
- Fight must be on ground (either player has positional advantage)
- Submissions always land (cannot be completely stuffed)

**Submission Damage Formula:**
```
Base Damage = Card Damage + (Attacker's Grappling / 2) - Defender's Defense
If Attacker has advantage: Full damage
If Defender has advantage: 60% damage (attempting from bottom)
Minimum 1 damage
```

### Defense Cards
**Reduce incoming damage on next strike**

- **Block** - 1 Energy, reduce next strike by 5 damage
- **Parry** - 2 Energy, reduce next strike by 3 damage, counter for 3 damage
- **Slip Counter** - 3 Energy, reduce next strike by 8 damage

---

## Corner Cards

- **Master Coach** - 3 Energy: Active fighter gains +1 to all stats (permanent), draw 1 card
- **Intense Training** - 2 Energy: Fighter gains +3 Striking this round (temporary)
- **Ringside Medic** - 3 Energy: Restore 10 Stamina to active fighter

---

## Game Setup

1. Each player receives a shuffled 50-card deck
2. Each player draws an opening hand of 5 cards (4 random + 1 guaranteed fighter)
3. Opponent automatically deploys their best fighter
4. Player chooses which fighter to deploy (if multiple in hand)
5. Opponent starts with 6 energy

---

## Turn Structure

### Energy Phase
- **Turn 1 (Player)**: Start with 7 energy
- **Turn 2+ (Both players)**: Gain +2 energy per turn (max 12)

### Draw Phase
- Draw 1 card from deck
- If hand is full (10 cards), oldest card is auto-discarded to make room
- Can skip draw phase to go directly to Main Phase

### Main Phase
Players can perform actions in any order:
- Deploy fighters (to active zone or bench, max 5 on bench)
- Play technique cards (requires active fighter and sufficient energy)
- Play corner cards (requires active fighter and sufficient energy)
- Actions continue until no playable cards remain

### End Phase
- Hand is discarded down to 10 cards if over limit
- Turn passes to opponent

---

## Combat Mechanics

### Positional Advantage
- Gained by successful takedowns
- Required for Ground and Pound and submissions
- **Persists** until a regular strike is used (not Ground and Pound/submissions)
- Allows submission chains and ground control

### Status Effects

#### Bleed
- Applied by Cutting Elbow
- Deals damage at start of each turn
- Lasts for specified number of turns

#### Staggered
- Applied by Spinning Back Fist
- Opponent skips their next turn entirely

### Fighter Knockout
When a fighter's stamina reaches 0:
1. Fighter is KO'd and removed
2. Player loses 20 health
3. Positional advantages are reset (new fight scenario)
4. Replacement priority:
   - First: Promote from bench
   - Second: Deploy from hand
   - Third: Draw from deck until fighter found

**If no fighters remain anywhere (deck, hand, bench): Player loses**

---

## Win Conditions

A player wins when:
1. **Opponent's health reaches 0**
2. **Opponent has no fighters remaining** (deck, hand, and bench all empty)
3. **Opponent's deck is empty** and they cannot draw

---

## Special Rules

### Hand Management
- Hand limit is strictly 10 cards
- Drawing with full hand auto-discards oldest card
- Can skip draw phase if hand is full

### Energy Management
- Energy does NOT carry over between turns
- Maximum energy cap is 12
- First turn energy is fixed at 7 for each player

### AI Opponent Behavior
- Prioritizes healing when below 40% stamina
- 30% chance to play corner cards strategically
- Plays techniques randomly from valid options
- Will not use Ground and Pound without positional advantage
- Will not use submissions unless fight is on ground

---

## Strategy Tips

### Deck Archetypes
- **Striker Build**: Focus on high-striking fighters, stack strike cards
- **Grappler Build**: Focus on high-grappling fighters, takedowns into submissions
- **Balanced Build**: Mix of styles with good defense fighters

### Key Tactics
1. **Stamina Management**: Tired fighters are easier to take down
2. **Submission Chains**: Use Ground and Pound to keep advantage, then chain submissions
3. **Defense Matters**: High defense fighters resist both strikes AND takedowns
4. **Energy Efficiency**: Low-cost cards allow multiple actions per turn
5. **Corner Card Timing**: Save heals for critical moments, use buffs before big attacks

### Fighter Priorities
- **High Defense** (Volkanovski, Belal Muhammad): Hard to take down and take less damage
- **High Grappling** (Islam, Charles Oliveira): Dominant ground game
- **High Striking** (Alex Pereira, Max Holloway): Dangerous on the feet
- **High Stamina** (Merab, Max Holloway): Can survive longer fights

---

## Game Flow Summary

1. **Opening**: Deploy fighters, start with 7 energy
2. **Early Game**: Build energy pool, establish position
3. **Mid Game**: Trade strikes, attempt takedowns, manage stamina
4. **Late Game**: Finish weakened fighters, manage bench replacements
5. **Victory**: Reduce opponent health to 0 or eliminate all their fighters

---

## Technical Notes (Digital Version)

### Probability System
The digital version uses a probabilistic takedown system:
- Base 50% success rate
- +10% per point of grappling advantage
- Adjusted by defender's stamina level
- Clamped between 10-90% to ensure variance

### Damage Calculations
All damage calculations ensure minimum 1 damage to prevent complete negation.

### Message System
- Action feed displays move announcements and results
- Floating text shows damage/healing over fighters
- Color coding: Red (damage), Green (healing), Yellow (advantage)

---

## Physical Card Game Adaptation

To play this without a computer, consider:

1. **Takedown Resolution**: Roll 1d6 + grappling vs 1d6 + defense (tired fighters roll 2d6, take lower)
2. **Damage Tracking**: Use dice or counters for stamina
3. **Energy Tracking**: Use tokens or dice
4. **Status Effects**: Use status tokens/cards

---

*Last Updated: Current digital implementation*
