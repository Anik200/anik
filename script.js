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
    lightningMode: 'rare', // 'off', 'rare', 'storm'
    splashesEnabled: false,
    glassBlur: 3,
    glassOpacity: 30
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

  // Lightning & Audio Systems
  let lightningAlpha = 0;
  let nextLightningTime = Date.now() + 8000;
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

    draw(ctx, isLight = false) {
      const currentWind = (weather.windAngle + mouseTiltX);
      const slantX = currentWind * (this.len * 0.32);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + slantX, this.y + this.len);
      const alpha = Math.min(0.9, (this.z / 2.2) * 0.6 + 0.15);
      ctx.strokeStyle = isLight 
        ? `rgba(90, 105, 125, ${alpha * 0.6})` 
        : `rgba(255, 255, 255, ${alpha})`;
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

    draw(ctx, isLight = false) {
      if (this.alpha <= 0) return;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLight 
        ? `rgba(100, 115, 130, ${this.alpha * 0.6})` 
        : `rgba(255, 255, 255, ${this.alpha})`;
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

  function drawCityscape(isLight = false) {
    if (weather.cityVisibility <= 0) return;
    const cityOpacity = (weather.cityVisibility / 100);

    ctx.save();

    // -------------------------------------------------------------------------
    // Gentle & Natural Scroll Parallax (Comfortable speed, no excessive rush)
    // -------------------------------------------------------------------------
    const midShift = ((scrollY * 0.22 + mouseTiltX * 8) % worldWidth + worldWidth) % worldWidth;
    const distantShift = ((scrollY * 0.08 + mouseTiltX * 4) % worldWidth + worldWidth) % worldWidth;

    // Distant layer fill:
    const distantFill = isLight 
      ? `rgba(182, 194, 210, ${cityOpacity * 0.95})` 
      : `rgba(10, 14, 18, ${cityOpacity * 0.95})`;
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
            ctx.fillStyle = `rgba(255, 255, 255, ${cityOpacity * 0.85})`;
            ctx.fillRect(x + b.width / 2 - 2, by - b.spireHeight - 2, 4, 4);
          }
        } else if (b.type === 'antenna') {
          ctx.fillRect(x + b.width / 2 - 1, by - b.spireHeight, 2, b.spireHeight);
          if ((Date.now() + i * 260) % 1400 < 700) {
            ctx.fillStyle = `rgba(255, 60, 60, ${cityOpacity * 0.9})`;
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

        const midFill = isLight 
          ? `rgba(138, 150, 168, ${cityOpacity})` 
          : `rgba(4, 6, 8, ${cityOpacity})`;
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
            ctx.fillStyle = 'rgba(255, 60, 60, 0.95)';
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
            ctx.fillStyle = 'rgba(255, 50, 50, 0.95)';
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
              ctx.fillStyle = 'rgba(255, 60, 60, 0.92)';
              ctx.fillRect(mastX - 1, by - b.spireHeight - 2, 5, 4);
              ctx.fillStyle = midFill;
            }
          } else if (b.roofType === 'smokestacks') {
            // Industrial chimney stacks with red/white hazard bands
            const stackCount = b.smokestacks || 2;
            const spacing = b.width / (stackCount + 1);
            for (let s = 1; s <= stackCount; s++) {
              const sx = x + s * spacing - 4;
              ctx.fillRect(sx, by - 26, 8, 26);
              ctx.fillStyle = `rgba(255, 255, 255, ${cityOpacity * 0.85})`;
              ctx.fillRect(sx, by - 26, 8, 4);
              ctx.fillStyle = `rgba(255, 60, 60, ${cityOpacity * 0.85})`;
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
              ctx.fillStyle = `rgba(255, 255, 255, ${cityOpacity * 0.88})`;
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
            ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
            ctx.fillRect(x + b.width * 0.18 + 2, by - 7, 3, 2);
            ctx.fillRect(x + b.width * 0.82 - 5, by - 7, 3, 2);
            ctx.fillStyle = midFill;
          }

        // Draw Lit Windows with architectural tints
        if (weather.windowLights && b.windows) {
          for (let j = 0; j < b.windows.length; j++) {
            const w = b.windows[j];
            const baseAlpha = w.brightness * cityOpacity;
            if (isLight) {
              if (w.tint === 'warm' || w.tint === 'amber') {
                ctx.fillStyle = `rgba(255, 190, 80, ${baseAlpha * 1.3})`;
              } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha * 1.4})`;
              }
            } else {
              if (w.tint === 'warm') {
                ctx.fillStyle = `rgba(255, 215, 140, ${baseAlpha})`;
              } else if (w.tint === 'cool') {
                ctx.fillStyle = `rgba(215, 240, 255, ${baseAlpha})`;
              } else if (w.tint === 'amber') {
                ctx.fillStyle = `rgba(255, 185, 75, ${baseAlpha})`;
              } else {
                ctx.fillStyle = `rgba(240, 240, 240, ${baseAlpha})`;
              }
            }
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
      const mistAlpha = (weather.mistDensity / 100) * (isLight ? 0.35 : 0.28);
      const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      if (isLight) {
        grad.addColorStop(0, 'rgba(238, 242, 246, 0)');
        grad.addColorStop(0.65, `rgba(225, 233, 244, ${mistAlpha})`);
        grad.addColorStop(1, `rgba(210, 222, 235, ${mistAlpha * 1.4})`);
      } else {
        grad.addColorStop(0, 'rgba(12, 14, 18, 0)');
        grad.addColorStop(0.65, `rgba(20, 24, 30, ${mistAlpha})`);
        grad.addColorStop(1, `rgba(6, 8, 10, ${mistAlpha * 1.5})`);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);
    }

    // 4. Lightning illumination flash
    if (lightningAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${lightningAlpha * 0.35})`;
      ctx.fillRect(0, 0, width, height);
      lightningAlpha -= 0.05;
    }

    ctx.restore();
  }

  function playLightningThunder(alpha) {
    const thunderAudio = document.getElementById('ambient-thunder');
    if (!isRainSoundPlaying || !thunderAudio) return;
    const soundDelay = Math.random() * 250 + 150;
    setTimeout(() => {
      if (!isRainSoundPlaying) return;
      try {
        thunderAudio.currentTime = 0;
        thunderAudio.volume = Math.min(0.85, Math.max(0.35, alpha * 0.75));
        thunderAudio.play().catch(() => {});
      } catch (e) {}
    }, soundDelay);
  }

  function handleLightning() {
    if (weather.lightningMode === 'off') return;
    const now = Date.now();
    if (now > nextLightningTime) {
      lightningAlpha = Math.random() * 0.8 + 0.3;
      const delay = weather.lightningMode === 'storm' 
        ? Math.random() * 3500 + 1500 
        : Math.random() * 12000 + 7000;
      nextLightningTime = now + delay;
      playLightningThunder(lightningAlpha);
    }
  }

  function animateRain() {
    if (!ctx) return;

    const isLight = document.body.classList.contains('light');

    // Smooth tilt interpolation
    mouseTiltX += (targetTiltX - mouseTiltX) * 0.05;

    // Smooth scroll interpolation (revolving momentum lerp)
    const prevScrollY = scrollY;
    scrollY += (targetScrollY - scrollY) * 0.08;
    scrollVel = scrollY - prevScrollY;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Draw revolving city skyline and atmosphere
    drawCityscape(isLight);
    handleLightning();

    // Update and draw raindrops (reacts to wind + scroll velocity)
    for (let i = 0; i < drops.length; i++) {
      drops[i].update(scrollVel);
      drops[i].draw(ctx, isLight);
    }

    // Update and draw splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
      const splash = splashes[i];
      splash.update();
      splash.draw(ctx, isLight);
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
  // 5. Theme Management (Dark Monochrome vs NT Classic Gray)
  // -------------------------------------------------------------------------
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    if (theme === 'light') {
      body.classList.add('light');
      body.classList.remove('dark');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        themeToggleBtn.setAttribute('title', 'Switch to dark mode');
      }
    } else {
      body.classList.add('dark');
      body.classList.remove('light');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        themeToggleBtn.setAttribute('title', 'Switch to light mode');
      }
    }
  }

  function toggleTheme() {
    const isDark = body.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    if (themeToggleBtn) {
      themeToggleBtn.blur();
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

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
        rainSoundBtn.setAttribute('title', 'Mute ambient rain & thunder');

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

        const thunderAudio = document.getElementById('ambient-thunder');
        if (thunderAudio) {
          thunderAudio.pause();
          thunderAudio.currentTime = 0;
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. Windows NT Window Controls (_ / □ / X)
  // -------------------------------------------------------------------------
  window.minimizeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;
    win.classList.toggle('minimized');
  };

  window.toggleMaximizeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;
    win.classList.toggle('maximized');
  };

  window.closeWindow = function (btn) {
    const win = btn.closest('.nt-window');
    if (!win) return;
    win.style.opacity = '0';
    win.style.transform = 'scale(0.95)';
    win.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      win.style.display = 'none';
      showToast(`Window closed.`);
    }, 250);
  };

  // -------------------------------------------------------------------------
  // 7. Dynamic Typewriter (STABLE - No Window Jitter)
  // -------------------------------------------------------------------------
  const phrases = [
    "Anik Biswas",
    "CS Student",
    "Arch Linux / Hyprland",
    "C Programmer",
    "Minimalist"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedHeading = document.getElementById('typed-heading');

  function typeLoop() {
    if (!typedHeading) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      typedHeading.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      typedHeading.textContent = currentPhrase.substring(0, charIndex);
    }

    let typeSpeed = isDeleting ? 38 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(typeLoop, typeSpeed);
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

    animFrame = requestAnimationFrame(updateGlitch);
  }

  // -------------------------------------------------------------------------
  // 14. Initialization
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initBootIntro();
    applyGlassStyles();
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    applyTheme(savedTheme);
    resizeCanvas();
    animateRain();
    updateTrayClock();
    typeLoop();
  });
})();
