const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  summonerName: String,
  puuid: String,
  championName: String,
  kills: Number,
  deaths: Number,
  assists: Number,
  win: Boolean,
  teamId: Number,
  role: String,
  lane: String,
  kda: Number
});

const matchSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  gameCreation: Number,
  participants: [participantSchema],
});

module.exports = mongoose.model('Match', matchSchema);
