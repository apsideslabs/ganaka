import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const av = c.ashtakavarga;
console.log('ashtakavarga keys:', Object.keys(av));
console.log('sav keys:', Object.keys(av.sav ?? {}));
console.log('bav keys:', Object.keys(av.bav ?? {}));
const first: any = av.bav?.['sun'];
console.log('sun bav shape:', first ? Object.keys(first) : 'none');
console.log(JSON.stringify(first).slice(0, 300));
