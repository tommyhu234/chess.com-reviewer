'use client'

import { Chess, Move } from "chess.js";
import dynamic from "next/dynamic";
import AnalysisMove from "./analysis_move";
import { useEffect, useState } from "react";

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false  // <- this do the magic ;)
});

export default function AnalysisChess({ game }: { game: string }) {
  const chess = new Chess()
  chess.loadPgn(game)
  const history = chess.history({ verbose: true })

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

  function Moves({ moves }: { moves: Move[][] }) {
    if (!isLoading) {
      return <div className="px-3 py-1 text-xs bg-secondary">
        {
          moves.map((move, index) => <AnalysisMove key={`${index}-${move}`} position={position} setPosition={setPosition} move={move} index={index + 1} />)
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
      setEvaluations(data)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <Chessboard position={position.fen} width={856} />
      </div>
      <div className="w-[40%] h-full">
        <div className="flex-col w-[75%] h-full bg-red-500">
          <div className="text-xl font-semibold text-center text-white-light py-2.5 bg-secondary-dark rounded-t">Analysis</div>
          <Moves moves={moves} />
        </div>
      </div>
    </>
  )
}