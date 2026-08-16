import * as THREE from 'three';

const canvas=document.getElementById('world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x050713);
scene.fog=new THREE.FogExp2(0x080c1d,.018);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);
camera.position.set(0,3.2,11);camera.lookAt(0,2.8,0);

const hemi=new THREE.HemisphereLight(0x7783b5,0x160d0a,1.05);scene.add(hemi);
const moonLight=new THREE.DirectionalLight(0x9aa8ff,1.8);moonLight.position.set(-5,10,3);moonLight.castShadow=true;scene.add(moonLight);
const warm=new THREE.PointLight(0xe6a85b,3.2,12);warm.position.set(0,4,2);scene.add(warm);

const mat=(color,rough=.7,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
function box(w,h,d,m){const x=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);x.castShadow=true;x.receiveShadow=true;return x}
function cylinder(r1,r2,h,m,seg=12){const x=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m);x.castShadow=true;x.receiveShadow=true;return x}

// Celestial background
const starGeo=new THREE.BufferGeometry();const starCount=1400;const pos=new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){const r=35+Math.random()*25,a=Math.random()*Math.PI*2,b=(Math.random()-.15)*1.25;pos[i*3]=Math.cos(a)*Math.cos(b)*r;pos[i*3+1]=Math.sin(b)*r+5;pos[i*3+2]=Math.sin(a)*Math.cos(b)*r-10}
starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xf1ead8,size:.055,sizeAttenuation:true,transparent:true,opacity:.8}));scene.add(stars);
const moon=new THREE.Mesh(new THREE.SphereGeometry(1.05,32,32),new THREE.MeshStandardMaterial({color:0xf2ead3,emissive:0x514c38,emissiveIntensity:.45,roughness:1}));moon.position.set(7,8,-8);scene.add(moon);
const moonGlow=new THREE.PointLight(0xcbd1ff,2,30);moonGlow.position.copy(moon.position);scene.add(moonGlow);

// Water and far shore
const water=new THREE.Mesh(new THREE.PlaneGeometry(40,24,80,40),new THREE.MeshStandardMaterial({color:0x171d4b,roughness:.18,metalness:.18,transparent:true,opacity:.94}));water.rotation.x=-Math.PI/2;water.position.set(0,-1.15,-2);water.receiveShadow=true;scene.add(water);
const shore=box(22,1.2,7,mat(0x10172a,.95));shore.position.set(0,-.7,-9);scene.add(shore);

// The tree: layered, irregular foliage rather than flat CSS shapes
const tree=new THREE.Group();tree.position.set(0,-1,-4);scene.add(tree);
const trunkMat=mat(0x3b2417,.92);const barkMat=mat(0x5a351d,.9);
const trunk=cylinder(.55,.72,7.5,trunkMat,18);trunk.position.y=2.45;tree.add(trunk);
[[.9,4.5,-.1,-.45],[1.1,5.1,.4,.35],[.85,5.7,-.65,.75],[.7,6.4,.65,-.55]].forEach(([r,y,x,z])=>{const b=cylinder(r*.25,r*.18,3.5,barkMat,12);b.position.set(x,y,z);b.rotation.z=(x>0?-.75:.75);tree.add(b)});
const leafMat=new THREE.MeshStandardMaterial({color:0x294936,roughness:1});const leafLight=new THREE.MeshStandardMaterial({color:0x3d6447,roughness:1});
function crown(x,y,z,s,m){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,2),i%3?leafMat:leafLight);p.position.set((Math.random()-.5)*1.5,(Math.random()-.5)*1.2,(Math.random()-.5)*1.3);p.scale.set(1.2+Math.random()*.5,.9+Math.random()*.5,1.1+Math.random()*.4);p.castShadow=true;g.add(p)}tree.add(g)}
crown(-1.5,7,-.3,1.25);crown(1.45,7.4,-.1,1.35);crown(0,6.3,.2,1.25);crown(-.3,8.2,-.4,.9);

