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

// HUD
export const HUD_MARGIN = 16;
export const HUD_COIN_ICON_SIZE = 16;
export const HUD_COIN_TEXT_SIZE = '20px';
export const HUD_LABEL_TEXT_SIZE = '14px';
export const HUD_COIN_X = 40;
export const HUD_DAY_LABEL_X = 100;
export const HUD_Y = 16;
export const HUD_DEPTH = 100;

// NPC Dimensions
export const NPC_WIDTH = 16;
export const NPC_HEIGHT = 32;

// NPC Colors
export const COLOR_VAGRANT = 0x666666;
export const COLOR_CITIZEN = 0x4488CC;
export const COLOR_BUILDER = 0x8B6914;
export const COLOR_FARMER = 0x44AA44;

// NPC Speeds
export const VAGRANT_DRIFT_SPEED = 30;
export const CITIZEN_WANDER_SPEED = 40;
export const CITIZEN_RUN_SPEED = 120;
export const BUILDER_WALK_SPEED = 80;
export const FARMER_WALK_SPEED = 50;

// NPC Behavior
export const VAGRANT_WANDER_RANGE = 40;
export const CITIZEN_WANDER_RANGE = 200;
export const BUILDER_WANDER_RANGE = 80;
export const FARMER_WORK_RANGE = 64;
export const VAGRANT_RECRUIT_RADIUS = 64;
export const VAGRANT_RESPAWN_INTERVAL = 60000;
export const VAGRANT_INITIAL_COUNT = 4;

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

// Main Base
export const BASE_TIER1_WIDTH = 96;
export const BASE_TIER1_HEIGHT = 64;
export const BASE_TIER2_WIDTH = 128;
export const BASE_TIER2_HEIGHT = 72;
export const BASE_TIER3_WIDTH = 160;
export const BASE_TIER3_HEIGHT = 80;
export const BASE_TIER_MAX_WIDTH = 192;
export const BASE_WING_TIER2_WIDTH = 32;
export const BASE_WING_TIER2_HEIGHT = 48;
export const BASE_WING_TIER3_WIDTH = 48;
export const BASE_WING_TIER3_HEIGHT = 56;
export const COLOR_BASE_TIER1 = 0x5C4033;
export const COLOR_BASE_TIER2 = 0x4A3728;
export const COLOR_BASE_TIER3 = 0x3D2B1F;
export const BASE_UPGRADE_COST_1 = 5;
export const BASE_UPGRADE_COST_2 = 15;
export const BASE_UPGRADE_COST_3 = 30;
export const BASE_TIER1_HP = 100;
export const BASE_TIER2_HP = 150;
export const BASE_TIER3_HP = 200;

// Health Bar
export const HEALTH_BAR_WIDTH = 48;
export const HEALTH_BAR_HEIGHT = 4;
export const HEALTH_BAR_OFFSET_Y = 4;
export const COLOR_HEALTH_BG = 0x333333;
export const COLOR_HEALTH_HIGH = 0x44CC44;
export const COLOR_HEALTH_MID = 0xCCAA44;
export const COLOR_HEALTH_LOW = 0xCC4444;

// Construction
export const BUILDER_CONSTRUCT_DURATION = 3000;
export const BUILDER_HAMMER_AMPLITUDE = 4;
export const BUILDER_HAMMER_PERIOD = 300;

// Farm Economy
export const FARM_COIN_INTERVAL = 8000;
export const FARM_COIN_FLOAT_DURATION = 800;

// Structure Costs
export const WALL_WOOD_COST = 3;
export const WALL_STONE_UPGRADE_COST = 5;
export const TOWER_COST = 6;
export const FARM_COST = 4;
export const BUILDER_HUT_COST = 3;

// Structure HP
export const WALL_WOOD_HP = 50;
export const WALL_STONE_HP = 100;
export const TOWER_HP = 60;

// Tween Durations
export const STRUCTURE_SCALE_PULSE = 200;
export const FLASH_TINT_DURATION = 100;
export const BUILD_POINT_FADE_IN = 500;
export const BASE_COLLAPSE_SHAKE_DURATION = 500;
export const BASE_COLLAPSE_FALL_DURATION = 1000;
export const SCREEN_FADE_DURATION = 500;

// Build Point Flags
export const FLAG_POLE_WIDTH = 2;
export const FLAG_POLE_HEIGHT = 60;
export const FLAG_BANNER_WIDTH = 12;
export const FLAG_BANNER_HEIGHT = 10;
export const FLAG_POLE_COLOR = 0x888888;
export const FLAG_COLORS: Record<string, number> = {
  base: 0xe2b714,   // gold
  wall: 0x8B6914,   // brown
  tower: 0x4A6B8A,  // blue-gray
  hut: 0x7A5C3E,    // wood brown
  farm: 0x2D5A27,   // green
};

// Build Point Layout (symmetric around x=3000)
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

// ===== PHASE 3: Day/Night & Zombie Waves =====

// Day/Night Cycle (per D-01, D-02, D-03)
export const DAY_DURATION = 600000;         // 10 minutes in ms
export const NIGHT_DURATION = 480000;       // 8 minutes in ms
export const TRANSITION_DURATION = 12000;   // 12s overlay fade
export const NIGHTFALL_WARNING_TIME = 20000; // 20s before nightfall
export const OVERLAY_NIGHT_COLOR = 0x0a0a3a; // dark blue-purple
export const OVERLAY_MAX_ALPHA = 0.55;
export const OVERLAY_DEPTH = 50;            // below HUD_DEPTH (100)

// Zombie (per D-05 through D-12, D-16, D-17)
export const ZOMBIE_SPEED = 40;
export const ZOMBIE_HP = 30;
export const ZOMBIE_DAMAGE = 10;
export const ZOMBIE_ATTACK_INTERVAL = 2000; // 2s between hits per D-06
export const ZOMBIE_BASE_COUNT = 4;         // ~3-4 on night 1 per D-16
export const ZOMBIE_GROWTH_PER_NIGHT = 2;   // add 2 per night per D-16
export const ZOMBIE_POOL_SIZE = 40;
export const COLOR_ZOMBIE = 0x2D8B2D;       // green per D-07
export const COLOR_ZOMBIE_DARK = 0x1A5C1A;  // dark-green variant
export const SPRITE_ZOMBIE = 'zombie';
export const ZOMBIE_SPAWN_MARGIN = 50;      // px from world edge

// Archer (per D-13, D-14, D-15)
export const ARCHER_RANGE = 300;
export const ARCHER_FIRE_RATE = 1500;       // 1.5s between shots
export const ARROW_DAMAGE = 10;
export const ARROW_SPEED = 400;
export const ARROW_MAX_RANGE = 350;
export const ARROW_POOL_SIZE = 15;
export const ARCHER_HUNT_COIN_INTERVAL = 15000; // 1 coin per 15s
export const ARCHER_WANDER_DISTANCE = 200;
export const ARCHER_RETURN_SPEED = 120;
export const COLOR_ARCHER = 0xCC6633;       // orange-brown
export const SPRITE_ARROW = 'arrow';
export const ARROW_WIDTH = 8;
export const ARROW_HEIGHT = 2;
