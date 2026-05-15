#!/usr/bin/env bash
#
# shYft WordPress installer. Idempotent — safe to re-run.
#
# Requirements on the host (Hermes installs once):
#   - PHP-FPM 8.1+ with the standard WordPress extensions (mysqli, curl, gd, mbstring, xml, zip, intl)
#   - MariaDB 10.4+ or MySQL 8+
#   - wp-cli   (https://wp-cli.org)
#   - Nginx routing /blog/* to this install
#
# Env vars (set before running, or pass inline):
#   WP_DIR              Filesystem target (default /var/www/blog)
#   WP_DOMAIN           Public URL (default https://shyftmastery.com/blog)
#   WP_DB_NAME          MySQL database name (default shyft_blog)
#   WP_DB_USER          MySQL user (default shyft_blog)
#   WP_DB_PASSWORD      MySQL password (required)
#   WP_DB_HOST          MySQL host (default localhost)
#   WP_ADMIN_PASSWORD   Initial password for both admins (default TEMP!234)
#   WP_FILE_OWNER       chown target for files (default www-data:www-data)
#
# Run as root or a user that can write to WP_DIR and run wp-cli without
# permission errors. Add --allow-root if running as root.
#
# Usage:
#   sudo WP_DB_PASSWORD=foo bash scripts/install-wordpress.sh

set -euo pipefail

WP_DIR="${WP_DIR:-/var/www/blog}"
WP_DOMAIN="${WP_DOMAIN:-https://shyftmastery.com/blog}"
WP_DB_NAME="${WP_DB_NAME:-shyft_blog}"
WP_DB_USER="${WP_DB_USER:-shyft_blog}"
WP_DB_PASSWORD="${WP_DB_PASSWORD:?Set WP_DB_PASSWORD before running}"
WP_DB_HOST="${WP_DB_HOST:-localhost}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-TEMP!234}"
WP_FILE_OWNER="${WP_FILE_OWNER:-www-data:www-data}"

THEME_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/wp-theme/shyft"
WP_FLAG=""
if [ "$(id -u)" = "0" ]; then WP_FLAG="--allow-root"; fi

echo "==> shYft WordPress installer"
echo "    WP_DIR=$WP_DIR"
echo "    WP_DOMAIN=$WP_DOMAIN"
echo "    THEME_SRC=$THEME_SRC"
echo

if [ ! -d "$THEME_SRC" ]; then
  echo "ERROR: theme source not found at $THEME_SRC" >&2
  exit 1
fi

mkdir -p "$WP_DIR"
cd "$WP_DIR"

if [ ! -f "wp-load.php" ]; then
  echo "==> Downloading WordPress core"
  wp core download $WP_FLAG
fi

if [ ! -f "wp-config.php" ]; then
  echo "==> Creating wp-config.php"
  wp config create $WP_FLAG \
    --dbname="$WP_DB_NAME" \
    --dbuser="$WP_DB_USER" \
    --dbpass="$WP_DB_PASSWORD" \
    --dbhost="$WP_DB_HOST" \
    --extra-php <<'PHP'
define('WP_HOME', getenv_or('WP_HOME', 'https://shyftmastery.com/blog'));
define('WP_SITEURL', getenv_or('WP_SITEURL', 'https://shyftmastery.com/blog'));
define('FORCE_SSL_ADMIN', true);
define('DISALLOW_FILE_EDIT', true);
define('SHYFT_BRAND_API', 'https://shyftmastery.com/api/brand');
function getenv_or($key, $default) {
  $v = getenv($key);
  return $v !== false && $v !== '' ? $v : $default;
}
PHP
fi

if ! wp core is-installed $WP_FLAG 2>/dev/null; then
  echo "==> Installing WordPress core (one-time DB setup)"
  wp core install $WP_FLAG \
    --url="$WP_DOMAIN" \
    --title="shYft Blog" \
    --admin_user="jeff.cline" \
    --admin_password="$WP_ADMIN_PASSWORD" \
    --admin_email="jeff.cline@me.com" \
    --skip-email
fi

echo "==> Copying theme to wp-content/themes/shyft"
mkdir -p "$WP_DIR/wp-content/themes/shyft"
# rsync if available for cleaner deltas; fall back to cp
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$THEME_SRC/" "$WP_DIR/wp-content/themes/shyft/"
else
  rm -rf "$WP_DIR/wp-content/themes/shyft"
  cp -R "$THEME_SRC" "$WP_DIR/wp-content/themes/shyft"
fi

echo "==> Activating theme"
wp theme activate shyft $WP_FLAG

echo "==> Ensuring admin users exist"
ensure_user() {
  local login="$1" email="$2"
  if wp user get "$login" $WP_FLAG --field=ID >/dev/null 2>&1; then
    echo "    user '$login' already exists — leaving password untouched"
  else
    wp user create "$login" "$email" $WP_FLAG \
      --role=administrator \
      --user_pass="$WP_ADMIN_PASSWORD" \
      --send-email=false
    echo "    user '$login' created"
  fi
}
ensure_user "jeff.cline" "jeff.cline@me.com"
ensure_user "krystalore" "krystalore@crewsbeyondlimitsconsulting.com"

echo "==> Permalinks → /%postname%/"
wp rewrite structure '/%postname%/' $WP_FLAG
wp rewrite flush $WP_FLAG

echo "==> Setting reasonable defaults"
wp option update blogdescription "Field notes from the shYft Mastery program." $WP_FLAG
wp option update timezone_string "America/Chicago" $WP_FLAG
wp option update default_pingback_flag 0 $WP_FLAG
wp option update default_ping_status closed $WP_FLAG
wp option update default_comment_status closed $WP_FLAG

echo "==> Fixing file ownership ($WP_FILE_OWNER)"
chown -R "$WP_FILE_OWNER" "$WP_DIR" || echo "   (chown skipped — non-root run)"

echo
echo "✅ Done."
echo "   Admin URL:        $WP_DOMAIN/wp-admin"
echo "   Logins:           jeff.cline · krystalore"
echo "   Initial password: $WP_ADMIN_PASSWORD"
echo "   Both users will be prompted to change it after first login (in WP admin → Users → Profile)."
echo
echo "   Brand sync: theme fetches https://shyftmastery.com/api/brand every 5 min."
echo "   To force a refresh as admin, visit:  $WP_DOMAIN/?clear_brand_cache=1"
