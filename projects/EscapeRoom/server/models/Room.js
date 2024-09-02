const mongoose = require('mongoose');

// Esquema de jugador modificado con 'persistentId'
const playerSchema = new mongoose.Schema({
  id: String, // ID del socket, puede cambiar con cada conexión
  persistentId: String, // ID persistente, único para cada jugador a lo largo de la sesión
  name: String,
  isReady: { type: Boolean, default: false }
});

// Esquema de sala modificado con 'arrivalOrder'
const roomSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  players: [playerSchema], // Almacenar más detalles de cada jugador
  maxPlayers: { type: Number, default: 4 },
  state: { type: String, enum: ['open', 'inProgress', 'closed'], default: 'open' }, // Estado de la sala
  arrivalOrder: { type: [String], default: [] } // Nuevo campo para el orden de llegada de los jugadores
});

// Exportar el modelo Room, asegurándose de no recompilar si ya está definido
module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
