# mplusmuseum-graphql

Beginnings of a GraphQL server.

## How this Fits
...

## Prerequisites
For development, you'll want to install local copies of Elasticsearch and Kibana:

```bash
brew install elasticsearch # You may be prompted to install Java first.

# To start elasticsearch:
brew services start elasticsearch
# To stop elasticsearch:
brew services stop elasticsearch

brew install kibana

# To start kibana:
brew services start kibana
# To stop elasticsearch:
brew services stop kibana
```

Your local copy of Elasticsearch will be running on port 9200. Kibana will be running on port 5601.

## Getting Started

1. Clone and download this repo.
2. Create a `.env` file using `.env.example`:
  - `MONGO_URL`: This mongo connector in this repo is currently set up to look at a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/general) cluster.
  - `ES_HOST`: For development, point this at `localhost:9200`
  - `ES_HTTP_AUTH`: You don't need anything here for local development.

## Installation
```
npm install
node ./src/index.js
```

### Usage
...

## Tools
- [Apollo Client Devtools](https://github.com/apollographql/apollo-client-devtools)

## Resources
...

## Built With
...

## Contributing
We welcome your contributions. If you have an addition or correction, please fork this repository, make your change, and submit a pull-request.

## Authors
@rnackman

## License
We are using the [MIT License](LICENSE).
