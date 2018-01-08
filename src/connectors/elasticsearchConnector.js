import Elasticsearch from 'elasticsearch'
import esQueries from '../queries/artworksQuery'

const unpackElasticsearchObjects = (response) => {
  const artworks = response.hits.hits.map((artwork) => {
    let source = artwork._source

    if (source.authors && source.authors.length && source.authors[0][0].author) {
      source.makers = source.authors[0]
    } else {
      source.makers = []
    }

    return source
  })
  return artworks
}

const client = async () => {
  const ElasticsearchClient = new Elasticsearch.Client({
    host: process.env.ES_HOST || 'localhost:9200'
  })

  const count = await ElasticsearchClient.count({ index: 'objects', type: 'object' })
  const response = await ElasticsearchClient.search(esQueries.artworks(count))

  return {
    Artworks: unpackElasticsearchObjects(response)
  }
}

export default client
