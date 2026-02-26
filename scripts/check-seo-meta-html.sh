#!/usr/bin/env bash
# Curl a URL and verify SEO meta tags appear in the HTML <head>.
# Usage: ./scripts/check-seo-meta-html.sh [URL]
# Example: ./scripts/check-seo-meta-html.sh https://nicotine-pouches.org/

set -e
URL="${1:-https://nicotine-pouches.org/}"
echo "Fetching: $URL"
HTML=$(curl -sS -L "$URL")
CODE=$(curl -sS -o /dev/null -w '%{http_code}' -L "$URL")
echo "HTTP: $CODE"
echo ""

# Extract head section (first occurrence of <head> to </head>)
HEAD=$(echo "$HTML" | sed -n '/<head>/,/<\/head>/p')

check() {
  if echo "$HEAD" | grep -qi "$1"; then
    echo "  OK: $2"
  else
    echo "  MISSING: $2"
  fi
}

echo "=== SEO meta in <head> ==="
check '<title>' 'title'
check 'name="description"' 'meta description'
check 'name="keywords"' 'meta keywords'
check 'name="robots"' 'meta robots'
check 'name="author"' 'meta author'
check 'name="publisher"' 'meta publisher'
check 'rel="canonical"' 'canonical link'
check 'property="og:title"' 'og:title'
check 'property="og:description"' 'og:description'
check 'property="og:url"' 'og:url'
check 'property="og:image"' 'og:image'
check 'property="og:type"' 'og:type'
check 'name="twitter:card"' 'twitter:card'
check 'name="twitter:title"' 'twitter:title'
check 'name="twitter:description"' 'twitter:description'
check 'name="twitter:image"' 'twitter:image'
check 'application/ld+json' 'JSON-LD script'

echo ""
echo "Sample from head (first 2000 chars):"
echo "$HEAD" | head -c 2000
echo "..."
