
'use server'

import { spawn } from 'child_process'

export async function evaluatePosition(fen: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stockfishPath = process.env.STOCKFISH_PATH || ""
    const stockfish = spawn(stockfishPath)
    let evaluation = ''

    stockfish.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes(`info depth 15`)) {
        const dataArray = output.split(" ")
        if (dataArray.includes("mate")) {
          const value = dataArray[dataArray.findIndex((x: string) => x.includes("mate")) + 1]
          evaluation = value.startsWith("-") ? `-M${value.substring(1)}` : `M${value}`
        } else {
          const cpIndex = dataArray.findIndex((x: string) => x.includes("cp"))
          if (cpIndex !== -1) {
            const cpValue = parseInt(dataArray[cpIndex + 1])
            // Negate the evaluation if it's black's move
            evaluation = (cpValue / (fen.split(' ')[1] === 'w' ? 100 : -100)).toString()
          }
        }
      }
      if (output.includes('bestmove')) {
        stockfish.stdin.write('quit\n')
      }
    })

    stockfish.stderr.on('data', (data) => {
      console.error(`Stockfish error: ${data}`)
    })

    stockfish.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Stockfish process exited with code ${code}`))
      } else {
        resolve(evaluation)
      }
    })

    stockfish.stdin.write('uci\n')
    stockfish.stdin.write('isready\n')
    stockfish.stdin.write(`position fen ${fen}\n`)
    stockfish.stdin.write('go depth 15\n')
  })
}
