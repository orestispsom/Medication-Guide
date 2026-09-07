import data from '../data.json'

// Standard Drug Family display configuration
export const FAMILY_CONFIG = [
  { id: 'antipsychotics', name: 'Antipsychotics', icon: '🧠', color: '#8E44AD' },
  { id: 'antidepressants', name: 'Antidepressants', icon: '💊', color: '#2563EB' },
  { id: 'mood-stabilizers', name: 'Mood Stabilizers', icon: '⚖️', color: '#D97706' },
  { id: 'anxiolytics', name: 'Anxiolytics & Sedatives', icon: '🌙', color: '#059669' },
  { id: 'adhd', name: 'ADHD & Stimulants', icon: '⚡', color: '#DC2626' },
  { id: 'substance-use', name: 'SUD & Addiction', icon: '🛡️', color: '#0D9488' },
  { id: 'neuropsychiatry', name: 'Neuropsychiatry', icon: '🩺', color: '#7C3AED' },
  { id: 'neurology', name: 'Neurology Essentials', icon: '🔬', color: '#4F46E5' },
  { id: 'antidotes-interventional', name: 'Emergency Antidotes', icon: '🚨', color: '#E11D48' }
]

// Get all unique drugs grouped cleanly by family for the dropdown
export function getGroupedDrugs() {
  const drugs = data.drugs || []
  const seen = new Set()
  const uniqueDrugs = []

  drugs.forEach(d => {
    const key = d.name.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueDrugs.push(d)
    }
  })

  // Group by family
  return FAMILY_CONFIG.map(fam => {
    const famDrugs = uniqueDrugs
      .filter(d => d.familyId === fam.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => ({
        id: d.id,
        name: d.name,
        subgroup: d.subgroup || fam.name,
        shortSubgroup: getShortSubgroup(d),
        familyId: d.familyId,
        familyName: fam.name,
        halfLife: d.halfLife || 'N/A',
        targetDose: d.targetDose || 'N/A',
        receptors: d.receptors || []
      }))

    return {
      ...fam,
      drugs: famDrugs
    }
  }).filter(fam => fam.drugs.length > 0)
}

export function getShortSubgroup(drug) {
  const sg = (drug.subgroup || '').toLowerCase()
  if (sg.includes('ssri')) return 'SSRI'
  if (sg.includes('snri')) return 'SNRI'
  if (sg.includes('tca') || sg.includes('tricyclic')) return 'TCA'
  if (sg.includes('maoi') || sg.includes('monoamine oxidase')) return 'MAOI'
  if (sg.includes('spari') || sg.includes('sms') || sg.includes('multimodal')) return 'SPARI / SMS'
  if (sg.includes('ndri')) return 'NDRI'
  if (sg.includes('sari')) return 'SARI'
  if (sg.includes('second-generation') || sg.includes('sga') || sg.includes('atypical')) {
    if (drug.name.match(/aripiprazole|brexpiprazole|cariprazine/i)) return 'Third-Gen SGA'
    return 'SGA'
  }
  if (sg.includes('first-generation') || sg.includes('fga') || sg.includes('typical')) return 'FGA'
  if (sg.includes('third-generation')) return 'Third-Gen SGA'
  if (sg.includes('benzodiazepine') || sg.includes('bzd')) return 'BZD'
  if (sg.includes('z-drug') || sg.includes('non-benzodiazepine')) return 'Z-Drug'
  if (sg.includes('dora') || sg.includes('orexin')) return 'DORA'
  if (sg.includes('lithium')) return 'Lithium'
  if (sg.includes('anticonvulsant')) return 'Anticonvulsant'
  if (sg.includes('stimulant')) return 'CNS Stimulant'
  if (sg.includes('non-stimulant')) return 'Non-Stimulant'
  if (sg.includes('vmat2')) return 'VMAT2 Inhibitor'
  if (sg.includes('beta-adrenergic') || sg.includes('beta-blocker')) return 'Beta-Blocker'
  if (sg.includes('anticholinergic')) return 'Anticholinergic'
  if (sg.includes('alpha-2')) return 'Alpha-2 Agonist'
  if (sg.includes('opioid')) return 'MAT / Opioid'
  return drug.subgroup?.split('(')[0]?.trim() || 'Psychotropic'
}

