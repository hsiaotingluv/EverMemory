import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TEAHOUSE, LANTERN_TERRACE, insideTeahouse } from './story.js';

export async function loadRefinements() {
  const gltf = await new GLTFLoader().loadAsync('/models/jiufen-refinements.glb');
  return gltf.scene;
}
// Collapse immutable Blender details by material, retaining movable groups.
function combine(root) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert(), buckets = new Map(), originals=[];
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));
    for (const key of Object.keys(g.attributes)) if (!['position','normal','uv'].includes(key)) g.deleteAttribute(key);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    const nonindexed = g.index ? g.toNonIndexed() : g;
    if (nonindexed!==g) g.dispose();
    if (!buckets.has(o.material)) buckets.set(o.material,[]);
    buckets.get(o.material).push(nonindexed); originals.push(o);
  });
  for(const o of originals)o.removeFromParent();
  for(const [mat, geometries] of buckets){
    const merged = mergeGeometries(geometries); geometries.forEach(g=>g.dispose());
    const m = new THREE.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;root.add(m);
  }
}
export function createFemale(scene, assets) {
  const root=assets.getObjectByName('FemaleTraveller').clone(true);
  root.userData.dynamic=true;scene.add(root);
  const body=root.getObjectByName('TravellerBody'), hair=root.getObjectByName('TravellerHair');
  const skirt=root.getObjectByName('TravellerSkirt');
  const arms=['Arm_L','Arm_R'].map(n=>root.getObjectByName(n));
  const legs=['Leg_L','Leg_R'].map(n=>root.getObjectByName(n));
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  root.rotation.y=Math.PI;
  return {root,animate(time,speed,reduced){
    const stride=speed>0?Math.sin(time*(speed>4?11:8))*.38:0;
    arms.forEach((o,i)=>{if(o)o.rotation.x=stride*(i?-1:1);});
    legs.forEach((o,i)=>{if(o)o.rotation.x=stride*(i?1:-1);});
    if(body)body.position.y=reduced?0:Math.abs(stride)*.04;
    if(hair)hair.rotation.z=reduced?0:stride*.035;
    if(skirt)skirt.rotation.z=reduced?0:stride*.018;
  }};
}
export function addRefinements(scene,assets,teaExterior) {
  const house=assets.getObjectByName('RainlightTeahouse').clone(true);
  const roof=house.getObjectByName('TeahouseRoof');roof.removeFromParent();
  combine(house);combine(roof);house.add(roof);
  house.position.set(TEAHOUSE.x,TEAHOUSE.y,TEAHOUSE.z);scene.add(house);
  const interiorLight=new THREE.PointLight('#ffd497',17,17,2);interiorLight.position.set(-31,12.5,-69);scene.add(interiorLight);
  const tableLamp=new THREE.PointLight('#ffc170',5,7,2);tableLamp.position.set(-27.3,12,-72.5);scene.add(tableLamp);
  const lantern=assets.getObjectByName('KongmingLantern').clone(true);combine(lantern);
  const resting=lantern.clone(true);resting.position.set(27,11.03,-66.55);scene.add(resting);
  const hero=lantern.clone(true);hero.visible=false;scene.add(hero);
  // Hundreds of simplified copies preserve the authored lantern silhouette in
  // three draw calls. No hundreds-of-lights or per-lantern update allocations.
  const count=360, dummy=new THREE.Object3D(), colours=new THREE.Color();
  const paper = new THREE.MeshStandardMaterial({color:'#ffd08a',emissive:'#ff9a3c',emissiveIntensity:1.3,roughness:.8,transparent:true});
  const points=[new THREE.Vector2(.28,0),new THREE.Vector2(.45,.27),new THREE.Vector2(.46,.8),new THREE.Vector2(.36,1.15),new THREE.Vector2(.08,1.3)];
  const bodies=new THREE.InstancedMesh(new THREE.LatheGeometry(points,10),paper,count);
  const glowMat=new THREE.MeshBasicMaterial({color:'#ffe4a6',transparent:true});
  const flames=new THREE.InstancedMesh(new THREE.SphereGeometry(.17,7,5),glowMat,count);
  const haloCanvas=document.createElement('canvas');haloCanvas.width=64;haloCanvas.height=64;
  const context=haloCanvas.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,204,122,.36)');gradient.addColorStop(.25,'rgba(255,172,72,.13)');gradient.addColorStop(1,'rgba(255,132,44,0)');context.fillStyle=gradient;context.fillRect(0,0,64,64);
  const haloMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(haloCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const halos=new THREE.InstancedMesh(new THREE.PlaneGeometry(4.2,4.2),haloMat,count);
  const fleet=[bodies,flames,halos];for(const item of fleet){item.visible=false;item.frustumCulled=false;item.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(item);}
  const seeds=Array.from({length:count},(_,i)=>{
    const random=k=>{const v=Math.sin(i*127.1+k*311.7)*43758.5453;return v-Math.floor(v);};
    colours.setHSL(.055+random(6)*.06,.75,.60+random(7)*.16);bodies.setColorAt(i,colours);
    return {x:-26+random(1)*105,z:-78-random(2)*67,y:14+random(3)*14,s:.65+random(4)*.8,delay:3+random(5)*11,speed:1.5+random(6)*1.6,phase:random(8)*Math.PI*2};
  });
  let releaseAt=null;
  function release(time){releaseAt=time;hero.visible=true;hero.position.set(27,11.03,-66.55);resting.visible=false;for(const f of fleet)f.visible=true;}
  function update(time,player,reduced,camera){
    const indoors=player&&insideTeahouse(player.x,player.z);
    roof.visible=!indoors;teaExterior.visible=!indoors;
    const age=releaseAt===null?-1:time-releaseAt;
    if(age<0)return;
    hero.position.set(27+Math.sin(age*.22)*1.8,11.03+age*1.65,-66.55-age*.9);hero.rotation.z=reduced?0:Math.sin(age*.9)*.055;
    const opacity=1-THREE.MathUtils.smoothstep(age,48,64);paper.opacity=opacity;glowMat.opacity=opacity;haloMat.opacity=opacity;
    for(let i=0;i<count;i++){
      const s=seeds[i],t=age-s.delay,visible=t>0,scale=visible?s.s:0;
      dummy.position.set(s.x+Math.sin(t*.15+s.phase)*(reduced?0:2),s.y+Math.max(0,t)*s.speed,s.z-t*.35);
      dummy.scale.setScalar(scale);dummy.rotation.set(reduced?0:Math.sin(t*.6+s.phase)*.055,s.phase,reduced?0:Math.sin(t*.7+s.phase)*.055);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);
      dummy.position.y+=.1;dummy.updateMatrix();flames.setMatrixAt(i,dummy.matrix);
      dummy.position.y+=.4;dummy.quaternion.copy(camera.quaternion);dummy.updateMatrix();halos.setMatrixAt(i,dummy.matrix);
    }
    for(const f of fleet)f.instanceMatrix.needsUpdate=true;
    if(age>8)resting.visible=true;
    if(age>64){hero.visible=false;for(const f of fleet)f.visible=false;releaseAt=null;}
  }
  // Thin camera bounds keep the outside camera out of the furnished room.
  const colliders=[[-37,-36.8,-74,-64],[-25.2,-25,-74,-64],[-37,-25,-74,-73.8],[-37,-32.45,-64.15,-63.85],[-29.55,-25,-64.15,-63.85]].map(([x1,x2,z1,z2])=>new THREE.Box3(new THREE.Vector3(x1,9.8,z1),new THREE.Vector3(x2,13.2,z2)));
  return {house,roof,resting,colliders,release,update,lanternAge:time=>releaseAt===null?-1:time-releaseAt};
}
