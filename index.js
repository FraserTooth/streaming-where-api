const { ApolloServer, gql } = require("apollo-server");
const config = require("./config");
const knex = require("knex")(config.db);
const bcrypt = require("bcrypt");

const hashIt = string => {
  return bcrypt.hash(string, 6);
};

const typeDefs = gql`
  #Media

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

  input addUser {
    username: String
    email: String
    password: String
  }

  type Query {
    getAllMedia: [Media]
    getMedia(title: String, id: Int): [Media]
  }

  type Mutation {
    addUser(input: addUser): [UserWithEmail]
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
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.PORT || 4000;

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
