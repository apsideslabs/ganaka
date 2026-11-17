import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const j: any = c.shadbala.jupiter;
console.log('Jupiter Shadbala components:');
for (const [k,v] of Object.entries(j)) {
  if (typeof v === 'number') console.log(`  ${k.padEnd(22)} ${v.toFixed(2)}`);
  else if (v && typeof v === 'object') console.log(`  ${k.padEnd(22)} ${JSON.stringify(v).slice(0,90)}`);
}
