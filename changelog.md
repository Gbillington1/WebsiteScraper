# Changelog
All changes made after 05/20/2020 will be documented in this file.

## [05/30/2020]
### Added
 - `getDate()` in place of `setDate()`
 - `makeScrape()` to scrape webpages
 - `makeFrontend()` to create a frontend data object from the data returned by `makeScrape()`
 - query to return "latest crawl within {x} days"
 - comments
 - fixed height for image on frontend

### Removed
 - `setDate()` 
 - Excess axios code
 - Code that deletes properties from `DBdata`
 - JS code that calculated dates

## [05/21/2020]
### Added
- Database rows update if raw_url hasn't been scraped in over a month, rather than adding a new row
- Added a updateScrape function in scrapes.js
- Image and Favicon paths are checked, if they are relative, they are made absolute
- Wrapped the paths in `<a>` tags (on the frontend)
- Cleaned up code and added comments 
- last_modified column
- Trigger that updates the last_modified timestamp when any column is updated

## [05/20/2020]
### Added
 - Promise for getScrape
 - Scraping for url if it hasn't been scraped in over a month

### Removed
 - Callbacks for getScrape and addScrape
 - Excess code

## [Before]
Changes before 05/20/2020 are not logged in this changelog, but you can press [before] to see the commit history.

[05/30/2020]: https://github.com/Gbillington1/WebsiteScraper/compare/5083693..42eec6a
[05/21/2020]: https://github.com/Gbillington1/WebsiteScraper/compare/57bd12d..6872850
[05/20/2020]: https://github.com/Gbillington1/WebsiteScraper/compare/ef92f98..57bd12d
[Before]: https://github.com/Gbillington1/WebsiteScraper/compare/4cd8ca9..ef92f98