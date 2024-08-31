import React from 'react';
import './explanation.css';


const Challenge3Explanation = ({ onContinue }) => (
    <div className="explanation-container">
        <div className="explanation">
            <h2>Bienvenido al Desafío 3</h2>
            <p>
                En este desafío, deberás responder correctamente a una serie de preguntas relacionadas con el proceso de entrega y defensa del Trabajo de Fin de Grado (TFG).
            </p>
            <p>
                Lee cada pregunta con atención y selecciona la respuesta correcta. Solo avanzando correctamente podrás completar este desafío. ¡Buena suerte!
            </p>
            <button onClick={onContinue} className="start-challenge-button">
                Comenzar Desafío
            </button>
        </div>
    </div>
);

export default Challenge3Explanation;
