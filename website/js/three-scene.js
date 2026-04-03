/**
 * three-scene.js — Obsidian Global Events
 * 3D Dubai night cityscape with crystal particle system.
 * Scroll-linked camera movement via GSAP ScrollTrigger.
 *
 * ✏️ Customisation tips:
 *   - BUILDING_COLORS   → tint of city windows
 *   - PARTICLE_COUNT    → more/fewer stars
 *   - FOG_DENSITY       → atmospheric haze level
 *   - cameraPath        → adjust the scroll journey
 */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  const CFG = {
    PARTICLE_COUNT : 2200,
    FOG_DENSITY    : 0.006,
    BUILDING_COLORS: [0x162240, 0x1a2850, 0x0e1838],
    WINDOW_COLOR   : 0xc8a858,    // gold windows
    CRYSTAL_COLORS : [0xa8c8e8, 0xc8a8d8, 0xe8e0f4, 0xc8a858],
    AMBIENT_INT    : 0.25,
    BG_COLOR       : 0x0b1120,
  };

  /* ── Scene bootstrap ─────────────────────────────────── */
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let W = window.innerWidth;
  let H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(CFG.BG_COLOR, 1);
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(CFG.BG_COLOR, CFG.FOG_DENSITY);
  scene.background = new THREE.Color(CFG.BG_COLOR);

  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 800);
  camera.position.set(0, 22, 90);
  camera.lookAt(0, 18, 0);

  /* ── Lighting ────────────────────────────────────────── */
  const ambient = new THREE.AmbientLight(0x1a2a4a, CFG.AMBIENT_INT);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0x8090c0, 0.6);
  moonLight.position.set(-30, 60, 40);
  scene.add(moonLight);

  const goldPoint = new THREE.PointLight(0xc8a858, 1.2, 120);
  goldPoint.position.set(0, 30, 20);
  scene.add(goldPoint);

  const bluePoint = new THREE.PointLight(0x4060c0, 0.8, 100);
  bluePoint.position.set(-40, 10, 0);
  scene.add(bluePoint);

  /* ── Skyline helpers ─────────────────────────────────── */
  function makeMat(hex, emissiveHex, emissiveInt = 0.05) {
    return new THREE.MeshPhongMaterial({
      color: hex,
      emissive: emissiveHex,
      emissiveIntensity: emissiveInt,
      shininess: 40,
      flatShading: false,
    });
  }

  function addBuilding(scene, x, z, w, h, d, colorHex) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = makeMat(colorHex, 0x1a2a4a, 0.08);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);

    // Add random glowing windows as small emissive boxes
    const winCount = Math.floor(h / 3);
    for (let i = 0; i < winCount; i++) {
      if (Math.random() > 0.55) continue;
      const wGeo = new THREE.PlaneGeometry(
        Math.random() * 0.8 + 0.3,
        Math.random() * 0.5 + 0.2
      );
      const wMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.7 ? 0xd4c090 : CFG.WINDOW_COLOR,
        transparent: true,
        opacity: Math.random() * 0.6 + 0.3,
      });
      const win = new THREE.Mesh(wGeo, wMat);
      // Place on front face
      win.position.set(
        x + (Math.random() - 0.5) * (w - 1),
        Math.random() * h,
        z + d / 2 + 0.01
      );
      scene.add(win);
    }
    return mesh;
  }

  /* ── Burj Khalifa (iconic tapered spire) ─────────────── */
  function buildBurjKhalifa(scene) {
    const group = new THREE.Group();
    const sections = [
      { w: 8, h: 20, d: 8, y:  0 },
      { w: 6, h: 18, d: 6, y: 20 },
      { w: 4, h: 16, d: 4, y: 38 },
      { w: 2.5, h: 14, d: 2.5, y: 54 },
      { w: 1.5, h: 12, d: 1.5, y: 68 },
      { w: 0.8, h: 20, d: 0.8, y: 80 },  // spire
    ];
    sections.forEach(s => {
      const geo = new THREE.BoxGeometry(s.w, s.h, s.d);
      const mat = makeMat(0x162240, 0x2244aa, 0.12);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, s.y + s.h / 2, 0);
      group.add(mesh);
    });
    // Gold antenna tip
    const tipGeo = new THREE.CylinderGeometry(0.05, 0.3, 12, 6);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xc8a858 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, 106, 0);
    group.add(tip);

    group.position.set(0, 0, -20);
    scene.add(group);
    return group;
  }

  /* ── Burj Al Arab (sail shape approximation) ─────────── */
  function buildBurjAlArab(scene) {
    const group = new THREE.Group();
    // Base column
    const colGeo = new THREE.BoxGeometry(4, 50, 4);
    const colMat = makeMat(0x142038, 0x204080, 0.1);
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(0, 25, 0);
    group.add(col);
    // Sail body (trapezoid approximation using scaled box)
    const sailGeo = new THREE.BoxGeometry(18, 45, 2);
    const sailMat = makeMat(0x1a2c4a, 0x2050a0, 0.15);
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(5, 22, 0);
    group.add(sail);

    group.position.set(-55, 0, -35);
    group.scale.set(0.7, 0.7, 0.7);
    scene.add(group);
    return group;
  }

  /* ── General skyline ─────────────────────────────────── */
  function buildSkyline(scene) {
    const buildings = [
      // Left cluster
      { x: -80, z: -50, w: 12, h: 30, d: 10 },
      { x: -68, z: -45, w:  8, h: 42, d:  8 },
      { x: -58, z: -48, w: 10, h: 25, d: 10 },
      { x: -70, z: -30, w:  6, h: 18, d:  6 },
      { x: -45, z: -40, w:  9, h: 35, d:  9 },
      { x: -38, z: -45, w:  7, h: 22, d:  7 },
      // Left-mid
      { x: -28, z: -35, w: 10, h: 48, d: 10 },
      { x: -20, z: -40, w:  8, h: 32, d:  8 },
      { x: -12, z: -30, w:  6, h: 24, d:  6 },
      // Right of center
      { x:  14, z: -35, w:  9, h: 55, d:  9 },
      { x:  22, z: -42, w: 11, h: 40, d: 10 },
      { x:  30, z: -38, w:  7, h: 30, d:  7 },
      { x:  38, z: -45, w: 10, h: 45, d:  9 },
      { x:  46, z: -40, w:  8, h: 28, d:  8 },
      // Right cluster
      { x:  56, z: -50, w: 12, h: 35, d: 11 },
      { x:  66, z: -44, w:  9, h: 50, d:  9 },
      { x:  76, z: -48, w: 11, h: 38, d: 10 },
      { x:  86, z: -55, w:  7, h: 22, d:  7 },
      // Far background
      { x: -100, z: -80, w: 16, h: 20, d: 14 },
      { x:  100, z: -80, w: 14, h: 24, d: 14 },
      { x:  -20, z: -80, w: 12, h: 18, d: 12 },
      { x:   20, z: -80, w: 10, h: 22, d: 10 },
    ];

    buildings.forEach(b => {
      const colorIdx = Math.floor(Math.random() * CFG.BUILDING_COLORS.length);
      addBuilding(scene, b.x, b.z, b.w, b.h, b.d, CFG.BUILDING_COLORS[colorIdx]);
    });
  }

  /* ── Ground plane ────────────────────────────────────── */
  function buildGround(scene) {
    const geo = new THREE.PlaneGeometry(600, 600);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x090e1a,
      shininess: 60,
      specular: 0x223355,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Reflection glow strip (road lights)
    const stripGeo = new THREE.PlaneGeometry(200, 4);
    const stripMat = new THREE.MeshBasicMaterial({
      color: 0xc8a030,
      transparent: true,
      opacity: 0.15,
    });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.01, 10);
    scene.add(strip);
  }

  /* ── Star particles ──────────────────────────────────── */
  function buildStars(scene) {
    const positions = new Float32Array(CFG.PARTICLE_COUNT * 3);
    const colors    = new Float32Array(CFG.PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(CFG.PARTICLE_COUNT);

    const palette = [
      new THREE.Color(0xe8e4f4),  // pearl
      new THREE.Color(0xa8c8e8),  // ice blue
      new THREE.Color(0xc8a8d8),  // soft violet
      new THREE.Color(0xffffff),  // white
      new THREE.Color(0xf0d090),  // warm gold star
    ];

    for (let i = 0; i < CFG.PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 500;
      positions[i3 + 1] = Math.random() * 200 + 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 400 - 50;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3]     = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      sizes[i] = Math.random() * 1.8 + 0.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return points;
  }

  /* ── Floating crystal shards (brand accent) ───────────── */
  function buildCrystals(scene) {
    const group = new THREE.Group();
    const count = 18;

    for (let i = 0; i < count; i++) {
      const h    = Math.random() * 3 + 1;
      const geo  = new THREE.OctahedronGeometry(h * 0.4, 0);
      const col  = CFG.CRYSTAL_COLORS[Math.floor(Math.random() * CFG.CRYSTAL_COLORS.length)];
      const mat  = new THREE.MeshPhongMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: Math.random() * 0.4 + 0.3,
        shininess: 120,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 120,
        Math.random() * 50 + 5,
        (Math.random() - 0.5) * 80 - 10
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData.floatSpeed  = Math.random() * 0.4 + 0.2;
      mesh.userData.floatOffset = Math.random() * Math.PI * 2;
      mesh.userData.rotSpeed    = (Math.random() - 0.5) * 0.008;
      group.add(mesh);
    }

    scene.add(group);
    return group;
  }

  /* ── Build the world ─────────────────────────────────── */
  buildGround(scene);
  buildSkyline(scene);
  const burj     = buildBurjKhalifa(scene);
  buildBurjAlArab(scene);
  const stars    = buildStars(scene);
  const crystals = buildCrystals(scene);

  /* ── Scroll-linked camera path ───────────────────────── */
  // Camera travels from outside the city → through it
  const cameraPath = {
    start : { x: 0,   y: 22, z: 90,  lx: 0,  ly: 18, lz: 0  },
    mid   : { x: -10, y: 18, z: 40,  lx: 5,  ly: 15, lz: -20 },
    end   : { x: 8,   y: 12, z: -10, lx: 0,  ly: 20, lz: -60 },
  };

  const lookTarget = new THREE.Vector3(0, 18, 0);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '80% bottom',
        scrub: 1.5,
      },
    });

    tl.to(camera.position, {
      x: cameraPath.mid.x,
      y: cameraPath.mid.y,
      z: cameraPath.mid.z,
      ease: 'none',
      onUpdate: () => {
        lookTarget.lerp(
          new THREE.Vector3(cameraPath.mid.lx, cameraPath.mid.ly, cameraPath.mid.lz),
          0.05
        );
        camera.lookAt(lookTarget);
      },
    }, 0);

    tl.to(camera.position, {
      x: cameraPath.end.x,
      y: cameraPath.end.y,
      z: cameraPath.end.z,
      ease: 'none',
      onUpdate: () => {
        lookTarget.lerp(
          new THREE.Vector3(cameraPath.end.lx, cameraPath.end.ly, cameraPath.end.lz),
          0.05
        );
        camera.lookAt(lookTarget);
      },
    }, 1);
  }

  /* ── Animate ─────────────────────────────────────────── */
  let frameId;
  const clock = new THREE.Clock();

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate stars slowly
    if (stars) {
      stars.rotation.y = t * 0.00015;
    }

    // Float crystals
    if (crystals) {
      crystals.children.forEach(mesh => {
        mesh.position.y += Math.sin(t * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.006;
        mesh.rotation.y += mesh.userData.rotSpeed;
        mesh.rotation.x += mesh.userData.rotSpeed * 0.5;
      });
    }

    // Gentle gold point light pulse
    goldPoint.intensity = 1.0 + Math.sin(t * 0.8) * 0.2;

    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ──────────────────────────────────────────── */
  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }
  window.addEventListener('resize', onResize);

  /* ── Cleanup on page hide ────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      animate();
    }
  });

  // Expose for external access if needed
  window.OGEScene = { scene, camera, renderer };

}());
