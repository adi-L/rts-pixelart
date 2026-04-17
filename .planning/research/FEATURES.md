# Feature Research

**Domain:** 2D side-scrolling survival/strategy (Kingdom Two Crowns sub-genre)
**Researched:** 2026-04-16
**Confidence:** HIGH (primary references: Kingdom Two Crowns, Kingdom New Lands — directly played and extensively documented; supplemented by Thronefall and Until We Die)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features players assume exist in this sub-genre. Missing these = product feels unfinished or incoherent.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Side-scrolling hero movement | Genre-defining. Left/right is the only spatial axis that matters. | LOW | Keyboard or gamepad; left/right + jump optional |
| Coin as universal currency | Every action in the sub-genre is coin-gated. No menus, just drop coins. | LOW | Physical coins in a bag with visible overflow is the 1:1 design philosophy from KTC |
| Day/night cycle | The rhythm that structures everything. Players build during day, defend at night. | MEDIUM | Visual transition matters — full darkness for tension, dawn as "survived" signal |
| Zombie/enemy waves at night | The threat the entire loop is built to resist. Waves from map edges. | MEDIUM | Escalating difficulty per night; requires spawner logic at left/right edges |
| Autonomous citizen behavior | NPCs perform assigned roles without player direction — this IS the strategy layer. | HIGH | Workers build when near build points; archers defend at night; no player micromanagement |
| Walls as primary defense | The first and most visible thing a player builds. Blocking attackers is the core loop. | MEDIUM | Tiered upgrades (wood → stone → reinforced); each tier holds more hits |
| Towers/archer platforms | Offensive defense — archers in towers are how enemies die at night. | MEDIUM | Towers give archers a defensive post to return to at night |
| Coin income from passive sources | Players need income beyond manual collection — farming, hunting, generators. | MEDIUM | In KTC: archers hunt rabbits/deer during day; farmers harvest fields |
| Structure upgrades via coin investment | Players drop coins at a structure to upgrade it — core interaction pattern. | MEDIUM | Drop more coins = higher tier; visual feedback essential |
| Lose-then-continue structure | Not hard permadeath — losing degrades but doesn't fully reset. Keeps players engaged. | MEDIUM | KTC uses "heir" system: structures partially decay but persist. Project spec: push back + lose progress but continue |
| Pixel art visual style | Sub-genre aesthetic expectation. Reinforces readability at side-scroll scale. | LOW | Placeholder sprites acceptable at first; parallax backgrounds signal production quality |
| Parallax scrolling backgrounds | Visual depth expected in all modern side-scrollers in this space. | LOW | 2–3 layers minimum (far, mid, near) |

---

### Differentiators (Competitive Advantage)

Features that distinguish Dead City from Kingdom Two Crowns and create the specific value proposition.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Futuristic zombie setting | Unique aesthetic in a sub-genre dominated by medieval themes. Opens doors for vehicles, firearms, sci-fi structures. | LOW | Art direction cost, not engineering cost |
| Weapon pickup system | Hero can pick up weapons dropped by enemies or found while exploring — makes the hero active, not passive. | MEDIUM | Kingdom's hero is passive (only drops coins). Pickup changes the feel entirely. |
| Vehicles with fuel mechanic | Bikes and cars for exploration — cover more world in less time but burn fuel. Strategic tradeoff. | HIGH | Fuel as a secondary resource; finding fuel canisters in the world; vehicle speed vs. coin capacity tradeoff |
| Explorable structures with rewards | Pre-placed ruins, crashed vehicles, abandoned buildings that yield coins, weapons, or fuel when reached. | MEDIUM | Hand-crafted map layout (per project spec); structures placed deliberately for pacing |
| Day counter with milestone events | Every N days, a scripted event fires (supply drop, ambush, boss wave). Creates narrative punctuation. | MEDIUM | Replaces KTC's island-travel as the sense of "campaign progress" |
| Hero can fight directly | Player character attacks with picked-up weapons — not just a coin dispenser. | MEDIUM | Adds arcade feel without breaking the indirect-control design; weapons have limited durability or ammo |
| Escalating wave size tied to day count | Clear, legible difficulty curve. Day 1 = 3 zombies. Day 30 = 50. | LOW | Table stakes in most survival games, but the futuristic setting allows named "events" (e.g., "armored unit convoy") |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Direct unit control | "I want to tell my archers where to go" — frustration with AI | Destroys the indirect-control design that makes the coin-drop mechanic unique. Becomes an RTS instead of a strategy-puzzle. | Design smarter autonomous behavior. Give players indirect nudges (e.g., build a tower in a location to anchor archers there). |
| Top-down or isometric view | Familiar from RTS genre | Breaks the side-scroll readability; multiplies art scope; loses the left-right tension that gives the map its meaning | Commit fully to side-scroll |
| Procedural world generation | Replayability | Removes the intentional pacing of hand-placed rewards and scripted milestone events. Random worlds dilute encounter design. | Use milestone randomization (wave composition, event timing) inside a fixed map |
| Complex RPG stats | Depth desire | Adds menus, number tracking, and complexity that fights the no-UI philosophy. Cognitive overhead kills the pick-up-and-play feel. | Use visible-world proxies: more coins = stronger wall, more archers = more arrows. Stats are implicit. |
| Multiplayer | "Play with a friend" | Scope explosion for MVP. Network sync for a physics-based coin world is non-trivial. | Explicitly out of scope in project spec; flag for v2+ |
| Real-time tooltip/tutorial popups | "Explain everything" | KTC's biggest criticism is that it explains nothing, but the alternative (pop-up tutorials) breaks immersion. Players who need tooltips aren't the target audience. | Use environmental storytelling: a skeleton holding a coin near a wall teaches "drop coins here." |
| Inventory management screen | "I want to see what I have" | Pulls player out of the world. The coin-bag IS the inventory — showing overflow on the ground is the feedback. | Coin counter as HUD element only; no inventory screen |
| Save scumming / manual saves | Player comfort | Undermines the risk/reward tension of the nightly attacks. If players can reload, the lose condition is meaningless. | Auto-save only; the "lose and degrade but continue" design is the safety net |

