import { calculateYoniKuta } from './lib/jyotisha/kuta/ashtakuta-calculator';
const p = (n: number) => ({ rashiNumber: 1, rashiLord: 'mars' as any, rashiName: 'Mesha', nakshatraIndex: n-1, nakshatraNumber: n, nakshatraName: 'x', nakshatraPada: 1 as const, longitude: 0 });
// Magha (10) is Rat. Against Ashlesha (9, Cat) it is a mahavaira pair -> 0.
console.log('Magha vs Ashlesha (Rat vs Cat, mahavaira):', calculateYoniKuta(p(10), p(9)).obtainedScore, '/4');
// Before the fix Magha was Lion, which is NOT the Cat's enemy, so it scored 2.
console.log('  (before the fix this scored 2, because Magha was wrongly the Lion)');
console.log('Magha vs Bharani (Rat vs Elephant):', calculateYoniKuta(p(10), p(2)).obtainedScore, '/4');
console.log('Dhanishtha vs Bharani (Lion vs Elephant, mahavaira):', calculateYoniKuta(p(23), p(2)).obtainedScore, '/4');
