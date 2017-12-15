const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # TMS ID
    id: ID!
    # Accession number
    objectnumber: String!
    # Creation start date
    datebegin: Int
    # Creation end date (if range)
    dateend: Int
    # Display date
    dated: String
    # Object status can be Accessioned Object, [TK] (translated)
    objectstatus: [TranslatedText]
    # Credit lines (translated)
    creditlines: [TranslatedText]
    # Medium listing (translated)
    mediums: [TranslatedText]
    # Object dimensions (translated)
    dimensions: [TranslatedText]
    # Categories assigned to object
    areacategories: [AreaCategory]
    # Makers assigned to object
    authors: [Maker]
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
    rank: Int
    author: ID!
    authornameid: ID!
    nationality: String
    name: String
    birthyear_yearformed: Int
    deathyear: Int
    roles: [TranslatedText]
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
    artworks: [Artwork!]!
    artwork(id: ID!): Artwork
  }

  type Mutation {
    createArtwork(tms_id: ID!, title: [TranslatedTextInput]!): Artwork
  }
`

export default typeDefs
