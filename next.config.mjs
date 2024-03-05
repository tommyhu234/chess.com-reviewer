/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/analysis/api': [
        './stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe',
        './stockfish-ubuntu-x86-64/stockfish/src/stockfish',
      ]
    }
  }
}
export default nextConfig
