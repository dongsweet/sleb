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
