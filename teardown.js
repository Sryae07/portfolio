/* ============================================================================
   teardown.js — a laptop built out of code, then taken apart.
   No .glb, no .obj: every part is a box, a cylinder or a canvas texture.
   ========================================================================== */

import * as THREE from 'three';

const ACCENT = 0x14b8a6;

/* --------------------------------------------------------------- dimensions */

const W = 36;          // chassis width
const D = 24;          // chassis depth
const SHELL_H = 1.55;  // lower shell
const DECK_H = 0.35;   // top cover
const TOTAL_H = SHELL_H + DECK_H;
const HINGE_Y = TOTAL_H;
const HINGE_Z = -D / 2;

/* ------------------------------------------------------------------- part db
   dir/distance drive the explode animation; anchor is where the label sits.  */

const PARTS = [
  {
    id: 'lid-shell',
    name: 'Lid shell',
    role: 'A-cover · aluminium',
    desc:
      'The lid is one piece of stamped aluminium with a small plastic insert around the antenna. ' +
      'It carries the panel, the camera module and both antennas, and it is what the hinge bolts into.',
    specs: [
      ['Material', 'Aluminium, anodised, 0.6 mm'],
      ['Weight', '≈ 480 g including the panel'],
      ['Hidden', 'Two Wi-Fi antennas run along the top edge'],
    ],
    color: 0x8fa3ad,
    dir: new THREE.Vector3(0, -1, 0),
    distance: 5.5,
    anchor: new THREE.Vector3(0, 0.2, -6),
    side: 'lid',
  },
  {
    id: 'screen',
    name: 'Display panel',
    role: '16″ IPS-class LCD',
    desc:
      'A bare LCD sandwich: backlight, polariser, liquid crystal layer, colour filter. ' +
      'The ribbon at the bottom edge is the only electrical connection — everything the panel ' +
      'knows arrives through roughly 40 conductors.',
    specs: [
      ['Diagonal', '16 inch, 16:10'],
      ['Resolution', '2560 × 1600 (representative)'],
      ['Refresh', '165 Hz'],
      ['Connection', 'eDP over a single 40-pin ribbon'],
    ],
    color: 0x3f6f8c,
    dir: new THREE.Vector3(0, 1, 0),
    distance: 2.6,
    anchor: new THREE.Vector3(0, 0.1, 4),
    side: 'lid',
  },
  {
    id: 'webcam',
    name: 'Camera module',
    role: 'Sensor + lens + microphone',
    desc:
      'A 3 mm lens on a small PCB, with the microphone sharing the same flex cable. ' +
      'This is the part that gets taped over, and the reason the module sits inside the bezel ' +
      'rather than on the lid surface.',
    specs: [
      ['Sensor', '1/4″ class, 1080p30'],
      ['Field of view', '≈ 78° diagonal'],
      ['Microphone', 'Dual array, same flex'],
    ],
    color: 0x1f2a30,
    dir: new THREE.Vector3(0, 1, 0.2),
    distance: 6.5,
    anchor: new THREE.Vector3(0, 0.35, 1),
    side: 'lid',
  },
  {
    id: 'hinges',
    name: 'Hinges',
    role: 'Two torque barrels',
    desc:
      'Each hinge is a steel barrel with a friction pack inside: enough torque to hold the lid ' +
      'anywhere between closed and 130°, loose enough that one finger can open it. They are also ' +
      'the ground path between the lid and the main board.',
    specs: [
      ['Count', '2, left and right'],
      ['Torque', '≈ 2.2 kgf·cm each'],
      ['Range', '0–130°, 180° on service models'],
    ],
    color: 0x6f7f88,
    dir: new THREE.Vector3(0, 0, -1),
    distance: 7,
    anchor: new THREE.Vector3(0, 0.2, 0),
    side: 'base',
  },
  {
    id: 'deck',
    name: 'Keyboard deck',
    role: 'Top cover · keys · trackpad',
    desc:
      'One pressed sheet holds the keyboard, the trackpad and the power button. Everything you ' +
      'touch is this part; underneath it is a single ribbon that carries every key and the pad to ' +
      'the main board, which is why one loose connector can kill the whole input.',
    specs: [
      ['Keys', '84-key layout, 1.7 mm travel'],
      ['Backlight', 'Per-key, single zone'],
      ['Trackpad', 'Glass surface, 105 × 75 mm'],
      ['Connection', 'One 30-pin ribbon to the board'],
    ],
    color: 0x2a3b45,
    dir: new THREE.Vector3(0, 1, 0),
    distance: 9,
    anchor: new THREE.Vector3(0, 0.2, 3),
    side: 'base',
  },
  {
    id: 'shell',
    name: 'Lower shell',
    role: 'B-cover · bottom plate',
    desc:
      'The tub everything is screwed into. The intake grilles are stamped, not moulded, and the ' +
      'rubber feet are the only thing between the fans and the table. Take this off and the whole ' +
      'machine becomes visible at once.',
    specs: [
      ['Material', 'Aluminium + ABS insert'],
      ['Fasteners', '11 screws, 2 lengths'],
      ['Airflow', 'Two intakes, exhaust through the hinge'],
    ],
    color: 0x1b2730,
    dir: new THREE.Vector3(0, -1, 0),
    distance: 7,
    anchor: new THREE.Vector3(0, -0.4, 5),
    side: 'base',
  },
  {
    id: 'fan-left',
    name: 'Fan, left',
    role: 'Centrifugal blower',
    desc:
      'A blower, not a fan: air comes in from below and leaves sideways through the fins behind it. ' +
      'The left unit cools the GPU side, and it is the one you hear first because its duct is shorter.',
    specs: [
      ['Diameter', '≈ 75 mm'],
      ['Blades', '67, 0.3 mm'],
      ['Speed', '2 200–5 600 rpm'],
      ['Bearing', 'Fluid dynamic'],
    ],
    color: 0x223038,
    dir: new THREE.Vector3(-0.6, 0.55, -0.8),
    distance: 7.5,
    anchor: new THREE.Vector3(0, 0.5, 0),
    side: 'base',
  },
  {
    id: 'fan-right',
    name: 'Fan, right',
    role: 'Centrifugal blower',
    desc:
      'The mirror of the left unit, cooling the CPU side. Both are independently controlled, so ' +
      'one spinning up while the other stays quiet is normal rather than a fault.',
    specs: [
      ['Diameter', '≈ 75 mm'],
      ['Blades', '67, 0.3 mm'],
      ['Speed', '2 200–5 600 rpm'],
      ['Control', 'Separate PWM channel per fan'],
    ],
    color: 0x223038,
    dir: new THREE.Vector3(0.6, 0.55, -0.8),
    distance: 7.5,
    anchor: new THREE.Vector3(0, 0.5, 0),
    side: 'base',
  },
  {
    id: 'cooling',
    name: 'Heat pipes & fin stacks',
    role: 'The actual cooler',
    desc:
      'Four copper pipes pressed flat against the dies, carrying heat to two fin stacks sitting in ' +
      'the exhaust. The pipes are the expensive part: they are sintered inside, and a bend that is ' +
      'slightly too tight silently costs a few degrees.',
    specs: [
      ['Pipes', '4 × 6 mm, sintered copper'],
      ['Fin pitch', '0.25 mm'],
      ['Shared', 'CPU and GPU share one assembly'],
    ],
    color: 0xb87333,
    dir: new THREE.Vector3(0, 0.9, -0.5),
    distance: 9,
    anchor: new THREE.Vector3(0, 0.5, 0),
    side: 'base',
  },
  {
    id: 'board',
    name: 'Main board',
    role: 'Everything else lives here',
    desc:
      'Six layers of copper in a fibreglass sandwich. Power delivery on one end, memory traces to ' +
      'the other, and a surprising number of parts that exist only to stop other parts from ' +
      'interfering with each other.',
    specs: [
      ['Layers', '6, 1.6 mm'],
      ['Power stages', '12 + 2 phases'],
      ['Also on board', 'Wi-Fi, audio codec, USB controller'],
    ],
    color: 0x123f33,
    dir: new THREE.Vector3(0.7, 0.6, 0.35),
    distance: 9,
    anchor: new THREE.Vector3(0, 0.3, 0),
    side: 'base',
  },
  {
    id: 'compute',
    name: 'CPU and GPU dies',
    role: 'The two hot spots',
    desc:
      'Two packages under two cold plates. The GPU die is the larger one on this machine, which ' +
      'is also why the cooling is asymmetric: the left half of the chassis does more work than the ' +
      'right half.',
    specs: [
      ['CPU', '8 cores / 16 threads (representative)'],
      ['GPU', 'Discrete, 8 GB class'],
      ['Interface', 'Soldered — not upgradeable'],
      ['Thermal paste', 'Liquid metal on the CPU die'],
    ],
    color: 0x2f3a42,
    dir: new THREE.Vector3(0.85, 1, 0.15),
    distance: 12.5,
    anchor: new THREE.Vector3(0, 0.6, 0),
    side: 'base',
  },
  {
    id: 'battery',
    name: 'Battery',
    role: 'Four cells in a hard shell',
    desc:
      'The largest single object inside the machine and the one that decides its shape. Cells are ' +
      'pouch type, stacked, with a controller board on the end that refuses to charge a pack that ' +
      'has drifted out of balance.',
    specs: [
      ['Capacity', '90 Wh, 4 cells'],
      ['Voltage', '15.4 V nominal'],
      ['Swelling', 'The usual end-of-life failure'],
      ['Serviceable', 'Yes — screws, not glue'],
    ],
    color: 0x2b333a,
    dir: new THREE.Vector3(0, 0.25, 1),
    distance: 9,
    anchor: new THREE.Vector3(0, 0.2, 0),
    side: 'base',
  },
  {
    id: 'memory',
    name: 'Memory',
    role: 'Two SO-DIMMs',
    desc:
      'Two sockets rather than soldered memory, which is the difference between a machine you can ' +
      'keep and one you cannot. Each stick sits at a slight angle and clips down — the clips break ' +
      'before the socket does.',
    specs: [
      ['Form factor', 'DDR5 SO-DIMM, 262-pin'],
      ['Slots', '2, both accessible'],
      ['Representative', '2 × 16 GB, 5600 MT/s'],
    ],
    color: 0x1d5c4b,
    dir: new THREE.Vector3(0.35, 0.95, 0.9),
    distance: 10.5,
    anchor: new THREE.Vector3(0, 0.2, 0),
    side: 'base',
  },
  {
    id: 'storage',
    name: 'Storage',
    role: 'One M.2 slot, NVMe',
    desc:
      'A single 2280 slot with a thermal pad and a small shield. Under sustained writes this is the ' +
      'third hot spot in the machine, after the two dies, and the first thing to throttle.',
    specs: [
      ['Form factor', 'M.2 2280, PCIe 4.0 ×4'],
      ['Slots', '1'],
      ['Shield', 'Aluminium, thermal pad underneath'],
    ],
    color: 0x39424a,
    dir: new THREE.Vector3(0.55, 0.75, 0.75),
    distance: 11.5,
    anchor: new THREE.Vector3(0, 0.2, 0),
    side: 'base',
  },
];

