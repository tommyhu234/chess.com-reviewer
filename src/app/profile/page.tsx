import { DateTime } from 'luxon'
import localFont from 'next/font/local'

const chessFont = localFont({ src: '../../../public/chessglyph-v3.ff9d64d4.woff2' })

async function getProfile(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch profile data for user ${username}`)
  }

  return response.json()
}

async function getGames(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}/games/archives`)

  if (!response.ok) {
    throw new Error(`Failed to fetch games data for user ${username}`)
  }

  return response.json()
}

async function getAPIData(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }

  return response.json()
}

function getResultIcon(result: string) {
  return (
    <div className="flex items-center justify-center">
      <div className={`${chessFont.className} ${result === 'win' ? 'text-[#81B64C]' : result === 'agreed' ? 'text-[#A0A09E]' : 'text-[#FA412D]'} text-xl`}>
        {result === 'win' ? '\u1F01' : result === 'agreed' ? '\u1F03' : '\u1F02'}
      </div>
    </div>
  )
}

export default async function Profile({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const profileData = await getProfile(searchParams.username as string)
  const gamesData = await getGames(searchParams.username as string)
  const lastMonthGames = (await getAPIData(gamesData.archives[gamesData.archives.length - 1])).games.reverse().splice(0, 10)
  return (
    <main className="flex h-screen flex-col items-center p-24">
      <div>
        <img src={profileData.avatar} className="rounded w-32 h-32 object-cover" />
      </div>
      <div className="mt-4 w-[40%]">
        <div className="flex h-10 items-center text-xs text-[#9E9E9C] font-semibold bg-[#2E2D2B]">
          <div className="w-[12.5%]"></div>
          <div className="w-[40%]">Players</div>
          <div className="w-[7.5%]">Result</div>
          <div className="w-[20%] text-center">Moves</div>
          <div className="w-[12%] text-end">Date</div>
        </div>
        <div>
          {lastMonthGames.map((game: any) => {
            const pgnData = game.pgn.split('\n')
            const date = DateTime.fromFormat(pgnData[11].split('"')[1], 'yyyy.MM.dd').setLocale('en-GB').toFormat('d MMM yyyy')
            const totalMoves = [...pgnData[22].matchAll(/{/g)].length
            const result = game.white.username.toLowerCase() === profileData.username ? game.white.result : game.black.result
            return (
              <div key={`game-${game.url}]}`} className="flex h-[4.5rem] items-center w-full my-[0.075rem] first:mt-0 text-sm bg-[#41403D] p-1 hover:bg-[#2E2D2B]">
                <div className="w-[12.5%]"></div>
                <div className="w-[40%]">
                  <div className="flex">
                    <div className="text-[#CACAC9] font-semibold">{game.white.username}</div>
                    <div className="text-[#CACAC9] mx-2">{`(${game.white.rating})`}</div>
                  </div>
                  <div className="flex">
                    <div className="text-[#CACAC9] font-semibold">{game.black.username}</div>
                    <div className="text-[#CACAC9] mx-2">{`(${game.black.rating})`}</div>
                  </div>
                </div>
                <div className="flex w-[7.5%]">
                  <div className="w-1/2">
                    <div className="text-[#9E9E9C] font-semibold">{game.white.result === 'win' ? '1' : game.white.result === 'agreed' ? '½' : '0'}</div>
                    <div className="text-[#9E9E9C] font-semibold">{game.black.result === 'win' ? '1' : game.black.result === 'agreed' ? '½' : '0'}</div>
                  </div>
                  {getResultIcon(result)}
                </div>
                <div className="text-[#E2E2E1] w-[20%] text-center">{totalMoves}</div>
                <div className="text-[#E2E2E1]">{date}</div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
}