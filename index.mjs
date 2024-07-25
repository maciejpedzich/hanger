import { createServer } from 'node:http';
import { clearInterval, setInterval } from 'node:timers';

const msg = ':) you are an idiot hahahahaha :)';

const server = createServer((req, res) => {
  const connOpenDate = new Date();
  const dateLogText = connOpenDate.toLocaleString('pl');
  const attacker = req.headers['x-forwarded-for'];
  const host = req.headers['x-forwarded-host'];

  console.log(
    `[${dateLogText}] ${attacker} targeted ${host} on ${req.method} ${req.url}`
  );

  let charIdx = 0;

  const intervalId = setInterval(() => {
    if (charIdx === msg.length) {
      charIdx = 0;
      res.write('\n');
    } else {
      res.write(msg[charIdx++]);
    }
  }, 3000);

  res.once('close', () => {
    const connCloseDate = new Date();
    const timeDiff = connCloseDate.getTime() - connOpenDate.getTime();
    const dateLogText = connCloseDate.toLocaleString('pl');
    const diffText = new Date(timeDiff).toISOString().substring(11, 19);

    clearInterval(intervalId);
    console.log(
      `[${dateLogText}] ${attacker} aborted connection after ${diffText}`
    );
  });
});

server.listen(3000);