// Bridge leading toward the tree
const bridge=new THREE.Group();bridge.position.set(0,-.35,-1.8);scene.add(bridge);
for(let i=-5;i<=5;i++){const plank=box(1.05,.22,1.15,mat(i%2?0x493120:0x5b3b24,.85));plank.position.set(i*1.05,0,-Math.abs(i)*.55);plank.rotation.z=i*.015;bridge.add(plank)}
const railMat=mat(0x3a2a20,.9);for(const x of [-5.4,5.4]){const rail=box(.16,1.6,1.1,railMat);rail.position.set(x,.75,-2.6);bridge.add(rail);for(let i=0;i<5;i++){const post=box(.12,1.25,.12,railMat);post.position.set(x,i*.001,-.8-i*.55);post.position.z=-.8-i*.55;bridge.add(post)}}
const railTopL=box(.12,.12,7,railMat);railTopL.position.set(-5.4,1.55,-1.8);railTopL.rotation.x=-.18;bridge.add(railTopL);const railTopR=railTopL.clone();railTopR.position.x=5.4;railTopR.rotation.z=Math.PI;bridge.add(railTopR);

// Fireflies
const flies=[];const flyGeo=new THREE.SphereGeometry(.045,8,8);for(let i=0;i<28;i++){const f=new THREE.Mesh(flyGeo,new THREE.MeshBasicMaterial({color:0xe9d27e}));f.position.set((Math.random()-.5)*14,1+Math.random()*6,-2-Math.random()*8);f.userData={phase:Math.random()*Math.PI*2,speed:.25+Math.random()*.45};scene.add(f);flies.push(f)}

// Door with real depth and a hinged pivot
const doorPivot=new THREE.Group();doorPivot.position.set(-3.1,0,1.2);scene.add(doorPivot);
const door=new THREE.Group();door.position.x=3.1;doorPivot.add(door);
const wood=mat(0x4a2b19,.72);const wood2=mat(0x6a3f20,.66);const dark=mat(0x1d120d,.88);const brass=mat(0xc49b52,.3,.65);
const slab=box(6.2,8.8,.48,wood);slab.position.y=4.35;door.add(slab);
const frameL=box(.42,9.5,.85,dark);frameL.position.set(-3.28,4.55,0);door.add(frameL);const frameR=frameL.clone();frameR.position.x=3.28;door.add(frameR);const frameT=box(6.55,.42,.85,dark);frameT.position.set(0,9.08,0);door.add(frameT);
for(const y of [2.0,6.7]){const p=box(4.7,2.9,.18,wood2);p.position.set(0,y,.29);door.add(p);const trim=box(5.05,3.2,.08,brass);trim.position.set(0,y,.41);door.add(trim)}
const cross=box(5.2,.28,.24,dark);cross.position.set(0,4.45,.42);door.add(cross);
const handle=box(.26,1.15,.35,brass);handle.position.set(2.35,4.45,.55);door.add(handle);
for(const y of [1.35,7.55]){const h=cylinder(.18,.18,.18,dark,16);h.rotation.z=Math.PI/2;h.position.set(-3.05,y,-.05);door.add(h)}
// Subtle warm light behind the door
const portalLight=new THREE.PointLight(0xffc878,0,14);portalLight.position.set(0,4,1.1);scene.add(portalLight);

let started=false,startTime=0;const clock=new THREE.Clock();
function begin(){if(started)return;started=true;startTime=clock.getElapsedTime();document.getElementById('instruction').style.opacity='0';document.getElementById('opening-copy').classList.add('exit');document.getElementById('door-hit').classList.add('hidden')}
document.getElementById('door-hit').addEventListener('click',begin);document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!started)begin()});
document.getElementById('chart').addEventListener('click',()=>{document.getElementById('chart').textContent='Coming next';document.getElementById('chart').disabled=true});

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();const dt=clock.getDelta();
  stars.rotation.y=t*.003;water.position.y=-1.15+Math.sin(t*.8)*.018;
  flies.forEach((f,i)=>{f.position.y+=Math.sin(t*f.userData.speed+f.userData.phase)*.0015;f.position.x+=Math.cos(t*.3+f.userData.phase)*.001;f.material.opacity=.45+.45*Math.sin(t*2+f.userData.phase);f.material.transparent=true});
  tree.rotation.y=Math.sin(t*.12)*.025;
  if(started){const p=Math.min((t-startTime)/5.8,1);const ease=1-Math.pow(1-p,3);doorPivot.rotation.y=-1.62*ease;portalLight.intensity=5.5*ease;warm.intensity=3.2+3.5*ease;camera.position.z=11-5.2*ease;camera.position.y=3.2+.2*ease;camera.lookAt(0,3.4,-2.3*ease);
    if(p>.7){document.getElementById('welcome-copy').classList.add('show')}
  }
  renderer.render(scene,camera)
}animate();
