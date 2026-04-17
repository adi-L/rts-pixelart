// World
export const WORLD_WIDTH = 6000;
export const WORLD_HEIGHT = 768;
export const GROUND_Y = 600;
export const GROUND_HEIGHT = 168;
export const GROUND_COLOR = 0x3a3a3a;
export const GROUND_EDGE_COLOR = 0x5a5a5a;

// Colors
export const COLOR_SKY = 0x1a1a2e;
export const COLOR_SKY_BOTTOM = 0x0f3460;
export const COLOR_MID = 0x16213e;
export const COLOR_ACCENT = 0xe2b714;

// Hero
export const HERO_SPEED = 300;
export const HERO_SCALE = 2;
export const HERO_BODY_WIDTH = 24;
export const HERO_BODY_HEIGHT = 48;
export const HERO_START_X = 3000;
export const HERO_IDLE_FRAMES_START = 0;
export const HERO_IDLE_FRAMES_END = 5;
export const HERO_IDLE_FPS = 8;
export const HERO_WALK_FRAMES_START = 8;
export const HERO_WALK_FRAMES_END = 15;
export const HERO_WALK_FPS = 10;

// Camera
export const CAMERA_LERP = 0.1;
export const CAMERA_DEADZONE_WIDTH = 100;

// Coins
export const COIN_SIZE = 12;
export const COIN_SCALE = 2;
export const COIN_POOL_SIZE = 30;
export const COIN_SPIN_DURATION = 600;
export const COIN_COLLECT_DURATION = 150;
export const COIN_DROP_BOUNCE_DURATION = 200;
export const COIN_INITIAL_SPAWN_COUNT = 20;

// Build Points
export const BUILD_POINT_WIDTH = 32;
export const BUILD_POINT_HEIGHT = 48;
export const BUILD_POINT_DETECT_RADIUS = 64;
export const BUILD_POINT_IDLE_ALPHA_MIN = 0.3;
export const BUILD_POINT_IDLE_ALPHA_MAX = 0.7;
export const BUILD_POINT_ACTIVE_ALPHA_MIN = 0.7;
export const BUILD_POINT_ACTIVE_ALPHA_MAX = 1.0;
export const BUILD_POINT_PULSE_DURATION = 1000;
export const BUILD_POINT_POSITIONS = [3000]; // Base camp at world center

// Parallax scroll factors
export const PARALLAX_SKY = 0.0;
export const PARALLAX_MID = 0.3;
export const PARALLAX_GROUND = 1.0;

// Sprite keys (per MAP-02 -- replaceable via config)
export const SPRITE_HERO = 'hero';
export const SPRITE_COIN = 'coin';
export const SPRITE_HERO_PATH = 'gunner/Tiny Gunslinger 48x32.png';
export const SPRITE_HERO_FRAME_WIDTH = 48;
export const SPRITE_HERO_FRAME_HEIGHT = 32;

// ===== PHASE 2: Citizen Economy & Structures =====

// Structure Dimensions
export const WALL_WIDTH = 32;
export const WALL_WOOD_HEIGHT = 48;
export const WALL_STONE_HEIGHT = 56;
export const TOWER_WIDTH = 32;
export const TOWER_HEIGHT = 72;
export const TOWER_PLATFORM_HEIGHT = 4;
export const FARM_WIDTH = 64;
export const FARM_HEIGHT = 24;
export const BUILDER_HUT_WIDTH = 48;
export const BUILDER_HUT_HEIGHT = 40;

// Structure Colors
export const COLOR_WALL_WOOD = 0x8B6914;
export const COLOR_WALL_STONE = 0x6B6B6B;
export const COLOR_TOWER = 0x4A6B8A;
export const COLOR_TOWER_PLATFORM = 0x6A8BAA;
export const COLOR_FARM = 0x2D5A27;
export const COLOR_BUILDER_HUT = 0x7A5C3E;

// Health Bar
export const HEALTH_BAR_WIDTH = 48;
export const HEALTH_BAR_HEIGHT = 4;
export const HEALTH_BAR_OFFSET_Y = 4;
export const COLOR_HEALTH_BG = 0x333333;
export const COLOR_HEALTH_HIGH = 0x44CC44;
export const COLOR_HEALTH_MID = 0xCCAA44;
export const COLOR_HEALTH_LOW = 0xCC4444;

// Structure HP
export const WALL_WOOD_HP = 50;
export const WALL_STONE_HP = 100;
export const TOWER_HP = 60;

// Structure Costs
export const WALL_WOOD_COST = 3;
export const WALL_STONE_UPGRADE_COST = 5;
export const TOWER_COST = 6;
export const FARM_COST = 4;
export const BUILDER_HUT_COST = 3;

// Main Base Costs
export const BASE_UPGRADE_COST_1 = 5;
export const BASE_UPGRADE_COST_2 = 15;
export const BASE_UPGRADE_COST_3 = 30;

// Tween Durations
export const STRUCTURE_SCALE_PULSE = 200;
export const FLASH_TINT_DURATION = 100;
export const BUILD_POINT_FADE_IN = 500;

// Build Point Layout
export type BuildPointType = 'base' | 'wall' | 'tower' | 'hut' | 'farm';

export interface BuildPointConfig {
  id: string;
  x: number;
  type: BuildPointType;
  unlockTier: number;
}

export const BUILD_POINT_LAYOUT: BuildPointConfig[] = [
  { id: 'bp-base', x: 3000, type: 'base', unlockTier: 0 },
  { id: 'bp-wall-L1', x: 2600, type: 'wall', unlockTier: 0 },
  { id: 'bp-wall-R1', x: 3400, type: 'wall', unlockTier: 0 },
  { id: 'bp-tower-L1', x: 2500, type: 'tower', unlockTier: 2 },
  { id: 'bp-tower-R1', x: 3500, type: 'tower', unlockTier: 2 },
  { id: 'bp-hut', x: 2900, type: 'hut', unlockTier: 2 },
  { id: 'bp-farm-L1', x: 2700, type: 'farm', unlockTier: 3 },
  { id: 'bp-farm-R1', x: 3300, type: 'farm', unlockTier: 3 },
  { id: 'bp-wall-L2', x: 2200, type: 'wall', unlockTier: 2 },
  { id: 'bp-wall-R2', x: 3800, type: 'wall', unlockTier: 2 },
];
