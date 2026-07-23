module.exports = {
  apps: [
    {
      name: 'grekam-os-api',
      script: 'dist/app.js',
      cwd: '/root/grekam-os/apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'grekam-os-web',
      script: '/root/grekam-os/apps/web/.next/standalone/apps/web/server.js',
      cwd: '/root/grekam-os/apps/web/.next/standalone/apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
    {
      name: 'grecakam-os-academy',
      script: '/root/grekam-os/apps/academy-web/.next/standalone/apps/academy-web/server.js',
      cwd: '/root/grekam-os/apps/academy-web/.next/standalone/apps/academy-web',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        HOSTNAME: '0.0.0.0',
        AUTH_SECRET: 'grekam-os-super-secret-key-2026',
        AUTH_TRUST_HOST: 'true',
        AUTH_URL: 'https://academy.grekam.in',
        NEXTAUTH_SECRET: 'grekam-os-super-secret-key-2026',
        NEXTAUTH_URL: 'https://academy.grekam.in',
        DATABASE_URL: 'postgresql://postgres:Photoshop09%40@localhost:5432/grekam_os?schema=public',
      },
    },
  ],
};
