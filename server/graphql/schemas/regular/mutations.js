const graphql = require('graphql')
const { db } = require('../../../utils/db')
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLBoolean } = graphql
const Types = require('./types')

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        addProject: {
            type: Types.UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                const query = `INSERT INTO project(username, email, password, created) VALUES ($1, $2, $3, NOW()) RETURNING title`
                const values = [args.username, args.email, args.password]

                return db
                    .one(query, values)
                    .then((res) => res)
                    .catch((err) => err)
            }
        }
    }
})

exports.mutation = RootMutation
