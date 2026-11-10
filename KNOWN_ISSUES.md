# Known issues

Everything below was measured against an independent reference, not assumed.
The method is stated so each claim can be reproduced.

## 1. Ephemeris accuracy

The engine originally computed every body from a two-body Kepler orbit with
linear secular elements, which ignores planetary perturbations, and the Moon from
a 17-term series. That has been replaced:

* **Mercury, Venus, Mars, Jupiter, Saturn** — VSOP87 (Bretagnon & Francou 1988),
truncated so the heliocentric longitude stays within 0.15" of the full series
over 1900–2100.
* **Moon** — ELP2000-82B truncated as tabulated by Meeus, *Astronomical
Algorithms* ch. 47: 60 longitude/distance terms, 60 latitude terms, the
eccentricity factor E, and the A1/A2/A3 additive terms.
* **Sun** — unchanged; it was already the most accurate body.

Measured against PyEphem (which agrees with the Swiss Ephemeris and with
Jagannatha Hora to ~30"), worst case over five instants spanning 1950–2050:

| Body | Before | After |
|---|---|---|
| Sun | 9" | 9" |
| Moon | 128" | **77"** |
| Mercury | 1436" | **35"** |
| Venus | 2923" | **46"** |
| Mars | 2478" | **23"** |
| Jupiter | 2815" | **27"** |
| Saturn | 3078" | **19"** |

The Lahiri ayanāṁśa for 2009-03-03 comes out at 23.987178° against Jagannatha
Hora's 23.985195° — 7.1", which validates the ayanāṁśa base and the solar
theory together.

`scripts/check-ephemeris.py` re-runs this comparison on every build and fails
if any body exceeds 120". It bundles the real TypeScript with esbuild, so it
tests the code that actually ships.

### What remains

* Positions are **geometric** — no light-time correction, no annual aberration,
no nutation. For sidereal astrology this is the usual convention, but it differs
from an apparent-place ephemeris by up to ~20".
* **Rahu/Ketu** use a mean-node formula, not the true node. The mean node is
accurate against its own definition; the true node oscillates ±1.7° around it.
Both are offered, so this is a choice rather than an error, but the default
should be understood.
* **Uranus, Neptune, Pluto** are still on Kepler orbits and are not covered by
the accuracy check.

## 2. Ṣaḍbala

`Math.random()` was removed from Dṛg Bala — it previously made total strength,
ratio and rank different on every page load. Dṛg Bala is now Parāśari whole-sign
dṛṣṭi (BPHS ch. 26), and the build fails if `Math.random` reappears in real code
anywhere in `lib/`.

The two hardcoded placeholders are also gone: a bare `+45` in Sthāna Bala and a
bare `+30` in Kāla Bala, which stood in for components that were never written.
They have been replaced by actual implementations:

| Component | BPHS | Status |
|---|---|---|
| Uccha Bala | 27.1–27.5 | implemented |
| **Saptavargaja Bala** | 27.2–27.3 | **implemented** — 7 vargas (D1, D2, D3, D7, D9, D12, D30), Mūlatrikoṇa 45 → Adhiśatru **2**, the values stated in BPHS 27.3 as bhūtasaṃkhyā word-numerals (भूताब्धयः खाग्निनखास्तिथ्यो दश युगाः कराः). Raman's 22.5/7.5/3.75/1.875 is a modern variant and is **not** in the verse. |
| Ojayugma Bala | 27.5 | **corrected** — a quarter rūpa (15 virūpas) for a favourable parity, scored **twice**: once on the rāśi and once on the navāṃśa (समभांशे), maximum 30 |
| Kendrādi Bala | 27.21 | implemented |
| Drekkāṇa Bala | 27.6 | **corrected** — the decanate genders were transposed (आद्यमध्यावसानेषु … पुंनपुंसकयोषाख्याः: masculine, neuter, feminine) |
| Dig Bala | 27.22 | implemented |
| Natonnata Bala | 27.23 | **implemented** — now scales with distance from solar noon instead of a binary day/night switch |
| Paksha Bala | 27.24 | implemented, **with the Moon's doubling** |
| **Tribhāga Bala** | 27.25 | **implemented** — day thirds Mercury/Sun/Moon, night thirds Moon/Venus/Mars |
| **Dina Bala** | 27.28 | **implemented** — 45 virūpas to the weekday lord |
| **Horā Bala** | 27.29 | **implemented** — 60 virūpas to the planetary hour lord |
| **Ayana Bala** | 27.30–27.33 | **implemented** — from the planet's declination |
| Ceṣṭā Bala | 27.34 | implemented; the Sun's is its Ayana Bala and the Moon's its Paksha Bala, per BPHS |
| Naisargika Bala | 27.35 | implemented |
| Dṛg Bala | 27.36 | implemented |
| **Varṣa Bala / Māsa Bala** | 27.26–27.27 | **implemented** — 15 and 30 virūpas to the weekday lord of the solar-year and solar-month ingress, found by bisection on the Sun's sidereal longitude |
| **Yuddha Bala** | 27.37 | **still zero** — planetary war; applies only within one degree and is omitted rather than guessed |

Ceṣṭā Bala now uses the classical seeghrocha method of BPHS 27.24-25 for Mars
through Saturn: the cheṣṭā kendra is the seeghrocha minus the mean of the
planet's mean and true longitudes, folded to 180° and divided by 3. Mars,
Jupiter and Saturn take the mean Sun as their seeghrocha; Mercury and Venus take
their own heliocentric mean longitude as the seeghrocha and the mean Sun as
their mean position. Mean longitudes come from the JPL approximate elements,
and the sidereal true longitude is converted to tropical before use.

The formula reproduces all five of B. V. Raman's printed cheṣṭā balas
(Graha and Bhava Balas, ch. VI) to within 0.18 virūpa, the residual being his
rounding to arcminutes. The deploy re-runs that comparison and fails if any
value drifts more than 0.25 virūpa.

The Sun's cheṣṭā bala is its Ayana Bala and the Moon's is its Paksha Bala, as
BPHS 27.18 requires.

Varṣa Bala (15 virūpas) and Māsa Bala (30 virūpas), BPHS 27.26-27, are now
awarded to the lord of the weekday on which the solar year and solar month
began. The ingress instants are found by bisection on the Sun's sidereal
longitude, not by linear extrapolation: the Sun's speed varies from 0.953 to
1.019 deg/day, so a straight-line estimate over ~320 days can be several days
out and land on the wrong weekday.

Weekdays for Dina, Horā, Varṣa and Māsa bala are now taken in **local civil
time**. They previously used the Julian-day weekday, which is UT-based, so a
02:00 IST birth was being scored as the previous day.

**Yuddha Bala** (planetary war), BPHS 27.20 and ch. 81 v. 9, is now implemented.
Only the five star grahas fight — the Sun, the Moon and the nodes never do. Two
within one degree of longitude are at war; **Venus always wins**, whether north
or south, and among the rest the planet **farther north in latitude** wins. The
victor gains the difference of the two ṣaḍbalas and the vanquished loses it, so
the adjustments sum to zero. Where three are within a degree each pair is its
own war and a planet's adjustment is the sum over its pairs.

Two caveats worth stating. The war condition uses **zodiacal longitude**, which
is what most implementations use; Ernst Wilhelm argues from Varāhamihira and the
Sūrya Siddhānta that it should be **apparent** longitude, which can differ by
several degrees near the horizon. And the victor rule is genuinely contested in
the literature — some texts use the brighter rays, some the lower longitude.
This implementation follows BPHS ch. 81 v. 9 as translated by Santhanam.

**Ṣaḍbala is now complete**: every component in BPHS ch. 27 is implemented.

Because Varṣa, Māsa and Yuddha are absent, totals still read slightly low, so
comparisons against `requiredRupas` remain conservative.

## 3. Verified correct

Checked formula by formula against the texts:

* **Vimśottarī** — 120-year cycle, Ketu-first order, antardaśā (M×A)/120 and
  pratyantardaśā (AD×P)/120.
* **D1, D2, D3, D9, D30, D60** — match BPHS ch. 6, including the five unequal
  Triṃśāṃśa divisions on odd and even signs.
* **Aṣṭakavarga** — all 64 benefic-place rules diffed against PyJHora and
  arbitrated by BPHS ch. 66, Saravali, Phaladeepika ch. 23, B. V. Raman and
  M. S. Mehta. Ganaka is right; PyJHora is wrong on four rows (Moon from Moon,
  Moon from Mars, Moon from Jupiter, Venus from Mars). Each difference is an
  equal-length swap, so the 337 total is unaffected and only the per-sign
  distribution reveals it.
* **Tithi** — (Moon − Sun)/12, 30 tithis.
* **Aṣṭakūṭa Varṇa** — 1 point when groom's varṇa ≥ bride's.

## 4. Verified against the texts and against reference output

Every layer below was checked by running the real TypeScript (bundled with
esbuild) and comparing against an independent engine or the printed text.

**Jaimini** — kārakas and arūḍhas both match Jagannatha Hora exactly for the
reference chart (3 Mar 2009, 23:51 IST, Baghmara):

* Chara kārakas, 8-kāraka scheme: AK Mercury, AmK Mars, BK Saturn, MK Venus,
  PiK Sun, PK Jupiter, GK Rāhu, DK Moon — 8 of 8.
* Arūḍhas: A1 Pisces, A2 Aquarius, A7 Capricorn, A10 Taurus, A12 Leo — 5 of 5.
* Rahu's degree is reversed (30 − deg) as required; arūḍha padas apply the
  same-sign → 10th and 7th → 4th exceptions correctly.

**Muhūrta** — 21 mahādoṣa rules present.

* Rāhu Kāla, Yamagaṇḍa and Gulika day-division tables all match the classical
  weekday orders.
* Dagdha tithi matches Muhurta Cintāmaṇi exactly (12th Sun, 11th Mon, 5th Tue,
  3rd Wed, 6th Thu, 8th Fri, 9th Sat).
* Yamaghaṇṭa yoga matches Muhurta Cintāmaṇi 1.9 exactly (Maghā Sun, Viśākhā
  Mon, Ārdrā Tue, Mūla Wed, Kṛttikā Thu, Rohiṇī Fri, Hastā Sat). The text uses
  "Yamaghaṇṭa" for both a weekday-star yoga and a part of the day; Ganaka
  implements both as separate rules, which is correct.

**Yogas** — 120 rules. All the classical sets are complete: 5 Pañca
Mahāpuruṣa, 20 Nābhāsa Ākṛti, 7 Nābhāsa Saṅkhyā, 3 Āśraya, 2 Dala.

* Conditions match BPHS: Rucaka (Mars, own/exaltation, kendra), Hamsa,
  Mālavya, Śaśa, Bhadra, Gajakesarī, Kemadruma, Saṅkhyā (occupied-sign count).
* Running the engine on the reference chart gives results consistent with the
  chart's independently established facts: Mars exalted in Capricorn (Mṛdaṅga),
  Jupiter debilitated with Nīcabhāṅga, Mahāparivartana between the 4th and 10th
  lords, and a Jaimini Rāja Yoga from the AK/AmK conjunction.

**Aṣṭakūṭa matching** — reproduces the site's own output exactly:
1 / 0.5 / 1.5 / 2 / 3 / 6 / 7 / 8 = 29 of 36, with every kūṭa's maximum
correct (1, 2, 3, 4, 5, 6, 7, 8).

**Prediction layer** — 23 canonical rules, each carrying a text and
chapter/verse citation; no chart-specific hardcoding anywhere in `lib/`.

### Defect found and fixed

Kemadruma's cancellation checked only a kendra from the **Moon**, while the
yoga's own definition (BPHS 37.14) says Moon **or Lagna**. A chart relieved
solely via the Lagna was reported as uncancelled. Fixed.

## 5. Automated guards

The deploy fails unless all of these hold:

* every body within 120" of PyEphem, and the Lahiri ayanāṁśa within 0.02° of
  Jagannatha Hora's value;
* ṣaḍbala totals finite and in range, with the exalted Moon out-ranking the
  debilitated Jupiter;
* the eight chara kārakas and five sampled arūḍhas equal the Jagannatha Hora
  values;
* no `Math.random` in real code anywhere in `lib/`.

What is still missing is a fixture harness over the remaining jyotiṣa modules
(Muhūrta scoring weights, the deeper Jaimini dashas, the prediction layer's
output text). Those are verified for *rules*, not for *output*.

## 6. No licence

No licence file is present. Until one is added, default copyright applies.

## 3. Citations

Every formula in `lib/` now carries a chapter-and-verse citation, and the yoga
citations were audited against the Sanskrit chapter texts. Three families of
error were found and fixed:

* **Mechanical verse runs that were never looked up.** BPHS ch. 35 stepped one
  verse per yoga (35.17 … 35.28) although the Vāpī definition is BPHS 35.12;
  BPHS ch. 75 stepped three per Mahāpuruṣa yoga although all five share 75.1–2;
  Phaladīpikā ch. 6 stepped one per house-yoga although the twelve share 6.57.
* **Citations pointing at the wrong verse entirely.** Amalakīrti cited 36.10
  (it is 36.5); `dhana_5_9` cited 41.8 (the 9th-and-5th-lords verse is 41.16);
  Lakshmi cited BPHS ch. 42, which is the *poverty* chapter.
* **A verse attributed to BPHS that is not BPHS.** The Vāpī śloka now quoted is
  the actual 35.12.

Of 120 cited yogas: **25 are pinned to a checked verse**, **9 are explicitly
marked `verse unverified`**, and the rest cite at chapter level. No citation
claims a verse number that has not been checked. A chapter citation is true in
every edition; BPHS exists with 71, 97 and other chapter counts, so a bare verse
number is meaningless without naming the edition.

`tests/run.ts` guards the corrected citations so they cannot silently regress.

## 4. Aṣṭakavarga recension

The tables were labelled "BPHS ch. 66" but were in fact the **Bṛhat Jātaka
ch. 13** reading. The two differ in exactly four cells and both total 337, so a
checksum cannot tell them apart. Both are now carried:

```ts
calculateAshtakavarga(rashiMap, lagna, { recension: 'parashara' | 'varahamihira' })
```

Pārāśara (BPHS 66) is the default; Mihira is selectable from Platform Settings.

## 5. D11 Rudrāṃśa

The start sign was computed one sign early (`13 - rashi - 1` instead of
`13 - rashi`), misplacing every planet in every D11 chart. Verified against
published worked examples; four of four now reproduce.
