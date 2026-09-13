import './style.css';
import * as THREE from 'three';
import { createWorld, createCharacter } from './world.js';
import { loadRefinements } from './refinements.js';
import { createMinigames } from './minigame-ui.js';
import { readJourney, writeJourney } from './journey-store.js';
import { MEMORIES, WALKWAYS, LANTERN_TERRACE, insideTeahouse, groundHeight, normaliseWish, isWalkable, nearestMemory, streetHeight, findRoute } from './story.js';
import { PRESENTATION_START, PRESENTATION_STOPS, nextPresentationStop } from './presentation-route.js';
import { icon } from './icons.js';
import { Soundscape } from './audio.js';

const $=id=>document.getElementById(id);
let phase='welcome',profile=null,character=null,world=null,nearby=null,memory=null,memoryPage=0,toastTimer;
let yaw=0,elevation=.32,distance=9.3,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,dusk=.15,manualTime=false;
let drag=null,joystick={x:0,y:0},walked=0,elapsed=0,lastSave=0,frameTime=0,previousFrame=0;
let route=[],assets=null,minigames=null,cinematic=false,cinemaStart=0,pendingEnding=false;
const keys=new Set(),sound=new Soundscape(),raycaster=new THREE.Raycaster();
const target=new THREE.Vector3(),desired=new THREE.Vector3(),camRay=new THREE.Ray(),hit=new THREE.Vector3();

function notify(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4000);}
function readSave(){try{return readJourney(localStorage);}catch{return null;}}
function save(){if(!profile)return;try{profile.position={x:character.root.position.x,z:character.root.position.z};if(!writeJourney(localStorage,profile))throw new Error('Storage failed');}catch{notify('Browser storage is unavailable. You can still explore this session.');}}
function toggleTitle(creating=false){
  document.body.classList.toggle('creating',creating);document.body.classList.remove('playing');$('welcome').hidden=creating;$('onboarding').hidden=!creating;$('hud').hidden=true;
  cinematic=false;$('lantern-view').hidden=true;phase=creating?'creating':'welcome';route=[];if(character)character.root.visible=false;
}
function openDialog(id){keys.clear();joystick={x:0,y:0};$('joystick-thumb').style.transform='';$(id).showModal();}
function anyDialog(){return Boolean(document.querySelector('dialog[open]'));}
function start(nextProfile){
  profile=nextProfile;route=[];
  if(character)character.root.removeFromParent();character=createCharacter(world.scene,profile.gender,assets);
  character.root.position.set(profile.position.x,groundHeight(profile.position.x,profile.position.z),profile.position.z);
  $('traveller-name').textContent=profile.name;$('welcome').hidden=true;$('onboarding').hidden=true;$('hud').hidden=false;
  document.body.classList.remove('creating');document.body.classList.add('playing');phase='playing';yaw=0;elevation=.32;keys.clear();
  minigames.start();world.setFound(profile.found);updateJournal();updateProgress();save();$('controls-hint').hidden=false;
  notify(`Welcome back, ${profile.name}. Take your time.`);
}

