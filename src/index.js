if (process.env.NODE_ENV !== 'prod') require('dotenv').load()

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'

import schema from './schema'

import connectES from './connectors/elasticsearchConnector'

const start = async () => {

  const elasticsearch = await connectES()

  const app = express()

  app.use(cors())

  app.use('/graphql',
    bodyParser.json(),
    graphqlExpress({
      context: { elasticsearch },
      schema
    })
  )

  app.use('/api-explorer',
    graphiqlExpress({
      endpointURL: './graphql',
    })
  )

  const {GRAPHQL_HOST='localhost', GRAPHQL_PORT=3000} = process.env;

  app.listen(GRAPHQL_PORT, GRAPHQL_HOST, () => {
    console.log(`GraphQL listening on ${GRAPHQL_HOST}:${GRAPHQL_PORT}`)
  })
}

start()