/* ------------------------------------------------------------------ textures */

function makeKeyboardTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const g = c.getContext('2d');

  g.fillStyle = '#101a21';
  g.fillRect(0, 0, c.width, c.height);

  const cols = 15;
  const rows = 5;
  const pad = 10;
  const gap = 6;
  const cw = (c.width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 86;

  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = pad + col * (cw + gap);
      const y = pad + r * (ch + gap);
      g.fillStyle = '#1c2932';
      g.strokeStyle = '#31434d';
      g.lineWidth = 2;
      roundRect(g, x, y, cw, ch, 7);
      g.fill();
      g.stroke();
    }
  }

  // space bar and the two big keys, drawn over the grid
  g.fillStyle = '#1c2932';
  g.strokeStyle = '#31434d';
  const spaceW = cw * 6 + gap * 5;
  roundRect(g, pad + cw * 4 + gap * 4, pad + 4 * (ch + gap), spaceW, ch, 7);
  g.fill();
  g.stroke();

  // trackpad
  g.fillStyle = '#1a262f';
  g.strokeStyle = '#31434d';
  roundRect(g, c.width / 2 - 150, pad + 5 * (ch + gap) + 14, 300, 118, 10);
  g.fill();
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeScreenTexture() {
  const c = document.createElement('canvas');
  c.width = 1280;
  c.height = 800;
  const g = c.getContext('2d');

  const bg = g.createLinearGradient(0, 0, 1280, 800);
  bg.addColorStop(0, '#0b1a24');
  bg.addColorStop(0.55, '#0d2230');
  bg.addColorStop(1, '#0a2b2b');
  g.fillStyle = bg;
  g.fillRect(0, 0, 1280, 800);

  // a window
  g.fillStyle = 'rgba(9, 18, 24, 0.86)';
  roundRect(g, 150, 150, 980, 500, 14);
  g.fill();
  g.strokeStyle = 'rgba(45, 212, 191, 0.35)';
  g.lineWidth = 2;
  g.stroke();

  // title bar dots
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(182 + i * 26, 182, 7, 0, Math.PI * 2);
    g.fill();
  });

  g.fillStyle = '#b7f5ec';
  g.font = '600 30px ui-monospace, Menlo, monospace';
  g.fillText('parts.map(part => lift(part))', 200, 260);

  g.font = '26px ui-monospace, Menlo, monospace';
  const lines = [
    '→ 14 components, 0 model files',
    '→ geometry: boxes, cylinders, canvas',
    '→ click a part to lift it out',
  ];
  lines.forEach((line, i) => {
    g.fillStyle = i === 0 ? '#7ce8d8' : '#6f8b98';
    g.fillText(line, 200, 320 + i * 44);
  });

  const wave = g.createLinearGradient(200, 500, 1000, 500);
  wave.addColorStop(0, 'rgba(45, 212, 191, 0.5)');
  wave.addColorStop(1, 'rgba(56, 132, 255, 0.1)');
  g.fillStyle = wave;
  g.fillRect(200, 470, 800, 6);

  g.fillStyle = '#4d6570';
  g.font = '22px ui-monospace, Menlo, monospace';
  g.fillText('Web Technologies 2026 · teardown', 200, 610);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ----------------------------------------------------------------- materials */

