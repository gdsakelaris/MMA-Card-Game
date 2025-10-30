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
- **Energy**: Starts at 7, gains +2 per turn, max 12
- **Hand Limit**: 10 cards maximum
- **Bench**: Maximum 5 fighters

---

## Fighter Cards

### Fighter Stats

Each fighter has four core stats:

1. **Striking** - Offensive power for strikes, adds to strike damage
2. **Grappling** - Offensive power for takedowns, adds to submission damage, defends submissions
3. **Defense** - Reduces incoming strike damage AND defends against takedowns
4. **Stamina** - Fighter's individual health pool (when reduced to 0, fighter is KO'd)

### Fighter Styles

Fighters are labeled with one of three styles (shown as just the style name, not "Fighter"):

- **Striker** - +2 damage to all strikes
- **Grappler** - +2 to all grappling/takedown attempts
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

- **Ground and Pound** - 3 Energy, 6 damage + 3 bonus (requires positional advantage, keeps fight on ground)

**Strike Damage Formula:**

```
Damage = Card Damage + Striking + Striking Bonus - Defense
+ Style Bonus (+2 if Striker)
- Defense Buffs (Block/Parry if active)
Ground and Pound: +3 bonus damage
Minimum 1 damage
```

### Grappling (Takedowns)

**Attempt to gain positional advantage**

- **Clinch** - 2 Energy, +2 bonus, 1 damage on success
- **Single Leg Takedown** - 3 Energy, +2 bonus, 2 damage on success
- **Double Leg Takedown** - 4 Energy, +3 bonus, 3 damage on success
- **Suplex** - 5 Energy, +4 bonus, 5 damage on success

**Takedown Success (Probabilistic):**

1. **Attacker Score** = Grappling + Card Bonus + Style Bonus (+2 if Grappler)
2. **Defender Score** = Defense - Stamina Penalties
   - 100-70% stamina: No penalty
   - 70-50% stamina: -1 defense
   - 50-30% stamina: -2 defense
   - Below 30% stamina: -3 defense
3. **Success Chance** = 50% base + 10% per point of difference
4. **Clamped** between 10% minimum and 90% maximum
5. **Random roll** determines if takedown succeeds

If successful: Attacker gains positional advantage + deals card's impact damage

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
- Always land (cannot be completely defended)

**Submission Damage Formula:**

```
Damage = Card Damage + (Attacker Grappling / 2) - (Defender Grappling / 2)
+ Position Modifier:
  - Attacker has advantage: +2 damage
  - Defender has advantage: -2 damage
Minimum 1 damage
```

**Note**: Grappling stat provides both offensive power AND defensive ability for submissions

### Defense Cards

**Reduce incoming damage on next strike**

- **Block** - 1 Energy, reduce next strike by 5 damage
- **Parry** - 2 Energy, reduce next strike by 3 damage, counter for 3 damage
- **Slip Counter** - 3 Energy, reduce next strike by 8 damage

---

## Corner Cards

- **Master Coach** - 3 Energy: **Permanently** increase all stats by +1 (Striking, Grappling, Defense). Draw 1 card.
- **Intense Training** - 2 Energy: **Temporarily** gain +3 Striking bonus for this round only (resets next turn)
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
4. **Player replacement** (manual selection):
   - Shows modal with all available fighters from bench, hand, AND deck
   - Player clicks to select which fighter to deploy
   - If no fighters anywhere: Player loses
5. **Opponent replacement** (automatic):
   - Promotes from bench first
   - Then deploys from hand
   - Then draws from deck until fighter found
   - If no fighters anywhere: Opponent loses

---

## Win Conditions

A player wins when:

1. **Opponent's health reaches 0**
2. **Opponent has no fighters remaining** (deck, hand, and bench all empty)
3. **Opponent's deck is empty** when they need to draw

---

## Special Rules

### Hand Management

