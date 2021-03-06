# mplusmuseum-graphql

Beginnings of a GraphQL server, where we write adapters to databases to frontends just need to write graphql queries instead of learn about the unique features of each database.

## Prerequisites
For development, you'll want to install local copies of Elasticsearch and Kibana. We use Elasticsearch as our database store, and Kibana to explore that data.

```bash
(($+commands[brew])) && brew cask install docker # for macOS
(($+commands[apt])) && sudo apt install docker # for debian or ubuntu

docker run --publish 9200:9200 --publish 9300:9300 --env "discovery.type=single-node" --name mplusmuseum_elasticsearch docker.elastic.co/elasticsearch/elasticsearch:6.1.2 -p 9300:9300 -e "discovery.type=single-node"
```

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
4. Start this server with `yarn start`
6. Explore the api at http://localhost:3000/api-explorer