const MAT = {
  shell: new THREE.MeshStandardMaterial({ color: 0x2e3d47, metalness: 0.72, roughness: 0.42 }),
  deck: new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.55, roughness: 0.5 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101a20, metalness: 0.4, roughness: 0.7 }),
  board: new THREE.MeshStandardMaterial({ color: 0x123f33, metalness: 0.25, roughness: 0.85 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.3 }),
  alu: new THREE.MeshStandardMaterial({ color: 0x8d9aa3, metalness: 0.9, roughness: 0.32 }),
  battery: new THREE.MeshStandardMaterial({ color: 0x2b333a, metalness: 0.35, roughness: 0.75 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x2f3a42, metalness: 0.3, roughness: 0.6 }),
  green: new THREE.MeshStandardMaterial({ color: 0x1d5c4b, metalness: 0.3, roughness: 0.7 }),
  black: new THREE.MeshStandardMaterial({ color: 0x0d1418, metalness: 0.3, roughness: 0.8 }),
};

/* --------------------------------------------------------------------- scene */

const host = document.getElementById('canvas-host');
const labelsEl = document.getElementById('labels');
const stageEl = document.querySelector('.stage');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
} catch (err) {
  stageEl.classList.add('is-broken');
  throw err;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
host.appendChild(renderer.domElement);

const canvas = renderer.domElement;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070b0e, 70, 150);

