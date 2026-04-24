module.exports = {
  apps: [
    {
      name: 'narevo-api',
      script: 'dist/index.js',
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'narevo-worker',
      script: 'dist/worker.js',
      cwd: __dirname,
      env: { NODE_ENV: 'production' },
    },
  ],
};
