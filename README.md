This was created during my time as a student at Code Chrysalis

# streaming-where-api

API for community sourced information about media streaming services with information about audio/subtitles/censorship/edits and country by country availability.

## Environment

### Postgres

You will need postgres installed. If you haven't installed it already, download and install the [PostgresApp](https://postgresapp.com/) and verify its working by running the command `psql` in your terminal.

Create a database for this project by running:

```bash
    echo "CREATE DATABASE streamingwhere;" | psql
```

### Installing Dependencies and Startup

Example:

To install dependencies:

```bash
    yarn
```

To run migrations and set up the database:

```bash
    yarn migrate
```

To roll back migrations

```bash
    yarn rollback
```

To run tests:

```bash
    yarn test
```

To run the app:

```bash
    yarn start
```

To run the app in developer mode, where each save refreses the server:

```bash
    yarn dev
```

## API

### GraphQL

This is a GraphQL API, allowing for a variation in the columns returned by each query.
