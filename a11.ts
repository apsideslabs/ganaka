import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('charaKarakas:', JSON.stringify(c.jaimini.charaKarakas, null, 0).slice(0, 400));
console.log('\nkarakamshaRashi:', c.jaimini.karakamshaRashi, ' swamshaRashi:', c.jaimini.swamshaRashi);
