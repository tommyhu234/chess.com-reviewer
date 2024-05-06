'use client'

import { Move } from "chess.js"
import Image from 'next/image'

const getMoveColor = (moveType: string) => {
  if (moveType === "Blunder") return "text-move-blunder"
  if (moveType === "Mistake") return "text-[#FFA459]"
  if (moveType === "Miss") return "text-[#FF7769]"
  if (moveType === "Inaccuracy") return "text-[#F7C631]"
  if (moveType === "Good") return "text-[#77915F]"
  if (moveType === "Excellent") return "text-move-best"
  if (moveType === "Best") return "text-move-best"
  else return "text-gray-light"
}

const getMoveSymbol = (moveType: string) => {
  return <div className="mr-[5px]">
    <Image src={`/moveTypes/${moveType.toLowerCase()}.png`} width={16} height={16} alt="" />
  </div>
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
      className={`flex px-3 h-[30px] items-center cursor-pointer ${position.key.split("-")[0] == index ? "bg-main" : index % 2 === 0 ? "bg-secondary" : "bg-[#494845]"}`}>
      <div className="text-gray font-semibold w-[20px] mr-[10px]">{index}.</div>
      <div className={`${getMoveColor(evaluation[0].moveType)} flex items-center font-semibold w-[74px] mr-[10px]`} onClick={() => handleMoveClick(move[0])}>
        {getMoveSymbol(evaluation[0].moveType)}
        <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[0].san}` ? "bg-[#5A5A57]" : ""}`}>
          {move[0].san}
        </div>
      </div>
      {
        move[1] ? (
          <div className={`${getMoveColor(evaluation[1].moveType)} flex items-center font-semibold w-[74px] mr-[20px]`} onClick={() => handleMoveClick(move[1])}>
            {getMoveSymbol(evaluation[1].moveType)}
            <div className={`w-[49px] rounded-[3px] p-1 ${position.key === `${index}-${move[1].san}` ? "bg-[#5A5A57]" : ""}`}>
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