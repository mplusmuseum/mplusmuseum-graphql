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
    sortNumber
    publicAccess
    objectNumber
    classification {
      area
      category
      archivalLevel
    }
    title
    titleOther
    displayDate
    displayDateOther
    beginDate
    endDate
    dimension
    dimensionDetails {
      width
      height
      depth
      unit
      element
      rank
    }
    medium
    creditLine
    constituents {
      id
      name
    }
    images {
      altText
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

    this.objectsColor = `query {
  objects[[]] {
    id
    title
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
    }
  }
}`

    this.constituents = `query {
  constituents[[]] {
    id
    name
    nameOther
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

    this.constituentsId = `query {
  constituents[[]] {
    id
  }
}`

    this.constituent = `query {
  constituent[[]] {
    id
    name
    nameOther
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

    this.archivalLevels = `query {
  archivalLevels[[]] {
    title
    count
  }
}`

    this.fonds = `query {
  fonds[[]] {
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
  }
}`

    this.objectsLargeWithExhibitions = `query {
  objects[[]] {
    id
    title
    classification {
      area
      category
    }
    exhibitions {
      exhibitions {
        id
        beginDate
        endDate
        section
        venues {
          title
          beginDate
          endDate
        }
      }
      labels {
        text
        purpose
      }
    }
    constituents {
      id
      name
      nationality
      gender
      displayBio
      exhibitionBios {
        text
        purpose
      }
    }
  }
}`
    this.exhibitions = `query {
      exhibitions[[]] {
        id
        beginDate
        endDate
        venues {
          title
          beginDate
          endDate
        }
      }
}`

    this.exhibition = `query {
  exhibition[[]] {
    id
    beginDate
    endDate
    venues {
      title
      beginDate
      endDate
    }
    objects {
      id
      title
    }
  }
}`

    this.exhibitionPurpose = `query {
    exhibition[[]] {
      objects {
        id
        title
          exhibitions {
          labels {
            purpose
          }
        }
      }
    }
}`

    this.exhibitionDescription = `query {
  exhibition[[]] {
    objects {
      id
      title
      exhibitions {
        labels {
          purpose
          text
        }
      }
    }
  }
}`

    this.exhibitionBiographies = `query {
  exhibition[[]] {
    objects {
      id
      title
      constituents {
        exhibitionBios {
          purpose
          text
        }
      }
    }
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