$('sound').innerHTML=icon('muted');
$('wish-dialog').querySelector('.close-button').innerHTML=icon('close');
$('wish-form').querySelector('.primary span').innerHTML=icon('arrowUpRight');
$('leave-lantern-view').querySelector('span').innerHTML=icon('arrowRight');
$('journal-button').innerHTML=icon('journal')+'<small>Memory journal</small>';$('journal-button').setAttribute('aria-label','Open memory journal');
$('map-button').innerHTML=icon('map');$('map-button').setAttribute('aria-label','Open neighbourhood map');
$('settings-button').innerHTML=icon('settings');$('settings-button').setAttribute('aria-label','Pause and settings');
$('sound').onclick=async()=>{try{const on=await sound.toggle();$('sound').innerHTML=icon(on?'sound':'muted');$('sound').setAttribute('aria-label',on?'Turn ambient sound off':'Turn ambient sound on');notify(on?'The mountain breeze and wind chimes are on.':'Ambient sound is off.');}catch{notify('Sound could not start. Try the sound button again.');}};
$('begin').onclick=()=>{toggleTitle(true);$('character-name').focus();};
$('back-welcome').onclick=()=>toggleTitle(false);
$('resume').onclick=()=>{const previous=readSave();if(previous)start(previous);};
$('character-form').onsubmit=e=>{
  e.preventDefault();const data=new FormData(e.target);const name=data.get('name').trim(),gender=data.get('gender');
  if(!name||!['male','female'].includes(gender)){$('form-error').textContent='Add a name and choose a character to begin.';return;}
  $('form-error').textContent='';start({name:name.slice(0,24),gender,found:[],position:{...PRESENTATION_START}});
};
$('dismiss-controls').onclick=()=>{$('controls-hint').hidden=true;};
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>b.closest('dialog').close();
for(const d of document.querySelectorAll('dialog')){
  d.addEventListener('close',()=>{keys.clear();if(phase==='playing')save();});
  d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
}
$('journal-button').onclick=()=>{updateJournal();openDialog('journal-dialog');};
$('map-button').onclick=()=>{updateMap();openDialog('map-dialog');};
$('settings-button').onclick=()=>openDialog('settings-dialog');
$('return-game').onclick=()=>$('settings-dialog').close();
$('return-title').onclick=()=>{save();$('settings-dialog').close();toggleTitle(false);$('resume').hidden=false;};
$('ending-journal').onclick=()=>{$('ending-dialog').close();updateJournal();openDialog('journal-dialog');};
$('quality').onchange=e=>world.setQuality(e.target.value);
$('reduced-motion').checked=reduced;
$('reduced-motion').onchange=e=>{reduced=e.target.checked;document.body.classList.toggle('reduced-motion',reduced);};
$('time-slider').oninput=e=>{manualTime=true;dusk=Number(e.target.value);setTime();};
function setTime(){world.setDusk(dusk);const label=dusk>.67?'Lantern-lit dusk':dusk>.35?'Evening light':'Golden hour';$('time-label').textContent=label;$('time-setting').textContent=label;}

function updateProgress(){
  const count=profile.found.length;$('memory-count').textContent=count;
  $('memory-dots').innerHTML=MEMORIES.map(m=>`<i class="${profile.found.includes(m.id)?'found':''}"></i>`).join('');
  const stop=nextPresentationStop(profile);
  $('quest-title').textContent=stop.id==='story-walk-complete'?stop.title:`${stop.index+1} of ${stop.total} · ${stop.title}`;
  $('quest-hint').textContent=stop.hint;
  world.setFound(profile.found);
}
function openMemory(m){if(!m)return;route=[];memory=m;memoryPage=0;renderMemory();openDialog('memory-dialog');sound.chime(659.25);}
function renderMemory(){
  $('memory-place').textContent=memory.place;$('memory-title').textContent=memory.title;
  $('memory-art').style.background=memory.colour;$('memory-art').innerHTML=icon(memory.icon)+`<span>${memory.chinese}</span>`;
  $('memory-text').textContent=memory.lines[memoryPage];$('memory-pagination').textContent=`${memoryPage+1} / ${memory.lines.length}`;
  $('memory-next').innerHTML=memoryPage===memory.lines.length-1?`Keep this memory <span>${icon('arrowUpRight')}</span>`:`Let it come back <span>${icon('arrowRight')}</span>`;
}
$('memory-next').onclick=()=>{
  if(memoryPage<memory.lines.length-1){memoryPage++;renderMemory();sound.chime(440+memoryPage*110,.027);return;}
  const isNew=!profile.found.includes(memory.id);if(isNew)profile.found.push(memory.id);
  $('memory-dialog').close();updateProgress();updateJournal();save();
  if(isNew){notify('A little piece of home, kept in your journal.');sound.chime(783.99);if(profile.found.length===MEMORIES.length)setTimeout(()=>{if(phase==='playing'&&!anyDialog())openDialog('ending-dialog');},600);}
};
function interact(){
  if(!nearby)return;
  if(nearby.kind){route=[];minigames.interact(nearby);return;}
  if(nearby.id==='tea'){route=[];minigames.table();return;}
  if(nearby.id==='wish'){
    route=[];$('wish-error').textContent='';openDialog('wish-dialog');$('wish-text').focus();
  }else openMemory(nearby);
}
$('interact').onclick=interact;$('touch-interact').onclick=interact;
$('wish-text').oninput=()=>{$('wish-length').textContent=$('wish-text').value.length+' / 120';};
$('wish-form').onsubmit=e=>{
  e.preventDefault();const wish=normaliseWish($('wish-text').value);
  if(!wish){$('wish-error').textContent='Write a little wish before you let it go.';$('wish-text').focus();return;}
  profile.wishes=[...(profile.wishes||[]),wish].slice(-12);save();updateJournal();updateProgress();
  $('wish-dialog').close();world.refinements.release(frameTime);cinematic=!reduced;cinemaStart=frameTime;
  $('lantern-view').hidden=!cinematic;$('released-wish').textContent=wish;
  $('wish-text').value='';$('wish-length').textContent='0 / 120';
  notify(reduced?'Your wish is rising. A sky full of lanterns follows.':'One wish becomes a sky full of light.');
  sound.chime(523.25,.04);setTimeout(()=>sound.chime(659.25,.025),600);setTimeout(()=>sound.chime(783.99,.025),1200);
};
function endCinematic(){cinematic=false;$('lantern-view').hidden=true;}
$('leave-lantern-view').onclick=endCinematic;

