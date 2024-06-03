import { Chess } from "chess.js"
import { spawn } from "child_process"

export const dynamic = 'force-dynamic' // defaults to auto

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
  bestScore: string | null
  score: string | null
  moveType: MoveType | null
  bestWinChance: number | null
  accuracy: number | null
}

// https://support.chess.com/en/articles/8572705-how-are-moves-classified-what-is-a-blunder-or-brilliant-and-etc
const getMoveType = (diff: number) => {
  if (diff < 0.02) return MoveType.Excellent
  if (diff < 0.05) return MoveType.Good
  if (diff < 0.1) return MoveType.Inaccuracy
  if (diff < 0.2) return MoveType.Mistake
  else return MoveType.Blunder
}

const getWinChance = (score: string | null) => {
  if (!score) return 0
  if (score.includes("M")) return score.startsWith("-") ? 0 : 1
  return 0.5 + 0.5 * ((2 / (1 + Math.exp(-0.368 * parseFloat(score)))) - 1)
}

// https://lichess.org/page/accuracy
const getAccuracy = (diff: number) => {
  return 103.1668 * Math.exp(-0.04354 * (diff * 100)) - 3.1669
}

// https://lichess.org/page/accuracy
const calculateGameAccuracies = (evaluations: Evaluation[][]) => {
  const flatEvaluations = evaluations.flat(1)
  // Define window size
  const windowSize = Math.min(Math.max(Math.floor(flatEvaluations.length / 10), 2), 8)

  // Calculate weights based on standard deviation of accuracies within windows
  const weights: number[] = []
  for (let i = 0; i < flatEvaluations.length; i++) {
    const windowAccuracies = []
    let index = i
    if (i + windowSize > flatEvaluations.length) index = flatEvaluations.length - windowSize
    for (let j = index; j < index + windowSize; j++) {
      if (flatEvaluations[j]) windowAccuracies.push((flatEvaluations[j].bestWinChance || 0) * 100 || 0)
    }
    const mean = windowAccuracies.reduce((acc, val) => acc + val, 0) / windowAccuracies.length
    const arr = windowAccuracies.map(val => Math.pow(val - mean, 2))
    const sum = arr.reduce((acc, val) => acc + val, 0)
    const standardDeviation = Math.sqrt(sum / windowAccuracies.length)
    weights.push(Math.min(Math.max(standardDeviation, 0.5), 12)) // Ensure weight is between 0.5 and 12
  }

  // Pair accuracy with weight for each move
  const weightedAccuracies = flatEvaluations.map((x, index) => {
    const color = index % 2 === 0 ? 'white' : 'black'
    const accuracy = x.accuracy
    const weight = weights[index]
    return { accuracy, weight, color }
  })

  // Calculate accuracy for each color using weighted and harmonic means
  const calculateAccuracy = (color: string) => {
    const colorAccuracies = weightedAccuracies.filter(move => move.color === color)
    const weightedSum = colorAccuracies.reduce((acc, move) => acc + ((move.accuracy || 0) * move.weight), 0)
    const weightSum = colorAccuracies.reduce((acc, move) => acc + move.weight, 0)
    const weightedMean = weightedSum / weightSum

    const harmonicSum = colorAccuracies.reduce((acc, move) => acc + (1 / (move.accuracy || 0)), 0)
    const harmonicMean = colorAccuracies.length / harmonicSum;

    return (weightedMean + harmonicMean) / 2
  }

  // Calculate accuracy for each color
  const whiteAccuracy = calculateAccuracy('white')
  const blackAccuracy = calculateAccuracy('black')

  return { whiteAccuracy, blackAccuracy }
}

