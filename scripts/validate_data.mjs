// scripts/validate_data.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.resolve(__dirname, '..', 'src', 'data.json')

console.log('--- Clinical Drug Data Integrity Validator ---')
console.log(`Reading dataset from: ${DATA_PATH}`)

if (!fs.existsSync(DATA_PATH)) {
  console.error(`FAIL: File not found: ${DATA_PATH}`)
  process.exit(1)
}

const raw = fs.readFileSync(DATA_PATH, 'utf-8')
let data
try {
  data = JSON.parse(raw)
} catch (e) {
  console.error(`FAIL: Invalid JSON syntax: ${e.message}`)
  process.exit(1)
}

const drugs = data.drugs || []
console.log(`Total drug records: ${drugs.length}`)

let errors = []
let warnings = []

// Guard 1: Record count
if (drugs.length !== 179) {
  errors.push(`Expected exactly 179 drug records, found ${drugs.length}`)
}

// Allowed clinical dose ending suffixes / qualifiers
const VALID_DOSE_ENDINGS = [
  'mg', 'mg/day', 'mg/d', 'g', 'g/day', 'g/night', 'mcg', 'mcg/day', 'mcg/kg/hr',
  'mEq/L', 'mL', 'mL/day', 'drops', 'tablets', 'capsules', 'doses', 'dose',
  'BID', 'TID', 'QID', 'QHS', 'QAM', 'daily', 'bolus', 'needed', 'prn',
  'hours', 'hr', 'h', 'days', 'weeks', 'infusion', 'film', 'patch',
  'TDM', 'ER', 'XR', 'IR', 'ODT', 'LAI', 'OROS',
  'Lumryz', 'Extended-Release', 'Bipolar I', 'Bipolar Depression', 'Negative Symptoms',
  'Trigeminal Neuralgia', 'Seizures', 'Impulsivity', 'Essential Tremor',
  'Encephalopathy', 'Syndrome', 'Administration', 'Therapy', 'Disease',
  'Tourette', 'Fibromyalgia', 'Pain', ')', '.'
]

const countChar = (str, ch) => (str.match(new RegExp(`\\${ch}`, 'g')) || []).length

for (const drug of drugs) {
  const id = drug.id || 'UNKNOWN'

  // --- A1 Dose Guard ---
  for (const field of ['targetDose', 'maxDose']) {
    const val = drug[field]
    if (val && typeof val === 'string') {
      const trimmed = val.trim()

      // Unbalanced parentheses
      const openParens = countChar(trimmed, '(')
      const closeParens = countChar(trimmed, ')')
      if (openParens !== closeParens) {
        errors.push(`[A1] ${id}.${field}: unbalanced parentheses (${openParens} '(' vs ${closeParens} ')'): "${val}"`)
      }

      // Trailing soft hyphen or hyphen indicating truncated word
      if (/[\xad\-]\s*$/.test(trimmed) || /[\xad]/.test(trimmed)) {
        errors.push(`[A1] ${id}.${field}: contains soft hyphen or trailing hyphen: "${val}"`)
      }

      // Abrupt bare number ending (e.g. "Off-label to 30")
      if (/\b\d+\s*$/.test(trimmed)) {
        errors.push(`[A1] ${id}.${field}: ends abruptly on a bare number with no clinical unit: "${val}"`)
      }

      // Ends without recognized clinical unit/qualifier
      if (field === 'maxDose' && trimmed.length > 0) {
        const hasValidEnding = VALID_DOSE_ENDINGS.some(end => {
          const lower = trimmed.toLowerCase()
          return lower.endsWith(end.toLowerCase()) || lower.endsWith(end.toLowerCase() + '.') || lower.endsWith(end.toLowerCase() + ')')
        })
        if (!hasValidEnding) {
          errors.push(`[A1] ${id}.${field}: does not end with recognized clinical unit/qualifier: "${val}"`)
        }
      }
    }
  }

  // --- A5 INN Guard ---
  if (!drug.inn) {
    errors.push(`[A5] ${id}: missing required 'inn' field`)
  } else if (typeof drug.inn !== 'string') {
    errors.push(`[A5] ${id}: 'inn' field must be a string`)
  } else {
    if (drug.inn !== drug.inn.toLowerCase()) {
      errors.push(`[A5] ${id}: 'inn' must be strictly lowercase: "${drug.inn}"`)
    }
    if (/\s/.test(drug.inn)) {
      errors.push(`[A5] ${id}: 'inn' must be hyphenated without spaces: "${drug.inn}"`)
    }
  }
}

