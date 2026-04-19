---
status: complete
quick_id: 260418-wxa
description: "Fix gun sprite position - was above the hero"
commit: 5628206
---

## Summary

Fixed the gun sprite appearing above the hero by adding a Y offset to position it at hand/torso level. The gun was rendering at `sprite.y` (sprite center), but the hero's hands are visually lower. Applied a 15% offset of the scaled frame height (~10px) to both the gun sprite position and the bullet fire origin.

## Changes

- `src/entities/Hero.ts`: Added gunY offset calculation in update() and shoot() methods
