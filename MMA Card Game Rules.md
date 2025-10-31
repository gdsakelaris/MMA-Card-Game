# MMA WARRIORS - MMA Card Game Rules

## Game Overview

MMA Warriors is a 1v1 MMA-themed card game where players build decks of fighters and techniques to defeat their opponent. Players manage energy, deploy fighters, and use striking, grappling, and submission techniques in strategic combat.

---

## Game Components

### Deck Composition (50 cards total)

- **8 Fighter Cards** - Randomly selected from a pool of 15 UFC fighters
- **32 Technique Cards** - Strikes, grappling moves, submissions, and defensive techniques
- **10 Corner Cards** - Support cards that provide buffs and healing

### Player Resources

- **Health**: 100 (shared across all fighters)
- **Energy**: Starts at 7, gains +2 per turn, max 12
- **Hand Limit**: 10 cards maximum
- **Fighter Card Limit**: Maximum 2 fighter cards in hand during gameplay (3 allowed in opening hand before first fighter deployment)

---

## Fighter Cards

### Fighter Stats

Each fighter has four core stats:

1. **Striking** - Offensive power for strikes, adds to strike damage, affects parry counters
2. **Grappling** - Offensive power for takedowns and submissions, defends against takedowns and submissions, affects Ground and Pound damage
3. **Defense** - Reduces incoming strike damage only
4. **Stamina** - Fighter's individual health pool (when reduced to 0, fighter is KO'd)

### Fighter Styles

Fighters are labeled with one of three styles (shown as just the style name, not "Fighter"):

- **Striker** - +2 damage to all strikes (including Ground and Pound)
- **Grappler** - +2 to takedown success chance AND +2 damage to all submissions
- **Balanced** - No specific bonus

### Example Fighters

- **Islam Makhachev** - Grappler (Striking: 6, Grappling: 10, Defense: 8, Stamina: 40)
- **Alex Pereira** - Striker (Striking: 10, Grappling: 4, Defense: 6, Stamina: 34)
- **Alexander Volkanovski** - Balanced (Striking: 8, Grappling: 8, Defense: 9, Stamina: 42)
- **Ilia Topuria** - Balanced (Striking: 9, Grappling: 7, Defense: 7, Stamina: 38)
- **Merab Dvalishvili** - Grappler (Striking: 6, Grappling: 9, Defense: 7, Stamina: 45)
- **Charles Oliveira** - Grappler (Striking: 7, Grappling: 10, Defense: 6, Stamina: 36)
- **Max Holloway** - Striker (Striking: 9, Grappling: 6, Defense: 7, Stamina: 45)

---

## Technique Cards

### Strikes

**Deal damage and reset fight to standing position (unless Ground and Pound)**

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

- **Ground and Pound** - 3 Energy, 6 damage (requires positional advantage, keeps fight on ground, bonus damage scales with grappling)

**Strike Damage Formula:**

```
Damage = Card Damage
       + Attacker Striking
       + Striking Bonus (from corner cards)
       - Defender Defense
       + Style Bonus (+2 if Striker)
       - Defense Buffs (Block/Parry if active)

Ground and Pound Bonus (when attacker has advantage):
       + (3 + floor(Attacker Grappling / 4))

Minimum damage = Card Damage
```

### Grappling (Takedowns)

**Attempt to gain positional advantage**

- **Clinch** - 2 Energy, +2 bonus, 1 damage on success
- **Single Leg Takedown** - 3 Energy, +2 bonus, 2 damage on success
- **Double Leg Takedown** - 4 Energy, +3 bonus, 3 damage on success
- **Suplex** - 5 Energy, +4 bonus, 5 damage on success

**Takedown Success (Probabilistic):**

1. **Attacker Score** = Attacker Grappling + Card Bonus + Style Bonus (+2 if Grappler)
2. **Defender Score** = Defender Grappling - Stamina Penalties
   - 100-70% stamina: No penalty
   - 70-50% stamina: -1 grappling
   - 50-30% stamina: -2 grappling
   - Below 30% stamina: -3 grappling
3. **Success Chance** = 50% base + 10% per point of difference
4. **Clamped** between 10% minimum and 90% maximum
5. **Random roll** determines if takedown succeeds

