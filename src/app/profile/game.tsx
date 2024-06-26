'use client'

import { DateTime } from "luxon"
import localFont from "next/font/local"
import { getLichessUrl } from "./actions"

const chessFont = localFont({ src: "../../../public/chessglyph-v3.ff9d64d4.woff2" })

const drawCodes = ['agreed', 'repetition', 'stalemate', 'insufficient', '50move']

function getResultIcon(result: string) {
  return (
    <div className="flex items-center justify-center">
      <div className={`${chessFont.className} ${result === "win" ? "text-[#81B64C]" : drawCodes.includes(result) ? "text-[#A0A09E]" : "text-[#FA412D]"} text-xl`}>
        {result === "win" ? "\u1F01" : result === "agreed" ? "\u1F03" : "\u1F02"}
      </div>
    </div>
  )
}

export default function Game({ game: { game, profileData } }: { game: { game: any, profileData: any } }) {
  const pgnData = game.pgn.split("\n")
  const date = DateTime.fromFormat(pgnData[11].split('"')[1], "yyyy.MM.dd").setLocale("en-GB").toFormat("d MMM yyyy")
  const totalMoves = Math.ceil([...pgnData[22].matchAll(/{/g)].length / 2)
  const result = game.white.username.toLowerCase() === profileData.username ? game.white.result : game.black.result
  return (
    <div
      key={`game-${game.url}]}`}
      className="flex h-[4.5rem] items-center w-full my-[0.075rem] first:mt-0 text-sm bg-secondary p-1 hover:bg-secondary-dark"
      onClick={async (e) => {
        // const url = await getLichessUrl(game.pgn)
        // params = {username}-{gameId}-{gameDate}
        const params = btoa(`${profileData.username}-${game.url.split("/")[5]}-${game.pgn.split("\n")[2].split('"')[1]}`)
        const url = `/analysis?game=${params}`
        window.open(url, "_blank")
      }}
    >
      <div className="w-[12.5%]"></div>
      <div className="w-[40%] mx-1">
        <div className="flex">
          <div className="text-gray-light font-semibold truncate">{game.white.username}</div>
          <div className="text-gray-light mx-1">{`(${game.white.rating})`}</div>
        </div>
        <div className="flex">
          <div className="text-gray-light font-semibold truncate">{game.black.username}</div>
          <div className="text-gray-light mx-1">{`(${game.black.rating})`}</div>
        </div>
      </div>
      <div className="flex w-[12.5%] mx-1">
        <div className="w-6">
          <div className="text-gray font-semibold">{game.white.result === "win" ? "1" : drawCodes.includes(game.white.result) ? "½" : "0"}</div>
          <div className="text-gray font-semibold">{game.black.result === "win" ? "1" : drawCodes.includes(game.black.result) ? "½" : "0"}</div>
        </div>
        {getResultIcon(result)}
      </div>
      <div className="text-white-light w-[12.5%] text-center mx-1">{totalMoves}</div>
      <div className="text-white-light w-[12.5%] text-center mx-1">{date}</div>
    </div>
  )
}