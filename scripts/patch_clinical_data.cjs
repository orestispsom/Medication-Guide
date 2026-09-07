// scripts/patch_clinical_data.cjs
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Original drug count:', data.drugs.length);
console.log('Original subgroup count:', data.subgroups.length);

// 1. Add CGRP receptor to data.receptors
if (!data.receptors.some(r => r.id === 'CGRP')) {
  data.receptors.push({
    id: "CGRP",
    fullName: "Calcitonin Gene-Related Peptide Receptor",
    type: "GPCR (Gs) / CALCRL-RAMP1 Complex",
    color: "#E11D48",
    action: "Receptor Antagonism (Gepants / mAbs)",
    therapeuticEffect: "Halts neurogenic vasodilation, plasma extravasation, and trigeminovascular sensory pain transmission in migraine",
    sideEffects: "Nausea, constipation, injection site reactions"
  });
  console.log('Added CGRP receptor');
}

// 2. Remove 'specialty-fgas' and 'rational-combinations'
data.drugs = data.drugs.filter(d => d.id !== 'specialty-fgas' && d.id !== 'rational-combinations');

// 3. Ensure subgroups in Antidepressants
const melatonergicSubgroup = data.subgroups.find(s => s.id === 'sg-melatonergic');
if (!melatonergicSubgroup) {
  data.subgroups.push({
    id: 'sg-melatonergic',
    name: 'Melatonergic Antidepressants (MT1/MT2 & 5-HT2C)',
    familyId: 'antidepressants',
    description: 'Melatonin MT1/MT2 receptor agonists with 5-HT2C antagonism for circadian resynchronization and depression.'
  });
}

const sariSubgroup = data.subgroups.find(s => s.id === 'sg-sari');
if (!sariSubgroup) {
  data.subgroups.push({
    id: 'sg-sari',
    name: 'Serotonin Antagonist & Reuptake Inhibitors (SARIs)',
    familyId: 'antidepressants',
    description: 'Potent 5-HT2A antagonism combined with moderate SERT inhibition and hypnotic sedation.'
  });
}

const ndriSg = data.subgroups.find(s => s.id === 'sg-ndri');
if (ndriSg) {
  ndriSg.name = 'Norepinephrine-Dopamine Reuptake Inhibitors (NDRIs)';
  ndriSg.description = 'Selective noradrenaline and dopamine reuptake inhibition for motivation and energy.';
}

const rapidSg = data.subgroups.find(s => s.id === 'sg-neurosteroids');
if (rapidSg) {
  rapidSg.name = 'Rapid-Acting Antidepressants (NMDA Antagonists & Neurosteroids)';
  rapidSg.description = 'Glutamatergic NMDA receptor antagonists and neuroactive steroid positive GABA-A modulators.';
}

// 4. Remove duplicate zuranolone under sg-snri
data.drugs = data.drugs.filter(d => !(d.id === 'zuranolone' && d.subgroupId === 'sg-snri'));

// 5. Fix Bupropion (move to sg-ndri)
const bupropion = data.drugs.find(d => d.id === 'bupropion');
if (bupropion) {
  bupropion.subgroupId = 'sg-ndri';
  bupropion.subgroup = 'Norepinephrine-Dopamine Reuptake Inhibitors (NDRIs)';
}

// 6. Fix Trazodone & Nefazodone (move to sg-sari)
const trazodone = data.drugs.find(d => d.id === 'trazodone-nefazodone');
if (trazodone) {
  trazodone.subgroupId = 'sg-sari';
  trazodone.subgroup = 'Serotonin Antagonist & Reuptake Inhibitors (SARIs)';
}

// 7. Fix Esketamine (move to sg-neurosteroids)
const esketamine = data.drugs.find(d => d.id === 'esketamine');
if (esketamine) {
  esketamine.subgroupId = 'sg-neurosteroids';
  esketamine.subgroup = 'Rapid-Acting Antidepressants (NMDA Antagonists & Neurosteroids)';
  esketamine.receptors = [
    {
      receptor: "NMDA",
      rawTarget: "NMDA Glutamate Receptor (GluN2B / Uncompetitive Channel Block)",
      occupancy: 85,
      ki: "300 nM",
      action: "Uncompetitive Open-Channel Antagonist",
      clinicalAction: "Blocks NMDA receptors on GABAergic interneurons, disinhibiting glutamate burst firing, activating AMPA receptors, and triggering rapid BDNF and mTOR synaptogenesis within hours."
    },
    {
      receptor: "MOR",
      rawTarget: "Mu-Opioid Receptor (Low Affinity)",
      occupancy: 40,
      ki: "11 µM",
      action: "Low Affinity Agonist / Modulator",
      clinicalAction: "Secondary downstream signaling requirement; opioid antagonism attenuates ketamine's rapid antidepressant effect."
    }
  ];
}

// 8. Fix Auvelity (move to sg-neurosteroids)
const auvelity = data.drugs.find(d => d.id === 'auvelity');
if (auvelity) {
  auvelity.subgroupId = 'sg-neurosteroids';
  auvelity.subgroup = 'Rapid-Acting Antidepressants (NMDA Antagonists & Neurosteroids)';
}

// 9. Fix Agomelatine (move to sg-melatonergic)
const agomelatine = data.drugs.find(d => d.id === 'agomelatine');
if (agomelatine) {
  agomelatine.subgroupId = 'sg-melatonergic';
  agomelatine.subgroup = 'Melatonergic Antidepressants (MT1/MT2 & 5-HT2C)';
  agomelatine.receptors = [
    {
      receptor: "MT1MT2",
      rawTarget: "Melatonin MT1 & MT2 Receptors",
      occupancy: 90,
      ki: "MT1: 0.1 nM · MT2: 0.26 nM",
      action: "Potent Dual Agonist",
      clinicalAction: "Re-synchronizes disrupted circadian sleep architecture and restores suprachiasmatic nucleus rhythmicity without producing daytime sedation or motor slowing."
    },
    {
      receptor: "5HT2C",
      rawTarget: "Serotonin 5-HT2C Receptor",
      occupancy: 80,
      ki: "630 nM",
      action: "Selective Antagonist",
      clinicalAction: "Disinhibits frontocortical dopamine and norepinephrine transmission, improving daytime alertness, cognitive speed, and hedonic capacity."
    }
  ];
}

// 10. Individual TCAs (replacing tricyclic-antidepressants)
data.drugs = data.drugs.filter(d => d.id !== 'tricyclic-antidepressants');

const tcaTemplate = {
  family: "Antidepressants & Serotonergic Systems",
  familyId: "antidepressants",
  subgroup: "Tricyclic Antidepressants (TCAs)",
  subgroupId: "sg-tca",
  dataSource: "12-Module Master Psychopharmacology Reference Compendium",
  foodRequirement: "Take with or without food. Take at bedtime (QHS) due to potent sedation.",
  specialPopulations: {
    perinatal: "Limited data; cross placenta; potential neonatal withdrawal and anticholinergic symptoms.",
    pediatric: "Risk of sudden cardiac death in high doses; monitor ECG closely.",
    geriatric: "Beers Criteria: Strong anticholinergic burden, high risk of falls, delirium, urinary retention, and orthostatic syncope. Secondary amines (Nortriptyline, Desipramine) preferred over tertiary amines.",
    organImpairment: "Heavily metabolized by hepatic CYP2D6/2C19. Reduce dose in cirrhosis. Monitor closely in renal disease."
  },
  cyp450: {
    substrate: ["CYP2D6", "CYP2C19"],
    inhibits: [],
    induces: [],
    note: "CYP2D6 and CYP2C19 substrates; co-administration with strong 2D6 inhibitors (fluoxetine, paroxetine, bupropion) dramatically elevates TCA blood levels, risking fatal ventricular arrhythmias."
  }
};

