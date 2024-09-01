This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project retrieves your chess games from Chess.com and reviews the games using the Stockfish chess engine.

## Getting Started

First install the node modules:

```bash
npm install
```

Also install a version of Stockfish compatible with your OS from the following site: https://stockfishchess.org/download/

After installing the Stockfish executable put it in repository and add the path to the .env.local file as STOCKFISH_PATH.

Run the dev version or build the project:

```bash
npm run dev
```

```bash
npm run build-local
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the site where you can fill in your chess.com username and review your games.

The performance of Stockfish could be slow depending on your hardware. Consider lowering the depth to increase performance in the src\app\analysis\api\route.ts file.

## Deploy on Vercel

Deployment on Vercel is possible but due to the poor performance of Stockfish on the deployment, it would be better to run it locally.
