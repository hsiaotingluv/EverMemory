import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { streetHeight, WALKWAYS, MEMORIES, isWalkable } from './story.js';

const TAU = Math.PI * 2;
let seed = 73591;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const range = (a, b) => a + (b - a) * random();
const pick = a => a[Math.floor(random() * a.length)];
const cube = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(1, 12, 8);
const leafGeo = new THREE.IcosahedronGeometry(1, 1);
const mats = new Map();
const colliders = [];
let paintTexture;
function weatheredPaint() {
  if(paintTexture)return paintTexture;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const context=canvas.getContext('2d');context.fillStyle='#f2e4d4';context.fillRect(0,0,256,256);
  for(let i=0;i<4500;i++){
    const alpha=range(.025,.11);context.fillStyle=`rgba(91,55,36,${alpha})`;
    context.fillRect(range(0,256),range(0,256),range(1,8),range(1,4));
  }
  paintTexture=new THREE.CanvasTexture(canvas);paintTexture.wrapS=paintTexture.wrapT=THREE.RepeatWrapping;paintTexture.colorSpace=THREE.SRGBColorSpace;
  return paintTexture;
}
function material(colour, extra = {}) {
  const key = colour + JSON.stringify(extra);
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color: colour, roughness: .94, map:weatheredPaint(), ...extra }));
  return mats.get(key);
}
function mesh(parent, geo, mat, x=0, y=0, z=0, sx=1, sy=1, sz=1) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
const box = (p,x,y,z,w,h,d,m) => mesh(p,cube,m,x,y,z,w,h,d);
const ball = (p,x,y,z,w,h,d,m) => mesh(p,sphere,m,x,y,z,w,h,d);
function pole(p, a, b, radius, mat) {
  const v1 = new THREE.Vector3(...a), v2 = new THREE.Vector3(...b), delta=v2.clone().sub(v1);
  const m=mesh(p,new THREE.CylinderGeometry(radius*.84,radius,delta.length(),7),mat);
  m.position.copy(v1.add(v2).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
}
function curve(p, points, radius, mat, segments=20) {
  return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),segments,radius,5,false),mat);
}
function signTexture(text, background, foreground, vertical=false) {
  const c=document.createElement('canvas');c.width=vertical?256:768;c.height=vertical?768:256;
  const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle=foreground;ctx.lineWidth=3;ctx.strokeRect(15,15,c.width-30,c.height-30);
  ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';
  if(vertical){ctx.font='108px serif';[...text].forEach((t,i)=>ctx.fillText(t,128,95+i*(580/Math.max(text.length-1,1))));}
  else{ctx.font=`${Math.min(120,570/text.length)}px serif`;ctx.fillText(text,384,125);}
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function sign(p,text,x,y,z,w,h,background='#634d35',foreground='#ead5a3',vertical=false) {
  box(p,x,y,z,w+.15,h+.15,.12,material('#423a2c'));
  return mesh(p,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:signTexture(text,background,foreground,vertical),roughness:1}),x,y,z+.07);
}
const wood=material('#653a2b'), trim=material('#c18a45'), roofmat=material('#51474a'), roofedge=material('#8a6b58');
const shutterMat=material('#973d32');
const lanternMat=material('#d83c21',{emissive:'#f35a1c',emissiveIntensity:.23});
const windowMat=material('#efb762',{emissive:'#ffc06a',emissiveIntensity:.45});
const leaves=[];
function foliage(x,y,z,s,colour,parent,fullness=55) {
  for(let i=0;i<fullness;i++){
    const a=range(0,TAU),b=range(-1,1),r=Math.cbrt(random())*s;
    leaves.push({x:x+Math.cos(a)*Math.sqrt(1-b*b)*r,y:y+b*r*.66,z:z+Math.sin(a)*Math.sqrt(1-b*b)*r,s:range(.22,.55)*s,c:colour,parent});
  }
}
function tree(parent,x,y,z,s=1,flower=false) {
  const bark=material('#6b6041');
  pole(parent,[x,y,z],[x+.3*s,y+4.4*s,z],.23*s,bark);
  for(let j=0;j<5;j++){
    const a=j*TAU/5, bx=x+Math.cos(a)*1.8*s,bz=z+Math.sin(a)*1.8*s,by=y+range(3.8,5.1)*s;
    pole(parent,[x+.2*s,y+2.5*s,z],[bx,by,bz],.12*s,bark);
    foliage(bx,by+.2*s,bz,1.65*s,flower?pick(['#d29b87','#e7b296','#efc4a5']):pick(['#53734b','#65834f','#748e53','#869957']),parent,43);
  }
}
function lantern(parent,x,y,z,s=1) {
  pole(parent,[x,y+.3*s,z],[x,y+.9*s,z],.02,wood);
  ball(parent,x,y,z,.34*s,.40*s,.34*s,lanternMat);
  for(let i=0;i<10;i++){
    const a=i*TAU/10;curve(parent,[[x+.15*s*Math.cos(a),y+.34*s,z+.15*s*Math.sin(a)],[x+.337*s*Math.cos(a),y,z+.337*s*Math.sin(a)],[x+.15*s*Math.cos(a),y-.34*s,z+.15*s*Math.sin(a)]],.009*s,material('#e89950'),8);
  }
  mesh(parent,new THREE.CylinderGeometry(.15*s,.15*s,.08*s,10),trim,x,y+.37*s,z);
  mesh(parent,new THREE.CylinderGeometry(.14*s,.14*s,.08*s,10),trim,x,y-.38*s,z);
  pole(parent,[x,y-.4*s,z],[x,y-.72*s,z],.023*s,trim);
}
function roof(parent,w,d,y,colour=roofmat,rise=1.55) {
  const nx=16,nz=12,vertices=[],indices=[];
  const height=(x,z)=>y+rise*(1-Math.abs(z)/(d/2))+.24*Math.pow(Math.abs(x)/(w/2),8)+.27*Math.pow(Math.abs(z)/(d/2),8);
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const x=(i/nx-.5)*w,z=(j/nz-.5)*d;vertices.push(x,height(x,z),z);
    if(i<nx&&j<nz){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
  mesh(parent,g,colour);
  for(let x=-w/2;x<=w/2;x+=.35){
    for(const side of [-1,1]){const pts=[];for(let j=0;j<=6;j++){const z=side*d/2*j/6;pts.push([x,height(x,z)+.025,z]);}curve(parent,pts,.045,roofedge,8);}
  }
  for(const z of [-d/2,d/2]){const pts=[];for(let i=0;i<=10;i++){const x=(i/10-.5)*w;pts.push([x,height(x,z),z]);}curve(parent,pts,.085,roofedge);}
  pole(parent,[-w*.47,y+rise+.12,0],[w*.47,y+rise+.12,0],.12,roofedge);
}
function flowerpot(p,x,y,z,s=1) {
  mesh(p,new THREE.CylinderGeometry(.3*s,.21*s,.5*s,10),material('#ae7457'),x,y+.25*s,z);
  foliage(x,y+.65*s,z,.55*s,pick(['#8c9e57','#4d8057','#9a9c57']),p,13);
}
function house(parent,{x,z,w=8,d=6,floors=2,colour='#c98759',rot=0,name='',base,lanterns=true}) {
  const p=new THREE.Group();parent.add(p);p.position.set(x,base??streetHeight(z),z);p.rotation.y=rot;
  const wall=material(colour), siding=material(new THREE.Color(colour).multiplyScalar(.68).getHex());const floorH=3.05;
  const sideways=Math.abs(Math.sin(rot))>.5,wx=sideways?d:w,dz=sideways?w:d,ground=base??streetHeight(z);
  colliders.push(new THREE.Box3(new THREE.Vector3(x-wx/2-.25,ground,z-dz/2-.25),new THREE.Vector3(x+wx/2+.25,ground+floors*floorH+1,z+dz/2+.25)));
  box(p,0,-1.8,0,w,3.6,d,material('#9b8270'));
  for(let f=0;f<floors;f++){
    const by=f*floorH;box(p,0,by+1.48,0,w,2.95,d,wall);
    for(let yy=.3;yy<2.9;yy+=.3)box(p,0,by+yy,d/2+.015,w,.035,.04,siding);
    for(const xx of [-w/2+.13,w/2-.13])box(p,xx,by+1.5,d/2+.08,.2,3.1,.2,wood);
    for(let xx=-w/2+1;xx<w/2-.4;xx+=1.65){
      box(p,xx,by+1.53,d/2+.06,1.32,1.74,.1,wood);
      box(p,xx,by+1.53,d/2+.13,1.11,1.52,.06,windowMat);
      for(let j=-1;j<=1;j++)box(p,xx+j*.37,by+1.53,d/2+.19,.055,1.59,.055,trim);
      for(let j=-1;j<=1;j++)box(p,xx,by+1.53+j*.5,d/2+.19,1.16,.055,.055,trim);
      const shutter=box(p,xx-.82,by+1.53,d/2+.28,.28,1.75,.1,shutterMat);shutter.rotation.y=-.5;
    }
    box(p,0,by+.35,d/2+.11,w,.18,.2,wood);box(p,0,by+2.64,d/2+.13,w,.2,.2,wood);
    // Side elevation matters when walking around a house.
    for(const side of [-1,1])for(let zz=-d/2+1;zz<d/2;zz+=2){
      box(p,side*(w/2+.03),by+1.55,zz,.08,1.35,1.1,trim);box(p,side*(w/2+.08),by+1.55,zz,.035,1.13,.91,windowMat);
      box(p,side*(w/2+.10),by+1.55,zz,.06,1.15,.06,wood);
    }
    if(f>0){
      box(p,0,by-.12,d/2+.7,w+.55,.2,1.7,wood);
      box(p,0,by+.69,d/2+1.4,w+.55,.13,.13,wood);
      for(let xx=-w/2;xx<=w/2;xx+=.45)box(p,xx,by+.3,d/2+1.4,.065,.75,.065,trim);
      for(let xx=-w/2+.6;xx<w/2;xx+=2.3){box(p,xx,by+.05,d/2+1.25,1.1,.37,.4,wood);foliage(xx,by+.18,d/2+1.25,.65,'#64804b',p,13);}
    }
    if(f<floors-1){const aw=new THREE.Group();p.add(aw);aw.position.z=d/2+.55;roof(aw,w+.7,1.65,by+2.9,roofmat,.2);}
    if(lanterns)for(let xx=-w/2+.65;xx<w/2;xx+=1.6)lantern(p,xx,by+2.50,d/2+.68,.7);
  }
  roof(p,w+1.4,d+1.45,floors*floorH-.1);
  if(name)sign(p,name,0,2.74,d/2+.9,Math.min(w*.7,4.2),.67);
  return p;
}
function rail(parent,a,b) {
  const dist=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.ceil(dist/1.8);
  for(let i=0;i<=n;i++){const f=i/n;const x=THREE.MathUtils.lerp(a[0],b[0],f),z=THREE.MathUtils.lerp(a[2],b[2],f),y=THREE.MathUtils.lerp(a[1],b[1],f);box(parent,x,y+.55,z,.13,1.1,.13,wood);}
  for(const h of [.42,1])pole(parent,[a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.055,wood);
}
function bench(p,x,y,z,rotation=0) {
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;p.add(g);
  box(g,0,.53,0,2.2,.15,.65,trim);for(const xx of [-.8,.8]){box(g,xx,.25,0,.12,.6,.5,wood);box(g,xx,.9,-.28,.1,.8,.1,wood);}box(g,0,1,-.28,2.2,.2,.1,trim);
}
function batchStatic(root) {
  root.updateMatrixWorld(true);const buckets=new Map(),remove=[];
  root.traverse(o=>{
    if(!o.isMesh || o.isInstancedMesh || Array.isArray(o.material))return;
    for(let p=o;p;p=p.parent)if(p.userData.dynamic)return;
    // Keep texture coordinates when batching; custom roofs get planar UVs.
    if(!o.geometry.attributes.uv){
      const uv=[];const positions=o.geometry.attributes.position;
      for(let i=0;i<positions.count;i++)uv.push(positions.getX(i)*.3,positions.getZ(i)*.3);
      o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    }
    const key=o.material.uuid;
    if(!buckets.has(key))buckets.set(key,{mat:o.material,geos:[]});
    const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);buckets.get(key).geos.push(g);remove.push(o);
  });
  for(const o of remove)o.removeFromParent();
  for(const {mat,geos} of buckets.values()){
    const merged=mergeGeometries(geos,false);if(!merged)continue;
    const m=new THREE.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;root.add(m);geos.forEach(g=>g.dispose());
  }
}

export function createWorld(container) {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#edc298');scene.fog=new THREE.FogExp2('#e8bf91',.0085);
  const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,650);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  container.appendChild(renderer.domElement);
  const hemi=new THREE.HemisphereLight('#ffe0bd','#b0714e',2.0);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#ffcd86',3.1);sun.position.set(-45,65,18);sun.target.position.set(0,0,-17);scene.add(sun,sun.target);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-60,right:60,top:64,bottom:-64,near:1,far:170});sun.shadow.normalBias=.09;sun.shadow.bias=-.00015;
  const fill=new THREE.DirectionalLight('#efd1bb',.45);fill.position.set(30,20,-45);scene.add(fill);

  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#dca694')},bottom:{value:new THREE.Color('#ffcf87')}},vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vWorld;uniform vec3 top;uniform vec3 bottom;void main(){float h=normalize(vWorld).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.05,.7,h)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(500,24,12),skyMat);scene.add(sky);
  const sunDisc=mesh(scene,new THREE.SphereGeometry(9,24,16),new THREE.MeshBasicMaterial({color:'#fff1be'}),-140,64,-190);sunDisc.castShadow=false;
  const scenery=new THREE.Group();scene.add(scenery);
  const seaMat=new THREE.MeshStandardMaterial({color:'#719ba7',roughness:.53,metalness:.08});
  box(scenery,-130,-14,-90,450,.4,430,seaMat);
  for(let i=0;i<80;i++)box(scenery,range(-220,-35),-13.75,range(-200,80),range(2,13),.018,.12,material('#e0cbb4'));
  // Uneven ridgelines instead of regular cone mountains.
  function mountain(x,z,w,h,d,colour,phase){
    const geo=new THREE.PlaneGeometry(w,d,36,26);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){const px=pos.getX(i),pz=pos.getZ(i),edge=Math.max(0,1-(px*px/(w*w*.25)+pz*pz/(d*d*.25)));const wave=1+.13*Math.sin(px*.1+phase)+.09*Math.cos(pz*.14+px*.05)+.035*Math.sin(px*.8+pz*.4);pos.setY(i,Math.pow(edge,.85)*h*wave-18);}
    geo.computeVertexNormals();const m=mesh(scenery,geo,material(colour),x,0,z);m.castShadow=false;
  }
  mountain(-120,-230,350,76,180,'#a3b8a2',.2);mountain(10,-165,250,63,160,'#8eac92',1.4);mountain(90,-108,150,54,160,'#6d9677',2.4);mountain(-62,-135,160,43,110,'#84a58a',4);
  const cloudMat=material('#fff0d3');
  for(let k=0;k<13;k++){const x=range(-180,160),y=range(65,95),z=range(-220,-125);for(let j=0;j<6;j++){const c=ball(scenery,x+j*6,y+range(-2,2),z+range(-3,3),range(6,12),range(2,4),range(3,5),cloudMat);c.castShadow=false;}}
  const town=new THREE.Group();scene.add(town);
  const terrainGeo=new THREE.PlaneGeometry(114,135,58,68);terrainGeo.rotateX(-Math.PI/2);const pos=terrainGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i)-20;const outside=Math.max(0,Math.abs(x)-22);pos.setXYZ(i,x,streetHeight(z)-.65-outside*.8+Math.sin(x*.2)*Math.cos(z*.23)*.23,z);}
  terrainGeo.computeVertexNormals();mesh(town,terrainGeo,material('#818764'));

  // Entire walkable footprint has a matching visible stone surface.
  const stones=['#b39a7e','#c0a185','#c9b095','#b29e8b','#a89786','#c6aa8d'].map(c=>material(c));
  for(let z=-51;z<=26;z+=.7)for(let x=-22;x<=23;x+=1.2){
      if(!WALKWAYS.some(path=>x>=path.x1&&x<=path.x2&&z>=path.z1&&z<=path.z2))continue;
      const sy=streetHeight(z);const b=box(town,x,sy-.12,z,1.16,.28,.665,pick(stones));b.rotation.y=range(-.012,.012);
  }
  for(const [z1,z2] of [[12,2],[-6,-20],[-30,-42]]){
    for(let z=z1;z>z2;z-=.7)box(town,0,streetHeight(z)-.11,z,9.2,.26,.16,material('#cbc0a4'));
    for(const side of [-1,1])rail(town,[side*4.45,streetHeight(z1),z1],[side*4.45,streetHeight(z2),z2]);
  }
  for(const [z,x1,x2] of [[26,-9,9],[1.5,-19,-5],[-5.5,-19,-5],[-29.5,-22,-5],[-20.5,-22,-5],[-50,-21,-5],[-42.5,-21,-5]]){
    box(town,(x1+x2)/2,streetHeight(z)-2,z,x2-x1,4,.45,material('#777966'));rail(town,[x1,streetHeight(z),z],[x2,streetHeight(z),z]);
  }
  // Tea houses pack the uphill spine, leaving connected side lanes between them.
  house(town,{x:9.8,z:-12.7,w:12,d:7,floors:3,colour:'#b94832',rot:-Math.PI/2,name:'阿妹茶樓',base:2.2});
  house(town,{x:-9,z:-12.9,w:11.5,d:6.5,floors:2,colour:'#cd9545',rot:Math.PI/2,name:'九份茶坊',base:2.2});
  house(town,{x:8.5,z:7,w:7.3,d:6,floors:2,colour:'#dea573',rot:-Math.PI/2,name:'山城小食',base:0});
  house(town,{x:-8.3,z:6.8,w:8,d:6.2,floors:2,colour:'#c76648',rot:Math.PI/2,name:'阿嬤芋圓',base:0});
  house(town,{x:10,z:-35.8,w:10,d:7,floors:3,colour:'#dc8658',rot:-Math.PI/2,name:'山海茶堂',base:5.8});
  house(town,{x:-9,z:-35.7,w:10.2,d:6.5,floors:2,colour:'#e0bd8b',rot:Math.PI/2,name:'山城故事',base:5.8});
  house(town,{x:1,z:-55.5,w:12,d:7,floors:3,colour:'#aa4938',name:'九份',base:9.8});
  house(town,{x:15.4,z:-31.5,w:7,d:4,floors:1,colour:'#b85b4e',name:'昇平戲院',base:5.8});
  house(town,{x:-27,z:-29,w:7,d:6,floors:2,colour:'#d4a66a',rot:Math.PI/2,base:4.2});
  for(let i=0;i<13;i++){
    const x= i%2 ? range(27,42) : range(-44,-30), z=range(-59,18);
    house(town,{x,z,w:range(5,8),d:range(4,6),floors:pick([1,2,3]),colour:pick(['#d9b887','#c78055','#c39551','#ba6250','#78959a']),base:streetHeight(z)-Math.max(0,Math.abs(x)-22)*.72,lanterns:false});
  }
  // Opening gate uses a street sign and ordinary timber posts, not a torii.
  for(const x of [-5.1,5.1])box(town,x,2.3,15.5,.24,4.6,.24,wood);
  pole(town,[-5.1,4.5,15.5],[5.1,4.5,15.5],.11,wood);sign(town,'九份老街',0,4.48,15.55,2.3,.8,'#8f3e32','#ffe2a7');
  for(const z of [15,-2,-23,-45]){
    const y=streetHeight(z)+4.1;curve(town,[[-7,y+.9,z],[0,y-.3,z+.35],[7,y+.9,z]],.022,wood,24);
    for(let i=-3;i<=3;i++)lantern(town,i*1.7,y-.4+.9*(i*i/16),z+.25,.8);
  }
  for(const z of [12,-6,-30])for(const x of [-4.95,4.95]){
    const y=streetHeight(z);box(town,x,y+1.7,z,.13,3.4,.13,wood);pole(town,[x,y+3.35,z],[x-Math.sign(x)*.8,y+3.35,z],.065,wood);lantern(town,x-Math.sign(x)*.7,y+2.5,z,.85);
  }
  // Overhead utility cables are part of Jiufen's dense silhouette.
  for(const x of [-13.2,15.4]){
    for(const z of [17,-19,-48]){const y=streetHeight(z);pole(town,[x,y,z],[x,y+9,z],.11,material('#6c7162'));pole(town,[x-.7,y+8.7,z],[x+.7,y+8.7,z],.07,wood);}
    for(let l=0;l<3;l++)curve(town,[[x+l*.25,9,17],[x+l*.25,9.5,-2],[x+l*.25,14.8,-19],[x+l*.25,16,-33],[x+l*.25,18.8,-48]],.015,material('#55594b'),42);
  }
  // Taro cart on the first terrace.
  const cart=new THREE.Group();town.add(cart);cart.position.set(-5,2.2,-2);
  box(cart,-.5,.65,0,1.4,1.3,2.5,material('#947851'));box(cart,-.5,1.38,0,1.8,.16,2.8,trim);
  for(const z of [-1.25,1.25])pole(cart,[-1.2,0,z],[-1.2,2.65,z],.05,wood);
  const awning=box(cart,-.5,2.57,0,2.25,.08,3,material('#a78387'));awning.rotation.z=-.1;
  sign(cart,'芋圓',-.5,1.02,1.3,1,.47,'#76545f','#fff0cd');
  for(const z of [-.8,0,.8]){mesh(cart,new THREE.SphereGeometry(.34,16,10,0,TAU,0,Math.PI/2),material('#ecdec0'),-.5,1.55,z,1,.6,1).rotation.x=Math.PI;for(let j=0;j<6;j++)ball(cart,-.5+range(-.18,.18),1.56,z+range(-.18,.18),.08,.065,.08,material(pick(['#b495bb','#ebc873','#e4d2ab'])));}
  bench(town,-5.9,0,22,Math.PI/2);pole(town,[-5.7,0,18.2],[-5.7,3.2,18.2],.055,wood);sign(town,'九份',-5.7,2.9,18.25,1,.6,'#73836c','#f6e7c5');
  box(town,-4.1,.9,20,.7,.04,.45,material('#e6c995')).rotation.y=.2;
  mesh(town,new THREE.CylinderGeometry(.72,.65,.13,16),wood,4.25,6.56,-25);pole(town,[4.25,5.8,-25],[4.25,6.5,-25],.1,wood);
  mesh(town,new THREE.CylinderGeometry(.18,.13,.22,14),material('#659696'),4,6.73,-25);mesh(town,new THREE.TorusGeometry(.12,.035,6,12),material('#659696'),4.2,6.72,-25);
  sign(town,'昨日的故事',15,7.5,-28.8,2,2.5,'#be8c6a','#eed6a1');
  bench(town,-17.2,5.8,-27);bench(town,-14,9.8,-49);
  tree(town,-18,5.8,-27,1.3);tree(town,-19.6,9.8,-48,1.15);
  // Small original placeholder cat with a curled tail.
  const cat=new THREE.Group();cat.position.set(-16,5.82,-24);cat.rotation.y=.7;cat.userData.dynamic=true;town.add(cat);
  const ginger=material('#ba8b55');ball(cat,0,.35,0,.26,.32,.45,ginger);ball(cat,0,.64,.31,.23,.22,.22,ginger);
  for(const x of [-.15,.15]){mesh(cat,new THREE.ConeGeometry(.095,.18,4),ginger,x,.86,.29);ball(cat,x*.65,.69,.5,.025,.037,.015,material('#334c33'));}
  curve(cat,[[.12,.26,-.28],[.5,.28,-.5],[.55,.55,-.38],[.4,.63,-.26]],.055,ginger,16);
  for(let i=0;i<3;i++)mesh(town,new THREE.CylinderGeometry(.18,.14,.1,12),material('#b4c1a0'),-16.7+i*.45,5.85,-25.5);
  pole(town,[-15,9.8,-46],[-15,13.5,-46],.085,wood);lantern(town,-15,12.5,-46,1.2);

  // Courtyard trees, roadside shrubs and trailing balcony foliage.
  for(const [x,z,s] of [[-13,20,1.1],[14,21,1.3],[-18,4,1],[23,5,1.2],[26,-16,1.5],[-24,-12,1.2],[25,-42,1.45],[-27,-48,1.4],[13,-51,1.2],[32,-57,2]])tree(town,x,streetHeight(z)-.5,z,s);
  tree(town,17,streetHeight(15),15,1.45,true);
  for(let i=0;i<70;i++){const x=range(-45,44),z=range(-67,29);if(isWalkable(x,z, -.7)||Math.abs(x)<15)continue;tree(town,x,streetHeight(z)-.7-Math.max(0,Math.abs(x)-22)*.75,z,range(.65,1.25));}
  for(let i=0;i<90;i++){const x=pick([-1,1])*range(4.9,5.8),z=range(-50,25);if([-2,-24,-46].some(p=>Math.abs(p-z)<5))continue;foliage(x,streetHeight(z)+.2,z,range(.35,.65),pick(['#738b4e','#8e9d55','#507c48']),town,12);}
  for(const x of [-5.7,5.7])for(const z of [14,1,-5.5,-20.5,-29.5,-42])flowerpot(town,x,streetHeight(z),z,range(.8,1.3));
  // Project-local leaves use instancing to keep a dense canopy affordable.
  town.updateMatrixWorld(true);
  const leafMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:false});
  const leafMesh=new THREE.InstancedMesh(leafGeo,leafMat,leaves.length);const dummy=new THREE.Object3D(),tmp=new THREE.Vector3(),col=new THREE.Color();
  leaves.forEach((l,i)=>{tmp.set(l.x,l.y,l.z);l.parent.localToWorld(tmp);dummy.position.copy(tmp);dummy.scale.set(l.s,l.s*.42,l.s*.78);dummy.rotation.set(range(-.9,.9),range(0,TAU),range(-.6,.6));dummy.updateMatrix();leafMesh.setMatrixAt(i,dummy.matrix);col.set(l.c);col.multiplyScalar(range(.86,1.12));leafMesh.setColorAt(i,col);});
  leafMesh.castShadow=true;leafMesh.receiveShadow=true;scene.add(leafMesh);
  // Grass tufts, individually bent triangles, share one draw call.
  const grassPositions=[],grassColours=[],green=new THREE.Color();
  for(let i=0;i<3300;i++){const x=range(-26,28),z=range(-58,30);if(isWalkable(x,z,-.25))continue;const y=streetHeight(z)-.38-Math.max(0,Math.abs(x)-22)*.75;const h=range(.18,.58),w=.07,a=range(0,TAU);grassPositions.push(x-w,y,z,x+w,y,z,x+Math.cos(a)*.17,y+h,z+Math.sin(a)*.17);green.set(pick(['#83914a','#9da257','#687f48']));for(let v=0;v<3;v++)grassColours.push(green.r,green.g,green.b);}
  const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute(grassPositions,3));grassGeo.setAttribute('color',new THREE.Float32BufferAttribute(grassColours,3));grassGeo.computeVertexNormals();const grass=new THREE.Mesh(grassGeo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1}));scene.add(grass);

  // Keep UVs for sign faces while combining static architectural details.
  // Exclude sky and far landscape to preserve fog and shadow behaviour.
  batchStatic(town);
  const beacons=[];
  for(const m of MEMORIES){
    const p=new THREE.Group();p.position.set(m.x,streetHeight(m.z)+1.9,m.z);p.userData.dynamic=true;scene.add(p);
    const diamond=mesh(p,new THREE.OctahedronGeometry(.17),new THREE.MeshBasicMaterial({color:'#fff2b3'}),0,0,0);
    const ring=mesh(p,new THREE.TorusGeometry(.34,.012,4,32),new THREE.MeshBasicMaterial({color:'#ffe6a5',transparent:true,opacity:.75}),0,0,0);ring.rotation.x=Math.PI/2;
    const light=new THREE.PointLight('#ffcc80',3,4,2);p.add(light);beacons.push({id:m.id,group:p,diamond,ring,baseY:p.position.y,light});
  }
  const motesGeo=new THREE.BufferGeometry(),motesPos=[];for(let i=0;i<160;i++)motesPos.push(range(-26,26),range(1,22),range(-57,27));motesGeo.setAttribute('position',new THREE.Float32BufferAttribute(motesPos,3));
  const moteMat=new THREE.PointsMaterial({color:'#fff1b1',size:.07,transparent:true,opacity:.5,depthWrite:false});const motes=new THREE.Points(motesGeo,moteMat);scene.add(motes);
  let dusk=.15;
  const duskColours={sky:new THREE.Color('#7d6884'),horizon:new THREE.Color('#e6a07c'),fog:new THREE.Color('#b79599'),sun:new THREE.Color('#ff995e'),ambient:new THREE.Color('#e6bfd0'),ground:new THREE.Color('#9d6360')};
  function setDusk(v){
    dusk=v;
    skyMat.uniforms.top.value.set('#dca694').lerp(duskColours.sky,v);
    skyMat.uniforms.bottom.value.set('#ffcf87').lerp(duskColours.horizon,v);
    scene.fog.color.set('#e8bf91').lerp(duskColours.fog,v);
    sun.color.set('#ffcd86').lerp(duskColours.sun,v);
    hemi.color.set('#ffe0bd').lerp(duskColours.ambient,v);
    hemi.groundColor.set('#b0714e').lerp(duskColours.ground,v);
    sun.intensity=2.8-v*1.6;hemi.intensity=1.9-v*.55;
    lanternMat.emissiveIntensity=.23+v*1.4;windowMat.emissiveIntensity=.4+v*1.2;moteMat.opacity=.35+v*.55;
  }
  setDusk(dusk);
  const introPosition=new THREE.Vector3(-23,19,32),introTarget=new THREE.Vector3(4.5,9,-18);
  camera.position.copy(introPosition);camera.lookAt(introTarget);
  return {scene,camera,renderer,beacons,cat,colliders,introPosition,introTarget,setDusk,
    update(time,reduced){if(!reduced){motes.rotation.y=Math.sin(time*.035)*.025;cat.rotation.y=.7+Math.sin(time*.45)*.2;for(const b of beacons){b.group.position.y=b.baseY+Math.sin(time*1.5+b.baseY)*.1;b.diamond.rotation.y=time*.5;b.ring.rotation.z=time*.1;}}},
    setFound(found){for(const b of beacons){const yes=found.includes(b.id);b.diamond.material.color.set(yes?'#b5c9a0':'#fff2b3');b.ring.visible=!yes;b.light.intensity=yes?0:3;}},
    resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);},
    setQuality(q){renderer.setPixelRatio(Math.min(devicePixelRatio,q==='balanced'?1:1.6));renderer.shadowMap.enabled=q!=='balanced';renderer.setSize(innerWidth,innerHeight);},
  };
}

