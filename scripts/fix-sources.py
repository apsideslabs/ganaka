#!/usr/bin/env python3
"""
Source corrections applied before every build.

Kept in the repository rather than inline in the workflow so the changes are
reviewable, and idempotent so re-running is always safe.
"""
import pathlib
import re
import sys

changed = []
missing = []


def patch(path, pairs):
    p = pathlib.Path(path)
    if not p.exists():
        missing.append(f'{path} (not found)')
        return
    s = p.read_text()
    orig = s
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new)
        elif new not in s:
            missing.append(f'{path}: {old[:70]!r}')
    if s != orig:
        p.write_text(s)
        changed.append(path)


# ---------------------------------------------------------------------------
# 1. Matching page: ISO date strings passed where a Date was expected.
#    GanakaDatePicker calls value.getFullYear(), so a string threw on render.
# ---------------------------------------------------------------------------
mp = pathlib.Path('components/matching/MatchingWorkspaceClient.tsx')
if mp.exists() and 'isoToDate' not in mp.read_text():
    helpers = '''
function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function dateToIso(date: Date | null): string {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
'''
    s = mp.read_text()
    s = s.replace('export function MatchingWorkspaceClient',
                  helpers + '\nexport function MatchingWorkspaceClient', 1)
    s = s.replace('<GanakaDatePicker value={groomDate} onChange={setGroomDate} />',
                  '<GanakaDatePicker value={isoToDate(groomDate)} onChange={(d) => setGroomDate(dateToIso(d))} />')
    s = s.replace('<GanakaDatePicker value={brideDate} onChange={setBrideDate} />',
                  '<GanakaDatePicker value={isoToDate(brideDate)} onChange={(d) => setBrideDate(dateToIso(d))} />')
    mp.write_text(s)
    changed.append(str(mp))


# ---------------------------------------------------------------------------
# 2. searchLocations consults the GeoNames index before the curated list.
# ---------------------------------------------------------------------------
patch('lib/astronomy/coordinates.ts', [
    ("""  const q = query.toLowerCase().trim();
  return CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  );""",
     """  const q = query.toLowerCase().trim();
  const indexed = searchIndexedCities(q, 40);
  if (indexed.length > 0) return indexed;
  return CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  );"""),
])

co = pathlib.Path('lib/astronomy/coordinates.ts')
if co.exists():
    s = co.read_text()
    imp = "import { searchIndexedCities } from './city-index';"
    before = s.count(imp)
    s = re.sub(r"import \{ searchIndexedCities \} from '\./city-index';\s*", '', s)
    s = imp + '\n' + s
    if s.count(imp) != 1:
        print('::error::failed to normalise city-index import')
        sys.exit(1)
    if before != 1:
        co.write_text(s)
        changed.append('lib/astronomy/coordinates.ts (import normalised)')


# ---------------------------------------------------------------------------
# 3. Shadbala: remove Math.random() from Drg Bala.
#    A random term made total strength, rank and ratio different on every page
#    load. Replaced with Parashari whole-sign drishti, which is deterministic.
# ---------------------------------------------------------------------------
patch('lib/shadbala/shadbala.ts', [
    ("""    // 6. DṚG BALA (Aspectual Strength)
    // Simplified aspectual summation
    const drigBala = 15.0 + Math.random() * 5.0; // normalized positive aspect balance""",
     """    // 6. DṚG BALA (Aspectual Strength)
    // Parāśari whole-sign dṛṣṭi, per BPHS ch. 26: every graha aspects the 7th
    // sign from itself; Mars also aspects the 4th and 8th, Jupiter the 5th and
    // 9th, Saturn the 3rd and 10th. Each aspect is worth 60 virūpas; benefics
    // add, malefics subtract, and the balance is divided by 4 as BPHS
    // prescribes. Fully deterministic - this previously used Math.random(),
    // which made every strength figure irreproducible.
    const ASPECT_HOUSES: Record<string, number[]> = {
      sun: [7],
      moon: [7],
      mercury: [7],
      venus: [7],
      mars: [4, 7, 8],
      jupiter: [5, 7, 9],
      saturn: [3, 7, 10],
    };
    // Jupiter and Venus are always benefic; Mercury and the Moon are benefic
    // when unafflicted, and the Moon additionally only while waxing.
    const moonWaxing = moonSunDiff <= 180;
    let drishtiSum = 0;
    for (const other of grahas) {
      if (other === pId) continue;
      const otherRashi = Math.floor(planetaryPositions[other].siderealLongitude / 30) + 1;
      const houseFromOther = (((pRashi - otherRashi + 12) % 12) + 1);
      if ((ASPECT_HOUSES[other] || [7]).includes(houseFromOther)) {
        const benefic =
          other === 'jupiter' ||
          other === 'venus' ||
          other === 'mercury' ||
          (other === 'moon' && moonWaxing);
        drishtiSum += benefic ? 60 : -60;
      }
    }
    const drigBala = Math.max(-60, Math.min(60, drishtiSum / 4));"""),

    # Sthāna bala: replace the unexplained +45 constant with a real Drekkāṇa
    # bala and an explicit zero for the unimplemented Saptavargaja bala.
    ("""    const sthanaBala = ucchaBala + kendradiBala + ojayugmaBala + 45.0; // sum of positional sub-balas""",
     """    // 1.4 Drekkāṇa Bala (BPHS 27.20): 15 virūpas when the planet occupies a
    // drekkāṇa of its own gender - male, female, neuter for the 1st, 2nd and
    // 3rd ten degrees.
    const drekkanaPart = Math.floor((pos.siderealLongitude % 30) / 10);
    const drekkanaGender = ['Male', 'Female', 'Neuter'][drekkanaPart];
    const drekkanaBala = prop.gender === drekkanaGender ? 15.0 : 0.0;

    // 1.5 Saptavargaja Bala (BPHS 27.6-27.19) is not implemented. It
    // contributes 0 rather than a fabricated constant, so totals read low
    // rather than plausible-but-invented.
    const saptavargajaBala = 0.0;

    const sthanaBala =
      ucchaBala + kendradiBala + ojayugmaBala + drekkanaBala + saptavargajaBala;"""),

    # Kāla bala: label the placeholder honestly instead of hiding it.
    ("""    const kalaBala = natonnataBala + pakshaBala + 30.0;""",
     """    // NOTE: Tribhāga, Varṣa, Māsa, Dina and Horā bala (BPHS 27.24-27.33) are
    // not implemented; they are omitted rather than approximated.
    const kalaBala = natonnataBala + pakshaBala;"""),
])


# ---------------------------------------------------------------------------
# 4. Keep generated data out of version control.
# ---------------------------------------------------------------------------
gi = pathlib.Path('.gitignore')
if gi.exists():
    t = gi.read_text()
    if 'public/data/' not in t:
        gi.write_text(t.rstrip() + '\npublic/data/\n')
        changed.append('.gitignore')

print('changed:', changed or 'none')
for m in missing:
    print(f'::warning::pattern not found -> {m}')
