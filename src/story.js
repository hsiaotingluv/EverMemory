export const MEMORIES = [
  { id: 'ticket', place: 'The old bus stop', chinese: '回家的路', title: 'One more bend', object: 'A folded bus ticket', x: -3.7, z: 20, icon: 'ticket', colour: '#c28545', hint: 'Someone has left a ticket beside the old bus stop.', lines: ['The ticket is soft at the creases. You used to fold it into a tiny mountain while the bus climbed the real one.', '“One more bend,” Dad would say. He said it at every bend. You believed him every time.', 'Then the first red lantern appeared, and you knew you were nearly home.'], keepsake: 'A bus ticket, folded into a mountain.' },
  { id: 'taro', place: 'Grandma’s taro stall', chinese: '阿嬤芋圓', title: 'The extra purple one', object: 'A bowl of taro balls', x: -4, z: -2, icon: 'bowl', colour: '#986b7b', hint: 'Follow the stairs to the little purple awning.', lines: ['Ginger, sweet steam and rain on warm stone. Somehow your hands remember the heat of this bowl.', 'Grandma always slipped in one extra purple taro ball. “Don’t tell the others,” she whispered, loudly enough for everyone to hear.', 'You thought you were her favourite. Perhaps everyone did.'], keepsake: 'Grandma’s recipe, with one extra purple ball.' },
  { id: 'tea', place: 'Rainlight Teahouse', chinese: '雨光茶舍', title: 'A cup for the rain', object: 'A small blue teacup', x: -31, z: -66.2, icon: 'tea', colour: '#557f7c', hint: 'Follow the ridge path to Rainlight Teahouse. Your blue cup is waiting inside.', lines: ['A blue cup sits by the window. There is a tiny chip on its rim, exactly where your thumb wants to rest.', 'Mum never hurried the tea. Outside, rain gathered on the lanterns; inside, you counted the boats until the windows fogged.', '“We can stay a little longer,” she said. You had forgotten how safe those words felt.'], keepsake: 'A blue teacup with a familiar chipped rim.' },
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

export const TEAHOUSE = { x: -31, z: -69, y: 9.8, doorway: { x: -31, z: -63 } };
export const LANTERN_TERRACE = { id: 'wish', x: 27, z: -65, place: 'The wishing terrace', chinese: '天燈祈願臺', object: 'Write a wish, light a lantern' };
export const DOOR_PATHS = [
  { z1: 3.4, z2: 16, y: 0, doorZ: 7, left: -5.2, right: 5.5 },
  { z1: -18.6, z2: -4.5, y: 2.2, doorZ: -12.7, left: -5.75, right: 6.3 },
  { z1: -40.2, z2: -28.5, y: 5.8, doorZ: -35.8, left: -5.75, right: 6.5 },
];
// Navigation, paving and map share a single footprint. Stairs have their own
// narrow corridor; level side paths begin at the lower landing, never mid-step.
export const WALKWAYS = [
  { x1: -2.7, x2: 2.7, z1: -51.7, z2: 26 },
  { x1: -9, x2: 9, z1: 12, z2: 26 },
  { x1: -19, x2: 19, z1: -5.5, z2: 2 },
  { x1: -22, x2: 23, z1: -30, z2: -20.5 },
  { x1: -21, x2: 12, z1: -50, z2: -42 },
  { x1: 17, x2: 22, z1: -29, z2: -2 },
  { x1: -21, x2: -17, z1: -62, z2: -24 },
  ...DOOR_PATHS.flatMap(p => [
    { x1: 3.35, x2: p.right, z1: p.z1, z2: p.z2, y: p.y },
    { x1: p.left, x2: -3.35, z1: p.z1, z2: p.z2, y: p.y },
  ]),
  { x1: -38, x2: 29, z1: -63.6, z2: -59 },
  { x1: -32.25, x2: -29.75, z1: -66, z2: -61 },
  { x1: -36.5, x2: -25.5, z1: -73.4, z2: -64.4 },
  { x1: 18, x2: 36, z1: -73, z2: -55 },
];
export const FURNITURE = [
  { x1: 11.9, x2: 18.9, z1: -33.5, z2: -29.5 },
  { x1: -32.35, x2: -29.65, z1: -69.4, z2: -67.8 },
  { x1: -33.35, x2: -32.55, z1: -69, z2: -68.2 },
  { x1: -29.45, x2: -28.65, z1: -69, z2: -68.2 },
  { x1: -31.4, x2: -30.6, z1: -67.52, z2: -66.78 },
  { x1: -28.9, x2: -25.5, z1: -73, z2: -71.7 },
  { x1: 25.6, x2: 28.4, z1: -67.1, z2: -66.1 },
];
export function insideTeahouse(x,z) {
  return x > -37 && x < -25 && z < -63.8 && z > -74;
}
export function groundHeight(x,z) {
  const side = WALKWAYS.find(p => p.y !== undefined && x >= p.x1 && x <= p.x2 && z >= p.z1 && z <= p.z2);
  return side ? side.y : streetHeight(z);
}
export function isWalkable(x, z, radius = .32) {
  return WALKWAYS.some(p => x >= p.x1 + radius && x <= p.x2 - radius && z >= p.z1 + radius && z <= p.z2 - radius)
    && !FURNITURE.some(p => x > p.x1-radius && x < p.x2+radius && z > p.z1-radius && z < p.z2+radius);
}
export function normaliseWish(value) { return typeof value === 'string' ? value.trim().slice(0, 120) : ''; }
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
  const result = { name, gender: raw.gender, found, position };
  if (Array.isArray(raw.wishes)) result.wishes = raw.wishes.map(normaliseWish).filter(Boolean).slice(-12);
  return result;
}