const individualTCAs = [
  {
    ...tcaTemplate,
    id: "amitriptyline",
    inn: "amitriptyline",
    name: "Amitriptyline",
    brand: "Elavil, Endep",
    targetDose: "50 - 150 mg QHS (Max 300 mg/day Inpatient)",
    maxDose: "Maximum FDA Approved: 300 mg/day",
    halfLife: "10 to 28 Hours (Mean ~21 h)",
    halfLifeParent: "10 to 28 hours",
    halfLifeActiveMetabolites: "18 to 44 hours (Nortriptyline)",
    benchmarkMetrics: [
      { label: "HISTAMINE H1 AFFINITY", value: "Ki = 1.1 nM", detail: "Extreme sedation & rapid sleep induction" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "10 to 28 Hours", detail: "Active metabolite Nortriptyline: 18-44 h" },
      { label: "CARDIAC NAV1.5 BLOCKADE", value: "Class 1A Antiarrhythmic", detail: "QRS widening >100ms = impending arrhythmia" },
      { label: "TARGET CLINICAL DOSE", value: "50 - 150 mg QHS", detail: "Titrate slowly by 25-50 mg every 3-5 days" }
    ],
    receptors: [
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 95, ki: "1.1 nM", action: "Ultra-Potent Antagonist", clinicalAction: "Extreme sedation, rapid hypnotic sleep induction, and significant appetite/weight increase." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 85, ki: "18 nM", action: "Potent Antagonist", clinicalAction: "Severe anticholinergic load: marked dry mouth, obstipation, blurry vision, delirium." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 85, ki: "24 nM", action: "Antagonist", clinicalAction: "Prominent orthostatic hypotension, postural dizziness, and reflex tachycardia." },
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 85, ki: "4.3 nM", action: "Potent Reuptake Inhibitor", clinicalAction: "Elevates synaptic serotonin, conferring robust antidepressant and neuropathic analgesia." },
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 70, ki: "35 nM", action: "Reuptake Inhibitor", clinicalAction: "Enhances noradrenergic descending pain pathway inhibition." },
      { receptor: "Nav", rawTarget: "Cardiac Fast Sodium Channel (Nav1.5)", occupancy: 80, ki: "~50 nM", action: "Channel Blocker", clinicalAction: "Delays phase 0 cardiac depolarization; lethal wide-complex arrhythmia in overdose." }
    ],
    adverseFootprint: [
      { domain: "Sedation & Somnolence", severity: "Very High", description: "Extreme H1 and alpha-1 sedation" },
      { domain: "Anticholinergic Toxicity", severity: "Severe", description: "Marked central & peripheral M1/M3 blockade" },
      { domain: "Orthostatic Dizziness", severity: "High", description: "Postural blood pressure drop via alpha-1" },
      { domain: "Weight Gain & Metabolic Risk", severity: "High", description: "H1-mediated hyperphagia" },
      { domain: "Cardiac QTc Prolongation", severity: "High", description: "Nav1.5 and hERG conduction delays" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "Moderate", description: "Lowers seizure threshold at >150 mg/d" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "No significant direct striatal D2 blockade" },
      { domain: "Prolactin Elevation", severity: "Sparing", description: "Does not elevate prolactin" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "25 mg QHS · Days 1-3", timing: "Bedtime", directive: "Initiate test dose; evaluate morning sedation and orthostasis." },
      { step: "STEP 2", dose: "50 mg QHS · Days 4-7", timing: "Bedtime", directive: "Ramp dose; monitor anticholinergic side effects and resting pulse." },
      { step: "TARGET", dose: "75 - 150 mg QHS · Week 2+", timing: "Bedtime", directive: "Titrate to therapeutic response. Check ECG if dose exceeds 100 mg/day." }
    ],
    blackBox: {
      title: "SUICIDALITY & LETHALITY IN OVERDOSE",
      warning: "Antidepressants increase the risk of suicidal thoughts and behaviors in pediatric and young adult patients. TCAs have a low therapeutic index; as little as a 1 to 2-week supply (1,000-2,000 mg) can be fatal due to refractory ventricular arrhythmias, hypotension, and intractable seizures. Prescribe in limited quantities for high-risk patients. Treat overdose immediately with IV Sodium Bicarbonate."
    },
    clinicalPearls: [
      "Lethality in Overdose & ECG Clues: QRS duration >100 ms predicts seizure risk; QRS >160 ms predicts life-threatening ventricular arrhythmias. Administer IV Sodium Bicarbonate immediately to alkalinize serum and dislodge TCA from cardiac sodium channels.",
      "Neuropathic Pain Gold Standard: Amitriptyline at low doses (10-50 mg QHS) remains first-line for diabetic peripheral neuropathy, tension headache prophylaxis, and fibromyalgia.",
      "Active Demethylation: Amitriptyline is converted by CYP2C19 into Nortriptyline, shifting its pharmacological balance from serotonergic toward noradrenergic."
    ],
    indications: ["Major Depressive Disorder", "Endogenous Depression"],
    offLabel: ["Neuropathic Pain / Diabetic Neuropathy", "Migraine Prophylaxis", "Fibromyalgia", "Chronic Tension-Type Headache"]
  },
  {
    ...tcaTemplate,
    id: "nortriptyline",
    inn: "nortriptyline",
    name: "Nortriptyline",
    brand: "Pamelor, Aventyl",
    targetDose: "50 - 100 mg/day (Therapeutic Window: 50-150 ng/mL)",
    maxDose: "Maximum FDA Approved: 150 mg/day",
    halfLife: "18 to 44 Hours (Mean ~30 h)",
    halfLifeParent: "18 to 44 hours",
    halfLifeActiveMetabolites: null,
    benchmarkMetrics: [
      { label: "THERAPEUTIC BLOOD WINDOW", value: "50 - 150 ng/mL", detail: "Curvilinear 'Therapeutic Window' (efficacy lost >150 ng/mL)" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "18 to 44 Hours", detail: "Steady-state reached in 4-6 days" },
      { label: "NET SELECTIVITY", value: "Ki = 10 nM (NET > SERT)", detail: "Secondary amine: more noradrenergic, less anticholinergic" },
      { label: "TARGET CLINICAL DOSE", value: "50 - 100 mg/day", detail: "Check trough blood level at steady-state" }
    ],
    receptors: [
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 85, ki: "10 nM", action: "Potent Selective Inhibitor", clinicalAction: "Selective noradrenergic reuptake inhibition drives psychomotor activation, motivation, and analgesic descending pain blockade." },
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 50, ki: "100 nM", action: "Moderate Inhibitor", clinicalAction: "Moderate serotonergic transmission with lower risk of sexual dysfunction than SSRIs." },
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 80, ki: "10 nM", action: "Antagonist", clinicalAction: "Moderate bedtime sedation, significantly less pronounced daytime grogginess than amitriptyline." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 70, ki: "37 nM", action: "Moderate Antagonist", clinicalAction: "Lower anticholinergic burden than tertiary amines; best-tolerated traditional TCA in older adults." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 65, ki: "55 nM", action: "Moderate Antagonist", clinicalAction: "Lower orthostatic liability than amitriptyline or imipramine." },
      { receptor: "Nav", rawTarget: "Cardiac Sodium Channel (Nav1.5)", occupancy: 70, ki: "~80 nM", action: "Channel Blocker", clinicalAction: "Conduction slowing in overdose; monitor baseline ECG in cardiac history." }
    ],
    adverseFootprint: [
      { domain: "Sedation & Somnolence", severity: "Moderate", description: "Less sedative than amitriptyline" },
      { domain: "Anticholinergic Toxicity", severity: "Moderate", description: "Substantially less dry mouth and constipation" },
      { domain: "Orthostatic Dizziness", severity: "Moderate", description: "Lower orthostatic drop than tertiary TCAs" },
      { domain: "Weight Gain & Metabolic Risk", severity: "Moderate", description: "Moderate appetite increase" },
      { domain: "Cardiac QTc Prolongation", severity: "Moderate-High", description: "Nav1.5 and cardiac conduction slowing" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "Moderate", description: "Dose-dependent seizure liability" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "Sparing" },
      { domain: "Prolactin Elevation", severity: "Sparing", description: "Sparing" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "25 mg QHS · Days 1-5", timing: "Bedtime", directive: "Initiate bedtime dose; screen sitting and standing BP." },
      { step: "STEP 2", dose: "50 mg QHS · Days 6-14", timing: "Bedtime", directive: "Increase to standard starting therapeutic dose." },
      { step: "TARGET", dose: "75 - 100 mg QHS · Week 3+", timing: "Bedtime", directive: "Draw 12-hour trough blood level; adjust dose into 50-150 ng/mL window." }
    ],
    blackBox: {
      title: "SUICIDALITY IN YOUNG ADULTS & OVERDOSE TOXICITY",
      warning: "Antidepressants increase suicidal ideation in patients under 25. High-dose overdose triggers fatal cardiac conduction blocks and seizures. Monitor plasma levels."
    },
    clinicalPearls: [
      "The Curvilinear Therapeutic Window: Nortriptyline is famous for its classic curvilinear therapeutic window: clinical efficacy peaks strictly between 50 and 150 ng/mL. Below 50 ng/mL is ineffective; above 150 ng/mL, antidepressant efficacy actually declines and toxicity climbs!",
      "Preferred TCA in the Elderly: Because it causes significantly less orthostatic hypotension, falls, and anticholinergic delirium than tertiary TCAs, Nortriptyline is the consensus TCA of choice in geriatric depression."
    ],
    indications: ["Major Depressive Disorder"],
    offLabel: ["Postherpetic Neuralgia", "Diabetic Neuropathy", "Smoking Cessation", "Chronic Urticaria"]
  },
  {
    ...tcaTemplate,
    id: "clomipramine",
    inn: "clomipramine",
    name: "Clomipramine",
    brand: "Anafranil",
    targetDose: "100 - 250 mg/day (Start 25 mg QHS)",
    maxDose: "Maximum FDA Approved: 250 mg/day (Strict Seizure Ceiling)",
    halfLife: "19 to 37 Hours (Active Desmethylclomipramine: 54-77 h)",
    halfLifeParent: "19 to 37 hours",
    halfLifeActiveMetabolites: "54 to 77 hours (Desmethylclomipramine)",
    benchmarkMetrics: [
      { label: "SEROTONIN TRANSPORTER (SERT)", value: "Ki = 0.14 nM", detail: "Unrivaled sub-nanomolar SERT potency (gold standard in OCD)" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "19 to 37 Hours", detail: "Active noradrenergic metabolite: 54-77 h" },
      { label: "MAXIMUM APPROVED CEILING", value: "250 mg/day", detail: "Seizure risk jumps to 2.1% above 250 mg/day" },
      { label: "TARGET CLINICAL DOSE", value: "100 - 250 mg/day", detail: "Slow ramp to avoid early GI distress and seizures" }
    ],
    receptors: [
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 95, ki: "0.14 nM", action: "Ultra-Potent Inhibitor", clinicalAction: "Sub-nanomolar SERT inhibition delivers peerless clinical efficacy in treatment-resistant OCD, severe melancholic depression, and cataplexy." },
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 80, ki: "1.0 nM", action: "Potent Inhibitor (Metabolite)", clinicalAction: "Active metabolite desmethylclomipramine provides potent noradrenergic reuptake inhibition." },
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 80, ki: "31 nM", action: "Antagonist", clinicalAction: "Sedation and long-term metabolic weight gain." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 80, ki: "36 nM", action: "Antagonist", clinicalAction: "Pronounced dry mouth, constipation, blurry vision, urinary hesitancy." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 80, ki: "38 nM", action: "Antagonist", clinicalAction: "Orthostatic dizziness and reflex tachycardia." },
      { receptor: "5HT2A", rawTarget: "Serotonin 5-HT2A Receptor", occupancy: 80, ki: "27 nM", action: "Antagonist", clinicalAction: "High incidence of delayed ejaculation and complete anorgasmia." },
      { receptor: "Nav", rawTarget: "Cardiac Fast Sodium Channels (Nav1.5)", occupancy: 80, ki: "~60 nM", action: "Channel Blocker", clinicalAction: "Cardiac conduction slowing and wide-complex arrhythmia liability in overdose." }
    ],
    adverseFootprint: [
      { domain: "Sexual Dysfunction (Anorgasmia)", severity: "Severe (>80%)", description: "Profound delayed orgasm / anorgasmia" },
      { domain: "Anticholinergic Toxicity", severity: "Severe", description: "Pronounced dry mouth, constipation, urinary delay" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "High (2.1% >250mg)", description: "Strict 250 mg/day dose ceiling" },
      { domain: "Sedation & Somnolence", severity: "High", description: "H1 and alpha-1 block sedation" },
      { domain: "Weight Gain & Metabolic Risk", severity: "High", description: "Appetite surge and weight gain" },
      { domain: "Orthostatic Dizziness", severity: "High", description: "Postural drop via alpha-1 block" },
      { domain: "Cardiac QTc Prolongation", severity: "Moderate-High", description: "Cardiac conduction risk" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "Sparing" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "25 mg QHS · Days 1-7", timing: "Bedtime", directive: "Initiate low; monitor nausea and anticholinergic tolerance." },
      { step: "STEP 2", dose: "50 - 100 mg QHS · Weeks 2-3", timing: "Bedtime", directive: "Titrate in 25-50 mg increments every 4-7 days." },
      { step: "TARGET", dose: "150 - 250 mg/day · Weeks 4-8", timing: "Bedtime or Divided", directive: "Optimal OCD target. Strictly never exceed 250 mg/day due to sharp seizure surge!" }
    ],
    blackBox: {
      title: "SUICIDALITY IN YOUNG ADULTS & SEIZURE RISK",
      warning: "Black box warning for suicidality in adolescents and young adults. The seizure rate jumps to 2.1% at doses exceeding 250 mg/day. Strictly respect the 250 mg ceiling. Overdose is life-threatening."
    },
    clinicalPearls: [
      "The Gold Standard in Treatment-Resistant OCD: Clomipramine is the most potent serotonergic agent in psychopharmacology (Ki = 0.14 nM). It outperforms all SSRIs in refractory obsessive-compulsive disorder and remains the clinical benchmark.",
      "Dual Metabolite Mechanics: While parent clomipramine is an ultra-potent SERT inhibitor, its primary active metabolite desmethylclomipramine is a potent NET inhibitor, giving it balanced dual serotonergic-noradrenergic reuptake action.",
      "Cataplexy Resolution: Due to intense serotonergic suppression of REM sleep, low-dose clomipramine (25-75 mg/day) rapidly and completely suppresses cataplexy in patients with narcolepsy."
    ],
    indications: ["Obsessive-Compulsive Disorder (OCD)", "Major Depressive Disorder (Inpatient / Severe)"],
    offLabel: ["Cataplexy Associated with Narcolepsy", "Severe Panic Disorder", "Premature Ejaculation", "Treatment-Resistant Depression"]
  },
  {
    ...tcaTemplate,
    id: "imipramine",
    inn: "imipramine",
    name: "Imipramine",
    brand: "Tofranil",
    targetDose: "100 - 200 mg/day (Max 300 mg/day Inpatient)",
    maxDose: "Maximum FDA Approved: 300 mg/day",
    halfLife: "9 to 24 Hours (Active Desipramine: 15-30 h)",
    halfLifeParent: "9 to 24 hours",
    halfLifeActiveMetabolites: "15 to 30 hours (Desipramine)",
    benchmarkMetrics: [
      { label: "SEROTONIN TRANSPORTER (SERT)", value: "Ki = 1.4 nM", detail: "Prototypical dual reuptake blocker" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "9 to 24 Hours", detail: "Desipramine metabolite: 15-30 h" },
      { label: "HISTORIC PROTOTYPE", value: "First TCA (1957)", detail: "Synthesized by Kuhn; benchmark in severe melancholia" },
      { label: "TARGET CLINICAL DOSE", value: "100 - 200 mg/day", detail: "Titrate in 25-50 mg increments" }
    ],
    receptors: [
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 85, ki: "1.4 nM", action: "Potent Inhibitor", clinicalAction: "Potent serotonin reuptake blockade elevates mood and resolves melancholic vegetative symptoms." },
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 80, ki: "0.8 nM (Metabolite)", action: "Potent Inhibitor", clinicalAction: "Active metabolite desipramine provides potent noradrenergic activation." },
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 80, ki: "11 nM", action: "Antagonist", clinicalAction: "Sedation and weight gain." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 80, ki: "46 nM", action: "Antagonist", clinicalAction: "Anticholinergic dryness, urinary bladder sphincter tightening (reduces enuresis)." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 80, ki: "32 nM", action: "Antagonist", clinicalAction: "Orthostatic hypotension." },
      { receptor: "Nav", rawTarget: "Cardiac Sodium Channels (Nav1.5)", occupancy: 80, ki: "~70 nM", action: "Channel Blocker", clinicalAction: "Arrhythmia liability in toxic ingestion." }
    ],
    adverseFootprint: [
      { domain: "Sedation & Somnolence", severity: "High", description: "H1 and alpha-1 sedation" },
      { domain: "Anticholinergic Toxicity", severity: "Severe", description: "Substantial dry mouth and constipation" },
      { domain: "Orthostatic Dizziness", severity: "High", description: "Orthostatic blood pressure drops" },
      { domain: "Weight Gain & Metabolic Risk", severity: "Moderate-High", description: "Appetite stimulation" },
      { domain: "Cardiac QTc Prolongation", severity: "Moderate-High", description: "Conduction delay" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "Moderate", description: "Dose-dependent seizure risk" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "Sparing" },
      { domain: "Prolactin Elevation", severity: "Sparing", description: "Sparing" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "25 - 50 mg QHS · Days 1-4", timing: "Bedtime", directive: "Screen baseline ECG; assess orthostasis." },
      { step: "STEP 2", dose: "75 - 100 mg QHS · Days 5-14", timing: "Bedtime", directive: "Increase gradually toward outpatient target." },
      { step: "TARGET", dose: "150 - 200 mg/day · Week 3+", timing: "Bedtime or Divided", directive: "Standard maintenance range for melancholic depression." }
    ],
    blackBox: {
      title: "SUICIDALITY & FATAL CARDIOTOXICITY",
      warning: "Antidepressants carry suicidal risk warnings in young adults. Cardiotoxic in overdose."
    },
    clinicalPearls: [
      "The Pioneer of Modern Psychopharmacology: Discovered in 1957 by Roland Kuhn while searching for chlorpromazine derivatives, Imipramine was the very first tricyclic antidepressant.",
      "Pediatric Enuresis Indication: Imipramine is FDA-approved for childhood nocturnal enuresis due to combined peripheral M3 detrusor relaxation and lightening of deep sleep."
    ],
    indications: ["Major Depressive Disorder", "Nocturnal Enuresis in Pediatric Patients (>= 6 years)"],
    offLabel: ["Panic Disorder", "Chronic Neuropathic Pain", "ADHD (Second-Line)"]
  },
  {
    ...tcaTemplate,
    id: "desipramine",
    inn: "desipramine",
    name: "Desipramine",
    brand: "Norpramin",
    targetDose: "100 - 200 mg/day (Max 300 mg/day)",
    maxDose: "Maximum FDA Approved: 300 mg/day",
    halfLife: "15 to 30 Hours",
    halfLifeParent: "15 to 30 hours",
    halfLifeActiveMetabolites: null,
    benchmarkMetrics: [
      { label: "NET SELECTIVITY", value: "Ki = 0.8 nM", detail: "Purest & most potent selective noradrenergic TCA" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "15 to 30 Hours", detail: "Once-daily dosing feasible" },
      { label: "HISTAMINE H1 AFFINITY", value: "Ki = 110 nM", detail: "Lowest sedation among all classical TCAs" },
      { label: "TARGET CLINICAL DOSE", value: "100 - 200 mg/day", detail: "Therapeutic plasma window: >125 ng/mL" }
    ],
    receptors: [
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 95, ki: "0.8 nM", action: "Ultra-Potent Selective Inhibitor", clinicalAction: "Sub-nanomolar NET blockade drives intense noradrenergic vigilance, executive activation, psychomotor energy, and analgesic gating." },
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 60, ki: "17 nM", action: "Moderate Inhibitor", clinicalAction: "Weak relative serotonergic reuptake inhibition." },
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 40, ki: "110 nM", action: "Weak Antagonist", clinicalAction: "Lowest sedative liability among traditional TCAs; rarely causes daytime stupor." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 50, ki: "100 nM", action: "Weak-Moderate Antagonist", clinicalAction: "Lowest anticholinergic burden among all classical TCAs." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 50, ki: "100 nM", action: "Weak-Moderate Antagonist", clinicalAction: "Lower orthostatic dizziness than tertiary TCAs." },
      { receptor: "Nav", rawTarget: "Cardiac Sodium Channels (Nav1.5)", occupancy: 75, ki: "~80 nM", action: "Channel Blocker", clinicalAction: "Slows cardiac conduction; sudden death reported in children; obtain baseline ECG." }
    ],
    adverseFootprint: [
      { domain: "Insomnia & Activation", severity: "Moderate-High", description: "Noradrenergic psychomotor stimulation" },
      { domain: "Cardiac QTc Prolongation", severity: "Moderate-High", description: "Nav1.5 and conduction slowing" },
      { domain: "Anticholinergic Toxicity", severity: "Low-Moderate", description: "Lowest anticholinergic load among TCAs" },
      { domain: "Sedation & Somnolence", severity: "Low", description: "Minimal daytime sedation" },
      { domain: "Orthostatic Dizziness", severity: "Moderate", description: "Moderate alpha-1 drop" },
      { domain: "Weight Gain & Metabolic Risk", severity: "Low", description: "Minimal H1-driven weight gain" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "Moderate", description: "Dose-dependent seizure risk" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "Sparing" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "25 - 50 mg/day · Days 1-5", timing: "Morning", directive: "Give in morning due to activating noradrenergic profile." },
      { step: "STEP 2", dose: "75 - 100 mg/day · Days 6-14", timing: "Morning", directive: "Increase in 25-50 mg increments." },
      { step: "TARGET", dose: "150 - 200 mg/day · Week 3+", timing: "Morning or Divided", directive: "Target plasma concentration >125 ng/mL." }
    ],
    blackBox: {
      title: "SUICIDALITY & PEDIATRIC CARDIAC RISK",
      warning: "Antidepressants carry suicidal risk warnings in young adults. Sudden death reported in pediatric patients; ECG monitoring mandatory."
    },
    clinicalPearls: [
      "The Purest Noradrenergic TCA: Desipramine is a secondary amine with exquisite selectivity for NET (Ki = 0.8 nM), making it an ideal choice when psychomotor retardation, severe fatigue, or ADHD co-morbidities predominate.",
      "Morning Dosing: Because it has minimal H1 blockade and produces noradrenergic alertness, Desipramine is typically administered in the morning rather than at bedtime."
    ],
    indications: ["Major Depressive Disorder"],
    offLabel: ["Adult ADHD (Non-Stimulant Alternative)", "Neuropathic Pain", "Bulimia Nervosa"]
  },
  {
    ...tcaTemplate,
    id: "doxepin",
    inn: "doxepin",
    name: "Doxepin",
    brand: "Silenor, Sinequan",
    targetDose: "3 - 6 mg QHS (Insomnia) · 75 - 150 mg/day (Depression)",
    maxDose: "Maximum FDA Approved: 300 mg/day (Depression), 6 mg/day (Insomnia)",
    halfLife: "15 to 24 Hours (Active Nordoxepin: 30-40 h)",
    halfLifeParent: "15 to 24 hours",
    halfLifeActiveMetabolites: "30 to 40 hours (Nordoxepin)",
    benchmarkMetrics: [
      { label: "HISTAMINE H1 AFFINITY", value: "Ki = 0.24 nM", detail: "Sub-nanomolar H1 potency gives pure hypnotic action at 3-6 mg" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "15 to 24 Hours", detail: "Active metabolite Nordoxepin: 30-40 h" },
      { label: "DUAL INDICATION SPLIT", value: "Low-Dose: Insomnia", detail: "High-Dose (75-300 mg): Antidepressant" },
      { label: "TARGET CLINICAL DOSE", value: "3 - 6 mg (Sleep) / 75-150 mg", detail: "Silenor 3-6 mg approved for sleep maintenance" }
    ],
    receptors: [
      { receptor: "H1", rawTarget: "Histamine H1 Receptor", occupancy: 95, ki: "0.24 nM", action: "Ultra-Potent Sub-Nanomolar Antagonist", clinicalAction: "Unsurpassed H1 selectivity at low doses (3-6 mg) induces and maintains sleep without anticholinergic, antiadrenergic, or habit-forming liabilities." },
      { receptor: "M1", rawTarget: "Muscarinic M1 Receptor", occupancy: 75, ki: "50 nM", action: "Antagonist (High Doses)", clinicalAction: "Anticholinergic effects only emerge at full antidepressant doses (>75 mg/day)." },
      { receptor: "Alpha1", rawTarget: "Alpha-1A Adrenergic Receptor", occupancy: 80, ki: "24 nM", action: "Antagonist (High Doses)", clinicalAction: "Orthostatic dizziness at high antidepressant doses." },
      { receptor: "SERT", rawTarget: "Serotonin Transporter", occupancy: 70, ki: "68 nM", action: "Reuptake Inhibitor (High Doses)", clinicalAction: "Contributes to mood elevation at full antidepressant dosing." },
      { receptor: "NET", rawTarget: "Norepinephrine Transporter", occupancy: 75, ki: "30 nM", action: "Reuptake Inhibitor (High Doses)", clinicalAction: "Active nordoxepin inhibits noradrenaline reuptake." },
      { receptor: "Nav", rawTarget: "Cardiac Fast Sodium Channels", occupancy: 70, ki: "~90 nM", action: "Channel Blocker", clinicalAction: "Cardiac conduction risk only in high-dose overdose." }
    ],
    adverseFootprint: [
      { domain: "Sedation & Somnolence", severity: "Very High (High Doses) / Moderate (Low)", description: "Profound H1-driven sleepiness" },
      { domain: "Anticholinergic Toxicity", severity: "Low (at 3-6 mg) / High (at >75 mg)", description: "Virtually zero anticholinergic load at low hypnotic doses" },
      { domain: "Weight Gain & Metabolic Risk", severity: "Moderate-High", description: "H1-mediated appetite stimulation" },
      { domain: "Orthostatic Dizziness", severity: "Moderate (at >75 mg)", description: "Alpha-1 blockade at high doses" },
      { domain: "Cardiac QTc Prolongation", severity: "Moderate", description: "Conduction delay in overdose" },
      { domain: "Seizure Induction (Dose-Dependent)", severity: "Low-Moderate", description: "Dose-dependent" },
      { domain: "Extrapyramidal Symptoms (EPS)", severity: "Near Zero", description: "Sparing" },
      { domain: "Prolactin Elevation", severity: "Sparing", description: "Sparing" }
    ],
    titrationSchedule: [
      { step: "INSOMNIA", dose: "3 - 6 mg QHS", timing: "Bedtime (within 30m)", directive: "Low-dose Silenor protocol for sleep maintenance insomnia; take on empty stomach." },
      { step: "DEPRESSION STEP 1", dose: "25 - 50 mg QHS", timing: "Bedtime", directive: "Initiate traditional TCA antidepressant titration." },
      { step: "DEPRESSION TARGET", dose: "75 - 150 mg QHS", timing: "Bedtime", directive: "Standard therapeutic range for major depressive disorder." }
    ],
    blackBox: {
      title: "SUICIDALITY IN YOUNG ADULTS",
      warning: "Antidepressants carry suicidal risk warnings in adolescents and young adults."
    },
    clinicalPearls: [
      "The Low-Dose Insomnia Miracle (Silenor): Doxepin possesses the highest affinity for histamine H1 receptors of any known drug (Ki = 0.24 nM). At 3 to 6 mg, it selectively saturates brain H1 receptors to treat sleep maintenance insomnia with zero anticholinergic side effects and zero addiction potential!",
      "Non-Scheduled Sleep Aid: Unlike benzodiazepines and Z-drugs, low-dose Doxepin is not a controlled substance, produces no physical dependence, and does not cause rebound insomnia upon discontinuation."
    ],
    indications: ["Major Depressive Disorder", "Insomnia Characterized by Difficulties with Sleep Maintenance (Silenor 3-6 mg)"],
    offLabel: ["Chronic Urticaria / Pruritus", "Fibromyalgia", "Anxiety Neurosis"]
  }
];