function updateJournal(){
  if(!profile)return;$('journal-intro').textContent=`${profile.name}’s journey · ${profile.found.length} of 6 memories brought home`;
  const list=$('journal-list');list.replaceChildren();
  for(const m of MEMORIES){
    const found=profile.found.includes(m.id),button=document.createElement('button');button.className='journal-entry'+(found?'':' locked');button.disabled=!found;
    button.innerHTML=`<span class="entry-icon">${icon(found?m.icon:'lock')}</span><span><strong>${found?m.title:'A memory waiting'}</strong><small>${found?m.keepsake:m.place}</small></span><span>${found?icon('arrowUpRight'):''}</span>`;
    if(found)button.onclick=()=>{$('journal-dialog').close();openMemory(m);};list.appendChild(button);
  }
  const wishes=$('journal-wishes');wishes.replaceChildren();
  if(profile.wishes?.length){const heading=document.createElement('h3');heading.textContent='Wishes given to the sky';wishes.append(heading);for(const wish of profile.wishes){const p=document.createElement('p');p.textContent=wish;wishes.append(p);}}
  $('export-journal').disabled=profile.found.length===0&&!profile.wishes?.length;
}
$('export-journal').onclick=()=>{
  if(!profile)return;const lines=[`The way home`,`${profile.name}’s memories of Jiufen`,'',...MEMORIES.filter(m=>profile.found.includes(m.id)).flatMap(m=>[m.title,m.place,'',...m.lines,'',`Kept: ${m.keepsake}`,'','']), ...(profile.wishes?.length?['Wishes given to the sky','',...profile.wishes,'']:[]), 'An EverMemory story.'];
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-jiufen-memories.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};

