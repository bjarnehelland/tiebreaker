import * as R from 'ramda'

function initializeTeam(team) {
  return {
    team,
    gp: 0,
    w: 0,
    d: 0,
    l: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    fpp: 0,
    pts: 0,
  }
}

function generateTable(matches) {
  const teams = {}

  for (const match of matches) {
    const homeTeam =
      teams[match.homeTeam] ??
      (teams[match.homeTeam] = initializeTeam(match.homeTeam))
    const awayTeam =
      teams[match.awayTeam] ??
      (teams[match.awayTeam] = initializeTeam(match.awayTeam))

    homeTeam.gp += 1
    homeTeam.gf += match.homeTeamGoals
    homeTeam.ga += match.awayTeamGoals
    homeTeam.gd = homeTeam.gf - homeTeam.ga
    homeTeam.fpp += match.homeTeamFPP

    awayTeam.gp += 1
    awayTeam.gf += match.awayTeamGoals
    awayTeam.ga += match.homeTeamGoals
    awayTeam.gd = awayTeam.gf - awayTeam.ga
    awayTeam.fpp += match.awayTeamFPP

    if (match.homeTeamGoals > match.awayTeamGoals) {
      homeTeam.pts += 3

      homeTeam.w += 1
      awayTeam.l += 1
    } else if (match.homeTeamGoals < match.awayTeamGoals) {
      awayTeam.pts += 3

      homeTeam.l += 1
      awayTeam.w += 1
    } else {
      homeTeam.pts += 1
      awayTeam.pts += 1

      homeTeam.d += 1
      awayTeam.d += 1
    }
  }

  return Object.values(teams)
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

function groupTeams(prop) {
  return R.compose(
    R.groupWith(R.eqProps(prop)),
    R.sortWith([R.descend(R.prop(prop))]),
    R.filter(R.propEq('position', undefined)),
  )
}

function filterMatches(matches) {
  return function (teams) {
    return matches.filter(
      (match) =>
        teams.includes(match.homeTeam) && teams.includes(match.awayTeam),
    )
  }
}

const tiebbreakRuleFn = R.curry(function (matches, prop, table) {
  const groups = groupTeams(prop)(table)
  console.table(groups[0])
  //table = updatePositions(table, groups)
  console.log(prop, groups)
  groups
    .filter((group) => group.length === 1)
    .forEach((group) => {
      const tiebreakTable = R.compose(
        generateTable,
        filterMatches(matches),
        R.map(R.prop('team')),
      )(group)

      const tiebreakgroups = groupTeams(prop)(tiebreakTable)
      table = updatePositions(table, tiebreakgroups)
    })

  return R.clone(table)
})

function updatePositions(table, groups) {
  const positions = groups.reduce((acc, group, index) => {
    if (group.length === 1) {
      let position = 0
      for (let i = 0; i < index; i++) {
        position += groups[i].length
      }

      acc[group[0].team] = position
    }
    return acc
  }, {})

  if (Object.keys(positions).length > 0) {
    return R.map((item) => {
      if (positions[item.team] !== undefined)
        item.position = positions[item.team]
      return item
    })(table)
  }

  return R.clone(table)
}

const ruleFn = R.curry(function (prop, table) {
  const groups = groupTeams(prop)(table)

  return updatePositions(table, groups)
})

function drawingOfLots(table) {
  const teams = table.filter((item) => item.position !== undefined)

  console.log(shuffle(teams))

  return updatePositions(table, [])
}

function sortByPosition(table) {
  return R.sortWith([R.ascend(R.prop('position'))])(table)
}

export function standings(matches) {
  const initialTable = generateTable(matches)
  const tiebreak = tiebbreakRuleFn(matches)
  const table = R.compose(
    sortByPosition,
    drawingOfLots,
    tiebreak('fpp'),
    tiebreak('gf'),
    tiebreak('gd'),
    tiebreak('pts'),
    ruleFn('gf'),
    ruleFn('gd'),
    ruleFn('pts'),
  )(initialTable)
  console.table(table)
}
