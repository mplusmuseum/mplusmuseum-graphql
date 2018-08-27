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
  ): [LevelOneObject]
  object(
    id: Int!
    lang: String = "en"
  ): SingleObject
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
  ): LevelOneConstituent
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

type SingleObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: Float
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [ConstituentRankAndRollSimpleObjects]
}

type SimpleObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: Float
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
}

type LevelOneObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: Float
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
}
type LevelTwoObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: Float
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelThreeConstituent]
}
type LevelThreeObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: Float
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
}

type ConstituentRankAndRollSimpleObjects {
  id: Int
  publicAccess: Boolean
  name: String
  alphaSortName: String
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  rank: Int
  role: String
  objects: [LevelTwoObject]
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
  rank: Int
  roles: [String]
  objects: [LevelTwoObject]
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
  rank: Int
  roles: [String]
  objects: [LevelThreeObject]
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
`