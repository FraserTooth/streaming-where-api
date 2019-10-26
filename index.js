const { ApolloServer, gql } = require("apollo-server");
const config = require("./config");
const knex = require("knex")(config.db);

const typeDefs = gql`
  #Media

  type Media {
    id: Int
    title: String
    tmdb_api_url: String
    type: String
    created_at: String
  }

  type Query {
    getAllMedia: [Media]
  }
`;

const resolvers = {
  Query: {
    getAllMedia: () => {
      return knex("media").select();
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.PORT || 4000;

// The `listen` method launches a web server.
server.listen(PORT).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
