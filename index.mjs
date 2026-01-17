import { createServer } from 'node:http';
import { setTimeout } from 'node:timers';

const msg = 'Relax, take it easy! For there is nothing that we can do.';
const minDelayMs = 3000;
const maxDelayMs = 6000;
const delayDiff = maxDelayMs - minDelayMs;
const randomDelay = () => Math.floor(Math.random() * delayDiff + minDelayMs);
const ipNextReportDateMap = new Map();

const server = createServer((req, res) => {
  const connOpenDate = new Date();
  const endpoint = `${req.method} ${req.url}`;

  if (endpoint === 'GET /health') {
    res.statusCode = 200;
    return res.end('OK\n');
  }

  const ip = req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];
  const host = req.headers['x-forwarded-host'];

  console.log(
    `${ip} (${userAgent}) targeted ${host} on ${endpoint}`
  );

  let charIdx = 0;
  
  const hang = () => {
    if (res.closed) return;
    else if (charIdx === msg.length) res.end('\n');
    else res.write(msg[charIdx++]);

    setTimeout(hang, randomDelay());
  };

  hang();

  res.once('close', async () => {
    const connCloseDate = new Date();
    const diffText = new Date(connCloseDate - connOpenDate)
      .toISOString()
      .substring(14, 19);

    const nextIpReportDate = ipNextReportDateMap.get(ip) || connCloseDate;
    const hangResult =
      charIdx === msg.length ? 'received the message' : 'aborted connection';

    console.log(`${ip} ${hangResult} after ${diffText}`);

    if (connCloseDate < nextIpReportDate) return;

    const queryParams = new URLSearchParams();

    queryParams.append('ip', ip);
    queryParams.append('categories', '15,21');
    queryParams.append('timestamp', connOpenDate.toISOString());
    queryParams.append(
      'comment',
      `Vulnerability scanner detected!\nUser-Agent: ${userAgent}\nEndpoint: ${endpoint}`
    );

    const abuseIpDbRes = await fetch(
      `https://api.abuseipdb.com/api/v2/report?${queryParams.toString()}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Key': process.env.ABUSEIPDB_API_KEY,
        }
      }
    );

    if (abuseIpDbRes.ok) {
      const reportDate = new Date();

      console.log(`${ip} has been reported!`);
      ipNextReportDateMap.set(
        ip,
        new Date(
          reportDate.getFullYear(),
          reportDate.getMonth(),
          reportDate.getDate() + 1,
          reportDate.getHours(),
          reportDate.getMinutes(),
          reportDate.getSeconds()
        )
      );
    } else {
      console.error(
        `Failed to report ${ip}: ${abuseIpDbRes.status} ${abuseIpDbRes.statusText}`
      );
    }
  });
});

server.listen(3000);

process.on('SIGTERM', () => server.close());
