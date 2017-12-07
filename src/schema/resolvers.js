import typeResolvers from '../resolvers/typeResolvers'
import queryResolvers from '../resolvers/queryResolvers'
import mutationResolvers from '../resolvers/mutationResolvers'

const resolvers = Object.assign(
  typeResolvers,
  queryResolvers,
  mutationResolvers
)

export default resolvers
