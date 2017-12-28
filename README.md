# mplusmuseum-graphql

Beginnings of a GraphQL server, where we write adapters to databases to frontends just need to write graphql queries instead of learn about the unique features of each database.

## Prerequisites
For development, you'll want to install local copies of Elasticsearch and Kibana. We use Elasticsearch as our database store, and Kibana to explore that data.

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

1. Clone and download this repo
2. Install dependencies with `npm install` or `yarn`
3. Make sure elasticsearch is started `brew services start elasticsearch`
4. Start this server with `npm start` or `yarn start`
5. Explore the api at http://localhost:3000/api-explorer

## Tools

[Apollo Client Devtools](https://github.com/apollographql/apollo-client-devtools) provides a tab in firefox / chrome dev tools

## Contributing
We welcome your contributions! If you have a question, or suggestion, please write an [issue](/issues) or create a [pull request](/pulls).

## Authors
[@rnackman](https://github.com/rnackman), [@jedahan](https://github.com/jedahan)

## License
We are using the [MIT License](LICENSE)
