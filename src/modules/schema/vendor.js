exports.schema = `
type Query {
  hello: String
  killCache: Boolean
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
    fonds: String
    objectName: String
    objectStatus: String
    objectNumber: String
    medium: String
    tags: [String]
    lens: String
    displayDate: String
    beginDate: Int
    endDate: Int
    minDate: Int
    maxDate: Int
    inDate: String
    collectionName: String
    style: String
    department: String
    constituent: Int
    constituents: [Int]
    bibliographies: [Int]
    exhibition: Int
    concept: Int
    title: String
    keyword: String
    color: String
    color_threshold: Float = 50.0
    color_source: String = "google"
    missingPrimaryImage: Boolean
    hasImage: Boolean
    prioritiseImages: Boolean
    prioritiseArchives: Boolean
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
    id: Int
    objectNumber: String
    lang: String = "en"
    publicAccess: Boolean
  ): SingleObject

  constituents(
    page: Int
    per_page: Int
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    ids: [Int]
    publicAccess: Boolean
    name: String
    role: String
    gender: String
    beginDate: Int
    endDate: Int
    activeCity: String
    birthCity: String
    deathCity: String
    nationality: String
    type: String
    region: String
    keyword: String
    isMaker: Boolean
  ): [LevelThreeConstituent]
  
  constituent(
    id: Int!
    lang: String = "en"
    page: Int
    per_page: Int
    publicAccess: Boolean
    category: String
    area: String
    title: String
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
    prioritiseImages: Boolean
    prioritiseArchives: Boolean
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
    publicAccess: Boolean
    category: String
    area: String
    title: String
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
    prioritiseImages: Boolean
    prioritiseArchives: Boolean
  ): LevelOneExhibition

  concepts(
    page: Int
    per_page: Int = 500
    ids: [Int]
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    conceptUse: String
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
    title: String
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
    prioritiseImages: Boolean
    prioritiseArchives: Boolean
  ): LevelOneConcept

  bibliographies(
    page: Int
    per_page: Int = 500
    ids: [Int]
    sort: String = "asc"
    sort_field: String = "id"
  ): [LevelThreeBibliography]
  
  bibliography(
    id: Int!
    lang: String = "en"
  ): LevelOneBibliography

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
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Area]
  
  categories(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Categories]

  archivalLevels(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ArchivalLevels]

  statuses(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Statuses]

  names(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Names]

  collectionTypes(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [CollectionTypes]

  collectionCodes(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [CollectionCodes]

  fonds(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [CollectionCodes]

  collectionNames(
    page: Int
    per_page: Int
    publicAccess: Boolean
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [CollectionNames]

  departments(
    page: Int
    per_page: Int
    publicAccess: Boolean
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Departments]

  styles(
    page: Int
    per_page: Int
    publicAccess: Boolean
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Styles]

  mediums(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
  ): [Mediums]

  tags(
    page: Int
    per_page: Int
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Tags]

  makertypes(
    lang: String = "en"
  ): [MakerTypes]

  lenses(
    page: Int
    per_page: Int
  ): [Lenss]
  
  conActiveCities(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConActiveCities]

  conBirthCities(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConBirthCities]

  conDeathCities(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConDeathCities]

  genders(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Genders]

  nationalities(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [Nationalities]

  conRegions(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConRegions]

  conTypes(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConTypes]

  conRoles(
    publicAccess: Boolean
    lang: String = "en"
    sort: String = "asc"
    sort_field: String = "id"
    collectionCode: String
    fonds: String
    collectionType: String
    collectionName: String
    department: String
    style: String
    constituent: Int
    area: String
    category: String
    keyword: String
  ): [ConRoles]

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

    randoms(
      page: Int
      per_page: Int
    ): [Randoms]
}

type Mutation {
  updateTags(
    id: Int!
    tags: String!
  ): SingleObject

  createLens(
    title: String
  ): [Lenss]

  updateLens(
    id: String!
    title: String
    isActive: Boolean
  ): [Lenss]

  deleteLens(
    id: String!
  ): [Lenss]
}

type LevelOneObject {
  id: Int
  artInt: Int
  publicAccess: Boolean
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
  dimensionDetails: [DimensionDetails]
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  exhibitions: ExhibitionsShort
  concepts: [LevelThreeConcept]
  bibliographies: [LevelTwoBibliography]
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
  fonds: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  scopeNContentHTML: String
  baselineDescription: String
  baselineDescriptionHTML: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  tags: [String]
  fullTags: [Lens]
  imageSortScore: Int
  archivalLevelScore: Int
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type SingleObject {
  id: Int
  artInt: Int
  publicAccess: Boolean
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
  dimensionDetails: [DimensionDetails]
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelTwoConstituent]
  exhibitions: ExhibitionsShort
  concepts: [LevelThreeConcept]
  bibliographies: [LevelTwoBibliography]
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
  fonds: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  scopeNContentHTML: String
  baselineDescription: String
  baselineDescriptionHTML: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  tags: [String]
  fullTags: [Lens]
  relatedObjects: [RelatedObject]
  _sys: Sys
}

type Lens {
  lens: String
  langs: [LensLangs]
}

type LensLangs {
  lang: String
  tags: [String]
}

type LevelTwoObject {
  id: Int
  artInt: Int
  publicAccess: Boolean
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
  dimensionDetails: [DimensionDetails]
  creditLine: String
  medium: String
  classification: Classification
  constituents: [LevelThreeConstituent]
  exhibitions: [LevelThreeExhibition]
  concepts: [LevelThreeConcept]
  bibliographies: [LevelTwoBibliography]
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
  fonds: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  scopeNContentHTML: String
  baselineDescription: String
  baselineDescriptionHTML: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  tags: [String]
  fullTags: [Lens]
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type LevelThreeObject {
  id: Int
  artInt: Int
  publicAccess: Boolean
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
  dimensionDetails: [DimensionDetails]
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
  fonds: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  scopeNContentHTML: String
  baselineDescription: String
  baselineDescriptionHTML: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  tags: [String]
  fullTags: [Lens]
  relatedObjects: [RelatedObjectShort]
  _sys: Sys
}

type RelatedObject {
  id: Int
  artInt: Int
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
  style: String
  department: String
  dimension: String
  dimensionDetails: [DimensionDetails]
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
  fonds: String
  collectionName: String
  collection: Collection
  scopeNContent: String
  scopeNContentHTML: String
  baselineDescription: String
  baselineDescriptionHTML: String
  isRecommended: Boolean
  recommendedBlurb: String
  blurbExternalUrl: String
  tags: [String]
  fullTags: [Lens]
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
  objectCountPublic: Int
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
  isMakerOfObject: Boolean
  objectCount: Int
  objectCountPublic: Int
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
  objectCountPublic: Int
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
  beginDate: String
  endDate: String
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
  beginDate: String
  endDate: String
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
  beginDate: String
  endDate: String
  conceptUse: String
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
  html: String
}

type Classification {
  area: String
  category: String
  archivalLevel: String
}

type Area {
  title: String
  count: Int
  _sys: MiniSys
}

type Categories {
  title: String
  count: Int
  _sys: MiniSys
}

type ArchivalLevels {
  title: String
  count: Int
  _sys: MiniSys
}

type Statuses {
  title: String
  count: Int
  _sys: MiniSys
}

type Names {
  title: String
  count: Int
  _sys: MiniSys
}

type Mediums {
  title: String
  count: Int
  _sys: MiniSys
}

type Tags {
  title: String
  count: Int
  _sys: MiniSys
}

type Collection {
  code: String
  type: String
  objectId: Int
  title: String
  titleOther: String
  _sys: MiniSys
}

type CollectionTypes {
  title: String
  count: Int
  _sys: MiniSys
}

type CollectionCodes {
  title: String
  count: Int
  _sys: MiniSys
}

type CollectionNames {
  title: String
  count: Int
  _sys: MiniSys
}

type Departments {
  title: String
  count: Int
  _sys: MiniSys
}

type Styles {
  title: String
  count: Int
  _sys: MiniSys
}

type MakerTypes {
  title: String
}

type Lenss {
  id: String
  slug: String
  title: String
  isActive: Boolean
  _sys: Sys
}

type ConActiveCities {
  title: String
  count: Int
  _sys: MiniSys
}

type ConBirthCities {
  title: String
  count: Int
  _sys: MiniSys
}

type ConDeathCities {
  title: String
  count: Int
  _sys: MiniSys
}

type Genders {
  title: String
  count: Int
  _sys: MiniSys
}

type Nationalities {
  title: String
  count: Int
  _sys: MiniSys
}

type ConRegions {
  title: String
  count: Int
  _sys: MiniSys
}

type ConTypes {
  title: String
  count: Int
  _sys: MiniSys
}

type ConRoles {
  title: String
  count: Int
  _sys: MiniSys
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
  isCollection: Boolean
  isMain: Boolean
  isPopular: Boolean
  keyword: [String]
}

type Randoms {
  id: String
  text: String
  textTC: String
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
