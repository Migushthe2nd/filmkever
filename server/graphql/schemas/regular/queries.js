const { GraphQLObjectType, GraphQLID } = require('graphql')
const { db } = require('../../../utils/db')
const Types = require('./types')

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: Types.UserType,
            args: { username: { type: GraphQLID } },
            resolve(parentValue, args) {
                const query = `SELECT * FROM users WHERE username=$1`
                const values = [args.username]

                return db
                    .one(query, values)
                    .then((res) => res)
                    .catch((err) => err)
            }
        }
    }
})

exports.query = RootQuery
