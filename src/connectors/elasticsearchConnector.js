import Elasticsearch from 'elasticsearch';
import esQueries from '../queries/artworksQuery';

const unpackElasticsearchObjects = response => {
  const artworks = response.hits.hits.map(artwork => {
    let source = artwork._source;

    if (source.authors && source.authors.length) {
      source.makers = source.authors[0];
      if (!Array.isArray(source.makers)) {
        source.makers = [source.makers];
      }
    } else {
      source.makers = [];
    }

    return source;
  });
  return artworks;
};

const client = async () => {
  const {
    ELASTICSEARCH_HOST = 'localhost',
    ELASTICSEARCH_PORT = 9200
  } = process.env;
  const host = `${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}`;

  const { ELASTICSEARCH_USER = '', ELASTICSEARCH_PASS = '' } = process.env;
  const httpAuth = `${ELASTICSEARCH_USER}:${ELASTICSEARCH_PASS}`;

  const ElasticsearchClient = new Elasticsearch.Client({ host, httpAuth });

  const count = await ElasticsearchClient.count({
    index: 'objects',
    type: 'object'
  });
  const response = await ElasticsearchClient.search(esQueries.artworks(count));

  return {
    Artworks: unpackElasticsearchObjects(response)
  };
};

export default client;
