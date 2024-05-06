'use client'

import { Chess, Move } from "chess.js";
import dynamic from "next/dynamic";
import Image from 'next/image'
import AnalysisMove from "./analysis_move";
import { useEffect, useState } from "react";

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false  // <- this do the magic ;)
});

const getValue = (key: string, pgn: string) => {
  const regex = new RegExp(`${key} ".+"]`)
  const match = pgn.match(regex)
  if (match !== null) return match[0].split('"')[1]
  else return ""
}

export default function AnalysisChess({ game }: { game: string }) {
  const chess = new Chess()
  chess.loadPgn(game)
  const history = chess.history({ verbose: true })
  const result = getValue("Result", game)

  const moves: Move[][] = []
  for (let i = 0; i < history.length / 2; i++) {
    moves.push([history[i * 2], history[i * 2 + 1]])
  }

  const [position, setPosition] = useState({
    fen: "start",
    move: moves[0][0].lan,
    key: "",
  })
  const [evaluations, setEvaluations] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [whitePlayer, setWhitePlayer] = useState({ avatar: "" })
  const [blackPlayer, setBlackPlayer] = useState({ avatar: "" })
  const [whiteAccuracy, setWhiteAccuracy] = useState(0.0)
  const [blackAccuracy, setBlackAccuracy] = useState(0.0)

  function Moves({ moves, evaluations }: { moves: Move[][], evaluations: any[] }) {
    if (!isLoading) {
      return <div className="px-3 py-1 text-xs bg-secondary h-[774px] overflow-auto">
        {
          moves.map((move, index) =>
            <AnalysisMove
              key={`${index}-${move}`}
              position={position}
              setPosition={setPosition}
              move={move}
              index={index + 1}
              evaluation={evaluations[index]} />
          )
        }
      </div>
    } else {
      return <div>Loading...</div>
    }
  }

  useEffect(() => {
    fetch("/analysis/api", {
      method: "POST",
      body: JSON.stringify(game),
    }).then(async (response: Response) => {
      const data = await response.json()
      setEvaluations(data.evaluations)
      setWhiteAccuracy(data.whiteAccuracy)
      setBlackAccuracy(data.blackAccuracy)
      setLoading(false)
    })
    const whiteUsername = getValue("White", game)
    const blackUsername = getValue("Black", game)
    fetch(`/profile/api?username=${whiteUsername}`).then(async (response: Response) => {
      const data = await response.json()
      setWhitePlayer(data)
    })
    fetch(`/profile/api?username=${blackUsername}`).then(async (response: Response) => {
      const data = await response.json()
      setBlackPlayer(data)
    })
  }, [game])

  return (
    <>
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <Chessboard
          position={position.fen}
          width={856}
          lightSquareStyle={{ backgroundColor: "#EBECD0" }}
          darkSquareStyle={{ backgroundColor: "#739552" }}
          pieces={{
            wP: ({ squareWidth }) => <img src="/pieces/wp.png" width={squareWidth} height={squareWidth} />,
            wN: ({ squareWidth }) => <img src="/pieces/wn.png" width={squareWidth} height={squareWidth} />,
            wB: ({ squareWidth }) => <img src="/pieces/wb.png" width={squareWidth} height={squareWidth} />,
            wR: ({ squareWidth }) => <img src="/pieces/wr.png" width={squareWidth} height={squareWidth} />,
            wQ: ({ squareWidth }) => <img src="/pieces/wq.png" width={squareWidth} height={squareWidth} />,
            wK: ({ squareWidth }) => <img src="/pieces/wk.png" width={squareWidth} height={squareWidth} />,
            bP: ({ squareWidth }) => <img src="/pieces/bp.png" width={squareWidth} height={squareWidth} />,
            bN: ({ squareWidth }) => <img src="/pieces/bn.png" width={squareWidth} height={squareWidth} />,
            bB: ({ squareWidth }) => <img src="/pieces/bb.png" width={squareWidth} height={squareWidth} />,
            bR: ({ squareWidth }) => <img src="/pieces/br.png" width={squareWidth} height={squareWidth} />,
            bQ: ({ squareWidth }) => <img src="/pieces/bq.png" width={squareWidth} height={squareWidth} />,
            bK: ({ squareWidth }) => <img src="/pieces/bk.png" width={squareWidth} height={squareWidth} />,
          }}
        />
      </div>
      <div className="w-[40%] h-full">
        <div className="flex-col w-[75%] h-full">
          <div className="text-xl font-semibold text-center text-white-light py-2.5 mb-[1px] bg-secondary-dark rounded-t">Analysis</div>
          <div className="flex justify-center text-2xl font-semibold text-center space-x-3 text-white-light pt-[15px] bg-secondary">
            <Image src="/moveTypes/best.png" width={32} height={32} alt="" />
            <div>
              Game Review
            </div>
          </div>
          <div className="flex h-[84px] p-[15px] bg-secondary justify-center">
            <div className={`flex border-2 ${result === "1-0" ? "border-move-best" : "border-move-blunder"} rounded`}>
              <div className="flex flex-col bg-white w-[100px] h-[50px] rounded-l-sm items-center justify-center text-xl font-bold">
                <div className="text-xl font-bold h-[24px]">
                  {whiteAccuracy.toFixed(1)}
                </div>
                <div className="text-xs text-gray font-semibold">Accuracy</div>
              </div>
              <img src={whitePlayer.avatar} className="w-[50px] h-[50px] object-cover rounded-r-sm" />
            </div>
            <div className="flex w-[65px] h-full items-center justify-center text-gray-light font-semibold text-xs">
              {result}
            </div>
            <div className={`flex border-2 ${result === "0-1" ? "border-move-best" : "border-move-blunder"} rounded`}>
              <img src={blackPlayer.avatar} className="w-[50px] h-[50px] object-cover rounded-l-sm" />
              <div className="flex flex-col w-[100px] h-[50px] rounded-r-sm items-center justify-center">
                <div className="text-white text-xl font-bold h-[24px]">
                  {blackAccuracy.toFixed(1)}
                </div>
                <div className="text-xs text-gray font-semibold">Accuracy</div>
              </div>
            </div>
          </div>
          <Moves moves={moves} evaluations={evaluations} />
        </div>
      </div>
    </>
  )
}