// Find if an exact or close match exists among the 20 compendium protocols
export function findCompendiumProtocol(fromDrug, toDrug) {
  if (!fromDrug || !toDrug) return null
  const protocols = data.protocols || []
  const fromName = fromDrug.name.toLowerCase()
  const toName = toDrug.name.toLowerCase()
  const fromSub = (fromDrug.subgroup || '').toLowerCase()
  const toSub = (toDrug.subgroup || '').toLowerCase()

  // 1. Clozapine switch
  if (fromName.includes('clozapine')) {
    return protocols.find(p => p.id === 'protocol-11-planned-clozapine-cross-taper') || null
  }
  // 2. Valproate <-> Lamotrigine
  if ((fromName.includes('valproate') || fromName.includes('divalproex')) && toName.includes('lamotrigine')) {
    return protocols.find(p => p.id === 'protocol-14-valproate-lamotrigine-ugt-cross-titration') || null
  }
  if (fromName.includes('lamotrigine') && (toName.includes('valproate') || toName.includes('divalproex'))) {
    return protocols.find(p => p.id === 'protocol-14-valproate-lamotrigine-ugt-cross-titration') || null
  }
  // 3. MAOI switch
  if (toSub.includes('maoi') || toName.match(/phenelzine|tranylcypromine|selegiline|isocarboxazid/)) {
    return protocols.find(p => p.id === 'protocol-05-maoi-induction-washout-timelines') || null
  }
  if (fromSub.includes('maoi') || fromName.match(/phenelzine|tranylcypromine|selegiline|isocarboxazid/)) {
    return protocols.find(p => p.id === 'protocol-06-maoi-washout-mitochondrial-resynthesis') || null
  }
  // 4. Paroxetine
  if (fromName.includes('paroxetine')) {
    return protocols.find(p => p.id === 'protocol-02-paroxetine-salvage-fluoxetine-bridge') || null
  }
  // 5. Fluoxetine
  if (fromName.includes('fluoxetine')) {
    return protocols.find(p => p.id === 'protocol-03-fluoxetine-washout-transitions') || null
  }
  // 6. SSRI/SNRI to Bupropion or Mirtazapine
  if ((fromSub.includes('ssri') || fromSub.includes('snri')) && (toName.includes('bupropion') || toName.includes('mirtazapine'))) {
    return protocols.find(p => p.id === 'protocol-04-mechanism-shift-rotations') || null
  }
  // 7. SSRI to SNRI
  if (fromSub.includes('ssri') && toSub.includes('snri')) {
    return protocols.find(p => p.id === 'protocol-01-ssri-to-snri-cross-titration') || null
  }
  // 8. Antipsychotic Antagonist to Partial Agonist (Aripiprazole, Brexpiprazole, Cariprazine)
  if (toName.match(/aripiprazole|brexpiprazole|cariprazine/)) {
    if (fromName.match(/olanzapine|quetiapine/)) {
      return protocols.find(p => p.id === 'protocol-07-sedating-sga-to-partial-agonist') || null
    }
    if (fromName.match(/haloperidol|risperidone|paliperidone/)) {
      return protocols.find(p => p.id === 'protocol-08-high-potency-antagonist-to-partial-agonist') || null
    }
    return protocols.find(p => p.id === 'protocol-07-sedating-sga-to-partial-agonist') || null
  }
  // 9. Lithium Discontinuation
  if (fromName.includes('lithium') && (toDrug.familyId === 'mood-stabilizers' || toDrug.familyId === 'antipsychotics')) {
    return protocols.find(p => p.id === 'protocol-13-lithium-discontinuation-mood-stabilizer-shift') || null
  }
  // 10. BZD to Diazepam
  if (fromSub.includes('benzodiazepine') && toName.includes('diazepam')) {
    return protocols.find(p => p.id === 'protocol-15-ashton-benzodiazepine-substitution') || null
  }
  // 11. Stimulant rotation
  if (fromSub.includes('stimulant') && toSub.includes('stimulant')) {
    return protocols.find(p => p.id === 'protocol-18-adhd-stimulant-rotations-switching') || null
  }
  // 12. Alpha-2 Agonist
  if (fromName.match(/clonidine|guanfacine/)) {
    return protocols.find(p => p.id === 'protocol-19-alpha-2-agonists-rebound-hypertensive-crisis') || null
  }

  return null
}

