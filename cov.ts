import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
import { buildChartExport } from './lib/report/export-chart-json';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:24, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' });
const e: any = buildChartExport(c, { dashaDepth: 3 });
// tab -> export key(s) that must exist
const map: Array<[string,string,string]> = [
  ['kundali','chart','lagna'],['avakahada','avakahada','lagna'],['vargas','chart','vargas'],
  ['navamsha','chart','vargas'],['sudarshana','sudarshana',''],['matching_bridge','matchingData',''],
  ['varshaphala','varshaphala',''],['planets','chart','planets'],['sphutas','chart','specialPoints'],
  ['bhavas','bhavaChalit',''],['bhava_bala','bhavaBala',''],['aspects','drishti',''],
  ['vimshottari','chart','vimshottari'],['extended_dashas','extendedDashas',''],
  ['jaimini','chart','jaimini'],['shadbala','chart','shadbala'],['phala','phala',''],
  ['ashtakavarga','chart','ashtakavarga'],['yogas','chart','yogas'],['doshas','chart','doshas'],
  ['remedies','remedies',''],['transits','transits',''],['panchanga','chart','panchanga'],
  ['prashna','prashna',''],['sarvatobhadra','sarvatobhadra',''],['kp','kp',''],
  ['sukshma','avasthas',''],['relationships','relationships',''],['samhita','eclipses',''],
  ['time_sensitivity','timeSensitivity',''],
];
let missing = 0;
for (const [tab, key, sub] of map) {
  const v = sub ? (e[key] as any)?.[sub] : (e as any)[key];
  const ok = v !== undefined && v !== null;
  if (!ok) { console.log(`  ✗ ${tab.padEnd(20)} → export.${key}${sub?'.'+sub:''} MISSING`); missing++; }
}
console.log(missing === 0 ? 'all 30 data tabs reach the export' : `${missing} missing`);
console.log('\ncorrectly excluded (not chart data):');
console.log('  reverse_panchanga, knowledge_base, indications');
