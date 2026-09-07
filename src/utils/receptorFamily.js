// src/utils/receptorFamily.js

export const RECEPTOR_COLORS = {
  // Serotonergic (5-HT & SERT) - Light blue hues
  '5HT1A': '#38BDF8',
  '5HT1B': '#0EA5E9',
  '5HT1D': '#0284C7',
  '5HT2A': '#06B6D4',
  '5HT2C': '#0891B2',
  '5HT3': '#60A5FA',
  '5HT6': '#818CF8',
  '5HT7': '#3B82F6',
  'SERT': '#0284C7',

  // Dopaminergic (D & DAT) - Pink and soft pink hues
  'D1': '#F472B6',
  'D2': '#EC4899',
  'D3': '#DB2777',
  'D4': '#FB7185',
  'DAT': '#F43F5E',

  // Transporters - NET in brimstone yellow, others distinct
  'NET': '#CA8A04',
  'VMAT2': '#A855F7',
  'SV2A': '#2563EB',

  // Adrenergic - Yellowgreen hues
  'Alpha1': '#84CC16',
  'Alpha2A': '#65A30D',

  // Histaminergic - Light yellow hues
  'H1': '#EAB308',
  'H3': '#F59E0B',

  // Muscarinic - Teal / Turquoise hues
  'M1': '#0D9488',
  'M2': '#0F766E',
  'M3': '#14B8A6',
  'M4': '#06B6D4',

  // GABA & Glutamate - Purple (GABA) vs Orange (Glutamate)
  'GABAA': '#7C3AED',
  'GABAB': '#6D28D9',
  'NMDA': '#EA580C',
  'AMPA': '#F97316',

  // Opioid & Neuropeptides - Ruby/Crimson (Opioids) vs Violet/Indigo/Ochre
  'MOR': '#E11D48',
  'KOR': '#BE123C',
  'DOR': '#9F1239',
  'CGRP': '#E11D48',
  'OX1R_OX2R': '#4F46E5',
  'MT1MT2': '#9333EA',
  'Sigma1': '#D97706',

  // Voltage-Gated Ion Channels - Red / Coral / Magenta
  'Nav': '#DC2626',
  'Cav': '#B91C1C',
  'hERG': '#C026D3',
  'RyR1': '#991B1B',

  // Enzymes - Emerald (Cholinesterase) & Amber/Bronze (MAO/ALDH)
  'AChE': '#059669',
  'BuChE': '#047857',
  'MAO-A': '#B45309',
  'MAO-B': '#92400E',
  'ALDH': '#78350F',
}

export const RECEPTOR_FAMILIES = [
  {
    id: 'Serotonergic',
    name: 'Serotonin (5-HT & SERT)',
    shortName: '5-HT Serotonin',
    color: '#0EA5E9', // Light Blue
    description: 'Mood, anxiety, cognition, impulsivity, and sleep architecture',
  },
  {
    id: 'Dopaminergic',
    name: 'Dopamine (D & DAT)',
    shortName: 'D Dopamine',
    color: '#EC4899', // Pink
    description: 'Motivation, reward, motor gating, and prefrontal executive function',
  },
  {
    id: 'Transporters',
    name: 'Transporters (NET / VMAT2 / SV2A)',
    shortName: 'Transporters',
    color: '#CA8A04', // Brimstone Yellow / Transporters
    description: 'Presynaptic monoamine reuptake clearance and vesicular packaging',
  },
  {
    id: 'Adrenergic',
    name: 'Adrenergic (α/β)',
    shortName: 'Adrenergic',
    color: '#84CC16', // Yellowgreen
    description: 'Arousal, blood pressure tone, vigilance, and autonomic feedback',
  },
  {
    id: 'Histaminergic',
    name: 'Histamine (H)',
    shortName: 'Histamine',
    color: '#EAB308', // Light Yellow
    description: 'Wakefulness, sedation threshold, appetite, and metabolic regulation',
  },
  {
    id: 'Muscarinic',
    name: 'Muscarinic (M)',
    shortName: 'Muscarinic',
    color: '#0D9488', // Teal / Turquoise
    description: 'Parasympathetic tone, secretions, memory, and striatal balance',
  },
  {
    id: 'GABA & Glutamate',
    name: 'GABA & Glutamate',
    shortName: 'GABA/Glutamate',
    color: '#7C3AED', // Royal Purple
    description: 'Major inhibitory (GABA) and excitatory (Glutamate) neurotransmission',
  },
  {
    id: 'Opioid & Neuropeptides',
    name: 'Opioid & Neuropeptides',
    shortName: 'Opioids/Peptides',
    color: '#E11D48', // Ruby Crimson / Peptides
    description: 'Endorphin hedonic tone, analgesia, circadian timing, and orexin gating',
  },
  {
    id: 'Enzymes & Channels',
    name: 'Enzymes & Ion Channels',
    shortName: 'Enzymes/Channels',
    color: '#DC2626', // Red / Emerald
    description: 'Voltage-gated cardiac/neuronal channels, monoamine catabolism, and release',
  }
]

