const typeDefs = `

  ##################################################################
  #
  # This is an artwork
  type Artwork {
    # TMS ID
    id: ID

    # Categories assigned to object
    areacategories: [AreaCategory]

    # Concatenated Categories assigned to object
    areacategory_concat: [AreaCategoryConcat]

    # Makers assigned to object
    makers: [ArtMaker]

    # Concatenated maker information
    makers_concat: [ArtMakerConcat]

    # Copyright Credit lines (translated)
    copyrightcreditlines: [TranslatedText]

    # Credit lines (translated)
    creditlines: [TranslatedText]

    # Creation start date
    datebegin: Int

    # Display date
    dated: String

    # Creation end date (if range)
    dateend: Int

    # Object dimensions (translated)
    dimensions: [TranslatedText]

    # Exhibitions
    exhibitions: [Exhibitions]

    # Concatenated Exhibitions
    exhibitions_concat: [ExhibitionsConcat]
    
    # Exhibition labels
    exhlabels: [ExhibitionsLabels]
    
    # url of images, videos
    medias: [Medias]

    # Medium listing (translated)
    mediums: [TranslatedText]

    # MPlusRights
    MPlusRights: [MPlusRights]

    # MPlusRights
    MPlusRightsFlexFields: [MPlusRightsFlexFields]

    # MPlusRights
    MPlusRightsFlexFieldsConcat: [MPlusRightsFlexFieldsConcat]

    # Object number
    objectnumber: String

    # Object status can be Accessioned Object, [TK] (translated)
    objectstatus: [TranslatedText]

    # Is is publically accessable
    PublicAccess: Boolean

    # Is is publically accessable
    summaries: String

    # Title (translated)
    titles: [TranslatedText]
  }

  ##################################################################
  #
  # These are the blocks that make up the artwork
  #
  ##################################################################
  
  # Categories assigned to object
  type AreaCategory {
    rank: Int
    type: String
    areacat: [TranslatedText]
  }

  # Area categories concatted together
  type AreaCategoryConcat {
    value: String
  }

  # A maker
  type ArtMaker {
    maker: String
    rank: Int

    # Nationality
    nationality: String

    # the makers name
    name: String

    # the id of the makers name
    makernameid: Int

    # year of birth if known
    birthyear_yearformed: Int

    # year of death if known, null if still alive
    deathyear: Int

    # The roles the maker has related to this artwork
    roles: [TranslatedText]

  }

  # Concatenated maker information
  type ArtMakerConcat {
    id: ID

    # Makers' names
    makerNames: String

    # Nationalities
    makerNationalities: String

    # The makers' names
    name: String

    # Years of birth if known
    makerBeginDate: String

    # Years of death if known, null if still alive
    makerEndDate: String

    # Makers' information
    makers: String

  }

  # Exhibitions
  type Exhibitions {
    id: ID

    # Begin Date
    begindate: String

    # End Date
    enddate: String

    # The exhibition ID
    ExhibitionID: String

    # Venues
    venues: [Venue]

    # The title
    title: [TranslatedText]

  }

  # Concatenated exhibition information
  type ExhibitionsConcat {

    # Object ID
    ObjectID: String

    # Exhibition Info
    exhinfo: String

  }

  # Labels for the exhibitions
  type ExhibitionsLabels {
    text: String
    lang: String
    purpose: String
  }

  # urls of associated images, audio and video recordings
  type Medias {
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

  # Rights information
  type MPlusRights {
    ObjRightsID: Int
    ObjectID: Int
    ObjRightsTypeID: Int
    ObjRightsType: String
    ContractNumber: String
    CopyrightRegNumber: String
    Copyright: String
    Restrictions: String
    AgreementSentISO: String
    AgreementSignedISO: String
    ExpirationISODate: String
    CreditLineRepro: String
  }

  # Additional M+ rights
  type MPlusRightsFlexFields {
    RightGroup: String
    Value: String
    Date: String
    Remarks: String
  }

  # Concatenated additional M+ rights information
  type MPlusRightsFlexFieldsConcat {
    Rights: String
    Remarks: String
  }

  # A venue
  type Venue {
    begindate: String
    enddate: String
    name: [TranslatedText]
  }

  
  ##################################################################
  #
  # This is a maker
  type Maker {
    id: ID!
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

  ##################################################################
  #
  # This is a medium
  type Medium {
    lang: String
    text: String
  }

  ##################################################################
  #
  # This is an area
  type Area {
    lang: String
    text: String
  }

  ##################################################################
  #
  # This is a category
  type Category {
    lang: String
    text: String
  }


  ##################################################################

  input TranslatedTextInput {
    lang: String
    text: String
  }

  type TranslatedText {
    lang: String
    text: String
  }
  

  ##################################################################
  #
  # Ways to ask the db about stuff, try
  #
  #    query {
  #      artworks {
  #        titles
  #        maker
  #      }
  #    }
  type Query {
    artworks(
      limit: Int = 100,
      examplesSearchOptionOne: Int = 0,
      examplesSearchOptionTwo: String = "",
      maker: String = "",
      filter: String
    ): [Artwork!]!

    artwork(
      id: ID,
      examplesSearchOptionOne: Int,
      examplesSearchOptionTwo: String
    ): Artwork
    
    makers(
      limit: Int = 100,
      artwork: ID,
      medium: ID
    ): [Maker!]!

    maker(
      id: ID!
    ): Maker

    mediums(
      limit: Int = 100,
      lang: String
    ): [Medium!]!

    areas(
      limit: Int = 100,
      lang: String
    ): [Area!]!

    categories(
      limit: Int = 100,
      lang: String
    ): [Category!]!


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
