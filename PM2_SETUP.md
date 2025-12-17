# Настройка PM2 для фронтенда

## Проблема
Процесс `front` постоянно перезапускается из-за нехватки памяти (OOM - Out Of Memory).

## Решение

### 1. Создайте папку для логов
```bash
mkdir -p logs
```

### 2. Остановите текущий процесс PM2
```bash
pm2 stop front
pm2 delete front
```

### 3. Запустите с новой конфигурацией
```bash
pm2 start ecosystem.config.js
```

Или если хотите запустить только front:
```bash
pm2 start ecosystem.config.js --only front
```

### 4. Сохраните конфигурацию PM2
```bash
pm2 save
pm2 startup
```

## Настройки в ecosystem.config.js

- **max_memory_restart: '512M'** - автоматический перезапуск при превышении 512MB памяти
- **max_restarts: 10** - максимум 10 перезапусков
- **min_uptime: '10s'** - минимальное время работы между перезапусками
- **restart_delay: 4000** - задержка 4 секунды между перезапусками
- **node_args: '--max-old-space-size=512'** - ограничение памяти Node.js до 512MB

## Мониторинг

Проверка статуса:
```bash
pm2 status
```

Просмотр логов:
```bash
pm2 logs front
```

Мониторинг памяти:
```bash
pm2 monit
```

## Если проблема сохраняется

1. Проверьте логи на ошибки:
```bash
pm2 logs front --lines 100
```

2. Уменьшите лимит памяти в `ecosystem.config.js`:
```javascript
max_memory_restart: '256M',
node_args: '--max-old-space-size=256',
```

3. Проверьте, нет ли утечек памяти в коде (бесконечные циклы, неочищенные таймеры и т.д.)

4. Увеличьте ресурсы сервера или оптимизируйте приложение

