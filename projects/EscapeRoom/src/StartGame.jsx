import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartGame.css';

const StartGame = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create');
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div className="start-game-container">
      <h1>Elige una opción</h1>
      <button onClick={handleCreateRoom} className="create-room-button">Crear Sala</button>
      <button onClick={handleJoinRoom} className="join-room-button">Unirse a Sala</button>
    </div>
  );
};

export default StartGame;