const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.5, 400);

// orbit state
const orbit = {
  target: new THREE.Vector3(0, 7.4, 0),
  radius: 70,
  theta: -0.62,
  phi: 1.12,
  minRadius: 26,
  maxRadius: 120,
};

function applyOrbit() {
  const sinPhi = Math.sin(orbit.phi);
  camera.position.set(
    orbit.target.x + orbit.radius * sinPhi * Math.sin(orbit.theta),
    orbit.target.y + orbit.radius * Math.cos(orbit.phi),
    orbit.target.z + orbit.radius * sinPhi * Math.cos(orbit.theta),
  );
  camera.lookAt(orbit.target);
}
applyOrbit();

/* --------------------------------------------------------------------- light */

scene.add(new THREE.HemisphereLight(0x9fd7ff, 0x0a0f12, 0.95));

const key = new THREE.DirectionalLight(0xf2fbff, 2.5);
key.position.set(28, 46, 30);
scene.add(key);

const rim = new THREE.DirectionalLight(0x2dd4bf, 1.5);
rim.position.set(-34, 16, -30);
scene.add(rim);

const fill = new THREE.DirectionalLight(0x6ea8ff, 0.85);
fill.position.set(-18, 10, 34);
scene.add(fill);

const under = new THREE.PointLight(0x2dd4bf, 26, 90, 2);
under.position.set(0, -8, 6);
scene.add(under);

/* --------------------------------------------------------------------- floor */

const floorGeo = new THREE.CircleGeometry(120, 64);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x081014, metalness: 0.1, roughness: 0.95 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
scene.add(floor);

const grid = new THREE.GridHelper(160, 40, 0x123039, 0x0d1e26);
grid.position.y = 0.01;
scene.add(grid);

/* --------------------------------------------------------------------- model */

const root = new THREE.Group();
scene.add(root);

const laptop = new THREE.Group();
root.add(laptop);

const baseGroup = new THREE.Group();
laptop.add(baseGroup);

const lidGroup = new THREE.Group();
lidGroup.position.set(0, HINGE_Y, HINGE_Z);
lidGroup.rotation.x = THREE.MathUtils.degToRad(-105);
laptop.add(lidGroup);

/* registration bookkeeping ------------------------------------------------ */

const entries = new Map();          // id -> { def, group, meshes, t, target, home }
const pickTargets = [];             // meshes for the raycaster

function register(def, group, meshes, home, side) {
  group.position.copy(home);
  const entry = {
    def,
    group,
    meshes,
    home: home.clone(),
    side: side || def.side,
    t: 0,
    target: 0,
  };
  meshes.forEach((m) => {
    m.userData.partId = def.id;
    pickTargets.push(m);
  });
  entries.set(def.id, entry);
  return entry;
}

function paintForSelection(entry, on) {
  entry.meshes.forEach((mesh) => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      if (!mat.userData) mat.userData = {};
      if (on) {
        if (mat.userData.baseEmissive === undefined) {
          mat.userData.baseEmissive = mat.emissive.getHex();
          mat.userData.baseIntensity = mat.emissiveIntensity;
        }
        mat.emissive.setHex(ACCENT);
        mat.emissiveIntensity = 0.3;
      } else if (mat.userData.baseEmissive !== undefined) {
        mat.emissive.setHex(mat.userData.baseEmissive);
        mat.emissiveIntensity = mat.userData.baseIntensity;
      }
    });
  });
}