function updateMap(){
  if(!profile)return;
  const mx=x=>249+x*4.9,mz=z=>28+(z+75)*3.65;
  const paths=WALKWAYS.map(w=>`<rect x="${mx(w.x1)}" y="${mz(w.z1)}" width="${(w.x2-w.x1)*4.9}" height="${(w.z2-w.z1)*3.65}" rx="2" fill="#d2c5a7"/>`).join('');
  const storyAnchors=[PRESENTATION_START,...PRESENTATION_STOPS],storyPoints=[];
  for(let i=1;i<storyAnchors.length;i++){
    const from=storyAnchors[i-1],to=storyAnchors[i],segment=findRoute(from.x,from.z,to.x,to.z);
    for(let j=0;j<segment.length;j+=4)storyPoints.push(`${mx(segment[j].x)},${mz(segment[j].z)}`);
    const last=segment.at(-1);if(last)storyPoints.push(`${mx(last.x)},${mz(last.z)}`);
  }
  const storyPath=storyPoints.length?`<polyline points="${storyPoints.join(' ')}" fill="none" stroke="#a24932" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 5" opacity=".9"/>`:'';
  const destinations=[...MEMORIES,LANTERN_TERRACE];
  const markers=destinations.map((m,i)=>{const x=mx(m.x),y=mz(m.z),found=profile.found.includes(m.id);return `<g role="button" tabindex="0" aria-label="Walk to ${m.place}" data-destination="${m.id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="19" fill="transparent"/><circle cx="${x}" cy="${y}" r="10" fill="${found?'#e8dfc7':'#b67d51'}" stroke="#a58159"/><text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="10" fill="${found?'#706a50':'#fff8e5'}">${i+1}</text></g>`;}).join('');
  const p=character.root.position;
  $('map-illustration').innerHTML=`<svg viewBox="0 0 510 420" role="group" aria-label="Neighbourhood map with seven destinations and a rust-coloured story walk"><path d="M23 25Q40 90 25 190T28 405" fill="none" stroke="#a9c0af" stroke-width="30" opacity=".6"/>${paths}${storyPath}${markers}<circle cx="${mx(p.x)}" cy="${mz(p.z)}" r="6" fill="#325d46" stroke="#fff8e3" stroke-width="2"/><text x="97" y="28" text-anchor="middle" fill="#566249" font-size="11">Rainlight Teahouse</text><text x="389" y="28" text-anchor="middle" fill="#566249" font-size="11">Wishing terrace</text><path d="M472 77V55m-5 8 5-8 5 8" stroke="#9d8158" fill="none"/><text x="472" y="45" text-anchor="middle" font-size="10" fill="#9d8158">N</text></svg>`;
  const mapSvg=$('map-illustration').querySelector('svg');
  mapSvg.addEventListener('click',event=>{
    if(event.target.closest('[data-destination]'))return;
    const point=mapSvg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const local=point.matrixTransform(mapSvg.getScreenCTM().inverse());
    const x=(local.x-249)/4.9,z=(local.y-28)/3.65-75;
    if(!isWalkable(x,z))return;
    const path=findRoute(p.x,p.z,x,z);if(!path.length)return;
    route=path;endCinematic();$('map-dialog').close();notify('Following the path. WASD takes over.');
  });
  const list=$('map-destinations');list.replaceChildren();
  function follow(id){
    const destination=destinations.find(m=>m.id===id);route=findRoute(p.x,p.z,destination.x,destination.z);
    if(!route.length){notify('Step back onto the lane, then choose this stop again.');return;}
    endCinematic();$('map-dialog').close();notify('Following the lane to '+destination.place.toLowerCase()+'. WASD takes over.');
  }
  destinations.forEach((m,i)=>{const button=document.createElement('button');button.textContent=`${i+1}. ${m.place}`;button.onclick=()=>follow(m.id);list.append(button);});
  for(const marker of $('map-illustration').querySelectorAll('[data-destination]')){
    marker.addEventListener('click',()=>follow(marker.dataset.destination));
    marker.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();follow(marker.dataset.destination);}});
  }
}

function keydown(e){
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  if(phase!=='playing')return;
  if(anyDialog())return;
  if(cinematic&&e.code==='Escape'){e.preventDefault();endCinematic();return;}
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();endCinematic();route=[];keys.add(e.code);}
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')keys.add(e.code);
  if(e.repeat)return;
  if(e.code==='KeyE'){e.preventDefault();interact();}
  if(e.code==='KeyJ'){$('journal-button').click();}
  if(e.code==='KeyM'){$('map-button').click();}
  if(e.code==='Escape'){e.preventDefault();openDialog('settings-dialog');}
}
document.addEventListener('keydown',keydown);document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();joystick={x:0,y:0};drag=null;save();});
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden)save();});
window.addEventListener('pagehide',save);

