/**
 * Free port 5000 by killing the process using it
 * Cross-platform solution using Node.js
 */

const { exec } = require('child_process');
const os = require('os');
const platform = os.platform();

console.log('Checking for processes using port 5000...\n');

if (platform === 'win32') {
  // Windows
  exec('netstat -ano | findstr :5000 | findstr LISTENING', (error, stdout, stderr) => {
    if (error || !stdout.trim()) {
      console.log('✅ No processes found using port 5000');
      return;
    }

    const lines = stdout.trim().split('\n');
    const pids = new Set();

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log('✅ No processes found using port 5000');
      return;
    }

    console.log(`Found ${pids.size} process(es) using port 5000:`);
    pids.forEach(pid => {
      console.log(`  - PID: ${pid}`);
    });

    pids.forEach(pid => {
      exec(`taskkill /F /PID ${pid}`, (killError) => {
        if (killError) {
          console.error(`❌ Failed to kill process ${pid}. You may need to run as administrator.`);
        } else {
          console.log(`✅ Successfully killed process ${pid}`);
        }
      });
    });
  });
} else {
  // Linux/Mac
  exec("lsof -ti:5000", (error, stdout, stderr) => {
    if (error || !stdout.trim()) {
      console.log('✅ No processes found using port 5000');
      return;
    }

    const pids = stdout.trim().split('\n').filter(Boolean);
    console.log(`Found ${pids.length} process(es) using port 5000:`);
    pids.forEach(pid => console.log(`  - PID: ${pid}`));

    pids.forEach(pid => {
      exec(`kill -9 ${pid}`, (killError) => {
        if (killError) {
          console.error(`❌ Failed to kill process ${pid}. You may need to run with sudo.`);
        } else {
          console.log(`✅ Successfully killed process ${pid}`);
        }
      });
    });
  });
}

