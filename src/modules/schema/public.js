exports.schema = `
type Query {
  hello: String
  objects(
    page: Int
    per_page: Int
    ids: [Int]
    lang: String = "en"
    sort: String
    sort_field: String
    publicAccess: Boolean
    objectNumber: String
    category: [String]
    area: [String]
    archivalLevel: [String]
    fonds: String
    title: String
    displayDate: String
    beginDate: Int
    endDate: Int
    medium: String
    tags: [String]
    constituent: Int
    constituents: [Int]
    exhibition: Int
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    hue: [Int]
    luminosity: [Int]
    saturation: [Int]
    hsl_range: Int = 30
    shuffle: Boolean
    shuffleSeed: String
  ): [LevelOneObject]

  object(
    id: Int
    slug: String
    objectNumber: String
    lang: String = "en"
  ): SingleObject

  constituents(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String
    sort_field: String
    ids: [Int]
    publicAccess: Boolean
    name: String
    role: String
    gender: String
    beginDate: Int
    endDate: Int
    nationality: String
    keyword: String
    isMaker: Boolean
  ): [LevelThreeConstituent]
  
  constituent(
    id: Int
    slug: String
    lang: String = "en"
    page: Int
    per_page: Int
    category: [String]
    area: [String]
    title: [String]
    displayDate: String
    beginDate: Int
    endDate: Int
    medium: String
    constituent: Int
    constituents: [Int]
    exhibition: Int
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    hue: [Int]
    luminosity: [Int]
    saturation: [Int]
    hsl_range: Int = 30
  ): LevelOneConstituent

  exhibitions(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String
    sort_field: String
    type: String
    title: String
    keyword: String
  ): [LevelThreeExhibition]

  exhibition(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    category: [String]
    area: [String]
    title: [String]
    displayDate: String
    beginDate: Int
    endDate: Int
    medium: String
    constituent: Int
    constituents: [Int]
    exhibition: Int
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    hue: [Int]
    luminosity: [Int]
    saturation: [Int]
    hsl_range: Int = 30
  ): LevelOneExhibition

  areas(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String
    sort_field: String
    fonds: String
    area: [String]
    category: [String]
  ): [Area]

  fonds(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String
    sort_field: String
  ): [CollectionCodes]
  
  categories(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String
    sort_field: String
    fonds: String
    area: [String]
    category: [String]
  ): [Categories]

  archivalLevels(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String
    sort_field: String
  ): [ArchivalLevels]

  mediums(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String
    sort_field: String
  ): [Mediums]

  tags(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String
    sort_field: String
  ): [Tags]

  makertypes(
    lang: String = "en"
  ): [MakerTypes]

}

type LevelOneObject {
  id: Int
  slug: String
  sortNumber: String
  publicAccess: Boolean
  objectNumber: String
  classification: Classification
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  dimensionDetails: [DimensionDetails]
  fonds: String
  medium: String
  creditLine: String
  constituents: [LevelTwoConstituent]
  images: [Image]
  color: ColorInfo
  archivalLevelSlugs: String
  areasSlugs: String
  categorySlugs: String
  mediumSlug: String
  objectNumberSlug: String
  titleSlug: String
  _sys: Sys
}

type SingleObject {
  id: Int
  slug: String
  sortNumber: String
  publicAccess: Boolean
  objectNumber: String
  classification: Classification
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  dimensionDetails: [DimensionDetails]
  fonds: String
  medium: String
  creditLine: String
  constituents: [LevelTwoConstituent]
  images: [Image]
  color: ColorInfo
  archivalLevelSlugs: String
  areasSlugs: String
  categorySlugs: String
  mediumSlug: String
  objectNumberSlug: String
  titleSlug: String
  _sys: Sys
}

type LevelTwoObject {
  id: Int
  slug: String
  sortNumber: String
  publicAccess: Boolean
  objectNumber: String
  classification: Classification
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  dimensionDetails: [DimensionDetails]
  fonds: String
  medium: String
  constituents: [LevelThreeConstituent]
  images: [Image]
  color: ColorInfo
  archivalLevelSlugs: String
  areasSlugs: String
  categorySlugs: String
  mediumSlug: String
  objectNumberSlug: String
  titleSlug: String
  _sys: Sys
}

type LevelThreeObject {
  id: Int
  slug: String
  sortNumber: String
  publicAccess: Boolean
  objectNumber: String
  classification: Classification
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  dimensionDetails: [DimensionDetails]
  fonds: String
  medium: String
  creditLine: String
  images: [Image]
  color: ColorInfo
  archivalLevelSlugs: String
  areasSlugs: String
  categorySlugs: String
  mediumSlug: String
  objectNumberSlug: String
  titleSlug: String
  _sys: Sys
}

type RelatedObject {
  id: Int
  slug: String
  sortNumber: String
  publicAccess: Boolean
  objectNumber: String
  classification: Classification
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  dimensionDetails: [DimensionDetails]
  fonds: String
  medium: String
  creditLine: String
  images: [Image]
  color: ColorInfo
  relatedType: String
  selfType: String
  archivalLevelSlugs: String
  areasSlugs: String
  categorySlugs: String
  mediumSlug: String
  objectNumberSlug: String
  titleSlug: String
  _sys: Sys
}

type RelatedObjectShort {
  id: Int
  relatedType: String
  selfType: String
  _sys: Sys
}

type LevelOneConstituent {
  id: Int
  slug: String
  publicAccess: Boolean
  name: String
  nameOther: String
  alphaSortName: String
  type: String
  roles: [String]
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  objectCountPublic: Int
  objects: [LevelOneObject]
  _sys: Sys
}

type LevelTwoConstituent {
  id: Int
  slug: String
  publicAccess: Boolean
  name: String
  nameOther: String
  alphaSortName: String
  type: String
  roles: [String]
  role: String
  isMaker: Boolean
  isMakerOfObject: Boolean
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  objectCountPublic: Int
  objects: [LevelTwoObject]
  _sys: Sys
}

type LevelThreeConstituent {
  id: Int
  slug: String
  publicAccess: Boolean
  name: String
  nameOther: String
  alphaSortName: String
  type: String
  roles: [String]
  isMaker: Boolean
  displayBio: String
  gender: String
  beginDate: Int
  endDate: Int
  nationality: String
  objectCountPublic: Int
  _sys: Sys
}

type LevelOneExhibition {
  id: Int
  beginDate: String
  endDate: String
  venues: [Venue]
  objects: [LevelOneObject]
  _sys: Sys
}

type LevelThreeExhibition {
  id: Int
  beginDate: String
  endDate: String
  venues: [Venue]
  artInt: Int
  _sys: Sys
}

type Classification {
  area: [String]
  category: [String]
  archivalLevel: [String]
}

type Area {
  title: String
  count: Int
}

type CollectionCodes {
  title: String
  count: Int
  _sys: MiniSys
}

type Categories {
  title: String
  count: Int
}

type ArchivalLevels {
  title: String
  count: Int
}

type Mediums {
  title: String
  count: Int
}

type Tags {
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

type Image {
  altText: String
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

type Sys {
  pagination: Pagination
}

type Pagination {
  page: Int
  perPage: Int
  total: Int
  maxPage: Int
}

type MiniSys {
  total: Int
  totalRows: Int
}

type DimensionDetails {
  unit: String
  element: String
  rank: String
  width: Float
  height: Float
  depth: Float
}
`
