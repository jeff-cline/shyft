# WordPress Deployment Guide — shyftmastery.com/blog

Self-hosted WordPress at `/blog` with the custom `shyft` theme. Pulls logo and brand-Y color live from the Next.js admin Settings via `/api/brand`.

## What's in the repo

- `wp-theme/shyft/` — the brand-matched WordPress theme
- `scripts/install-wordpress.sh` — idempotent installer (safe to re-run)
- `src/app/api/brand/route.ts` — JSON endpoint the theme calls

## One-time server prep (Hermes)

If not already installed on the VPS:

```bash
# Debian/Ubuntu — adjust for the actual distro
apt-get update
apt-get install -y \
  php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring \
  php8.2-xml php8.2-zip php8.2-intl \
  mariadb-server \
  rsync

# wp-cli
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp
```

## Create the database

```bash
mysql -uroot <<SQL
CREATE DATABASE IF NOT EXISTS shyft_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'shyft_blog'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON shyft_blog.* TO 'shyft_blog'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## Run the installer

From the repo root on the server (where the Next.js project also lives):

```bash
sudo WP_DB_PASSWORD="REPLACE_WITH_STRONG_PASSWORD" \
     bash scripts/install-wordpress.sh
```

The script will:
1. Download WordPress core into `/var/www/blog` (skips if already there)
2. Create `wp-config.php` with `WP_HOME` / `WP_SITEURL` set to `https://shyftmastery.com/blog`
3. Run `wp core install` if the DB is empty (uses jeff.cline as the bootstrap admin)
4. Copy the `wp-theme/shyft/` theme files into `wp-content/themes/shyft`
5. Activate the `shyft` theme
6. Ensure both admins exist (creates them only if missing — never overwrites existing passwords):
   - `jeff.cline` · jeff.cline@me.com · password `TEMP!234` (change after first login)
   - `krystalore` · krystalore@crewsbeyondlimitsconsulting.com · password `TEMP!234` (change after first login)
7. Set permalinks to `/%postname%/`
8. Set sane defaults (timezone, comments off, pingbacks off)
9. `chown -R www-data:www-data /var/www/blog`

The script is idempotent — safe to re-run after pulling new code to refresh the theme files.

## Nginx routing snippet

Add inside the existing `server { ... }` block for `shyftmastery.com` (and the `www.shyftmastery.com` variant if you have one):

```nginx
# WordPress at /blog
location ^~ /blog {
    alias /var/www/blog;
    index index.php index.html;
    try_files $uri $uri/ /blog/index.php?$args;

    location ~ /blog/.*\.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_split_path_info ^(/blog)(/.*)$;
        fastcgi_param SCRIPT_FILENAME /var/www/blog/$fastcgi_script_name;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
    }
}
```

The `^~` prefix on the outer location ensures `/blog/*` requests stop at WordPress before hitting the Next.js proxy. Everything outside `/blog` continues to the Next.js app on its existing port.

Reload Nginx:
```bash
nginx -t && systemctl reload nginx
```

## Verify

```bash
curl -I https://shyftmastery.com/blog/         # HTTP 200, served by Nginx → PHP-FPM
curl -I https://shyftmastery.com/blog/wp-admin # HTTP 200/302
```

Then log in at `https://shyftmastery.com/blog/wp-admin` as `jeff.cline` with password `TEMP!234`.

**First thing both admins should do**: WP admin → Users → Profile → Set a new password.

## Brand sync

The theme calls `https://shyftmastery.com/api/brand` on every front-end request, cached for 5 minutes via WP transients. The endpoint returns:

```json
{ "logo_url": "...", "brand_y_hex": "#D2691E" }
```

When Krystalore updates the logo URL or brand-Y hex in the Next.js admin Settings panel, WordPress picks up the change within 5 minutes. To force an immediate refresh while logged in as a WP admin, visit:

```
https://shyftmastery.com/blog/?clear_brand_cache=1
```

## Updating the theme

After pulling new commits from `main`, re-run the installer — it will rsync the latest theme files into place. No DB changes; no need to re-activate.

```bash
cd <repo dir>
git pull origin main
sudo WP_DB_PASSWORD="..." bash scripts/install-wordpress.sh
```

## File-system layout summary

```
/var/www/blog                       ← WordPress install
  ├── wp-config.php
  ├── wp-content/themes/shyft/      ← managed by the installer
  └── wp-content/uploads/           ← media uploads

/path/to/shyft-repo                 ← Next.js app
  ├── wp-theme/shyft/               ← source of truth for the theme
  └── scripts/install-wordpress.sh  ← run this
```

## Troubleshooting

- **404 on /blog**: Nginx location block not in place; check `nginx -t`.
- **502 on /blog**: PHP-FPM socket mismatch; check `unix:/run/php/php8.2-fpm.sock` is right.
- **White screen**: PHP errors. Check `/var/www/blog/wp-content/debug.log` after enabling `WP_DEBUG_LOG`.
- **Brand not syncing**: visit `/?clear_brand_cache=1` as admin; verify `https://shyftmastery.com/api/brand` returns valid JSON.
- **Wrong site URL after install**: edit `wp-config.php` and adjust `WP_HOME` / `WP_SITEURL`, or use `wp option update home` and `wp option update siteurl`.