// Generate an authoritative switch protocol for ANY combination
export function generateSwitchProtocol(fromDrug, toDrug, pace = 'mid') {
  if (!fromDrug || !toDrug) return null

  if (fromDrug.id === toDrug.id || fromDrug.name.toLowerCase() === toDrug.name.toLowerCase()) {
    return {
      sameDrug: true,
      title: fromDrug.name,
      mandate: 'Identical medication selected. Cross-titration is only indicated when transitioning between different pharmacological entities.'
    }
  }

  const compMatch = findCompendiumProtocol(fromDrug, toDrug)
  const fromName = fromDrug.name
  const toName = toDrug.name
  const fromSub = fromDrug.subgroup || ''
  const toSub = toDrug.subgroup || ''

  // Timing multipliers for slow / mid / fast
  const paceMultipliers = { slow: 1.5, mid: 1.0, fast: 0.5 }
  const mult = paceMultipliers[pace] || 1.0

  // Check critical safety patterns
  const isToMaoi = toSub.toLowerCase().includes('maoi') || toName.match(/phenelzine|tranylcypromine|selegiline|isocarboxazid/i)
  const isFromMaoi = fromSub.toLowerCase().includes('maoi') || fromName.match(/phenelzine|tranylcypromine|selegiline|isocarboxazid/i)
  const isValproateLamotrigine = (fromName.toLowerCase().includes('valproate') && toName.toLowerCase().includes('lamotrigine')) ||
                                (fromName.toLowerCase().includes('lamotrigine') && toName.toLowerCase().includes('valproate'))
  const isFromClozapine = fromName.toLowerCase().includes('clozapine')
  const isToClozapine = toName.toLowerCase().includes('clozapine')
  const isToPartialAgonist = toName.match(/aripiprazole|brexpiprazole|cariprazine/i)
  const isFromAntagonist = fromSub.toLowerCase().includes('antipsychotic') && !fromName.match(/aripiprazole|brexpiprazole|cariprazine/i)
  const isSameAntidepressantClass = fromSub.toLowerCase().includes('ssri') && toSub.toLowerCase().includes('ssri')

  // If there is an authoritative compendium protocol match:
  if (compMatch) {
    const rawDurationWeeks = parseDurationWeeks(compMatch.duration) || 4
    const adjustedWeeks = Math.max(1, Math.round(rawDurationWeeks * mult))
    const durationStr = pace === 'fast' ? `${adjustedWeeks} Week${adjustedWeeks > 1 ? 's' : ''} (Rapid)` :
                        pace === 'slow' ? `${adjustedWeeks} Weeks (Conservative)` :
                        compMatch.duration

    return {
      isCompendium: true,
      compendiumId: compMatch.id,
      number: compMatch.number,
      title: `${fromName} → ${toName}`,
      protocolTitle: compMatch.title,
      switchType: compMatch.switchType || 'CROSS-TAPER',
      duration: durationStr,
      pace,
      coreMandate: compMatch.coreMandate,
      precaution: compMatch.alertBox || null,
      rationale: compMatch.rationale,
      phases: adaptPhases(compMatch.phases, pace),
      receptorDynamics: compMatch.receptorShiftDynamics || synthesizeReceptorDynamics(fromDrug, toDrug),
      rescuePearls: compMatch.emergencyRescue || compMatch.clinicalPearls || []
    }
  }

  // Synthesize dynamic evidence-based protocol for unlisted combination
  return synthesizeCustomSwitchProtocol(fromDrug, toDrug, pace, mult, {
    isToMaoi,
    isFromMaoi,
    isValproateLamotrigine,
    isFromClozapine,
    isToClozapine,
    isToPartialAgonist,
    isFromAntagonist,
    isSameAntidepressantClass
  })
}

function parseDurationWeeks(durationStr) {
  if (!durationStr) return 4
  const match = durationStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 4
}

function adaptPhases(phases, pace) {
  if (!phases || !Array.isArray(phases)) return []
  return phases.map((ph, idx) => {
    let timingLabel = ph.timing || `Week ${idx + 1}`
    if (pace === 'fast') {
      timingLabel = `Days ${idx * 3 + 1}–${(idx + 1) * 3}`
    } else if (pace === 'slow') {
      timingLabel = `Weeks ${idx * 2 + 1}–${(idx + 1) * 2}`
    }
    return {
      phase: ph.phase || `Phase ${idx + 1}`,
      timing: timingLabel,
      title: ph.title,
      notes: ph.notes
    }
  })
}

