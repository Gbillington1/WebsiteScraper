CREATE TABLE crawls (
	crawl_id serial PRIMARY KEY,
	raw_url VARCHAR (255) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP,
	title VARCHAR (255) NOT NULL,
	description VARCHAR(255) NOT NULL,
	image VARCHAR(255),
	favicon VARCHAR(255)
);

CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modified_column
	BEFORE UPDATE ON crawls FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();