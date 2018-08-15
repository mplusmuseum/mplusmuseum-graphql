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
  object(id: Int!): SingleObject
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
`
