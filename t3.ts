import { sputaDrishti } from './lib/shadbala/sputa-drishti';
for (const g of ['sun','mars','jupiter','saturn'] as const) {
  let prev=sputaDrishti(0,0.01,g), maxj=0, oor=0;
  for (let a=0.01;a<360;a+=0.01){ const v=sputaDrishti(0,a,g); if(v<0||v>60)oor++; maxj=Math.max(maxj,Math.abs(v-prev)); prev=v; }
  console.log(`  ${g.padEnd(8)} range violations ${oor}   largest step ${maxj.toFixed(3)}`);
}
