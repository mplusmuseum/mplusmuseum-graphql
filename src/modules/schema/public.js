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
    archivalLevel: String
    collectionType: String
    collectionCode: String
    objectName: String
    objectStatus: String
    objectNumber: String
    medium: String
    displayDate: String
    beginDate: Int
    endDate: Int
    collectionName: String
    style: String
    department: String
    constituent: Int
    constituents: [Int]
    title: String
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    hue: [Int]
    luminosity: [Int]
    saturation: [Int]
    hsl_range: Int = 30
    isRecommended: Boolean
    withBlurb: Boolean
    onlyObjects: Boolean
    onlyNotObjects: Boolean
    shuffle: Boolean
    shuffleSeed: String
  ): [LevelOneObject]

  randomobjects(
    lang: String = "en"
    onlyObjects: Boolean
    onlyNotObjects: Boolean
    shuffle: Boolean
    shuffleSeed: String
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

  areas(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
  ): [Area]
  
  categories(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
  ): [Categories]
  
  archivalLevels(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [ArchivalLevels]
  
  statuses(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Statuses]

  names(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Names]

  collectionTypes(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [CollectionTypes]

  collectionCodes(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [CollectionCodes]

  collectionNames(
    page: Int
    per_page: Int
    sort: String = "asc"
    sort_field: String = "id"
  ): [CollectionNames]

  departments(
    page: Int
    per_page: Int
    sort: String = "asc"
    sort_field: String = "id"
  ): [Departments]

  styles(
    page: Int
    per_page: Int
    sort: String = "asc"
    sort_field: String = "id"
  ): [Styles]

  mediums(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Mediums]

  makertypes(
    lang: String = "en"
  ): [MakerTypes]

  factoids(
    page: Int
    per_page: Int
    isConstituent: Boolean
    isArea: Boolean
    isCategory: Boolean
    isMedium: Boolean
    isArchive: Boolean
    isColour: Boolean
    isRecommended: Boolean
    isCollection: Boolean
    isMain: Boolean
    isPopular: Boolean
    keyword: String
    ): [Factoids]

}

type LevelOneObject {
  id: Int
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  style: String
  department: String
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  bibliographies: [LevelTwoBibliography]
  color: ColorInfo
  objectRights: ObjectRights
  popularCount: Int
  onView: Boolean
  allORC: String
  archiveDescription: String
  objectStatus: String
  inscription: String
  objectName: String
  collectionType: String
  collectionCode: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  baselineDescription: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type SingleObject {
  id: Int
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  style: String
  department: String
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  bibliographies: [LevelTwoBibliography]
  color: ColorInfo
  objectRights: ObjectRights
  popularCount: Int
  onView: Boolean
  allORC: String
  archiveDescription: String
  objectStatus: String
  inscription: String
  objectName: String
  collectionType: String
  collectionCode: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  baselineDescription: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  relatedObjects: [RelatedObject]
  _sys: Sys
}

type LevelTwoObject {
  id: Int
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  style: String
  department: String
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelThreeConstituent]
  bibliographies: [LevelTwoBibliography]
  color: ColorInfo
  objectRights: ObjectRights
  popularCount: Int
  onView: Boolean
  allORC: String
  archiveDescription: String
  objectStatus: String
  inscription: String
  objectName: String
  collectionType: String
  collectionCode: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  baselineDescription: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type LevelThreeObject {
  id: Int
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  style: String
  department: String
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  color: ColorInfo
  objectRights: ObjectRights
  popularCount: Int
  onView: Boolean
  allORC: String
  archiveDescription: String
  objectStatus: String
  inscription: String
  objectName: String
  collectionType: String
  collectionCode: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  baselineDescription: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type RelatedObject {
  id: Int
  relatedType: String
  selfType: String
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  style: String
  department: String
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  color: ColorInfo
  objectRights: ObjectRights
  constituents: [LevelThreeConstituent]
  popularCount: Int
  onView: Boolean
  allORC: String
  archiveDescription: String
  objectStatus: String
  inscription: String
  objectName: String
  collectionType: String
  collectionCode: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  baselineDescription: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type RelatedObjectShort {
  id: Int
  relatedType: String
  selfType: String
}

type LevelOneConstituent {
  id: Int
  name: String
  nameOther: String
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
  _sys: Sys
}

type LevelTwoConstituent {
  id: Int
  name: String
  nameOther: String
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
  isMakerOfObject: Boolean
  objectCount: Int
  exhibitionBios: [ExhibitionLabels]
  objects: [LevelTwoObject]
  activeCity: String
  birthCity: String
  deathCity: String
  artInt: Int
  region: String
  _sys: Sys
}

type LevelThreeConstituent {
  id: Int
  name: String
  nameOther: String
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
  _sys: Sys
}

type LevelOneBibliography {
  id: Int
  title: String
  subTitle: String
  format: String
  placePublished: String
  yearPublished: String
  _sys: Sys
}

type LevelTwoBibliography {
  id: Int
  title: String
  subTitle: String
  format: String
  placePublished: String
  yearPublished: String
  pageNumber: String
  _sys: Sys
}

type LevelThreeBibliography {
  id: Int
  title: String
  subTitle: String
  format: String
  placePublished: String
  yearPublished: String
  _sys: Sys
}


type ExhibitionLabels {
  purpose: String
  text: String
}

type Classification {
  area: String
  category: String
  archivalLevel: String
}

type Area {
  title: String
  count: Int
}

type Categories {
  title: String
  count: Int
}

type ArchivalLevels {
  title: String
  count: Int
}

type Statuses {
  title: String
  count: Int
}

type Names {
  title: String
  count: Int
}

type Mediums {
  title: String
  count: Int
}

type Collection {
  code: String
  type: String
  objectId: Int
  title: String
  titleOther: String
}

type CollectionTypes {
  title: String
  count: Int
}

type CollectionCodes {
  title: String
  count: Int
}

type CollectionNames {
  title: String
  count: Int
}

type Departments {
  title: String
  count: Int
}

type Styles {
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

type Factoids {
  id: String
  text: String
  textTC: String
  isConstituent: Boolean
  isArea: Boolean
  isCategory: Boolean
  isMedium: Boolean
  isArchive: Boolean
  isColour: Boolean
  isRecommended: Boolean
  isCollection: Boolean
  isMain: Boolean
  isPopular: Boolean
  keyword: [String]
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
`
