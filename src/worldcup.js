import { matches } from './matches'
import { shuffle, generateTable, tiebreak, sort } from './utils'
import * as R from 'ramda'

function filterMatches(teams) {
  return matches.filter(
    (match) => teams.includes(match.homeTeam) && teams.includes(match.awayTeam),
  )
}

const initialTable = R.compose(
  sort(['pts', 'gd', 'gf']),
  generateTable,
)(matches)
console.table(initialTable)

const tiebreakTeams = tiebreak(['pts', 'gd', 'gf'], initialTable)
console.log(tiebreakTeams)

let tiebreakTable = R.compose(
  sort(['pts', 'gd', 'gf']),
  generateTable,
  filterMatches,
)(tiebreakTeams[0])
console.table(tiebreakTable)

const drawingOfLotsTeams = tiebreak(['pts', 'gd', 'gf'], initialTable)
console.log(drawingOfLotsTeams)

let drawingOfLotsTeamsTable = R.compose(shuffle)(drawingOfLotsTeams[0])
console.log(drawingOfLotsTeamsTable)
// const drawingOfLotsTeams = tiebreakTeamsFn(tiebreakTable).flat()

// shuffle(drawingOfLotsTeams).forEach((item, i) => {
//   tiebreakTable.find((i) => i.team === item).internalIndex = i
// })

// tableSort(tiebreakTable).forEach((item, i) => {
//   initialTable.find((i) => i.team === item.team).internalIndex = i
// })

//console.table(tiebreakTable)