/* ------------------------------------------------------------ build: chassis */

function box(w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

// lower shell
{
  const g = new THREE.Group();
  const meshes = [];

  const tub = box(W, SHELL_H, D, MAT.shell, 0, SHELL_H / 2, 0);
  meshes.push(tub);
  g.add(tub);

  // a shallow inner cavity so the shell reads as a tub, not a brick
  const cavity = box(W - 1.6, SHELL_H * 0.62, D - 1.6, MAT.dark, 0, SHELL_H * 0.62, 0);
  meshes.push(cavity);
  g.add(cavity);

  // rubber feet
  [[-W / 2 + 3, D / 2 - 3], [W / 2 - 3, D / 2 - 3], [-W / 2 + 3, -D / 2 + 5], [W / 2 - 3, -D / 2 + 5]]
    .forEach(([x, z]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.22, 16), MAT.black);
      foot.position.set(x, -0.11, z);
      g.add(foot);
    });

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'shell'), g, meshes, new THREE.Vector3(0, 0, 0));
}

// keyboard deck
{
  const g = new THREE.Group();
  const meshes = [];

  const plate = box(W, DECK_H, D, MAT.deck, 0, SHELL_H + DECK_H / 2, 0);
  meshes.push(plate);
  g.add(plate);

  const tex = makeKeyboardTexture();
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 1.2, D - 1.2),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.25 }),
  );
  top.rotation.x = -Math.PI / 2;
  top.position.set(0, SHELL_H + DECK_H + 0.01, 0);
  meshes.push(top);
  g.add(top);

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'deck'), g, meshes, new THREE.Vector3(0, 0, 0));
}

// hinges
{
  const g = new THREE.Group();
  const meshes = [];
  [-W / 2 + 5, W / 2 - 5].forEach((x) => {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 6.5, 20), MAT.alu);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(x, HINGE_Y + 0.2, HINGE_Z + 0.6);
    meshes.push(barrel);
    g.add(barrel);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.1, 20), MAT.dark);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x + (x > 0 ? 3.4 : -3.4), HINGE_Y + 0.2, HINGE_Z + 0.6);
    meshes.push(cap);
    g.add(cap);
  });
  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'hinges'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* ------------------------------------------------------------- build: cooling */

function buildFan(x, sign) {
  const g = new THREE.Group();
  const meshes = [];

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.15, 40, 1, true), MAT.dark);
  housing.position.y = 0.6;
  meshes.push(housing);
  g.add(housing);

  const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.12, 40), MAT.black);
  basePlate.position.y = 0.06;
  meshes.push(basePlate);
  g.add(basePlate);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.95, 24), MAT.alu);
  hub.position.y = 0.6;
  meshes.push(hub);
  g.add(hub);

  const bladeMat = MAT.alu;
  for (let i = 0; i < 17; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 0.62), bladeMat);
    const a = (i / 17) * Math.PI * 2;
    blade.position.set(Math.cos(a) * 2.6, 0.6, Math.sin(a) * 2.6);
    blade.rotation.y = -a;
    blade.rotation.z = 0.32;
    meshes.push(blade);
    g.add(blade);
  }

  g.position.set(x, 0.2, -D / 2 + 5.4);
  baseGroup.add(g);
  register(PARTS.find((p) => p.id === (sign > 0 ? 'fan-right' : 'fan-left')), g, meshes, g.position.clone());
}

buildFan(-W / 2 + 6.4, -1);
buildFan(W / 2 - 6.4, 1);

// heat pipes + fin stacks
{
  const g = new THREE.Group();
  const meshes = [];

  [-W / 2 + 6.4, W / 2 - 6.4].forEach((x) => {
    const stack = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.95, 1.1), MAT.copper);
    stack.position.set(x, 0.6, -D / 2 + 1.4);
    meshes.push(stack);
    g.add(stack);

    for (let i = 0; i < 6; i += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.0, 0.06), MAT.alu);
      fin.position.set(x, 0.6, -D / 2 + 1.1 + i * 0.16);
      meshes.push(fin);
      g.add(fin);
    }
  });

  // pipes running from the dies to each stack
  const pipeGeo = new THREE.CylinderGeometry(0.26, 0.26, 5.4, 14);
  [[-7.8, 0.1], [-6.3, 0.16], [6.3, 0.16], [7.8, 0.1]].forEach(([x, lift]) => {
    const pipe = new THREE.Mesh(pipeGeo, MAT.copper);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(x, 0.86 + lift, -D / 2 + 3.9);
    meshes.push(pipe);
    g.add(pipe);
  });

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'cooling'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* ------------------------------------------------------------------ build: pcb */