data.drugs.push(...individualTCAs);
console.log('Added 6 individual TCAs');

// 11. Individual MAOIs (replacing maois-emsam-patch)
data.drugs = data.drugs.filter(d => d.id !== 'maois-emsam-patch');

const maoiTemplate = {
  family: "Antidepressants & Serotonergic Systems",
  familyId: "antidepressants",
  subgroup: "Monoamine Oxidase Inhibitors (MAOIs)",
  subgroupId: "sg-maoi",
  dataSource: "12-Module Master Psychopharmacology Reference Compendium",
  foodRequirement: "Strict low-tyramine diet required (avoid aged cheeses, draft beer, tap beer, aged/fermented meats, soy sauce, Marmite, fava beans). Exception: Selegiline 6 mg/24h patch and low-dose moclobemide.",
  specialPopulations: {
    perinatal: "Contraindicated; severe hemodynamic instability and malformations.",
    pediatric: "Not recommended in children.",
    geriatric: "Severe orthostatic hypotension risk; initiate at fractionated low doses; monitor sitting and standing blood pressure.",
    organImpairment: "Caution in severe hepatic impairment. Avoid in pheochromocytoma and severe cardiovascular disease."
  },
  cyp450: {
    substrate: [],
    inhibits: [],
    induces: [],
    note: "ABSOLUTELY CONTRAINDICATED with serotonergic agents (SSRIs, SNRIs, TCAs, St John's Wort, Meperidine, Dextromethorphan, Tramadol, MDMA) due to fatal Serotonin Syndrome. Strict 14-day washout required before or after (5 weeks after Fluoxetine)!"
  }
};

