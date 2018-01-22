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

    area: [Area]

    category: [Category]

    # Makers assigned to object
    makers: [Maker]

    medias: [Media]

    # Title (translated)
    titles: [TranslatedText]
  }

  type Media {
    rank: Int
    primarydisplay: Int
    filename: String
  }

  type Maker {
    id: ID
    rank: Int
    nationality: String
    name: String
    birthyear_yearformed: Int
    deathyear: Int
    roles: [TranslatedText]
  }

  type Medium {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
    makers: [Maker]
  }

  type Area {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
    rank: Int
  }

  type Category {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
  }

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
`

export default typeDefs
