import Elasticsearch from 'elasticsearch'

const ElasticsearchClient = new Elasticsearch.Client({
  host: process.env.ES_HOST,
  httpAuth: process.env.ES_HTTP_AUTH
})

const artworksQuery = {
  index: 'mplusmuseum',
  body: {
    query: {
      match: {
        _type: "artworks"
      }
    }
  }
}

const client = async () => {
  const ElasticsearchClient = new Elasticsearch.Client({
    host: process.env.ES_HOST,
    httpAuth: process.env.ES_HTTP_AUTH
  })

  const artworks = await ElasticsearchClient.search(artworksQuery)

  return {
    Artworks: artworks.hits.hits
  }
}

export default client
