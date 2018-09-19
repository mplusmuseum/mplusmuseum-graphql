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
  ): LevelOneConstituent


  exhibitions(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    type: String
  ): [LevelThreeExhibition]
  
  exhibition(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: String
    area: String
    medium: String
  ): LevelOneExhibition


  concepts(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    beginDate: Int
    endDate: Int
  ): [LevelThreeConcept]
  
  concept(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: String
    area: String
    medium: String
  ): LevelOneConcept

  timeline(
    lang: String = "en"
  ): [Timeline]

  areas(
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Area]
  
  categories(
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Categories]
  
  mediums(
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
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
`
