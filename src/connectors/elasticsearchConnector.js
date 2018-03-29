import Elasticsearch from 'elasticsearch'
import esQueries from '../queries/query'

const unpackElasticsearchArtworksObjects = response => {
  const artworks = response.hits.hits.map(artwork => {
    let source = artwork._source
    return source
  })
  return artworks
}

const unpackElasticsearchMakersObjects = response => {
  const makers = response.hits.hits.map(maker => {
    let source = maker._source
    return source
  })
  return makers
}

const client = async () => {
  const {
    ELASTICSEARCH_HOST = 'localhost',
    ELASTICSEARCH_PORT = 9200
  } = process.env
  const host = `${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}`

  const { ELASTICSEARCH_USER = '', ELASTICSEARCH_PASS = '' } = process.env
  const httpAuth = `${ELASTICSEARCH_USER}:${ELASTICSEARCH_PASS}`

  const ElasticsearchClient = new Elasticsearch.Client({ host, httpAuth })

  const artworksCount = await ElasticsearchClient.count({
    index: 'objects',
    type: 'object'
  })
  const artworksResponse = await ElasticsearchClient.search(
    esQueries.artworks(artworksCount)
  )

  const makersCount = await ElasticsearchClient.count({
    index: 'authors',
    type: 'author'
  })
  const makersResponse = await ElasticsearchClient.search(
    esQueries.makers(makersCount)
  )
  return {
    Artworks: unpackElasticsearchArtworksObjects(artworksResponse),
    Makers: unpackElasticsearchMakersObjects(makersResponse)
  }
}

export default client
