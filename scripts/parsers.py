# scripts/parsers.py
import re

def clean(t):
    if not t: return ''
    return re.sub(r'\s+', ' ', t).strip()

def normalize_text(text):
    if not text:
        return ""
    subs = {
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
        '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
        'ₐ': 'A', 'ᵦ': 'B', 'ᵧ': 'C',
        '꜀': 'C', 'ᶜ': 'C',
        'α': 'Alpha', 'Α': 'Alpha',
        'β': 'Beta', 'Β': 'Beta',
        'γ': 'Gamma', 'Γ': 'Gamma',
        '𝐾𝑖': 'Ki', 'Ki': 'Ki', 'Κi': 'Ki',
        '–': '-', '—': '-'
    }
    for k, v in subs.items():
        text = text.replace(k, v)
    return text

def extract_receptor_ids(raw_name):
    n = raw_name.upper()
    found = []
    
    # 5-HT
    for sub in ['1A', '1B', '1D', '2A', '2C', '3', '6', '7']:
        if f'5-HT{sub}' in n or f'5HT{sub}' in n or f'5 - HT{sub}' in n or f'5 -HT{sub}' in n:
            found.append(f'5HT{sub}')
            
    # Dopamine
    for d in ['1', '2', '3', '4', '5']:
        if f'D{d}' in n or f'D {d}' in n or f'DOPAMINE D{d}' in n:
            found.append(f'D{d}')
            
    # Histamine
    for h in ['1', '2', '3', '4']:
        if f'H{h}' in n or f'H {h}' in n or f'HISTAMINE H{h}' in n:
            found.append(f'H{h}')
            
    # Muscarinic
    for m in ['1', '2', '3', '4', '5']:
        if f'M{m}' in n or f'M {m}' in n or f'MUSCARINIC M{m}' in n:
            found.append(f'M{m}')
            
    # Adrenergic
    if 'ALPHA-1' in n or 'ALPHA 1' in n or 'ALPHA1' in n or 'ADRENERGIC ALPHA-1' in n:
        found.append('Alpha1')
    if 'ALPHA-2' in n or 'ALPHA 2' in n or 'ALPHA2' in n or 'ADRENERGIC ALPHA-2' in n:
        found.append('Alpha2A')
    if 'BETA-1' in n or 'BETA1' in n:
        found.append('Beta1')
        
    # GABA
    if 'GABA-A' in n or 'GABAA' in n or 'GABA A' in n:
        found.append('GABAA')
    if 'GABA-B' in n or 'GABAB' in n or 'GABA B' in n:
        found.append('GABAB')
        
    # Transporters
    if 'SERT' in n or 'SEROTONIN TRANSPORTER' in n or 'SEROTONIN REUPTAKE' in n or 'SEROTONERGIC REUPTAKE' in n:
        found.append('SERT')
    if 'NET' in n or 'NOREPINEPHRINE TRANSPORTER' in n or 'NOREPINEPHRINE REUPTAKE' in n:
        found.append('NET')
    if 'DAT' in n or 'DOPAMINE TRANSPORTER' in n or 'DOPAMINE REUPTAKE' in n or 'DOPAMINERGIC REUPTAKE' in n:
        found.append('DAT')
    if 'VMAT2' in n or 'VMAT-2' in n:
        found.append('VMAT2')
        
    # Glutamate / Channels / Enzymes / Others
    if 'NMDA' in n: found.append('NMDA')
    if 'AMPA' in n: found.append('AMPA')
    if 'OX1R' in n or 'OX2R' in n or 'OREXIN' in n: found.append('OX1R_OX2R')
    if 'MT1' in n or 'MT2' in n or 'MELATONIN' in n: found.append('MT1MT2')
    if 'SIGMA' in n: found.append('Sigma1')
    if 'MOR' in n or 'MU-OPIOID' in n: found.append('MOR')
    if 'KOR' in n or 'KAPPA-OPIOID' in n: found.append('KOR')
    if 'DOR' in n or 'DELTA-OPIOID' in n: found.append('DOR')
    if 'SV2A' in n: found.append('SV2A')
    if 'SODIUM' in n or 'NAV' in n: found.append('Nav')
    if 'CALCIUM' in n or 'CAV' in n or 'ALPHA-2-DELTA' in n: found.append('Cav')
    if 'HERG' in n: found.append('hERG')
    if 'RYANODINE' in n or 'RYR1' in n: found.append('RyR1')
    if 'ACHE' in n or 'ACETYLCHOLINESTERASE' in n: found.append('AChE')
    if 'BUCHE' in n or 'BUTYRYLCHOLINESTERASE' in n: found.append('BuChE')
    if 'MAO-A' in n: found.append('MAO-A')
    if 'MAO-B' in n: found.append('MAO-B')
    if 'ALDH' in n or 'ALDEHYDE' in n: found.append('ALDH')
    
    return list(dict.fromkeys(found))

