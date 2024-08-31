const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Crear una nueva sala
router.post('/create', async (req, res) => {
  const room = new Room();

  try {
    const newRoom = await room.save();
    res.status(201).json({ token: newRoom.token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Unirse a una sala existente
router.post('/join', async (req, res) => {
  const { token, playerId } = req.body;

  try {
    const room = await Room.findOne({ token });

    if (!room) {
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'La sala está llena' });
    }

    room.players.push(playerId);
    await room.save();

    res.status(200).json({ message: 'Unido a la sala correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
