# Deck Frequency Rubric

How we decide **how many copies** of each card go in the 74-card play deck. This is a
**re-applyable heuristic, not a code formula** — at ~34 distinct cards a one-page rubric beats a
brittle runtime formula. **Re-run it after any change that shifts a card's effective power**
(new effects, energy/damage tuning, and especially **fighter signature abilities**, which change
what a card is worth).

> **Frequency ≠ power.** "Stronger = rarer" is only one of three inputs. Used alone it mis-tunes
> this deck, because enablers (Jab, Clinch, Stand Up) and reactions (Submission Defense) price on
> *role* and *what they answer*, not on raw damage.

---

## The three axes

1. **Power / efficiency — the rarity spine.** Estimate **value-per-energy, discounted for
   conditionality** (position-gated, reaction-answerable, clean-hit-only) — *not* printed damage.
   Cheap unconditional value is common; gated/expensive/high-variance value is rare.
2. **Role weight.** *Enablers* the loop needs often (combo starters, position-changers, escapes)
   are nudged toward common — but **capped** (you never want 5 of a 0-damage utility card).
   *Finishers / luxuries* are pushed rare.
3. **Answer-to-attack ratio (reactions only).** A reaction's count tracks the **frequency of the
   attacks it answers**, independent of its own power. Targets in this deck:
   - Strikes ≈ **1 : 2.5** (23 strike copies → ~9 answers)
   - Takedowns ≈ **1 : 1.2** (6 takedown copies → ~5 answers)
   - Submissions ≈ **1 : 2.7** (8 submission copies → ~3 answers)

## Guardrails

- **Total = 74** (67 techniques + 7 corners) — rebalance is a reweight, not a resize.
- **1–4 copies** per card. Nothing so rare you never see it; nothing so common it floods draws.
- **Reaction density 20–24%** of the deck (currently 17/74 ≈ 23%).

## The tiers (the spine)

| Tier | Read | Copies | Examples |
|---|---|---|---|
| **Workhorse** | cheap enabler, low ceiling, unconditional | **4** | Quick Jab |
| **Common** | efficient generic, or loop-critical enabler | **3** | Teep, Leg Kick, Body Shot, Clinch, Single Leg, Stand Up, Ground & Pound |
| **Uncommon** | strong, conditional, or effect-heavy | **2** | Power Cross, Cutting Elbow, Uppercut, Heavy Hook, Double Leg, Guillotine, Kimura, Reversal, Upkick |
| **Rare / swing** | finisher or high-variance game-changer | **1** | Spinning Back Fist, Head Kick, Suplex, Triangle, Armbar, D'Arce, RNC, Master Coach, Counter Takedown |

## How to score a card (the steps)

1. Estimate **effective power** = value-per-energy, then discount for conditionality
   (top-only, clinch-only, bottom-only, clean-hit-only, can-be-reacted-to).
2. Drop it on the spine tier above.
3. Apply the **role nudge** — enabler → toward common (capped at 3–4); finisher/luxury → rare.
4. **Reactions skip the spine** — set them by the answer-to-attack ratio instead.
5. Check the **guardrails** (total 74, 1–4, reaction density 20–24%) and adjust the nearest
   neighbor to keep the total fixed.

---

## Current deck, mapped to the rubric

*Baseline for the power read: median Balanced fighter (skill 4). "Cond." = conditionality discount.*

**Standup strikes**
| Card | Power read | Role | Copies |
|---|---|---|---|
| Quick Jab | Lo (6/e, unconditional) | combo enabler | 4 |
| Teep Kick | Lo (6/e) | spacing utility | 3 |
| Leg Kick | Lo–Med (7/e + compounding leg dmg) | chip enabler | 3 |
| Body Shot | Lo (3.5/e + energy drain, clinch) | tempo/cardio | 3 |
| Power Cross | Med (4/e, anti-Block) | — | 2 |
| Cutting Elbow | Med (4/e + bleed, 3 positions) | versatile | 2 |
| Uppercut | Med (3/e, clinch) | — | 2 |
| Heavy Hook | Med (3.3/e + knockdown, clinch) | — | 2 |
| Spinning Back Fist | Swing (stagger = skip a turn) | — | 1 |
| Head Kick | Swing (knockdown finisher) | — | 1 |

**Other strikes / wrestling**
| Card | Power read | Role | Copies |
|---|---|---|---|
| Ground & Pound | Lo but **top-gated** | repeatable top reward | 3 |
| Upkick | Med, **bottom-only** | escape-strike | 2 |
| Clinch | enabler (0 dmg) | gateway to clinch game | 3 |
| Single Leg Takedown | Lo (3/e) | gateway to the ground | 3 |
| Double Leg Takedown | Med (2.3/e) | — | 2 |
| Suplex | Swing (big slam, 4e) | — | 1 |

