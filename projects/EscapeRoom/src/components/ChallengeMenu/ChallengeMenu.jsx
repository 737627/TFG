import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChallengeMenu.css';

const ChallengeMenu = () => {
  const navigate = useNavigate();

  const handleNavigation = (challengeNumber) => {
    navigate(`/challenge${challengeNumber}`);
  };

  return (
    <div className="challenge-menu-container">
      <h2>Selecciona un Desafío</h2>
      <div className="challenge-buttons">
        <button onClick={() => handleNavigation(1)}>Desafío 1</button>
        <button onClick={() => handleNavigation(2)}>Desafío 2</button>
        <button onClick={() => handleNavigation(3)}>Desafío 3</button>
        <button onClick={() => handleNavigation(4)}>Desafío 4</button>
      </div>
      <div className="menu-options">
        <button onClick={() => navigate('/')}>Menú Principal</button>
        <a href="https://eupt.unizar.es/TFE" target="_blank" rel="noopener noreferrer">
          Información sobre el TFG
        </a>
      </div>
    </div>
  );
};

export default ChallengeMenu;
