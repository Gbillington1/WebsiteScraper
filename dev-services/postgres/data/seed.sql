CREATE TABLE crawls (
	crawl_id serial PRIMARY KEY,
	raw_url VARCHAR (255) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	title VARCHAR (255) NOT NULL,
	description VARCHAR(255) NOT NULL
);