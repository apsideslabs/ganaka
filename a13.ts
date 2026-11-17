import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
let issues = 0;
const bad = (m: string) => { console.log('  ✗ ' + m); issues++; };

console.log('=== CONSISTENCY SWEEP ===');
// sunrise/sunset
const st: any = c.panchanga.sunTimes;
console.log('sunrise:', st?.sunrise, ' sunset:', st?.sunset, ' nextSunrise:', st?.nextSunrise);
if (!st?.sunrise) bad('no sunrise');

// every planet's rashi must match its longitude
for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu']) {
  const pl: any = c.planets[p];
  const expect = Math.floor(pl.siderealLongitude / 30) + 1;
  if (pl.rashiNumber !== expect) bad(`${p} rashi ${pl.rashiNumber} ≠ ${expect}`);
  if (!pl.nakshatraName) bad(`${p} has no nakshatra`);
}
// houses must be 1..12 contiguous from lagna
const hs = c.bhavas.map((b: any) => b.houseNumber);
if (JSON.stringify(hs) !== JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12])) bad('bhava numbering wrong');

// varga count and every varga complete
const vk = Object.keys(c.vargas);
console.log('vargas:', vk.length, vk.join(' '));
for (const k of vk) {
  const ps = Object.keys(c.vargas[k].planets ?? {});
  if (ps.length !== 9) bad(`${k} has ${ps.length} grahas`);
  if (!c.vargas[k].lagnaRashi) bad(`${k} has no varga lagna`);
}

// yoga & dosha counts
console.log('yogas:', c.yogas.length, ' doshas evaluated:', c.doshas?.evaluatedDoshas?.length);
// relationships table
console.log('relationships:', c.relationships ? Object.keys(c.relationships).length + ' keys' : 'ABSENT');
// argala
console.log('argala:', Array.isArray(c.argala) ? c.argala.length + ' houses' : 'ABSENT');
// vargottama
console.log('vargottama:', (c.vargottamaPlanets ?? []).join(',') || 'none');

console.log(issues === 0 ? '\nall consistency checks passed' : `\n${issues} issues`);