function synthesizeCustomSwitchProtocol(fromDrug, toDrug, pace, mult, flags) {
  const fromName = fromDrug.name
  const toName = toDrug.name

  // 1. WASHOUT: Switching to or from MAOI
  if (flags.isToMaoi) {
    const isFluoxetine = fromName.toLowerCase().includes('fluoxetine')
    const isVortioxetine = fromName.toLowerCase().includes('vortioxetine')
    const washoutWeeks = isFluoxetine ? 5 : isVortioxetine ? 3 : 2
    return {
      isCompendium: false,
      title: `${fromName} → ${toName}`,
      switchType: 'MANDATORY WASHOUT INDUCTION',
      duration: `${washoutWeeks} Weeks Washout + 2 Weeks Induction`,
      pace,
      precaution: 'FATAL SEROTONIN TOXICITY WARNING: Co-administration of MAOI with SSRIs, SNRIs, or TCAs causes life-threatening hyperthermia, autonomic rigidity, and death. Never cross-taper.',
      coreMandate: `Cease ${fromName} completely. Maintain strict zero-drug washout for ${washoutWeeks} weeks (${washoutWeeks * 7} days) before initiating ${toName} at lowest dose.`,
      phases: [
        { phase: 'Phase 1', timing: 'Day 1', title: `Discontinue ${fromName}`, notes: `Taper or abruptly stop ${fromName} depending on current baseline dose.` },
        { phase: 'Phase 2', timing: `Weeks 1–${washoutWeeks}`, title: 'Strict Zero-Drug Washout Window', notes: 'No serotonergic or sympathomimetic agents permitted. Prescribe tyramine-restricted dietary education.' },
        { phase: 'Phase 3', timing: `Week ${washoutWeeks + 1}`, title: `Initiate Low-Dose ${toName}`, notes: `Start ${toName} at lowest initial dose. Monitor seated and standing blood pressure for orthostasis.` },
        { phase: 'Phase 4', timing: `Week ${washoutWeeks + 2}+`, title: 'Therapeutic Escalation', notes: `Gradually escalate ${toName} to target therapeutic dose while maintaining tyramine precautions.` }
      ],
      receptorDynamics: [
        { receptor: 'SERT / MAO-A', riskLevel: 'Severe', shift: 'Serotonin Clearance Blockade', hazard: 'Severe hyperpyrexia, clonus, hypertensive crisis if washout breached.' }
      ],
      rescuePearls: [
        'Cyproheptadine 12 mg PO initial + 2 mg q2h if early serotonin toxicity occurs.',
        'Phentolamine IV or sublingual nifedipine for acute tyramine-induced hypertensive crisis.'
      ]
    }
  }

  // 2. Clozapine transition
  if (flags.isFromClozapine) {
    return {
      isCompendium: false,
      title: `${fromName} → ${toName}`,
      switchType: 'ULTRA-SLOW CHOLINERGIC-PROTECTED CROSS-TAPER',
      duration: pace === 'slow' ? '8–12 Weeks' : pace === 'fast' ? '3–4 Weeks' : '6–8 Weeks',
      pace,
      precaution: 'SEVERE CHOLINERGIC REBOUND & PSYCHOTIC BREAKTHROUGH: Abrupt Clozapine discontinuation triggers profound diaphoresis, delirium, tachycardia, and catastrophic rebound psychosis.',
      coreMandate: `Maintain Clozapine while titrating ${toName} to therapeutic range. Taper Clozapine by no more than 25–50 mg weekly once ${toName} is established.`,
      phases: [
        { phase: 'Phase 1', timing: pace === 'slow' ? 'Weeks 1–2' : 'Week 1', title: `Introduce ${toName} at Low Dose`, notes: `Keep Clozapine at 100% baseline. Start ${toName} at initial dose to assess tolerability.` },
        { phase: 'Phase 2', timing: pace === 'slow' ? 'Weeks 3–4' : 'Weeks 2–3', title: `Titrate ${toName} / Begin Clozapine Taper`, notes: `Escalate ${toName} to 75% target dose. Reduce Clozapine to 75% baseline.` },
        { phase: 'Phase 3', timing: pace === 'slow' ? 'Weeks 5–6' : 'Weeks 4–5', title: 'Therapeutic Crossover', notes: `${toName} at 100% target dose. Drop Clozapine to 25%–50% baseline. Co-prescribe anticholinergic if cholinergic rebound appears.` },
        { phase: 'Phase 4', timing: pace === 'slow' ? 'Weeks 7–8+' : 'Week 6+', title: 'Final Clozapine Cessation', notes: 'Discontinue Clozapine completely. Monitor WBC/ANC for 4 weeks post-cessation per REMS protocol.' }
      ],
      receptorDynamics: [
        { receptor: 'M1 / M4 Muscarinic', riskLevel: 'Severe', shift: 'Muscarinic Disinhibition', hazard: 'Diaphoresis, profound emesis, tachycardia, delirium.' },
        { receptor: 'D2 Dopamine', riskLevel: 'High', shift: 'Receptor Occupancy Shift', hazard: 'Dopamine supersensitivity psychosis if antagonist taper is too rapid.' }
      ],
      rescuePearls: [
        'Prescribe Diphenhydramine 25–50 mg PO PRN or Benztropine 1–2 mg PO PRN for acute cholinergic rebound.',
        'Do not mistake cholinergic rebound agitation for acute psychotic relapse.'
      ]
    }
  }

  // 3. Valproate - Lamotrigine bidirectional switch
  if (flags.isValproateLamotrigine) {
    const isAddingLamotrigine = toName.toLowerCase().includes('lamotrigine')
    return {
      isCompendium: false,
      title: `${fromName} ↔ ${toName}`,
      switchType: 'UGT GLUCURONIDATION ADJUSTED CROSS-TITRATION',
      duration: pace === 'slow' ? '8–10 Weeks' : '6–8 Weeks',
      pace,
      precaution: 'STEVENS-JOHNSON SYNDROME (SJS) WARNING: Valproate inhibits Lamotrigine glucuronidation (UGT2B7) by >50%, doubling plasma Lamotrigine levels and dramatically escalating toxic epidermal necrolysis risk.',
      coreMandate: isAddingLamotrigine
        ? 'MANDATORY: Halve the standard Lamotrigine titration schedule (start at 25 mg EVERY OTHER DAY for 2 weeks, then 25 mg daily for 2 weeks).'
        : `Gradually initiate Valproate while cautiously monitoring Lamotrigine clearance. Expect Lamotrigine levels to surge as Valproate enters steady state.`,
      phases: [
        { phase: 'Phase 1', timing: 'Weeks 1–2', title: 'Ultra-Low Dose Introduction', notes: 'Lamotrigine 25 mg every other day. Maintain Valproate at steady therapeutic blood level (50–100 mcg/mL).' },
        { phase: 'Phase 2', timing: 'Weeks 3–4', title: 'Conservative Dose Step', notes: 'Advance Lamotrigine to 25 mg daily. Valproate maintained.' },
        { phase: 'Phase 3', timing: 'Weeks 5–6', title: 'Mid-Range Titration', notes: 'Advance Lamotrigine to 50 mg daily. Begin gradual reduction of Valproate if cross-tapering.' },
        { phase: 'Phase 4', timing: 'Weeks 7–8+', title: 'Therapeutic Target', notes: 'Lamotrigine target dose: 100 mg daily (adjunctive with Valproate) or 200 mg daily (if Valproate fully withdrawn).' }
      ],
      receptorDynamics: [
        { receptor: 'UGT2B7 Glucuronidation', riskLevel: 'Severe', shift: 'Metabolic Inhibition', hazard: 'Severe mucocutaneous eruption, SJS, TEN, DRESS syndrome.' }
      ],
      rescuePearls: [
        'Inspect skin daily: Any unexplained rash, blistering, mucosal involvement, or fever warrants immediate cessation and ER evaluation.',
        'Halve Lamotrigine starter dose whenever co-prescribed with any Valproate formulation.'
      ]
    }
  }

  // 4. Antagonist to Partial Agonist (Aripiprazole, Brexpiprazole, Cariprazine)
  if (flags.isToPartialAgonist && flags.isFromAntagonist) {
    return {
      isCompendium: false,
      title: `${fromName} → ${toName}`,
      switchType: 'PLATEAU CROSS-TAPER',
      duration: pace === 'fast' ? '2 Weeks' : pace === 'slow' ? '5–6 Weeks' : '3–4 Weeks',
      pace,
      precaution: 'WITHDRAWAL AKATHISIA & CHOLINERGIC FLUX: Aripiprazole/Cariprazine partial agonism displaces full antagonist binding while possessing zero anticholinergic tone.',
      coreMandate: `Maintain baseline ${fromName} while initiating low-dose ${toName}. Once ${toName} reaches therapeutic occupancy (1–2 weeks), step down ${fromName} gradually.`,
      phases: [
        { phase: 'Phase 1', timing: 'Week 1', title: `Overlap Phase: Add Low-Dose ${toName}`, notes: `Keep ${fromName} at 100% baseline dose. Introduce ${toName} at lowest starting dose (e.g. Aripiprazole 5 mg or Cariprazine 1.5 mg).` },
        { phase: 'Phase 2', timing: 'Week 2', title: `Dose Escalation / Begin ${fromName} Taper`, notes: `Advance ${toName} to target therapeutic dose. Reduce ${fromName} to 50%–75% baseline.` },
        { phase: 'Phase 3', timing: 'Week 3', title: `Final Step-Down of ${fromName}`, notes: `Reduce ${fromName} to 25% baseline. Monitor closely for emergence of akathisia or agitation.` },
        { phase: 'Phase 4', timing: 'Week 4+', title: `Monotherapy with ${toName}`, notes: `Discontinue ${fromName}. Maintain ${toName} at target therapeutic dose.` }
      ],
      receptorDynamics: [
        { receptor: 'D2 Partial Agonism', riskLevel: 'High', shift: 'Full Blockade → 30% Agonist Tone', hazard: 'Transient motor agitation, acute akathisia, psychotic destabilization.' },
        { receptor: 'H1 / M1 Antagonism', riskLevel: 'Moderate', shift: 'Loss of Sedating Blockade', hazard: 'Rebound insomnia, diaphoresis, gastrointestinal hypermotility.' }
      ],
      rescuePearls: [
        'Propranolol 10–20 mg BID/TID or Lorazepam 0.5–1 mg PO PRN for acute switch-emergent akathisia.',
        'Avoid stopping the antagonist before the partial agonist reaches steady state (~7–14 days).'
      ]
    }
  }

  // 5. Same class Antidepressant (SSRI to SSRI)
  if (flags.isSameAntidepressantClass) {
    return {
      isCompendium: false,
      title: `${fromName} → ${toName}`,
      switchType: 'DIRECT SWITCH OR RAPID CROSS-TAPER',
      duration: pace === 'fast' ? 'Direct Next-Day' : pace === 'slow' ? '2–3 Weeks' : '1–2 Weeks',
      pace,
      precaution: 'DISCONTINUATION VULNERABILITY: Switching from short half-life SSRIs (Paroxetine, Fluvoxamine) carries risk of FINISH discontinuation syndrome if next agent is delayed.',
      coreMandate: 'Direct switch to equivalent therapeutic dose is well tolerated for low-to-moderate doses. Stepped cross-taper over 1–2 weeks recommended for higher doses.',
      phases: [
        { phase: 'Phase 1', timing: 'Week 1', title: 'Equi-potent Dose Adjustment', notes: `Reduce ${fromName} to 50% while initiating ${toName} at 50% target dose, or directly swap next morning if at standard dose.` },
        { phase: 'Phase 2', timing: 'Week 2+', title: 'Consolidation', notes: `Discontinue ${fromName}. Advance ${toName} to full therapeutic maintenance dose.` }
      ],
      receptorDynamics: [
        { receptor: 'SERT Blockade', riskLevel: 'Low', shift: 'Isomutual Serotonin Reuptake', hazard: 'Minimal receptor disequilibrium. Watch for gastrointestinal changes.' }
      ],
      rescuePearls: [
        'Direct next-day switch is standard of care between citalopram, escitalopram, and sertraline at equivalent doses.'
      ]
    }
  }

  // 6. Universal Default Cross-Taper for Any Other Combination
  const totalWeeks = pace === 'slow' ? 6 : pace === 'fast' ? 2 : 4
  return {
    isCompendium: false,
    title: `${fromName} → ${toName}`,
    switchType: 'CONSERVATIVE 4-PHASE CROSS-TAPER',
    duration: `${totalWeeks} Weeks (${pace.toUpperCase()})`,
    pace,
    precaution: 'PHARMACODYNAMIC SHIFT: Monitor for crossover adverse effects, receptor withdrawal (insomnia, restlessness), and metabolic or hemodynamic changes during overlapping titration.',
    coreMandate: `Stepped simultaneous cross-titration: Introduce ${toName} at 25%–50% while tapering ${fromName} in 25% decrements across 4 structured phases.`,
    phases: [
      { phase: 'Phase 1', timing: pace === 'fast' ? 'Days 1–4' : 'Week 1', title: 'Initiation & Overlap', notes: `Keep ${fromName} at 75%–100% baseline. Initiate ${toName} at 25%–50% starting dose to assess tolerability.` },
      { phase: 'Phase 2', timing: pace === 'fast' ? 'Days 5–8' : 'Week 2', title: 'Intermediate Crossover', notes: `Reduce ${fromName} to 50% baseline. Advance ${toName} to 50%–75% target dose.` },
      { phase: 'Phase 3', timing: pace === 'fast' ? 'Days 9–12' : 'Week 3', title: 'Final Transition Step', notes: `Reduce ${fromName} to 25% baseline. Advance ${toName} to 100% target therapeutic dose.` },
      { phase: 'Phase 4', timing: pace === 'fast' ? 'Day 13+' : 'Week 4+', title: 'Complete Monotherapy', notes: `Discontinue ${fromName}. Maintain ${toName} at target therapeutic dose.` }
    ],
    receptorDynamics: synthesizeReceptorDynamics(fromDrug, toDrug),
    rescuePearls: [
      'Maintain close patient contact during Week 2–3 crossover window where vulnerability to discontinuation symptoms is highest.',
      'Adjust taper pace flexibly based on patient tolerability and emergence of breakthrough symptoms.'
    ]
  }
}