export function createCharacter(scene,gender='male') {
  const root=new THREE.Group();root.userData.dynamic=true;scene.add(root);
  const skin=material('#d6ad84'),hair=material('#3d382e'),coat=material(gender==='female'?'#ba815d':'#718a77'),trousers=material('#48574d'),shoes=material('#564635');
  const body=new THREE.Group();root.add(body);
  mesh(body,new THREE.CapsuleGeometry(.25,.43,4,8),coat,0,1.02,0,1,1,.7);
  const head=ball(body,0,1.60,0,.235,.26,.22,skin);
  mesh(body,new THREE.SphereGeometry(.245,12,8,0,TAU,0,1.65),hair,0,1.64,-.01);
  for(const x of [-.082,.082])ball(body,x,1.61,.20,.025,.031,.015,hair);
  if(gender==='female'){
    ball(body,0,1.45,-.16,.24,.3,.13,hair);ball(body,.21,1.47,-.16,.09,.17,.085,hair);
  }
  box(body,0,1.04,-.22,.42,.5,.22,material('#bc9b60'));box(body,0,1.24,-.25,.42,.10,.24,material('#97764d'));
  for(const x of [-.17,.17])box(body,x,1.12,.145,.045,.54,.055,material('#b89e71'));
  const limbs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();body.add(arm);arm.position.set(side*.32,1.23,0);mesh(arm,new THREE.CapsuleGeometry(.085,.34,3,7),coat,0,-.2,0);ball(arm,0,-.47,0,.074,.10,.078,skin);limbs.push(arm);
    const leg=new THREE.Group();body.add(leg);leg.position.set(side*.14,.68,0);mesh(leg,new THREE.CapsuleGeometry(.105,.31,3,7),trousers,0,-.22,0);box(leg,0,-.54,.075,.21,.17,.35,shoes);limbs.push(leg);
  }
  root.rotation.y=Math.PI;root.position.set(0,0,22);
  return {root,body,head,limbs,animate(time,speed,reduced){const stride=speed>0?Math.sin(time*(speed>4?11:8))*.5:0;limbs[0].rotation.x=stride;limbs[1].rotation.x=-stride;limbs[2].rotation.x=-stride;limbs[3].rotation.x=stride;body.position.y=reduced?0:(speed>0?Math.abs(stride)*.065:Math.sin(time*2)*.018);}};
}
