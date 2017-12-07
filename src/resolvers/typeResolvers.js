const typeResolvers = {
  Artwork: {
    id: root => root._id || root.id
  }
}

export default typeResolvers
