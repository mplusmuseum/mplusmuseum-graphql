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
    creditlines: [TranslatedText]

    # Medium listing (translated)
    medium: Medium

    # Object dimensions (translated)
    dimensions: [TranslatedText]

    # Categories assigned to object
    areacategories: [AreaCategory]

    area: [Area]

    category: [Category]

    # Authors/makers assigned to object
    authors: [Author]

    medias: [Media]

    # Title (translated)
    titles: [TranslatedText]
  }

  type Media {
    rank: Int
    primarydisplay: Int
    filename: String
  }

  type Author {
    rank: Int
    id: ID
    nationality: String
    name: String
    birthyear_yearformed: Int
    deathyear: Int
    artworks: [Artwork]
    mediums: [Medium]
    roles: [TranslatedText]
  }

  type Medium {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
    authors: [Author]
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
    artworks(area: String): [Artwork!]!
    authors: [Author!]!
    mediums: [Medium]
    areas(artwork: ID): [Area]
    categories: [Category]
    artwork(id: ID): Artwork
    author(id: ID!): Author
    medium(id: ID!): Medium
    area(id: ID): Area
    category(id: ID!): Category
  }

  type Mutation {
    createArtwork(tms_id: ID!, title: [TranslatedTextInput]!): Artwork
  }
`

export default typeDefs
