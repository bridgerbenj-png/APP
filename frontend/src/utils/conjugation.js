/**
 * Japanese verb conjugation engine.
 * Supports: u-verbs, ru-verbs, and the two irregular verbs (する, くる).
 */

const U_MASU   = { く:'き', ぐ:'ぎ', す:'し', つ:'ち', ぬ:'に', ぶ:'び', む:'み', る:'り', う:'い' };
const U_TE     = { く:'いて', ぐ:'いで', す:'して', つ:'って', ぬ:'んで', ぶ:'んで', む:'んで', る:'って', う:'って' };
const U_TA     = { く:'いた', ぐ:'いだ', す:'した', つ:'った', ぬ:'んだ', ぶ:'んだ', む:'んだ', る:'った', う:'った' };
const U_NAI    = { く:'か', ぐ:'が', す:'さ', つ:'た', ぬ:'な', ぶ:'ば', む:'ま', る:'ら', う:'わ' };
const U_BA     = { く:'け', ぐ:'げ', す:'せ', つ:'て', ぬ:'ね', ぶ:'べ', む:'め', る:'れ', う:'え' };
const U_VOL    = { く:'こ', ぐ:'ご', す:'そ', つ:'と', ぬ:'の', ぶ:'ぼ', む:'も', る:'ろ', う:'お' };

const IRREGULAR = {
  'する': {
    masu: 'します', masuNeg: 'しません', masuPast: 'しました',
    te: 'して', nai: 'しない', ta: 'した',
    ba: 'すれば', tara: 'したら', nara: 'するなら', to: 'すると',
    potential: 'できる', volitional: 'しよう', masuVol: 'しましょう',
  },
  'くる': {
    masu: 'きます', masuNeg: 'きません', masuPast: 'きました',
    te: 'きて', nai: 'こない', ta: 'きた',
    ba: 'くれば', tara: 'きたら', nara: 'くるなら', to: 'くると',
    potential: 'こられる', volitional: 'こよう', masuVol: 'きましょう',
  },
};

// Special irregular te/ta forms
const SPECIAL = {
  'いく': { te: 'いって', ta: 'いった', tara: 'いったら' },
};

export function conjugate(reading, group, form) {
  if (group === 'irregular') {
    return IRREGULAR[reading]?.[form] ?? null;
  }

  if (SPECIAL[reading]?.[form]) return SPECIAL[reading][form];

  if (group === 'ru') {
    const stem = reading.slice(0, -1); // remove る
    const map = {
      masu: stem + 'ます',
      masuNeg: stem + 'ません',
      masuPast: stem + 'ました',
      te: stem + 'て',
      nai: stem + 'ない',
      ta: stem + 'た',
      ba: stem + 'れば',
      tara: stem + 'たら',
      nara: reading + 'なら',
      to: reading + 'と',
      potential: stem + 'られる',
      volitional: stem + 'よう',
      masuVol: stem + 'ましょう',
    };
    return map[form] ?? null;
  }

  if (group === 'u') {
    const last = reading[reading.length - 1];
    const stem = reading.slice(0, -1);
    const taSuffix = U_TA[last];
    const map = {
      masu: stem + U_MASU[last] + 'ます',
      masuNeg: stem + U_MASU[last] + 'ません',
      masuPast: stem + U_MASU[last] + 'ました',
      te: stem + U_TE[last],
      nai: stem + U_NAI[last] + 'ない',
      ta: stem + taSuffix,
      ba: stem + U_BA[last] + 'ば',
      tara: stem + taSuffix + 'ら',
      nara: reading + 'なら',
      to: reading + 'と',
      potential: stem + U_BA[last] + 'る',
      volitional: stem + U_VOL[last] + 'う',
      masuVol: stem + U_MASU[last] + 'ましょう',
    };
    return map[form] ?? null;
  }

  return null;
}

export const FORM_LABELS = {
  masu: 'ます form (polite present)',
  masuNeg: 'ません form (polite negative)',
  masuPast: 'ました form (polite past)',
  te: 'て form',
  nai: 'ない form (plain negative)',
  ta: 'た form (plain past)',
  ba: 'ば form (conditional)',
  tara: 'たら form (conditional)',
  nara: 'なら form (conditional)',
  to: 'と form (conditional)',
  potential: 'Potential form (can do)',
  volitional: 'Volitional form (let\'s/I will)',
  masuVol: 'ましょう form (let\'s — polite)',
};
