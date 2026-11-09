#!/usr/bin/env python3
"""
Fix Kemadruma cancellation to include kendra from Lagna.

The yoga's own definition (BPHS 37.14) says the affliction is cancelled when a
planet occupies a kendra from the Moon **or from the Lagna**, but the evaluate()
body only tested the Moon. A chart whose only relief sits in a kendra from the
Lagna was therefore reported as an uncancelled Kemadruma.
"""
import pathlib
import sys

P = pathlib.Path('lib/yogas/yoga-engine.ts')
if not P.exists():
    print('::error::lib/yogas/yoga-engine.ts not found')
    sys.exit(1)

s = P.read_text()

OLD = """        const planetsInKendraFromMoon = FIVE_TARA_GRAHAS.filter((p) => {
          const relH = getRelativeHouse(moon.house, ctx.planets[p]?.house);
          return isKendra(relH);
        });

        if (planetsInKendraFromMoon.length > 0) {
          return {
            isPresent: true,
            conditionsMet: [
              'No planets in 2nd or 12th from Moon',
              `Cancelled (Kemadruma-Bhaṅga) by presence of ${planetsInKendraFromMoon.join(', ')} in Kendra from Moon`,
            ],
            involvedPlanets: ['moon', ...planetsInKendraFromMoon],
            strengthRating: 'Cancelled',
          };"""

NEW = """        // Kemadruma-Bhanga (BPHS 37.14): a planet in a kendra from the Moon OR
        // from the Lagna cancels the affliction. Only the Moon branch was
        // tested before, so a chart relieved solely via the Lagna was reported
        // as uncancelled.
        const planetsInKendraFromMoon = FIVE_TARA_GRAHAS.filter((p) => {
          const relH = getRelativeHouse(moon.house, ctx.planets[p]?.house);
          return isKendra(relH);
        });
        const planetsInKendraFromLagna = FIVE_TARA_GRAHAS.filter(
          (p) => ctx.planets[p] && isKendra(ctx.planets[p].house)
        );
        const cancellingPlanets = [
          ...new Set([...planetsInKendraFromMoon, ...planetsInKendraFromLagna]),
        ];

        if (cancellingPlanets.length > 0) {
          return {
            isPresent: true,
            conditionsMet: [
              'No planets in 2nd or 12th from Moon',
              `Cancelled (Kemadruma-Bhaṅga) by ${cancellingPlanets.join(', ')} in a Kendra from the Moon or Lagna`,
            ],
            involvedPlanets: ['moon', ...cancellingPlanets],
            strengthRating: 'Cancelled',
          };"""

if OLD in s:
    s = s.replace(OLD, NEW)
    P.write_text(s)
    print('changed: kemadruma cancellation now checks Moon and Lagna')
elif 'planetsInKendraFromLagna' in s:
    print('already patched')
else:
    print('::error::kemadruma block not found')
    sys.exit(1)
