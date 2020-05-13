# Website Scraper
Website scraper that returns Title, Type, and OG tags of any URL

# Task Below

A team needs to be able to get some metadata for a given url. They provided the following project spec:

- Given a link, call it `url`, scrape the html at the link
- Parse the html from `url` as a DOM document and return the following tags from a function in a JavaScript object with whatever keys you desire:
	- Page `<title>`
	- `title`, `type`, and `url` [OG Tags](https://ogp.me/) (where available)
	- First occurence of `<h1>` or `<h2>`
- **Optionally:** add the above data to a `<div>` tag on the page for a nice preview

### Requirements

- Commit code to a Github repository so it can be included in the microservice and collaborated on
- Any frameworks can be used, but document any non-vanilla JS and why you decided to use it in a `README.md` file
