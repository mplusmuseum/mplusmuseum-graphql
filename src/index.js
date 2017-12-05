if (process.env.NODE_ENV !== 'prod') {
  require('dotenv').load()
}

const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const voyager = require('graphql-voyager/middleware').express
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

  app.use('/api-explorer',
    graphiqlExpress({
      endpointURL: './graphql',
    })
  )

  app.use('/api-voyager',
    voyager({
      endpointURL: 'http://localhost:3000/graphql'
    })
  )

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}.`)
  })
}

start()