// --- Specific drug checks ---
const findDrug = (id) => drugs.find(d => d.id === id)

// A1: Specific truncated values
const olanzapine = findDrug('olanzapine')
if (olanzapine && olanzapine.maxDose && olanzapine.maxDose.includes('Off-label to 30') && !olanzapine.maxDose.includes('30 mg')) {
  errors.push(`[A1] olanzapine.maxDose still truncated at 30: "${olanzapine.maxDose}"`)
}
const aripiprazole = findDrug('aripiprazole')
if (aripiprazole && aripiprazole.maxDose && aripiprazole.maxDose.endsWith('/')) {
  errors.push(`[A1] aripiprazole.maxDose still ends with slash: "${aripiprazole.maxDose}"`)
}
const paliperidone = findDrug('paliperidone')
if (paliperidone && paliperidone.maxDose && paliperidone.maxDose.endsWith('(OROS')) {
  errors.push(`[A1] paliperidone.maxDose still truncated at (OROS: "${paliperidone.maxDose}"`)
}
const oxybate = findDrug('sodium-oxybate')
if (oxybate && oxybate.maxDose && oxybate.maxDose.endsWith('(or Once-Nightly')) {
  errors.push(`[A1] sodium-oxybate.maxDose still truncated at (or Once-Nightly: "${oxybate.maxDose}"`)
}

// A2: Missing clearance pathways
const ziprasidone = findDrug('ziprasidone')
if (ziprasidone) {
  const cypStr = JSON.stringify(ziprasidone.cyp450 || {})
  if (!cypStr.toLowerCase().includes('aldehyde oxidase')) {
    errors.push(`[A2] ziprasidone: missing dominant clearance pathway 'Aldehyde Oxidase' in cyp450/clearance`)
  }
}

const lumateperone = findDrug('lumateperone')
if (lumateperone) {
  const cypStr = JSON.stringify(lumateperone.cyp450 || {})
  if (!cypStr.toLowerCase().includes('ugt')) {
    errors.push(`[A2] lumateperone: missing clearance pathway 'UGT' in cyp450/clearance`)
  }
}

// A3: Known negatives vs unknown distinction
const amisulpride = findDrug('amisulpride')
if (amisulpride) {
  if (!amisulpride.cyp450 || (!amisulpride.cyp450.note && !amisulpride.cyp450.clearanceNote)) {
    errors.push(`[A3] amisulpride: must record positive clinical fact of minimal CYP / renal clearance note`)
  }
}
const pali = findDrug('paliperidone')
if (pali) {
  if (!pali.cyp450 || (!pali.cyp450.note && !pali.cyp450.clearanceNote)) {
    errors.push(`[A3] paliperidone: must record positive clinical fact of non-CYP / renal clearance note`)
  }
}

// A4: Cariprazine parent/metabolite distinction
const cariprazine = findDrug('cariprazine')
if (cariprazine) {
  const hl = cariprazine.halfLife || ''
  if (!hl.toLowerCase().includes('day') || !hl.toLowerCase().includes('week')) {
    errors.push(`[A4] cariprazine.halfLife must preserve both parent (2-4 days) and active metabolite (1-3 weeks): "${hl}"`)
  }
  if (!cariprazine.halfLifeParent) {
    errors.push(`[A4] cariprazine: missing structured 'halfLifeParent' field`)
  }
  if (!cariprazine.halfLifeActiveMetabolites) {
    errors.push(`[A4] cariprazine: missing structured 'halfLifeActiveMetabolites' field`)
  }
}

// Report
if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`)
  for (const w of warnings) console.warn(`  ⚠️  ${w}`)
}

if (errors.length > 0) {
  console.error(`\nValidation FAILED with ${errors.length} error(s):`)
  for (const err of errors) console.error(`  ❌ ${err}`)
  process.exit(1)
}

console.log('\nAll clinical data integrity checks PASSED successfully!')
process.exit(0)
