/**
 * Altitude Sickness Emergency Database
 * Critical for trekking safety in Nepal's Himalayas
 * 
 * References:
 * - HACE survival rate: ~50% if untreated, >90% with immediate descent
 * - HAPE: Leading cause of death from altitude illness
 * - Symptoms often overlap - when in doubt, DESCEND
 */

// High Altitude Cerebral Edema (HACE)
export interface HACEInfo {
  name: string;
  fullName: string;
  description: string;
  symptoms: string[];
  riskAltitude: number; // meters
  treatment: string[];
  descentUrgency: 'immediate' | 'urgent' | 'moderate';
  mortalityRate: string;
}

// High Altitude Pulmonary Edema (HAPE)
export interface HAPEInfo {
  name: string;
  fullName: string;
  description: string;
  symptoms: string[];
  riskAltitude: number;
  treatment: string[];
  descentUrgency: 'immediate' | 'urgent' | 'moderate';
  mortalityRate: string;
}

// Other altitude-related conditions
export interface AltitudeCondition {
  name: string;
  fullName: string;
  description: string;
  symptoms: string[];
  riskAltitude: number;
  treatment: string[];
  prevention: string[];
}

// Quick reference for emergency responders
export interface AltitudeEmergencyChecklist {
  condition: string;
  question: string;
  action: string;
}

export const HACE_DATA: HACEInfo = {
  name: 'HACE',
  fullName: 'High Altitude Cerebral Edema',
  description: 'Life-threatening swelling of the brain caused by altitude. Occurs when the body fails to acclimatize to decreasing oxygen levels. Medical emergency requiring immediate descent.',
  symptoms: [
    'Severe headache not relieved by pain medication',
    'Confusion, disorientation, difficulty thinking',
    'Loss of coordination (ataxia) - cannot walk straight',
    'Slurred speech',
    'Hallucinations',
    'Lethargy or extreme fatigue',
    'Loss of consciousness',
    'Nausea and vomiting'
  ],
  riskAltitude: 4000, // meters
  treatment: [
    'IMMEDIATE DESCENT - do not wait for rescue',
    'Give oxygen if available (2-4 L/min)',
    'If available: Dexamethasone 8mg initially, then 4mg every 6 hours',
    'Keep warm and sheltered',
    'Do not leave person alone',
    'If descent impossible: use Gamow bag if available'
  ],
  descentUrgency: 'immediate',
  mortalityRate: '~50% if untreated, <5% with proper treatment'
};

export const HAPE_DATA: HAPEInfo = {
  name: 'HAPE',
  fullName: 'High Altitude Pulmonary Edema',
  description: 'Fluid buildup in lungs due to altitude. Can develop rapidly and is often fatal without treatment. Usually occurs at altitudes above 3,000m but can happen lower.',
  symptoms: [
    'Severe shortness of breath at rest',
    'Cough - initially dry, then frothy pink sputum',
    'Chest tightness or congestion',
    'Rapid breathing (tachypnea)',
    'Rapid heart rate (tachycardia)',
    'Blue lips or fingernails (cyanosis)',
    'Fatigue and weakness',
    'Confusion or disorientation'
  ],
  riskAltitude: 3000,
  treatment: [
    'IMMEDIATE DESCENT - lowest point possible',
    'Sit upright - do not lie flat',
    'Give oxygen if available (4-6 L/min)',
    'Keep warm and minimize exertion',
    'Nifedipine: 20mg initially, then 20-30mg every 12 hours',
    'Phosphodiesterase inhibitors (Tadalafil/Sildenafil) if available',
    'Do not allow person to sleep alone'
  ],
  descentUrgency: 'immediate',
  mortalityRate: '~50% if untreated, <5% with immediate descent'
};