def parse_protocol(doc, p1, p2, index):
    t1 = doc[p1-1].get_text()
    t2 = doc[p2-1].get_text()
    lines1 = [l.strip() for l in t1.splitlines() if l.strip()]
    lines2 = [l.strip() for l in t2.splitlines() if l.strip()]
    
    hdr = lines1[2] if len(lines1) > 2 else f"Protocol {index}"
    title_match = re.search(r'CLINICAL PROTOCOL · (.*?) \(1/2\)', hdr)
    title = title_match.group(1).title() if title_match else f"Protocol {index:02d}"
    
    trans = lines1[3] if len(lines1) > 3 else ''
    if len(lines1) > 4 and any(s in lines1[4] for s in ['→', '↔', 'to', 'tine', 'xetine', 'done', 'pram']):
        trans += ' ' + lines1[4]

    switch_type = ''
    class_trans = ''
    core_mandate = ''
    duration = ''

    for i, l in enumerate(lines1[:16]):
        if any(kw in l for kw in ['CROSS-TAPER', 'SWITCH', 'BRIDGE', 'WASHOUT', 'ROTATION', 'SUBSTITUTION', 'MICROTAPER', 'DEPRESCRIBING', 'INDUCTION']):
            if not switch_type: switch_type = l
        if ('→' in l or '↔' in l) and not class_trans and i > 4:
            class_trans = l
        if 'Core Mandate:' in l:
            core_mandate = clean(l.replace('Core Mandate:', ''))
        if 'TRANSITION DURATION WINDOW' in l and i+1 < len(lines1):
            duration = lines1[i+1]

    rationale = ''
    kinetics = []
    rat_match = re.search(r'TRANSITION RATIONALE\s*\n(.*?)(?=(Kinetic Parameters|STEPWISE|\Z))', t1, re.DOTALL)
    if rat_match:
        rationale = clean(rat_match.group(1))
    
    kin_match = re.search(r'Kinetic Parameters & Half-Lives:\s*\n(.*?)(?=(STEPWISE|\Z))', t1, re.DOTALL)
    if kin_match:
        for line in kin_match.group(1).splitlines():
            c_line = clean(line)
            if c_line and len(c_line) > 5:
                kinetics.append(c_line)

    phases = []
    raw_phases = re.findall(r'(PHASE [1-4]|STEP [1-4]|STAGE [1-4])\s*\n(.*?)(?=(PHASE [1-4]|STEP [1-4]|STAGE [1-4]|WARNING|ALERT|CRITICAL|BEYOND|\Z))', t1, re.DOTALL)
    for ph_name, ph_content, _ in raw_phases:
        ph_lines = [clean(l) for l in ph_content.splitlines() if clean(l)]
        if ph_lines:
            ph_title = ph_lines[0]
            ph_timing = ph_lines[1] if len(ph_lines) > 1 and any(k in ph_lines[1].lower() for k in ['day', 'week', 'month', 'hour', 'immediately', 'post', 'next', 'onward']) else ''
            ph_notes = ' '.join(ph_lines[2:]) if ph_timing else ' '.join(ph_lines[1:])
            phases.append({
                'phase': ph_name,
                'title': ph_title,
                'timing': ph_timing,
                'notes': ph_notes
            })

    warning = ''
    warn_match = re.search(r'(?:WARNING|ALERT|CRITICAL MANDATE)\s*\n(.*?)(?=(BEYOND|\Z))', t1, re.DOTALL)
    if warn_match:
        warning = clean(warn_match.group(1))

    receptor_shifts = []
    rec_match = re.search(r'RECEPTOR SHIFT DYNAMICS.*?\n(.*?)(?=ADVERSE RISK STRATIFICATION|MONITORING METRICS|\Z)', t2, re.DOTALL)
    if rec_match:
        rec_lines = [clean(l) for l in rec_match.group(1).splitlines() if clean(l)]
        cur_rec, cur_shift, cur_risk, cur_hazard = '', '', '', ''
        for l in rec_lines:
            if 'Hazard:' in l:
                cur_hazard = clean(l.replace('Hazard:', ''))
                if cur_rec:
                    receptor_shifts.append({
                        'receptor': cur_rec,
                        'shift': cur_shift,
                        'riskLevel': cur_risk,
                        'hazard': cur_hazard
                    })
                    cur_rec, cur_shift, cur_risk, cur_hazard = '', '', '', ''
            elif any(r in l for r in ['LOW', 'MODERATE', 'HIGH', 'VERY HIGH', 'MINIMAL', 'CRITICAL', 'SEVERE']) and len(l) < 20:
                cur_risk = l
            elif not cur_rec and any(kw in l for kw in ['Receptor', 'Transporter', 'SERT', 'NET', 'DAT', 'D2', '5-HT', 'GABA', 'M1', 'CYP', 'Alpha', 'Histamine', 'VMAT2', 'Voltage']):
                cur_rec = l
            elif cur_rec and not cur_shift:
                cur_shift = l

    risk_meters = []
    risk_match = re.search(r'ADVERSE RISK STRATIFICATION.*?\n(.*?)(?=EMERGENCY RESCUE|\Z)', t2, re.DOTALL)
    if risk_match:
        r_lines = [clean(l) for l in risk_match.group(1).splitlines() if clean(l)]
        if r_lines and 'Monitoring Metrics' in r_lines[0]:
            r_lines = r_lines[1:]
        idx = 0
        while idx < len(r_lines):
            dom = r_lines[idx]
            sev = r_lines[idx+1] if idx+1 < len(r_lines) else ''
            notes = r_lines[idx+2] if idx+2 < len(r_lines) else ''
            if any(s in sev for s in ['LOW', 'MODERATE', 'HIGH', 'VERY LOW', 'SEVERE', 'MINIMAL', 'EXTREME']):
                risk_meters.append({
                    'domain': dom,
                    'severity': sev,
                    'notes': notes
                })
                idx += 3
            else:
                idx += 1

    emergency_rescue = []
    resc_match = re.search(r'EMERGENCY RESCUE ACTIONS.*?\n(.*?)(?=HIGH-YIELD CLINICAL PEARLS|\Z)', t2, re.DOTALL)
    if resc_match:
        for line in resc_match.group(1).splitlines():
            c_line = clean(line)
            if '•' in c_line:
                for part in c_line.split('•'):
                    clean_part = clean(part)
                    if clean_part and len(clean_part) > 5:
                        emergency_rescue.append(clean_part)
            elif c_line and len(c_line) > 10 and not 'CLINICAL ACTIONS' in c_line:
                emergency_rescue.append(c_line)

    pearls = []
    pearl_match = re.search(r'HIGH-YIELD CLINICAL PRACTICE PEARLS.*?\n(.*?)(?=(ALERT|WARNING|BEYOND|\Z))', t2, re.DOTALL)
    if pearl_match:
        for bullet in re.split(r'\n(?=[•\-\*])', pearl_match.group(1)):
            c_b = clean(re.sub(r'^[•\-\*]\s*', '', bullet))
            if c_b and len(c_b) > 10:
                pearls.append(c_b)

    alert_box = ''
    alert_match = re.search(r'(?:ALERT|PRECAUTION|CRITICAL NOTICE)\s*\n(.*?)(?=(BEYOND|\Z))', t2, re.DOTALL)
    if alert_match:
        alert_box = clean(alert_match.group(1))

    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return {
        'id': f"protocol-{index:02d}-{slug}",
        'number': index,
        'title': title,
        'transitionTitle': trans,
        'switchType': switch_type or 'Cross-Titration',
        'classTransition': class_trans,
        'coreMandate': core_mandate,
        'duration': duration or '2 to 4 Weeks',
        'rationale': rationale,
        'kinetics': kinetics,
        'phases': phases,
        'warning': warning,
        'receptorShiftDynamics': receptor_shifts,
        'riskMeters': risk_meters,
        'emergencyRescue': emergency_rescue,
        'clinicalPearls': pearls,
        'alertBox': alert_box
    }