{
  const g = new THREE.Group();
  const meshes = [];

  const board = box(W - 3, 0.16, D - 12.5, MAT.board, 0, 0.5, -D / 2 + 7.4);
  meshes.push(board);
  g.add(board);

  // random-looking components
  const rnd = (n) => (Math.sin(n * 12.9898) * 43758.5453) % 1;
  for (let i = 0; i < 22; i += 1) {
    const w = 0.5 + Math.abs(rnd(i + 1)) * 1.4;
    const d = 0.4 + Math.abs(rnd(i + 7)) * 1.1;
    const chip = box(w, 0.22, d, i % 3 === 0 ? MAT.alu : MAT.chip,
      -W / 2 + 3 + Math.abs(rnd(i + 2)) * (W - 8),
      0.68,
      -D / 2 + 3 + Math.abs(rnd(i + 5)) * 7);
    meshes.push(chip);
    g.add(chip);
  }

  // rear I/O
  const io = box(W - 6, 0.9, 0.8, MAT.alu, 0, 0.9, -D / 2 + 1.1);
  meshes.push(io);
  g.add(io);

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'board'), g, meshes, new THREE.Vector3(0, 0, 0));
}

// dies
{
  const g = new THREE.Group();
  const meshes = [];

  const cpu = box(3.4, 0.3, 3.4, MAT.chip, -5.2, 0.78, -D / 2 + 6.4);
  meshes.push(cpu);
  g.add(cpu);

  const gpu = box(4.4, 0.3, 4.4, MAT.chip, 4.6, 0.78, -D / 2 + 6.4);
  meshes.push(gpu);
  g.add(gpu);

  [cpu, gpu].forEach((die) => {
    const cold = box(die.geometry.parameters.width + 0.5, 0.14, die.geometry.parameters.depth + 0.5,
      MAT.copper, die.position.x, 0.99, die.position.z);
    meshes.push(cold);
    g.add(cold);
  });

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'compute'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* -------------------------------------------------------------- build: battery */

{
  const g = new THREE.Group();
  const meshes = [];

  const body = box(W - 3.4, 0.95, 8.6, MAT.battery, 0, 0.62, D / 2 - 5.4);
  meshes.push(body);
  g.add(body);

  for (let i = 0; i < 3; i += 1) {
    const groove = box(W - 3.4, 1.0, 0.12, MAT.black, 0, 0.62, D / 2 - 8.6 + i * 2.9);
    meshes.push(groove);
    g.add(groove);
  }

  const label = box(6, 0.02, 3, MAT.alu, -W / 2 + 8, 1.12, D / 2 - 5.4);
  meshes.push(label);
  g.add(label);

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'battery'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* --------------------------------------------------------------- build: memory */

{
  const g = new THREE.Group();
  const meshes = [];

  [-1, 1].forEach((s, i) => {
    const stick = box(9.4, 0.34, 2.1, MAT.green, -W / 2 + 9.5 + i * 5.2, 0.95, -D / 2 + 3.4);
    meshes.push(stick);
    g.add(stick);

    for (let k = 0; k < 8; k += 1) {
      const chip = box(0.9, 0.1, 1.6, MAT.chip, -W / 2 + 5.6 + k * 1.05 + i * 5.2, 1.14, -D / 2 + 3.4);
      meshes.push(chip);
      g.add(chip);
    }
  });

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'memory'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* -------------------------------------------------------------- build: storage */

{
  const g = new THREE.Group();
  const meshes = [];

  const ssd = box(7.6, 0.28, 2.3, MAT.green, 7.6, 0.92, D / 2 - 10.6);
  meshes.push(ssd);
  g.add(ssd);

  const shield = box(7.8, 0.12, 2.5, MAT.alu, 7.6, 1.1, D / 2 - 10.6);
  meshes.push(shield);
  g.add(shield);

  const chip = box(1.5, 0.16, 1.3, MAT.chip, 6.4, 1.0, D / 2 - 10.6);
  meshes.push(chip);
  g.add(chip);

  baseGroup.add(g);
  register(PARTS.find((p) => p.id === 'storage'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* ------------------------------------------------------------------ build: lid */

{
  const g = new THREE.Group();
  const meshes = [];

  const shell = box(W, 0.45, D, MAT.shell, 0, -0.22, D / 2);
  meshes.push(shell);
  g.add(shell);

  const bezel = box(W - 1.4, 0.1, D - 1.2, MAT.dark, 0, -0.46, D / 2);
  meshes.push(bezel);
  g.add(bezel);

  lidGroup.add(g);
  register(PARTS.find((p) => p.id === 'lid-shell'), g, meshes, new THREE.Vector3(0, 0, 0));
}

{
  const g = new THREE.Group();
  const meshes = [];

  const tex = makeScreenTexture();
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 2.2, D - 2.2),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.28,
      metalness: 0.05,
    }),
  );
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, -0.53, D / 2);
  meshes.push(panel);
  g.add(panel);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 2.2, D - 2.2),
    new THREE.MeshStandardMaterial({
      color: 0x0a1116,
      transparent: true,
      opacity: 0.18,
      roughness: 0.08,
      metalness: 0.4,
    }),
  );
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, -0.56, D / 2);
  g.add(glass);

  lidGroup.add(g);
  register(PARTS.find((p) => p.id === 'screen'), g, meshes, new THREE.Vector3(0, 0, 0));
}

