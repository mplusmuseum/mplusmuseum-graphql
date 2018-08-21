exports.schema = `
type Query {
  hello: String
  objects(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Object]
  object(
    id: Int!
    lang: String = "en"
  ): SingleObject
  areas(
    page: Int
    per_page: Int
    lang: String = "en"
  ): [Area]
  categories(
    page: Int
    per_page: Int
    lang: String = "en"
  ): [Categories]
  mediums(
    page: Int
    per_page: Int
    lang: String = "en"
  ): [Mediums]
}
type Object {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimensions: String
  creditLine: String
  medium: String
}
type SingleObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  title: String
  displayDate: String
  beginDate: Int
  endDate: Int
  dimensions: String
  creditLine: String
  medium: String
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
