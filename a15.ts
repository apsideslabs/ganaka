import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('=== BHAVA BALA ===');
const bb: any[] = c.shadbala?.bhavaBala ?? [];
if (bb.length) {
  let sum = 0;
  for (const b of bb) { sum += b.totalVirupas ?? b.total ?? 0; }
  console.log('houses:', bb.length, ' total virupas:', sum.toFixed(1));
  console.log('per house:', bb.map((b:any)=>Number(b.totalVirupas ?? b.total).toFixed(0)).join(' '));
} else {
  console.log('bhavaBala not on shadbala; checking top-level');
  console.log(Object.keys(c.shadbala));
}
console.log('\n=== SHADBALA rank / ratio ===');
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
  const s: any = c.shadbala[p];
  console.log(`  ${p.padEnd(8)} ${s.totalVirupas.toFixed(1)} v  ratio ${s.ratio.toFixed(2)}  rank ${s.rank}`);
}
