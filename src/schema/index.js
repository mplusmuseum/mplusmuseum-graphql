const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = `
  type Artwork {
    id: ID!
    title: String!
  }
`

module.exports = makeExecutableSchema({ typeDefs })
