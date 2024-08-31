const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  hints: [String],
  solution: String,
  type: String, // 'text', 'multipleChoice', 'dragAndDrop', etc.
  data: mongoose.Schema.Types.Mixed, // Datos específicos para el tipo de desafío
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }, // Nivel de dificultad
  timeLimit: { type: Number, default: null } // Límite de tiempo en segundos
});

module.exports = mongoose.model('Challenge', challengeSchema);
