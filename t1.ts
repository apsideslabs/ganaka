import { generalSputaDrishti, sputaDrishti } from './lib/shadbala/sputa-drishti';
const REF: Array<[number,number]> = [[30,0],[60,15],[90,45],[120,30],[150,0],[180,60],[210,45],[240,30],[270,15],[300,0]];
console.log('general sputa drishti against the published curve:');
let bad=0;
for (const [a,want] of REF) {
  const got = generalSputaDrishti(a);
  if (Math.abs(got-want)>0.01) bad++;
  console.log(`  ${String(a).padStart(3)}° → ${got.toFixed(2).padStart(6)}  expect ${String(want).padStart(3)}  ${Math.abs(got-want)<0.01?'✓':'✗'}`);
}
console.log(`  ${bad===0?'all match':'MISMATCH'}`);
// continuity + range across all three special grahas
console.log('\ncontinuity and range check (0.01° steps):');
for (const g of ['sun','mars','jupiter','saturn'] as const) {
  let prev = sputaDrishti(0, 0.01, g), maxJump=0, outOfRange=0;
  for (let a=0.01; a<360; a+=0.01) {
    const v = sputaDrishti(0, a, g);
    if (v<0 || v>60) outOfRange++;
    maxJump = Math.max(maxJump, Math.abs(v-prev));
    prev = v;
  }
  console.log(`  ${g.padEnd(8)} out of [0,60]: ${outOfRange}   largest step per 0.01°: ${maxJump.toFixed(3)}`);
}
