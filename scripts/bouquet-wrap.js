export const wrapChoices = {
  paper: {
    kraft: {name:'Honey kraft', colors:['#a7845c','#e2c39b','#f0dabb','#b4966d']},
    blush: {name:'Rose paper', colors:['#ac7977','#d8aaa4','#eecac0','#ab7e7c']},
    sage: {name:'Sage vellum', colors:['#798473','#bac3a6','#d3d8bd','#83947e']},
    indigo: {name:'Midnight blue', colors:['#45566e','#748399','#95a1ae','#4e5d71']}
  },
  pattern: {
    meadow:{name:'Pressed sprigs'}, stripe:{name:'Pinstripe'}, plain:{name:'Plain'}
  },
  ribbon: {
    rose: {name:'Dusty rose',colors:['#854e52','#bd8182','#e0aaa2']},
    olive: {name:'Moss silk',colors:['#536453','#89977a','#bbc1a0']},
    honey: {name:'Golden silk',colors:['#967246','#c9a269','#eed09a']},
    plum: {name:'Damson',colors:['#654c67','#987996','#bea2b8']}
  }
};

export const defaultWrap = () => ({paper:'kraft', pattern:'meadow', ribbon:'rose'});

const sprigInk = '<path d="M-3 7Q2 1 2-7m-3 10q-5-2-4-6 4 1 4 6Zm1-3q5 0 6-5-4 .5-6 5Zm1-3q-4-2-3-6 4 1 3 6Z" fill="none" stroke-width=".73" stroke-linejoin="round"/>';
export function swatch(option, item) {
  if (option==='paper' || option==='ribbon') {
    const {colors}=wrapChoices[option][item];
    return `<span class="bq-swatch bq-swatch-${option}" style="--swatch:${colors[1]};--shadow:${colors[0]};--shine:${colors[2]}" aria-hidden="true"></span>`;
  }
  const lines='<path d="m0 15 10-16m-5 22L21-2m-9 26 15-23m-6 23 7-11" fill="none" stroke-width="1.1"/>';
  return `<svg class="bq-swatch-print" width="29" height="25" viewBox="0 0 29 25" aria-hidden="true"><rect x="1" y="2" width="27" height="21" rx="2" fill="#e4d1af"/><g stroke="#867558">${item==='stripe'?lines:item==='meadow'?'<g transform="translate(15 13) rotate(18)">'+sprigInk+'</g>':''}</g></svg>`;
}

