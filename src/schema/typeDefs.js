const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # TMS ID
    id: ID!

    # Accession number
    objectNumber: String!

    # Creation start date
    dateBegin: Int

    # Creation end date (if range)
    dateEnd: Int

    # Display date
    dated: String

    # Object status can be Accessioned Object, [TK] (translated)
    objectStatus: [TranslatedText]

    # Credit lines (translated)
    creditLines: [TranslatedText]

    # Medium listing (translated)
    medium: Medium

    # Object dimensions (translated)
    dimensions: [TranslatedText]

    # Categories assigned to object
    areacategories: [AreaCategory]

    # Broad areas such as Design & Architecture, Visual Art, Moving Image
    area: [Area]

    # Specific mediums and tags, like product design, or ink art
    category: [Category]

    # Makers assigned to object
    makers: [Maker]

    # url of images, videos
    medias: [Media]

    # Title (translated)
    titles: [TranslatedText]
  }

  # urls of associated images, audio and video recordings
  type Media {
    rank: Int

    # is this the main file to show the artwork
    primarydisplay: Boolean

    # relative url to image, sound, or video
    filename: String

    # if the image exists on a server somewhere
    exists: Boolean

    # remote url snippet to image, sound, or video
    remote: String

    # Original width of the image
    width: Int

    # Original height of the image
    height: Int

    # Base url for the image
    baseUrl: String

    # url for a square thumbnail
    squareUrl: String

    # url for small version of the image
    smallUrl: String

    # url for medium version of the image
    mediumUrl: String

    # url for large version of the image
    largeUrl: String

  }

  type Maker {
    id: ID
    rank: Int

    # artisan integer
    artInt: Int

    # Public access to this maker
    publicaccess: Boolean

    # Type
    type: String

    # year of birth if known
    birthyear_yearformed: Int

    # year of death if known, null if still alive
    deathyear: Int

    # list of names
    names: [MakerNames]

    # Nationality
    nationality: String

    # Places where this maker is connected to
    places: [Places]

  }

  type Medium {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
    makers: [Maker]
  }

  # Broad areas such as Design & Architecture, Visual Art, Moving Image
  type Area {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
    rank: Int
  }


  # Specific mediums and tags, like product design, or ink art
  type Category {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
  }

  # Categories assigned to object
  type AreaCategory {
    rank: Int
    type: String
    areacat: [TranslatedText]
  }

  type TranslatedText {
    lang: String
    text: String
  }

  input TranslatedTextInput {
    lang: String
    text: String
  }

  # Names assigned to a maker
  type MakerNames {
    id: Int,
    lang: String,
    institution: String,
    alphasort: String,
    displayname: String
  }

  # Places you can find a maker
  type Places {
    type: String,
    placename: [TranslatedText],
    placenamesearch: [TranslatedText],
    nation: [TranslatedText],
    continent: [TranslatedText],
    
  }
  # Ways to ask the db about stuff, try
  #
  #    query {
  #      artworks {
  #        titles
  #        maker
  #      }
  #    }
  type Query {
    artwork(id: ID!): Artwork
    maker(id: ID!): Maker
    medium(id: ID!): Medium
    area(id: ID!): Area
    category(id: ID!): Category

    artworks(
      limit: Int = 100,
      filter: String,
      area: ID,
      category: ID,
      maker: ID,
      medium: ID
    ): [Artwork!]!

    makers(
      limit: Int = 100,
      artwork: ID,
      medium: ID
    ): [Maker!]!

    mediums(
      limit: Int = 100,
      maker: ID
    ): [Medium]

    areas(
      limit: Int = 100,
      artwork: ID,
      maker: ID
    ): [Area]

    categories(
      limit: Int = 100,
      artwork: ID,
      maker: ID,
      area: String
    ): [Category]
  }

  schema {
    #Right now, we just support queries - try
    #
    #    query {
    #      artworks {
    #        titles
    #        maker
    #      }
    #    }
    query: Query
  }
`

export default typeDefs
