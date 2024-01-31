'use client'

import { Chess, Move } from "chess.js";
import dynamic from "next/dynamic";
import AnalysisMove from "./analysis_move";
import { useState } from "react";

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false  // <- this do the magic ;)
});

export default function AnalysisChess({ game }: { game: string }) {
  const chess = new Chess()
  chess.loadPgn(game)
  const history = chess.history({ verbose: true })

  const [position, setPosition] = useState({
    fen: "start",
    move: null,
    key: null,
  })

  const moves: Move[][] = []
  for (let i = 0; i < history.length / 2; i++) {
    moves.push([history[i * 2], history[i * 2 + 1]])
  }

  return (
    <>
      <div className="w-[21%]"></div>
      <div className="w-[54rem] mr-8">
        <Chessboard position={position.fen} width={856} />
      </div>
      <div className="w-[40%] h-full">
        <div className="flex-col w-[75%] h-full bg-red-500">
          <div className="text-xl font-semibold text-center text-white-light py-2.5 bg-secondary-dark rounded-t">Analysis</div>
          <div className="px-3 py-1 text-xs bg-secondary">
            {
              moves.map((move, index) => <AnalysisMove key={`${index}-${move}`} position={position} setPosition={setPosition} move={move} index={index + 1} />)
            }
          </div>
        </div>
      </div>
    </>
  )
}