import { createServer } from 'node:http';
import { setTimeout } from 'node:timers';

const msg = ':) you are an idiot hahahahaha :)';
const minDelay = 1000;
const maxDelay = 5000;
const delayDiff = maxDelay - minDelay;
const randomDelay = () => Math.floor(Math.random() * delayDiff + minDelay);

const server = createServer((req, res) => {
  const connOpenDate = new Date();
  const dateText = connOpenDate.toLocaleString('pl');
  const attacker = req.headers['x-forwarded-for'];
  const host = req.headers['x-forwarded-host'];
  const endpoint = `${req.method} ${req.url}`;
  let charIdx = 0;

  console.log(`[${dateText}] ${attacker} targeted ${host} on ${endpoint}`);

  const hang = () => {
    if (res.closed) return;

    if (charIdx === msg.length) {
      charIdx = 0;
      res.write('\n');
    } else {
      res.write(msg[charIdx++]);
    }

    setTimeout(hang, randomDelay());
  };

  hang();

  res.once('close', () => {
    const connCloseDate = new Date();
    const timeDiff = connCloseDate.getTime() - connOpenDate.getTime();
    const dateText = connCloseDate.toLocaleString('pl');
    const diffText = new Date(timeDiff).toISOString().substring(11, 19);

    console.log(
      `[${dateText}] ${attacker} aborted connection after ${diffText}`
    );
  });
});

server.listen(3000);
