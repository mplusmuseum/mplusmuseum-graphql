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
  const { ELASTICSEARCH_HOST = 'localhost' , ELASTICSEARCH_PORT = 9200 } = process.env
  const host = `${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}`
  const ElasticsearchClient = new Elasticsearch.Client({host})

  const count = await ElasticsearchClient.count({ index: 'objects', type: 'object' })
  const response = await ElasticsearchClient.search(esQueries.artworks(count))

  return {
    Artworks: unpackElasticsearchObjects(response)
  }
}

export default client
