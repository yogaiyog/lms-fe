// Dipakai di VPS untuk menjalankan hasil build `output: "standalone"`.
module.exports = {
  apps: [
    {
      name: "lms-frontend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "450M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
