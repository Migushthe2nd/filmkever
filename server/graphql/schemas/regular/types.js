const graphql = require('graphql')
const { GraphQLObjectType, GraphQLString } = graphql

exports.UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        joined: { type: GraphQLString },
        last_logged_in: { type: GraphQLString }
    }
})