function bindWorldInput(){
  const canvas=world.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{if(phase!=='playing'||anyDialog())return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.006;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-drag.y)*.004,.15,1.05);drag.x=e.clientX;drag.y=e.clientY;});
  canvas.addEventListener('pointerup',e=>{
    if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7&&nearby){
      const mouse=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(mouse,world.camera);
      const selected=world.beacons.find(b=>b.id===nearby.id);
      if(selected&&raycaster.intersectObject(selected.group,true).length)interact();
    }drag=null;
  });
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('wheel',e=>{if(phase==='playing'&&!anyDialog()){e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.008,3.3,13);}}, {passive:false});
  const pad=$('joystick');let pointerId=null;
  function setStick(e){endCinematic();route=[];const r=pad.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.max(1,Math.hypot(dx,dy)/36);joystick={x:dx/len/36,y:dy/len/36};$('joystick-thumb').style.transform=`translate(${joystick.x*28}px,${joystick.y*28}px)`;}
  pad.onpointerdown=e=>{pointerId=e.pointerId;pad.setPointerCapture(pointerId);setStick(e);};pad.onpointermove=e=>{if(e.pointerId===pointerId)setStick(e);};
  const release=()=>{pointerId=null;joystick={x:0,y:0};$('joystick-thumb').style.transform='';};pad.onpointerup=release;pad.onpointercancel=release;
}

function updatePlayer(dt,time){
  const p=character.root.position;
  const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))-joystick.y;
  const right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+joystick.x;
  const len=Math.hypot(forward,right);
  while(route.length&&Math.hypot(route[0].x-p.x,route[0].z-p.z)<.13)route.shift();
  let speed=0,dx=0,dz=0;
  if(!anyDialog()){
    if(len>.06){
      speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?5.7:3.1)*Math.min(len,1);
      dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*right)/len;dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*right)/len;
    }else if(route.length){
      const point=route[0],gap=Math.hypot(point.x-p.x,point.z-p.z);
      speed=Math.min(4.2,gap/Math.max(dt,.001));dx=(point.x-p.x)/gap;dz=(point.z-p.z)/gap;
    }
  }
  speed*=minigames.speed();
  const beforeX=p.x,beforeZ=p.z;
  if(speed){
    const step=speed*dt;
    if(isWalkable(p.x+dx*step,p.z))p.x+=dx*step;
    if(isWalkable(p.x,p.z+dz*step))p.z+=dz*step;
    const angle=Math.atan2(dx,dz),diff=THREE.MathUtils.euclideanModulo(angle-character.root.rotation.y+Math.PI,Math.PI*2)-Math.PI;
    character.root.rotation.y+=diff*Math.min(1,dt*12);walked+=step;
    if(walked>.65){sound.step();walked=0;}
  }
  p.y=THREE.MathUtils.lerp(p.y,groundHeight(p.x,p.z),Math.min(1,dt*18));character.animate(time,speed,reduced);
  const indoors=insideTeahouse(p.x,p.z),cameraDistance=indoors?Math.min(distance,5.6):distance,cameraElevation=indoors?Math.max(elevation,.78):elevation;
  target.set(p.x,p.y+(indoors?1.2:2.1),p.z);desired.set(p.x+Math.sin(yaw)*cameraDistance*Math.cos(cameraElevation),p.y+1.35+Math.sin(cameraElevation)*cameraDistance,p.z+Math.cos(yaw)*cameraDistance*Math.cos(cameraElevation));
  camRay.origin.copy(target);camRay.direction.copy(desired).sub(target).normalize();let allowed=cameraDistance;
  for(const bounds of world.colliders){if(camRay.intersectBox(bounds,hit)){const d=target.distanceTo(hit);if(d<allowed)allowed=Math.max(1.3,d-.35);}}
  desired.copy(target).addScaledVector(camRay.direction,allowed);desired.y=Math.max(desired.y,groundHeight(desired.x,desired.z)+.6);
  if(cinematic){
    const age=time-cinemaStart;
    target.set(22,THREE.MathUtils.lerp(15,47,Math.min(age/16,1)),-93);
    desired.set(33,18,-44);if(age>34)endCinematic();
  }
  world.camera.position.lerp(desired,reduced?1:1-Math.exp(-dt*(cinematic?.75:5)));world.camera.lookAt(target);
  $('compass-needle').style.transform=`rotate(${yaw}rad)`;
  nearby=minigames.nearby(p.x,p.z)||(Math.hypot(p.x-LANTERN_TERRACE.x,p.z-LANTERN_TERRACE.z)<3?LANTERN_TERRACE:nearestMemory(p.x,p.z));
  if(nearby?.id==='tea'&&!indoors)nearby=null;$('interact').hidden=!nearby||anyDialog()||cinematic;$('touch-interact').disabled=!nearby;
  $('interact-kind').textContent=nearby?.id==='wish'?'Give a wish to the sky':'A familiar feeling';
  $('touch-interact').textContent=nearby?.id==='wish'?'Write a wish':'Touch a memory';
  $('place-chinese').textContent=indoors?'雨光茶舍':p.z<-55&&p.x>17?'天燈祈願臺':'九份老街';
  if(nearby){$('interact-label').textContent=nearby.id==='tea'?'Choose a cup at the tea table':nearby.object;$('place-name').textContent=nearby.place;}
  else $('place-name').textContent=indoors?'Rainlight Teahouse':p.z<-55&&p.x>17?'The wishing terrace':p.z<-55?'The ridge promenade':p.z>12?'The old bus stop':p.z>2?'Lantern stairway':p.z>-6?'The taro-ball lane':p.z>-20?'Shuqi Road':p.z>-30?'The tea-house terrace':p.z>-42?'The upper stairway':'Between mountain and sea';
  if(!manualTime&&!anyDialog()){elapsed+=dt;dusk=Math.max(dusk,Math.min(.85,.15+elapsed/800));}
  const lanternAge=world.refinements.lanternAge(time);if(lanternAge>=0&&lanternAge<14)dusk=THREE.MathUtils.lerp(dusk,.94,dt*.28);
  setTime();$('time-slider').value=dusk;
  world.refinements.update(time,p,reduced,world.camera);
  minigames.update(dt,time,p,Math.hypot(p.x-beforeX,p.z-beforeZ)>.001,anyDialog()||cinematic,reduced);
  if(pendingEnding&&!anyDialog()){pendingEnding=false;openDialog('ending-dialog');}
  if(time-lastSave>4){save();lastSave=time;}
}

