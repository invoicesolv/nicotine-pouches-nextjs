# US vendor scrape → import gap

## CSV files exist (scrape ran)

| Vendor     | CSV path (scraperpouch)        | Rows (products + header) |
|-----------|---------------------------------|---------------------------|
| SnusDaddy | `SnusDaddy/scraped_results.csv` | 864 (~863 products)      |
| GotPouches| `GotPouches/scraped_results.csv`| 525 (~524 products)      |
| SnusDirect| `SnusDirect/scraped_results.csv`| 250 (~249 products)      |

So the scrape **did run** and wrote CSVs. Products are **not** missing from disk.

---

## Why products are not in the database

1. **enrich-prices only updates; it does not create**
   - The scraper POSTs to `POST /api/crawler/enrich-prices` with `vendorId`, `region: "US"`, and `products[]`.
   - For US, the API looks up each product via **`us_vendor_product_mapping`** (vendor product name → `us_products.id`), then **updates** the matching row in **`us_vendor_products_new`**.
   - It **never inserts** into `us_vendor_products_new` or `us_vendor_product_mapping`.

2. **SnusDaddy (and GotPouches, SnusDirect) have no rows to update**
   - `us_vendor_product_mapping`: **0** rows for SnusDaddy.
   - `us_vendor_products_new`: **0** rows for SnusDaddy.
   - So for every product the API returns:  
     `"Product not found in us_vendor_product_mapping. Please add it to us_vendor_product_mapping first."`  
     and nothing is written to the DB.

3. **No separate “import” step**
   - There is no API or script in this repo that:
     - Reads the scraped CSVs (or the same payload the scraper sends), and
     - **Inserts** into `us_vendor_products_new` and/or **creates** `us_vendor_product_mapping` rows for a new US vendor.

So: **scrape → CSV and API call both succeed, but the API correctly rejects updates because there are no existing vendor products or mappings.**

---

## What’s needed to get products “imported”

You need a **one-time (or first-time) import** for each new US vendor that:

1. **Inserts** rows into **`us_vendor_products_new`**  
   - One row per scraped product: `us_vendor_id`, `name`, `url`, `price_1pack`, `price_10pack`, etc., from the CSV (or same structure the scraper sends).

2. **Optionally** creates rows in **`us_vendor_product_mapping`**  
   - So the site can show “this vendor product” on “this US product” page.  
   - Can be done later (e.g. after 90% matching) or in the same script.

After that, the **existing** scraper + enrich-prices flow will **update** those rows on every run; no change needed to the scraper or enrich-prices for that.

---

## Suggested next steps

1. **Add an import script or API** (e.g. `scripts/import-us-vendor-from-csv.ts` or `POST /api/crawler/import-us-vendor`) that:
   - Reads a vendor’s `scraped_results.csv` (or accepts the same JSON the scraper sends),
   - Inserts into `us_vendor_products_new` for that `us_vendor_id`,
   - Does **not** call enrich-prices (enrich-prices will run on the next scrape).

2. **Run it once per new US vendor** (SnusDaddy, GotPouches, SnusDirect) using their existing CSVs.

3. **Add mappings** (e.g. 90% match SnusDaddy product names → `us_products`, then insert into `us_vendor_product_mapping`) so the site shows prices on product pages. Enrich-prices will then update those same rows on each scrape.

If you want, the next step can be to sketch that import script (or API) and the exact `us_vendor_products_new` columns from the SnusDaddy CSV.
