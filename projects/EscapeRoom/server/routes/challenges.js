const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Obtener todos los desafíos
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear un nuevo desafío
router.post('/', async (req, res) => {
  const challenge = new Challenge({
    title: req.body.title,
    description: req.body.description,
    hints: req.body.hints,
    solution: req.body.solution,
    type: req.body.type,
    data: req.body.data
  });

  try {
    const newChallenge = await challenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtener un desafío específico
router.get('/:id', getChallenge, (req, res) => {
  res.json(res.challenge);
});

// Middleware para obtener un desafío por ID
async function getChallenge(req, res, next) {
  let challenge;
  try {
    challenge = await Challenge.findById(req.params.id);
    if (challenge == null) {
      return res.status(404).json({ message: 'No se encontró el desafío' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.challenge = challenge;
  next();
}

module.exports = router;
