/** @type {import('next').NextConfig} */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  env: {
    PROJECT_ROOT: __dirname
  }
}
export default nextConfig
