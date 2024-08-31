import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import StartGame from './StartGame';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import Board from './components/desafio1/board/Board';
import H5PComponentDesafio2 from './components/desafio2/H5PComponent'; 
import Challenge3 from './components/desafio3/Challenge3';
import RenpyGame from './components/desafio4/RenpyGame';
import ChallengeMenu from './components/ChallengeMenu/ChallengeMenu'; // Importa el menú de desafíos
import Leaderboard from './components/leaderboard/Leaderboard'; // Importar el componente Leaderboard
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<StartGame />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />

        {/* Menú de desafíos siempre sin roomCode */}
        <Route path="/menu" element={<ChallengeMenu />} /> 

        {/* Rutas para el Board */}
        <Route path="/challenge1/:roomCode" element={<Board />} /> {/* Ruta con roomCode */}
        <Route path="/challenge1" element={<Board />} /> {/* Ruta sin roomCode */}

        {/* Rutas para Challenge 2 */}
        <Route path="/challenge2/:roomCode" element={<H5PComponentDesafio2 h5pFilePath="/h5p/desafio2" />} /> {/* Ruta con roomCode */}
        <Route path="/challenge2" element={<H5PComponentDesafio2 h5pFilePath="/h5p/desafio2" />} /> {/* Ruta sin roomCode */}

        {/* Rutas para Challenge 3 */}
        <Route path="/challenge3/:roomCode" element={<Challenge3 />} /> {/* Ruta con roomCode */}
        <Route path="/challenge3" element={<Challenge3 />} /> {/* Ruta sin roomCode */}

        {/* Rutas para Challenge 4 */}
        <Route path="/challenge4/:roomCode" element={<RenpyGame />} /> {/* Ruta con roomCode */}
        <Route path="/challenge4" element={<RenpyGame />} /> {/* Ruta sin roomCode */}

        {/* Ruta para Leaderboard */}
        <Route path="/leaderboard/:roomCode" element={<Leaderboard />} /> {/* Ruta con roomCode */}
      </Routes>
    </Router>
  );
};

export default App;