**If successful:**
- Attacker gains positional advantage
- Impact damage = Card Damage + floor(Attacker Grappling / 3) - floor(Defender Grappling / 3)
- Minimum impact damage = Card Damage

### Submissions

**Deal heavy damage while on the ground (requires ground position)**

- **Guillotine Choke** - 3 Energy, 10 base damage
- **Armbar** - 4 Energy, 12 base damage
- **Kimura** - 4 Energy, 11 base damage
- **Triangle Choke** - 4 Energy, 13 base damage
- **Rear Naked Choke** - 5 Energy, 15 base damage
- **D'Arce Choke** - 5 Energy, 14 base damage

**Submission Requirements:**

- Fight must be on ground (either player has positional advantage)
- Cannot be used when both fighters are standing
- Always land (cannot be completely defended)

**Submission Damage Formula:**

```
Step 1: Apply position modifier to base damage
  Base Damage = Card Damage
  If Attacker has advantage (top position): Base Damage × 1.0 (no change)
  If Defender has advantage (bottom position): Base Damage × 0.6 (60% penalty)

Step 2: Add skill differential
  Grappling Bonus = Attacker Grappling + Style Bonus (+2 if Grappler)
  Grappling Defense = Defender Grappling

Step 3: Calculate final damage
  Damage = Base Damage + Grappling Bonus - Grappling Defense
  Minimum damage = Base Damage (the position-modified amount)
```

**Position Effects:**
- **Top position (attacker has advantage)**: Full base damage
- **Bottom position (defender has advantage)**: Only 60% of base damage

**Note**: Grappling stat provides both offensive power AND defensive ability for submissions. The skill differential is NOT affected by position - only the technique's base effectiveness is modified.

### Defense Cards

**Reduce incoming damage on next strike**

- **Block** - 1 Energy, reduce next strike by 5 damage
- **Parry** - 2 Energy, reduce next strike by 3 damage, counter damage = 3 + floor(Defender Striking / 4)
- **Slip Counter** - 3 Energy, reduce next strike by 8 damage

**Note**: Parry counter damage scales with the defender's striking skill - better strikers counter more effectively.

---

## Corner Cards

- **Master Coach** - 3 Energy: **Permanently** increase all stats by +1 (Striking, Grappling, Defense). Draw 1 card.
- **Intense Training** - 2 Energy: Gain +3 Striking bonus until next strike is thrown (resets after strike is used)
- **Ringside Medic** - 3 Energy: Restore 10 Stamina (capped at maxStamina)

---

## Setup

1. Each player receives a shuffled 50-card deck
2. Each player draws an opening hand of 5 cards (4 random + 1 guaranteed fighter)
3. Opponent automatically deploys their best fighter
4. **Player chooses** which fighter to deploy from their opening hand
5. Opponent starts with 6 energy (displayed from start)
6. Player starts first

---

## Turn Structure

### Energy Phase

- **Turn 1 (Player)**: Start with 7 energy
- **Turn 2+ (Both players)**: Gain +2 energy per turn (max 12)
- Per-round bonuses reset (Intense Training bonus goes to 0)
- Status effects tick (Bleed damage applied)

### Draw Phase

- Draw 1 card from deck
- If hand is full (10 cards), oldest card is auto-discarded to make room
- Can **skip draw phase** to go directly to Main Phase

### Main Phase

Players can perform actions in any order:

- Deploy fighter (only if no active fighter currently deployed)
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
- **Persists through**:
  - Ground and Pound strikes
  - Submissions (allows submission chains)
- **Resets to standing when**:
  - Regular strikes are used (Jab, Cross, Hook, Kick, etc.)
  - Fighter is KO'd (new fight scenario)

### Status Effects

#### Bleed

- Applied by Cutting Elbow
- Deals 2 damage at start of each turn
- Lasts for 2 turns
- Shown in action feed with countdown

#### Staggered

- Applied by Spinning Back Fist
- Opponent skips their entire next turn (no energy gain, no draw, no actions)

### Fighter Knockout

When a fighter's stamina reaches 0:

1. Fighter is KO'd and removed from play
2. Player loses 20 health
3. Positional advantages are reset (new fight scenario)
4. **Check for fighters in HAND only** (after drawing if in draw phase):
   - If no fighters in hand: Player loses immediately
   - Only hand is checked for available fighters
5. **Player replacement** (manual selection):
   - Shows modal with all available fighters from HAND only
   - Player clicks to select which fighter to deploy
6. **Opponent replacement** (automatic):
   - Deploys from hand automatically
   - If no fighters in hand: Opponent loses

---

## Win Conditions

A player wins when:

1. **Opponent's health reaches 0**
2. **Opponent has no fighters in hand** when their active fighter is KO'd
3. **Opponent's deck is empty** when they need to draw

---

## Special Rules

### Hand Management

- Hand limit is strictly 10 cards total
- Fighter card limit is 2 fighters in hand during gameplay (3 allowed in opening hand)
- **Smart fighter drawing**: If you already have 2 fighters in hand and would draw a 3rd fighter, the game automatically draws a non-fighter card instead (fighter goes back in deck)
- If only fighters remain in deck and you're at fighter limit, draw fails
- Drawing with full hand (10 cards) auto-discards **oldest card** (first in hand)
- Can skip draw phase if hand is full

### Energy Management

- Energy does NOT carry over between turns
- Maximum energy cap is 12
- First turn energy is fixed at 7 for player, 6 for opponent (shown immediately)

### Stat Caps

- **Stamina**: Capped at maxStamina (cannot be healed above starting value)
- **Energy**: Capped at 12
- **Striking, Grappling, Defense**: **NO CAPS** - can grow infinitely via Master Coach

### Temporary vs Permanent Bonuses

- **Intense Training**: Temporary +3 striking bonus (shown in gold on fighter card, resets after next strike is thrown)
- **Master Coach**: Permanent +1 to all stats (visible on fighter card forever)

### Fighter Card Display

- Shows style as just the name: "Striker", "Grappler", "Balanced" (not "Striker Fighter")
- Striking stat shows temporary bonus in gold: "10 +3" if Intense Training is active
- Positional advantage shown as "⭐ ADVANTAGE" badge on fighter card

### AI Opponent Behavior

- Prioritizes healing when below 40% stamina
- 30% chance to play corner cards strategically
- Plays techniques randomly from valid options
- Will not use Ground and Pound without positional advantage
- Will not use submissions unless fight is on ground
- 70% chance to continue playing cards if energy remains

---

## Strategy Tips

### Deck Archetypes

- **Striker Build**: Focus on high-striking fighters, stack strike cards
- **Grappler Build**: Focus on high-grappling fighters, takedowns into submissions
- **Balanced Build**: Mix of styles with good defense fighters

### Key Tactics

1. **Stamina Management**: Tired fighters (low stamina %) have reduced takedown defense
2. **Submission Chains**: Use Ground and Pound to keep advantage, then chain submissions
3. **Defense for Strikes Only**: High defense only reduces strike damage, not takedowns
4. **Grappling is King**: Grappling stat attacks AND defends both takedowns and submissions, plus boosts Ground and Pound
5. **Energy Efficiency**: Low-cost cards allow multiple actions per turn
6. **Fighter Card Management**: Keep 2 fighters in hand as backup - running out of fighters in hand = instant loss
7. **Corner Card Timing**:
   - Master Coach for permanent stat boosts (expensive but valuable)
   - Intense Training right before your next strike (bonus persists across turns until strike is used)
   - Ringside Medic for critical heals
8. **Positional Control**: Ground and Pound keeps advantage for submission setups
9. **Bottom Position Risk**: Submissions from bottom do only 60% damage - try to gain top position first

### Fighter Priorities

- **High Grappling** (Islam 10, Charles 10): Defends takedowns, strong submissions, defends submissions, boosts Ground and Pound
- **High Defense** (Volkanovski 9, Belal 8): Takes less strike damage only
- **High Striking** (Alex Pereira 10, Ilia 9): Dangerous on the feet with Striker bonus, better parry counters
- **High Stamina** (Merab 45, Max 45): Can survive longer fights and resist late-fight takedowns

### Advanced Tips