function synthesizeReceptorDynamics(fromDrug, toDrug) {
  const fromRecs = fromDrug.receptors || []
  const toRecs = toDrug.receptors || []

  const dynamics = []

  // Check D2
  const fromD2 = fromRecs.find(r => (r.receptor || '').includes('D2'))
  const toD2 = toRecs.find(r => (r.receptor || '').includes('D2'))
  if (fromD2 || toD2) {
    dynamics.push({
      receptor: 'D2 Dopamine',
      riskLevel: 'Moderate',
      shift: `${fromDrug.name} (${fromD2?.action || 'Blockade'}) → ${toDrug.name} (${toD2?.action || 'Blockade'})`,
      hazard: 'Risk of breakthrough psychotic agitation, motor restlessness, or akathisia.'
    })
  }

  // Check 5-HT2A / SERT
  const from5HT = fromRecs.find(r => (r.receptor || '').includes('5HT2A') || (r.receptor || '').includes('SERT'))
  const to5HT = toRecs.find(r => (r.receptor || '').includes('5HT2A') || (r.receptor || '').includes('SERT'))
  if (from5HT || to5HT) {
    dynamics.push({
      receptor: 'Serotonin (5-HT / SERT)',
      riskLevel: 'Moderate',
      shift: 'Serotonergic Pathway Modulation',
      hazard: 'Discontinuation syndrome (brain zaps, mood lability) or nausea/GI motility flux.'
    })
  }

  // Check H1
  const fromH1 = fromRecs.find(r => (r.receptor || '').includes('H1'))
  const toH1 = toRecs.find(r => (r.receptor || '').includes('H1'))
  if (fromH1 && (!toH1 || toH1.action === 'Low')) {
    dynamics.push({
      receptor: 'H1 Histamine',
      riskLevel: 'High',
      shift: 'Loss of H1 Antagonism',
      hazard: 'Prominent rebound insomnia, agitation, and anorexia upon cessation of sedating agent.'
    })
  }

  return dynamics.length > 0 ? dynamics : [
    {
      receptor: 'Neuroreceptor Adaptation',
      riskLevel: 'Moderate',
      shift: `Transition from ${fromDrug.name} to ${toDrug.name}`,
      hazard: 'Potential temporary receptor disequilibrium and withdrawal emergence during crossover.'
    }
  ]
}

