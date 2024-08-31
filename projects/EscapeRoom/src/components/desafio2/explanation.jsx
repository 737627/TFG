import React from 'react';

const Explanation = ({ onContinue }) => (
    <div className="explanation-container">
        <div className="explanation">
            <h2>Bienvenido al Desafío 2</h2>
            <p>
                En este desafío, tu objetivo será arrastrar los elementos a sus ubicaciones correctas. Esta actividad simula cómo organizar los componentes esenciales de una propuesta de trabajo, asegurando que cada elemento esté en su lugar adecuado para una presentación clara y coherente.
            </p>
            <p>
                Este ejercicio te ayudará a entender mejor cómo estructurar una propuesta de TFG de manera efectiva. ¡Buena suerte!
            </p>
            <button onClick={onContinue} className="start-challenge-button">
                Comenzar Desafío
            </button>
        </div>
    </div>
);

export default Explanation;
