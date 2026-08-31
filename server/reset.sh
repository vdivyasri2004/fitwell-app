#!/usr/bin/env bash
# Reset the FitWell SQLite DB to a clean state (only the demo admin), reseed,
# and verify. Run from /fitwell/server. The server does not need to be running;
# the seed script creates the DB.
set -e

cd "$(dirname "$0")"

echo "== stopping any running fitwell server =="
pkill -9 -f "node src/index.js" 2>/dev/null || true
sleep 1

echo "== removing old database files =="
rm -f data/fitwell.db data/fitwell.db-shm data/fitwell.db-wal

echo "== seeding a fresh database =="
node src/seed.js

echo "== verifying =="
node -e "
import('/fitwell/server/src/db.js').then(({ db }) => {
  const c = (t) => db.prepare('select count(*) c from ' + t).get().c;
  console.log('users      =', c('users'), '(expect 1: the demo admin)');
  console.log('foods      =', c('food_items'));
  console.log('exercises  =', c('exercises'));
  console.log('workouts   =', c('workouts'));
  console.log('food_logs  =', c('food_logs'), '(expect 0)');
  console.log('logins     =', JSON.stringify(db.prepare('select email, role from users').all()));
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });
"
echo "== done =="
