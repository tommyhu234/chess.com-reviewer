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

export default async function Profile({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const profileData = await getProfile(searchParams.username as string)
  const gamesData = await getGames(searchParams.username as string)
  const lastMonthGames = (await getAPIData(gamesData.archives[gamesData.archives.length - 1])).games.reverse().splice(0, 10)
  console.log(lastMonthGames[0])
  return (
    <main className="flex h-screen flex-col items-center p-24">
      <div>
        <img src={"https://images.chesscomfiles.com/uploads/v1/user/101115842.d0290ee1.200x200o.d66b0881fef1.jpg"} className="rounded w-32 h-32 object-cover" />
      </div>
      <div className="mt-4 w-[40%]">
        {lastMonthGames.map((game: any) => {
          return (
            <div key={`game-${game.url}]}`} className="flex h-[4.5rem] items-center text-sm w-full my-0.5 bg-[#41403D] p-1">
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
              <div className="flex w-[5.5%]">
                <div className="w-1/2">
                  <div className="text-[#878684] font-semibold">{game.white.result === 'win' ? '1' : game.white.result === 'agreed' ? '½' : '0'}</div>
                  <div className="text-[#878684] font-semibold">{game.black.result === 'win' ? '1' : game.black.result === 'agreed' ? '½' : '0'}</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative rounded-sm w-3 h-3 bg-[#FA412D]">
                    <div className="absolute -top-[0.7rem] text-2xl left-[0.015rem] text-[#41403D]">-</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  );
}