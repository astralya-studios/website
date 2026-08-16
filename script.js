import * as THREE from 'three';

const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070e);
scene.fog = new THREE.Fog(0x070a15, 15, 42);

const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 3.7, 13.5);
camera.lookAt(0, 4.0, 0);

const clock = new THREE.Clock();
const root = new THREE.Group();
scene.add(root);

const COLORS = {
  wood: 0x4a2a19,
  woodLight: 0x75472a,
  woodDark: 0x21130c,
  brass: 0xc6a25b,
  leaf: 0x203a2b,
  leafLight: 0x3d5d3f,
  water: 0x171c43,
  moon: 0xf2ecd8
};

function standard(color, roughness = .8, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(geometry, material, cast = true, receive = true) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

// Lighting: warm invitation at the threshold, cool light beyond it.
scene.add(new THREE.HemisphereLight(0x7382ad, 0x130b08, 0.72));
const moonLight = new THREE.DirectionalLight(0x9caaff, 1.55);
moonLight.position.set(-7, 12, 5);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 35;
scene.add(moonLight);

const entranceLight = new THREE.PointLight(0xd98a3e, 2.8, 14);
entranceLight.position.set(0, 4.0, 2.3);
scene.add(entranceLight);

const moonGlow = new THREE.PointLight(0x9ea9ff, 1.7, 26);
moonGlow.position.set(7, 9, -12);
scene.add(moonGlow);

// Stars.
const starPositions = new Float32Array(1200 * 3);
for (let i = 0; i < 1200; i++) {
  const r = 26 + Math.random() * 24;
  const a = Math.random() * Math.PI * 2;
  const y = -2 + Math.random() * 22;
  starPositions[i * 3] = Math.cos(a) * r;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = Math.sin(a) * r - 14;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xf5eedb, size: .045, sizeAttenuation: true, transparent: true, opacity: .72 })
);
scene.add(stars);

// Moon.
const moon = mesh(
  new THREE.SphereGeometry(1.05, 48, 48),
  new THREE.MeshStandardMaterial({ color: COLORS.moon, emissive: 0x625c43, emissiveIntensity: .28, roughness: 1 })
);
moon.position.set(7.0, 8.7, -15);
scene.add(moon);

// Water.
const water = mesh(
  new THREE.PlaneGeometry(44, 32, 32, 32),
  new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: .2, metalness: .25, transparent: true, opacity: .88 }),
  false,
  true
);
water.rotation.x = -Math.PI / 2;
water.position.set(0, -1.15, -6);
scene.add(water);

// Bridge.
const bridge = new THREE.Group();
bridge.position.set(0, -.25, -4.4);
root.add(bridge);
const plankMatA = standard(0x49301f, .86);
const plankMatB = standard(0x5d3c25, .86);
const railMat = standard(0x30241d, .92);

for (let i = -6; i <= 6; i++) {
  const plank = mesh(new THREE.BoxGeometry(1.18, .18, 1.05), i % 2 ? plankMatA : plankMatB);
  plank.position.set(i * 1.02, 0, Math.abs(i) * -.48);
  plank.rotation.y = i * .006;
  bridge.add(plank);
}
for (const side of [-1, 1]) {
  for (let i = -5; i <= 5; i++) {
    const post = mesh(new THREE.CylinderGeometry(.065, .09, 1.55, 10), railMat);
    post.position.set(side * 6.0, .72, -2.0 + i * -.54);
    bridge.add(post);
  }
  const rail = mesh(new THREE.CylinderGeometry(.075, .075, 6.2, 10), railMat);
  rail.rotation.x = Math.PI / 2;
  rail.position.set(side * 6.0, 1.48, -4.4);
  bridge.add(rail);
}

// Tree: a real 3D trunk/branch structure with layered organic crowns.
const tree = new THREE.Group();
tree.position.set(0, -1.05, -10.5);
root.add(tree);
const trunkMat = standard(0x3a2317, .94);
const barkMat = standard(0x56341f, .9);

