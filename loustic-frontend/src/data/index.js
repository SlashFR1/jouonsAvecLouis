import sevenSecData from './7sec.json'
import aliasData from './alias.json'
import bombData from './bomb.json'
import classeMoiCaData from './classemoica.json'
import debatData from './debat.json'
import devineQuiData from './devinequi.json'
import galerieData from './galerie.json'
import jeNaiJamaisData from './jenaijamais.json'
import jugeData from './juge.json'
import laTaupeData from './lataupe.json'
import limitePrisonData from './limiteprison.json'
import messMemeData from './messmeme.json'
import parasiteData from './parasite.json'
import raconteMoiData from './racontemoi.json'
import spyData from './spy.json'
import switchData from './switch.json'
import synapseData from './synapse.json'
import tuPreferesData from './tupreferes.json'
import universalMindData from './universalmind.json'
import voteOuShotData from './voteoushot.json'
import vraiOuFauxData from './vraioufaux.json'
import yamsData from './yams.json'

export {
  sevenSecData,
  aliasData,
  bombData,
  classeMoiCaData,
  debatData,
  devineQuiData,
  galerieData,
  jeNaiJamaisData,
  jugeData,
  laTaupeData,
  limitePrisonData,
  messMemeData,
  parasiteData,
  raconteMoiData,
  spyData,
  switchData,
  synapseData,
  tuPreferesData,
  universalMindData,
  voteOuShotData,
  vraiOuFauxData,
  yamsData,
}

/**
 * Récupère le deck de données statiques sous forme de cartes typées.
 * Garantit une disponibilité immédiate (0 latence, 100% hors-ligne).
 */
