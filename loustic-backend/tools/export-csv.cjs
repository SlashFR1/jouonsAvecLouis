#!/usr/bin/env node
/**
 * Exporte les données des jeux "legacy" (fichiers data.js en JS vanilla)
 * vers des fichiers CSV UTF-8 lus par le backend Spring Boot.
 *
 * Usage (depuis loustic-backend/) :  node tools/export-csv.cjs
 *
 * Chaque data.js est exécuté dans un sandbox `vm` (aucun accès au DOM),
 * puis ses variables globales sont aplaties en lignes CSV.
 * Ré-exécutable à volonté : les CSV sont entièrement régénérés.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LEGACY_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'main', 'resources', 'data');

/** Exécute un fichier JS legacy et renvoie ses variables globales. */
function loadLegacy(relPath) {
  const code = fs.readFileSync(path.join(LEGACY_ROOT, relPath), 'utf8')
    // const/let de premier niveau => var, pour les récupérer sur le contexte
    .replace(/^(\s*)(const|let) /gm, '$1var ');
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: relPath });
  return ctx;
}

function loadJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(LEGACY_ROOT, relPath), 'utf8'));
}

/** Échappement CSV RFC 4180. */
function cell(v) {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(name, columns, rows) {
  const lines = [columns.join(',')];
  rows.forEach((r, i) => {
    const row = { id: i + 1, ...r };
    lines.push(columns.map(c => cell(row[c])).join(','));
  });
  fs.writeFileSync(path.join(OUT_DIR, name), lines.join('\n') + '\n', 'utf8');
  console.log(`✅ ${name.padEnd(28)} ${rows.length} lignes`);
}

const strings = (arr, extra = {}) =>
  arr.filter(s => typeof s === 'string' && s.trim()).map(texte => ({ ...extra, texte }));

fs.mkdirSync(OUT_DIR, { recursive: true });

// --- 7 secondes ---
writeCsv('7sec_prompts.csv', ['id', 'challenge', 'temps_secondes'],
  loadLegacy('7sec/js/data.js').questions.map(q => ({ challenge: q, temps_secondes: 7 })));

// --- Boom boom (thèmes/gages actuellement codés en dur dans Bomb/bomb2.js) ---
{
  const src = fs.readFileSync(path.join(LEGACY_ROOT, 'Bomb/bomb2.js'), 'utf8');
  const grab = name => {
    const m = src.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
    return vm.runInNewContext(m[1]);
  };
  writeCsv('bomb_themes.csv', ['id', 'theme'], grab('defaultThemes').map(theme => ({ theme })));
  writeCsv('bomb_gages.csv', ['id', 'gage'], grab('defaultGages').map(gage => ({ gage })));
}

// --- Switch ---
{
  const d = loadLegacy('switch/js/data.js');
  writeCsv('switch_tasks.csv', ['id', 'mode', 'texte'],
    [...strings(d.wordList, { mode: 'normal' }), ...strings(d.hotWordList, { mode: 'hot' })]);
}

// --- Je n'ai jamais ---
{
  const d = loadLegacy('jenaijamais/js/data.js');
  writeCsv('jenaijamais.csv', ['id', 'mode', 'texte'],
    [...strings(d.words, { mode: 'normal' }), ...strings(d.hotWords, { mode: 'hot' })]);
}

// --- Tu préfères / Vote ou shot ---
writeCsv('tupreferes.csv', ['id', 'texte'], strings(loadLegacy('tupreferes/js/data.js').words));
writeCsv('voteoushot.csv', ['id', 'texte'], strings(loadLegacy('voteoushot/js/data.js').words));

// --- Vrai ou faux ---
{
  const { affirmations } = loadLegacy('vraioufaux/js/data.js');
  const rows = [];
  for (const [categorie, list] of Object.entries(affirmations)) {
    for (const a of list) rows.push({ categorie, affirmation: a.question, reponse: a.answer ? 'VRAI' : 'FAUX' });
  }
  writeCsv('vraioufaux.csv', ['id', 'categorie', 'affirmation', 'reponse'], rows);
}

// --- La taupe ---
{
  const { mots } = loadLegacy('lataupe/js/data.js');
  writeCsv('lataupe_words.csv', ['id', 'mot_majorite', 'mots_taupe'],
    Object.entries(mots).map(([mot, proches]) => ({ mot_majorite: mot, mots_taupe: proches.join('|') })));
}

// --- Limite prison ---
{
  const { GAME_DATA } = loadLegacy('limiteprison/js/data.js');
  writeCsv('limiteprison_questions.csv', ['id', 'texte'], strings(GAME_DATA.questions));
  writeCsv('limiteprison_answers.csv', ['id', 'texte'], strings(GAME_DATA.answers));
}

// --- Raconte-moi ---
writeCsv('racontemoi_stories.csv', ['id', 'theme', 'title', 'story', 'keyPhrase'],
  loadLegacy('racontemoi/js/data.js').GAME_DATA.map(({ id, ...rest }) => rest));

// --- Juge ---
{
  const { db } = loadLegacy('juge/data.js');
  writeCsv('juge.csv', ['id', 'mode', 'texte'],
    [...strings(db.normal, { mode: 'normal' }), ...strings(db.hot, { mode: 'hot' })]);
}

// --- Débat (5 formats regroupés) ---
{
  const rows = [];
  for (const format of ['express', 'Climp', 'tudefends', 'quiaraison', 'dacpasdac']) {
    const d = loadLegacy(`Debat/${format}/data.js`);
    const f = format.toLowerCase();
    rows.push(...strings(d.propositionsNormal, { format: f, mode: 'normal' }));
    rows.push(...strings(d.propositionsHot, { format: f, mode: 'hot' }));
  }
  writeCsv('debat.csv', ['id', 'format', 'mode', 'texte'], rows);
}

// --- Synapse ---
{
  const { DB } = loadLegacy('Synapse/questions.js');
  writeCsv('synapse_questions.csv', ['id', 'code', 'niveau', 'texte', 'reponse'],
    Object.entries(DB.questions).map(([code, q]) => ({ code, ...q })));
  writeCsv('synapse_bonus.csv', ['id', 'texte'], strings(DB.bonus));
}

// --- Alias ---
writeCsv('alias_words.csv', ['id', 'mot'], loadLegacy('Alias/words.js').LISTE_MOTS.map(mot => ({ mot })));

// --- Classe moi ça ---
writeCsv('classemoica_themes.csv', ['id', 'themeA', 'themeB'],
  loadJson('classeMoiCa/data/themes.json').map(({ id, ...rest }) => rest));

// --- SPY (Lieux) ---
{
  const src = fs.readFileSync(path.join(LEGACY_ROOT, 'spy/spy2.js'), 'utf8');
  const m = src.match(/const lieux = (\[[\s\S]*?\]);/);
  if (m) {
    const lieux = vm.runInNewContext(m[1]);
    writeCsv('spy_locations.csv', ['id', 'lieu'], lieux.map(lieu => ({ lieu })));
  }
}

console.log(`\n📁 CSV écrits dans ${path.relative(process.cwd(), OUT_DIR)}`);
