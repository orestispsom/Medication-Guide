# scripts/taxonomy.py

FAMILIES = [
    {
        "id": "antipsychotics",
        "name": "Antipsychotics & Dopamine Pathways",
        "shortName": "Antipsychotics",
        "icon": "Brain",
        "color": "#8E44AD",
        "description": "First-, second-, and third-generation antipsychotics, novel muscarinic M1/M4 agonists, and dopamine pathway modulation."
    },
    {
        "id": "antidepressants",
        "name": "Antidepressants & Serotonergic Systems",
        "shortName": "Antidepressants",
        "icon": "Sparkles",
        "color": "#2563EB",
        "description": "SSRIs, SNRIs, multimodal serotonergic agents, NDRIs, rapid-acting NMDA/neurosteroids, TCAs, and MAOIs."
    },
    {
        "id": "mood-stabilizers",
        "name": "Mood Stabilizers & Bipolar Disorders",
        "shortName": "Mood Stabilizers",
        "icon": "Activity",
        "color": "#D97706",
        "description": "Lithium, anticonvulsant mood stabilizers (valproate, lamotrigine, carbamazepine), and bipolar therapeutics."
    },
    {
        "id": "anxiolytics",
        "name": "Anxiolytics, Sedatives & Hypnotics",
        "shortName": "Anxiolytics & Hypnotics",
        "icon": "Moon",
        "color": "#059669",
        "description": "Benzodiazepines, Z-drugs, dual orexin receptor antagonists (DORAs), melatonin agonists, and non-BZD anxiolytics."
    },
    {
        "id": "adhd",
        "name": "ADHD, Wakefulness & Cognitive Enhancers",
        "shortName": "ADHD & Wakefulness",
        "icon": "Zap",
        "color": "#DC2626",
        "description": "Stimulants (methylphenidates, amphetamines), non-stimulants (NRI, alpha-2 agonists), eugeroics, and nootropics."
    },
    {
        "id": "substance-use",
        "name": "Substance Use Disorders & Addiction Medicine",
        "shortName": "Substance Use Disorders",
        "icon": "ShieldAlert",
        "color": "#0D9488",
        "description": "Medication-assisted treatment for opioid, alcohol, and nicotine dependence, harm reduction, and toxicologic rescue."
    },
    {
        "id": "neuropsychiatry",
        "name": "Neuropsychiatry & Movement Disorders",
        "shortName": "Neuropsychiatry",
        "icon": "Smile",
        "color": "#7C3AED",
        "description": "Centrally-acting anticholinergics, beta-blockers for akathisia, VMAT2 inhibitors for TD, and catatonia protocols."
    },
    {
        "id": "neurology",
        "name": "Neurology Essentials for Psychiatry",
        "shortName": "Neurology Essentials",
        "icon": "Pulse",
        "color": "#4F46E5",
        "description": "Antiseizure medications (SV2A, sodium/calcium channels), dementia cholinesterase inhibitors, NMDA blockers, and motor therapies."
    },
    {
        "id": "antidotes-interventional",
        "name": "Emergency Antidotes & Interventional Psychopharmacology",
        "shortName": "Antidotes & Interventional",
        "icon": "Flame",
        "color": "#E11D48",
        "description": "Critical care antidotes, ECT anesthetics and muscle relaxants, organ-protective rescues, and rapid ketamine infusions."
    }
]