{
  const g = new THREE.Group();
  const meshes = [];

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 20), MAT.chip);
  housing.position.set(0, -0.52, D - 0.9);
  meshes.push(housing);
  g.add(housing);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20), MAT.black);
  lens.position.set(0, -0.62, D - 0.9);
  meshes.push(lens);
  g.add(lens);

  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.6 }),
  );
  led.rotation.x = Math.PI / 2;
  led.position.set(0.42, -0.6, D - 0.9);
  g.add(led);

  lidGroup.add(g);
  register(PARTS.find((p) => p.id === 'webcam'), g, meshes, new THREE.Vector3(0, 0, 0));
}

/* --------------------------------------------------------------- labels & ui */

const labelNodes = new Map();
PARTS.forEach((def) => {
  const el = document.createElement('span');
  el.className = 'label';
  el.textContent = def.name;
  labelsEl.appendChild(el);
  labelNodes.set(def.id, el);
  def.__anchor = def.anchor ? def.anchor.clone() : new THREE.Vector3();
});

const partsList = document.getElementById('parts-list');
const partsCount = document.getElementById('parts-count');
const detailEl = document.getElementById('detail');
const detailState = document.getElementById('detail-state');

partsCount.textContent = String(PARTS.length);

PARTS.forEach((def) => {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.dataset.part = def.id;
  btn.innerHTML = `<span class="swatch" style="color:#${def.color.toString(16).padStart(6, '0')}"></span>
    <span>${def.name}<span class="part-meta">${def.role}</span></span>`;
  btn.addEventListener('click', () => select(def.id, true));
  btn.addEventListener('mouseenter', () => { hovered = def.id; });
  btn.addEventListener('mouseleave', () => { hovered = null; });
  li.appendChild(btn);
  partsList.appendChild(li);
  def.__button = btn;
});

let selected = null;
let hovered = null;
let exploded = false;
let labelsOn = true;
let spin = true;

function renderDetail(id) {
  if (!id) {
    detailState.textContent = '—';
    detailEl.innerHTML = `<p class="detail-empty">Nothing selected. Click a part in the 3D view — or a
      name in the list — to see what it does and which numbers matter.</p>`;
    return;
  }
  const def = PARTS.find((p) => p.id === id);
  detailState.textContent = def.role.split('·')[0].trim().toUpperCase();
  detailEl.innerHTML = `
    <h3 class="detail-name">${def.name}</h3>
    <p class="detail-role">${def.role}</p>
    <p class="detail-desc">${def.desc}</p>
    <dl class="spec-list">
      ${def.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>
    <p class="detail-empty" style="padding:0.9rem 0 0">Numbers describe a representative
      configuration of this class of machine, not a measurement of one specific unit.</p>
  `;
}

function select(id, fromList) {
  if (selected === id) {
    id = null;
  }
  const prev = selected;
  selected = id;

  if (prev) {
    paintForSelection(entries.get(prev), false);
    PARTS.find((p) => p.id === prev).__button.setAttribute('aria-pressed', 'false');
  }

  if (selected) {
    paintForSelection(entries.get(selected), true);
    PARTS.find((p) => p.id === selected).__button.setAttribute('aria-pressed', 'true');
    if (!fromList) {
      const btn = PARTS.find((p) => p.id === selected).__button;
      btn.scrollIntoView({ block: 'nearest' });
    }
  }

  // when nothing is exploded, selecting pops only that part out
  entries.forEach((entry, key) => {
    if (exploded) {
      entry.target = 1;
    } else {
      entry.target = key === selected ? 1 : 0;
    }
  });

  renderDetail(selected);
}

/* -------------------------------------------------------------------- picking */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = false;
let moved = 0;
let last = { x: 0, y: 0 };
const pointers = new Map();
let pinchStart = 0;

function toPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pick() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickTargets, false);
  return hits.length ? hits[0].object.userData.partId : null;
}

canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  dragging = true;
  moved = 0;
  last = { x: event.clientX, y: event.clientY };
  canvas.classList.add('is-dragging');

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
  }
});

