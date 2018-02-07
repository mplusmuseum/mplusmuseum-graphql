# Welcome to the M+ GraphQL server

You can find the explorer running at: [/api-explorer](/api-explorer)  
And the API endpoint itself at: [/graphql](/graphql)

There's currently about 6,800 example artworks stored in the DB. This value may go up and down (even to zero) as we refresh, import and test new data.

You can find instructions on how to us GraphQL in the following locations:

https://www.howtographql.com/  
https://www.smashingmagazine.com/2018/01/graphql-primer-new-api-part-1/  
https://www.smashingmagazine.com/2018/01/graphql-primer-new-api-part-2/  
https://cloudacademy.com/blog/how-to-write-graphql-apps-using-aws-lambda/

## Example queries

You can enter the following queries at [/api-explorer](/api-explorer) to see an example of GraphQL running.

```
query {
  artworks {
    id
    titles {
      lang
      text
    }
  }
}
```

```
query {
    artwork(id:4151) {
        id
        titles {
            lang
            text
        }
    }
}
```

## Using curl

Here are the two above queries done again with Curl. Note there is authorisation needed using the same username and password you used to access this site.

```
curl 'https://api.mplus.org.hk/graphql?query=query%20%7B%0A%20%20artworks%20%7B%0A%20%20%20%20id%0A%20%20%20%20titles%20%7B%0A%20%20%20%20%20%20lang%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D' -H 'Upgrade-Insecure-Requests: 1'  -H 'Accept: text/html' -H 'Cache-Control: no-cache' -u [username]:[password]
```

```
curl 'https://api.mplus.org.hk/graphql?query=query%20%7B%0A%20%20%20%20artwork(id%3A4151)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20titles%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%7D' -H 'Upgrade-Insecure-Requests: 1'  -H 'Accept: text/html' -H 'Cache-Control: no-cache' -u [username]:[password]
```
