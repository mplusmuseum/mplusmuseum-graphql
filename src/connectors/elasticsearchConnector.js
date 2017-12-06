import Elasticsearch from 'elasticsearch'
import esQueries from '../queries/artworksQuery'

const unpackElasticsearchObjects = (response) => {
  const artworks = response.hits.hits.map((artwork) => {
    let object = artwork._source
    let formattedObject = Object.assign({}, object)

    formattedObject.title = []
    Object.keys(object.title).map((key) => {
      formattedObject.title.push({
        language: key,
        text: object.title[key]
      })
    })

    return formattedObject
  })

  // console.log(artworks[0])

  return artworks
}

const client = async () => {
  const ElasticsearchClient = new Elasticsearch.Client({
    host: process.env.ES_HOST,
    httpAuth: process.env.ES_HTTP_AUTH
  })

  const response = await ElasticsearchClient.search(esQueries.artworks)

  return {
    Artworks: unpackElasticsearchObjects(response)
  }
}

export default client
