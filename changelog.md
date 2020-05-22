# Changelog
All changes made after 05/20/2020 will be documented in this file.

## 05/20/2020
### Added
 - Promise for getScrape
 - Scraping for url if it hasn't been scraped in over a month

### Removed
 - Callbacks for getScrape and addScrape
 - Excess code

 ## 05/21/2020
 ### Added
 - Database rows update if raw_url hasn't been scraped in over a month, rather than adding a new row
 - Added a updateScrape function in scrapes.js
 - Image and Favicon paths are checked, if they are relative, they are made absolute
 - Wrapped the paths in `<a>` tags (on the frontend)
 - Cleaned up code and added comments 