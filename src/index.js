if (process.env.NODE_ENV !== 'prod') require('dotenv').load()

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
// import { express as voyager } from 'graphql-voyager/middleware'

import schema from './schema'

import connectMongo from './connectors/mongoConnector'
import connectES from './connectors/elasticsearchConnector'

const start = async () => {

  const mongo = await connectMongo()
  const elasticsearch = await connectES()

  const app = express()

  app.use(cors())

  app.use('/graphql',
    bodyParser.json(),
    graphqlExpress({
      context: { elasticsearch },
      // context: { mongo },
      schema
    })
  )

  app.use('/api-explorer',
    graphiqlExpress({
      endpointURL: './graphql',
    })
  )

  // app.use('/api-voyager',
  //   voyager({
  //     endpointURL: 'http://localhost:3000/graphql'
  //   })
  // )

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}.`)
  })
}

start()
