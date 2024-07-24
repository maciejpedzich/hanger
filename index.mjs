import { createServer } from 'node:http';
import { clearInterval, setInterval } from 'node:timers';

const server = createServer((req, res) => {
  console.log(
    `Caught ${req.headers['x-forwarded-for']} on ${req.method} ${req.url}`
  );

  let msg = ':) you are an idiot hahahahaha :)';
  let charIdx = 0;
  let intervalId = setInterval(() => {
    if (charIdx === msg.length) {
      charIdx = 0;
      res.write('\n');
    } else {
      res.write(msg[charIdx++]);
    }
  }, 3000);

  res.once('close', () => clearInterval(intervalId));
});

server.listen(3000);
