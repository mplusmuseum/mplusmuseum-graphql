const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  type Artwork {
    id: ID!
    title: String!
  }

  type Query {
    allArtworks: [Artwork!]!
  }

  type Mutation {
    createArtwork(title: String!): Artwork
  }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
