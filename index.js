const { ApolloServer, gql } = require("apollo-server");
const config = require("./config");
const knex = require("knex")(config.db);
const bcrypt = require("bcrypt");

const hashIt = string => {
  return bcrypt.hash(string, 6);
};

const isPasswordValid = (string, hash) => {
  return bcrypt.compare(string, hash);
};

const typeDefs = gql`
  type Media {
    id: Int!
    title: String!
    tmdb_api_url: String!
    type: String!
    created_at: String!
  }

  type User {
    id: Int!
    username: String!
  }

  type UserWithEmail {
    id: Int!
    username: String!
    email: String
  }

  type StreamingService {
    id: Int!
    name: String!
    base_url: String!
  }

  type Country {
    id: Int!
    name: String!
  }

  type MediaRecord {
    id: Int!
    media_id: Int!
    country_id: Int!
    streaming_service_id: Int!
    user_id: Int!
    media_url: String
    created_at: String!
    media: [Media]
    streaming_service: [StreamingService]
    country: [Country]
    user: [User]
  }

  input addUser {
    username: String
    email: String
    password: String
  }

  input addMediaRecord {
    title: String!
    streaming_service: String!
    country: String!
    media_url: String!
  }

  input authenticate {
    username: String!
    password: String!
  }

  type Query {
    getAllMedia: [Media]
    getMedia(title: String, id: Int): [Media]
    getUser(username: String, id: Int): [User]
    getMediaRecords: [MediaRecord]
    getMediaRecord(id: Int!): [MediaRecord]
    getMediaRecordsByTitle(title: String!): [MediaRecord]
    getMediaRecordsByUserID(id: Int!): [MediaRecord]
  }

  type Mutation {
    addUser(input: addUser): [UserWithEmail]
    addMediaRecord(
      input: addMediaRecord
      authentication: authenticate
    ): [MediaRecord]
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers = {
  Query: {
    getAllMedia: () => {
      return knex("media").select();
    },

    getMedia: (_, { title, id }) => {
      if (id) {
        return knex("media").where("id", id);
      }
      return knex("media").where("title", "like", "%" + title + "%");
    },

    getUser: (_, { username, id }) => {
      if (id) {
        return knex("users")
          .where("id", id)
          .select("id", "username");
      }
      return knex("users")
        .where("username", username)
        .select("id", "username");
    },

    getMediaRecords: () => {
      return knex("media_records").select();
    },

    getMediaRecord: (_, { id }) => {
      return knex("media_records").where("id", id);
    },

    getMediaRecordsByTitle: (_, { title }) => {
      return knex("media")
        .select("id")
        .where("title", "like", "%" + title + "%")
        .then(response => {
          if (response.length === 0) {
            return new Error("Cannot Find Media");
          }
          return knex("media_records").where("media_id", response[0].id);
        });
    },

    getMediaRecordsByUserID: (_, { id }) => {
      return knex("media_records").where("user_id", id);
    }
  },

  MediaRecord: {
    media: media_record => {
      return knex("media").where("id", media_record.media_id);
    },
    streaming_service: media_record => {
      return knex("streaming_services").where(
        "id",
        media_record.streaming_service_id
      );
    },
    country: media_record => {
      return knex("countries").where("id", media_record.country_id);
    },
    user: media_record => {
      return knex("users")
        .where("id", media_record.user_id)
        .select("id", "username");
    }
  },

  Mutation: {
    addUser: async (_, { input }) => {
      const hash = await hashIt(input.password);
      return knex("users")
        .insert({
          username: input.username,
          email: input.email,
          password_hash: hash
        })
        .then(() => {
          return knex("users")
            .where({
              username: input.username
            })
            .select("id", "username", "email");
        });
    },

    addMediaRecord: async (_, { input, authentication }) => {
      const userInfo = await knex("users")
        .select("password_hash", "id")
        .where("username", authentication.username);
      const test = await isPasswordValid(
        authentication.password,
        userInfo[0]["password_hash"]
      );
      if (!test) {
        console.log("Password Invalid");
        return;
      }
      console.log("Password Valid");
      const user_id = userInfo[0].id;
      const media_id = await knex("media")
        .select("id")
        .where("title", "like", "%" + input.title + "%");
      const country_id = await knex("countries")
        .select("id")
        .where("name", "like", "%" + input.country + "%");
      const streaming_service_id = await knex("streaming_services")
        .select("id")
        .where("name", "like", "%" + input.streaming_service + "%");

      return knex("media_records")
        .insert({
          media_id: media_id[0].id,
          country_id: country_id[0].id,
          streaming_service_id: streaming_service_id[0].id,
          user_id: user_id,
          media_url: input.media_url
        })
        .then(() => {
          return knex("media_records")
            .where({
              media_url: input.media_url
            })
            .select();
        });
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.PORT || 4000;

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
