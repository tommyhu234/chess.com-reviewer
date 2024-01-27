import Game from './game'

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Chess.com Analyzer'
}

async function getProfile(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}`, {
    headers: headers
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch profile data for user ${username}`)
  }

  return response.json()
}

async function getGames(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}/games/archives`, {
    headers: headers
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch games data for user ${username}`)
  }

  return response.json()
}

async function getAPIData(url: string) {
  const response = await fetch(url, {
    headers: headers
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }

  return response.json()
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
            return <Game key={game.url} game={{ game, profileData }} />
          })}
        </div>
      </div>
    </main>
  );
}