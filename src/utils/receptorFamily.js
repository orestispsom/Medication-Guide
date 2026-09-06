// src/utils/receptorFamily.js

export const RECEPTOR_FAMILIES = [
  {
    id: 'Serotonergic',
    name: 'Serotonin (5-HT)',
    shortName: '5-HT Serotonin',
    color: '#10B981', // Emerald Green
    description: 'Mood, anxiety, cognition, impulsivity, and sleep architecture',
  },
  {
    id: 'Dopaminergic',
    name: 'Dopamine (D)',
    shortName: 'D Dopamine',
    color: '#8B5CF6', // Violet / Purple
    description: 'Motivation, reward, motor gating, and prefrontal executive function',
  },
  {
    id: 'Transporters',
    name: 'Transporters (SERT/NET/DAT)',
    shortName: 'Transporters',
    color: '#3B82F6', // Sapphire Blue
    description: 'Presynaptic monoamine reuptake clearance and vesicular packaging',
  },
  {
    id: 'Adrenergic',
    name: 'Adrenergic (α/β)',
    shortName: 'Adrenergic',
    color: '#EF4444', // Crimson Red
    description: 'Arousal, blood pressure tone, vigilance, and autonomic feedback',
  },
  {
    id: 'Histaminergic',
    name: 'Histamine (H)',
    shortName: 'Histamine',
    color: '#F59E0B', // Amber / Warm Orange
    description: 'Wakefulness, sedation threshold, appetite, and metabolic regulation',
  },
  {
    id: 'Muscarinic',
    name: 'Muscarinic (M)',
    shortName: 'Muscarinic',
    color: '#06B6D4', // Cyan / Teal
    description: 'Parasympathetic tone, secretions, memory, and striatal balance',
  },
  {
    id: 'GABA & Glutamate',
    name: 'GABA & Glutamate',
    shortName: 'GABA/Glutamate',
    color: '#6366F1', // Royal Indigo
    description: 'Major inhibitory and excitatory neurotransmission and synaptic plasticity',
  },
  {
    id: 'Opioid & Neuropeptides',
    name: 'Opioid & Neuropeptides',
    shortName: 'Opioids/Peptides',
    color: '#EC4899', // Pink / Magenta
    description: 'Endorphin hedonic tone, analgesia, circadian timing, and orexin gating',
  },
  {
    id: 'Enzymes & Channels',
    name: 'Enzymes & Ion Channels',
    shortName: 'Enzymes/Channels',
    color: '#F97316', // Orange / Coral
    description: 'Voltage-gated cardiac/neuronal channels, monoamine catabolism, and release',
  }
]

export const categorizeReceptor = (recId) => {
  const u = (recId || '').toUpperCase()
  if (u.startsWith('5HT') || u.startsWith('5-HT')) return 'Serotonergic'
  if (u.startsWith('D') && ['D1', 'D2', 'D3', 'D4', 'D5'].includes(u)) return 'Dopaminergic'
  if (['SERT', 'NET', 'DAT', 'VMAT2'].includes(u)) return 'Transporters'
  if (u.startsWith('ALPHA') || u.startsWith('BETA') || u.startsWith('Α') || u.startsWith('Β')) return 'Adrenergic'
  if (['H1', 'H2', 'H3', 'H4'].includes(u)) return 'Histaminergic'
  if (['M1', 'M2', 'M3', 'M4', 'M5'].includes(u)) return 'Muscarinic'
  if (u.includes('GABA') || ['NMDA', 'AMPA'].includes(u)) return 'GABA & Glutamate'
  if (['MOR', 'KOR', 'DOR', 'SIGMA1', 'OX1R_OX2R', 'MT1MT2'].includes(u)) return 'Opioid & Neuropeptides'
  return 'Enzymes & Channels'
}

export const getReceptorFamily = (recId) => {
  const famId = categorizeReceptor(recId)
  return RECEPTOR_FAMILIES.find(f => f.id === famId) || RECEPTOR_FAMILIES[8]
}

export const getReceptorFamilyColor = (recId) => {
  return getReceptorFamily(recId).color
}
