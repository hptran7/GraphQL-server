require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  ID,
} = require("graphql");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const Event = require("./models/event");
const User = require("./models/users");

const EventType = new GraphQLObjectType({
  name: "Event",
  description: "this represent event",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    price: { type: GraphQLNonNull(GraphQLFloat) },
    date: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represent user",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLString },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Root",
  description: "root query",
  fields: () => ({
    Events: {
      type: GraphQLList(EventType),
      description: "All events",
      resolve: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    User: {
      type: GraphQLList(UserType),
      description: "ALl User",
      resolve: () => {},
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "root mutation",
  fields: () => ({
    addEvent: {
      type: EventType,
      description: "add new event",
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        prices: { type: GraphQLNonNull(GraphQLFloat) },
        date: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const event = new Event({
          title: args.title,
          description: args.description,
          prices: args.prices,
          date: new Date(args.date),
          creator: "60750aed4e504b06ef5ff7f1",
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc, _id: event.id };
            return User.findById("60750aed4e504b06ef5ff7f1");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User is not exists");
            }
            user.createdEvent.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
    addUser: {
      type: UserType,
      description: "Add User",
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        return User.findOne({ username: args.username })
          .then((user) => {
            if (user) {
              throw new Error("User already exists");
            }
            return bcrypt.hash(args.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              username: args.username,
              password: hashedPassword,
            });
            return user
              .save()
              .then((result) => {
                return { ...result._doc, _id: user.id, password: null };
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

// remove later end //

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.hy8gt.mongodb.net/event-react?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8080, () => {
      console.log("server is running");
    });
  })
  .catch((err) => {
    console.log(err);
  });
