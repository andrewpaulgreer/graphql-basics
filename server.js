const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const {
GraphQLSchema,
GraphQLObjectType,
GraphQLString,
GraphQLList,
GraphQLInt,
GraphQLNonNull
} = require('graphql')
const app = express()

//acting db
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]
// create booktype graphql object to define types
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book writtten by an author',
    //fields return funtions because booktype refrences AuthorType, so we need booktype to be defined before authortype,
    //but authortype defines booktype so we need asuthortype to be defined before booktype
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        //defining author on booktype
        author: {
            //telling how to get AuthorType Below
        type: AuthorType,
        resolve: (book)=> {
            return authors.find(author => author.id === book.authorId)
        }
    }
    })
})

//author type
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author',
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        //getting books that match author
        books: {
            type: new GraphQLList(BookType),
            resolve: (author)=> {
                return books.filter(book=> book.authorId === author.id)
            }
        }
    })
})


//define the root query type
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    //adding perens around curleys so it acts as return statement
    fields: ()=> ({
        //returning one book
        book: {
            type: BookType,
            description: "A Single Book",
            //giving args to query on
            args: {
                id: {type: GraphQLInt}
            },
            //resolving with arguements, on the book id matchng the arg id we just made (integer)
            resolve: (parent, args)=> books.find(book => book.id === args.id)
            // to fetch you would say book(id:1){name}
        },
        //returning multiple books
        books: {
            type: new GraphQLList(BookType),
            description: "list of books",
            resolve: ()=> books
        },
        author: {
            type: AuthorType,
            description: "A Single Author",
            //giving args to query on
            args: {
                id: {type: GraphQLInt}
            },
            //resolving with arguements, on the book id matchng the arg id we just made (integer)
            resolve: (parent, args)=> authors.find(authors => authors.id === args.id)
            // to fetch you would say book(id:1){name}
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "list of authors",
            resolve: ()=> authors
        },
    })
})
// mutating data, post, put, and delete
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'root mutation',
    fields: ()=>({
        addBook: {
            type: BookType,
            description: 'add a book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args)=> {
                return book = {id: books.length +1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add an author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args)=> {
                return author = {id: authors.length +1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

//querying mutation------------------------
// mutation {
//     addBook(name: "new name", authorId: 1){
//     id
//       name
//   }
//   }


// create new schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000., ()=> console.log('server running'))
