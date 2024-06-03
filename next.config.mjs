/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/analysis/api': ['./stockfish-ubuntu-x86-64/stockfish/src/stockfish']
    }
  }
}
export default nextConfig
