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
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    title: String
  ): [Area]
  
  categories(
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    title: String
  ): [Categories]
  
  mediums(
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    title: String
  ): [Mediums]
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
  roles: [String]
  exhibitionBios: [ExhibitionLabels]
  objects: [LevelOneObject]
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
  role: String
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

`
