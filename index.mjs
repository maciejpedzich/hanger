import { createServer } from 'node:http';
import { setTimeout } from 'node:timers';

const msg = 'Relax, take it easy! For there is nothing that we can do.';
const minDelay = 3000;
const maxDelay = 5000;
const delayDiff = maxDelay - minDelay;
const randomDelay = () => Math.floor(Math.random() * delayDiff + minDelay);

const server = createServer((req, res) => {
  const connOpenDate = new Date();
  const dateText = connOpenDate.toLocaleString('pl');
  const scannerIP = req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];
  const host = req.headers['x-forwarded-host'];
  const endpoint = `${req.method} ${req.url}`;

  console.log(
    `[${dateText}] ${scannerIP} (${userAgent}) targeted ${host} on ${endpoint}`
  );

  let charIdx = 0;
  
  const hang = () => {
    if (res.closed) return;
    else if (charIdx === msg.length) res.end('\n');
    else res.write(msg[charIdx++]);

    setTimeout(hang, randomDelay());
  };

  hang();

  res.once('close', () => {
    const connCloseDate = new Date();
    const timeDiff = connCloseDate.getTime() - connOpenDate.getTime();
    const dateText = connCloseDate.toLocaleString('pl');
    const diffText = new Date(timeDiff).toISOString().substring(14, 19);

    const hangResult =
      charIdx === msg.length ? 'received the message' : 'aborted connection';

    console.log(`[${dateText}] ${scannerIP} ${hangResult} after ${diffText}`);
  });
});

server.listen(3000);

process.on('SIGTERM', () => {
  server.close();
});
