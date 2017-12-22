import typeResolvers from '../resolvers/typeResolvers'
import queryResolvers from '../resolvers/queryResolvers'

const resolvers = Object.assign(
  typeResolvers,
  queryResolvers
)

export default resolvers
