const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # Artwork ID
    id: ID!
    # Artwork title
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
