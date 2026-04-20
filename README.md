# Dead City

An open-source 2D side-scrolling survival strategy game inspired by Kingdom Two Crowns, set in a futuristic zombie world. Built with Phaser 3, TypeScript, and Vite.

## About

You control a lone hero navigating a post-apocalyptic city overrun by zombies. Move left and right, collect coins, and drop them to build defenses, recruit citizens, and survive increasingly dangerous nightly zombie waves.

There are no menus, no direct unit control. Your only tools are **movement** and **coins**. Citizens and builders act autonomously — you just need to be in the right place at the right time.

## Features

- **Coin-drop economy** — build structures and recruit NPCs by dropping coins at key locations
- **Autonomous NPCs** — citizens, builders, and farmers operate on their own AI
- **Day/night cycle** — gather resources by day, survive zombie waves by night
- **Defensive structures** — walls, towers, and farms to protect and sustain your city
- **Wave-based combat** — progressively harder zombie waves each night

## Getting Started

### Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

### Installation

```bash
npm install
```

### Running

```bash
npm run dev
```

The dev server runs on `http://localhost:8080` by default with hot-reloading enabled.

### Building for Production

```bash
npm run build
```

Output goes to the `dist` folder. Upload its contents to any static web server to deploy.

## Project Structure

```
src/
├── main.ts              # Entry point and game configuration
├── constants.ts         # Game-wide constants
├── scenes/              # Phaser scenes
├── entities/            # Game entities (hero, NPCs, structures, enemies)
├── systems/             # Game systems (waves, economy, day-night cycle)
├── ui/                  # HUD and UI elements
└── events/              # Event definitions
```

## Tech Stack

- **[Phaser 3](https://phaser.io/)** — game engine
- **[TypeScript](https://www.typescriptlang.org/)** — type safety
- **[Vite](https://vitejs.dev/)** — dev server and bundler

## Contributing

This is an open-source project. Contributions, ideas, and bug reports are welcome. Feel free to open issues or submit pull requests.

## License

This project is open source under the [MIT License](LICENSE).
