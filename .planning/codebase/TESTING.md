# Testing Patterns

**Analysis Date:** 2026-04-16

## Test Framework

**Runner:**
- No test framework is installed or configured
- No test runner config files detected (no jest.config, vitest.config, etc.)
- No test-related dependencies in `package.json`
- No test scripts in `package.json`

**Status:** Testing infrastructure does not exist in this project.

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase
- No `*.test.ts`, `*.spec.ts`, or `__tests__/` directories

## Recommended Setup

Given the tech stack (Vite + TypeScript + Phaser), the recommended testing approach:

**Framework:** Vitest (native Vite integration)

**Installation:**
```bash
npm install -D vitest
```

**Config:** Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

**Package.json scripts to add:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testable Code Areas

**Engine logic (unit-testable without Phaser mocking):**
- `ResourceNode.harvest()` - pure math logic in `src/engine/resources/index.ts`
- `ResourceNode.isEmpty()` - simple boolean check
- `MainBase.depositResources()` / `MainBase.getResources()` - counter logic in `src/engine/buildings/index.ts`
- `Unit.findNearestResource()` - distance calculation in `src/engine/units/index.ts` (requires Phaser math mock)

**State machine logic (needs Phaser mocking):**
- `Unit.update()` state transitions in `src/engine/units/index.ts`
- State: IDLE -> MOVING_TO_RESOURCE -> HARVESTING -> RETURNING_TO_BASE -> IDLE

**Hard to test (tightly coupled to Phaser):**
- Scene lifecycle methods (`preload`, `create`, `update`)
- Sprite creation, animation setup
- Physics interactions

## Suggested Test File Locations

Follow co-located pattern:
```
src/engine/units/index.test.ts
src/engine/buildings/index.test.ts
src/engine/resources/index.test.ts
```

## Mocking Approach

**Phaser Scene Mock:**
```typescript
const mockScene = {
  add: {
    sprite: vi.fn().mockReturnValue({
      setDepth: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      anims: { play: vi.fn() },
      x: 0,
      y: 0,
    }),
    circle: vi.fn().mockReturnValue({
      setStrokeStyle: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
    }),
    text: vi.fn().mockReturnValue({
      setOrigin: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setText: vi.fn(),
    }),
    container: vi.fn().mockReturnValue({
      add: vi.fn(),
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    rectangle: vi.fn().mockReturnValue({
      setDepth: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
    }),
  },
  load: {
    spritesheet: vi.fn(),
    image: vi.fn(),
  },
  anims: {
    create: vi.fn(),
    generateFrameNumbers: vi.fn().mockReturnValue([]),
  },
  physics: {
    moveTo: vi.fn(),
    add: { existing: vi.fn() },
  },
} as unknown as Phaser.Scene;
```

**What to mock:**
- All `Phaser.Scene` methods (add, load, anims, physics)
- `Phaser.Math.Distance.Between` for distance calculations
- Sprite body/velocity for movement tests

**What NOT to mock:**
- Entity state logic (test actual state transitions)
- Resource math (harvest amounts, deposit totals)
- Props/configuration parsing

## Coverage

**Requirements:** None enforced

**Current coverage:** 0% -- no tests exist

**Priority areas for test coverage:**
1. `src/engine/resources/index.ts` - Resource harvesting math (easiest to test)
2. `src/engine/buildings/index.ts` - Resource deposit/retrieval
3. `src/engine/units/index.ts` - State machine transitions

## Test Types

**Unit Tests:**
- Target engine logic in `src/engine/` directories
- Mock Phaser scene and game objects
- Test state transitions, resource math, entity configuration

**Integration Tests:**
- Not applicable yet -- no API or database layers

**E2E Tests:**
- Not used
- Could consider Playwright for visual/interaction testing if needed later

---

*Testing analysis: 2026-04-16*
