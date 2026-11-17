import { sputaDrishti, generalSputaDrishti } from './lib/shadbala/sputa-drishti';
console.log('Jupiter: the two recensions disagree. Values around the disputed bands:\n');
console.log('  angle   general   this impl   note');
for (const a of [210,225,239.9,240,250,260,269.9,270,275,285,300]) {
  console.log(`  ${String(a).padStart(6)}°  ${generalSputaDrishti(a).toFixed(2).padStart(7)}  ${sputaDrishti(0,a,'jupiter').toFixed(2).padStart(10)}`);
}
console.log('\nAt 240° this impl jumps 60 -> 30; at 270° it jumps 0 -> 15.');
console.log('Both recensions are discontinuous for Jupiter, in different places.');
console.log('\nMars and Saturn are continuous:');
for (const g of ['mars','saturn'] as const) {
  let prev=sputaDrishti(0,0.01,g), maxj=0;
  for (let a=0.01;a<360;a+=0.01){ const v=sputaDrishti(0,a,g); maxj=Math.max(maxj,Math.abs(v-prev)); prev=v; }
  console.log(`  ${g.padEnd(8)} largest step per 0.01°: ${maxj.toFixed(3)}`);
}