export const ALTITUDE_CONDITIONS: AltitudeCondition[] = [
  {
    name: 'AMS',
    fullName: 'Acute Mountain Sickness',
    description: 'Mild to moderate altitude illness. Common at high altitudes, usually resolves with rest or descent.',
    symptoms: [
      'Headache (mild to moderate)',
      'Fatigue and weakness',
      'Nausea or loss of appetite',
      'Dizziness',
      'Sleep disturbance',
      'Shortness of breath'
    ],
    riskAltitude: 2500,
    treatment: [
      'Rest and acclimatize at current altitude',
      'Stay hydrated (3-4L water daily)',
      'Avoid alcohol',
      'Acetaminophen for headache',
      'Descend if symptoms worsen'
    ],
    prevention: [
      'Ascend slowly (max 500m/day above 3000m)',
      'Sleep altitude increase <500m/night',
      'Stay hydrated',
      'Avoid alcohol',
      'Consider acetazolamide prophylaxis'
    ]
  },
  {
    name: 'HACE',
    fullName: 'High Altitude Cerebral Edema',
    description: HACE_DATA.description,
    symptoms: HACE_DATA.symptoms,
    riskAltitude: HACE_DATA.riskAltitude,
    treatment: HACE_DATA.treatment,
    prevention: [
      'Same as AMS prevention',
      'Do not ascend with AMS symptoms',
      'Descend immediately if AMS worsens',
      'Know the warning signs'
    ]
  },
  {
    name: 'HAPE',
    fullName: 'High Altitude Pulmonary Edema',
    description: HAPE_DATA.description,
    symptoms: HAPE_DATA.symptoms,
    riskAltitude: HAPE_DATA.riskAltitude,
    treatment: HAPE_DATA.treatment,
    prevention: [
      'Gradual ascent',
      'Avoid strenuous activity first 48hrs',
      'Stay warm',
      'Know early symptoms'
    ]
  },
  {
    name: 'Frostbite',
    fullName: 'Frostbite',
    description: 'Freezing of skin and underlying tissues. Risk increases with wind, cold, and altitude.',
    symptoms: [
      'White or grayish skin',
      'Hard or waxy feeling skin',
      'Numbness',
      'Blisters after warming'
    ],
    riskAltitude: 4000,
    treatment: [
      'Remove wet clothing',
      'Warm gradually in warm water (37-39°C)',
      'Do not rub damaged area',
      'Protect with clean bandages',
      'Seek medical attention'
    ],
    prevention: [
      'Keep extremities covered',
      'Avoid wet clothing',
      'Check fingers and toes regularly',
      'Keep moving to maintain circulation'
    ]
  },
  {
    name: 'Hypothermia',
    fullName: 'Hypothermia',
    description: 'Dangerous drop in body temperature. Can occur at any altitude in cold conditions.',
    symptoms: [
      'Shivering (may stop in severe cases)',
      'Confusion',
      'Slurred speech',
      'Loss of coordination',
      'Drowsiness',
      'Slow, shallow breathing'
    ],
    riskAltitude: 3000,
    treatment: [
      'Get to shelter immediately',
      'Remove wet clothing',
      'Warm gradually - not directly by fire',
      'Warm drinks if conscious',
      'Handle gently - risk of cardiac arrest'
    ],
    prevention: [
      'Bring proper cold weather gear',
      'Stay dry',
      'Keep moving',
      'Eat high-calorie foods',
      'Know early warning signs'
    ]
  }
];

// Quick checklist for emergency assessment
export const ALTITUDE_EMERGENCY_CHECKLIST: AltitudeEmergencyChecklist[] = [
  { condition: 'AMS', question: 'Can you walk in a straight line?', action: 'If NO → likely HACE, descend immediately' },
  { condition: 'HACE', question: 'Is person confused or disoriented?', action: 'If YES → descent within 1 hour, give dexamethasone' },
  { condition: 'HAPE', question: 'Is there pink/frothy sputum or blue lips?', action: 'If YES → descent IMMEDIATELY, oxygen, nifedipine' },
  { condition: 'General', question: 'Are symptoms getting worse?', action: 'If YES → DESCEND - never wait' },
  { condition: 'General', question: 'Is altitude above 4000m?', action: 'Higher risk - be more conservative with descent' },
  { condition: 'AMS', question: 'Has symptoms persisted >2 days?', action: 'Descend and rest - do not ascend further' }
];

// Export function to get relevant data for a specific altitude
export const getAltitudeRiskAssessment = (altitude: number): string[] => {
  const risks: string[] = [];
  
  if (altitude >= 5500) {
    risks.push('Extreme altitude - death zone for unacclimatized');
  }
  if (altitude >= 4000) {
    risks.push('High risk for HACE and frostbite');
    risks.push('HACE can occur - know symptoms');
  }
  if (altitude >= 3000) {
    risks.push('Risk for HAPE begins');
    risks.push('AMS common - acclimatize slowly');
  }
  if (altitude >= 2500) {
    risks.push('AMS possible - monitor for symptoms');
  }
  
  return risks;
};

// Nepal-specific trekking region altitude data
export const TREKKING_REGION_ALTITUDES = {
  'Solukhumbu (Everest)': {
    typicalRange: '2800m - 8848m',
    dangerousAltitude: 5500,
    commonProblems: ['HACE', 'HAPE', 'Frostbite', 'Hypothermia'],
    evacuationTime: '4-8 hours to Lukla, then helicopter'
  },
  'Kaski (Annapurna)': {
    typicalRange: '800m - 5416m',
    dangerousAltitude: 5000,
    commonProblems: ['HACE', 'HAPE', 'AMS'],
    evacuationTime: '2-4 hours to Pokhara'
  },
  'Mustang': {
    typicalRange: '2800m - 7000m',
    dangerousAltitude: 5500,
    commonProblems: ['HACE', 'HAPE', 'Frostbite', 'UV radiation'],
    evacuationTime: '6-12 hours to Jomsom'
  },
  'Dolpo': {
    typicalRange: '2500m - 6000m',
    dangerousAltitude: 5500,
    commonProblems: ['HACE', 'HAPE', 'Remote evacuation'],
    evacuationTime: '24+ hours to nearest hospital'
  }
};

export default {
  HACE_DATA,
  HAPE_DATA,
  ALTITUDE_CONDITIONS,
  ALTITUDE_EMERGENCY_CHECKLIST,
  getAltitudeRiskAssessment,
  TREKKING_REGION_ALTITUDES
};