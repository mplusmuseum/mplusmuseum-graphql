if (process.env.NODE_ENV !== 'prod') {
  require('dotenv').load()
}

const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const schema = require('./schema')
const connectMongo = require('./mongo-connector')

const start = async () => {

  const mongo = await connectMongo()

  const app = express()

  app.use('/graphql',
    bodyParser.json(),
    graphqlExpress({
      context: { mongo },
      schema
    })
  )

  app.use('/graphiql',
    graphiqlExpress({
      endpointURL: './graphql',
    })
  )

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}.`)
  })
}

start()
