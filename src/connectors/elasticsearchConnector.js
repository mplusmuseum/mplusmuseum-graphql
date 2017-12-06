import Elasticsearch from 'elasticsearch'
import artworksQuery from '../queries/artworksQuery'

const unpackElasticsearchObjects = (response) => {
  const esArtworks = response.hits.hits

  const artworks = esArtworks.map((artwork) => {
    return artwork._source
  })

  return artworks
}

const client = async () => {
  const ElasticsearchClient = new Elasticsearch.Client({
    host: process.env.ES_HOST,
    httpAuth: process.env.ES_HTTP_AUTH
  })

  const response = await ElasticsearchClient.search(artworksQuery)

  return {
    Artworks: unpackElasticsearchObjects(response)
  }
}

export default client
