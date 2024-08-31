import React from 'react';
import './explanation.css';

const Explanation = ({ onContinue }) => (
    <div className="explanation-container">
        <div className="explanation">
            <h2>Bienvenido al Desafío 1</h2>
            <p>
                En este desafío, deberás organizar las imágenes que representan los pasos para realizar un Trabajo de Fin de Grado (TFG) en el orden correcto, de izquierda a derecha. Tu objetivo es seguir la secuencia correcta para completar el proceso.
            </p>
            <p>
                Si necesitas más información sobre los pasos, puedes hacer clic en el botón de información. ¡Buena suerte!
            </p>
            <button onClick={onContinue} className="start-challenge-button">
                Comenzar Desafío
            </button>
        </div>
    </div>
);

export default Explanation;
