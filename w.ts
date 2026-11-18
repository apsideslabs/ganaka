import { yoniScore } from './lib/jyotisha/kuta/ashtakuta-calculator';
// Pairs the old herbivore heuristic got wrong.
const cases: Array<[string,string]> = [
  ['Tiger','Cow'], ['Serpent','Mongoose'], ['Dog','Deer'], ['Lion','Elephant'],
  ['Horse','Buffalo'], ['Cat','Rat'], ['Sheep','Monkey'],
  ['Tiger','Horse'], ['Lion','Horse'], ['Serpent','Dog'],
  ['Cow','Deer'], ['Horse','Deer'], ['Elephant','Sheep'],
];
for (const [a,b] of cases) console.log(`  ${a.padEnd(9)} vs ${b.padEnd(9)} = ${yoniScore(a,b)}`);
