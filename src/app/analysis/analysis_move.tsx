'use client'

import { Move } from "chess.js"
import Image from 'next/image'

const getMoveColor = (moveType: string) => {
  if (moveType === "Blunder") return "text-[#FA412D]"
  if (moveType === "Mistake") return "text-[#FFA459]"
  else return "text-gray-light"
}

const getMoveSymbol = (moveType: string) => {
  if (moveType === "Blunder") {
    return <div className="mr-[5px]">
      <Image src="/moveTypes/blunder.svg" width={16} height={16} alt="" />
    </div>
  } else if (moveType === "Mistake") {
    return <div className="mr-[5px]">
      <Image src="/moveTypes/mistake.svg" width={16} height={16} alt="" />
    </div>
  } else {
    return <div className="w-[16px] h-[16px] mr-[5px]" />
  }
}

export default function AnalysisMove({ position, setPosition, move, index, evaluation }: { position: any, setPosition: any, move: Move[], index: number, evaluation: any }) {
  const handleMoveClick = (move: Move) => {
    setPosition({
      fen: move.after,
      move: move.lan,
      key: `${index}-${move.san}`
    })
  }

  return (
    <div
      key={`${index}-${move[0].san}-${move[1] ? move[1].san : ""}`}
      className={`flex px-3 h-[30px] items-center cursor-pointer ${position.key.split("-")[0] == index ? "bg-main" : index % 2 === 0 ? "bg-secondary" : "bg-[#454441]"}`}>
      <div className="text-gray font-semibold w-[20px] mr-[10px]">{index}.</div>
      <div className={`${getMoveColor(evaluation[0].moveType)} flex items-center hover:text-white font-semibold w-[74px] mr-[10px]`}>
        {getMoveSymbol(evaluation[0].moveType)}
        <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[0].san}` ? "bg-[#5A5956]" : ""}`} onClick={() => handleMoveClick(move[0])}>
          {move[0].san}
        </div>
      </div>
      {
        move[1] ? (
          <div className={`${getMoveColor(evaluation[1].moveType)} flex items-center hover:text-white font-semibold w-[74px] mr-[20px]`}>
            {getMoveSymbol(evaluation[1].moveType)}
            <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[1].san}` ? "bg-[#5A5956]" : ""}`} onClick={() => handleMoveClick(move[1])}>
              {move[1].san}
            </div>
          </div>
        ) : (
          <div className="w-[74px] mr-[20px]" />
        )
      }
    </div>
  )
}