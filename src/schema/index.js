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
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
