exports.schema = `
type Query {
  hello: String
  objects(
    page: Int
    per_page: Int
    publicAccess: Boolean
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
    publicAccess: Boolean
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
    publicAccess: Boolean
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
    publicAccess: Boolean
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
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Area]
  
  categories(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Categories]

  archivalLevels(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [ArchivalLevels]

  statuses(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Statuses]

  names(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Names]

  collectionTypes(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [CollectionTypes]

  collectionCodes(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [CollectionCodes]

  mediums(
    page: Int
    per_page: Int
    publicAccess: Boolean
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
  exhibitions: ExhibitionsShort
  concepts: [LevelThreeConcept]
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
  exhibitions: ExhibitionsShort
  concepts: [LevelThreeConcept]
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
  exhibitions: [LevelThreeExhibition]
  concepts: [LevelThreeConcept]
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
  exhibitionBios: [ExhibitionLabels]
  _sys: Sys
}

type LevelOneExhibition {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
  objects: [LevelOneObject]
  artInt: Int
  _sys: Sys
}

type LevelThreeExhibition {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
  artInt: Int
  _sys: Sys
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
  _sys: Sys
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
  _sys: Sys
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
  _sys: Sys
}

type ExhibitionsShort {
  exhibitions: [ExhibitionShort]
  labels: [ExhibitionLabels]
  _sys: Sys
}

type ExhibitionShort {
  id: Int
  title: String
  type: String
  beginDate: String
  endDate: String
  venues: [Venue]
  section: String
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

type Mediums {
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
