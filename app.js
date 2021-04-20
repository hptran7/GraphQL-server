require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
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
app.use(cors());

app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;

const Pokemon = require("./models/pokemons");

const BaseType = new GraphQLObjectType({
  name: "base",
  description: "this represent base stats",
  fields: () => ({
    HP: { type: GraphQLNonNull(GraphQLInt) },
    Attack: { type: GraphQLNonNull(GraphQLInt) },
    Defense: { type: GraphQLNonNull(GraphQLInt) },
    SpAttack: { type: GraphQLNonNull(GraphQLInt) },
    SpDefense: { type: GraphQLNonNull(GraphQLInt) },
    Speed: { type: GraphQLNonNull(GraphQLInt) },
  }),
});

const PokeType = new GraphQLObjectType({
  name: "Pokemon",
  description: "This represents Pokemon",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    img: { type: GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLNonNull(GraphQLString) },
    height: { type: GraphQLNonNull(GraphQLString) },
    weight: { type: GraphQLNonNull(GraphQLString) },
    weaknesses: { type: GraphQLNonNull(GraphQLList(GraphQLString)) },
    base: { type: GraphQLNonNull(BaseType) },
    rank: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Root",
  description: "root query",
  fields: () => ({
    Pokemons: {
      type: GraphQLList(PokeType),
      description: "All pokemons",
      resolve: () => {
        return Pokemon.find()
          .then((pokemons) => {
            return pokemons.map((pokemon) => {
              return { ...pokemon._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    PokemonSearch: {
      type: GraphQLList(PokeType),
      description: "Search partial name",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const searchKey = new RegExp(args.name, "i");
        return Pokemon.find({ name: searchKey })
          .then((pokemons) => {
            return pokemons.map((pokemon) => {
              return { ...pokemon._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    Pokemon: {
      type: PokeType,
      description: "Return one pokemons",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        return Pokemon.findOne({ name: args.name })
          .then((result) => {
            return { ...result._doc };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "root mutation",
  fields: () => ({
    addPokemon: {
      type: PokeType,
      description: "add new event",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        img: { type: GraphQLNonNull(GraphQLString) },
        type: { type: GraphQLNonNull(GraphQLString) },
        height: { type: GraphQLNonNull(GraphQLString) },
        weight: { type: GraphQLNonNull(GraphQLString) },
        weaknesses: { type: GraphQLNonNull(GraphQLList(GraphQLString)) },
        HP: { type: GraphQLNonNull(GraphQLFloat) },
        Attack: { type: GraphQLNonNull(GraphQLFloat) },
        Defense: { type: GraphQLNonNull(GraphQLFloat) },
        SpAttack: { type: GraphQLNonNull(GraphQLFloat) },
        SpDefense: { type: GraphQLNonNull(GraphQLFloat) },
        Speed: { type: GraphQLNonNull(GraphQLFloat) },
        rank: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const pokemon = new Pokemon({
          name: args.name,
          img: args.img,
          type: args.type,
          height: args.height,
          weight: args.weight,
          weaknesses: args.weaknesses,
          rank: args.rank,
          base: {
            HP: args.HP,
            Attack: args.Attack,
            Defense: args.Defense,
            SpAttack: args.SpAttack,
            SpDefense: args.SpDefense,
            Speed: args.Speed,
          },
        });
        let createdpokemon;
        return pokemon
          .save()
          .then((result) => {
            createdpokemon = { ...result._doc, _id: pokemon.id };
            return createdpokemon;
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
app.get("/", (req, res) => {
  res.json({ Hello: "hello" });
});

mongoose
  .connect(
    `mongodb+srv://admin:Icerose137@cluster0.hy8gt.mongodb.net/event-react?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("server is running");
    });
  })
  .catch((err) => {
    console.log(err);
  });
