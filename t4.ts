import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('drigBala after the change (was: sun -15, moon 3.8, mars 0, mercury 0, jupiter 0, venus 0, saturn -26.3)\n');
const MIN: Record<string,number> = { sun:390, moon:360, mars:300, mercury:420, jupiter:390, venus:330, saturn:300 };
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
  const b: any = c.shadbala[p];
  console.log(`  ${p.padEnd(8)} drig ${String(b.drigBala).padStart(7)}   total ${b.totalVirupas.toFixed(1)} v  ratio ${b.ratio.toFixed(2)}  (BPHS min ${MIN[p]})`);
}
console.log('\nzeros left:', ['sun','moon','mars','mercury','jupiter','venus','saturn'].filter(p=>c.shadbala[p].drigBala===0).join(',') || 'none');
