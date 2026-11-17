import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const av = c.ashtakavarga;
console.log('=== ASHTAKAVARGA ===');
console.log('SAV total:', av.sav.total, '(BPHS: 337)');
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
  const b = av.bav?.[p];
  if (b) console.log(`  ${p.padEnd(8)} BAV total ${b.total}  (each BAV must total 56 for the 7 planets, 49 for nodes)`);
}
console.log('SAV per sign:', av.sav.bindus?.join(',') ?? av.sav.signs?.join(','));
const savSum = (av.sav.bindus ?? []).reduce((a:number,b:number)=>a+b,0);
console.log('SAV sum check:', savSum);
