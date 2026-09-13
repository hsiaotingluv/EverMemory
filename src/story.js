export const MEMORIES = [
  { id: 'ticket', place: 'The old bus stop', chinese: '回家的路', title: 'One more bend', object: 'A folded bus ticket', x: -3.7, z: 20, icon: 'ticket', colour: '#c28545', hint: 'Someone has left a ticket beside the old bus stop.', lines: ['The ticket is soft at the creases. You used to fold it into a tiny mountain while the bus climbed the real one.', '“One more bend,” Dad would say. He said it at every bend. You believed him every time.', 'Then the first red lantern appeared, and you knew you were nearly home.'], keepsake: 'A bus ticket, folded into a mountain.' },
  { id: 'taro', place: 'Grandma’s taro stall', chinese: '阿嬤芋圓', title: 'The extra purple one', object: 'A bowl of taro balls', x: -4, z: -2, icon: 'bowl', colour: '#986b7b', hint: 'Follow the stairs to the little purple awning.', lines: ['Ginger, sweet steam and rain on warm stone. Somehow your hands remember the heat of this bowl.', 'Grandma always slipped in one extra purple taro ball. “Don’t tell the others,” she whispered, loudly enough for everyone to hear.', 'You thought you were her favourite. Perhaps everyone did.'], keepsake: 'Grandma’s recipe, with one extra purple ball.' },
  { id: 'tea', place: 'The hillside tea house', chinese: '山城茶事', title: 'A cup for the rain', object: 'A small blue teacup', x: 4, z: -25, icon: 'tea', colour: '#557f7c', hint: 'The red tea house keeps a light on above the second stairway.', lines: ['A blue cup sits by the window. There is a tiny chip on its rim, exactly where your thumb wants to rest.', 'Mum never hurried the tea. Outside, rain gathered on the lanterns; inside, you counted the boats until the windows fogged.', '“We can stay a little longer,” she said. You had forgotten how safe those words felt.'], keepsake: 'A blue teacup with a familiar chipped rim.' },
  { id: 'cinema', place: 'The little cinema', chinese: '昇平戲院', title: 'Before the lights came up', object: 'An old film poster', x: 15, z: -24, icon: 'film', colour: '#af6950', hint: 'Turn right along the tea-house terrace to find the cinema.', lines: ['The poster has faded to the colour of peaches. You cannot remember the film, only the seat that swallowed your feet.', 'Your brother translated every scene into whispers. He was making most of it up. You laughed so hard that Dad had to pretend not to know you.', 'The lights came up. For a moment, nobody wanted to leave.'], keepsake: 'Two cinema stubs, still joined at the edge.' },
  { id: 'cat', place: 'The banyan courtyard', chinese: '榕樹下', title: 'Someone to come home to', object: 'A familiar ginger cat', x: -16, z: -24, icon: 'cat', colour: '#b78752', hint: 'A ginger cat is waiting in the courtyard west of the tea house.', lines: ['The cat looks up as if you are late. The same amber eyes. The same spectacular lack of interest in your excuses.', 'Every summer, you left a little bowl beneath this tree. Every autumn, you worried who would fill it when you went away.', 'There are three bowls here now. Some things were looked after, even when you were not looking.'], keepsake: 'A tiny paw print on the corner of a letter.' },
  { id: 'lantern', place: 'The lantern lookout', chinese: '山海之間', title: 'The things that stay', object: 'A lantern in the evening wind', x: -15, z: -46, icon: 'lantern', colour: '#b6583c', hint: 'Climb to the upper terrace. The sea is waiting beyond the lanterns.', lines: ['From here, the houses are warm little windows scattered across the mountain. Somewhere below, a spoon taps the side of a bowl.', 'You remember standing here between Mum and Dad, holding one finger from each hand. You had thought the town would always be this big.', 'It is smaller now. But the feeling is not. You do not have to remember everything to know that you were loved.'], keepsake: 'A quiet evening, brought home.' },
];

export function streetHeight(z) {
  if (z >= 12) return 0;
  if (z > 2) return (12 - z) * .22;
  if (z >= -6) return 2.2;
  if (z > -20) return 2.2 + (-6 - z) * (3.6 / 14);
  if (z >= -30) return 5.8;
  if (z > -42) return 5.8 + (-30 - z) / 3;
  return 9.8;
}

// The same connected footprint is used by the ground, map and player controller.
export const WALKWAYS = [
  { x1: -4.6, x2: 4.6, z1: -51, z2: 26 },
  { x1: -9, x2: 9, z1: 15, z2: 26 },
  { x1: -19, x2: 19, z1: -5.5, z2: 1.5 },
  { x1: -22, x2: 23, z1: -29.5, z2: -20.5 },
  { x1: -21, x2: 12, z1: -50, z2: -42.5 },
  { x1: 17, x2: 22, z1: -29, z2: -2 },
  { x1: -21, x2: -17, z1: -46, z2: -24 },
];
export function isWalkable(x, z, radius = .32) {
  return WALKWAYS.some(p => x >= p.x1 + radius && x <= p.x2 - radius && z >= p.z1 + radius && z <= p.z2 - radius);
}
export function nearestMemory(x, z, radius = 3.1) {
  return MEMORIES.find(m => Math.hypot(m.x - x, m.z - z) < radius) ?? null;
}

// A small half-metre navigation grid follows exactly the same lane boundaries.
// The route is optional: manual movement always takes over immediately.
export function findRoute(startX,startZ,endX,endZ) {
  const sx=Math.round(startX*2)/2,sz=Math.round(startZ*2)/2;
  const queue=[[sx,sz]],parents=new Map([[`${sx},${sz}`,null]]);let end=null;
  for(let i=0;i<queue.length;i++){
    const [x,z]=queue[i];
    if(Math.hypot(x-endX,z-endZ)<1){end=[x,z];break;}
    for(const [dx,dz] of [[0,-.5],[.5,0],[-.5,0],[0,.5]]){
      const nx=x+dx,nz=z+dz,key=`${nx},${nz}`;
      if(!parents.has(key)&&isWalkable(nx,nz)){parents.set(key,[x,z]);queue.push([nx,nz]);}
    }
  }
  if(!end)return [];
  const path=[];for(let p=end;p;p=parents.get(`${p[0]},${p[1]}`))path.unshift({x:p[0],z:p[1]});
  return path;
}
export function normaliseSave(raw) {
  if (!raw || typeof raw.name !== 'string' || !['male', 'female'].includes(raw.gender)) return null;
  const name = raw.name.trim().slice(0, 24);
  if (!name) return null;
  const found = [...new Set(Array.isArray(raw.found) ? raw.found : [])].filter(id => MEMORIES.some(m => m.id === id));
  const position = raw.position && Number.isFinite(raw.position.x) && Number.isFinite(raw.position.z) && isWalkable(raw.position.x, raw.position.z) ? raw.position : { x: 0, z: 22 };
  return { name, gender: raw.gender, found, position };
}
