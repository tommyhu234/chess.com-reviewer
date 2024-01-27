import Game from './game'

const { signal } = new AbortController()

async function getProfile(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}`, {
    signal: signal,
    cache: 'no-store',
    headers: {
      'User-Agent': 'Chess.com Analyzer'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch profile data for user ${username}`)
  }

  return response.json()
}

async function getGames(username: string) {
  const response = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}/games/archives`, {
    signal: signal,
    cache: 'no-store',
    headers: {
      'User-Agent': 'Chess.com Analyzer'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch games data for user ${username}`)
  }

  return response.json()
}

async function getAPIData(url: string) {
  const response = await fetch(url, {
    signal: signal,
    cache: 'no-store',
    headers: {
      'User-Agent': 'Chess.com Analyzer'
    }
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
    <main className="flex h-screen flex-col items-center py-24">
      <div>
        <img src={profileData.avatar} className="rounded w-32 h-32 object-cover" />
      </div>
      <div className="mt-4 min-w-[40%]">
        <div className="flex h-10 items-center text-xs text-[#9E9E9C] font-semibold bg-[#2E2D2B]">
          <div className="w-[12.5%]"></div>
          <div className="w-[40%] mx-1">Players</div>
          <div className="w-[12.5%] mx-1">Result</div>
          <div className="w-[12.5%] text-center mx-1">Moves</div>
          <div className="w-[12.5%] text-center mx-1">Date</div>
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