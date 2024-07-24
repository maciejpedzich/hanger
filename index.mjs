import { createServer } from 'node:http';
import { clearInterval, setInterval } from 'node:timers';

const server = createServer((req, res) => {
  const connOpenDate = new Date();
  const attacker = req.headers['x-forwarded-for'];
  const host = req.headers['X-Targeted-Host'];

  console.log(
    `[${connOpenDate.toLocaleString()}] ${attacker} targeted ${host} on ${
      req.method
    } ${req.url}`
  );

  const msg = ':) you are an idiot hahahahaha :)';
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
    const diffText = new Date(timeDiff).toISOString().substring(11, 19);

    clearInterval(intervalId);
    console.log(
      `[${connCloseDate.toLocaleString()}] ${attacker} aborted connection after ${diffText}`
    );
  });
});

server.listen(3000);
