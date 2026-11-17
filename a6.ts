import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('drigBala by planet:');
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
  const b: any = c.shadbala[p];
  console.log(`  ${p.padEnd(8)} drig ${String(b.drigBala).padStart(8)}   chesta ${String(b.chestaBala).padStart(7)}   kala ${String(b.kalaBala).padStart(7)}`);
}