def parse_monograph(doc, p1, p2, family_id, family_name, subgroup, subgroup_id, existing_drugs_dict=None):
    t1 = normalize_text(doc[p1-1].get_text())
    t2 = normalize_text(doc[p2-1].get_text())
    lines1 = [l.strip() for l in t1.splitlines() if l.strip()]
    lines2 = [l.strip() for l in t2.splitlines() if l.strip()]

    m_name = re.search(r'CLINICAL MONOGRAPH\s*[·\s]\s*(.*?)\s*\(PART 1', t1, re.I)
    raw_name = m_name.group(1).strip() if m_name else (lines1[3] if len(lines1) > 3 else 'Unknown')
    
    name_words = []
    for w in raw_name.split():
        if w.upper() in ['ER', 'XR', 'IR', 'SR', 'ODT', 'IV', 'PO', 'PRN', 'BZD', 'SGA', 'FGA', 'ADHD', 'AUD', 'OUD', 'NMS', 'PPD', 'TRD', 'BED']:
            name_words.append(w.upper())
        elif '/' in w:
            parts = [p.capitalize() if p.lower() not in ['and', 'or', 'in'] else p.lower() for p in w.split('/')]
            name_words.append('/'.join(parts))
        elif '&' in w:
            name_words.append('&')
        else:
            name_words.append(w.capitalize())
    name = ' '.join(name_words)
    drug_id = re.sub(r'[^a-z0-9]+', '-', raw_name.lower()).strip('-')

    prev_drug = existing_drugs_dict.get(drug_id, {}) if existing_drugs_dict else {}

    brand = prev_drug.get('brand', '')
    for l in lines1:
        if 'brand' in l.lower():
            extracted_brand = clean(l.split(':', 1)[-1] if ':' in l else l)
            if extracted_brand:
                brand = extracted_brand
            break

    target_dose = prev_drug.get('targetDose', '')
    max_dose = prev_drug.get('maxDose', '')
    for i, l in enumerate(lines1):
        if 'TARGET' in l.upper() and ('DOSE' in l.upper() or 'RANGE' in l.upper() or 'WINDOW' in l.upper()):
            if i+1 < len(lines1):
                target_dose = lines1[i+1]
            if i+2 < len(lines1) and any(kw in lines1[i+2].lower() for kw in ['max', 'ceiling', 'window', 'target', 'inpatient', 'bolus', 'range', 'divided']):
                max_dose = lines1[i+2]
            break

    half_life = prev_drug.get('halfLife', '')
    for i, l in enumerate(lines1):
        if 'HALF-LIFE' in l.upper():
            if i+1 < len(lines1):
                half_life = lines1[i+1]
            break

    benchmarks = []
    bm_indices = []
    for i, l in enumerate(lines1[:40]):
        if any(h in l.upper() for h in [
            'DOPAMINE D₂ OCCUPANCY', 'DOPAMINE D2 OCCUPANCY', 'SEROTONIN TRANSPORTER', 'ELIMINATION HALF-LIFE',
            'HEPATIC METABOLISM', 'THERAPEUTIC BLOOD WINDOW', 'TRANSPORTER PROFILE', 'RENAL ELIMINATION',
            'ACTIVE METABOLITE', 'RAPID BRAIN ENTRY', 'PRODRUG LOCK', 'SL BIOAVAILABILITY', 'HIGH LIPOPHILICITY',
            'SV2A TARGETING', 'MECHANISM OF ACTION', 'PRIMARY MECHANISM', 'MEAL RESTRICTION', 'MOTOR & WEIGHT BURDEN',
            'METABOLIC PROFILE', 'CARDIAC SAFETY', 'BBB PENETRATION', '14-HOUR DURATION', 'ABUSE DETERRENCE',
            'DUAL INDICATION', 'ULTRA-RAPID ONSET', 'HIGH RECEPTOR POTENCY', 'CYP3A4 SENSITIVITY', 'TUBULAR REABSORPTION',
            'ANTI-SUICIDE GOLD STANDARD'
        ]):
            bm_indices.append(i)
    
    for idx in bm_indices[:4]:
        lbl = lines1[idx]
        val = lines1[idx+1] if idx+1 < len(lines1) else ''
        det = lines1[idx+2] if idx+2 < len(lines1) else ''
        benchmarks.append({
            'label': lbl,
            'value': val,
            'detail': det
        })

    if len(benchmarks) < 4:
        if half_life and not any('half-life' in b['label'].lower() for b in benchmarks):
            benchmarks.append({'label': 'ELIMINATION HALF-LIFE (t½)', 'value': half_life, 'detail': 'Steady-state in 4-5 half-lives'})
        if target_dose and not any('dose' in b['label'].lower() for b in benchmarks):
            benchmarks.append({'label': 'TARGET CLINICAL DOSE', 'value': target_dose, 'detail': max_dose or 'Titrate to clinical efficacy'})

    receptors = []
    seen_recs = set()
    m_sec = re.search(r'\n([A-Z0-9\s&/\-\(\),]+(?:PHARMACODYNAMICS|PROFILE|TARGETS|MECHANISM|RECEPTORS?))\s*\n(.*?)(?=\n(?:ADVERSE EFFECT RISK|VISUAL SAFETY MATRIX|\Z))', t1, re.DOTALL)
    if m_sec:
        r_text = m_sec.group(2)
        blocks = re.split(r'\n(?=[A-Z0-9][A-Za-z0-9\-\s/&(),·]+\b(?:Receptor|Receptors|Transporter|Transporters|Channel|Channels|Enzyme|Enzymes|Subunit|Subunits|Adrenergic|Pump|System|Complex|Site)\b)', r_text)
        for blk in blocks:
            b_lines = [clean(l) for l in blk.splitlines() if clean(l)]
            if not b_lines: continue
            raw_target = b_lines[0]
            if any(w in raw_target for w in ['Profile', 'Fingerprint', 'Matrix', 'Overview', 'Dynamics']):
                continue
            rec_ids = extract_receptor_ids(raw_target)
            if not rec_ids: continue
            
            ki = ''
            action = ''
            clinical_action = ''
            for bl in b_lines[1:]:
                if 'Clinical Action:' in bl:
                    clinical_action = clean(bl.replace('Clinical Action:', ''))
                elif any(u in bl.lower() for u in ['nm', 'µm', 'um', 'sub-nanomolar', 'nanomolar', 'micromolar', 'ki ~', 'ki=', 'ki =']):
                    if not ki: ki = bl
                elif not action and any(a in bl.lower() for a in ['agonist', 'antagonist', 'block', 'inhibit', 'modulat', 'partial', 'inverse', 'ligand', 'channel', 'high', 'potent', 'weak', 'ultra']):
                    action = bl
                    
            occupancy = 60
            act_lower = action.lower()
            ki_lower = ki.lower()
            m_occ = re.search(r'(\d+)\s*[-–]\s*(\d+)%\s*occupancy', blk, re.I)
            if m_occ:
                occupancy = (int(m_occ.group(1)) + int(m_occ.group(2))) // 2
            elif 'sub-nanomolar' in act_lower or 'sub-nanomolar' in ki_lower or 'ultra-potent' in act_lower:
                occupancy = 95
            elif 'very high' in act_lower or 'potent block' in act_lower or 'high affinity' in act_lower:
                occupancy = 85
            elif 'partial' in act_lower:
                occupancy = 70
            elif 'weak' in act_lower or 'low' in act_lower:
                occupancy = 35
            elif 'moderate' in act_lower:
                occupancy = 50
            else:
                occupancy = 75

            for rid in rec_ids:
                if rid in seen_recs: continue
                seen_recs.add(rid)
                receptors.append({
                    'receptor': rid,
                    'rawTarget': raw_target,
                    'occupancy': occupancy,
                    'ki': ki or 'High Affinity',
                    'action': action or 'Receptor Ligand',
                    'clinicalAction': clinical_action or f"Active modulation of {raw_target} contributes to clinical efficacy and tolerability."
                })

    if not receptors and prev_drug.get('receptors'):
        receptors = prev_drug.get('receptors')

    adverse_footprint = []
    adv_sec = re.search(r'(?:ADVERSE EFFECT RISK FOOTPRINT|ADVERSE RISK FOOTPRINT|VISUAL SAFETY MATRIX)(.*?)(?:BEYOND THERAPY|CLINICAL PRACTICE|STEPWISE|\Z)', t1, re.DOTALL)
    if adv_sec:
        adv_lines = [clean(l) for l in adv_sec.group(1).splitlines() if clean(l)]
        if adv_lines and 'Visual Safety Matrix' in adv_lines[0]:
            adv_lines = adv_lines[1:]
        
        ratings = ['near zero', 'low', 'moderate', 'high', 'very high', 'severe', 'extreme', 'critical', 'sparing', 'zero', 'minimal', 'black box', 'universal']
        i = 0
        while i < len(adv_lines):
            l = adv_lines[i]
            if i + 1 < len(adv_lines) and any(r in adv_lines[i+1].lower() for r in ratings):
                adverse_footprint.append({
                    'domain': l,
                    'severity': adv_lines[i+1],
                    'description': f"Risk rating: {adv_lines[i+1]}"
                })
                i += 2
            elif i + 2 < len(adv_lines) and any(r in adv_lines[i+2].lower() for r in ratings):
                adverse_footprint.append({
                    'domain': l + ' ' + adv_lines[i+1],
                    'severity': adv_lines[i+2],
                    'description': f"Risk rating: {adv_lines[i+2]}"
                })
                i += 3
            else:
                i += 1

    titration_schedule = []
    step_matches = list(re.finditer(r'\n(STEP [1-4]|TARGET|RESET|CEILING|MAINTENANCE|ORAL LOADING|STANDARD RAMP|SLOW RESCUE|PANIC INITIATION[^\n]*|DE NOVO INITIATION[^\n]*|STAGE [1-4])\s*\n(.*?)(?=\n(?:STEP [1-4]|TARGET|RESET|CEILING|MAINTENANCE|ORAL LOADING|STANDARD RAMP|SLOW RESCUE|PANIC INITIATION|DE NOVO INITIATION|STAGE [1-4]|ABSOLUTE|TOBACCO|THE SILENT|HIGH-YIELD|BEYOND|\Z))', t2, re.DOTALL))
    for sm in step_matches:
        st_title = clean(sm.group(1))
        st_body = [clean(line) for line in sm.group(2).splitlines() if clean(line)]
        st_dose = st_body[0] if len(st_body) > 0 else ''
        st_timing = st_body[1] if len(st_body) > 1 and any(kw in st_body[1].lower() for kw in ['day', 'week', 'month', 'bid', 'tid', 'qhs', 'qam', 'daily', 'hr', 'hour']) else ''
        st_dir = ' '.join(st_body[2:]) if st_timing else (' '.join(st_body[1:]) if len(st_body) > 1 else '')
        titration_schedule.append({
            'step': st_title,
            'title': st_title,
            'dose': st_dose,
            'timing': st_timing,
            'directive': st_dir
        })

    black_box = None
    bb_m = re.search(r'(?:⚠️|🚨|🚬|BLACK BOX|CRITICAL WARNING|THE SILENT KILLER|WARNING)\s*\n(.*?)\n(.*?)(?=(?:STEP|HIGH-YIELD|BEYOND|\Z))', t2, re.DOTALL)
    if bb_m:
        bb_title = clean(bb_m.group(1))
        bb_text = clean(bb_m.group(2))
        black_box = {
            'title': bb_title,
            'warning': bb_text
        }

    food_req = 'Take with or without food.'
    if 'cobenfy' in drug_id:
        food_req = 'Take on an empty stomach at least 1 hour before or 2 hours after a meal (high-fat meal reduces trospium absorption by >70%).'
    elif 'ziprasidone' in drug_id:
        food_req = 'Take strictly with a meal of >= 500 calories to ensure adequate oral bioavailability (absorption reduced by up to 50% on empty stomach).'
    elif 'lurasidone' in drug_id:
        food_req = 'Take with food (>= 350 calories, light meal/snack) to double systemic absorption.'
    elif 'zuranolone' in drug_id:
        food_req = 'Take once daily in the evening with a fat-containing meal for optimal absorption.'
    elif 'vilazodone' in drug_id:
        food_req = 'Take strictly with food; absorption is decreased by ~50% in the fasted state.'

    pearls = []
    pearls_m = re.search(r'HIGH-YIELD CLINICAL (?:PEARLS|PRACTICE PEARLS).*?\n(.*?)(?=(BEYOND THERAPY|CLINICAL PRACTICE NOTES|\Z))', t2, re.DOTALL)
    if pearls_m:
        raw_p = pearls_m.group(1)
        for bullet in re.split(r'\n(?=[•\-\*])', raw_p):
            cleaned_b = clean(re.sub(r'^[•\-\*]\s*', '', bullet))
            if cleaned_b and len(cleaned_b) > 10:
                pearls.append(cleaned_b)
    if not pearls and prev_drug.get('clinicalPearls'):
        if isinstance(prev_drug['clinicalPearls'], list):
            pearls = prev_drug['clinicalPearls']
        else:
            pearls = [prev_drug['clinicalPearls']]

    special_pop = prev_drug.get('specialPopulations', {
        'perinatal': prev_drug.get('pregnancy', 'Consult reproductive safety data. Risk-benefit analysis required.'),
        'pediatric': 'Assess age indications, safety monitoring, and weight-based dosing.',
        'geriatric': 'Start at lower end of dosing range. Screen for anticholinergic cognitive burden, orthostasis, and Beers criteria.',
        'organImpairment': 'Adjust dose based on renal GFR and hepatic Child-Pugh classification.'
    })

    cyp = prev_drug.get('cyp450', {
        'substrate': [],
        'inhibits': [],
        'induces': []
    })

    indications = prev_drug.get('indications', [f"{family_name} indicated conditions"])
    off_label = prev_drug.get('offLabel', [])

    return {
        'id': drug_id,
        'name': name,
        'brand': brand,
        'family': family_name,
        'familyId': family_id,
        'subgroup': subgroup,
        'subgroupId': subgroup_id,
        'targetDose': target_dose,
        'maxDose': max_dose,
        'halfLife': half_life,
        'benchmarkMetrics': benchmarks,
        'receptors': receptors,
        'adverseFootprint': adverse_footprint,
        'titrationSchedule': titration_schedule,
        'blackBox': black_box,
        'foodRequirement': food_req,
        'clinicalPearls': pearls,
        'specialPopulations': special_pop,
        'cyp450': cyp,
        'indications': indications,
        'offLabel': off_label,
        'dataSource': '12-Module Master Psychopharmacology Reference Compendium'
    }