function branchBetween(a, b, radius, material) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const cylinder = mesh(new THREE.CylinderGeometry(radius * .72, radius, direction.length(), 12), material);
  cylinder.position.copy(start).add(end).multiplyScalar(.5);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  tree.add(cylinder);
}

branchBetween([0, -1, 0], [-.35, 2.2, 0], .62, trunkMat);
branchBetween([-.35, 2.2, 0], [-1.35, 4.2, -.1], .42, barkMat);
branchBetween([-.35, 2.2, 0], [1.1, 4.5, -.2], .46, barkMat);
branchBetween([-1.35, 4.2, -.1], [-2.3, 5.7, 0], .28, barkMat);
branchBetween([1.1, 4.5, -.2], [2.2, 6.0, .1], .3, barkMat);
branchBetween([-.35, 2.2, 0], [0, 5.1, .1], .38, trunkMat);

const leafDark = standard(COLORS.leaf, 1);
const leafMid = standard(0x2c4a35, 1);
const leafLight = standard(COLORS.leafLight, 1);

function crown(center, scale) {
  const group = new THREE.Group();
  group.position.set(...center);
  group.scale.setScalar(scale);
  const pieces = [
    [-.9, .0, .1, 1.25, leafDark],
    [.8, .15, .0, 1.35, leafMid],
    [0, .75, -.15, 1.45, leafLight],
    [-.2, -.6, .1, 1.2, leafDark],
    [1.0, -.55, .05, 1.05, leafMid]
  ];
  for (const [x, y, z, s, material] of pieces) {
    const blob = mesh(new THREE.SphereGeometry(1, 24, 18), material);
    blob.position.set(x, y, z);
    blob.scale.set(s * 1.25, s, s * .9);
    group.add(blob);
  }
  tree.add(group);
}

crown([-1.75, 6.0, 0], 1.55);
crown([1.55, 6.3, -.15], 1.7);
crown([0, 7.15, -.1], 1.45);
crown([-.45, 8.15, -.3], 1.0);

// Fireflies.
const fireflies = [];
const flyGeo = new THREE.SphereGeometry(.045, 10, 10);
for (let i = 0; i < 30; i++) {
  const fly = mesh(flyGeo, new THREE.MeshBasicMaterial({ color: 0xe6d18b, transparent: true, opacity: .7 }), false, false);
  fly.position.set((Math.random() - .5) * 15, .2 + Math.random() * 7, -2 - Math.random() * 12);
  fly.userData = { phase: Math.random() * Math.PI * 2, speed: .3 + Math.random() * .45 };
  scene.add(fly);
  fireflies.push(fly);
}

// Door: actual depth, individual boards, inset panels, brass trim and hardware.
const doorPivot = new THREE.Group();
doorPivot.position.set(-2.55, -.65, 1.2);
root.add(doorPivot);
const door = new THREE.Group();
door.position.x = 2.55;
doorPivot.add(door);

const wood = standard(COLORS.wood, .78);
const woodLight = standard(COLORS.woodLight, .7);
const woodDark = standard(COLORS.woodDark, .92);
const brass = standard(COLORS.brass, .28, .72);

const slab = mesh(new THREE.BoxGeometry(5.05, 8.25, .52), wood);
slab.position.y = 4.125;
door.add(slab);

for (let i = -4; i <= 4; i++) {
  const board = mesh(new THREE.BoxGeometry(.56, 8.0, .025), woodLight, false, false);
  board.position.set(i * .55, 4.125, .285);
  door.add(board);
}

for (const x of [-2.72, 2.72]) {
  const post = mesh(new THREE.BoxGeometry(.42, 9.0, .9), woodDark);
  post.position.set(x, 4.42, 0);
  door.add(post);
}
const header = mesh(new THREE.BoxGeometry(5.85, .46, .9), woodDark);
header.position.set(0, 8.72, 0);
door.add(header);

