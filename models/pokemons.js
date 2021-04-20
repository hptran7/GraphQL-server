const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pokemonSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  height: {
    type: String,
    require: true,
  },
  img: {
    type: String,
    require: true,
  },
  pokeType: [
    {
      type: String,
      require: true,
    },
  ],
  weakness: [
    {
      type: String,
      require: true,
    },
  ],
  base: {
    HP: Number,
    Attack: Number,
    Defense: Number,
    SpAttack: Number,
    SpDefense: Number,
    Speed: Number,
  },
  rank: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Pokemon", pokemonSchema);
