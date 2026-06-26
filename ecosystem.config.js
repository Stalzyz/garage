module.exports = {
  apps: [
    {
      name: 'grekam-os-api',
      script: 'npm',
      args: 'run start',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        // Add your production database URL and other env vars here
      },
    },
    {
      name: 'grekam-os-web',
      script: 'npm',
      args: 'run start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // The URL of the API you just started above
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
      },
    },
  ],
};
