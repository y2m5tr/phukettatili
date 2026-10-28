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

const fs = require('fs');
const path = require('path');

function loadEnvFile(envPath) {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envVars = loadEnvFile(path.join(__dirname, '.env'));

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
        ...envVars,
      },
    },
  ],
};
