import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:24, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' });
console.log('doshas rows      :', (c.doshas?.evaluatedDoshas||[]).filter((d:any)=>d.formationStatus!=='Not Formed').length);
console.log('yogas rows       :', (c.yogas||[]).length);
console.log('vimshottari tree :', (c.vimshottari?.tree||[]).length);
console.log('vargas           :', Object.keys(c.vargas||{}).length);
console.log('ashtakavarga bav :', Object.keys(c.ashtakavarga?.bav||{}).length);