// Generate an authoritative deprescribing protocol for ANY single drug
export function generateDeprescribingProtocol(drug, pace = 'mid') {
  if (!drug) return null

  const name = drug.name
  const sub = (drug.subgroup || '').toLowerCase()
  const fam = drug.familyId || ''
  const tHalf = drug.halfLife || 'N/A'

  // Determine deprescribing category & hyperbolic strategy
  let strategy = 'Hyperbolic Stepped Dose De-escalation'
  let precaution = null
  let defaultDurationWeeks = 6
  let hyperbolicPrinciple = 'Hyperbolic tapering accounts for non-linear receptor binding curves: receptor occupancy drops precipitously at the lowest milligram doses. Decrements must be proportionally smaller near the end of the taper.'
  let withdrawalRisks = []
  let rescuePearls = []

  // Benzodiazepines / Z-Drugs
  if (sub.includes('benzodiazepine') || sub.includes('bzd') || sub.includes('z-drug') || sub.includes('hypnotic')) {
    strategy = 'Ashton Protocol Hyperbolic BZD Deprescribing'
    defaultDurationWeeks = pace === 'slow' ? 12 : pace === 'fast' ? 3 : 8
    precaution = 'SEIZURE & AUTONOMIC REBOUND WARNING: Abrupt discontinuation of chronic benzodiazepines or Z-drugs risks grand mal seizures, severe autonomic rebound, delirium tremens, and protracted withdrawal.'
    hyperbolicPrinciple = 'GABA-A alpha-1/alpha-2 down-regulation requires weeks to months of unhurried micro-decrements for intrinsic neuroreceptor resensitization.'
    withdrawalRisks = [
      'Rebound insomnia, severe anxiety, and panic flares',
      'Muscle tremor, twitching, and sensory hypersensitivity (photophobia, hyperacusis)',
      'Autonomic instability (tachycardia, diaphoresis, hypertension)',
      'Seizure risk if stopped abruptly from moderate-to-high doses'
    ]
    rescuePearls = [
      'Consider substituting with equivalent long-acting Diazepam for short half-life agents (Alprazolam, Lorazepam).',
      'Reduce dose by 5%–10% every 1–2 weeks; slow down further at doses <25% of baseline.',
      'Hold dose steady if severe withdrawal symptoms emerge; NEVER escalate back to original high dose.'
    ]
  }
  // SSRIs / SNRIs / Antidepressants
  else if (fam === 'antidepressants' || sub.includes('ssri') || sub.includes('snri') || sub.includes('tca')) {
    strategy = 'Hyperbolic Serotonin De-escalation (Horowitz-Taylor Paradigm)'
    defaultDurationWeeks = pace === 'slow' ? 10 : pace === 'fast' ? 2 : 6
    precaution = 'FINISH DISCONTINUATION SYNDROME: Abrupt or linear cessation triggers Flu-like symptoms, Insomnia, Nausea, Imbalance, Sensory electric-shock sensations (brain zaps), and Hyperarousal.'
    hyperbolicPrinciple = 'PET studies show that SERT occupancy remains >50% even at minimal clinical doses (e.g. Citalopram 5 mg, Venlafaxine 18.75 mg). The largest drops in biological occupancy occur during the final fractions of a milligram.'
    withdrawalRisks = [
      'Sensory paresthesias and "brain zaps" triggered by lateral eye movements',
      'Dizziness, ataxia, nausea, and flu-like lethargy',
      'Emotional volatility, rebound tearfulness, and severe irritability'
    ]
    rescuePearls = [
      'Paroxetine and Venlafaxine possess the highest discontinuation risk due to rapid elimination half-lives.',
      'Utilize oral liquid solutions or compounded capsules for micro-tapering below standard tablet strengths.',
      'If withdrawal is debilitating, re-administer the previous tolerated dose and taper in 5%–10% monthly steps.'
    ]
  }
  // Antipsychotics
  else if (fam === 'antipsychotics' || sub.includes('antipsychotic')) {
    strategy = 'Dopamine Supersensitivity Prevention Taper'
    defaultDurationWeeks = pace === 'slow' ? 12 : pace === 'fast' ? 3 : 8
    precaution = 'DOPAMINE SUPERSENSITIVITY PSYCHOSIS & WITHDRAWAL DYSKINESIA: Chronic D2 blockade up-regulates striatal and mesolimbic dopamine receptors. Rapid de-escalation triggers rebound psychosis and choreoathetoid motor movements.'
    hyperbolicPrinciple = 'Striatal D2 occupancy drops steeply in the lowest milligram tiers. Doses below 2 mg Haldol / 2.5 mg Olanzapine equivalent require extended stabilization windows.'
    withdrawalRisks = [
      'Withdrawal-emergent akathisia and motor restlessness',
      'Cholinergic rebound (nausea, diaphoresis, insomnia, diarrhea)',
      'Rapid rebound psychosis mimicking illness relapse'
    ]
    rescuePearls = [
      'Taper by no more than 10%–20% of the PRECEDING dose every 2–4 weeks.',
      'Prescribe oral liquid formulation to achieve accurate micro-titrations below minimum pill strength.',
      'Distinguish withdrawal akathisia/agitation from true psychotic recurrence.'
    ]
  }
  // Lithium & Mood Stabilizers
  else if (fam === 'mood-stabilizers' || sub.includes('lithium') || sub.includes('anticonvulsant')) {
    strategy = 'Bipolar Relapse-Protected Taper'
    defaultDurationWeeks = pace === 'slow' ? 12 : pace === 'fast' ? 4 : 8
    precaution = 'ACUTE MANIC & SUICIDE RELAPSE RISK: Tapering Lithium in under 2 weeks increases manic relapse rate by 500% compared to a gradual taper over 1–3 months.'
    hyperbolicPrinciple = 'Inositol monophosphatase and GSK-3 beta signaling cascades require protracted de-escalation to prevent destabilizing rebound mania.'
    withdrawalRisks = [
      'High risk of rapid affective switch into mania or mixed state',
      'Rebound mood instability and irritability',
      'Seizure risk if anticonvulsant mood stabilizers (Valproate, Carbamazepine) stopped abruptly'
    ]
    rescuePearls = [
      'Lithium should be de-escalated by no more than 150–300 mg per month in outpatients.',
      'Maintain frequent clinical contact and family monitoring for early behavioral markers of hypomania.'
    ]
  }
  // Alpha-2 Agonists (Clonidine, Guanfacine)
  else if (name.match(/clonidine|guanfacine/i)) {
    strategy = 'Autonomic Rebound Hypertensive Taper'
    defaultDurationWeeks = pace === 'slow' ? 4 : pace === 'fast' ? 1 : 2
    precaution = 'FATAL REBOUND HYPERTENSIVE CRISIS: Abrupt cessation of central alpha-2 agonists triggers a surge of circulating catecholamines, causing hypertensive encephalopathy and myocardial infarction.'
    hyperbolicPrinciple = 'Presynaptic alpha-2 autoreceptors require gradual re-adaptation to endogenous norepinephrine tone.'
    withdrawalRisks = [
      'Severe rebound hypertension, tachycardia, and bounding palpitations',
      'Severe headache, anxiety, tremors, and flushing'
    ]
    rescuePearls = [
      'Taper Clonidine by no more than 0.1 mg every 3 to 7 days.',
      'Instruct patient to monitor blood pressure and pulse twice daily throughout de-escalation.'
    ]
  }
  // General / Other psychotropic
  else {
    strategy = 'Stepped Hyperbolic De-escalation'
    defaultDurationWeeks = pace === 'slow' ? 8 : pace === 'fast' ? 2 : 4
    withdrawalRisks = [
      'Breakthrough psychiatric symptoms',
      'Sleep architecture disturbances',
      'Autonomic and somatic discomfort'
    ]
    rescuePearls = [
      'Taper in stepped decrements (75% -> 50% -> 25% -> Stop), adjusting duration based on clinical response.'
    ]
  }

  // Adjust duration by pace
  const paceMultipliers = { slow: 1.5, mid: 1.0, fast: 0.4 }
  const totalWeeks = Math.max(1, Math.round(defaultDurationWeeks * (paceMultipliers[pace] || 1.0)))

  // Generate 4 clear execution phases
  const p1Weeks = Math.max(1, Math.round(totalWeeks * 0.25))
  const p2Weeks = Math.max(1, Math.round(totalWeeks * 0.25))
  const p3Weeks = Math.max(1, Math.round(totalWeeks * 0.25))
  const p4Weeks = Math.max(1, totalWeeks - p1Weeks - p2Weeks - p3Weeks)

  const phases = [
    {
      phase: 'Phase 1: Initial Step-Down',
      timing: pace === 'fast' ? 'Days 1–3' : `Weeks 1–${p1Weeks}`,
      targetDoseLevel: '75% of Baseline Dose',
      instructions: `Reduce ${name} to 75% of current daily intake. Establish baseline symptom stability and verify absence of withdrawal emergence.`
    },
    {
      phase: 'Phase 2: Mid-Point Reduction',
      timing: pace === 'fast' ? 'Days 4–7' : `Weeks ${p1Weeks + 1}–${p1Weeks + p2Weeks}`,
      targetDoseLevel: '50% of Baseline Dose',
      instructions: `Reduce ${name} to 50% baseline. Hold for minimum 1–2 weeks before proceeding. If mild withdrawal emerges, hold steady until symptoms resolve.`
    },
    {
      phase: 'Phase 3: Hyperbolic Micro-Step',
      timing: pace === 'fast' ? 'Days 8–10' : `Weeks ${p1Weeks + p2Weeks + 1}–${p1Weeks + p2Weeks + p3Weeks}`,
      targetDoseLevel: '25% of Baseline Dose',
      instructions: `Reduce ${name} to 25% baseline. At this level biological receptor clearance accelerates; smaller decrements (or liquid formulation) may be necessary.`
    },
    {
      phase: 'Phase 4: Final Micro-Taper & Cessation',
      timing: pace === 'fast' ? 'Days 11–14+' : `Weeks ${p1Weeks + p2Weeks + p3Weeks + 1}–${totalWeeks}+`,
      targetDoseLevel: '12.5% → Complete Cessation',
      instructions: `Step down to 12.5% (or alternate-day if appropriate) for 1–2 weeks prior to complete discontinuation. Follow patient for 4–8 weeks post-cessation.`
    }
  ]

  return {
    drugId: drug.id,
    drugName: name,
    familyId: fam,
    subgroup: drug.subgroup,
    halfLife: tHalf,
    strategy,
    duration: pace === 'fast' ? `${totalWeeks} Weeks (Rapid / Urgent)` :
              pace === 'slow' ? `${totalWeeks} Weeks (Extended / Ashton)` :
              `${totalWeeks} Weeks (Standard Guideline)`,
    pace,
    precaution,
    coreMandate: `Systematic hyperbolic deprescribing of ${name} across ${totalWeeks} weeks to prevent receptor withdrawal and illness relapse.`,
    hyperbolicPrinciple,
    phases,
    withdrawalRisks,
    rescuePearls
  }
}