export const categorizeReceptor = (recId) => {
  const u = (recId || '').toUpperCase()
  if (u.startsWith('5HT') || u.startsWith('5-HT') || u === 'SERT') return 'Serotonergic'
  if ((u.startsWith('D') && ['D1', 'D2', 'D3', 'D4', 'D5'].includes(u)) || u === 'DAT') return 'Dopaminergic'
  if (['NET', 'VMAT2', 'SV2A'].includes(u)) return 'Transporters'
  if (u.startsWith('ALPHA') || u.startsWith('BETA') || u.startsWith('Α') || u.startsWith('Β')) return 'Adrenergic'
  if (['H1', 'H2', 'H3', 'H4'].includes(u)) return 'Histaminergic'
  if (['M1', 'M2', 'M3', 'M4', 'M5'].includes(u)) return 'Muscarinic'
  if (u.includes('GABA') || ['NMDA', 'AMPA'].includes(u)) return 'GABA & Glutamate'
  if (['MOR', 'KOR', 'DOR', 'SIGMA1', 'OX1R_OX2R', 'MT1MT2', 'CGRP'].includes(u)) return 'Opioid & Neuropeptides'
  return 'Enzymes & Channels'
}

export const getReceptorFamily = (recId) => {
  const famId = categorizeReceptor(recId)
  return RECEPTOR_FAMILIES.find(f => f.id === famId) || RECEPTOR_FAMILIES[8]
}

export const getReceptorColor = (recId) => {
  if (RECEPTOR_COLORS[recId]) return RECEPTOR_COLORS[recId]
  const fam = getReceptorFamily(recId)
  return fam ? fam.color : '#0EA5E9'
}

export const getReceptorFamilyColor = (recId) => {
  return getReceptorColor(recId)
}

export const DOMAIN_RECEPTOR_MAP = [
  {
    pattern: /sedat|somnol|drowsi|sleep/i,
    receptors: ['H1', 'Alpha1', 'M1', '5HT2A'],
    mechanism: 'H₁ / α₁ antagonism',
  },
  {
    pattern: /weight|metabol|hyperphag|insulin|lipid|glucose|diabetes|triglyceride/i,
    receptors: ['H1', '5HT2C', 'M3'],
    mechanism: 'H₁ + 5-HT₂c blockade',
  },
  {
    pattern: /anticholinergic|constipat|gastric|dry mouth/i,
    receptors: ['M1', 'M3', 'M2'],
    mechanism: 'M₁ / M₃ antagonism',
  },
  {
    pattern: /orthosta|hypotension|dizzin|syncope/i,
    receptors: ['Alpha1', 'Alpha2A'],
    mechanism: 'α₁ adrenergic blockade',
  },
  {
    pattern: /extrapyramidal|eps|parkinson|rigid|dyston|akathisi|tardive/i,
    receptors: ['D2', '5HT2A'],
    mechanism: 'Striatal D₂ block vs 5-HT₂A',
  },
  {
    pattern: /prolactin/i,
    receptors: ['D2'],
    mechanism: 'Tuberoinfundibular D₂ block',
  },
  {
    pattern: /qtc|cardiac|torsade/i,
    receptors: ['hERG'],
    mechanism: 'hERG (IKr) channel block',
  },
  {
    pattern: /seizur|convuls/i,
    receptors: ['GABAA', 'H1'],
    mechanism: 'Cortical threshold modulation',
  },
  {
    pattern: /nausea|vomit|diarrhea|dyspepsia|gastrointestinal|gi distress/i,
    receptors: ['5HT3', 'SERT'],
    mechanism: '5-HT₃ / SERT stimulation',
  },
  {
    pattern: /sexual|anorgasm|erectile|impoten/i,
    receptors: ['5HT2A', 'SERT', 'Alpha1'],
    mechanism: '5-HT₂A / SERT stimulation',
  },
  {
    pattern: /insomnia|activat|agitat|anxiety|restless/i,
    receptors: ['NET', 'DAT', '5HT2A'],
    mechanism: 'Noradrenergic / dopaminergic tone',
  },
  {
    pattern: /tachycardia|pulse|blood pressure|hypertension|sweat|diaphore/i,
    receptors: ['NET', 'Alpha1', 'M2'],
    mechanism: 'Noradrenergic excess / vagolytic',
  },
  {
    pattern: /urinary|retention|hesitancy/i,
    receptors: ['M3', 'Alpha1'],
    mechanism: 'M₃ detrusor block / α₁ tone',
  }
]

export const getDomainReceptorTies = (domainName, drugReceptors = []) => {
  if (!domainName) return null
  const match = DOMAIN_RECEPTOR_MAP.find(m => m.pattern.test(domainName))
  if (!match) return null

  const drugRecIds = new Set((drugReceptors || []).map(r => (r.receptor || '').toUpperCase()))
  const matchedRecs = match.receptors.filter(rid => drugRecIds.has(rid.toUpperCase()))

  const targetRecs = matchedRecs.length > 0 ? matchedRecs : match.receptors.slice(0, 2)

  return targetRecs.map(rid => ({
    id: rid,
    color: getReceptorColor(rid),
    mechanism: match.mechanism,
  }))
}