canvas.addEventListener('pointermove', (event) => {
  if (pointers.has(event.pointerId)) {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  if (dragging) {
    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      orbit.radius = THREE.MathUtils.clamp(
        orbit.radius * (pinchStart / Math.max(dist, 1)),
        orbit.minRadius,
        orbit.maxRadius,
      );
      pinchStart = dist;
      applyOrbit();
      return;
    }

    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    moved += Math.abs(dx) + Math.abs(dy);

    orbit.theta -= dx * 0.006;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi - dy * 0.005, 0.22, 1.48);
    applyOrbit();
    return;
  }

  toPointer(event);
  const id = pick();
  hovered = id;
  canvas.classList.toggle('is-over', Boolean(id));
});

function endPointer(event) {
  if (pointers.has(event.pointerId)) pointers.delete(event.pointerId);
  canvas.classList.remove('is-dragging');
  if (pointers.size < 2) pinchStart = 0;
  if (pointers.size === 0) {
    dragging = false;
    if (moved < 6) {
      toPointer(event);
      const id = pick();
      if (id) select(id, false);
      else select(null, false);
    }
  }
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  orbit.radius = THREE.MathUtils.clamp(
    orbit.radius * (1 + Math.sign(event.deltaY) * 0.08),
    orbit.minRadius,
    orbit.maxRadius,
  );
  applyOrbit();
}, { passive: false });

/* -------------------------------------------------------------------- toolbar */

const btnExplode = document.getElementById('btn-explode');
const btnReset = document.getElementById('btn-reset');
const btnLabels = document.getElementById('btn-labels');
const btnSpin = document.getElementById('btn-spin');

function setExploded(on) {
  exploded = on;
  btnExplode.setAttribute('aria-pressed', String(on));
  btnExplode.textContent = on ? 'Collapse' : 'Explode all';
  entries.forEach((entry) => { entry.target = on ? 1 : 0; });
  if (!on && selected) entries.get(selected).target = 1;
}

function resetView() {
  orbit.radius = 70;
  orbit.theta = -0.62;
  orbit.phi = 1.12;
  root.rotation.y = 0;
  applyOrbit();
  setExploded(false);
  select(null, false);
}

btnExplode.addEventListener('click', () => setExploded(!exploded));
btnReset.addEventListener('click', resetView);

btnLabels.addEventListener('click', () => {
  labelsOn = !labelsOn;
  btnLabels.setAttribute('aria-pressed', String(labelsOn));
});

btnSpin.addEventListener('click', () => {
  spin = !spin;
  btnSpin.setAttribute('aria-pressed', String(spin));
});

window.addEventListener('keydown', (event) => {
  const tag = (event.target && event.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (event.key === 'r' || event.key === 'R') resetView();
  if (event.key === 'e' || event.key === 'E') setExploded(!exploded);
  if (event.key === 'Escape') select(null, false);
});

/* -------------------------------------------------------------------- resize */

function onResize() {
  const w = host.clientWidth;
  const h = host.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

if ('ResizeObserver' in window) {
  new ResizeObserver(onResize).observe(host);
} else {
  window.addEventListener('resize', onResize);
}

/* ---------------------------------------------------------------------- loop */

const clock = new THREE.Clock();
const tmpVec = new THREE.Vector3();
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (spin && !dragging) {
    root.rotation.y += dt * 0.12;
  }

  entries.forEach((entry) => {
    if (Math.abs(entry.target - entry.t) > 0.001) {
      entry.t += (entry.target - entry.t) * Math.min(1, dt * 7);
      if (Math.abs(entry.target - entry.t) < 0.002) entry.t = entry.target;

      const k = easeOut(entry.t) * entry.def.distance;
      entry.group.position.copy(entry.home).addScaledVector(entry.def.dir, k);
    }
  });

  renderer.render(scene, camera);

  // labels: everything once the machine is open, otherwise only what you are
  // pointing at or have picked, so the collapsed view stays readable
  const showAll = labelsOn && exploded;
  entries.forEach((entry, id) => {
    const el = labelNodes.get(id);
    const def = entry.def;
    const want = labelsOn && (showAll || hovered === id || selected === id);
    if (!want) {
      el.classList.remove('is-visible');
      return;
    }

    tmpVec.copy(def.__anchor);
    entry.group.localToWorld(tmpVec);
    tmpVec.project(camera);

    if (tmpVec.z > 1) {
      el.classList.remove('is-visible');
      return;
    }

    const rect = host.getBoundingClientRect();
    const x = (tmpVec.x * 0.5 + 0.5) * rect.width;
    const y = (-tmpVec.y * 0.5 + 0.5) * rect.height;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('is-visible');
  });

  requestAnimationFrame(tick);
}

onResize();
renderDetail(null);
tick();

// the labels live inside the canvas host, so they follow it
window.addEventListener('resize', () => {
  const rect = host.getBoundingClientRect();
  labelsEl.style.width = `${rect.width}px`;
  labelsEl.style.height = `${rect.height}px`;
});
