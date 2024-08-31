const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: String, // ID del socket o identificador único
  name: String,
  isReady: { type: Boolean, default: false },
  startTime: { type: Date, default: null }, // Tiempo de inicio del cronómetro para cada jugador
  endTime: { type: Date, default: null },   // Tiempo de finalización del cronómetro para cada jugador
  totalTime: { type: Number, default: 0 }   // Tiempo total empleado en milisegundos
});

const roomSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  players: [playerSchema], // Almacenar más detalles de cada jugador
  maxPlayers: { type: Number, default: 4 },
  state: { type: String, enum: ['open', 'inProgress', 'closed'], default: 'open' }, // Estado de la sala
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null }
});

// Usa una condición para verificar si el modelo ya está compilado
module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