const individualMAOIs = [
  {
    ...maoiTemplate,
    id: "phenelzine",
    inn: "phenelzine",
    name: "Phenelzine",
    brand: "Nardil",
    targetDose: "45 - 90 mg/day (Start 15 mg TID)",
    maxDose: "Maximum FDA Approved: 90 mg/day",
    halfLife: "1.5 to 4 Hours (Irreversible enzyme inhibition persists 14 days)",
    halfLifeParent: "1.5 to 4 hours",
    halfLifeActiveMetabolites: "Irreversible suicide inhibition lasts 2 weeks",
    benchmarkMetrics: [
      { label: "MAO-A & MAO-B INHIBITION", value: "Irreversible Dual Block", detail: "Inactivates catalytic flavin adenine dinucleotide" },
      { label: "GABA-TRANSAMINASE BLOCK", value: "Elevates Brain GABA", detail: "Unique anxiolytic GABA elevation" },
      { label: "ENZYME RECOVERY WASHOUT", value: "14 Days", detail: "Requires de novo enzyme protein synthesis" },
      { label: "TARGET CLINICAL DOSE", value: "45 - 90 mg/day", detail: "Divided doses; target 1 mg/kg" }
    ],
    receptors: [
      { receptor: "MAO-A", rawTarget: "Monoamine Oxidase A", occupancy: 95, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Prevents catalytic deamination of serotonin, norepinephrine, and dopamine, profoundly reversing melancholic and atypical depressive symptoms." },
      { receptor: "MAO-B", rawTarget: "Monoamine Oxidase B", occupancy: 95, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Blocks breakdown of dopamine and trace amines, enhancing psychomotor drive." },
      { receptor: "GABAB", rawTarget: "GABA Transaminase (Enzymatic)", occupancy: 80, ki: "Direct Inhibition", action: "Metabolic Elevating Agent", clinicalAction: "Inhibits GABA-T, increasing central GABA levels to produce profound, unique anxiolysis and emotional stabilization in panic and social phobia." }
    ],
    adverseFootprint: [
      { domain: "Hypertensive Crisis (Tyramine)", severity: "Severe (Dietary Hazard)", description: "Tyramine cheese reaction" },
      { domain: "Orthostatic Hypotension / Dizziness", severity: "High (Paradoxical)", description: "False neurotransmitter accumulation (octopamine)" },
      { domain: "Weight Gain & Metabolic Risk", severity: "High", description: "Significant appetite surge & fluid retention" },
      { domain: "Sexual Dysfunction (Anorgasmia)", severity: "High", description: "Marked delayed ejaculation and anorgasmia" },
      { domain: "Sedation & Daytime Calming", severity: "Moderate", description: "GABAergic daytime somnolence" },
      { domain: "Discontinuation Rebound Storm", severity: "Severe", description: "Severe rebound insomnia, agitation, and psychosis" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "15 mg TID (45 mg/d) · Days 1-7", timing: "Divided Morning/Noon", directive: "Initiate strict low-tyramine diet. Check baseline supine and standing blood pressure." },
      { step: "STEP 2", dose: "60 mg/day · Weeks 2-4", timing: "Divided Morning/Noon", directive: "Assess orthostatic blood pressure drop; ensure morning/noon administration." },
      { step: "TARGET", dose: "60 - 90 mg/day · Weeks 4-8", timing: "Divided Morning/Noon", directive: "Target range (~1 mg/kg). Re-evaluate atypical depression response and platelet MAO block." }
    ],
    blackBox: {
      title: "SUICIDALITY, HYPERTENSIVE CRISIS & SEROTONIN SYNDROME",
      warning: "Ingestion of tyramine-rich foods or sympathomimetics causes lethal hypertensive crisis. Co-administration with serotonergic medications causes fatal serotonin syndrome. Strict 14-day washout mandatory."
    },
    clinicalPearls: [
      "The Gold Standard for Atypical Depression: Phenelzine is the most efficacious medication known in clinical psychiatry for atypical depression characterized by mood reactivity, leaden paralysis, hypersomnia, hyperphagia, and severe interpersonal rejection sensitivity.",
      "The GABA Transaminase Secret: Unlike other MAOIs, phenelzine inhibits GABA transaminase, significantly raising central brain GABA concentrations. This confers unparalleled anti-panic and social anxiety efficacy.",
      "The Paradoxical Orthostatic Drop: While physicians fear hypertension from cheese, the most common daily side effect is severe orthostatic hypotension caused by the accumulation of the false sympathetic neurotransmitter octopamine."
    ],
    indications: ["Major Depressive Disorder with Atypical Features", "Treatment-Resistant Major Depressive Disorder"],
    offLabel: ["Treatment-Resistant Panic Disorder", "Severe Social Anxiety Disorder", "Refractory Bulimia"]
  },
  {
    ...maoiTemplate,
    id: "tranylcypromine",
    inn: "tranylcypromine",
    name: "Tranylcypromine",
    brand: "Parnate",
    targetDose: "30 - 60 mg/day (Divided Morning & Midday)",
    maxDose: "Maximum FDA Approved: 60 mg/day",
    halfLife: "1.5 to 3 Hours (Irreversible enzyme inhibition persists 14 days)",
    halfLifeParent: "1.5 to 3 hours",
    halfLifeActiveMetabolites: "Irreversible suicide block lasts 14 days",
    benchmarkMetrics: [
      { label: "MAO-A & MAO-B INHIBITION", value: "Irreversible Dual Block", detail: "Fastest onset among classical MAOIs" },
      { label: "AMPHETAMINE CONGENER", value: "Dopamine Releaser", detail: "Direct monoamine release & reuptake block" },
      { label: "ENZYME RECOVERY WASHOUT", value: "14 Days", detail: "Requires de novo enzyme protein synthesis" },
      { label: "TARGET CLINICAL DOSE", value: "30 - 60 mg/day", detail: "Give morning and midday; avoid bedtime insomnia" }
    ],
    receptors: [
      { receptor: "MAO-A", rawTarget: "Monoamine Oxidase A", occupancy: 95, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Prevents catabolism of serotonin and norepinephrine, delivering rapid energizing antidepressant action." },
      { receptor: "MAO-B", rawTarget: "Monoamine Oxidase B", occupancy: 95, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Spires dopamine and phenylethylamine breakdown, promoting executive drive." },
      { receptor: "DAT", rawTarget: "Dopamine Transporter", occupancy: 60, ki: "Direct Releaser / Blocker", action: "Sympathomimetic Stimulant Action", clinicalAction: "Structurally derived from amphetamine; directly promotes dopamine and norepinephrine release in nucleus accumbens and prefrontal cortex." }
    ],
    adverseFootprint: [
      { domain: "Insomnia & Psychomotor Activation", severity: "Very High", description: "Stimulant-like midnight insomnia" },
      { domain: "Hypertensive Crisis (Tyramine)", severity: "Severe (Dietary Hazard)", description: "Hypertensive reaction upon tyramine ingestion" },
      { domain: "Orthostatic Hypotension / Dizziness", severity: "High", description: "Postural blood pressure drop" },
      { domain: "Weight Gain Liability", severity: "Low", description: "Often weight-neutral or weight loss (unlike phenelzine)" },
      { domain: "Sexual Dysfunction Liability", severity: "Moderate", description: "Moderate sexual dysfunction" },
      { domain: "Discontinuation Rebound Storm", severity: "Severe", description: "Severe rebound crash upon sudden cessation" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "10 mg BID (20 mg/d) · Days 1-7", timing: "Morning & Midday", directive: "Strict low-tyramine diet. Administer at breakfast and lunch; never late afternoon." },
      { step: "STEP 2", dose: "30 mg/day · Weeks 2-3", timing: "20 mg AM + 10 mg Noon", directive: "Increase toward standard response window." },
      { step: "TARGET", dose: "40 - 60 mg/day · Weeks 4+", timing: "Divided Morning/Noon", directive: "Standard effective dose for treatment-resistant melancholic depression." }
    ],
    blackBox: {
      title: "SUICIDALITY, HYPERTENSIVE CRISIS & SEROTONIN SYNDROME",
      warning: "Black box warning for tyramine hypertensive crisis and fatal serotonin syndrome with serotonergic drugs. Strict 14-day washout required."
    },
    clinicalPearls: [
      "The Activating Stimulant MAOI: Structurally derived from cyclopropyl-amphetamine, Tranylcypromine is the most activating and energizing MAOI. It is the premier agent for severe anergic, retarded, melancholic depression where patients cannot get out of bed.",
      "Weight-Neutral / Weight Loss: Unlike Phenelzine (which causes significant weight gain and edema), Tranylcypromine is frequently weight-neutral or causes mild weight loss due to its anorectic amphetamine-like properties.",
      "Strict Daytime Dosing: Due to intense CNS stimulation, Tranylcypromine should be taken upon awakening and at noon; taking doses after 3:00 PM guarantees intractable sleep-onset insomnia."
    ],
    indications: ["Major Depressive Disorder without Melancholia or with Treatment-Resistance"],
    offLabel: ["Bipolar Depression (with Mood Stabilizer)", "Severe Anhedonia", "Treatment-Resistant Dysthymia"]
  },
  {
    ...maoiTemplate,
    id: "selegiline",
    inn: "selegiline",
    name: "Selegiline Transdermal",
    brand: "Emsam (Transdermal Patch), Zelapar, Eldepryl",
    targetDose: "6 mg / 24 hours (No Tyramine Diet) · 9 - 12 mg / 24h",
    maxDose: "Maximum FDA Approved: 12 mg / 24 hours",
    halfLife: "Transdermal patch maintains continuous 24h plateau (Oral t½: 1.5-2 h)",
    halfLifeParent: "Transdermal steady-state",
    halfLifeActiveMetabolites: "L-methamphetamine & L-amphetamine metabolites",
    benchmarkMetrics: [
      { label: "DIETARY RESTRICTION BYPASS", value: "6 mg/24h = No Diet!", detail: "Transdermal route spares gut & hepatic MAO-A" },
      { label: "MAO-A & MAO-B INHIBITION", value: "Irreversible Dual Block", detail: "Central brain MAO-A/B inhibition with dermal delivery" },
      { label: "METABOLIC METABOLITES", value: "L-Amphetamine derivatives", detail: "Mild pro-cognitive dopamine surge" },
      { label: "TARGET CLINICAL DOSE", value: "6 - 12 mg / 24 hours", detail: "Start at 6 mg/24h patch once daily" }
    ],
    receptors: [
      { receptor: "MAO-B", rawTarget: "Monoamine Oxidase B", occupancy: 95, ki: "Sub-nanomolar", action: "Irreversible Selective Inactivation", clinicalAction: "High-affinity MAO-B suicide inhibition spares dopamine and PEA in the basal ganglia and frontal cortex." },
      { receptor: "MAO-A", rawTarget: "Monoamine Oxidase A", occupancy: 85, ki: "Irreversible (at 6-12mg patch)", action: "Suicide Inactivation", clinicalAction: "Transdermal delivery achieves robust central brain MAO-A inhibition without blocking intestinal MAO-A, conferring full antidepressant efficacy." },
      { receptor: "DAT", rawTarget: "Dopamine Transporter", occupancy: 50, ki: "Weak Allosteric", action: "Dopaminergic Tone", clinicalAction: "Downstream L-amphetamine metabolites provide subtle dopaminergic focus." }
    ],
    adverseFootprint: [
      { domain: "Application Site Reaction", severity: "Moderate-High (Erythema)", description: "Local dermal irritation from patch adhesive" },
      { domain: "Insomnia & Sleep Disruption", severity: "Moderate-High", description: "Mild dopaminergic activation" },
      { domain: "Orthostatic Hypotension", severity: "Moderate", description: "Vasomotor postural drop" },
      { domain: "Hypertensive Crisis (Tyramine)", severity: "Low (at 6 mg/24h) / High (at 9-12 mg)", description: "No dietary restrictions needed at 6 mg/24h!" },
      { domain: "Weight Gain Liability", severity: "Low (Weight Neutral)", description: "Typically weight neutral" },
      { domain: "Sexual Dysfunction Liability", severity: "Low", description: "Much lower sexual dysfunction than oral MAOIs" }
    ],
    titrationSchedule: [
      { step: "TARGET 1", dose: "6 mg / 24 hours Patch · Weeks 1-4", timing: "Once Daily (24h)", directive: "Apply once daily to dry upper torso/arm. NO TYRAMINE DIET RESTRICTION REQUIRED AT THIS DOSE!" },
      { step: "TARGET 2", dose: "9 mg / 24 hours Patch · Week 4+", timing: "Once Daily (24h)", directive: "Increase if response incomplete. STRICT TYRAMINE DIETARY RESTRICTION MANDATORY AT 9 & 12 MG!" },
      { step: "TARGET 3", dose: "12 mg / 24 hours Patch · Week 8+", timing: "Once Daily (24h)", directive: "Maximum approved transdermal dose. Tyramine dietary restriction required." }
    ],
    blackBox: {
      title: "SUICIDALITY & TYRAMINE WARNING AT HIGH DOSES",
      warning: "Suicide risk warning in young adults. Dietary tyramine restrictions are NOT required at 6 mg/24 hours, but ARE REQUIRED at 9 mg/24 hours and 12 mg/24 hours. Washout periods apply."
    },
    clinicalPearls: [
      "The Transdermal Revolution (No Diet at 6 mg!): Emsam bypasses first-pass gastrointestinal and hepatic metabolism. At 6 mg/24h, it achieves therapeutic MAO-A and MAO-B inhibition in the brain while intestinal MAO-A remains intact to detoxify dietary tyramine. Patients can eat cheese, tap beer, and aged meats safely!",
      "Diet Rules at 9 mg and 12 mg: At 9 mg and 12 mg/24h, systemic drug concentrations begin inhibiting peripheral gut MAO-A; at these higher doses, the standard low-tyramine diet becomes strictly mandatory.",
      "Patch Rotation: Rotate application site daily (upper torso, upper outer arm, lower back) to minimize skin erythema."
    ],
    indications: ["Major Depressive Disorder"],
    offLabel: ["Parkinsonian Depression", "Treatment-Resistant Bipolar Depression", "Atypical Depression"]
  },
  {
    ...maoiTemplate,
    id: "isocarboxazid",
    inn: "isocarboxazid",
    name: "Isocarboxazid",
    brand: "Marplan",
    targetDose: "30 - 60 mg/day (Divided Doses)",
    maxDose: "Maximum FDA Approved: 60 mg/day",
    halfLife: "Irreversible hydrazine inhibitor; enzyme regeneration takes 14 days",
    halfLifeParent: "Rapid elimination; covalent blockade",
    halfLifeActiveMetabolites: "14-day tissue recovery",
    benchmarkMetrics: [
      { label: "MAO-A & MAO-B INHIBITION", value: "Irreversible Hydrazine", detail: "Potent balanced monoamine elevation" },
      { label: "ENZYME RECOVERY WASHOUT", value: "14 Days", detail: "Requires de novo enzyme protein synthesis" },
      { label: "TARGET CLINICAL DOSE", value: "30 - 60 mg/day", detail: "Divided BID to QID dosing" }
    ],
    receptors: [
      { receptor: "MAO-A", rawTarget: "Monoamine Oxidase A", occupancy: 90, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Blocks degradation of 5-HT and NE, elevating synaptic neurotransmitters." },
      { receptor: "MAO-B", rawTarget: "Monoamine Oxidase B", occupancy: 90, ki: "Irreversible", action: "Suicide Inactivation", clinicalAction: "Prevents degradation of DA and phenylethylamine." }
    ],
    adverseFootprint: [
      { domain: "Hypertensive Crisis (Tyramine)", severity: "Severe (Dietary Hazard)", description: "Requires strict tyramine avoidance" },
      { domain: "Orthostatic Hypotension / Dizziness", severity: "High", description: "Postural drop" },
      { domain: "Sedation & Somnolence", severity: "Moderate", description: "Moderate daytime sedation" },
      { domain: "Weight Gain Liability", severity: "Moderate", description: "Appetite increase" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "10 mg BID (20 mg/d) · Days 1-4", timing: "Divided", directive: "Initiate strict tyramine restriction. Screen sitting and standing blood pressure." },
      { step: "STEP 2", dose: "10 mg TID (30 mg/d) · Days 5-14", timing: "Divided", directive: "Increase toward baseline therapeutic dose." },
      { step: "TARGET", dose: "40 - 60 mg/day · Weeks 3+", timing: "Divided", directive: "Target maintenance range for refractory depression." }
    ],
    blackBox: {
      title: "SUICIDALITY & DIETARY RESTRICTIONS",
      warning: "Black box warning for suicidality in young adults and fatal tyramine interactions. 14-day washout mandatory."
    },
    clinicalPearls: [
      "The Balanced Hydrazine Alternative: Isocarboxazid offers an intermediate clinical profile between the heavily sedating/GABAergic Phenelzine and the stimulating Tranylcypromine.",
      "Dosing Nuance: Once maximum clinical benefit is achieved, the dose can often be cautiously reduced to a lower maintenance dose (e.g. 10-20 mg/day) while preserving full efficacy."
    ],
    indications: ["Major Depressive Disorder without Endogenous Features"],
    offLabel: ["Refractory Agoraphobia", "Panic Disorder"]
  },
  {
    ...maoiTemplate,
    id: "moclobemide",
    inn: "moclobemide",
    name: "Moclobemide",
    brand: "Manerix, Aurorix",
    targetDose: "300 - 600 mg/day in divided doses (Post-Meal)",
    maxDose: "600 mg/day (Up to 900 mg/day in specialized refractory protocols)",
    halfLife: "1 to 3 Hours (Rapidly Reversible in 24 Hours)",
    halfLifeParent: "1 to 3 hours",
    halfLifeActiveMetabolites: null,
    benchmarkMetrics: [
      { label: "RIMA CLASSIFICATION", value: "Reversible MAO-A Inhibitor", detail: "Tyramine competitively displaces moclobemide; no 'cheese effect'!" },
      { label: "ELIMINATION HALF-LIFE (t½)", value: "1 to 3 Hours", detail: "Washout is only 24 hours (vs 14 days for irreversible MAOIs)" },
      { label: "DIETARY RESTRICTION STATUS", value: "Zero Tyramine Diet Needed", detail: "Safe with cheese under normal clinical doses" },
      { label: "TARGET CLINICAL DOSE", value: "300 - 600 mg/day", detail: "Administer immediately after meals" }
    ],
    receptors: [
      { receptor: "MAO-A", rawTarget: "Monoamine Oxidase A", occupancy: 85, ki: "Reversible Inhibitor", action: "Reversible Competitive Inactivation", clinicalAction: "Reversibly inhibits MAO-A, increasing synaptic 5-HT and NE. Ingested tyramine competitively displaces moclobemide from the enzyme, protecting against hypertensive crises." }
    ],
    adverseFootprint: [
      { domain: "Insomnia & Mild Restlessness", severity: "Moderate", description: "Take last dose before 5 PM" },
      { domain: "Nausea & GI Discomfort", severity: "Mild-Moderate", description: "Take after meals" },
      { domain: "Orthostatic Hypotension", severity: "Low", description: "Substantially lower orthostasis than irreversible MAOIs" },
      { domain: "Hypertensive Crisis (Tyramine)", severity: "Minimal / Rare", description: "Reversible displacement protects against tyramine toxicity" },
      { domain: "Weight Gain Liability", severity: "Low (Weight Neutral)", description: "Weight neutral" },
      { domain: "Sexual Dysfunction Liability", severity: "Low", description: "Minimal sexual dysfunction" }
    ],
    titrationSchedule: [
      { step: "STEP 1", dose: "150 mg BID (300 mg/d) · Days 1-7", timing: "Post-Meal", directive: "Take immediately after breakfast and lunch to enhance bioavailability and minimize nausea." },
      { step: "TARGET", dose: "300 mg BID (600 mg/d) · Weeks 2+", timing: "Post-Meal", directive: "Standard therapeutic dose for major depression and social anxiety disorder." }
    ],
    blackBox: null,
    clinicalPearls: [
      "The 'Cheese Reaction' Shield: Because Moclobemide is a Reversible Inhibitor of MAO-A (RIMA), dietary tyramine displaces the drug from MAO-A in the gut, allowing tyramine to be safely metabolized. Patients do NOT need a special tyramine diet under standard therapeutic doses!",
      "The 24-Hour Washout Advantage: Unlike irreversible MAOIs that require a grueling 14-day washout before switching medications, Moclobemide's reversible block clears completely within 24 hours, dramatically facilitating cross-titration.",
      "Post-Prandial Administration: Always instruct patients to take Moclobemide immediately after meals; food blunts any potential transient tyramine absorption surges and optimizes absorption."
    ],
    indications: ["Major Depressive Disorder", "Social Anxiety Disorder (Social Phobia)"],
    offLabel: ["Panic Disorder", "Smoking Cessation", "ADHD"]
  }
];

data.drugs.push(...individualMAOIs);
console.log('Added 5 individual MAOIs');

// 12. Bipolar Medication: Fix Quetiapine, Levetiracetam, Lacosamide
const quetiapineMS = data.drugs.find(d => d.id === 'quetiapine-mood-stabilizers');
if (quetiapineMS) {
  quetiapineMS.subgroupId = 'sg-bipolar-antipsychotics';
  quetiapineMS.subgroup = 'Atypical Antipsychotics in Bipolar Disorder';
  console.log('Moved quetiapine-mood-stabilizers to sg-bipolar-antipsychotics');
}

const levetiracetamMS = data.drugs.find(d => d.id === 'levetiracetam');
if (levetiracetamMS) {
  levetiracetamMS.subgroupId = 'sg-anticonvulsants';
  levetiracetamMS.subgroup = 'Anticonvulsant Mood Stabilizers';
  console.log('Moved levetiracetam to sg-anticonvulsants');
}

const lacosamideMS = data.drugs.find(d => d.id === 'lacosamide');
if (lacosamideMS) {
  lacosamideMS.subgroupId = 'sg-anticonvulsants';
  lacosamideMS.subgroup = 'Anticonvulsant Mood Stabilizers';
  console.log('Moved lacosamide to sg-anticonvulsants');
}

// 13. Anxiolytics: Triazolam, Midazolam, Z-drugs, DORAs, Ramelteon, Diazepam
const diazepam = data.drugs.find(d => d.id === 'diazepam');
if (diazepam) {
  diazepam.halfLife = 'Parent: 20-50 h · Active (Nordiazepam): 36-100+ h';
  diazepam.halfLifeParent = '20 to 50 hours';
  diazepam.halfLifeActiveMetabolites = '36 to 100+ hours (Desmethyldiazepam / Nordiazepam)';
  const hlMetric = diazepam.benchmarkMetrics.find(b => b.label.includes('HALF-LIFE'));
  if (hlMetric) {
    hlMetric.value = 'Parent: 20-50 h · Active: 36-100+ h';
    hlMetric.detail = 'Active metabolite nordiazepam causes long-term accumulation';
  } else {
    diazepam.benchmarkMetrics.unshift({
      label: 'ELIMINATION HALF-LIFE (t½)',
      value: 'Parent: 20-50 h · Active: 36-100+ h',
      detail: 'Active metabolite nordiazepam causes long-term accumulation'
    });
  }
  console.log('Updated Diazepam half-life');
}

const midazolam = data.drugs.find(d => d.id === 'midazolam');
if (midazolam) {
  midazolam.subgroupId = 'sg-bzd';
  midazolam.subgroup = 'Benzodiazepines (BZDs)';
  midazolam.receptors = [
    {
      receptor: "GABAA",
      rawTarget: "GABA-A Receptor Complex (Alpha-1/2/3/5 Subunits)",
      occupancy: 90,
      ki: "1.5 nM",
      action: "Positive Allosteric Modulator (PAM)",
      clinicalAction: "High-affinity positive allosteric modulation at the benzodiazepine site increases GABA-induced chloride conductance, producing rapid profound sedation, anterograde amnesia, anxiolysis, and seizure arrest."
    }
  ];
  console.log('Added Midazolam receptors and fixed subgroup to sg-bzd');
}

const triazolam = data.drugs.find(d => d.id === 'triazolam');
if (triazolam) {
  triazolam.subgroupId = 'sg-bzd';
  triazolam.subgroup = 'Benzodiazepines (BZDs)';
  console.log('Fixed Triazolam subgroup to sg-bzd');
}

const eszopiclone = data.drugs.find(d => d.id === 'eszopiclone-zopiclone');
if (eszopiclone) {
  eszopiclone.subgroupId = 'sg-z-drugs';
  eszopiclone.subgroup = 'Non-Benzodiazepine Hypnotics (Z-Drugs)';
  console.log('Fixed Eszopiclone subgroup to sg-z-drugs');
}

const zaleplon = data.drugs.find(d => d.id === 'zaleplon');
if (zaleplon) {
  zaleplon.subgroupId = 'sg-z-drugs';
  zaleplon.subgroup = 'Non-Benzodiazepine Hypnotics (Z-Drugs)';
  console.log('Fixed Zaleplon subgroup to sg-z-drugs');
}

const daridorexant = data.drugs.find(d => d.id === 'daridorexant');
if (daridorexant) {
  daridorexant.subgroupId = 'sg-dora';
  daridorexant.subgroup = 'Dual Orexin Receptor Antagonists (DORAs)';
  daridorexant.receptors = [
    {
      receptor: "OX1R_OX2R",
      rawTarget: "Dual Orexin Receptors (OX1R & OX2R)",
      occupancy: 85,
      ki: "OX1: 0.47 nM · OX2: 0.93 nM",
      action: "Equipotent Dual Antagonist",
      clinicalAction: "Competitively blocks wake-promoting orexin-A and orexin-B neuropeptides at both OX1 and OX2 receptors, promoting sleep initiation and maintenance while preserving physiological REM and NREM sleep architecture without next-morning grogginess."
    }
  ];
  console.log('Added Daridorexant receptors');
}

const lemborexant = data.drugs.find(d => d.id === 'lemborexant-suvorexant');
if (lemborexant) {
  lemborexant.subgroupId = 'sg-dora';
  lemborexant.subgroup = 'Dual Orexin Receptor Antagonists (DORAs)';
  lemborexant.receptors = [
    {
      receptor: "OX1R_OX2R",
      rawTarget: "Dual Orexin Receptors (OX1R & OX2R)",
      occupancy: 85,
      ki: "Lemborexant: OX1 6.1 nM, OX2 2.6 nM · Suvorexant: OX1 0.55 nM, OX2 0.35 nM",
      action: "Dual Orexin Receptor Antagonists",
      clinicalAction: "Selective dual antagonists that inactivate wake-stabilizing hypothalamic orexin signaling, suppressing hyperarousal to facilitate restorative physiological sleep without GABA-A mediated motor incoordination or respiratory depression."
    }
  ];
  console.log('Added Lemborexant & Suvorexant receptors');
}

const ramelteon = data.drugs.find(d => d.id === 'ramelteon-tasimelteon');
if (ramelteon) {
  ramelteon.receptors = [
    {
      receptor: "MT1MT2",
      rawTarget: "Melatonin MT1 & MT2 Receptors",
      occupancy: 95,
      ki: "MT1: 0.014 nM · MT2: 0.045 nM",
      action: "Ultra-High-Affinity Selective Agonist",
      clinicalAction: "High selectivity for MT1 (sleep induction / circadian attenuation) and MT2 (phase-shifting / circadian resynchronization) receptors in the suprachiasmatic nucleus (SCN). Zero affinity for GABA-A, monoamines, or opioids; zero abuse potential or physical dependence."
    }
  ];
  console.log('Added Ramelteon & Tasimelteon receptors');
}

// 14. Neurology: Rimegepant, Erenumab, Sumatriptan
const rimegepant = data.drugs.find(d => d.id === 'rimegepant');
if (rimegepant) {
  rimegepant.subgroupId = 'sg-neurobehavioral';
  rimegepant.subgroup = 'Neurobehavioral & Headache Therapies';
  rimegepant.receptors = [
    {
      receptor: "CGRP",
      rawTarget: "Calcitonin Gene-Related Peptide Receptor (CALCRL/RAMP1)",
      occupancy: 90,
      ki: "0.027 nM",
      action: "Small-Molecule CGRP Antagonist (Gepant)",
      clinicalAction: "High-affinity competitive antagonism of the human CGRP receptor blocks neurogenic inflammation, inhibits trigeminal sensory nerve pain transmission, and halts cranial artery vasodilation without vasoconstrictive coronary risk."
    }
  ];
  console.log('Added Rimegepant receptors & moved to sg-neurobehavioral');
}

const erenumab = data.drugs.find(d => d.id === 'erenumab');
if (erenumab) {
  erenumab.subgroupId = 'sg-neurobehavioral';
  erenumab.subgroup = 'Neurobehavioral & Headache Therapies';
  erenumab.receptors = [
    {
      receptor: "CGRP",
      rawTarget: "Calcitonin Gene-Related Peptide Receptor Complex",
      occupancy: 95,
      ki: "0.023 nM",
      action: "Human Monoclonal Antibody (IgG2)",
      clinicalAction: "Potently and selectively binds the CGRP receptor complex with picomolar affinity, preventing endogenous CGRP binding and signaling to reduce monthly migraine frequency without hepatic CYP metabolism."
    }
  ];
  console.log('Added Erenumab receptors & moved to sg-neurobehavioral');
}

const sumatriptan = data.drugs.find(d => d.id === 'sumatriptan');
if (sumatriptan) {
  sumatriptan.subgroupId = 'sg-neurobehavioral';
  sumatriptan.subgroup = 'Neurobehavioral & Headache Therapies';
  sumatriptan.receptors = [
    {
      receptor: "5HT1D",
      rawTarget: "Serotonin 5-HT1D Receptor",
      occupancy: 85,
      ki: "4.3 nM",
      action: "Selective Agonist",
      clinicalAction: "Presynaptic 5-HT1D receptor agonism on trigeminal sensory nerve endings inhibits neurogenic inflammation and the release of pro-inflammatory neuropeptides (CGRP, substance P)."
    },
    {
      receptor: "5HT1B",
      rawTarget: "Serotonin 5-HT1B Receptor",
      occupancy: 85,
      ki: "8.9 nM",
      action: "Selective Agonist",
      clinicalAction: "Postsynaptic 5-HT1B receptor agonism produces selective vasoconstriction of painfully dilated meningeal and dural blood vessels during migraine attacks."
    }
  ];
  console.log('Added Sumatriptan receptors & moved to sg-neurobehavioral');
}

// 15. Emergency: Dexmedetomidine
const dexmedetomidine = data.drugs.find(d => d.id === 'dexmedetomidine');
if (dexmedetomidine) {
  dexmedetomidine.receptors = [
    {
      receptor: "Alpha2A",
      rawTarget: "Alpha-2A Adrenergic Receptor",
      occupancy: 95,
      ki: "1.0 nM",
      action: "Full Selective Agonist (Alpha2:Alpha1 1620:1)",
      clinicalAction: "Centrally acting alpha-2A agonist in the locus coeruleus; dampens sympathetic outflow and noradrenergic firing, producing cooperative, easily arousable sedation ('conscious sedation'), anxiolysis, and analgesia without respiratory depression."
    }
  ];
  console.log('Added Dexmedetomidine receptors');
}

// Write back to data.json
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Final drug count:', data.drugs.length);
console.log('Successfully written updated data.json');
