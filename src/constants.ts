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