SUBGROUPS = [
    {"id": "sg-sga", "name": "Second-Generation Antipsychotics (SGAs / Atypicals)", "familyId": "antipsychotics", "description": "Serotonin-dopamine antagonists (5-HT2A/D2) with low EPS liability."},
    {"id": "sg-fga", "name": "First-Generation Antipsychotics (FGAs / Typicals)", "familyId": "antipsychotics", "description": "High- and low-potency D2 receptor antagonists."},
    {"id": "sg-third-gen", "name": "Third-Generation & Novel Muscarinic Antipsychotics", "familyId": "antipsychotics", "description": "D2/D3 partial agonists and muscarinic M1/M4 receptor agonists (non-D2)."},
    {"id": "sg-ssri", "name": "Selective Serotonin Reuptake Inhibitors (SSRIs)", "familyId": "antidepressants", "description": "First-line SERT inhibition with high tolerability."},
    {"id": "sg-snri", "name": "Serotonin-Norepinephrine Reuptake Inhibitors (SNRIs)", "familyId": "antidepressants", "description": "Dual SERT and NET inhibition for depression and pain."},
    {"id": "sg-multimodal", "name": "Multimodal Serotonergic Agents (SPARI / SMS)", "familyId": "antidepressants", "description": "Receptor-modulating serotonergic agents (5-HT1A, 5-HT1B/D, 5-HT3, 5-HT7)."},
    {"id": "sg-ndri", "name": "NDRI & Serotonin Antagonist / Reuptake Modulators", "familyId": "antidepressants", "description": "Norepinephrine-dopamine reuptake blockers and 5-HT2 antagonists."},
    {"id": "sg-neurosteroids", "name": "Rapid-Acting NMDA Modulators & Neurosteroids", "familyId": "antidepressants", "description": "Glutamatergic NMDA antagonists and GABA-A positive neuroactive steroids."},
    {"id": "sg-tca", "name": "Tricyclic Antidepressants (TCAs)", "familyId": "antidepressants", "description": "Broad monoamine reuptake inhibition with receptor blockade."},
    {"id": "sg-maoi", "name": "Monoamine Oxidase Inhibitors (MAOIs)", "familyId": "antidepressants", "description": "Enzymatic monoamine degradation blockade (MAO-A/B)."},
    {"id": "sg-lithium", "name": "Lithium Carbonate & Salts", "familyId": "mood-stabilizers", "description": "Gold standard antisuicidal and prophylactic bipolar mood stabilizer."},
    {"id": "sg-anticonvulsants", "name": "Anticonvulsant Mood Stabilizers", "familyId": "mood-stabilizers", "description": "Voltage-gated channel blockers and GABA/glutamate modulators."},
    {"id": "sg-bipolar-antipsychotics", "name": "Atypical Antipsychotics in Bipolar Disorder", "familyId": "mood-stabilizers", "description": "SGA therapies FDA approved for acute mania, bipolar depression, and maintenance."},
    {"id": "sg-bzd", "name": "Benzodiazepines (BZDs)", "familyId": "anxiolytics", "description": "Positive allosteric GABA-A receptor modulators."},
    {"id": "sg-z-drugs", "name": "Non-Benzodiazepine Hypnotics (Z-Drugs)", "familyId": "anxiolytics", "description": "Selective alpha-1 subunit GABA-A positive modulators for sleep onset."},
    {"id": "sg-dora", "name": "Dual Orexin Receptor Antagonists (DORAs)", "familyId": "anxiolytics", "description": "OX1R/OX2R neuropeptide blockers preserving physiological sleep architecture."},
    {"id": "sg-non-bzd-anx", "name": "Non-BZD Anxiolytics & Gabapentinoids", "familyId": "anxiolytics", "description": "5-HT1A partial agonists, alpha-2-delta calcium ligands, and antihistamines."},
    {"id": "sg-adhd-stimulants", "name": "Central Nervous System Stimulants (MPH & AMPH)", "familyId": "adhd", "description": "DAT/NET inhibitors and monoamine vesicular efflux inducers."},
    {"id": "sg-adhd-non-stimulants", "name": "Non-Stimulant ADHD Therapeutics", "familyId": "adhd", "description": "Selective NET inhibitors and postsynaptic alpha-2A adrenergic agonists."},
    {"id": "sg-wakefulness", "name": "Wakefulness-Promoting Agents & Eugeroics", "familyId": "adhd", "description": "Dopamine reuptake blockers and histamine H3 inverse agonists."},
    {"id": "sg-oud", "name": "Opioid Use Disorder Therapeutics (MAT)", "familyId": "substance-use", "description": "Full agonists, partial agonists, and antagonists for opioid dependence."},
    {"id": "sg-aud", "name": "Alcohol Use Disorder Therapeutics", "familyId": "substance-use", "description": "ALDH inhibition, NMDA/GABA normalization, and anti-craving agents."},
    {"id": "sg-smoking", "name": "Nicotine Cessation Pharmacotherapies", "familyId": "substance-use", "description": "Nicotinic alpha-4-beta-2 partial agonists, NRT, and bupropion."},
    {"id": "sg-overdose-rescue", "name": "Acute Toxidrome & Overdose Resuscitation", "familyId": "substance-use", "description": "Pure opioid and benzodiazepine competitive antagonists."},
    {"id": "sg-eps-anticholinergic", "name": "Centrally-Acting Anticholinergics & Pro-Dopaminergic", "familyId": "neuropsychiatry", "description": "Muscarinic antagonists and NMDA/dopamine release agents for parkinsonism."},
    {"id": "sg-akathisia-beta", "name": "Beta-Adrenergic Blockers & Akathisia Interventions", "familyId": "neuropsychiatry", "description": "Lipophilic beta-blockers crossing the blood-brain barrier."},
    {"id": "sg-vmat2", "name": "VMAT2 Inhibitors (Tardive Dyskinesia)", "familyId": "neuropsychiatry", "description": "Presynaptic vesicular monoamine transporter 2 inhibitors."},
    {"id": "sg-catatonia-movement", "name": "Catatonia, NMS & Tourette Specialists", "familyId": "neuropsychiatry", "description": "High-potency GABAergic challenges, RyR1 blockers, and alpha-2 agonists."},
    {"id": "sg-seizure-sv2a", "name": "Antiseizure Medications & SV2A / Channel Blockers", "familyId": "neurology", "description": "SV2A vesicle ligands, fast/slow sodium channel blockers, and AMPA antagonists."},
    {"id": "sg-dementia-memory", "name": "Cholinesterase Inhibitors & NMDA Neuroprotection", "familyId": "neurology", "description": "AChE/BuChE inhibitors and low-affinity uncompetitive NMDA blockers."},
    {"id": "sg-parkinson-motor", "name": "Dopamine Agonists & Parkinsonian Therapies", "familyId": "neurology", "description": "Levodopa precursors and non-ergot D2/D3 receptor agonists."},
    {"id": "sg-neurobehavioral", "name": "Neurobehavioral & Headache Therapies", "familyId": "neurology", "description": "Sigma-1/NMDA combinations, CGRP antagonists, and triptans."},
    {"id": "sg-ect-anesthesia", "name": "ECT Anesthetic & Neuromuscular Agents", "familyId": "antidotes-interventional", "description": "Ultra-short barbiturates and depolarizing neuromuscular blockers."},
    {"id": "sg-specific-antidotes", "name": "Targeted Toxidrome Antidotes & Receptor Blockers", "familyId": "antidotes-interventional", "description": "Serotonin, anticholinergic, and adrenergic crisis reversal agents."},
    {"id": "sg-organ-protection", "name": "Critical Care, Encephalopathy & Metabolic Rescue", "familyId": "antidotes-interventional", "description": "Ammonia scavengers, metabolic sensitizers, and QTc/Torsades rescue."},
    {"id": "sg-rapid-infusions", "name": "Rapid Interventional Infusions & Ketamines", "familyId": "antidotes-interventional", "description": "Intranasal and IV glutamatergic NMDA channel blockers."}
]
