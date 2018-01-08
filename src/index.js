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

  const PORT = ( process.env.GRAPHQL_PORT || 3000 );
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}.`)
  })
}

start()
