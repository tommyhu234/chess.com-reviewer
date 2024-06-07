enum MoveType {
  Best = "Best",
  Excellent = "Excellent",
  Good = "Good",
  Inaccuracy = "Inaccuracy",
  Miss = "Miss",
  Mistake = "Mistake",
  Blunder = "Blunder"
}

type Evaluation = {
  bestMove: string | null
  bestMoveLan: string | null
  bestScore: string | null
  score: string | null
  moveType: MoveType | null
  bestWinChance: number | null
  accuracy: number | null
}

export type {
  Evaluation
}

export {
  MoveType
}