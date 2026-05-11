const CATEGORIES = ['taste', 'presentation', 'originality', 'texture', 'authenticity']

export function overallScore(vote) {
  return CATEGORIES.reduce((sum, c) => sum + vote[c], 0) / CATEGORIES.length
}

export function categoryAverages(votes) {
  if (!votes.length) return Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  return Object.fromEntries(
    CATEGORIES.map((c) => [
      c,
      votes.reduce((sum, v) => sum + v[c], 0) / votes.length,
    ])
  )
}

export function tapaScore(votes) {
  if (!votes.length) return 0
  return votes.reduce((sum, v) => sum + overallScore(v), 0) / votes.length
}

export function rankTapas(participants, votes) {
  const votesByTapa = {}
  for (const v of votes) {
    if (!votesByTapa[v.tapa_creator]) votesByTapa[v.tapa_creator] = []
    votesByTapa[v.tapa_creator].push(v)
  }

  const ranked = participants.map((p) => {
    const tapaVotes = votesByTapa[p.name] ?? []
    const avgs = categoryAverages(tapaVotes)
    return {
      name: p.name,
      tapa_name: p.tapa_name,
      votes: tapaVotes,
      voteCount: tapaVotes.length,
      score: tapaScore(tapaVotes),
      categoryAverages: avgs,
    }
  })

  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  return ranked
}

export function computeBadges(ranked) {
  if (!ranked.length) return {}
  const badges = {}

  let bestOriginality = -1
  let bestPresentation = -1
  let originalityWinner = null
  let presentationWinner = null

  for (const tapa of ranked) {
    if (tapa.voteCount === 0) continue
    const o = tapa.categoryAverages.originality
    const p = tapa.categoryAverages.presentation
    if (o > bestOriginality) { bestOriginality = o; originalityWinner = tapa.name }
    if (p > bestPresentation) { bestPresentation = p; presentationWinner = tapa.name }
  }

  if (originalityWinner) badges[originalityWinner] = [...(badges[originalityWinner] ?? []), 'Most Original']
  if (presentationWinner) badges[presentationWinner] = [...(badges[presentationWinner] ?? []), 'Best Presentation']
  return badges
}