export function getStaticDeck(deckKey, filters = {}) {
  const mode = filters?.mode || 'normal'

  switch (deckKey) {
    case 'jenaijamais': {
      const list = mode === 'hot' ? jeNaiJamaisData.hot : jeNaiJamaisData.normal
      return list.map((texte, id) => ({ id: `jnj_${id}`, texte, mode }))
    }

    case 'switch': {
      const list = mode === 'hot' ? switchData.hot : switchData.normal
      return list.map((action, id) => ({ id: `sw_${id}`, action, texte: action, mode }))
    }

    case 'tupreferes': {
      return (tuPreferesData.pairs || []).map((pair, id) => {
        const text = typeof pair === 'string' ? pair : (Array.isArray(pair) ? `${pair[0]} OU ${pair[1]}` : (pair?.texte || ''))
        return {
          id: `tp_${id}`,
          texte: text,
          prompt: text,
        }
      })
    }

    case 'voteoushot': {
      return (voteOuShotData.questions || []).map((q, id) => ({
        id: `vos_${id}`,
        question: q,
        texte: q,
      }))
    }

    case 'juge': {
      const list = mode === 'hot' ? jugeData.hot : jugeData.normal
      return list.map((affaire, id) => ({ id: `jg_${id}`, affaire, texte: affaire, mode }))
    }

    case 'vraioufaux': {
      const affirmations = vraiOuFauxData.affirmations || {}
      const res = []
      for (const [cat, items] of Object.entries(affirmations)) {
        if (filters?.category && filters.category !== cat) continue
        items.forEach((item, idx) => {
          const text = item.question || item.text || item.affirmation || ''
          res.push({
            id: `vof_${cat}_${idx}`,
            categorie: cat,
            affirmation: text,
            texte: text,
            reponse: item.answer != null ? (item.answer ? 'VRAI' : 'FAUX') : (item.reponse || 'VRAI'),
            explication: item.explanation || item.explication || '',
          })
        })
      }
      return res
    }

    case '7sec':
    case '7sec_prompts': {
      if (Array.isArray(sevenSecData.items) && sevenSecData.items.length > 0) {
        return sevenSecData.items.map(it => ({
          id: it.id,
          theme: it.theme,
          challenge: it.prompt,
          prompt: it.prompt,
          texte: it.prompt,
          count: it.count || 3,
          temps_secondes: it.temps || 7,
        }))
      }
      return (sevenSecData.questions || []).map((q, id) => ({
        id: `7s_${id}`,
        theme: 'Général',
        challenge: q,
        prompt: q,
        texte: q,
        count: 3,
        temps_secondes: 7,
      }))
    }

    case 'alias':
    case 'alias_words': {
      return (aliasData.words || []).map((w, id) => ({
        id: `al_${id}`,
        mot: w,
        texte: w,
      }))
    }

    case 'bomb':
    case 'bomb_themes': {
      return (bombData.themes || []).map((t, id) => ({
        id: `bt_${id}`,
        theme: t,
        texte: t,
      }))
    }

    case 'bomb_gages': {
      return (bombData.gages || []).map((g, id) => ({
        id: `bg_${id}`,
        gage: g,
        texte: g,
      }))
    }

    case 'debat': {
      const modes = ['climp', 'dacpasdac', 'express', 'quiaraison', 'tudefends']
      const res = []
      modes.forEach(subMode => {
        const sub = debatData[subMode]
        if (!sub) return
        const list = mode === 'hot' ? sub.hot : sub.normal
        list.forEach((texte, i) => {
          res.push({
            id: `deb_${subMode}_${i}`,
            format: subMode,
            texte,
            mode,
          })
        })
      })
      return res
    }

    case 'classemoica':
    case 'classemoica_themes': {
      const list = mode === 'hot' ? (classeMoiCaData.hotThemes || []) : (classeMoiCaData.themes || [])
      return list.map((t, id) => ({
        id: `cmc_${id}`,
        theme: t,
        texte: t,
      }))
    }

    case 'lataupe':
    case 'lataupe_words': {
      const wordsMap = laTaupeData.words || {}
      return Object.entries(wordsMap).map(([mainWord, moleWords], id) => {
        const moleWord = Array.isArray(moleWords) && moleWords.length > 0
          ? moleWords[Math.floor(Math.random() * moleWords.length)]
          : mainWord
        return {
          id: `lt_${id}`,
          mainWord,
          moleWord,
          texte: `${mainWord} / ${moleWord}`,
        }
      })
    }

    case 'synapse':
    case 'synapse_categories': {
      if (Array.isArray(synapseData.categories) && synapseData.categories.length > 0) {
        return synapseData.categories
      }
      return []
    }

    case 'synapse_questions': {
      const res = []
      if (Array.isArray(synapseData.categories)) {
        synapseData.categories.forEach(cat => {
          (cat.questions || []).forEach(q => {
            res.push({
              id: `syn_${cat.id}_${q.niveau}`,
              category: cat.title,
              theme: cat.title,
              emoji: cat.emoji,
              level: q.niveau,
              niveau: q.niveau,
              texte: q.texte,
              question: q.texte,
              reponse: q.reponse,
              answer: q.reponse,
            })
          })
        })
        return res
      }
      return []
    }

    case 'racontemoi':
    case 'racontemoi_stories': {
      return (raconteMoiData.stories || []).map(story => ({
        id: `rm_${story.id}`,
        theme: story.theme,
        title: story.title,
        story: story.story,
        keyPhrase: story.keyPhrase,
        texte: story.title,
      }))
    }

    case 'spy':
    case 'spy_locations': {
      return (spyData.lieux || []).map((l, id) => ({
        id: `spy_${id}`,
        lieu: l,
        location: l,
        texte: l,
      }))
    }

    case 'limiteprison':
    case 'limiteprison_questions': {
      if (Array.isArray(limitePrisonData.blackCards) && limitePrisonData.blackCards.length > 0) {
        return limitePrisonData.blackCards.map(bc => ({
          id: bc.id,
          text: bc.text,
          texte: bc.text,
          blanksCount: bc.blanksCount || 1,
        }))
      }
      return (limitePrisonData.questions || []).map((q, id) => ({
        id: `bc_${id}`,
        text: q,
        texte: q,
        blanksCount: 1,
      }))
    }

    case 'limiteprison_answers': {
      if (Array.isArray(limitePrisonData.whiteCards) && limitePrisonData.whiteCards.length > 0) {
        return limitePrisonData.whiteCards.map(wc => ({
          id: wc.id,
          text: wc.text,
          texte: wc.text,
        }))
      }
      return (limitePrisonData.answers || []).map((a, id) => ({
        id: `wc_${id}`,
        text: a,
        texte: a,
      }))
    }

    default:
      return []
  }
}
