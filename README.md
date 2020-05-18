# Website Scraper
Website scraper that returns social graph data

## Prerequisites

You MUST have the following things properly installed and setup on your development device.

* [Git](https://git-scm.com/)
* [Docker](https://docker.com)
* [npm](https://npmjs.com)

## Installing for Development

* `git clone <repository-url>` this repository
* `cd` into the directory
* `docker-compose up` to initialize and build web service and Postgres DB
* `ctrl+c` to stop server. Run `npm install` to load dependencies, and run `docker-compose up` to have the volume with updated files be applied

## Running in Development

All you need is Docker!

To start your development service, `cd {this directory}` and run:

```
docker-compose up
```

You should now be able to access the API service at `http://localhost:8080`.

When making functional changes, push final artifacts to the `master` branch.

## Database
This project uses the Docker postgres image to maintain a local database. When you initially build the docker-compose
project, the database will be seeded with data. If you need to re-seed, you can empty the `./dev-services/postgres/data/pgdata` directory
and run `docker-compose up` again.

