#!/usr/bin/env bash
# FitWell service manager: start / stop / status for all services.
#   ./manage.sh start    - start all services
#   ./manage.sh stop     - stop all services
#   ./manage.sh status   - show what's running and which ports respond
#   ./manage.sh api|admin|mobile|static  - operate on a single service
#   ./manage.sh logs     - tail logs (Ctrl-C to exit)

set -u
ROOT="/fitwell"
LOGDIR="/tmp/fitwell-logs"
mkdir -p "$LOGDIR"

# --- service definitions -----------------------------------------------------
# name|label|port|cwd|cmd (cmd is run via setsid & disown)
service_api()     { echo "api|API (Express/SQLite)|4000|$ROOT/server|node src/index.js"; }
service_admin()   { echo "admin|Admin dashboard (Vite)|5173|$ROOT/admin|npx vite --port 5173 --strictPort"; }
service_mobile()  { echo "mobile|Mobile app (Expo dev web)|8081|$ROOT/mobile|npx expo start --web --port 8081"; }
service_static()  { echo "static|Mobile app (static export)|19006|$ROOT/mobile|npx serve -l 19006 dist"; }

all_services() { service_api; service_admin; service_mobile; service_static; }

# unique-ish match patterns used to identify + kill each service
pattern_for() {
  case "$1" in
    api)    echo "node src/index.js" ;;
    admin)  echo "vite --port 5173" ;;
    mobile) echo "expo start --web --port 8081" ;;
    static) echo "serve -l 19006 dist" ;;
  esac
}

start_one() {
  local name="$1" def pat log
  def="$("service_${name}")"
  pat="$(pattern_for "$name")"
  log="$LOGDIR/$name.log"
  # already running?
  if pgrep -f "$pat" >/dev/null 2>&1; then
    echo "[skip] $name already running"
    return 0
  fi
  local port cwd cmd
  port="$(echo "$def" | cut -d'|' -f3)"
  cwd="$(echo "$def" | cut -d'|' -f4)"
  cmd="$(echo "$def" | cut -d'|' -f5)"
  ( cd "$cwd" && setsid bash -c "$cmd > '$log' 2>&1 < /dev/null & disown" )
  echo "[start] $name -> http://localhost:$port  (log: $log)"
}

stop_one() {
  local name="$1" pat def
  def="$("service_${name}")"
  pat="$(pattern_for "$name")"
  if pgrep -f "$pat" >/dev/null 2>&1; then
    pkill -f "$pat" 2>/dev/null
    # give it a moment; force if needed
    sleep 1
    pkill -9 -f "$pat" 2>/dev/null
    echo "[stop] $name stopped"
  else
    echo "[stop] $name not running"
  fi
}

status_one() {
  local name="$1" def pat
  def="$("service_${name}")"
  pat="$(pattern_for "$name")"
  local port label col url
  label="$(echo "$def" | cut -d'|' -f2)"
  port="$(echo "$def" | cut -d'|' -f3)"
  url="http://localhost:$port/"
  if pgrep -f "$pat" >/dev/null 2>&1; then
    col="up  "
    code="$(curl -s -m 2 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo '-')"
    printf "  %-8s %-28s %s (http %s)\n" "$name" "$label" "$col" "$code"
  else
    col="DOWN"
    printf "  %-8s %-28s %s\n" "$name" "$label" "$col"
  fi
}

cmd="${1:-status}"
case "$cmd" in
  start)
    for name in api admin mobile static; do start_one "$name"; done
    echo "Started. Give each a few seconds, then run: ./manage.sh status"
    ;;
  stop)
    for name in static mobile admin api; do stop_one "$name"; done
    ;;
  restart)
    for name in static mobile admin api; do stop_one "$name"; done
    for name in api admin mobile static; do start_one "$name"; done
    ;;
  status)
    echo "FitWell services:"
    for name in api admin mobile static; do status_one "$name"; done
    echo "(ports: api=4000 admin=5173 mobile=8081 static=19006)"
    ;;
  logs)
    name="${2:-}"
    if [ -n "$name" ]; then
      tail -f "$LOGDIR/$name.log"
    else
      tail -f "$LOGDIR"/*.log
    fi
    ;;
  api|admin|mobile|static)
    sub="${2:-status}"
    case "$sub" in
      start)  start_one "$cmd" ;;
      stop)   stop_one  "$cmd" ;;
      status) status_one "$cmd" ;;
      *) echo "usage: ./manage.sh $cmd {start|stop|status}"; exit 1 ;;
    esac
    ;;
  *)
    echo "usage: ./manage.sh {start|stop|restart|status|logs|api|admin|mobile|static}"
    echo "  ./manage.sh <name> {start|stop|status}"
    exit 1
    ;;
esac