export function makeWrap(prefix, selection, safeName) {
  const [shadow,mid,pale,edge]=wrapChoices.paper[selection.paper].colors;
  const [deep,silk,shine]=wrapChoices.ribbon[selection.ribbon].colors;
  const left='M88 181 152 204 221 177 187 299 157 314Z';
  const right='M232 178 164 217 98 197 157 314 187 300Z';
  const silkPaint=`url(#${prefix}-silk)`;
  const motif=selection.paper==='indigo'?'#e7daae':'#6b725a';
  const patterned=selection.pattern==='plain'?'':`<path d="${right}" fill="url(#${prefix}-print)" opacity=".65"/>`;
  const back=`<g class="bq-wrap-tissue"><path d="M78 173l40-15 39 19 51-23 32 14-58 111-24 12z" fill="${pale}" stroke="${edge}" stroke-width=".65"/><g fill="none" stroke="${edge}" opacity=".58" stroke-width=".62"><path d="m81 174 51 40m-14-54 17 35m73-39-22 44m52-31-37 39"/><path d="m85 176 31-12 18 8m76-12 19 9" stroke-dasharray="1 2.2"/></g></g>`;
  const front=`<defs>
    <linearGradient id="${prefix}-fold-left" x1="0" y1=".12" x2=".92" y2=".75"><stop stop-color="${pale}"/><stop offset=".3" stop-color="${mid}"/><stop offset="1" stop-color="${shadow}"/></linearGradient>
    <linearGradient id="${prefix}-fold-right" x1=".2" y1=".35" x2="1" y2=".6"><stop stop-color="${mid}"/><stop offset=".48" stop-color="${pale}"/><stop offset=".53" stop-color="${mid}"/><stop offset="1" stop-color="${edge}"/></linearGradient>
    <linearGradient id="${prefix}-silk" x1=".2" y1="0" x2=".7" y2="1"><stop stop-color="${deep}"/><stop offset=".44" stop-color="${silk}"/><stop offset=".63" stop-color="${shine}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <pattern id="${prefix}-print" width="${selection.pattern==='stripe'?5:24}" height="${selection.pattern==='stripe'?5:26}" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
      ${selection.pattern==='stripe'?`<path d="M1 0v5" stroke="${motif}" stroke-width=".48"/>`:`<g stroke="${motif}"><g transform="translate(7 7) rotate(-12) scale(.65)">${sprigInk}</g><g transform="translate(19 20) rotate(29) scale(.61)">${sprigInk}</g></g>`}
    </pattern></defs>
    <g class="bq-wrap-left"><path d="${left}" fill="url(#${prefix}-fold-left)" stroke="${edge}" stroke-width=".85"/><path d="${left}" fill="url(#${prefix}-grain)"/><path d="m91 184 61 117m.5-96-3 30" fill="none" stroke="${edge}" stroke-width=".85"/></g>
    <g class="bq-wrap-right"><path d="${right}" fill="url(#${prefix}-fold-right)" stroke="${edge}" stroke-width=".8"/>${patterned}<path d="${right}" fill="url(#${prefix}-grain)"/><path d="m229 182-63 87-9 43m-57-113 65 69" fill="none" stroke="${edge}" stroke-width=".85" opacity=".8"/><path d="m166 269 62-84" stroke="${pale}" stroke-width=".7"/></g>
    <g class="bq-ribbon" stroke="${deep}" stroke-linejoin="round" stroke-width=".8">
      <path d="M139 258q25 8 60-4l-2 9q-33 9-55 3Z" fill="${silkPaint}"/>
      <g class="bq-bow"><path d="M166 263Q151 282 129 294l10-1-2 6q24-14 33-34Z" fill="${silkPaint}"/><path d="M168 264q9 24 25 26l-4-7 9 2q-16-9-25-22Z" fill="${silkPaint}"/>
        <path d="M169 262c-13-17-28-24-34-20-10 8 11 26 31 24-9-2-27-13-25-18 2-3 13 1 27 16Z" fill="${silkPaint}" fill-rule="evenodd"/>
        <path d="M168 261c9-19 25-30 32-24 8 10-11 25-29 28 10-4 25-17 24-21-3-4-15 6-23 19Z" fill="${silkPaint}"/>
        <path d="M165 260q3-4 8-1l1 6q-4 3-9 0Z" fill="${silkPaint}"/>
        <g fill="none" stroke="${shine}" stroke-width=".65"><path d="M139 244q16 1 26 16m8-1q12-18 22-20m-33 32q-10 13-22 19m33-20q7 12 15 16"/></g>
      </g></g>
    <g class="bq-tag"><path d="M169 263q21 1 33 17m-33-17q25 0 34 19" fill="none" stroke="#857558" stroke-width=".85"/>
      <g transform="rotate(-11 204 281)"><path d="m197 276 7-5h61v20h-61l-7-5Z" fill="#776c5a" opacity=".28" transform="translate(1.4 1.8)"/><path d="m197 276 7-5h61v20h-61l-7-5Z" fill="#f6ecd2" stroke="#9b8969" stroke-width=".65"/><circle cx="204" cy="281" r="1.6" fill="#948367"/><text x="235" y="284.1" font-family="Georgia,serif" font-style="italic" font-size="9" text-anchor="middle" fill="#524732">For ${safeName}</text></g>
    </g>`;
  return {back, front};
}
