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

[example 2](/api-explorer?query=%7B%0D%0A%20%20artwork%28id%3A%201814%29%20%7B%0A%20%20%20%20id%0A%20%20%20%20areacategories%20%7B%0A%20%20%20%20%20%20areacat%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20rank%0A%20%20%20%20%20%20type%0A%20%20%20%20%7D%0A%20%20%09areacategory_concat%20%7B%0A%20%20%09%20%20value%0A%20%20%09%7D%0A%20%20%20%20makers%20%7B%0A%20%20%20%20%20%20maker%0A%20%20%20%20%20%20makernameid%0A%20%20%20%20%20%20rank%0A%20%20%20%20%20%20nationality%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20birthyear_yearformed%0A%20%20%20%20%20%20deathyear%0A%20%20%20%20%20%20roles%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20makers_concat%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20makerBeginDate%0A%20%20%20%20%20%20makerEndDate%0A%20%20%20%20%20%20makerNames%0A%20%20%20%20%20%20makerNationalities%0A%20%20%20%20%20%20makers%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%20%20copyrightcreditlines%20%7B%0A%20%20%20%20%20%20lang%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%09%09creditlines%20%7B%0A%09%09%20%20lang%0A%09%09%20%20text%0A%09%09%7D%0A%20%20%09datebegin%0A%20%20%09dated%0A%20%20%09dateend%0A%20%20%09dimensions%20%7B%0A%20%20%09%20%20lang%0A%20%20%09%20%20text%0A%20%20%09%7D%0A%20%20%09exhibitions%20%7B%0A%20%20%09%20%20id%0A%20%20%20%20%20%20begindate%0A%20%20%20%20%20%20enddate%0A%20%20%20%20%20%20ExhibitionID%0A%20%20%20%20%20%20venues%20%7B%0A%20%20%20%20%20%20%20%20begindate%0A%20%20%20%20%20%20%20%20enddate%0A%20%20%20%20%20%20%20%20name%20%7B%0A%20%20%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20title%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20%09exhibitions_concat%20%7B%0A%20%20%09%20%20ObjectID%0A%20%20%09%20%20exhinfo%0A%20%20%09%7D%0A%20%20%09exhlabels%20%7B%0A%20%20%09%20%20text%0A%20%20%09%20%20lang%0A%20%20%09%20%20purpose%0A%20%20%09%7D%0A%20%20%09medias%20%7B%0A%20%20%09%20%20rank%0A%20%20%09%20%20primarydisplay%0A%20%20%09%20%20filename%0A%20%20%09%20%20exists%0A%20%20%09%20%20remote%0A%20%20%09%20%20width%0A%20%20%09%20%20height%0A%20%20%09%20%20baseUrl%0A%20%20%09%20%20squareUrl%0A%20%20%09%20%20smallUrl%0A%20%20%09%20%20mediumUrl%0A%20%20%09%20%20largeUrl%0A%20%20%09%7D%0A%20%20%09mediums%20%7B%0A%20%20%09%20%20lang%0A%20%20%09%20%20text%0A%20%20%09%7D%0A%20%20%09MPlusRights%20%7B%0A%20%20%09%20%20ObjRightsID%0A%20%20%09%20%20ObjectID%0A%20%20%09%20%20ObjRightsTypeID%0A%20%20%09%20%20ObjRightsType%0A%20%20%09%20%20ContractNumber%0A%20%20%09%20%20CopyrightRegNumber%0A%20%20%09%20%20Copyright%0A%20%20%09%20%20Restrictions%0A%20%20%09%20%20AgreementSentISO%0A%20%20%09%20%20AgreementSignedISO%0A%20%20%09%20%20ExpirationISODate%0A%20%20%09%20%20CreditLineRepro%0A%20%20%09%7D%0A%20%20%09MPlusRightsFlexFields%20%7B%0A%20%20%09%20%20RightGroup%0A%20%20%09%20%20Value%0A%20%20%09%20%20Date%0A%20%20%09%20%20Remarks%0A%20%20%09%7D%0A%20%20%09objectnumber%0A%20%20%09objectstatus%20%7B%0A%20%20%09%20%20lang%0A%20%20%09%20%20text%0A%20%20%09%7D%0A%20%20%09PublicAccess%0A%20%20%09summaries%0A%20%20%09titles%20%7B%0A%20%20%09%20%20lang%0A%20%20%09%20%20text%0A%20%20%09%7D%0A%20%20%7D%0A%7D):

```
{
  artwork(id: 1814) {
    id
    areacategories {
      areacat {
        lang
        text
      }
      rank
      type
    }
  	areacategory_concat {
  	  value
  	}
    makers {
      maker
      rank
      nationality
      name
      birthyear_yearformed
      deathyear
      roles {
        lang
        text
      }
    }
    makers_concat {
      id
      makerBeginDate
      makerEndDate
      makerNames
      makerNationalities
      makers
      name
    }
    copyrightcreditlines {
      lang
      text
    }
		creditlines {
		  lang
		  text
		}
  	datebegin
  	dated
  	dateend
  	dimensions {
  	  lang
  	  text
  	}
  	exhibitions {
  	  id
      begindate
      enddate
      ExhibitionID
      venues {
        begindate
        enddate
        name {
          lang
          text
        }
      }
      title {
        lang
        text
      }
  	}
  	exhibitions_concat {
  	  ObjectID
  	  exhinfo
  	}
  	exhlabels {
  	  text
  	  lang
  	  purpose
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
  	mediums {
  	  lang
  	  text
  	}
  	MPlusRights {
  	  ObjRightsID
  	  ObjectID
  	  ObjRightsTypeID
  	  ObjRightsType
  	  ContractNumber
  	  CopyrightRegNumber
  	  Copyright
  	  Restrictions
  	  AgreementSentISO
  	  AgreementSignedISO
  	  ExpirationISODate
  	  CreditLineRepro
  	}
  	MPlusRightsFlexFields {
  	  RightGroup
  	  Value
  	  Date
  	  Remarks
  	}
  	objectnumber
  	objectstatus {
  	  lang
  	  text
  	}
  	PublicAccess
  	summaries
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

[example 2](/api-explorer?query=%7B%0A%20%20maker%28id%3A%20543%29%20%7B%0A%20%20%20%20id%0A%20%20%20%20publicaccess%0A%20%20%20%20birthyear_yearformed%0A%20%20%20%20deathyear%0A%20%20%20%20type%0A%20%20%20%20artInt%0A%20%20%20%20nationality%0A%20%20%20%20names%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20institution%0A%20%20%20%20%20%20alphasort%0A%20%20%20%20%20%20displayname%0A%20%20%20%20%7D%0A%20%20%20%20places%20%7B%0A%20%20%20%20%20%20type%0A%20%20%20%20%20%20placename%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20placenamesearch%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20nation%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20continent%20%7B%0A%20%20%20%20%20%20%20%20lang%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D):

```
{
  maker(id: 543) {
    id
    publicaccess
    birthyear_yearformed
    deathyear
    type
    artInt
    nationality
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
