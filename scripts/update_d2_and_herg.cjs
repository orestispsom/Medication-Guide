// scripts/update_d2_and_herg.cjs
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Add hERG off-target channel to drugs with high/moderate QTc liability
const hergObj = {
  receptor: "hERG",
  rawTarget: "hERG Potassium Channel (IKr / Cardiac Liability)",
  occupancy: 70,
  ki: "Cardiac Delayed Rectifier Blockade",
  action: "Channel Blockade (Hazard)",
  clinicalAction: "Delays phase 3 ventricular cardiac repolarization (IKr blockade), lengthening the QT interval and creating arrhythmogenic liability for Torsades de Pointes."
};

const qtcDrugIds = [
  'haloperidol',
  'ziprasidone',
  'thioridazine',
  'pimozide',
  'methadone',
  'citalopram',
  'escitalopram',
  'chlorpromazine'
];

qtcDrugIds.forEach(id => {
  const drug = data.drugs.find(d => d.id === id);
  if (drug) {
    if (!drug.receptors.some(r => r.receptor === 'hERG')) {
      drug.receptors.push({ ...hergObj });
      console.log(`Added hERG to ${id}`);
    }
  }
});

// 2. Fix Haloperidol benchmarks
const haloperidol = data.drugs.find(d => d.id === 'haloperidol');
if (haloperidol) {
  const d2 = haloperidol.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Potent Block (> 75-85%)";
    d2.detail = "Crosses 80% EPS threshold at therapeutic doses (High EPS & Prolactin)";
  }
  const hl = haloperidol.benchmarkMetrics.find(b => b.label.includes('HALF-LIFE'));
  if (hl) {
    hl.value = "18 Hours (Oral) · 3 Weeks (Depot)";
    hl.detail = "Steady-state depot reached in ~3 months";
  }
  console.log('Fixed Haloperidol D2 & Half-life benchmarks');
}

// 3. Fix Olanzapine benchmarks
const olanzapine = data.drugs.find(d => d.id === 'olanzapine');
if (olanzapine) {
  const d2 = olanzapine.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Moderate Block (70-80%)";
    d2.detail = "Antipsychotic window buffered by potent 5-HT2A inverse agonism";
  }
  const cyp = olanzapine.benchmarkMetrics.find(b => b.label.includes('HEPATIC'));
  if (cyp) {
    cyp.value = "CYP1A2 (~40%), UGT1A4, 2D6";
    cyp.detail = "CYP1A2 strongly induced by tobacco smoking hydrocarbons";
  }
  console.log('Fixed Olanzapine D2 & Hepatic benchmarks');
}

// 4. Fix Risperidone & Paliperidone benchmarks
const risperidone = data.drugs.find(d => d.id === 'risperidone');
if (risperidone) {
  const d2 = risperidone.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Potent Block (70-85%)";
    d2.detail = "Dose-dependent EPS threshold crossed above 4-6 mg/day";
  }
}

const paliperidone = data.drugs.find(d => d.id === 'paliperidone');
if (paliperidone) {
  const d2 = paliperidone.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Potent Block (70-80%)";
    d2.detail = "Continuous plasma delivery reduces peak-dose EPS surges";
  }
}

// 5. Fix Aripiprazole & Brexpiprazole benchmarks
const aripiprazole = data.drugs.find(d => d.id === 'aripiprazole');
if (aripiprazole) {
  const d2 = aripiprazole.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Partial Agonist (~30% Intrinsic Activity)";
    d2.detail = "High D2 occupancy (>85%) with low EPS risk; dopamine stabilizer";
  }
}

const brexpiprazole = data.drugs.find(d => d.id === 'brexpiprazole');
if (brexpiprazole) {
  const d2 = brexpiprazole.benchmarkMetrics.find(b => b.label.includes('D2'));
  if (d2) {
    d2.value = "Partial Agonist (~15% Intrinsic Activity)";
    d2.detail = "Lower intrinsic activity than aripiprazole; less akathisia";
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully written updated data.json with clean D2 and hERG profiles');
