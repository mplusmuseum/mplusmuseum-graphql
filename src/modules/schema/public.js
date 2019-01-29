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
    constituent: Int
    constituents: [Int]
    title: String
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    missingPrimaryImage: Boolean
    hasImage: Boolean
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
  ): [Area]
  
  categories(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Categories]
  
  archivalLevels(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [ArchivalLevels]
  
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
    isPopular: Boolean
  ): [Factoids]

}

type LevelOneObject {
  id: Int
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  images: [Image]
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
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  images: [Image]
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
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelThreeConstituent]
  images: [Image]
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
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  images: [Image]
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
  publicAccess: Boolean
  objectNumber: String
  sortNumber: String
  title: String
  titleOther: String
  displayDate: String
  displayDateOther: String
  beginDate: Int
  endDate: Int
  dimension: String
  creditLine: String
  medium: String
  classification: Classification
  images: [Image]
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
  publicAccess: Boolean
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
  objects: [LevelOneObject]
  _sys: Sys
}

type LevelTwoConstituent {
  id: Int
  publicAccess: Boolean
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
  objects: [LevelTwoObject]
  _sys: Sys
}

type LevelThreeConstituent {
  id: Int
  publicAccess: Boolean
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
  _sys: Sys
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

type Collection {
  code: String
  type: String
  objectId: Int
  title: String
  titleOther: String
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
  isPopular: Boolean
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
