import * as THREE from 'three';

// A reusable close-up uses the same Blender teapot as the room. The selected
// cup stays on the world table as well as appearing here during the ritual.
export function createBrewingPreview(canvas,assets,cupColour){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(canvas.clientWidth||500,230,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,(canvas.clientWidth||500)/230,.1,30);camera.position.set(3.3,3.2,6.3);camera.lookAt(.15,1.1,0);
  scene.add(new THREE.HemisphereLight('#fff0d3','#b58049',3));const light=new THREE.DirectionalLight('#ffcf87',2.1);light.position.set(-3,5,4);scene.add(light);
  function material(colour){return new THREE.MeshStandardMaterial({color:colour,roughness:.45});}
  function add(geometry,mat,x,y,z){const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
  function pot(x,y,scale){const root=assets.getObjectByName('BlueTeapot').clone(true);root.position.set(x,y,0);root.scale.setScalar(scale);root.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.material=o.material.clone();}});scene.add(root);return root;}
  add(new THREE.BoxGeometry(4.7,.16,2.1),material('#b58049'),0,.48,0);
  add(new THREE.BoxGeometry(4.3,.055,1.65),material('#653a2b'),0,.59,0);
  const vessel=pot(0,.63,1.5),kettle=pot(-1.55,.75,1.2);
  kettle.traverse(o=>{if(o.isMesh)o.material.color.set('#674430');});
  const profile=[[0,.14],[.07,.20],[.35,.27],[.38,.27],[.38,.23],[.10,.13]].map(([y,r])=>new THREE.Vector2(r,y));
  add(new THREE.LatheGeometry(profile,28),material(cupColour),1.35,.64,0);
  const tea=add(new THREE.CylinderGeometry(.227,.227,.015,28),material('#b78752'),1.35,.72,0);tea.visible=false;
  const water=add(new THREE.CylinderGeometry(.027,.04,.6,10),new THREE.MeshStandardMaterial({color:'#e2b191',transparent:true,opacity:.7}),-.5,1.23,0);water.visible=false;
  const leaves=[];for(let i=0;i<7;i++){const leaf=add(new THREE.SphereGeometry(.06,6,4),material('#626a55'),0,1.9,0);leaf.scale.set(1,.3,1.8);leaves.push(leaf);}
  return {update(t,reduced){
    const warm=t<2,adding=t>=2&&t<4,steep=t>=4&&t<6,pouring=t>=6&&t<8;
    kettle.position.y=warm||steep?1.5:.75;kettle.rotation.z=warm||steep?-.65:0;
    vessel.position.y=pouring?1.03:.63;vessel.rotation.z=pouring?-.6:0;
    water.visible=warm||steep||pouring;water.position.set(pouring?1.1:-.62,pouring?1.18:1.31,0);water.scale.y=pouring?.75:1;
    leaves.forEach((leaf,i)=>{leaf.visible=adding;leaf.position.set(Math.sin(i*3)*.16,1.8-((t-2+i*.12)%1)*.75,Math.cos(i)*.13);});
    tea.visible=t>=6;tea.position.y=.72+Math.min(1,Math.max(0,(t-6)/2))*.21;
    if(reduced){kettle.rotation.z=0;vessel.rotation.z=0;leaves.forEach(l=>l.visible=false);water.visible=false;}
    renderer.render(scene,camera);
  },dispose(){scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});renderer.dispose();renderer.forceContextLoss();}};
}