---

## Feature Dependencies

```
Day/Night Cycle
    └──requires──> Enemy Wave System (nights need waves)
    └──requires──> Autonomous Citizen AI (NPCs must shift behavior at dusk/dawn)
    └──enables──> Coin Income (daytime = earning; nighttime = spending pressure)

Coin System
    └──requires──> Hero Movement (hero must move to collect and drop)
    └──enables──> Structure Upgrades (drop coins at structure = upgrade)
    └──enables──> Citizen Hiring (drop coins at vagrants = recruit)

Structure Upgrades
    └──requires──> Coin System
    └──requires──> Builder NPC (buildings don't upgrade themselves — builders consume coins and build)

Autonomous Citizen AI
    └──requires──> Role Assignment System (vagrants → workers, archers, farmers based on tool pickup)
    └──enables──> Passive Coin Income (farmers and archers generate coins autonomously)

Weapon Pickup System
    └──requires──> Hero Movement
    └──enhances──> Exploration (incentivizes moving further from base)
    └──conflicts──> Passive Hero Design (hero fights = more active; must be balanced so coins remain primary interaction)

Vehicle System
    └──requires──> Exploration World (need world wide enough to make vehicles worthwhile)
    └──requires──> Fuel Resource Type (adds secondary resource; must not overcomplicate)
    └──enhances──> Weapon Pickup (vehicles make it feasible to fetch distant weapons quickly)
    └──conflicts──> Early-game pacing (vehicles too early = exploration trivial; introduce at day 3+)

Lose-Then-Continue
    └──requires──> Structure Persistence State (world must track what was built, partially degrade on loss)
    └──requires──> Day Counter (reset or continue from N; project spec says keep going)

Day Counter + Milestone Events
    └──requires──> Day/Night Cycle
    └──enhances──> Lose-Then-Continue (players have a number to anchor their progress)

Exploration World
    └──requires──> Hero Movement
    └──requires──> Parallax Scrolling
    └──enables──> Vehicle System
    └──enables──> Weapon Pickup
    └──enables──> Explorable Structures
```

### Dependency Notes

- **Day/night cycle must exist before enemy waves:** The spawner logic keys off night trigger. Waves without day/night is just a shooter.
- **Builder NPC required before structure upgrades are meaningful:** Without a builder consuming coins and visibly working, upgrades feel like instant magic. The worker walking to the site IS the feedback.
- **Vehicle system should be post-MVP:** High complexity, requires fuel resource type, needs a wide enough world to justify. Add after the core loop is validated.
- **Weapon pickup and vehicle conflict:** Both incentivize leaving base. If weapons are too powerful, players will always leave. Design weapons as situational (limited ammo), not dominant strategy.

---

## MVP Definition

### Launch With (v1)

Minimum to validate the coin-drop survival loop.

- [ ] Hero movement (left/right keyboard, smooth scrolling camera) — without this, nothing works
- [ ] Coin collection (manual pickup from ground/nodes) and coin-drop interaction at designated points — the core mechanic
- [ ] Day/night cycle with visual transition — structures the entire loop
- [ ] One wall type with upgrade path (wood → stone, two tiers minimum) — player's first tangible defense
- [ ] One tower type that spawns an archer — gives players offensive capability without direct control
- [ ] Builder NPC: wanders, picks up coin drop at build point, constructs/upgrades structure — the indirect-control loop made visible
- [ ] Archer NPC: hunts during day (generates coins), defends tower at night — dual-purpose autonomous unit
- [ ] Zombie wave spawning from map edges at night, walks toward base — the threat
- [ ] Day counter visible on screen — player feedback for progression
- [ ] Coin bag with visible overflow — physical feedback replacing a UI number
- [ ] Lose condition: crown/hero knocked back, coins dropped, partial structure degradation — stakes

### Add After Validation (v1.x)

