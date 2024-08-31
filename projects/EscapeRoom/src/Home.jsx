import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';  // Importing the CSS file

const Home = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/start');
  };

  return (
    <div className="home-container">
      <h1>Bienvenido al Escape Room Digital</h1>
      <p className="intro-text">¡Prepárate para desafiar tu mente y descubrir los secretos ocultos en nuestro Escape Room Digital!</p>
      <button onClick={handleStartGame} className="start-button">Iniciar Juego</button>
    </div>
  );
};

export default Home;
