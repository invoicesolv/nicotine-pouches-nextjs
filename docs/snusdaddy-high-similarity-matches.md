# SnusDaddy – high-similarity matches (no mappings created)

**Vendor:** SnusDaddy  
**US vendor id:** `4ac9a8e1-783b-4dc6-9a1c-36a6250ef8be`  
**Total SnusDaddy products:** 863  
**Canonical US products:** 327  

## 90% threshold

**There are no pairs with similarity ≥ 0.90.**  
Vendor titles (e.g. "VELO Bright Peppermint", "ZYN Wintergreen 6 mg") differ from canonical titles (e.g. "VELO Peppermint 4mg", "ZYN Wintergreen 6mg") enough that pg_trgm never reaches 0.9.

## Best matches (≥ 75% similarity, one canonical per vendor product)

These are the SnusDaddy products with the highest similarity to a single canonical US product. **No mappings have been created.**

| # | Vendor product id | SnusDaddy name | Canonical product id | Canonical title | Similarity |
|---|-------------------|----------------|----------------------|-----------------|------------|
| 1 | 1525 | XQS Blueberry Mint 4 mg | 565 | XQS Blueberry Mint 4mg | **0.840** |
| 2 | 1729 | SYX Wintergreen 12 mg | 623 | SYX Wintergreen 12mg | 0.792 |
| 3 | 1359 | SYX Wild Cherry 12 mg | 626 | SYX Wild Cherry 12mg | 0.792 |
| 4 | 1353 | SYX Peppermint 12 mg | 631 | SYX Peppermint 12mg | 0.783 |
| 5 | 1358 | SYX Wild Cherry 6 mg | 624 | SYX Wild Cherry 6mg | 0.783 |
| 6 | 1351 | SYX Blueberry 12 mg | 635 | SYX Blueberry 12mg | 0.773 |
| 7 | 1528 | XQS Fizzy Cola 4 mg | 562 | XQS Fizzy Cola 4mg | 0.773 |
| 8 | 1349 | SYX Spearmint 12 mg | 629 | SYX Spearmint 12mg | 0.762 |
| 9 | 1529 | XQS Tropical 4 mg | 555 | XQS Tropical 4mg | 0.750 |
| 10 | 1354 | SYX Tropical 6 mg | 627 | SYX Tropical 6mg | 0.750 |

**Total:** 10 SnusDaddy products with a single best match ≥ 75%. The only pair above 80% is **XQS Blueberry Mint 4 mg → XQS Blueberry Mint 4mg** (84%).

To get more automatic matches you could:
- Normalize titles (e.g. "4 mg" → "4mg", strip pack size) and re-run similarity, or
- Use a lower threshold (e.g. 0.75) for “suggested” mappings and review manually.