- [ ] Farmer NPC + farm structure — adds passive income variety and strategic depth to economy
- [ ] Weapon pickup system — hero picks up weapons from world; add once citizen AI is stable
- [ ] Explorable structures in world — pre-placed ruins with coin/weapon rewards
- [ ] Milestone events on day counter — adds narrative punctuation once the loop is proven
- [ ] Second wall/tower tier — once upgrade path UX is confirmed working

### Future Consideration (v2+)

- [ ] Vehicle system (bikes, cars, fuel) — high complexity; defer until world scale is confirmed
- [ ] Multiple zombie types (fast, armored, crown-stealer equivalent) — add once base combat is solid
- [ ] Parallax background variety / biomes — art scope; placeholder is fine for validation
- [ ] Gem / secondary currency — adds strategic depth but complicates the minimalist design
- [ ] Multiplayer — explicitly out of scope per project spec

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero movement + camera | HIGH | LOW | P1 |
| Coin collect/drop interaction | HIGH | LOW | P1 |
| Day/night cycle | HIGH | MEDIUM | P1 |
| Zombie wave spawning | HIGH | MEDIUM | P1 |
| Wall + builder NPC | HIGH | MEDIUM | P1 |
| Tower + archer NPC | HIGH | MEDIUM | P1 |
| Coin bag overflow feedback | HIGH | LOW | P1 |
| Day counter HUD | MEDIUM | LOW | P1 |
| Lose-then-continue | HIGH | MEDIUM | P1 |
| Farmer NPC + farm | MEDIUM | MEDIUM | P2 |
| Weapon pickup | HIGH | MEDIUM | P2 |
| Explorable structures | MEDIUM | MEDIUM | P2 |
| Milestone events | MEDIUM | LOW | P2 |
| Multiple zombie types | MEDIUM | MEDIUM | P2 |
| Vehicle + fuel system | HIGH | HIGH | P3 |
| Secondary currency (gems) | LOW | MEDIUM | P3 |
| Multiplayer | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Kingdom Two Crowns | Until We Die | Dead City (Our Approach) |
|---------|--------------------|--------------|--------------------------| 
| Setting | Medieval/fantasy | Post-apocalyptic metro | Futuristic zombie city |
| Hero role | Passive monarch (drops coins only) | Active commander (issues orders + fights) | Hybrid — drops coins AND picks up weapons |
| Day/night | Core rhythm; 5–6 min days | Core rhythm; scripted 30-day campaign | Core rhythm; day counter with milestone events |
| NPC control | Fully autonomous; player shapes via coin drops | Player can directly issue tasks | Fully autonomous; player shapes via coin drops |
| Coin mechanics | Coins from hunting, farming, chests, banker interest | Resources from scavenging and structures | Coins from citizens, exploration, kills |
| Enemy variety | Greed (basic, armored, floater, breeder, crown-stealer) | Mutants with increasing complexity | Zombies (start simple; add types in v2) |
| Exploration | Multi-island travel by boat | Fixed underground map | Hand-crafted world left/right of base |
| Vehicles | Mounts (horse, unicorn, griffin) — no fuel mechanic | None | Bikes/cars with fuel — unique to our game |
| Lose condition | Crown stolen → heir inherits decayed kingdom | Generator destroyed → game over | Hero knocked back, coins lost, structures degrade |
| Tutorial | None — trial and error; biggest criticism | Implicit guidance through events | Environmental storytelling; avoid pop-up tutorials |
| Win condition | Destroy all portals across islands | Survive 30 days | Escalating milestones; no hard win (survival game) |

---

## Key Design Principle (from KTC developer)

The "1:1 design methodology" is the unifying philosophy: every resource, every unit, every action is represented by a physical entity in the world. No aggregate numbers on a spreadsheet. No menus. The coin in your bag is a coin you can see. This must be preserved in Dead City — it's what separates this sub-genre from RTS games.

---

## Sources

- [Kingdom Two Crowns — Kingdom Wiki (Game basics)](https://kingdomthegame.fandom.com/wiki/Game_basics)
- [Kingdom Two Crowns — Wikipedia](https://en.wikipedia.org/wiki/Kingdom_Two_Crowns)
- [Kingdom Two Crowns Subjects — Magic Game World](https://www.magicgameworld.com/kingdom-two-crowns-subjects/)
- [Kingdom Two Crowns: Design Philosophy — Game Developer](https://www.gamedeveloper.com/design/-i-kingdom-two-crowns-i-and-the-practical-intersection-of-pixel-art-and-roguelike-design)
- [Steam Guide: Complete Guide to Kingdom Two Crowns](https://steamcommunity.com/sharedfiles/filedetails/?id=1588497381)
- [Until We Die on Steam](https://store.steampowered.com/app/1197570/Until_We_Die/)
- [Thronefall — Wikipedia](https://en.wikipedia.org/wiki/Thronefall)
- [Kingdom New Lands: Starting, surviving & winning — Kingdom Wiki](https://kingdomthegame.fandom.com/wiki/Starting,_surviving,_%26_winning)

---
*Feature research for: Dead City (2D side-scrolling survival strategy)*
*Researched: 2026-04-16*