**Submissions** *(all ground/top-gated)*
| Card | Power read | Role | Copies |
|---|---|---|---|
| Guillotine Choke | Med, flying-capable | — | 2 |
| Kimura | Med, ground | — | 2 |
| Triangle Choke | Hi (guard finisher) | — | 1 |
| Armbar | Hi (finishes anywhere) | — | 1 |
| D'Arce Choke | Hi (ground finisher) | — | 1 |
| Rear Naked Choke | Hi/Swing (best sub, top-only) | — | 1 |

**Escapes / reactions / corners**
| Card | Basis | Copies |
|---|---|---|
| Stand Up / Separate | enabler (un-stick) | 3 |
| Reversal | Med/swing (bottom→top) | 2 |
| Block | answer-ratio (strike) | 3 |
| Parry | answer-ratio (strike) | 2 |
| Slip Counter | answer-ratio (strike) | 2 |
| Check Kick | answer-ratio (kicks only) | 2 |
| Stuff | answer-ratio (takedown) | 2 |
| Sprawl | answer-ratio (takedown) | 2 |
| Counter Takedown | answer-ratio (reverse, rare) | 1 |
| Submission Defense | answer-ratio (submission) | 3 |
| Master Coach | Hi (permanent +1/+1) | 1 |
| Intense Training | Med | 2 |
| Ringside Medic | Med (sustain) | 2 |
| Second Wind | Lo (tempo enabler) | 2 |

---

## Audit log

**Pass 1 (v4.9.3) — full-deck outlier audit against this rubric.**
Result: **the curve is sound — no required changes.** Every card's copies match its tier read.
Three **borderline / watch** items, none recommended for change now:

- **Ground & Pound = 3 (borderline high).** Its raw efficiency (7/e) reads "common," but it's
  *top-gated*, so its real availability is lower. The 2→3 bump (v4.9.3) was a deliberate reward
  for establishing top control. Watch that it doesn't over-reward grapplers; drop back to 2 if
  top-control turns feel oppressive.
- **Stand Up / Separate = 3 (could be 4).** Being stuck on the bottom is the worst feel-bad
  state. Kept at 3 because free Stand Up exists from *top* and the bottom is *meant* to cost
  tempo — but if "no escape in hand" blowouts show up in playtest, 4 is the fix (pull from a
  surplus elsewhere).
- **Leg Kick = 3 (strong effect on a common card).** Stacking, permanent −1-to-all-strikes is a
  high-ceiling effect at 1 energy. It's slow (one stack per clean hit) and defendable, so copies
  fit the spine — but watch for cheap leg-kick spam neutering strikers.

**Out of scope for frequency (logged for the power pass, not fixable by copies):** cheap
1-energy strikes are ~2× more energy-efficient than the 4-energy ones — that's an *energy-cost*
balance question, not a *frequency* one.

**Pass 2 (v4.9.7) — re-audit after signature abilities (Lever 4).**
Result: **the curve still holds — no copy changes.** Key principle: **frequency is a property of the
shared 74-card deck; abilities are a property of fighters.** Both players use identical decks and draw
3 random fighters, so a card's copies must track its *average* value across all 20 fighters, not any
one fighter's synergy. Measured (via `calc*` with every fighter as attacker): each card's value spread
is dominated by the **Striking/Grappling stat (~4-point swing)**, while abilities add only **~+2** and
only for a **minority** of fighters (strike abilities reach 6/20, takedowns 3/20, subs 2/20, leg-kick &
clinch 1/20 each). No card's deck-wide average moves enough to cross a rarity tier, so the v4.9.3 copy
curve is unchanged. New **synergy / watch** items (build-arounds for one fighter — NOT copy changes):
the **Clinch + clinch-strike** package (Ankalaev's Cage Pressure), **top submissions** (Oliveira +2,
Pantoja chip), and **Leg Kick** (Gaethje −2). **Forward note:** if the game ever moves to per-fighter
decks or drafting (asymmetric decks), frequency becomes a real per-fighter lever and these synergies
*would* justify build-around copy tuning — under the current shared-deck / random-draw model they don't.

## When to re-run

- After adding/altering any card effect, energy, or damage.
- **After fighter signature abilities land** — abilities change effective card power (e.g. a
  "submissions cost −1" fighter makes subs more efficient → re-evaluate sub copies).
- Any time playtest data contradicts a tier read above.

*Companion to `MMA Card Game Rules.md`. Frequencies live in `docs/js/cards.js` as each card's
`copies:` field; the rules card-list table mirrors them.*
