# US vendors (GotPouches, SnusDirect) – ZYN and “Nicotine Pouches” check

## Question
Do GotPouches / SnusDirect have ZYN, or could ZYN be listed under a generic name like "Nicotine Pouches Wintergreen"?

## Findings

### 1. No product named "Nicotine Pouches Wintergreen"
- **GotPouches** `scraped_results.csv`: no row has "nicotine" in the Product Name (only the header has "Product Name").
- **SnusDirect** `scraped_results.csv`: no product names containing "nicotine" in the imported data.
- **DB** (`us_vendor_products_new`): no rows with "nicotine" in the name for GotPouches or SnusDirect.

So ZYN is **not** listed under a generic "Nicotine Pouches Wintergreen" (or similar) in the data we have.

### 2. Wintergreen products we do have (all branded)
- **GotPouches:** KUMA Wintergreen Ultra Strong, SYX 3mg Wintergreen Low, XQS 4mg Wintergreen.
- **SnusDirect:** KUMA Wintergreen Ultra Strong, SYX Wintergreen 2.8mg, XQS Wintergreen 4mg.

These are the only wintergreen rows; all have a clear brand (KUMA, SYX, XQS).

### 3. Why there’s no ZYN in the DB for GotPouches / SnusDirect
- **GotPouches**  
  - `urls.csv` **does** contain ZYN URLs, e.g.  
    `zyn-citrus-mini-3mg`, `zyn-cool-mint-mini-3mg`, `zyn-espressino-mini-dry`, `zyn-mini-dry-bellini-3mg`, `zyn-spearmint-mini-dry-3mg`.  
  - **None** of these URLs appear in `scraped_results.csv`.  
  - So ZYN was **never written to the CSV** – either the scraper didn’t run for those URLs, or those pages failed/returned a different structure and were skipped.
- **SnusDirect**  
  - `scraped_results.csv` has **no** rows whose URL or product name contains "ZYN".  
  - So either SnusDirect doesn’t have ZYN in the scrape list, or ZYN pages weren’t scraped successfully.

## Conclusion
- There is **no** evidence of ZYN being listed as "Nicotine Pouches Wintergreen" or any other generic nicotine-pouches name.
- GotPouches **does** have ZYN in `urls.csv`, but those ZYN URLs are **missing** from `scraped_results.csv`, so they were never imported into `us_vendor_products_new`.

## Recommendation
1. **GotPouches:** Re-run the GotPouches scraper so it processes the ZYN URLs in `urls.csv` and appends/updates `scraped_results.csv`; then re-run the import script so ZYN rows get into `us_vendor_products_new`.
2. **SnusDirect:** Confirm whether ZYN product URLs are in SnusDirect’s url list; if yes, run the scraper for them and then re-import.
3. Optionally add a small check in the scraper to log or report when a URL in `urls.csv` does not appear in the output CSV (e.g. failed or missing products).
