import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('chart keys:', Object.keys(c).join(', '));
console.log('\njaimini:', c.jaimini ? Object.keys(c.jaimini) : 'ABSENT');
