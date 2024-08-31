import React from 'react';

const Challenge4Explanation = ({ onContinue }) => (
    <div className="explanation-container">
        <div className="explanation">
            <h2>Bienvenido al Desafío 4</h2>
            <p>
                En este desafío, te sumergirás en un juego interactivo de Ren'Py que simula la presentación de tu Trabajo de Fin de Grado (TFG). Completa las tareas y sigue la historia para avanzar en el proceso de defensa de tu TFG.
            </p>
            <p>
                Recuerda prestar atención a los detalles y tomar decisiones cuidadosamente para lograr una presentación exitosa. ¡Buena suerte y disfruta el juego!
            </p>
            <button onClick={onContinue} className="start-challenge-button">
                Comenzar Desafío
            </button>
        </div>
    </div>
);

export default Challenge4Explanation;
