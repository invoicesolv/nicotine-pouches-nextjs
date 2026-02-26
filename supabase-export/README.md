# Supabase project export – Nicotine Pouches

Exported via Supabase MCP on **2026-02-01**.

## Project

- **Name:** Nicotine Pouches  
- **Project ID:** `vyolbmzuezpoqtdgongz`  
- **Region:** eu-north-1  
- **Database:** Postgres 17 (host: `db.vyolbmzuezpoqtdgongz.supabase.co`)

See `project.json` for full project metadata.

## Contents

| File / folder | Description |
|---------------|-------------|
| `project.json` | Project info (id, region, database host, etc.) |
| `migrations.json` | List of applied migration versions and names (65 migrations) |
| `tables.json` | Table metadata from `list_tables` (public, auth, storage schemas) |
| `database.types.ts` | Generated TypeScript types for the database |
| `extensions-installed.json` | Installed Postgres extensions (e.g. pg_trgm, pgcrypto, uuid-ossp) |
| `edge-functions/` | Edge functions (none in this project) |

## Migrations

Migration **names** and **versions** are in `migrations.json`. The actual SQL lives in this repo under **`../sql-migrations/`** (same migration filenames). Use that folder for schema history and re-applying elsewhere.

## Edge functions

This project has **no Edge Functions**; the folder is a placeholder.

## Restoring / cloning

- Use `project.json` for project reference and DB host.
- Use `database.types.ts` in your app for type-safe Supabase client.
- To recreate schema elsewhere: run the SQL files in `../sql-migrations/` in version order (or use Supabase CLI / Dashboard to link and push migrations).

## Source

Exported using **user-supabase** MCP tools: `list_projects`, `get_project`, `list_tables`, `list_migrations`, `list_edge_functions`, `list_extensions`, `generate_typescript_types`.
