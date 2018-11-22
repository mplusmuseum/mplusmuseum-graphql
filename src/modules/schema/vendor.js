exports.schema = `
type Query {
  hello: String
  objects(
    page: Int
    per_page: Int
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    category: String
    area: String
    medium: String
    displayDate: String
    beginDate: Int
    endDate: Int
    constituent: Int
    exhibition: Int
    concept: Int
    title: String
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
  ): [LevelOneObject]

  randomobjects: [LevelOneObject]

  object(
    id: Int!
    lang: String = "en"
  ): LevelOneObject


  constituents(
    page: Int
    per_page: Int
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    name: String
    keyword: String
    gender: String
    beginDate: Int
    endDate: Int
    nationality: String
    isMaker: Boolean
    role: String
  ): [LevelThreeConstituent]
  
  constituent(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: String
    area: String
    medium: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
  ): LevelOneConstituent


  exhibitions(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    type: String
    title: String
    keyword: String
  ): [LevelThreeExhibition]
  
  exhibition(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: String
    area: String
    medium: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
  ): LevelOneExhibition


  concepts(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    conceptUse: String
    beginDate: Int
    endDate: Int
    title: String
    keyword: String
  ): [LevelThreeConcept]
  
  concept(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: String
    area: String
    medium: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
  ): LevelOneConcept

  timeline(
    lang: String = "en"
  ): [Timeline]

  areas(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Area]
  
  categories(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Categories]
  
  mediums(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Mediums]

  makertypes: [MakerTypes]
}

type LevelOneObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  exhibitions: ExhibitionsShort
  concepts: [LevelThreeConcept]
  images: [Image]
  color: ColorInfo
  objectRights: ObjectRights
}

type LevelTwoObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelThreeConstituent]
  exhibitions: [LevelThreeExhibition]
  concepts: [LevelThreeConcept]
  images: [Image]
  color: ColorInfo
  objectRights: ObjectRights
}

type LevelThreeObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  images: [Image]
  color: ColorInfo
  objectRights: ObjectRights
}


type LevelOneConstituent {
  id: Int
  publicAccess: Boolean
  name: String
  alphaSortName: String
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  type: String
  rank: Int
  isMaker: Boolean
  roles: [String]
  objectCount: Int
  exhibitionBios: [ExhibitionLabels]
  objects: [LevelOneObject]
  activeCity: String
  birthCity: String
  deathCity: String
  artInt: Int
  region: String
}

type LevelTwoConstituent {
  id: Int
  publicAccess: Boolean
  name: String
  alphaSortName: String
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  type: String
  rank: Int
  isMaker: Boolean
  roles: [String]
  role: String
  objectCount: Int
  exhibitionBios: [ExhibitionLabels]
  objects: [LevelTwoObject]
}

type LevelThreeConstituent {
  id: Int
  publicAccess: Boolean
  name: String
  alphaSortName: String
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  type: String
  isMaker: Boolean
  roles: [String]
  objectCount: Int
  exhibitionBios: [ExhibitionLabels]
}

type LevelOneExhibition {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
  objects: [LevelOneObject]
}

type LevelThreeExhibition {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
}

type LevelOneConcept {
  id: Int
  publicAccess: Boolean
  timeline: String
  title: String
  description: String
  displayDate: String
  beginDate: Int
  endDate: Int
  conceptUse: String
  objects: [LevelOneObject]
}

type LevelTwoConcept {
  id: Int
  publicAccess: Boolean
  timeline: String
  title: String
  description: String
  displayDate: String
  beginDate: Int
  endDate: Int
  conceptUse: String
  objects: [LevelTwoObject]
}

type LevelThreeConcept {
  id: Int
  publicAccess: Boolean
  timeline: String
  title: String
  description: String
  displayDate: String
  beginDate: Int
  endDate: Int
  conceptUse: String
}

type ExhibitionsShort {
  exhibitions: [ExhibitionShort]
  labels: [ExhibitionLabels]
}

type ExhibitionShort {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
  section: String
}

type ExhibitionLabels {
  purpose: String
  text: String
}

type Classification {
  area: String
  category: String
}
type Area {
  title: String
  count: Int
}
type Categories {
  title: String
  count: Int
}
type Mediums {
  title: String
  count: Int
}
type MakerTypes {
  title: String
}

type Venue {
  title: String
  beginDate: String
  endDate: String
}
type Timeline {
  id: String
  displayDate: String
  yearDisplayDate: String
  startDate: String
  contexts: String
  title: String
  paragraph: String
  imagesObjectId: Int
  imagesTitle: String
  images: [Image]
  color: ColorInfo
}

type Image {
  rank: Int
  primaryDisplay: Boolean
  publicAccess: Boolean
  status: String
  public_id: String
  version: Int
  signature: String
  width: Int
  height: Int
  format: String
  altText: String
  mediaUse: String
}

type ColorInfo {
  predominant: [ColorValue]
  search: Search
}

type Search {
  google: [ColorValue]
  cloudinary: [ColorValue]
}

type ColorValue {
  color: String
  value: Float
}

type ObjectRights {
  type: String
  copyright: String
  concatRights: String
  concatRemark: String
  currentStatus: String
  rights: [Right]
}

type Right {
  title: String
  group: String
}
`
