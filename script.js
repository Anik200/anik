/**
 * Anik's Website - Windows NT Monochrome Engine
 * 2.5D Rainy Cityscape Parallax Canvas, Weather Control Panel, & Project Showcases
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Live Weather & Rain Settings Configuration
  // -------------------------------------------------------------------------
  const STORAGE_KEY_WEATHER = 'anik_weather_nt_config';
  const THEME_STORAGE_KEY = 'anik_theme_pref';

  // Base weather settings (tuned from weather_config.cpl)
  const weather = {
    dropCount: 140,
    rainSpeed: 6,
    windAngle: -0.6,
    dropLength: 26,
    cityVisibility: 100,
    windowLights: true,
    mistDensity: 55,
    lightningMode: 'off', // 'off', 'rare', 'storm'
    splashesEnabled: false,
    glassBlur: 14,
    glassOpacity: 42
  };

  function applyGlassStyles() {
    document.documentElement.style.setProperty('--glass-blur', `${weather.glassBlur}px`);
    document.documentElement.style.setProperty('--glass-opacity', (weather.glassOpacity / 100).toFixed(2));
  }

  // Clear any previously persisted weather override so new base settings apply immediately
  try {
    localStorage.removeItem(STORAGE_KEY_WEATHER);
  } catch (e) {}

  // -------------------------------------------------------------------------
  // 2. 2.5D Rainy Cityscape Parallax Canvas Engine
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('rain-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  let drops = [];
  let splashes = [];
  let mouseTiltX = 0;
  let targetTiltX = 0;
  let mistOffset = 0;

  // Audio System
  let isRainSoundPlaying = false;

  // City Skyline Buildings Cache & Revolving Panoramic Loop (18,000px World)
  let distantBuildings = [];
  let midBuildings = [];
  let worldWidth = 18000;

  // Scroll Tracking & Inertial Momentum for Revolving City
  let scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let targetScrollY = scrollY;
  let scrollVel = 0;

  function generateCityscape() {
    distantBuildings = [];
    midBuildings = [];
    worldWidth = 18000;

    const baseH = height;

    // -----------------------------------------------------------------------
    // District Definitions along World X (0 to 18000)
    // 0: Downtown Financial Core (0 - 3600)
    // 1: Megastructures & Construction Cranes (3600 - 7200)
    // 2: Art Deco & Historic Midtown (7200 - 10800)
    // 3: Industrial Port & Power Infrastructure (10800 - 14400)
    // 4: Suspension Bridge & Harbor Crossing (14400 - 18000)
    // -----------------------------------------------------------------------

    // 1. Generate Distant Silhouette Layer (Backdrop skyscrapers, towers, and pylons)
    let curX = 0;
    while (curX < worldWidth) {
      const districtIdx = Math.floor((curX / worldWidth) * 5) % 5;
      let bWidth, bHeight, type, spireHeight = 0, hasBeacon = true;

      if (districtIdx === 0) {
        // Financial Core: Soaring, slender obelisks and needle spires
        bWidth = Math.floor(Math.random() * 45 + 35);
        bHeight = Math.floor(Math.random() * (baseH * 0.46) + (baseH * 0.32));
        type = Math.random() > 0.4 ? 'spire' : 'standard';
        spireHeight = type === 'spire' ? Math.floor(Math.random() * 55 + 25) : 0;
      } else if (districtIdx === 1) {
        // Tech & Megastructures: Slanted wedge tops and lattice broadcast masts
        bWidth = Math.floor(Math.random() * 55 + 40);
        bHeight = Math.floor(Math.random() * (baseH * 0.42) + (baseH * 0.28));
        const r = Math.random();
        type = r > 0.65 ? 'slanted' : (r > 0.35 ? 'antenna' : 'standard');
        spireHeight = type === 'antenna' ? Math.floor(Math.random() * 60 + 35) : 0;
      } else if (districtIdx === 2) {
        // Art Deco & Historic: Stepped ziggurats and gothic crowns
        bWidth = Math.floor(Math.random() * 50 + 38);
        bHeight = Math.floor(Math.random() * (baseH * 0.38) + (baseH * 0.24));
        type = Math.random() > 0.45 ? 'stepped' : 'spire';
        spireHeight = Math.floor(Math.random() * 40 + 20);
      } else if (districtIdx === 3) {
        // Industrial: Cooling tower silhouettes, chimneys, low warehouses
        bWidth = Math.floor(Math.random() * 70 + 45);
        bHeight = Math.floor(Math.random() * (baseH * 0.28) + (baseH * 0.16));
        type = Math.random() > 0.5 ? 'cooling_tower' : 'chimney';
        spireHeight = type === 'chimney' ? Math.floor(Math.random() * 35 + 15) : 0;
      } else {
        // District 4: Clean distant spire and skyscraper silhouettes
        bWidth = Math.floor(Math.random() * 60 + 40);
        bHeight = Math.floor(Math.random() * (baseH * 0.42) + (baseH * 0.25));
        type = Math.random() > 0.45 ? 'spire' : 'standard';
        spireHeight = type === 'spire' ? Math.floor(Math.random() * 45 + 20) : 0;
      }

      distantBuildings.push({
        x: curX,
        width: bWidth,
        height: bHeight,
        type: type,
        spireHeight: spireHeight,
        hasBeacon: hasBeacon,
        district: districtIdx
      });

      curX += bWidth + Math.floor(Math.random() * 12 - 2);
    }

    // 2. Generate Detailed Midground Layer with Landmark Features & Lit Windows
    curX = 0;
    while (curX < worldWidth) {
      const districtIdx = Math.floor((curX / worldWidth) * 5) % 5;
      let bWidth, bHeight, roofType;
      let hasWaterTower = false, hasHelipad = false, hasCrane = false;
      let craneArmLen = 0, craneHeight = 0;
      let smokestacks = 0;
      let windowStyle = 'grid'; // 'grid', 'curtain', 'ribbon', 'penthouse', 'industrial'
      let spireHeight = 0;

      if (districtIdx === 0) {
        // --- District 0: Financial Metropolis ---
        bWidth = Math.floor(Math.random() * 75 + 50);
        bHeight = Math.floor(Math.random() * (baseH * 0.48) + (baseH * 0.28));
        const r = Math.random();
        if (r > 0.65) {
          roofType = 'spire';
          spireHeight = Math.floor(Math.random() * 50 + 25);
        } else if (r > 0.35) {
          roofType = 'stepped';
          spireHeight = Math.floor(Math.random() * 30 + 15);
        } else {
          roofType = 'standard';
          hasHelipad = Math.random() > 0.6;
        }
        windowStyle = Math.random() > 0.5 ? 'curtain' : 'grid';

      } else if (districtIdx === 1) {
        // --- District 1: Megastructures & Active Construction ---
        bWidth = Math.floor(Math.random() * 85 + 55);
        bHeight = Math.floor(Math.random() * (baseH * 0.44) + (baseH * 0.24));
        const r = Math.random();
        if (r > 0.60) {
          roofType = 'crane';
          hasCrane = true;
          craneHeight = Math.floor(Math.random() * 35 + 28);
          craneArmLen = Math.floor(Math.random() * 40 + 30);
        } else if (r > 0.30) {
          roofType = Math.random() > 0.5 ? 'slanted_left' : 'slanted_right';
        } else {
          roofType = 'antenna_mast';
          spireHeight = Math.floor(Math.random() * 50 + 35);
        }
        windowStyle = Math.random() > 0.4 ? 'ribbon' : 'grid';

      } else if (districtIdx === 2) {
        // --- District 2: Art Deco & Historic Midtown ---
        bWidth = Math.floor(Math.random() * 70 + 45);
        bHeight = Math.floor(Math.random() * (baseH * 0.38) + (baseH * 0.20));
        const r = Math.random();
        if (r > 0.55) {
          roofType = 'stepped';
          spireHeight = Math.floor(Math.random() * 35 + 20);
        } else if (r > 0.25) {
          roofType = 'standard';
          hasWaterTower = true;
        } else {
          roofType = 'spire';
          spireHeight = Math.floor(Math.random() * 45 + 25);
        }
        windowStyle = Math.random() > 0.6 ? 'penthouse' : 'grid';

      } else if (districtIdx === 3) {
        // --- District 3: Industrial Port & Power ---
        bWidth = Math.floor(Math.random() * 95 + 65);
        bHeight = Math.floor(Math.random() * (baseH * 0.30) + (baseH * 0.16));
        const r = Math.random();
        if (r > 0.55) {
          roofType = 'smokestacks';
          smokestacks = Math.floor(Math.random() * 2 + 2);
        } else if (r > 0.25) {
          roofType = 'sawtooth';
        } else {
          roofType = 'standard';
          hasWaterTower = true;
        }
        windowStyle = 'industrial';

      } else {
        // --- District 4: Modern Skyline & Spire Towers ---
        bWidth = Math.floor(Math.random() * 70 + 45);
        bHeight = Math.floor(Math.random() * (baseH * 0.44) + (baseH * 0.22));
        const r = Math.random();
        if (r > 0.6) {
          roofType = 'spire';
          spireHeight = Math.floor(Math.random() * 45 + 25);
        } else if (r > 0.3) {
          roofType = 'stepped';
          spireHeight = Math.floor(Math.random() * 30 + 15);
        } else {
          roofType = 'antenna_mast';
          spireHeight = 35;
        }
        windowStyle = 'grid';
      }

      // Generate procedural lit window arrays based on building window style
      const windows = [];
      const rows = Math.floor(bHeight / 16);
      const cols = Math.floor(bWidth / 11);

      if (windowStyle === 'curtain') {
        // Vertical curtain wall glass strips (modern financial towers)
        for (let c = 1; c < cols - 1; c += 2) {
          const colBright = Math.random() * 0.35 + 0.18;
          for (let r = 2; r < rows - 1; r++) {
            if (Math.random() > 0.25) {
              windows.push({
                x: c * 11 + 2,
                y: r * 16 + 2,
                w: 6,
                h: 11,
                brightness: colBright + (Math.random() * 0.15 - 0.07),
                tint: 'cool'
              });
            }
          }
        }
      } else if (windowStyle === 'ribbon') {
        // Horizontal ribbon bands (tech / modernist blocks)
        for (let r = 2; r < rows - 1; r += 2) {
          const rowBright = Math.random() * 0.38 + 0.15;
          for (let c = 1; c < cols - 1; c++) {
            if (Math.random() > 0.3) {
              windows.push({
                x: c * 11 + 1,
                y: r * 16 + 3,
                w: 8,
                h: 6,
                brightness: rowBright,
                tint: 'neutral'
              });
            }
          }
        }
      } else if (windowStyle === 'penthouse') {
        // Warm penthouse suites on top floors, scattered below
        for (let r = 1; r < rows - 1; r++) {
          const isTop = r <= 3;
          for (let c = 1; c < cols - 1; c++) {
            if (isTop ? Math.random() > 0.2 : Math.random() > 0.65) {
              windows.push({
                x: c * 11 + 2,
                y: r * 16 + 3,
                w: 5,
                h: 8,
                brightness: isTop ? (Math.random() * 0.45 + 0.35) : (Math.random() * 0.3 + 0.15),
                tint: isTop ? 'warm' : 'neutral'
              });
            }
          }
        }
      } else if (windowStyle === 'industrial') {
        // Sparse high-bay windows and yellow sodium security fixtures
        for (let r = 2; r < rows - 1; r += 2) {
          for (let c = 1; c < cols - 1; c += 2) {
            if (Math.random() > 0.6) {
              windows.push({
                x: c * 11 + 2,
                y: r * 16 + 4,
                w: 6,
                h: 7,
                brightness: Math.random() * 0.4 + 0.18,
                tint: 'amber'
              });
            }
          }
        }
      } else {
        // Standard office punched window grid
        for (let r = 1; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            if (Math.random() > 0.62) {
              windows.push({
                x: c * 11 + 2,
                y: r * 16 + 3,
                w: 5,
                h: 8,
                brightness: Math.random() * 0.42 + 0.18,
                tint: 'neutral'
              });
            }
          }
        }
      }

      midBuildings.push({
        x: curX,
        width: bWidth,
        height: bHeight,
        roofType: roofType,
        spireHeight: spireHeight,
        hasWaterTower: hasWaterTower,
        hasHelipad: hasHelipad,
        hasCrane: hasCrane,
        craneHeight: craneHeight,
        craneArmLen: craneArmLen,
        smokestacks: smokestacks,
        windows: windows,
        district: districtIdx
      });

      curX += bWidth + Math.floor(Math.random() * 16 - 2);
    }
  }

  class RainDrop {
    constructor(initRandomY = true) {
      this.reset(initRandomY);
    }

    reset(initRandomY = false) {
      // 3D coordinates: x, y, and depth z (0.2 distant to 2.2 near)
      this.z = Math.random() * 2.0 + 0.2;
      this.x = Math.random() * (width + 400) - 200;
      this.y = initRandomY ? Math.random() * height : -60;

      // Projection properties
      const speedScale = weather.rainSpeed / 18;
      this.speed = (7 + this.z * 15) * speedScale;
      this.len = (weather.dropLength * 0.5 + this.z * (weather.dropLength * 0.6));
      this.thickness = Math.max(0.6, this.z * 0.9);

      // Monochrome drop opacity
      const alpha = Math.min(0.9, (this.z / 2.2) * 0.6 + 0.15);
      this.color = `rgba(255, 255, 255, ${alpha})`;
    }

    update(externalVel = 0) {
      const currentWind = (weather.windAngle + mouseTiltX - externalVel * 0.02);
      this.x += currentWind * (this.z * 0.9);
      this.y += this.speed;

      // When hitting ground or low rooftop plane
      if (this.y > height - 12) {
        if (weather.splashesEnabled && this.z > 0.8 && splashes.length < 90) {
          splashes.push(new Splash(this.x, height - 12, this.z));
        }
        this.reset(false);
      }

      if (this.x < -200) this.x = width + 150;
      if (this.x > width + 200) this.x = -150;
    }

    draw(ctx, palette) {
      const currentWind = (weather.windAngle + mouseTiltX);
      const slantX = currentWind * (this.len * 0.32);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + slantX, this.y + this.len);
      const alpha = Math.min(0.9, (this.z / 2.2) * 0.6 + 0.15);
      const color = palette && palette.rainRgb ? palette.rainRgb : '255, 255, 255';
      const rainMult = palette && palette.isLight ? 0.65 : 1.0;
      ctx.strokeStyle = `rgba(${color}, ${alpha * rainMult})`;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
  }

  class Splash {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.radiusX = 1;
      this.radiusY = 0.35; // 2.5D perspective ellipse
      this.maxRadius = (3 + z * 5.5);
      this.alpha = 0.55 * (z / 2.2);
    }

    update() {
      this.radiusX += 0.9;
      this.radiusY += 0.32;
      this.alpha -= 0.05;
    }

    draw(ctx, palette) {
      if (this.alpha <= 0) return;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      const color = palette && palette.splashRgb ? palette.splashRgb : '255, 255, 255';
      const splashMult = palette && palette.isLight ? 0.65 : 1.0;
      ctx.strokeStyle = `rgba(${color}, ${this.alpha * splashMult})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    generateCityscape();
    initRainDrops();
  }

  function initRainDrops() {
    drops = [];
    const count = parseInt(weather.dropCount, 10) || 300;
    for (let i = 0; i < count; i++) {
      drops.push(new RainDrop(true));
    }
  }

  // -------------------------------------------------------------------------
  // Theme Palettes for 2.5D Panoramic Canvas Architecture
  // -------------------------------------------------------------------------
  const THEME_PALETTES = {
    dark: {
      isLight: false,
      distantFill: (op) => `rgba(10, 14, 18, ${op * 0.95})`,
      midFill: (op) => `rgba(4, 6, 8, ${op})`,
      rainRgb: '255, 255, 255',
      splashRgb: '255, 255, 255',
      spireStrobe: (op) => `rgba(255, 255, 255, ${op * 0.88})`,
      beaconStrobe: 'rgba(255, 55, 55, 0.95)',
      helipadStrobe: 'rgba(34, 197, 94, 0.85)',
      mistGrad: [
        'rgba(12, 14, 18, 0)',
        (a) => `rgba(20, 24, 30, ${a})`,
        (a) => `rgba(6, 8, 10, ${a * 1.5})`
      ],
      windowColors: {
        warm: (a) => `rgba(255, 215, 140, ${a})`,
        cool: (a) => `rgba(215, 240, 255, ${a})`,
        amber: (a) => `rgba(255, 185, 75, ${a})`,
        default: (a) => `rgba(240, 240, 240, ${a})`
      }
    },
    light: {
      isLight: true,
      distantFill: (op) => `rgba(182, 194, 210, ${op * 0.95})`,
      midFill: (op) => `rgba(138, 150, 168, ${op})`,
      rainRgb: '90, 105, 125',
      splashRgb: '100, 115, 130',
      spireStrobe: (op) => `rgba(70, 85, 105, ${op * 0.88})`,
      beaconStrobe: 'rgba(235, 60, 60, 0.92)',
      helipadStrobe: 'rgba(16, 185, 129, 0.85)',
      mistGrad: [
        'rgba(238, 242, 246, 0)',
        (a) => `rgba(225, 233, 244, ${a})`,
        (a) => `rgba(210, 222, 235, ${a * 1.4})`
      ],
      windowColors: {
        warm: (a) => `rgba(255, 190, 80, ${a * 1.3})`,
        cool: (a) => `rgba(220, 235, 255, ${a * 1.3})`,
        amber: (a) => `rgba(255, 175, 60, ${a * 1.3})`,
        default: (a) => `rgba(255, 255, 255, ${a * 1.4})`
      }
    },
    mocha: {
      isLight: false,
      distantFill: (op) => `rgba(17, 17, 27, ${op * 0.95})`,
      midFill: (op) => `rgba(24, 24, 37, ${op})`,
      rainRgb: '180, 190, 254',
      splashRgb: '203, 166, 247',
      spireStrobe: (op) => `rgba(203, 166, 247, ${op * 0.9})`,
      beaconStrobe: 'rgba(243, 139, 168, 0.95)',
      helipadStrobe: 'rgba(166, 227, 161, 0.85)',
      mistGrad: [
        'rgba(17, 17, 27, 0)',
        (a) => `rgba(30, 30, 46, ${a})`,
        (a) => `rgba(17, 17, 27, ${a * 1.5})`
      ],
      windowColors: {
        warm: (a) => `rgba(250, 179, 135, ${a})`,
        cool: (a) => `rgba(137, 220, 235, ${a})`,
        amber: (a) => `rgba(249, 226, 175, ${a})`,
        default: (a) => `rgba(205, 214, 244, ${a})`
      }
    },
    macchiato: {
      isLight: false,
      distantFill: (op) => `rgba(24, 25, 38, ${op * 0.95})`,
      midFill: (op) => `rgba(30, 32, 48, ${op})`,
      rainRgb: '183, 189, 248',
      splashRgb: '138, 173, 244',
      spireStrobe: (op) => `rgba(138, 173, 244, ${op * 0.9})`,
      beaconStrobe: 'rgba(237, 135, 150, 0.95)',
      helipadStrobe: 'rgba(166, 218, 149, 0.85)',
      mistGrad: [
        'rgba(24, 25, 38, 0)',
        (a) => `rgba(36, 39, 58, ${a})`,
        (a) => `rgba(24, 25, 38, ${a * 1.5})`
      ],
      windowColors: {
        warm: (a) => `rgba(245, 169, 127, ${a})`,
        cool: (a) => `rgba(145, 215, 227, ${a})`,
        amber: (a) => `rgba(238, 212, 159, ${a})`,
        default: (a) => `rgba(202, 211, 245, ${a})`
      }
    },
    frappe: {
      isLight: false,
      distantFill: (op) => `rgba(35, 38, 52, ${op * 0.95})`,
      midFill: (op) => `rgba(41, 44, 60, ${op})`,
      rainRgb: '186, 187, 241',
      splashRgb: '133, 193, 220',
      spireStrobe: (op) => `rgba(133, 193, 220, ${op * 0.9})`,
      beaconStrobe: 'rgba(231, 130, 132, 0.95)',
      helipadStrobe: 'rgba(166, 209, 137, 0.85)',
      mistGrad: [
        'rgba(35, 38, 52, 0)',
        (a) => `rgba(48, 52, 70, ${a})`,
        (a) => `rgba(35, 38, 52, ${a * 1.5})`
      ],
      windowColors: {
        warm: (a) => `rgba(239, 159, 118, ${a})`,
        cool: (a) => `rgba(153, 209, 219, ${a})`,
        amber: (a) => `rgba(229, 200, 144, ${a})`,
        default: (a) => `rgba(198, 208, 245, ${a})`
      }
    },
    latte: {
      isLight: true,
      distantFill: (op) => `rgba(204, 208, 218, ${op * 0.95})`,
      midFill: (op) => `rgba(172, 176, 190, ${op})`,
      rainRgb: '114, 135, 253',
      splashRgb: '30, 102, 245',
      spireStrobe: (op) => `rgba(30, 102, 245, ${op * 0.88})`,
      beaconStrobe: 'rgba(210, 15, 57, 0.92)',
      helipadStrobe: 'rgba(64, 160, 43, 0.85)',
      mistGrad: [
        'rgba(239, 241, 245, 0)',
        (a) => `rgba(230, 233, 239, ${a})`,
        (a) => `rgba(220, 224, 232, ${a * 1.4})`
      ],
      windowColors: {
        warm: (a) => `rgba(254, 100, 11, ${a * 1.2})`,
        cool: (a) => `rgba(4, 165, 229, ${a * 1.2})`,
        amber: (a) => `rgba(223, 142, 29, ${a * 1.2})`,
        default: (a) => `rgba(255, 255, 255, ${a * 1.4})`
      }
    }
  };

  let activeThemeKey = 'dark';

  function getActivePalette() {
    return THEME_PALETTES[activeThemeKey] || THEME_PALETTES.dark;
  }

  function drawCityscape(palette) {
    if (weather.cityVisibility <= 0) return;
    const cityOpacity = (weather.cityVisibility / 100);
    const pal = palette || getActivePalette();

    ctx.save();

    // -------------------------------------------------------------------------
    // Gentle & Natural Scroll Parallax (Comfortable speed, no excessive rush)
    // -------------------------------------------------------------------------
    const midShift = ((scrollY * 0.22 + mouseTiltX * 8) % worldWidth + worldWidth) % worldWidth;
    const distantShift = ((scrollY * 0.08 + mouseTiltX * 4) % worldWidth + worldWidth) % worldWidth;

    // Distant layer fill:
    const distantFill = pal.distantFill(cityOpacity);
    ctx.fillStyle = distantFill;

    for (let i = 0; i < distantBuildings.length; i++) {
      const b = distantBuildings[i];
      let bx = ((b.x - distantShift) % worldWidth + worldWidth) % worldWidth;
      if (bx > width + 100) bx -= worldWidth;

      const positions = [bx];
      if (bx + worldWidth < width + 100) positions.push(bx + worldWidth);

      for (let p = 0; p < positions.length; p++) {
        const x = positions[p];
        if (x + b.width < -60 || x > width + 60) continue;

        // Cylindrical perspective curvature as panorama revolves
        const normX = (x + b.width / 2 - width / 2) / (width / 2);
        const curveY = Math.pow(normX, 2) * 8;
        const by = height - b.height + curveY;

        ctx.fillStyle = distantFill;
        ctx.fillRect(x, by, b.width, b.height + 60);

        if (b.type === 'spire') {
          ctx.fillRect(x + b.width / 2 - 1.5, by - b.spireHeight, 3, b.spireHeight);
          // Blinking distant aviation strobe
          if ((Date.now() + i * 340) % 1800 < 900) {
            ctx.fillStyle = pal.spireStrobe(cityOpacity);
            ctx.fillRect(x + b.width / 2 - 2, by - b.spireHeight - 2, 4, 4);
          }
        } else if (b.type === 'antenna') {
          ctx.fillRect(x + b.width / 2 - 1, by - b.spireHeight, 2, b.spireHeight);
          if ((Date.now() + i * 260) % 1400 < 700) {
            ctx.fillStyle = pal.beaconStrobe;
            ctx.fillRect(x + b.width / 2 - 2, by - b.spireHeight - 2, 4, 4);
          }
        } else if (b.type === 'stepped') {
          ctx.fillRect(x + b.width * 0.2, by - 12, b.width * 0.6, 13);
          ctx.fillRect(x + b.width * 0.4, by - 22, b.width * 0.2, 11);
        } else if (b.type === 'cooling_tower') {
          // Curved hyperbolic profile for industrial sector
          ctx.beginPath();
          ctx.moveTo(x + 4, by);
          ctx.quadraticCurveTo(x + b.width * 0.5, by + 15, x + b.width - 4, by);
          ctx.lineTo(x + b.width, by + 25);
          ctx.lineTo(x, by + 25);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Midground City Buildings Layer (Rich Architecture, Cranes, Windows)
    // Fixed vertical position at horizon
    // -------------------------------------------------------------------------
    for (let i = 0; i < midBuildings.length; i++) {
      const b = midBuildings[i];
      let bx = ((b.x - midShift) % worldWidth + worldWidth) % worldWidth;
      if (bx > width + 120) bx -= worldWidth;

      const positions = [bx];
      if (bx + worldWidth < width + 120) positions.push(bx + worldWidth);

      for (let p = 0; p < positions.length; p++) {
        const x = positions[p];
        if (x + b.width < -80 || x > width + 80) continue;

        const normX = (x + b.width / 2 - width / 2) / (width / 2);
        const curveY = Math.pow(normX, 2) * 14;
        const by = height - b.height + curveY;

        const midFill = pal.midFill(cityOpacity);
        ctx.fillStyle = midFill;

        // Main building mass
        ctx.fillRect(x, by, b.width, b.height + 70);

        // Roofline architectural specifics
        if (b.roofType === 'stepped') {
          // Art Deco ziggurat tiers
          ctx.fillRect(x + b.width * 0.12, by - 16, b.width * 0.76, 17);
          ctx.fillRect(x + b.width * 0.26, by - 28, b.width * 0.48, 13);
          ctx.fillRect(x + b.width * 0.5 - 1.5, by - 28 - b.spireHeight, 3, b.spireHeight);

          // Blinking spire apex beacon
          if ((Date.now() + i * 320) % 1600 < 800) {
            ctx.fillStyle = pal.beaconStrobe;
            ctx.fillRect(x + b.width * 0.5 - 2, by - 30 - b.spireHeight, 4, 4);
            ctx.fillStyle = midFill;
          }
        } else if (b.roofType === 'slanted_left') {
          // Diagonal wedge roof (sloping down to left)
          ctx.beginPath();
          ctx.moveTo(x, by + 22);
          ctx.lineTo(x + b.width, by);
          ctx.lineTo(x + b.width, by + 24);
          ctx.lineTo(x, by + 24);
          ctx.closePath();
          ctx.fill();
        } else if (b.roofType === 'slanted_right') {
          // Diagonal wedge roof (sloping down to right)
          ctx.beginPath();
          ctx.moveTo(x, by);
          ctx.lineTo(x + b.width, by + 22);
          ctx.lineTo(x + b.width, by + 24);
          ctx.lineTo(x, by + 24);
          ctx.closePath();
          ctx.fill();
        } else if (b.roofType === 'crane' || b.hasCrane) {
          // Construction Crane: Solid architectural silhouette (no thin wire lines)
          const mastX = x + b.width * 0.38;
          const mastTop = by - b.craneHeight;
          ctx.fillRect(mastX, mastTop, 3.5, b.craneHeight);
          ctx.fillRect(mastX - 16, mastTop, b.craneArmLen + 16, 2.5);
          ctx.fillRect(mastX - 15, mastTop + 2, 7, 6);

          // Flashing aviation safety strobe on crane apex
          if ((Date.now() + i * 220) % 1200 < 600) {
            ctx.fillStyle = pal.beaconStrobe;
            ctx.fillRect(mastX - 1, mastTop - 6, 5, 4);
            ctx.fillStyle = midFill;
          }
        } else if (b.roofType === 'antenna_mast') {
            // Lattice broadcast antenna tower with cross struts
            const mastX = x + b.width * 0.5 - 1.5;
            ctx.fillRect(mastX, by - b.spireHeight, 3, b.spireHeight);
            ctx.fillRect(mastX - 7, by - b.spireHeight * 0.65, 17, 2);
            ctx.fillRect(mastX - 5, by - b.spireHeight * 0.35, 13, 2);

            // Pulsing red beacon
            if ((Date.now() + i * 280) % 1500 < 750) {
              ctx.fillStyle = pal.beaconStrobe;
              ctx.fillRect(mastX - 1, by - b.spireHeight - 2, 5, 4);
              ctx.fillStyle = midFill;
            }
          } else if (b.roofType === 'smokestacks') {
            // Industrial chimney stacks with hazard bands
            const stackCount = b.smokestacks || 2;
            const spacing = b.width / (stackCount + 1);
            for (let s = 1; s <= stackCount; s++) {
              const sx = x + s * spacing - 4;
              ctx.fillRect(sx, by - 26, 8, 26);
              ctx.fillStyle = pal.spireStrobe(cityOpacity);
              ctx.fillRect(sx, by - 26, 8, 4);
              ctx.fillStyle = pal.beaconStrobe;
              ctx.fillRect(sx, by - 20, 8, 4);
              ctx.fillStyle = midFill;
            }
          } else if (b.roofType === 'sawtooth') {
            // Industrial sawtooth roof skylights
            for (let st = 0; st < b.width - 14; st += 18) {
              ctx.beginPath();
              ctx.moveTo(x + st, by);
              ctx.lineTo(x + st + 14, by - 11);
              ctx.lineTo(x + st + 14, by);
              ctx.closePath();
              ctx.fill();
            }
          } else if (b.roofType === 'spire') {
            ctx.fillRect(x + b.width * 0.5 - 1.5, by - b.spireHeight, 3, b.spireHeight);
            if ((Date.now() + i * 300) % 1800 < 900) {
              ctx.fillStyle = pal.spireStrobe(cityOpacity);
              ctx.fillRect(x + b.width * 0.5 - 2, by - b.spireHeight - 2, 4, 4);
              ctx.fillStyle = midFill;
            }
          }

          // Rooftop water tower
          if (b.hasWaterTower) {
            const tx = x + 10;
            const ty = by - 18;
            ctx.fillRect(tx, ty + 10, 2, 9);
            ctx.fillRect(tx + 12, ty + 10, 2, 9);
            ctx.fillRect(tx - 1, ty, 16, 11);
            ctx.beginPath();
            ctx.moveTo(tx - 2, ty);
            ctx.lineTo(tx + 7, ty - 5);
            ctx.lineTo(tx + 16, ty);
            ctx.closePath();
            ctx.fill();
          }

          // Rooftop helipad
          if (b.hasHelipad) {
            ctx.fillRect(x + b.width * 0.18, by - 5, b.width * 0.64, 5);
            ctx.fillStyle = pal.helipadStrobe;
            ctx.fillRect(x + b.width * 0.18 + 2, by - 7, 3, 2);
            ctx.fillRect(x + b.width * 0.82 - 5, by - 7, 3, 2);
            ctx.fillStyle = midFill;
          }

        // Draw Lit Windows with theme tints
        if (weather.windowLights && b.windows) {
          for (let j = 0; j < b.windows.length; j++) {
            const w = b.windows[j];
            const baseAlpha = w.brightness * cityOpacity;
            const windowFn = pal.windowColors[w.tint] || pal.windowColors.default;
            ctx.fillStyle = windowFn(baseAlpha);
            ctx.fillRect(x + w.x, by + w.y, w.w, w.h);
          }
          ctx.fillStyle = midFill;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. Drifting Atmospheric Fog / Mist Banks (Anchored to Horizon)
    // -------------------------------------------------------------------------
    if (weather.mistDensity > 0) {
      mistOffset += 0.25;
      const mistAlpha = (weather.mistDensity / 100) * (pal.isLight ? 0.35 : 0.28);
      const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      grad.addColorStop(0, pal.mistGrad[0]);
      grad.addColorStop(0.65, pal.mistGrad[1](mistAlpha));
      grad.addColorStop(1, pal.mistGrad[2](mistAlpha));
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);
    }

    ctx.restore();
  }

  function animateRain() {
    if (!ctx) return;

    const palette = getActivePalette();

    // Smooth tilt interpolation
    mouseTiltX += (targetTiltX - mouseTiltX) * 0.05;

    // Smooth scroll interpolation (revolving momentum lerp)
    const prevScrollY = scrollY;
    scrollY += (targetScrollY - scrollY) * 0.08;
    scrollVel = scrollY - prevScrollY;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Draw revolving city skyline and atmosphere
    drawCityscape(palette);

    // Update and draw raindrops (reacts to wind + scroll velocity)
    for (let i = 0; i < drops.length; i++) {
      drops[i].update(scrollVel);
      drops[i].draw(ctx, palette);
    }

    // Update and draw splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
      const splash = splashes[i];
      splash.update();
      splash.draw(ctx, palette);
      if (splash.alpha <= 0) {
        splashes.splice(i, 1);
      }
    }

    requestAnimationFrame(animateRain);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', (e) => {
    const ratio = (e.clientX / window.innerWidth) - 0.5;
    targetTiltX = ratio * 3.5;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 4. Windows NT Taskbar Clock
  // -------------------------------------------------------------------------
  function updateTrayClock() {
    const clockEl = document.getElementById('tray-clock');
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
  }

  setInterval(updateTrayClock, 1000);

  // -------------------------------------------------------------------------
  // 5. Theme Management (Catppuccin & Monochrome System)
  // -------------------------------------------------------------------------
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeMenu = document.getElementById('theme-menu');
  const themeOptions = document.querySelectorAll('.theme-option');

  const ALL_THEME_CLASSES = ['dark', 'light', 'theme-mocha', 'theme-macchiato', 'theme-frappe', 'theme-latte'];

  function applyTheme(theme) {
    if (!THEME_PALETTES[theme]) {
      theme = 'dark';
    }

    activeThemeKey = theme;

    // Clear all existing theme classes from body
    ALL_THEME_CLASSES.forEach((cls) => body.classList.remove(cls));

    // Apply the active theme class
    if (theme === 'dark' || theme === 'light') {
      body.classList.add(theme);
    } else {
      body.classList.add(`theme-${theme}`);
    }

    // Update active state in theme menu options
    if (themeOptions && themeOptions.length > 0) {
      themeOptions.forEach((opt) => {
        const optTheme = opt.getAttribute('data-theme');
        if (optTheme === theme) {
          opt.classList.add('active');
          opt.setAttribute('aria-selected', 'true');
        } else {
          opt.classList.remove('active');
          opt.setAttribute('aria-selected', 'false');
        }
      });
    }

    // Update theme toggle button title
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('title', `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`);
    }
  }

  function toggleThemeMenu(forceState) {
    if (!themeMenu) return;
    const shouldOpen = typeof forceState === 'boolean' 
      ? forceState 
      : !themeMenu.classList.contains('open');

    if (shouldOpen) {
      themeMenu.classList.add('open');
      if (themeToggleBtn) {
        themeToggleBtn.classList.add('active');
        themeToggleBtn.setAttribute('aria-expanded', 'true');
      }
    } else {
      themeMenu.classList.remove('open');
      if (themeToggleBtn) {
        themeToggleBtn.classList.remove('active');
        themeToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemeMenu();
    });
  }

  if (themeOptions && themeOptions.length > 0) {
    themeOptions.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTheme = opt.getAttribute('data-theme');
        if (selectedTheme) {
          applyTheme(selectedTheme);
          localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
        }
        toggleThemeMenu(false);
      });
    });
  }

  // Close theme menu on click outside or Escape
  document.addEventListener('click', (e) => {
    if (themeMenu && themeMenu.classList.contains('open')) {
      if (!themeMenu.contains(e.target) && e.target !== themeToggleBtn && !themeToggleBtn.contains(e.target)) {
        toggleThemeMenu(false);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && themeMenu && themeMenu.classList.contains('open')) {
      toggleThemeMenu(false);
    }
  });

  // -------------------------------------------------------------------------
  // Ambient Rain & Lightning Audio Controls
  // -------------------------------------------------------------------------
  const rainAudio = document.getElementById('ambient-rain');
  const rainSoundBtn = document.getElementById('rain-sound-toggle');
  let rainFadeTimer = null;

  if (rainSoundBtn && rainAudio) {
    rainAudio.volume = 0;

    rainSoundBtn.addEventListener('click', () => {
      isRainSoundPlaying = !isRainSoundPlaying;
      if (rainFadeTimer) clearInterval(rainFadeTimer);

      if (isRainSoundPlaying) {
        rainSoundBtn.classList.add('active');
        rainSoundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        rainSoundBtn.setAttribute('title', 'Mute ambient rain sound');

        rainAudio.play().then(() => {
          let currentVol = rainAudio.volume;
          rainFadeTimer = setInterval(() => {
            currentVol = Math.min(0.65, currentVol + 0.05);
            rainAudio.volume = currentVol;
            if (currentVol >= 0.65) clearInterval(rainFadeTimer);
          }, 40);
        }).catch(() => {
          isRainSoundPlaying = false;
          rainSoundBtn.classList.remove('active');
          rainSoundBtn.innerHTML = '<i class="fa-solid fa-cloud-rain"></i>';
          rainSoundBtn.setAttribute('title', 'Play ambient rain sound');
        });
      } else {
        rainSoundBtn.classList.remove('active');
        rainSoundBtn.innerHTML = '<i class="fa-solid fa-cloud-rain"></i>';
        rainSoundBtn.setAttribute('title', 'Play ambient rain sound');

        let currentVol = rainAudio.volume;
        rainFadeTimer = setInterval(() => {
          currentVol = Math.max(0, currentVol - 0.05);
          rainAudio.volume = currentVol;
          if (currentVol <= 0) {
            clearInterval(rainFadeTimer);
            rainAudio.pause();
          }
        }, 40);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. Minimalist Window Decorations & Top Bar Docking Logic
  // -------------------------------------------------------------------------
  function findWindowTargetKey(win) {
    if (!win) return null;
    if (win.id) return win.id;
    const parentSection = win.closest('section');
    if (parentSection && parentSection.id) return parentSection.id;
    if (win.tagName.toLowerCase() === 'header') return 'home';
    return null;
  }

  function getTaskItemByKey(key) {
    if (!key) return null;
    return document.querySelector(`.nt-task-item[data-target="${key}"]`) ||
           document.querySelector(`.nt-task-item[href="#${key}"]`);
  }

  function updateTaskbarDot(key) {
    const taskItem = getTaskItemByKey(key);
    if (!taskItem) return;

    // Check if any window associated with this key is minimized
    const isAnyMinimized = Array.from(document.querySelectorAll('.nt-window.is-minimized')).some(win => {
      return findWindowTargetKey(win) === key;
    });

    if (isAnyMinimized) {
      taskItem.classList.add('has-minimized');
    } else {
      taskItem.classList.remove('has-minimized');
    }
  }

  window.minimizeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;

    const targetKey = findWindowTargetKey(win);

    win.classList.remove('restoring-from-dock');
    win.classList.add('minimizing-to-dock');

    setTimeout(() => {
      win.classList.add('is-minimized');
      win.style.display = 'none';
      updateTaskbarDot(targetKey);
      showToast(`Card minimized to bar.`);
    }, 320);
  };

  function scrollToElement(el) {
    if (!el) return;
    const taskbarHeight = 56;
    const elementRect = el.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const targetScrollY = Math.max(0, absoluteElementTop - taskbarHeight);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }

  window.restoreWindow = function (win) {
    if (!win) return;
    const targetKey = findWindowTargetKey(win);

    win.style.display = '';
    win.classList.remove('is-minimized', 'minimizing-to-dock');
    win.classList.add('restoring-from-dock');

    updateTaskbarDot(targetKey);

    setTimeout(() => {
      win.classList.remove('restoring-from-dock');
    }, 450);

    scrollToElement(win);
  };

  window.toggleMaximizeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;
    win.classList.toggle('maximized');
  };

  window.closeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;

    const titleEl = win.querySelector('.nt-titlebar-left span');
    const titleText = titleEl ? titleEl.textContent : 'Window';
    const targetKey = findWindowTargetKey(win);

    win.classList.add('closing');

    setTimeout(() => {
      win.style.display = 'none';
      win.classList.remove('closing');
      win.classList.remove('is-minimized');
      updateTaskbarDot(targetKey);
      showToast(`${titleText} removed.`);
    }, 320);
  };

  // Wire up Top Bar Navigation Items to Restore Minimized Cards or Smooth Scroll
  document.querySelectorAll('.nt-task-item').forEach(taskItem => {
    taskItem.addEventListener('click', (e) => {
      const targetKey = taskItem.dataset.target || (taskItem.getAttribute('href') || '').replace('#', '');
      if (!targetKey) return;

      // Find any cards corresponding to this key
      let cards = [];
      const section = document.getElementById(targetKey);
      if (section) {
        if (section.classList.contains('nt-window')) {
          cards.push(section);
        } else {
          cards = Array.from(section.querySelectorAll('.nt-window'));
        }
      }

      const minimizedCards = cards.filter(c => c.classList.contains('is-minimized'));

      if (minimizedCards.length > 0) {
        e.preventDefault();
        // Restore each minimized card with a staggered pop
        minimizedCards.forEach((card, idx) => {
          setTimeout(() => {
            window.restoreWindow(card);
          }, idx * 80);
        });

        // Smooth scroll to the first restored card once it is laid out
        setTimeout(() => {
          scrollToElement(minimizedCards[0]);
        }, 60);

        showToast(`Restored ${targetKey} card.`);
      } else if (cards.length > 0) {
        // If not minimized, standard smooth scroll
        e.preventDefault();
        scrollToElement(cards[0]);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 7. Dynamic Typewriter (STABLE - No Window Jitter)
  // -------------------------------------------------------------------------
  const phrases = [
    "Anik Biswas",
    "Myhem",
    "CS Student",
    "Arch Linux / Hyprland",
    "C Programmer",
    "Musichoarder",
    "PC Masterrace",
    "Minimalist"
  ];

  const GLITCH_GLYPHS = "01_~#<>!/*&^%$█▓▒░[]{}λπµ§±÷×≠≈≡≤≥ØΨΩ";
  let phraseIndex = 0;
  const typedHeading = document.getElementById('typed-heading');
  let typeGlitchTimer = null;

  function typeLoop() {
    if (!typedHeading) return;
    if (typeGlitchTimer) cancelAnimationFrame(typeGlitchTimer);

    const targetPhrase = phrases[phraseIndex];
    typedHeading.innerHTML = '';

    // Create glitch-char spans for each character
    const charElements = [];
    for (let i = 0; i < targetPhrase.length; i++) {
      const span = document.createElement('span');
      span.className = 'glitch-char scrambling';
      if (targetPhrase[i] === ' ') {
        span.textContent = '\u00A0'; // non-breaking space
        span.classList.remove('scrambling');
        span.classList.add('locked');
      } else {
        span.textContent = GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
      }
      typedHeading.appendChild(span);
      charElements.push(span);
    }

    const startTime = performance.now();
    // Stagger locking each character across time
    const baseLockInterval = Math.max(50, Math.min(110, Math.floor(1200 / targetPhrase.length)));
    const lockTimes = [];
    let cumulative = 200;
    for (let i = 0; i < targetPhrase.length; i++) {
      if (targetPhrase[i] === ' ') {
        lockTimes.push(0);
      } else {
        cumulative += baseLockInterval;
        lockTimes.push(cumulative);
      }
    }

    let isCycleDone = false;

    function scrambleFrame(currentTime) {
      if (isCycleDone) return;
      const elapsed = currentTime - startTime;
      let allLocked = true;

      charElements.forEach((el, i) => {
        if (targetPhrase[i] === ' ') return;

        if (elapsed >= lockTimes[i]) {
          if (el.textContent !== targetPhrase[i]) {
            el.textContent = targetPhrase[i];
            el.classList.remove('scrambling');
            el.classList.add('locked');
          }
        } else {
          allLocked = false;
          // Random glyph scramble
          const randomGlyph = GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
          el.textContent = randomGlyph;
          if (!el.classList.contains('scrambling')) {
            el.classList.add('scrambling');
          }
        }
      });

      if (allLocked) {
        isCycleDone = true;
        // Hold for reading, then trigger glitch descramble transition into next phrase
        setTimeout(scrambleOutToNext, 2400);
        return;
      }

      typeGlitchTimer = requestAnimationFrame(scrambleFrame);
    }

    function scrambleOutToNext() {
      // Scramble characters into glyphs before cycling to the next word
      const unscrambleStart = performance.now();
      const unscrambleDuration = 400;

      function unscrambleFrame(now) {
        const diff = now - unscrambleStart;
        if (diff >= unscrambleDuration) {
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typeLoop();
          return;
        }

        charElements.forEach((el, i) => {
          if (targetPhrase[i] !== ' ' && Math.random() > 0.35) {
            el.classList.remove('locked');
            el.classList.add('scrambling');
            el.textContent = GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
          }
        });

        typeGlitchTimer = requestAnimationFrame(unscrambleFrame);
      }

      typeGlitchTimer = requestAnimationFrame(unscrambleFrame);
    }

    typeGlitchTimer = requestAnimationFrame(scrambleFrame);
  }

  // -------------------------------------------------------------------------
  // 8. Smooth Accordions
  // -------------------------------------------------------------------------
  window.togglePostAccordion = function (btnElement) {
    const post = btnElement.closest('.nt-window');
    if (!post) return;

    const wrapper = post.querySelector('.accordion-wrapper');
    if (!wrapper) return;

    const isExpanded = wrapper.classList.contains('expanded');
    wrapper.classList.toggle('expanded');
    post.classList.toggle('is-open');

    const btnText = btnElement.querySelector('.btn-label');
    const isPhotos = btnElement.dataset.type === 'photos';

    if (!isExpanded) {
      if (btnText) btnText.textContent = isPhotos ? 'Hide Photos' : 'Collapse Guide';
      btnElement.setAttribute('aria-expanded', 'true');
    } else {
      if (btnText) btnText.textContent = isPhotos ? 'View Trip & Photos (4)' : 'View Hyprland Guide';
      btnElement.setAttribute('aria-expanded', 'false');
    }
  };

  // -------------------------------------------------------------------------
  // 9. Interactive Lossless Music Player Simulation
  // -------------------------------------------------------------------------
  const equalizer = document.getElementById('audio-equalizer');
  const vinylRecord = document.getElementById('music-vinyl');
  let isMusicPlaying = true;

  if (vinylRecord) {
    vinylRecord.setAttribute('title', 'Daft Punk - Random Access Memories (Click to pause/play)');
    vinylRecord.addEventListener('click', () => {
      isMusicPlaying = !isMusicPlaying;
      if (equalizer) equalizer.style.opacity = isMusicPlaying ? '1' : '0.2';
      if (isMusicPlaying) vinylRecord.classList.remove('paused');
      else vinylRecord.classList.add('paused');
    });
  }

  // -------------------------------------------------------------------------
  // 10. Legacy View Frame Toggle
  // -------------------------------------------------------------------------
  window.toggleLegacyFrame = function () {
    const container = document.getElementById('legacyFrameContainer');
    const iframe = document.getElementById('legacyIframe');
    const label = document.getElementById('legacyPreviewBtnLabel');
    if (!container || !iframe) return;

    if (container.style.display === 'none' || !container.style.display) {
      if (!iframe.src || iframe.src === 'about:blank' || iframe.src.endsWith('/')) {
        iframe.src = iframe.getAttribute('data-src') || 'legacy.html';
      }
      container.style.display = 'block';
      if (label) label.textContent = 'Hide Embedded Preview';
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      container.style.display = 'none';
      if (label) label.textContent = 'Show Embedded Preview';
    }
  };

  // -------------------------------------------------------------------------
  // 11. Back to Top Button
  // -------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      backToTopBtn.blur();
    });
  }

  // -------------------------------------------------------------------------
  // 12. Copy Email Toast Notification (anik@redpilllabs.in)
  // -------------------------------------------------------------------------
  window.copyEmail = function (email, e) {
    if (e) e.preventDefault();
    const targetEmail = email || 'anik@redpilllabs.in';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetEmail).then(() => {
        showToast(`Copied ${targetEmail} to clipboard.`);
      }).catch(() => {
        showToast(targetEmail);
      });
    } else {
      showToast(targetEmail);
    }
  };

  function showToast(message) {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  // -------------------------------------------------------------------------
  // 13. Hacker/Nerd-Font Glitch Boot Intro (Assembling into "ANIK")
  // -------------------------------------------------------------------------
  function initBootIntro() {
    const introOverlay = document.getElementById('site-intro');
    const wordEl = document.getElementById('intro-glitch-word');
    const sublineEl = document.getElementById('intro-subline');
    if (!introOverlay || !wordEl) return;

    const TARGET = "ANIK";
    const GLYPHS = "01_~#<>!/*&^%$█▓▒░[]{}λπµ§±÷×≠≈≡≤≥ØΨΩ";
    const charElements = wordEl.querySelectorAll('.glitch-char');
    const startTime = performance.now();
    let isDismissed = false;
    let animFrame = null;

    const lockTimes = [450, 750, 1050, 1350];

    function updateGlitch(currentTime) {
      if (isDismissed) return;
      const elapsed = currentTime - startTime;
      let allLocked = true;

      charElements.forEach((el, i) => {
        if (elapsed >= lockTimes[i]) {
          if (el.textContent !== TARGET[i]) {
            el.textContent = TARGET[i];
            el.classList.remove('scrambling');
            el.classList.add('locked');
          }
        } else {
          allLocked = false;
          const randomGlyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          el.textContent = randomGlyph;
          if (!el.classList.contains('scrambling')) {
            el.classList.add('scrambling');
          }
        }
      });

      if (allLocked) {
        if (sublineEl && !sublineEl.classList.contains('visible')) {
          sublineEl.classList.add('visible');
        }
        if (elapsed >= 1850) {
          dismissIntro();
          return;
        }
      }

      animFrame = requestAnimationFrame(updateGlitch);
    }

    function dismissIntro() {
      if (isDismissed) return;
      isDismissed = true;
      if (animFrame) cancelAnimationFrame(animFrame);

      charElements.forEach((el, i) => {
        el.textContent = TARGET[i];
        el.classList.remove('scrambling');
        el.classList.add('locked');
      });

      introOverlay.classList.add('fade-out');
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 600);
    }

    introOverlay.addEventListener('click', dismissIntro);
    window.addEventListener('keydown', (e) => {
      if (['Escape', 'Enter', 'Space'].includes(e.code) || e.key === ' ') {
        dismissIntro();
      }
    }, { once: true });

    animFrame = requestAnimationFrame(updateGlitch);
  }



  // -------------------------------------------------------------------------
  // 14. Minecraft Cape Hover Dynamic Hint
  // -------------------------------------------------------------------------
  function initMinecraftCapeHints() {
    const hint = document.getElementById('mcCapeHoverName');
    const items = document.querySelectorAll('.mc-cape-item');
    if (!hint || !items.length) return;

    items.forEach(item => {
      const name = item.getAttribute('data-name');
      item.addEventListener('mouseenter', () => {
        hint.textContent = '· ' + name;
      });
      item.addEventListener('mouseleave', () => {
        hint.textContent = '';
      });
    });
  }

  // -------------------------------------------------------------------------
  // 15. Mobile Topbar Compass Scrollspy & Animated Pointer
  // -------------------------------------------------------------------------
  function initMobileCompassScrollspy() {
    const tasksContainer = document.querySelector('.taskbar-tasks');
    const needle = document.getElementById('compassIndicator');
    const startBtn = document.querySelector('.nt-start-btn');
    const taskItems = Array.from(document.querySelectorAll('.nt-task-item'));

    if (!tasksContainer || !taskItems.length) return;

    // Ordered list of cards and their corresponding navigation keys
    const cardTargets = [
      { key: 'hero', getEl: () => document.querySelector('.hero-window') || document.querySelector('header.nt-window'), isStart: true },
      { key: 'about', getEl: () => document.getElementById('about') },
      { key: 'setup', getEl: () => document.getElementById('setup') },
      { key: 'projects', getEl: () => document.getElementById('projects') },
      { key: 'blog', getEl: () => document.getElementById('blog') },
      { key: 'music', getEl: () => document.getElementById('music') },
      { key: 'steam', getEl: () => document.getElementById('steam') },
      { key: 'minecraft', getEl: () => document.getElementById('minecraft') },
      { key: 'legacy', getEl: () => document.getElementById('legacy') },
      { key: 'contact', getEl: () => document.getElementById('contact') }
    ];

    let currentActiveKey = null;
    let isUserClicking = false;
    let clickTimeout = null;

    function setCompassActive(key, shouldScrollStrip = true) {
      if (key === currentActiveKey) return;
      currentActiveKey = key;

      // Handle start button ('anik')
      if (startBtn) {
        if (key === 'hero') {
          startBtn.classList.add('active');
        } else {
          startBtn.classList.remove('active');
        }
      }

      // Update task items
      let activeItem = null;
      taskItems.forEach(item => {
        const target = item.getAttribute('data-target');
        if (target === key) {
          item.classList.add('active');
          activeItem = item;
        } else {
          item.classList.remove('active');
        }
      });

      if (activeItem && needle) {
        // Calculate needle X position relative to .taskbar-tasks
        const itemLeft = activeItem.offsetLeft;
        const itemWidth = activeItem.offsetWidth;
        const needleWidth = needle.offsetWidth || 9;
        const targetX = itemLeft + (itemWidth / 2) - (needleWidth / 2);

        needle.style.transform = `translate3d(${targetX}px, 0, 0)`;
        needle.style.opacity = '1';

        // Auto-center the active task item in the horizontally scrollable mobile topbar
        if (shouldScrollStrip && window.innerWidth <= 768) {
          const containerWidth = tasksContainer.clientWidth;
          const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
          tasksContainer.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth'
          });
        }
      } else if (key === 'hero') {
        if (needle) {
          needle.style.opacity = '0';
        }
        if (shouldScrollStrip && window.innerWidth <= 768) {
          tasksContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }

    // Scrollspy calculation on window scroll
    let ticking = false;
    function updateActiveFromScroll() {
      if (isUserClicking) return;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // At bottom of page -> contact
      if (scrollY + winHeight >= docHeight - 40) {
        setCompassActive('contact');
        return;
      }

      // At top of page -> anik (hero)
      if (scrollY < 100) {
        setCompassActive('hero');
        return;
      }

      // Dynamic focus reference line (where the user's focus naturally rests on mobile)
      const triggerY = winHeight * 0.32;
      let selectedKey = 'about';
      let minDistance = Infinity;

      for (let i = 0; i < cardTargets.length; i++) {
        const item = cardTargets[i];
        const el = item.getEl();
        if (!el || el.classList.contains('is-minimized') || el.style.display === 'none') continue;

        const rect = el.getBoundingClientRect();
        // Check if element intersects the trigger line
        if (rect.top <= triggerY && rect.bottom >= triggerY) {
          selectedKey = item.key;
          break;
        }

        // Distance from trigger line
        const dist = Math.abs(rect.top - triggerY);
        if (dist < minDistance) {
          minDistance = dist;
          selectedKey = item.key;
        }
      }

      setCompassActive(selectedKey);
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveFromScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Handle clicks on taskbar items
    taskItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
          isUserClicking = true;
          setCompassActive(target, true);
          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            isUserClicking = false;
          }, 850);
        }
      });
    });

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        isUserClicking = true;
        setCompassActive('hero', true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          isUserClicking = false;
        }, 850);
      });
    }

    // Initial positioning after DOM layout settles
    setTimeout(() => {
      updateActiveFromScroll();
    }, 200);

    // Also update when window resizes
    window.addEventListener('resize', () => {
      if (currentActiveKey) {
        const key = currentActiveKey;
        currentActiveKey = null; // force re-evaluation of needle position
        setCompassActive(key, true);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 15. Proximity Border Glow with Delayed Trail along Card Perimeters
  // -------------------------------------------------------------------------
  function initCardGlowTrails() {
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;

    const cards = Array.from(document.querySelectorAll('.nt-window'));
    if (!cards.length) return;

    function getCardGlowRGB() {
      const computed = getComputedStyle(document.body).getPropertyValue('--card-glow');
      return computed ? computed.trim() : '255, 255, 255';
    }

    // Card state objects
    const cardDataList = cards.map(card => {
      const glowCanvas = document.createElement('canvas');
      glowCanvas.className = 'card-glow-canvas';
      card.prepend(glowCanvas);

      const gCtx = glowCanvas.getContext('2d');

      return {
        card,
        canvas: glowCanvas,
        ctx: gCtx,
        cWidth: 0,
        cHeight: 0,
        // Proximity & delay points (in local card coordinates)
        targetX: -9999,
        targetY: -9999,
        points: [
          { x: -9999, y: -9999 },
          { x: -9999, y: -9999 },
          { x: -9999, y: -9999 }
        ],
        proximity: 0, // 0 to 1 based on distance to card
        targetProximity: 0,
        currentAlpha: 0,
        active: false
      };
    });

    function resizeAll() {
      cardDataList.forEach(item => {
        const w = item.card.clientWidth || Math.round(item.card.getBoundingClientRect().width);
        const h = item.card.clientHeight || Math.round(item.card.getBoundingClientRect().height);
        if (w > 0 && h > 0) {
          item.cWidth = w;
          item.cHeight = h;
          if (item.canvas.width !== w || item.canvas.height !== h) {
            item.canvas.width = w;
            item.canvas.height = h;
          }
        }
      });
    }

    resizeAll();
    window.addEventListener('resize', resizeAll, { passive: true });

    let mouseX = -9999;
    let mouseY = -9999;
    let isTicking = false;

    // Track mouse globally across viewport so getting closer triggers the border glow
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateLoop);
      }
    }, { passive: true });

    // Distance threshold in pixels outside the card border to start glowing
    const PROXIMITY_THRESHOLD = 250;

    function updateLoop() {
      let anyActive = false;
      const glowRGB = getCardGlowRGB();
      const isLightTheme = document.body.classList.contains('light') || document.body.classList.contains('theme-latte');
      const borderRadius = 10;

      // First pass: detect if the mouse is currently inside any card
      let hoveredItem = null;
      for (let i = 0; i < cardDataList.length; i++) {
        const item = cardDataList[i];
        if (item.card.classList.contains('is-minimized')) continue;
        const rect = item.card.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          hoveredItem = item;
          break;
        }
      }

      cardDataList.forEach(item => {
        const rect = item.card.getBoundingClientRect();

        // Check if card is visible in viewport
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100 || item.card.classList.contains('is-minimized')) {
          item.active = false;
          if (item.currentAlpha > 0.01) {
            item.ctx.clearRect(0, 0, item.cWidth, item.cHeight);
            item.currentAlpha = 0;
          }
          return;
        }

        // Calculate distance from mouse to card rectangle
        const clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
        const clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
        const distX = mouseX - clampedX;
        const distY = mouseY - clampedY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // EXCEPTION: If the mouse is inside a card, ONLY that hovered card can glow.
        // Adjacent/upper/lower cards are suppressed immediately.
        if (hoveredItem) {
          if (item === hoveredItem) {
            item.targetProximity = 1;
            item.targetX = mouseX - rect.left;
            item.targetY = mouseY - rect.top;
            item.active = true;
            anyActive = true;
          } else {
            item.targetProximity = 0;
            if (item.proximity > 0.005) {
              anyActive = true;
            } else {
              item.active = false;
            }
          }
        } else {
          // Mouse is in the gap outside all cards: proximity glow activates on nearby borders
          if (distance <= PROXIMITY_THRESHOLD) {
            item.targetProximity = Math.pow(1 - (distance / PROXIMITY_THRESHOLD), 1.5);
            item.targetX = clampedX - rect.left;
            item.targetY = clampedY - rect.top;
            item.active = true;
            anyActive = true;
          } else {
            item.targetProximity = 0;
            if (item.proximity > 0.005) {
              anyActive = true;
            } else {
              item.active = false;
            }
          }
        }

        // Softly interpolate proximity (faster fade out when leaving)
        const lerpFactor = (item.targetProximity === 0) ? 0.22 : 0.16;
        item.proximity += (item.targetProximity - item.proximity) * lerpFactor;

        // Animate delayed physics points along the perimeter
        if (item.points[0].x === -9999) {
          item.points[0].x = item.targetX;
          item.points[0].y = item.targetY;
          item.points[1].x = item.targetX;
          item.points[1].y = item.targetY;
          item.points[2].x = item.targetX;
          item.points[2].y = item.targetY;
        }

        // Point 0 approaches target
        item.points[0].x += (item.targetX - item.points[0].x) * 0.25;
        item.points[0].y += (item.targetY - item.points[0].y) * 0.25;

        // Points 1 & 2 softly lag behind (delayed fluid trail)
        item.points[1].x += (item.points[0].x - item.points[1].x) * 0.16;
        item.points[1].y += (item.points[0].y - item.points[1].y) * 0.16;
        item.points[2].x += (item.points[1].x - item.points[2].x) * 0.11;
        item.points[2].y += (item.points[1].y - item.points[2].y) * 0.11;

        if (item.proximity > 0.005) {
          renderCardBorder(item, glowRGB, isLightTheme, borderRadius);
        } else if (item.currentAlpha > 0.005) {
          item.ctx.clearRect(0, 0, item.cWidth, item.cHeight);
          item.currentAlpha = 0;
          item.card.classList.remove('has-glow');
        }
      });

      if (anyActive) {
        requestAnimationFrame(updateLoop);
      } else {
        isTicking = false;
      }
    }

    function renderCardBorder(item, glowRGB, isLightTheme, borderRadius) {
      const gCtx = item.ctx;
      const w = item.cWidth;
      const h = item.cHeight;
      if (!w || !h) return;

      gCtx.clearRect(0, 0, w, h);
      item.card.classList.add('has-glow');
      item.currentAlpha = item.proximity;

      // Rounded rectangle path for the border
      function getBorderPath(inset) {
        const r = Math.max(0, borderRadius - inset);
        const x = inset;
        const y = inset;
        const pw = Math.max(0, w - inset * 2);
        const ph = Math.max(0, h - inset * 2);

        const path = new Path2D();
        path.moveTo(x + r, y);
        path.lineTo(x + pw - r, y);
        path.arcTo(x + pw, y, x + pw, y + r, r);
        path.lineTo(x + pw, y + ph - r);
        path.arcTo(x + pw, y + ph, x + pw - r, y + ph, r);
        path.lineTo(x + r, y + ph);
        path.arcTo(x, y + ph, x, y + ph - r, r);
        path.lineTo(x, y + r);
        path.arcTo(x, y, x + r, y, r);
        path.closePath();
        return path;
      }

      gCtx.save();
      gCtx.globalCompositeOperation = isLightTheme ? 'multiply' : 'screen';

      const borderPath = getBorderPath(0.75);

      // 1. Draw delayed tail aura on border (furthest lag point - wide ambient perimeter aura)
      const pTail = item.points[2];
      const tailAlpha = item.proximity * (isLightTheme ? 0.22 : 0.32);
      if (tailAlpha > 0.01) {
        const tailGrad = gCtx.createRadialGradient(pTail.x, pTail.y, 0, pTail.x, pTail.y, 280);
        tailGrad.addColorStop(0, `rgba(${glowRGB}, ${tailAlpha * 0.45})`);
        tailGrad.addColorStop(0.4, `rgba(${glowRGB}, ${tailAlpha * 0.2})`);
        tailGrad.addColorStop(0.7, `rgba(${glowRGB}, ${tailAlpha * 0.06})`);
        tailGrad.addColorStop(1, `rgba(${glowRGB}, 0)`);

        gCtx.lineWidth = 4;
        gCtx.strokeStyle = tailGrad;
        gCtx.stroke(borderPath);
      }

      // 2. Draw delayed mid-point border glow (fluid secondary trail - wide glow)
      const pMid = item.points[1];
      const midAlpha = item.proximity * (isLightTheme ? 0.42 : 0.58);
      if (midAlpha > 0.01) {
        const midGrad = gCtx.createRadialGradient(pMid.x, pMid.y, 0, pMid.x, pMid.y, 210);
        midGrad.addColorStop(0, `rgba(${glowRGB}, ${midAlpha * 0.65})`);
        midGrad.addColorStop(0.35, `rgba(${glowRGB}, ${midAlpha * 0.3})`);
        midGrad.addColorStop(0.7, `rgba(${glowRGB}, ${midAlpha * 0.08})`);
        midGrad.addColorStop(1, `rgba(${glowRGB}, 0)`);

        gCtx.lineWidth = 2.8;
        gCtx.strokeStyle = midGrad;
        gCtx.stroke(borderPath);
      }

      // 3. Draw primary border glow point (increased reach along the edges)
      const pHead = item.points[0];
      const headAlpha = item.proximity * (isLightTheme ? 0.65 : 0.85);
      if (headAlpha > 0.01) {
        const headGrad = gCtx.createRadialGradient(pHead.x, pHead.y, 0, pHead.x, pHead.y, 160);
        headGrad.addColorStop(0, `rgba(${glowRGB}, ${headAlpha})`);
        headGrad.addColorStop(0.25, `rgba(${glowRGB}, ${headAlpha * 0.5})`);
        headGrad.addColorStop(0.6, `rgba(${glowRGB}, ${headAlpha * 0.18})`);
        headGrad.addColorStop(1, `rgba(${glowRGB}, 0)`);

        gCtx.lineWidth = 1.8;
        gCtx.strokeStyle = headGrad;
        gCtx.stroke(borderPath);
      }

      gCtx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // 16. Initialization
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    applyTheme(savedTheme);
    initBootIntro();
    applyGlassStyles();
    initMinecraftCapeHints();
    initMobileCompassScrollspy();
    initCardGlowTrails();
    resizeCanvas();
    animateRain();
    updateTrayClock();
    typeLoop();
  });
})();