- Hand limit is strictly 10 cards
- Drawing with full hand auto-discards **oldest card** (first in hand)
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

- **Intense Training**: Temporary +3 striking bonus (shown in gold on fighter card, resets each turn)
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

1. **Stamina Management**: Tired fighters (low stamina %) are easier to take down
2. **Submission Chains**: Use Ground and Pound to keep advantage, then chain submissions
3. **Defense Matters**: High defense fighters resist both strikes AND takedowns
4. **Grappling Dual Purpose**: Grappling stat both attacks AND defends submissions
5. **Energy Efficiency**: Low-cost cards allow multiple actions per turn
6. **Corner Card Timing**:
   - Master Coach for permanent stat boosts (expensive but valuable)
   - Intense Training before big strike combos
   - Ringside Medic for critical heals
7. **Positional Control**: Ground and Pound keeps advantage for submission setups

### Fighter Priorities

- **High Defense** (Volkanovski 9, Belal 8): Hard to take down AND take less strike damage
- **High Grappling** (Islam 10, Charles 10): Dominant ground game, strong submissions, good submission defense
- **High Striking** (Alex Pereira 10, Ilia 9): Dangerous on the feet with Striker bonus
- **High Stamina** (Merab 45, Max 45): Can survive longer fights

### Advanced Tips

- **Takedown Probability Math**: Each point of grappling advantage = +10% success chance
- **Tired Fighters**: Below 50% stamina = -2 defense vs takedowns (easier to take down)
- **Submission Defense**: High grappling fighters defend submissions better (Charles Oliveira)
- **Strike vs Submission Trade-off**: Submissions deal ~50% more damage but require takedown setup
- **Bench Management**: Keep strong fighters on bench for KO replacements

---

## Game Flow Summary

1. **Opening**: Both players deploy opening fighters, player starts with 7 energy
2. **Draw Phase**: Draw 1 card (or skip if hand full)
3. **Main Phase**: Play cards until no valid actions remain
4. **Combat**: Execute strikes, takedowns, submissions based on card types
5. **Fighter KO**: Player manually selects replacement from bench/hand/deck
6. **Turn End**: Pass to opponent
7. **Victory**: Reduce opponent health to 0 or eliminate all their fighters

---

## Technical Notes (Digital Version)

### Probability System

The digital version uses a probabilistic takedown system:

- Base 50% success rate
- +10% per point of grappling advantage over defender's defense
- Defender's defense reduced by stamina penalties (tired fighters)
- Clamped between 10-90% to ensure variance

### Damage Calculations

- All damage calculations ensure minimum 1 damage
- Striking bonus (Intense Training) shown in gold on fighter card
- All damage messages show final actual damage dealt

### Visual Feedback

- Action feed displays move announcements and results
- Floating text shows damage/healing over fighters
- Color coding: Red (damage), Green (healing), Yellow (advantage/info)
- Stamina bars update in real-time with color gradient

### Fighter Replacement

- Modal shows all fighters from bench, hand, AND deck
- Each fighter labeled with location: (Bench), (Hand), or (Deck)
- Click any fighter to deploy immediately
- Modal title: "Select Replacement Fighter"

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
- "No fighters remaining"
- "Deck Out"

---

## Physical Card Game Adaptation

To play this without a computer:

1. **Takedown Resolution**:

   - Roll 1d10 + attacker's grappling vs 1d10 + defender's defense
   - Tired fighters (below half stamina) roll 2d10 take lower
   - Higher total wins
2. **Damage Tracking**: Use dice or counters for stamina and health
3. **Energy Tracking**: Use tokens (start 7, gain +2 per turn, max 12)
4. **Status Effects**: Use status tokens/cards for Bleed and Stagger
5. **Probability Alternative**: Use simple comparison (grappling vs defense) with d6 tiebreaker

---

*Document updated to match current digital implementation*
*Last Updated: Current version with probabilistic takedowns, manual fighter selection, and refined mechanics*
