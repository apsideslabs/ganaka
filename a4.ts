import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('=== SHADBALA (virupas; 1 rupa = 60) ===');
// BPHS minimum required strength
const MIN: Record<string,number> = { sun:390, moon:360, mars:300, mercury:420, jupiter:390, venus:330, saturn:300 };
const sb: any = c.shadbala;
console.log('keys:', Object.keys(sb));
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
  const r: any = sb?.[p] ?? sb?.planets?.[p];
  if (!r) { console.log(`  ${p}: MISSING`); continue; }
  const tot = r.totalVirupas ?? r.total;
  console.log(`  ${p.padEnd(8)} total ${String(tot?.toFixed?.(1) ?? tot).padStart(6)} virupa  (BPHS min ${MIN[p]})  ${tot >= MIN[p] ? '✓' : '✗ below minimum'}`);
}
