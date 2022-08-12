// @ts-check
const WebSocket = require('ws');

(async () => {
  const electron = require('child_process').spawn('node_modules/.bin/electron', ['--remote-debugging-port=9222', 'main.js']);
  electron.stdout.pipe(process.stdout);
  process.on('exit', () => electron.kill('SIGTERM'))

  const wsEndpoint = await new Promise(resolve => {
    electron.stderr.on('data', data => {
      console.log(data.toString());
      const match = /^DevTools listening on (.*)$/.exec(data.toString().trim());
      if (match) {
        resolve(match[1]);
      }
    });
  })
  console.log("wsEndpoint: " + wsEndpoint)

  const ws = new WebSocket(wsEndpoint);
  await new Promise(resolve => ws.once('open', resolve));
  console.log('connected!');

  ws.on('message', msg => console.log(msg.toString()));

  console.log('Sending Target.setDiscoverTargets');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Target.setAutoAttach',
    params: {
      autoAttach: true,
      waitForDebuggerOnStart: true,
      flatten: true
    }
  }));
})();