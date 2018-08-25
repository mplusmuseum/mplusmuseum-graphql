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
  ): [Object]
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
  ): [Constituent]
  constituent(
    id: Int!
    lang: String = "en"
  ): SingleConstituent
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
type Object {
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
}
type Constituent {
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
type SingleConstituent {
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
