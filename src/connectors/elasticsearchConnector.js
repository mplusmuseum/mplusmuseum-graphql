import Elasticsearch from 'elasticsearch'
import esQueries from '../queries/artworksQuery'

const unpackElasticsearchObjects = (response) => {
  const artworks = response.hits.hits.map((artwork) => {
    // let source = artwork._source
    // source.authors = artwork._source.authors[0]
    // return source
    return artwork._source
  })
  return artworks
}

const client = async () => {
  const ElasticsearchClient = new Elasticsearch.Client({
    host: process.env.ES_HOST,
    // httpAuth: process.env.ES_HTTP_AUTH
  })

  const response = await ElasticsearchClient.search(esQueries.artworks)

  return {
    Artworks: unpackElasticsearchObjects(response)
  }
}

export default client
