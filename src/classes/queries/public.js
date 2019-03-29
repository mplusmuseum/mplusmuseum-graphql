/** Class representing a collection of queries. */
class Queries {
  /**
   * Create a collection of queries
   */
  constructor () {
    this.schema = `query {
  __schema {
    types {
      description
      fields {
        args {
          name
          type {
            name
          }
          defaultValue
        }
        description
        name
        type {
          name
        }
      }
      kind
      name
    }
  }
}`
    this.type = `query {
  __type[[]] {
    name
    kind
    description
    fields {
      args {
        description
        defaultValue
      }
      description
      name
      type {        
        possibleTypes {
          name
          description
        }
        name
        description
      }
    }
  }
}`

    this.hello = `query {
  hello[[]]
}`

    this.objectMini = `query {
  object[[]] {
    id
  }
}`

    this.objectMedium = `query {
  object[[]] {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
  }
}`

    this.objectLarge = `query {
  object[[]] {
    id
    publicAccess
    objectNumber
    sortNumber
    title
    displayDate
    beginDate
    endDate
    dimension
    creditLine
    medium
    classification {
      area
      category
    }
    images {
      rank
      primaryDisplay
      publicAccess
      public_id
      status
      version
      signature
      width
      height
      format
      altText
      mediaUse
    }
  }
}`

    this.objectConstituent = `query {
  object[[]] {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
    constituents {
      id
      name
      alphaSortName
      displayBio
      gender
      beginDate
      nationality
      rank
      role
      objects {
        id
        objectNumber
        title
        displayDate
        medium
        classification {
          area
          category
        }
      }
    }
  }
}`

    this.objectsMini = `query {
  objects[[]] {
    id
  }
}`

    this.objectsMedium = `query {
  objects[[]] {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
  }
}`

    this.objectsRandom = `query {
  randomobjects {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
  }
}`

    this.objectsLarge = `query {
  objects[[]] {
    id
    publicAccess
    objectNumber
    sortNumber
    title
    displayDate
    beginDate
    endDate
    dimension
    creditLine
    medium
    classification {
      area
      category
    }
    images {
      rank
      primaryDisplay
      publicAccess
      public_id
      status
      version
      signature
      width
      height
      format
      altText
      mediaUse
    }
    color {
      predominant {
        color
        value
      }
      search {
        google {
          color
          value
        }
        cloudinary {
          color
          value
        }
      }
    }
  }
}`

    this.objectsColor = `query {
  objects[[]] {
    id
    title
    images {
      public_id
      version
      format
    }
    color {
      predominant {
        color
        value
      }
      search {
        google {
          color
          value
        }
        cloudinary {
          color
          value
        }
      }
    }
  }
}`

    this.objectsConstituent = `query {
  objects[[]] {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
    constituents {
      id
      name
      alphaSortName
      displayBio
      gender
      beginDate
      nationality
      role
      rank
    }
  }
}`

    this.objectsConstituentMini = `query {
  objects[[]] {
    id
    objectNumber
    title
    displayDate
    medium
    classification {
      area
      category
    }
    constituents {
      name
      role
      rank
    }
  }
}`

    this.constituents = `query {
  constituents[[]] {
    id
    name
    alphaSortName
    displayBio
    gender
    beginDate
    nationality
    type
    roles
    isMaker
    objectCount
  }
}`
    this.constituent = `query {
  constituent[[]] {
    id
    name
    alphaSortName
    displayBio
    gender
    beginDate
    nationality
    roles
    type
    objects {
      id
      objectNumber
      title
      displayDate
      medium
      classification {
        area
        category
      }
    }
  }
}`

    this.constituentTypes = `query {
  makertypes[[]] {
    title
  }
}`

    this.areas = `query {
  areas[[]] {
    title
    count
  }
}`

    this.categories = `query {
  categories[[]] {
    title
    count
  }
}`

    this.mediums = `query {
  mediums[[]] {
    title
    count
  }
}`

    this.constituentLarge = `query {
  constituent[[]] {
    id
    publicAccess
    name
    alphaSortName
    displayBio
    gender
    beginDate
    endDate
    nationality
    type
  }
}`
  }

  /**
   *
   * @param {string} query The name of the query, needs to match one of those defined in the constructor, i.e. 'schema', 'hello', places'
   * @param {string} filter The filter we want to apply to the query i.e. '(limit: 20)'
   * @returns {string|null} A representation of the query ready to be used if found, or null if not.
   */
  get (query, filter) {
    if (!(query in this)) return null
    if (!filter) filter = ''
    return this[query].replace('[[]]', filter)
  }
}
/** A handy query class that contains a bunch of predefined GraphQL queries */
module.exports = Queries
