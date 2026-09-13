import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORIES, streetHeight, isWalkable, nearestMemory, normaliseSave, findRoute } from '../src/story.js';

test('all memories are physically reachable from the starting plaza',()=>{
 const queue=[[0,22]],visited=new Set(['0,22']);
 for(let i=0;i<queue.length;i++){
  const [x,z]=queue[i];
  for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
   const nx=x+dx,nz=z+dz,key=`${nx},${nz}`;
   if(!visited.has(key)&&isWalkable(nx,nz)){visited.add(key);queue.push([nx,nz]);}
  }
 }
 for(const memory of MEMORIES)assert(queue.some(([x,z])=>Math.hypot(memory.x-x,memory.z-z)<2),memory.id+' cannot be reached');
});
test('stairs join their landings without height jumps',()=>{
 for(const z of [12,2,-6,-20,-30,-42])assert(Math.abs(streetHeight(z-.001)-streetHeight(z+.001))<.001);
 assert.equal(streetHeight(22),0);assert.equal(streetHeight(-48),9.8);
});
test('world edges are blocked and each memory requires physical proximity',()=>{
 assert(!isWalkable(100,0));assert(!isWalkable(0,40));assert(!nearestMemory(0,22));
 for(const m of MEMORIES)assert.equal(nearestMemory(m.x,m.z)?.id,m.id);
});
test('save validation removes bad progress and recovers unsafe coordinates',()=>{
 const result=normaliseSave({name:'  Rowan  ',gender:'female',found:['tea','tea','unknown'],position:{x:999,z:20}});
 assert.deepEqual(result,{name:'Rowan',gender:'female',found:['tea'],position:{x:0,z:22}});
 assert.equal(normaliseSave({name:' ',gender:'male'}),null);
 assert.equal(normaliseSave({name:'Sam',gender:'unknown'}),null);
 assert.equal(normaliseSave(null),null);
});
test('all stories have a complete three-beat memory and a keepsake',()=>{
 assert.equal(new Set(MEMORIES.map(m=>m.id)).size,6);
 for(const m of MEMORIES){assert.equal(m.lines.length,3);assert(m.lines.every(line=>line.length>40));assert(m.keepsake.length>10);}
});

test('guided walks connect every memory without crossing a wall or skipping stairs',()=>{
 let start={x:0,z:22};
 for(const memory of MEMORIES){
  const route=findRoute(start.x,start.z,memory.x,memory.z);assert(route.length>0);
  assert(route.every(point=>isWalkable(point.x,point.z)));
  for(let i=1;i<route.length;i++)assert(Math.hypot(route[i].x-route[i-1].x,route[i].z-route[i-1].z)<=.51);
  const last=route.at(-1);assert(Math.hypot(last.x-memory.x,last.z-memory.z)<1);start=last;
 }
});