- **Takedown Probability Math**: Each point of grappling advantage = +10% success chance (now grappling vs grappling)
- **Tired Fighters**: Below 50% stamina = -2 grappling for takedown defense (easier to take down)
- **Submission Defense**: High grappling fighters defend submissions better AND resist takedowns
- **Position Matters**: Bottom submissions only do 60% base damage - gain top control first
- **Grappling Scaling**: Better grapplers deal more Ground and Pound damage (+grappling/4)
- **Parry Scaling**: Better strikers deal more counter damage when parrying (+striking/4)
- **Hand Fighter Management**: Always keep 2 fighters in hand - you lose instantly if KO'd with no hand fighters
- **Smart Drawing**: Game won't waste your draw on a 3rd fighter - automatically draws non-fighters when at 2-fighter limit

---

## Game Flow Summary

1. **Opening**: Both players deploy opening fighters (player chooses from up to 3 in hand), player starts with 7 energy
2. **Draw Phase**: Draw 1 card (smart drawing prevents 3rd fighter), or skip if hand full
3. **Main Phase**: Play cards until no valid actions remain
4. **Combat**: Execute strikes, takedowns, submissions based on card types
5. **Fighter KO**: Player manually selects replacement from hand only (loses if no hand fighters)
6. **Turn End**: Pass to opponent
7. **Victory**: Reduce opponent health to 0 or opponent has no hand fighters when KO'd

---

## Technical Notes (Digital Version)

### Probability System

The digital version uses a probabilistic takedown system:

- Base 50% success rate
- +10% per point of grappling advantage over defender's grappling
- Defender's grappling reduced by stamina penalties (tired fighters)
- Clamped between 10-90% to ensure variance

### Damage Calculations

- All damage calculations ensure minimum = card base damage (or position-modified base for submissions)
- Striking bonus (Intense Training) shown in gold on fighter card
- All damage messages show final actual damage dealt
- Submissions scale with FULL grappling stats (not halved)
- Ground and Pound bonus scales with grappling (3 + grappling/4)
- Parry counter scales with striking (3 + striking/4)
- Takedown impact scales with grappling difference (grappling/3 vs grappling/3)

### Visual Feedback

- Action feed displays move announcements and results
- Floating text shows damage/healing over fighters
- Color coding: Red (damage), Green (healing), Yellow (advantage/info)
- Stamina bars update in real-time with color gradient

### Fighter Replacement

- Modal shows all fighters from HAND only
- Each fighter labeled with location: (Hand)
- Click any fighter to deploy immediately
- Modal title: "Select Replacement Fighter"
- If no fighters in hand after KO: Instant loss

---

## End Game Screens

**Victory**:

- Title: "🏆 VICTORY! 🏆"
- Message: "You defeated the opponent! [reason]"
- Button: "Play Again" (reloads page)

**Defeat**:

- Title: "💀 DEFEAT 💀"
- Message: "You were defeated! [reason]"
- Button: "Play Again" (reloads page)
- Modal styled in red

**Possible Reasons**:

- "Health depleted"
- "No fighters in hand"
- "Deck Out"

---

## Physical Card Game Adaptation

To play this without a computer:

1. **Takedown Resolution**:

   - Roll 1d10 + attacker's grappling vs 1d10 + defender's grappling
   - Tired fighters (below half stamina) roll 2d10 take lower
   - Higher total wins
2. **Damage Tracking**: Use dice or counters for stamina and health
3. **Energy Tracking**: Use tokens (start 7, gain +2 per turn, max 12)
4. **Status Effects**: Use status tokens/cards for Bleed and Stagger
5. **Probability Alternative**: Use simple comparison (grappling vs grappling) with d6 tiebreaker
6. **Fighter Deployment**: Only one active fighter at a time - cannot deploy fighters while one is active

---

*Document updated to match current digital implementation*
*Last Updated: Version 2.2 - Intense Training bonus now persists until next strike is thrown (not just until end of turn). Bench removed. Only one active fighter at a time. Updated formulas with grappling-based takedown defense, full grappling stat scaling for submissions, position-based submission modifiers, smart fighter drawing, hand-only fighter requirements, and skill-based scaling for Ground and Pound and Parry counters*
