import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importar Font Awesome

const TargetPractice = () => {
  const [reactionTime, setReactionTime] = useState(null);
  const [score, setScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Temporizador del juego
  const [timerActive, setTimerActive] = useState(false);
  const [target, setTarget] = useState(null); // Cambio de circle a target para mayor claridad
  const [level, setLevel] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Función para obtener una posición aleatoria
  const getRandomPosition = () => {
    const top = Math.floor(Math.random() * (window.innerHeight - 100)); // Evitar que el objetivo salga de la pantalla
    const left = Math.floor(Math.random() * (window.innerWidth - 100)); // Evitar que el objetivo salga de la pantalla
    return { top, left };
  };

  // Iniciar el juego
  const startGame = () => {
    setScore(0);
    setReactionTime(null);
    setIsGameStarted(true);
    setTimeLeft(30);
    setTimerActive(true);
    setStartTime(Date.now());

    // Configura el tiempo para el nivel (10, 5, 2 segundos)
    const intervalTime = level === 1 ? 10000 : level === 2 ? 5000 : 2000;

    // Crear el primer objetivo
    createNewTarget(intervalTime);
  };

  // Crear un nuevo objetivo en una posición aleatoria
  const createNewTarget = useCallback(
    (intervalTime) => {
      const size = Math.floor(Math.random() * (100 - 30) + 30); // Tamaños entre 30 y 100px
      const targetColor = ["#ff9900", "#66ccff", "#ff6666"][
        Math.floor(Math.random() * 3)
      ]; // Colores aleatorios

      const newTarget = {
        position: getRandomPosition(),
        size: size, // Tamaño aleatorio
        color: targetColor, // Color aleatorio
        id: Date.now() + Math.random(),
      };

      setTarget(newTarget);

      setTimeout(() => {
        if (target?.id === newTarget.id) {
          setTarget(null);
          createNewTarget(intervalTime); // El siguiente objetivo sale más rápido
        }
      }, intervalTime);
    },
    [target]
  );

  // Manejar el clic en el objetivo
  const onClickTarget = () => {
    if (target !== null && startTime !== null) {
      const reaction = Date.now() - startTime;
      setReactionTime(reaction);
      setScore((prev) => prev + 1);

      // Mostrar la notificación solo al final del juego
      setTarget(null);
      createNewTarget(level === 1 ? 10000 : level === 2 ? 5000 : 2000); // Aparece el nuevo objetivo según el intervalo
      setStartTime(Date.now());
    }

    if (!timerActive) {
      setTimerActive(true); // Activar el temporizador cuando se hace el primer clic
    }
  };

  // Temporizador de cuenta regresiva para el tiempo restante
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [timeLeft, timerActive]);

  useEffect(() => {
    if (timeLeft === 0 && reactionTime !== null) {
      toast(
        `¡Juego terminado! Tu puntuación es ${score} y tu tiempo de reacción promedio fue: ${reactionTime} ms`,
        {
          type: "success",
          autoClose: 5000,
        }
      );
    }
  }, [timeLeft, reactionTime, score]);

  // Función para regresar al inicio (volver a la pantalla de selección)
  const goHome = () => {
    setIsGameStarted(false);
    setLevel(null);
    setScore(0);
    setTimeLeft(30);
    setTimerActive(false);
    setTarget(null);
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-gray-900 text-white relative px-4 md:px-8">
      {/* Menú para seleccionar el nivel */}
      {!isGameStarted ? (
        <div className="text-center mb-8 z-10 mt-32">
          <h1 className="text-3xl font-bold">¡Selecciona tu nivel!</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setLevel(1)}
              className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-400 transition"
            >
              Nivel 1 (Desaparece cada 10 segundos)
            </button>
            <button
              onClick={() => setLevel(2)}
              className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-400 transition"
            >
              Nivel 2 (Desaparece cada 5 segundos)
            </button>
            <button
              onClick={() => setLevel(3)}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-400 transition"
            >
              Nivel 3 (Desaparece cada 2 segundos)
            </button>
          </div>
          {level && (
            <button
              onClick={startGame}
              className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-400 transition"
            >
              Comenzar Juego
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-between mt-4 w-full z-10 fixed top-4 left-4 px-4">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-lg md:text-xl">Puntuación: {score}</p>
              <button onClick={goHome} className="ml-4 text-3xl text-white">
                <i className="fas fa-home"></i>
              </button>
            </div>
            {/* Aquí agregamos 'mr-4' para separar más el texto */}
            <p className="text-lg md:text-xl mr-4">
              Tiempo restante: {timeLeft} segs
            </p>
          </div>
        </div>
      )}

      {/* Pantalla con el objetivo activo */}
      {target !== null && (
        <i
          className="absolute cursor-pointer text-2xl md:text-4xl"
          style={{
            top: `${target.position.top}px`,
            left: `${target.position.left}px`,
            fontSize: `${target.size}px`, // Tamaño variable
            color: target.color, // Color aleatorio
            transform: "translate(-50%, -50%)", // Centrado
          }}
          onClick={onClickTarget}
        >
          <i className="fas fa-user"></i>{" "}
          {/* Icono de persona de Font Awesome */}
        </i>
      )}

      {/* Mensaje cuando el tiempo haya terminado */}
      {timeLeft === 0 && (
        <p className="mt-8 text-2xl font-semibold text-yellow-400 z-10">
          ¡Juego terminado! Tu puntuación es {score}
        </p>
      )}
    </div>
  );
};

export default TargetPractice;
