import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const m = c.planets.moon;
console.log('Moon:', m.siderealLongitude.toFixed(4), '=', m.rashiName, (m.siderealLongitude%30).toFixed(3), 'nak', m.nakshatraName, 'pada', m.pada);
// Manual Vimshottari balance
const NAK = 360/27;
const idx = Math.floor(m.siderealLongitude / NAK);
const elapsed = (m.siderealLongitude - idx*NAK) / NAK;
const LORD = ['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];
const YEARS = [7,20,6,10,7,18,16,19,17];
const lord = LORD[idx % 9];
const bal = YEARS[idx % 9] * (1 - elapsed);
console.log(`\nManual: nak#${idx+1} lord ${lord}, ${(elapsed*100).toFixed(2)}% elapsed → balance ${bal.toFixed(4)} years`);
const v: any = c.vimshottari;
const first = v.tree?.[0];
console.log('Engine: first mahādaśā', first?.lord, first?.startDate?.slice(0,10), '→', first?.endDate?.slice(0,10));
console.log('Engine balance field:', JSON.stringify({ balanceYears: v.balanceYears, lord: v.balanceLord, first: first?.lord }).slice(0,200));
if (first) {
  const yrs = (new Date(first.endDate).getTime() - new Date(first.startDate).getTime()) / (365.2425*864e5);
  console.log(`First period length: ${yrs.toFixed(4)} years  (manual balance ${bal.toFixed(4)})  ${Math.abs(yrs-bal)<0.01?'✓':'✗'}`);
}
