import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const sp: any = c.specialPoints;
console.log('specialPoints keys:', Object.keys(sp));
const list = sp.points ?? sp;
if (Array.isArray(list)) {
  for (const p of list.slice(0,20)) console.log(`  ${String(p.name ?? p.id).padEnd(16)} ${Number(p.siderealLongitude ?? p.longitude).toFixed(3)}°  ${p.rashiName ?? ''}`);
} else {
  for (const [k,v] of Object.entries(list).slice(0,20)) console.log(`  ${k.padEnd(16)} ${typeof v === 'number' ? v.toFixed(3) : JSON.stringify(v).slice(0,60)}`);
}
console.log('\n--- sunrise / sunset (Panchanga) ---');
const p: any = c.panchanga;
console.log('keys:', Object.keys(p));
console.log('sunrise:', p.sunrise, ' sunset:', p.sunset);