export async function POST(request: Request) {
  const body = await request.json()

  const chess = new Chess()
  chess.loadPgn(body)
  const moves = chess.history({ verbose: true })
  const depth = 15

  const getEvaluations: Promise<Evaluation[][]> = new Promise((resolve) => {
    const evaluations: Evaluation[] = Array.from({ length: moves.length + 1 }, () =>
      ({ bestMove: null, bestScore: null, score: null, moveType: null, bestWinChance: null, accuracy: null })
    )
    const stockfishPath = "stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe"
    const now = Date.now()
    const stockfish = spawn(stockfishPath)
    let moveIndex = 0

    stockfish.stdout.on("data", (data) => {
      if (data.includes(`info depth ${depth}`) && moveIndex < moves.length + 1) {
        const dataArray = data.toString().split(" ")
        const isWhite = moveIndex % 2 !== 1
        let bestScore
        if (dataArray.includes("mate")) {
          const value = dataArray[dataArray.findIndex((x: string) => x.includes("mate")) + 1]
          if (value.startsWith("-")) {
            if (isWhite) bestScore = `-M${value.substring(1, value.length)}`
            else bestScore = `M${value.substring(1, value.length)}`
          }
          else {
            if (isWhite) bestScore = `M${value}`
            else bestScore = `-M${value}`
          }
        } else bestScore = (parseInt(dataArray[dataArray.findIndex((x: string) => x.includes("cp")) + 1]) / (isWhite ? 100 : -100)).toString()
        evaluations[moveIndex].bestScore = bestScore
      }
      if (data.includes("bestmove") && moveIndex < moves.length + 1) {
        const dataArray = data.toString().split(" ")
        const bestMove = dataArray[dataArray.findIndex((x: string) => x.includes("bestmove")) + 1].substring(0, 4)
        evaluations[moveIndex].bestMove = bestMove
        moveIndex++
        if (moveIndex === moves.length + 1) {
          console.log(`Time taken: ${Date.now() - now}ms`)
          for (let i = 0; i < evaluations.length - 1; i++) {
            evaluations[i].score = evaluations[i + 1].bestScore
          }
          evaluations.pop()
          const ret: Evaluation[][] = []
          for (let i = 0; i < evaluations.length / 2; i++) {
            const move = []
            for (let j = 0; j < 2; j++) {
              const index = i * 2 + j
              const evaluation = evaluations[index]
              if (evaluation) {
                const winChance = getWinChance(evaluation.score)
                const bestWinChance = getWinChance(evaluation.bestScore)
                evaluation.bestWinChance = bestWinChance
                if (evaluation.bestMove === moves[index].lan) {
                  evaluation.moveType = MoveType.Best
                  evaluation.accuracy = 100
                } else {
                  const diff = Math.abs(bestWinChance - winChance)
                  if (index > 0) {
                    const prevMoveType = evaluations[index - 1].moveType || ""
                    if (["Blunder", "Mistake", "Miss", "Inaccuracy"].includes(prevMoveType) && diff >= 0.1 && diff < 0.2) evaluation.moveType = MoveType.Miss
                    else evaluation.moveType = getMoveType(diff)
                    evaluation.accuracy = getAccuracy(diff)
                  } else {
                    evaluation.moveType = MoveType.Best
                    evaluation.accuracy = 100
                  }
                }
                move.push(evaluation)
              }
            }
            ret.push(move)
          }
          if (moves[moves.length - 1].san.includes("#")) {
            const score = moves.length % 2 === 0 ? "0-1" : "1-0"
            evaluations[evaluations.length - 1].score = score
            evaluations[evaluations.length - 1].bestScore = score
            evaluations[evaluations.length - 1].moveType = MoveType.Best
            evaluations[evaluations.length - 1].accuracy = 100
          }
          stockfish.stdin.end()
          resolve(ret)
        } else if (moveIndex === moves.length) {
          stockfish.stdin.write(`position fen ${moves[moves.length - 1].after}\n`)
          stockfish.stdin.write(`go depth ${depth}\n`)
        } else {
          stockfish.stdin.write(`position fen ${moves[moveIndex].before}\n`)
          stockfish.stdin.write(`go depth ${depth}\n`)
        }
      }
    })

    stockfish.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`)
    })

    stockfish.on("close", (code) => {
      console.log(`child process exited with code ${code}`)
    })

    // Function to send commands to Stockfish
    const sendCommandToStockfish = (command: string) => {
      stockfish.stdin.write(command + '\n');
    }

    sendCommandToStockfish(`position fen ${moves[0].before}\n`)
    sendCommandToStockfish(`go depth ${depth}\n`)
  })

  const evaluations = await getEvaluations
  // Convert all the move notations to SAN
  for (let i = 0; i < evaluations.length; i++) {
    for (let j = 0; j < evaluations[i].length; j++) {
      chess.load(moves[i * 2 + j].before)
      chess.move(evaluations[i][j].bestMove || "")
      evaluations[i][j].bestMove = chess.history({ verbose: true })[chess.history().length - 1].san
    }
  }
  // Calculate the game accuracies for both players
  const accuracies = calculateGameAccuracies(evaluations)
  const { whiteAccuracy, blackAccuracy } = accuracies
  return Response.json({ whiteAccuracy: whiteAccuracy, blackAccuracy: blackAccuracy, evaluations: evaluations })
}