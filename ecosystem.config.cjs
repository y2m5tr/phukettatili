/**
 * ecosystem.config.cjs — PM2 Proses Yöneticisi Konfigürasyonu
 *
 * Ubuntu VPS üzerinde Node.js uygulamasının 7/24 kesintisiz çalışmasını,
 * sunucu yeniden başladığında otomatik açılmasını (systemd) ve çökme anında
 * anında yeniden başlatılmasını sağlar.
 *
 * Komutlar:
 *   pm2 start ecosystem.config.cjs
 *   pm2 reload phukettatili --update-env
 *   pm2 logs phukettatili
 *   pm2 status
 */

module.exports = {
  apps: [
    {
      name: 'phukettatili',
      script: './dist/server/entry.mjs',
      cwd: '/var/www/phukettatili',
      instances: 2, // 2 GB RAM için güvenli başlangıç; load izlendikten sonra artırılabilir
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M', // Bellek sızıntısına karşı koruma
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        HOST: '127.0.0.1',
      },
    },
  ],
};
