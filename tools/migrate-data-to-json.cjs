/**
 * Automated Migration Tool: Legacy JS Databases -> Clean Static JSON
 * Extracts all datasets from legacy game JS files and writes standardized JSON files
 * to both loustic-frontend/src/data/ and loustic-backend/src/main/resources/data/
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DATA_DIR = path.join(ROOT_DIR, 'loustic-frontend', 'src', 'data');
const BACKEND_DATA_DIR = path.join(ROOT_DIR, 'loustic-backend', 'src', 'main', 'resources', 'data');

[FRONTEND_DATA_DIR, BACKEND_DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createMockContext() {
  const handler = {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        if (prop === 'addEventListener') return () => {};
        if (prop === 'removeEventListener') return () => {};
        if (prop === 'classList') return { add: () => {}, remove: () => {}, contains: () => false };
        if (prop === 'style') return {};
        if (prop === 'getElementById') return () => new Proxy({}, handler);
        if (prop === 'querySelector') return () => new Proxy({}, handler);
        if (prop === 'querySelectorAll') return () => [];
        if (prop === 'createElement') return () => new Proxy({}, handler);
        return () => new Proxy({}, handler);
      }
      return undefined;
    }
  };
  const mockObj = new Proxy({}, handler);
  return {
    document: mockObj,
    window: mockObj,
    localStorage: { getItem: () => '[]', setItem: () => {} },
    navigator: {},
    Audio: class { play() {} pause() {} },
    console: { log: () => {}, error: () => {}, warn: () => {} }
  };
}

function evaluateFile(filePath, varNames) {
  const fullPath = path.resolve(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  let code = fs.readFileSync(fullPath, 'utf8');
  // Unwrap IIFE if present
  code = code.replace(/^\s*\(\s*function\s*\(\)\s*\{/m, '')
             .replace(/\}\s*\)\s*\(\s*\)\s*;\s*$/m, '');
  // Convert const and let declarations to var for vm evaluation
  code = code.replace(/\b(const|let)\b/g, 'var');
  const ctx = createMockContext();
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const result = {};
  for (const name of varNames) {
    result[name] = ctx[name];
  }
  return result;
}

function writeJson(filename, data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const frontPath = path.join(FRONTEND_DATA_DIR, filename);
  const backPath = path.join(BACKEND_DATA_DIR, filename);
  fs.writeFileSync(frontPath, jsonContent, 'utf8');
  fs.writeFileSync(backPath, jsonContent, 'utf8');
  const sizeKb = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(1);
  console.log(`✅ [OK] ${filename} -> Generated (${sizeKb} KB)`);
}

console.log('🚀 Starting Data Migration to Static JSON...\n');

// 1. 7 SECONDES
try {
  const { questions } = evaluateFile('7sec/js/data.js', ['questions']);
  writeJson('7sec.json', { questions: Array.isArray(questions) ? questions : [] });
} catch (e) {
  console.error('Error in 7sec:', e.message);
}

// 2. ALIAS
try {
  const { LISTE_MOTS } = evaluateFile('Alias/words.js', ['LISTE_MOTS']);
  writeJson('alias.json', { words: Array.isArray(LISTE_MOTS) ? LISTE_MOTS : [] });
} catch (e) {
  console.error('Error in Alias:', e.message);
}

// 3. BOMB
try {
  const { defaultThemes, defaultGages } = evaluateFile('Bomb/bomb2.js', ['defaultThemes', 'defaultGages']);
  writeJson('bomb.json', {
    themes: Array.isArray(defaultThemes) ? defaultThemes : [],
    gages: Array.isArray(defaultGages) ? defaultGages : []
  });
} catch (e) {
  console.error('Error in Bomb:', e.message);
}

// 4. DEBAT (5 sub-modes)
try {
  const climp = evaluateFile('Debat/Climp/data.js', ['propositionsNormal', 'propositionsHot']);
  const dac = evaluateFile('Debat/dacpasdac/data.js', ['propositionsNormal', 'propositionsHot']);
  const express = evaluateFile('Debat/express/data.js', ['propositionsNormal', 'propositionsHot']);
  const quiaraison = evaluateFile('Debat/quiaraison/data.js', ['propositionsNormal', 'propositionsHot']);
  const tudefends = evaluateFile('Debat/tudefends/data.js', ['propositionsNormal', 'propositionsHot']);

  writeJson('debat.json', {
    climp: { normal: climp.propositionsNormal || [], hot: climp.propositionsHot || [] },
    dacpasdac: { normal: dac.propositionsNormal || [], hot: dac.propositionsHot || [] },
    express: { normal: express.propositionsNormal || [], hot: express.propositionsHot || [] },
    quiaraison: { normal: quiaraison.propositionsNormal || [], hot: quiaraison.propositionsHot || [] },
    tudefends: { normal: tudefends.propositionsNormal || [], hot: tudefends.propositionsHot || [] }
  });
} catch (e) {
  console.error('Error in Debat:', e.message);
}

// 5. CLASSE MOI CA
try {
  const rawPairs = JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'classeMoiCa/data/themes.json'), 'utf8'));
  const { themes, hotThemes } = evaluateFile('classeMoiCa/js/multiplayer_themes.js', ['themes', 'hotThemes']);
  writeJson('classemoica.json', {
    pairs: rawPairs || [],
    themes: themes || [],
    hotThemes: hotThemes || []
  });
} catch (e) {
  console.error('Error in ClasseMoiCa:', e.message);
}

// 6. DEVINE QUI
try {
  const { THEMES, CONTRAINTES } = evaluateFile('devinequi/devinequi.js', ['THEMES', 'CONTRAINTES']);
  writeJson('devinequi.json', {
    themes: THEMES || {},
    contraintes: CONTRAINTES || {}
  });
} catch (e) {
  console.error('Error in DevineQui:', e.message);
}

// 7. JE N'AI JAMAIS
try {
  const { words, hotWords } = evaluateFile('jenaijamais/js/data.js', ['words', 'hotWords']);
  writeJson('jenaijamais.json', {
    normal: words || [],
    hot: hotWords || []
  });
} catch (e) {
  console.error('Error in Je n\'ai jamais:', e.message);
}

// 8. JUGE
try {
  const { db } = evaluateFile('juge/data.js', ['db']);
  writeJson('juge.json', {
    normal: (db && db.normal) || [],
    hot: (db && db.hot) || []
  });
} catch (e) {
  console.error('Error in Juge:', e.message);
}

// 9. LA TAUPE
try {
  const { mots } = evaluateFile('lataupe/js/data.js', ['mots']);
  writeJson('lataupe.json', {
    words: mots || {}
  });
} catch (e) {
  console.error('Error in La Taupe:', e.message);
}

// 10. LIMITE PRISON
try {
  const { GAME_DATA } = evaluateFile('limiteprison/js/data.js', ['GAME_DATA']);
  writeJson('limiteprison.json', {
    questions: (GAME_DATA && GAME_DATA.questions) || [],
    answers: (GAME_DATA && GAME_DATA.answers) || []
  });
} catch (e) {
  console.error('Error in Limite Prison:', e.message);
}

// 11. PARASITE
try {
  const { ROLES } = evaluateFile('parasite/js/roles.js', ['ROLES']);
  writeJson('parasite.json', {
    roles: ROLES || {}
  });
} catch (e) {
  console.error('Error in Parasite:', e.message);
}

// 12. RACONTE MOI
try {
  const { GAME_DATA, THEMES } = evaluateFile('racontemoi/js/data.js', ['GAME_DATA', 'THEMES']);
  writeJson('racontemoi.json', {
    stories: GAME_DATA || [],
    themes: THEMES || []
  });
} catch (e) {
  console.error('Error in Raconte Moi:', e.message);
}

// 13. SPY
try {
  const { lieux } = evaluateFile('spy/spy2.js', ['lieux']);
  writeJson('spy.json', {
    lieux: lieux || []
  });
} catch (e) {
  console.error('Error in Spy:', e.message);
}

// 14. SWITCH
try {
  const { wordList, hotWordList } = evaluateFile('switch/js/data.js', ['wordList', 'hotWordList']);
  writeJson('switch.json', {
    normal: wordList || [],
    hot: hotWordList || []
  });
} catch (e) {
  console.error('Error in Switch:', e.message);
}

// 15. SYNAPSE
try {
  const { DB } = evaluateFile('Synapse/questions.js', ['DB']);
  writeJson('synapse.json', {
    questions: (DB && DB.questions) || {},
    bonus: (DB && DB.bonus) || {}
  });
} catch (e) {
  console.error('Error in Synapse:', e.message);
}

// 16. TU PREFERES
try {
  const { words } = evaluateFile('tupreferes/js/data.js', ['words']);
  writeJson('tupreferes.json', {
    pairs: words || []
  });
} catch (e) {
  console.error('Error in Tu Préfères:', e.message);
}

// 17. UNIVERSAL MIND
try {
  const { concepts } = evaluateFile('universalmind/script.js', ['concepts']);
  const defaultWords = [
    'Pyramide', 'Bicyclette', 'Café', 'Chocolat', 'Volcan', 'Astronaute',
    'Tour Eiffel', 'Pianiste', 'Dinosaure', 'Arc-en-ciel', 'Cinéma', 'Sous-marin',
    'Vampire', 'Samouraï', 'Labyrinthe', 'Pompier', 'Château', 'Plongée sous-marine',
    'Robot', 'Mariage', 'Anniversaire', 'Crocodile', 'Tempête', 'Tigre'
  ];
  writeJson('universalmind.json', {
    concepts: concepts || [],
    words: defaultWords
  });
} catch (e) {
  console.error('Error in Universal Mind:', e.message);
}

// 18. VOTE OU SHOT
try {
  const { words } = evaluateFile('voteoushot/js/data.js', ['words']);
  writeJson('voteoushot.json', {
    questions: words || []
  });
} catch (e) {
  console.error('Error in Vote ou Shot:', e.message);
}

// 19. VRAI OU FAUX
try {
  const { categoryNames, affirmations } = evaluateFile('vraioufaux/js/data.js', ['categoryNames', 'affirmations']);
  writeJson('vraioufaux.json', {
    categories: categoryNames || [],
    affirmations: affirmations || {}
  });
} catch (e) {
  console.error('Error in Vrai ou Faux:', e.message);
}

// 20. GALERIE
try {
  const themesConfig = {
    art: { title: "Art & Tableaux", folder: "images/art", ext: "png", count: 20 },
    histoire: { title: "Moments d'Histoire", folder: "images/histoire", ext: "png", count: 20 },
    memes: { title: "Culture Internet & Mèmes", folder: "images/memes", ext: "png", count: 20 },
    nature: { title: "Merveilles de la Nature", folder: "images/nature", ext: "png", count: 20 },
    cosmos: { title: "Cosmos & Galaxie", folder: "images/cosmos", ext: "png", count: 20 }
  };
  writeJson('galerie.json', {
    themes: themesConfig,
    cards: [
      { id: 1, title: "L'aurore boréale", tags: ["nuit", "lumière", "magie"] },
      { id: 2, title: "Le voyageur solitaire", tags: ["voyage", "solitude", "montagne"] },
      { id: 3, title: "L'horloge brisée", tags: ["temps", "mémoire", "oubli"] },
      { id: 4, title: "Le banquet secret", tags: ["fête", "mystère", "nuit"] },
      { id: 5, title: "L'oasis céleste", tags: ["désert", "eau", "rêve"] },
      { id: 6, title: "La cité volante", tags: ["futur", "ciel", "utopie"] },
      { id: 7, title: "Le masque de velours", tags: ["déguisement", "carnaval", "identité"] },
      { id: 8, title: "Le chant des sirènes", tags: ["mer", "musique", "danger"] }
    ]
  });
} catch (e) {
  console.error('Error in Galerie:', e.message);
}

// 21. MESS MEME
try {
  const memeSituations = [
    "Quand ton réveil sonne un lundi matin après avoir dormi 3h.",
    "Quand le serveur dit 'Bon appétit' et que tu réponds 'Toi aussi'.",
    "Quand quelqu'un commence sa phrase par 'Sans vouloir te vexer...'",
    "Quand tu regardes ton compte en banque après le week-end.",
    "Quand tes parents essaient d'expliquer comment fonctionne un ordinateur.",
    "Quand le prof dit 'Mettez-vous par deux' et que tu regardes ton pote.",
    "Quand tu envoies un message à la mauvaise personne et que tu vois 'En train d'écrire...'",
    "Quand tu te cognes le petit orteil dans le coin du lit.",
    "Quand tu entends ton prénom dans la conversation de la table d'à côté.",
    "Quand tu dis que tu vas dormir tôt mais qu'il est 4h du matin sur TikTok."
  ];
  const images = [];
  for (let i = 1; i <= 107; i++) {
    images.push(`images/meme_${i}.jpg`);
  }
  writeJson('messmeme.json', {
    totalImages: 107,
    images: images,
    situations: memeSituations
  });
} catch (e) {
  console.error('Error in Mess Meme:', e.message);
}

// 22. YAMS
try {
  writeJson('yams.json', {
    sections: {
      upper: [
        { id: "as", name: "Total de 1", desc: "Somme des 1" },
        { id: "deux", name: "Total de 2", desc: "Somme des 2" },
        { id: "trois", name: "Total de 3", desc: "Somme des 3" },
        { id: "quatre", name: "Total de 4", desc: "Somme des 4" },
        { id: "cinq", name: "Total de 5", desc: "Somme des 5" },
        { id: "six", name: "Total de 6", desc: "Somme des 6" }
      ],
      lower: [
        { id: "brelan", name: "Brelan (3 identiques)", score: "Somme des 5 dés" },
        { id: "carre", name: "Carré (4 identiques)", score: "Somme des 5 dés" },
        { id: "full", name: "Full (3 + 2)", score: "25 pts" },
        { id: "petite_suite", name: "Petite Suite (4 à la suite)", score: "30 pts" },
        { id: "grande_suite", name: "Grande Suite (5 à la suite)", score: "40 pts" },
        { id: "yams", name: "YAMS (5 identiques)", score: "50 pts" },
        { id: "chance", name: "Chance", score: "Somme des 5 dés" }
      ]
    },
    rules: {
      rollsPerTurn: 3,
      diceCount: 5,
      upperBonusThreshold: 63,
      upperBonusPoints: 35
    }
  });
} catch (e) {
  console.error('Error in Yams:', e.message);
}

console.log('\n🎉 Universal Data Migration Completed Successfully!');
