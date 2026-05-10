import 'dotenv/config';

const queues = ['email', 'imports', 'reports', 'search-indexing'];

console.log(
  JSON.stringify(
    {
      service: 'sleb-worker',
      status: 'booted',
      queues,
      note: 'Queue processors will be attached once Valkey is available.'
    },
    null,
    2
  )
);

const shutdown = (signal: NodeJS.Signals) => {
  console.log(
    JSON.stringify({
      service: 'sleb-worker',
      status: 'stopping',
      signal
    })
  );
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

setInterval(() => undefined, 60_000);