for (const y of [2.0, 6.35]) {
  const panel = mesh(new THREE.BoxGeometry(3.95, 2.7, .16), woodLight);
  panel.position.set(0, y, .32);
  door.add(panel);
  const topTrim = mesh(new THREE.BoxGeometry(4.2, .08, .08), brass, false, false);
  topTrim.position.set(0, y + 1.37, .43);
  const bottomTrim = topTrim.clone();
  bottomTrim.position.y = y - 1.37;
  door.add(topTrim, bottomTrim);
  const leftTrim = mesh(new THREE.BoxGeometry(.08, 2.78, .08), brass, false, false);
  leftTrim.position.set(-2.07, y, .43);
  const rightTrim = leftTrim.clone();
  rightTrim.position.x = 2.07;
  door.add(leftTrim, rightTrim);
}

const cross = mesh(new THREE.BoxGeometry(4.45, .25, .28), woodDark);
cross.position.set(0, 4.18, .42);
door.add(cross);

for (const y of [1.45, 4.25, 7.05]) {
  const hinge = mesh(new THREE.BoxGeometry(.28, .72, .12), brass);
  hinge.position.set(-2.48, y, .5);
  door.add(hinge);
}

const handleBack = mesh(new THREE.CylinderGeometry(.22, .22, .12, 24), brass);
handleBack.rotation.z = Math.PI / 2;
handleBack.position.set(2.05, 4.3, .52);
door.add(handleBack);
const handle = mesh(new THREE.CylinderGeometry(.11, .11, .95, 20), brass);
handle.rotation.z = Math.PI / 2;
handle.position.set(2.45, 4.3, .52);
door.add(handle);
const grip = mesh(new THREE.SphereGeometry(.15, 20, 20), brass);
grip.position.set(2.92, 4.3, .52);
door.add(grip);

const portalLight = new THREE.PointLight(0xffb45b, 0, 15);
portalLight.position.set(0, 4.2, .4);
scene.add(portalLight);

// Interaction and cinematic camera move.
let started = false;
let startTime = 0;
function begin() {
  if (started) return;
  started = true;
  startTime = clock.getElapsedTime();
  document.getElementById('instruction').style.opacity = '0';
  document.getElementById('opening-copy').classList.add('exit');
  document.getElementById('door-hit').classList.add('hidden');
}

document.getElementById('door-hit').addEventListener('click', begin);
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && !started) begin();
});

document.getElementById('chart').addEventListener('click', () => {
  document.getElementById('chart').textContent = 'Your chart awaits';
  document.getElementById('chart').disabled = true;
});

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  stars.rotation.y = t * .0025;
  water.position.y = -1.15 + Math.sin(t * .65) * .012;
  tree.rotation.y = Math.sin(t * .11) * .018;

  fireflies.forEach((fly) => {
    const { phase, speed } = fly.userData;
    fly.position.y += Math.sin(t * speed + phase) * .0012;
    fly.position.x += Math.cos(t * .28 + phase) * .0008;
    fly.material.opacity = .28 + .55 * (0.5 + 0.5 * Math.sin(t * 2 + phase));
  });

  if (started) {
    const p = Math.min((t - startTime) / 6.5, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    doorPivot.rotation.y = -1.52 * ease;
    portalLight.intensity = 5.5 * Math.min(ease * 1.4, 1);
    entranceLight.intensity = 2.8 + ease * 1.8;
    camera.position.x = 0;
    camera.position.y = 3.7 + ease * .25;
    camera.position.z = 13.5 - ease * 8.4;
    camera.lookAt(0, 4.15, -8.5 * ease);
    if (p > .72) document.getElementById('welcome-copy').classList.add('show');
  } else {
    camera.position.x = Math.sin(t * .08) * .08;
    camera.position.y = 3.7 + Math.sin(t * .12) * .025;
    camera.lookAt(0, 4.15, 0);
  }

  renderer.render(scene, camera);
}

animate();
