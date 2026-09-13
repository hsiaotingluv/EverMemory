import * as THREE from 'three';
import { CUPS, RIDDLES, RITUAL_CARD } from './minigames.js';
import { groundHeight } from './story.js';

export function createMinigameObjects(scene){
  const roots=new Map(),wood=new THREE.MeshStandardMaterial({color:'#653a2b',roughness:.85});
  const gold=new THREE.MeshStandardMaterial({color:'#c18a45',roughness:.6});
  const sphere=new THREE.SphereGeometry(1,12,8),box=new THREE.BoxGeometry(1,1,1);
  function add(parent,geo,mat,pos,scale){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const cupProfile=[[0,.09],[.04,.14],[.23,.19],[.25,.19],[.25,.155],[.06,.10]].map(([y,r])=>new THREE.Vector2(r,y));
  const cupGeo=new THREE.LatheGeometry(cupProfile,24);
  for(const cup of CUPS){
    const root=new THREE.Group();root.position.set(cup.x,groundHeight(cup.x,cup.z),cup.z);scene.add(root);roots.set(cup.id,root);
    add(root,box,wood,[0,.4,0],[.65,.8,.65]);add(root,box,gold,[0,.84,0],[.8,.1,.8]);
    const c=add(root,cupGeo,new THREE.MeshStandardMaterial({color:cup.colour,roughness:.25}),[0,.91,0],[1.5,1.5,1.5]);
    const marker=add(root,new THREE.OctahedronGeometry(.12),new THREE.MeshBasicMaterial({color:'#fff2b3'}),[0,1.75,0],[1,1,1]);root.userData.marker=marker;
    root.userData.cup=c;
  }
  for(const r of RIDDLES){
    const root=new THREE.Group();root.position.set(r.x,groundHeight(r.x,r.z),r.z);scene.add(root);roots.set(r.id,root);
    add(root,box,wood,[0,1.2,0],[.08,2.4,.08]);
    const red=new THREE.MeshStandardMaterial({color:'#b6583c',emissive:'#d66f2f',emissiveIntensity:.5});
    add(root,sphere,red,[0,2.1,0],[.24,.3,.24]);
    const c=document.createElement('canvas');c.width=128;c.height=256;c.lang='zh-Hant-TW';const ctx=c.getContext('2d');ctx.fillStyle='#f3eddf';ctx.fillRect(0,0,128,256);ctx.fillStyle='#a24932';ctx.font='48px "Songti TC",serif';ctx.textAlign='center';ctx.fillText('燈',64,90);ctx.fillText('謎',64,165);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(.28,.56),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));label.position.set(0,1.48,.08);root.add(label);
    root.userData.lantern=red;
  }
  const tableCup=new THREE.Mesh(cupGeo,new THREE.MeshStandardMaterial({color:'#557f7c',roughness:.2}));tableCup.position.set(-30.5,10.64,-68.3);tableCup.visible=false;scene.add(tableCup);
  const card=new THREE.Group();card.position.set(RITUAL_CARD.x,9.8,RITUAL_CARD.z);scene.add(card);
  add(card,box,wood,[0,.65,0],[.8,1.3,.55]);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.lang='zh-Hant-TW';const ctx=canvas.getContext('2d');ctx.fillStyle='#f3eddf';ctx.fillRect(0,0,512,512);ctx.fillStyle='#653a2b';ctx.textAlign='center';ctx.font='44px "Songti TC",serif';ctx.fillText('茶席小記',256,85);ctx.font='30px "Songti TC",serif';['溫壺','置茶','注水靜候','分茶聞香品茗'].forEach((t,i)=>ctx.fillText(t,256,165+i*70));
  const cardFace=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(canvas)}));cardFace.position.set(0,1.35,.16);cardFace.rotation.x=-.4;card.add(cardFace);
  const steam=new THREE.Group();scene.add(steam);steam.position.set(-31,11.1,-68.8);
  for(let i=0;i<9;i++){const m=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:'#f3eddf',transparent:true,opacity:.12,depthWrite:false}));m.scale.set(.1,.2,.1);steam.add(m);}steam.visible=false;
  return {
    sync(game){if(!game)return;for(const cup of CUPS)roots.get(cup.id).visible=!game.cups.includes(cup.id);for(const r of RIDDLES){const mat=roots.get(r.id).userData.lantern;mat.emissiveIntensity=game.solved.includes(r.id)?.08:.5;}},
    selectCup(id){const cup=CUPS.find(c=>c.id===id);tableCup.visible=Boolean(cup);if(cup)tableCup.material.color.set(cup.colour);},
    update(time,brewing,reduced){for(const root of roots.values())if(root.userData.marker)root.userData.marker.position.y=1.75+(reduced?0:Math.sin(time*2)*.09);steam.visible=brewing;steam.children.forEach((m,i)=>{const t=(time*.45+i/9)%1;m.position.set(Math.sin(i+time)*.13,t*1.15,Math.cos(i+time)*.12);m.material.opacity=(1-t)*.13;});},
  };
}