function frame(ms){
  requestAnimationFrame(frame);if(document.hidden){previousFrame=ms;return;}
  const dt=Math.min((ms-(previousFrame||ms))/1000,.045);previousFrame=ms;frameTime+=dt;
  world.update(frameTime,reduced);
  if(phase==='playing'&&character)updatePlayer(dt,frameTime);
  else{
    world.refinements.update(frameTime,null,reduced,world.camera);
    const shift=reduced?0:Math.sin(frameTime*.065)*1.5;
    const mobile=innerWidth<701;
    desired.copy(world.introPosition);desired.x+=shift;if(mobile){desired.set(-13+shift,18,30);}
    world.camera.position.lerp(desired,1-Math.exp(-dt*1.4));world.camera.lookAt(mobile?new THREE.Vector3(6,10,-12):world.introTarget);
  }
  world.renderer.render(world.scene,world.camera);
}

async function boot(){
  try{
    await new Promise(resolve=>requestAnimationFrame(resolve));assets=await loadRefinements();world=createWorld($('world'),assets);
    minigames=createMinigames({world,assets,getProfile:()=>profile,save,notify,openDialog,onProgress:updateProgress,onMemory:(teaId)=>{if(teaId==='oolong'&&!profile.found.includes('tea')){profile.found.push('tea');updateProgress();updateJournal();save();pendingEnding=profile.found.length===MEMORIES.length;}}});
    bindWorldInput();
    window.addEventListener('resize',()=>world.resize());
    world.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();keys.clear();$('error-message').textContent='The graphics connection was interrupted. Reload to continue from your last saved place.';$('error-screen').hidden=false;});
    document.body.classList.toggle('reduced-motion',reduced);$('resume').hidden=!readSave();
    requestAnimationFrame(frame);$('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,900);
    if(innerWidth<701)world.setQuality('balanced');
  }catch(error){console.error(error);$('loading').hidden=true;$('error-screen').hidden=false;}
}
boot();
