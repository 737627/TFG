import React, { useEffect } from 'react'; // Asegúrate de importar useEffect
import { useNavigate } from 'react-router-dom';
import './Winner.css';

const Winner = ({ roomCode, socket }) => {
    const navigate = useNavigate();

    const handleNextChallenge = () => {
        navigate(`/challenge2/${roomCode}`); // Redirige al siguiente desafío
    };

    // Escuchar evento del servidor para proceder al siguiente desafío
    useEffect(() => {
        socket.on('proceedToNextChallenge', () => {
            handleNextChallenge();
        });

        return () => {
            socket.off('proceedToNextChallenge');
        };
    }, [socket]);

    return (
        <div className="winner">
            <p>¡Has ganado!</p>
            <button onClick={handleNextChallenge} className="next-challenge-button">
                Ir al Siguiente Desafío
            </button>
        </div>
    );
};

export default Winner;
