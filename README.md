This was created during my time as a student at Code Chrysalis.

It was a short, time-pressured weekend project, so this is all quite messy, but I hope to come back and brush it up into a functioning website.

TODO: 
- Split Functions and Tests into Sub-files
- Make Tests Truly Independant
- Add Edit and Delete for Currently Addressed Tables
- Add All Intended Functionality for the rest of the tables
- Add a session table to track 'login' so repeated authentication is not required

# streaming-where-api

API for community sourced information about media streaming services with information about audio/subtitles/censorship/edits and country by country availability.

## Environment

### Postgres

You will need postgres installed. If you haven't installed it already, download and install the [PostgresApp](https://postgresapp.com/) and verify its working by running the command `psql` in your terminal.

Create a database for this project by running:

```bash
    echo "CREATE DATABASE streamingwhere;" | psql
```

### Database Structure

The Database Structure (defined in the migration files) represents a system where:

- A User can be created
- A created user can upload media references (movies or seasons)
- A created user can create a Media Record (e.g: "MovieX is showing on Netflix Canada")
- A created user can create an Accessibility Record (e.g: "MovieX on Netflix Canada, has english subtitles)
- Other website users, without accounts, can vote on the veracity of the accessibility and media records
- The voting time is recorded, so that the availability of things can be soft-tracked (through votes) over time

![alt text][database]

[database]: ./database_structure.png "Created Using dbdesigner.net"

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

### Example Query

A query for graphql looks a little like this:

```javascript
const query = `{
        getAllMedia {
          id
          title
          type
          created_at
          tmdb_api_url
        }
    }`;
```

```javascript
const response = await fetch("http://localhost:4000/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: query })
});
```

### Currently Supported Queries

The following queries are supported at present, with more planned:

#### getAllMedia: [Media]

Gets all available Media Items:

```javascript
const query = `{
        getAllMedia {
          id
          title
          type
          created_at
          tmdb_api_url
        }
    }`;
```

#### getMedia(title: String, id: Int): [Media]

Gets a Specific Media Item:

```javascript
const query = `{
                getMedia(title:"${title}") {
                  id
                  title
                  type
                  tmdb_api_url
                }
              }`;
```

#### getUser(username: String, id: Int): [User]

Gets a User, ID and Username:

```javascript
const query = `{
                getUser(username: "${username}") {
                  id
                  username
                }
              }`;
```

#### getMediaRecords: [MediaRecord]

Gets all Media Records:

```javascript
const query = `{
            getMediaRecords {
              id
              media_url
            }
          }`;
```

#### getMediaRecord(id: Int!): [MediaRecord]

Gets a Specific Media Record by ID:

```javascript
const query = `{
            getMediaRecord(id:${id}) {
              media{
                  title
              }
              streaming_service{
                  name
              }
              country{
                  name
              }
              user {
                  username
              }
            }
          }`;
```

#### getMediaRecordsByTitle(title: String!): [MediaRecord]

Gets all Media Records For a Given Title:

```javascript
const query = `{
        getMediaRecordsByTitle(title:"${title}") {
          id
          media_url
          media{
            title
          }
          streaming_service{
              name
          }
          country{
              name
          }
          user {
              username
          }
        }
      }`;
```

#### getMediaRecordsByUserID(id: Int!): [MediaRecord]

Gets all Media Records For a Given UserID:

```javascript
const query = `{
        getMediaRecordsByUserID(id:${testUserBID}) {
          id
          media_url
          media{
            title
          }
          streaming_service{
              name
          }
          country{
              name
          }
          user {
              username
          }
        }
      }`;
```

### Currently Supported Mutations

The following mutations are supported at present, with more planned:

#### addUser(input: addUser): [UserWithEmail]

Adds a User:

```javascript
const query = `
              mutation {
                  addUser(
                  input: {
                      username: "${username}"
                      email: "${email}"
                      password: "${password}"
                  }){
                      id
                      username
                      email
                  }
              }`;
```

#### addMediaRecord(input: addMediaRecord authentication: authenticate): [MediaRecord]

Creates a Media Record:

```javascript
const query = `
            mutation {
                addMediaRecord(
                input: {
                    title: "${record.title}"
                    streaming_service: "${record.streaming_service}"
                    country: "${record.country}"
                    media_url: "${record.media_url}"
                }
                authentication: {
                    username: "${authentication.username}"
                    password: "${authentication.password}"
                }){
                    media_url
                    user_id
                }
            }`;
```
