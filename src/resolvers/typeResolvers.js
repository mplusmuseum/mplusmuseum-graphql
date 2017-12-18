const typeResolvers = {
  Artwork: {
    id: root => root._id || root.id,
    objectNumber: root => root.objectnumber
  }
}

export default typeResolvers
