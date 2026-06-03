// Stateful SSH automation. Reads password from VPS_PASSWORD env, key from VPS_KEY env.
// Usage:
//   set VPS_PASSWORD=... && node .vps_automate.cjs pwd "<bash here>"
//   set VPS_KEY=C:\path\to\key && node .vps_automate.cjs key "<bash here>"

const { Client } = require('ssh2');
const fs = require('fs');

const HOST = process.env.VPS_HOST;
const USER = process.env.VPS_USER || 'root';
const PORT = parseInt(process.env.VPS_PORT || '22', 10);
const MODE = process.argv[2];
const CMD  = process.argv[3];

if (!MODE || !CMD) { console.error('Usage: node .vps_automate.cjs <pwd|key> "<bash>"'); process.exit(1); }
if (!HOST) { console.error('VPS_HOST env not set'); process.exit(1); }

let auth;
if (MODE === 'pwd') {
  if (!process.env.VPS_PASSWORD) { console.error('VPS_PASSWORD env not set'); process.exit(1); }
  auth = { password: process.env.VPS_PASSWORD };
} else if (MODE === 'key') {
  if (!process.env.VPS_KEY) { console.error('VPS_KEY env not set'); process.exit(1); }
  try { auth = { privateKey: fs.readFileSync(process.env.VPS_KEY), passphrase: process.env.VPS_KEY_PASSPHRASE }; }
  catch (e) { console.error(`Cannot read key: ${e.message}`); process.exit(1); }
} else { console.error('mode must be pwd or key'); process.exit(1); }

const c = new Client();
c.on('ready', () => {
  c.exec(CMD, { pty: false }, (err, stream) => {
    if (err) { console.error('exec err:', err.message); c.end(); process.exit(2); }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', (code) => { c.end(); process.exit(code || 0); });
    if (!process.stdin.isTTY) {
      process.stdin.pipe(stream.stdin);
      process.stdin.on('end', () => stream.stdin.end());
    } else {
      stream.stdin.end();
    }
  });
}).on('error', (e) => { console.error('connect failed:', e.message); process.exit(3); })
  .connect({ host: HOST, port: PORT, username: USER, ...auth, readyTimeout: 25000, keepaliveInterval: 10000 });
