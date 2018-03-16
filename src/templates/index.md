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

### Artworks

[example 1](/api-explorer?query=query%20%7B%0A%20%20artworks%20%7B%0A%20%20%20%20id%0A%20%20%20%20titles%20%7B%0A%20%20%20%20%20%20lang%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

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

This is a request you can make to get _all_ the information about a single item. See the notes about image URLs below.

[example 2](/api-explorer?query=%7B%0D%0A%20%20artwork%28id%3A%201814%29%20%7B%0D%0A%20%20%20%20id%0D%0A%20%20%20%20area%20%7B%0D%0A%20%20%20%20%20%20id%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20areacategories%20%7B%0D%0A%20%20%20%20%20%20rank%0D%0A%20%20%20%20%20%20type%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20category%20%7B%0D%0A%20%20%20%20%20%20id%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20creditLines%20%7B%0D%0A%20%20%20%20%20%20lang%0D%0A%20%20%20%20%20%20text%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20dated%0D%0A%20%20%20%20dateBegin%0D%0A%20%20%20%20dateEnd%0D%0A%20%20%20%20dimensions%20%7B%0D%0A%20%20%20%20%20%20lang%0D%0A%20%20%20%20%20%20text%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20makers%20%7B%0D%0A%20%20%20%20%20%20id%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20medias%20%7B%0D%0A%20%20%20%20%20%20rank%0D%0A%20%20%20%20%20%20primarydisplay%0D%0A%20%20%20%20%20%20filename%0D%0A%20%20%20%20%20%20exists%0D%0A%20%20%20%20%20%20remote%0D%0A%20%20%20%20%20%20width%0D%0A%20%20%20%20%20%20height%0D%0A%20%20%20%20%20%20baseUrl%0D%0A%20%20%20%20%20%20squareUrl%0D%0A%20%20%20%20%20%20smallUrl%0D%0A%20%20%20%20%20%20mediumUrl%0D%0A%20%20%20%20%20%20largeUrl%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20medium%20%7B%0D%0A%20%20%20%20%20%20id%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20objectNumber%0D%0A%20%20%20%20objectStatus%20%7B%0D%0A%20%20%20%20%20%20lang%0D%0A%20%20%20%20%20%20text%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20titles%20%7B%0D%0A%20%20%20%20%20%20lang%0D%0A%20%20%20%20%20%20text%0D%0A%20%20%20%20%7D%0D%0A%20%20%7D%0D%0A%7D):

```
{
  artwork(id: 1814) {
    id
    area {
      id
    }
    areacategories {
      rank
      type
    }
    category {
      id
    }
    creditLines {
      lang
      text
    }
    dated
    dateBegin
    dateEnd
    dimensions {
      lang
      text
    }
    makers {
      id
    }
    medias {
      rank
      primarydisplay
      filename
      exists
      remote
      width
      height
      baseUrl
      squareUrl
      smallUrl
      mediumUrl
      largeUrl
    }
    medium {
      id
    }
    objectNumber
    objectStatus {
      lang
      text
    }
    titles {
      lang
      text
    }
  }
}
```

The `medias` query can return an array of images for the item. With the following of note...

**`filename`**: The original filename from TMS  
**`exists`**: If the file has been uploaded to the image server  
**`remote`**: The version number and ID of the remote image  
**`width`** & **`height`**: The original dimensions of the image  
**`baseUrl`**: The url to the unmodified image  
**`squareUrl`**: a 150x150px square crop  
**`smallUrl`**: 480px wide  
**`mediumUrl`**: 1000px wide  
**`largeUrl`**: 2048px wide

...so check **`exist`** first :)

If there are no images it'll return an empty array. There's a slim chance the system things something exists but **`remote`** will still be null, so that aught to be checked for too.

### Makers

[example 1](/api-explorer?query=query%20%7B%0A%20%20makers%20%7B%0A%20%20%20%20id%0A%20%20%20%20names%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20displayname%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

```
query {
  makers {
    id
    names {
    	lang
      displayname
    }
  }
}
```

This is a request you can make to get _all_ the information about a single item. See the notes about image URLs below.

[example 2](http://localhost:3000/api-explorer?query=%7B%0A%20%20maker%28id%3A%20543%29%20%7B%0A%20%20%20%20id%0A%20%20%20%20publicaccess%0A%20%20%20%20birthyear_yearformed%0A%20%20%20%20deathyear%0A%20%20%20%20type%0A%20%20%20%20artInt%0A%20%20%20%20names%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20institution%0A%20%20%20%20%20%20alphasort%0A%20%20%20%20%20%20displayname%0A%20%20%20%20%7D%0A%20%20%20%20places%20%7B%0A%20%20%20%20%20%20type%0A%20%20%20%20%20%20placename%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20placenamesearch%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20nation%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20continent%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

```
{
  maker(id: 543) {
    id
    publicaccess
    birthyear_yearformed
    deathyear
    type
    artInt
    names {
      id
    	lang
    	institution
      alphasort
      displayname
    }
    places {
      type
      placename {
        lang
        text
      }
      placenamesearch {
        lang
        text
      }
      nation {
        lang
        text
      }
      continent {
        lang
        text
      }
    }
  }
}
```

## Using curl

Here are the two example queries done with Curl. Note there is authorisation needed using the same username and password you used to access this site.

```
curl 'https://api.mplus.org.hk/graphql?query=query%20%7B%0A%20%20artworks%20%7B%0A%20%20%20%20id%0A%20%20%20%20titles%20%7B%0A%20%20%20%20%20%20lang%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D' -H 'Upgrade-Insecure-Requests: 1' -H 'Accept: text/html' -H 'Cache-Control: no-cache' -u [username]:[password]
```

```
curl 'https://api.mplus.org.hk/graphql?query=query%20%7B%0A%20%20%20%20artwork(id%3A1814)%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20titles%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%7D' -H 'Upgrade-Insecure-Requests: 1' -H 'Accept: text/html' -H 'Cache-Control: no-cache' -u [username]:[password]
```
