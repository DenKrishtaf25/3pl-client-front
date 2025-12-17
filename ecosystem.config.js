module.exports = {
  apps: [
    {
      name: 'front',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      // Ограничение памяти - максимум 512MB, при превышении перезапуск
      max_memory_restart: '512M',
      // Автоматический перезапуск при ошибках
      autorestart: true,
      // Максимальное количество перезапусков за период
      max_restarts: 10,
      min_uptime: '10s',
      // Интервал между перезапусками
      restart_delay: 4000,
      // Логирование
      error_file: './logs/front-error.log',
      out_file: './logs/front-out.log',
      log_file: './logs/front-combined.log',
      time: true,
      // Переменные окружения
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Настройки для Next.js
      node_args: '--max-old-space-size=512',
      // Игнорировать watch файлы
      watch: false,
      // Убивать процесс при превышении памяти
      kill_timeout: 5000,
    },
  ],
};

