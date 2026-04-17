import { useState, useEffect, useRef } from 'react';
import './index.css';

const scenes = [
  {
    image: "/assets/Imágen1.jpeg",
    text: "sólo un compartimiento estaba ocupado por un hombre, un hombre rubio que no apartó la mirada de un libro cuando ella cruzaba por allí."
  },
  {
    image: "/assets/Imágen2.jpeg",
    text: "Frente a ella estaba la puerta del próximo vagón."
  },
  {
    image: "/assets/Imágen3.jpeg",
    text: "Una vez adentro dio unos pasos. Una especie de presentimiento hizo que siguiese caminando a través de aquel vagón. No se había equivocado. No había nadie. Hacia el final, la ganó un ligero desconcierto. ¿Cómo era posible que estuviese vacío? No sabía si eso era mejor o peor."
  },
  {
    image: "/assets/Imágen4.jpeg",
    text: "En el primer compartimiento no había nadie. Pero en el segundo vio a una mujer que llevaba un niño en brazos. La mujer apenas torció ligeramente la cabeza cuando ella pasó por allí. Siguió."
  },
  {
    image: "/assets/Imágen5.jpeg",
    text: "En el cuarto, un sacerdote se hallaba repantigado sobre las butacas. Al verla comenzó a incorporarse, pero ella aceleró el paso. Prefería que nadie pudiese mirarla por mucho tiempo."
  },
  {
    type: 'dark',
    text: "Todo parecía más silencioso allí, o más oscuro... No alcanzó a concluir ese pensamiento cuando vio que se trataba de las lámparas, que comenzaban a debilitarse, otra vez. Pero la oscuridad, ahora, era absoluta."
  },
  {
    type: 'dark',
    text: "A tientas, buscó la puerta del primer compartimiento.\nCuando al fin la tocó, se deslizó hacia el interior tratando de alcanzar una de las butacas. Fue en ese momento, cuando acababa de sentarse, que la escuchó.\nSonaba muy cerca de ella, como si el aliento de aquella voz pudiera rozarla:\n—Por lo visto viajaremos a oscuras esta noche...\nLa mujer sintió que su corazón se detenía."
  },
  {
    type: 'bounceText',
    text: "¡Ahora te toca a vos!"
  },
  {
    type: 'question',
    text: "¿Quién está en el compartimiento con Emma?"
  },
  {
    type: 'choice',
    options: [
      { id: 'detective', name: 'Detective', image: '/assets/detective.jpeg' },
      { id: 'psiquico', name: 'Psíquico', image: '/assets/Psiquico.jpeg' },
      { id: 'helen', name: 'Helen', image: '/assets/Helen.jpeg' },
      { id: 'otro', name: 'Otro', image: null }
    ]
  },
  {
    type: 'finalQuestions',
    questions: [
      "¿Cómo sabe esta persona lo que hizo Emma?",
      "¿Cómo subió al tren?",
      "¿Qué pasa ahora?"
    ]
  }
];

// Helper to reveal text letter by letter
const TypewriterText = ({ text, onComplete, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, onComplete, speed]);

  return <span className="dialog-text">{displayedText}</span>;
};

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Audio References
  const suspenseAudioRef = useRef(null);
  const trainAudioRef = useRef(null);
  const footstepsAudioRef = useRef(null);

  useEffect(() => {
    scenes.forEach(scene => {
      if (scene.image) {
        const img = new Image();
        img.src = scene.image;
      }
      if (scene.options) {
        scene.options.forEach(opt => {
          if (opt.image) {
            const img = new Image();
            img.src = opt.image;
          }
        });
      }
    });
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    // Play sound engines on start screen
    if (suspenseAudioRef.current) {
      suspenseAudioRef.current.volume = 0.5;
      suspenseAudioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    }
    if (trainAudioRef.current) {
      trainAudioRef.current.volume = 0.3;
      trainAudioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    }
  };

  const isChoiceScene = currentScene < scenes.length && scenes[currentScene].type === 'choice';
  
  const handleNext = () => {
    if (isChoiceScene) return; // Must select option, no fast tap skip

    if (!textComplete) {
      setTextComplete(true);
      return;
    }
    
    if (currentScene < scenes.length) {
      // Play footstep sound effect on standard transitions (not final)
      if (footstepsAudioRef.current && scenes[currentScene].type !== 'finalQuestions') {
        footstepsAudioRef.current.currentTime = 0;
        footstepsAudioRef.current.volume = 0.7;
        footstepsAudioRef.current.play().catch(e => console.log('Audio play blocked', e));
      }

      setCurrentScene(prev => prev + 1);
      setTextComplete(false);
      setImageLoaded(false);
    }
  };

  const handleChoiceSelection = (id) => {
    setCurrentScene(prev => prev + 1);
    setTextComplete(false);
    setImageLoaded(false);
  };

  const isEnd = currentScene >= scenes.length;

  if (!hasStarted) {
    return (
      <div className="start-screen" onClick={handleStart}>
        <div className="pulse-circle"></div>
        <h1 className="start-title">La pasajera del tren</h1>
        <p className="start-subtitle">Toca la pantalla para comenzar</p>
        <p className="start-hint">Asegúrate de tener el volumen encendido</p>
        
        <audio ref={suspenseAudioRef} src="https://actions.google.com/sounds/v1/horror/ambient_horror_drone.ogg" loop />
        <audio ref={trainAudioRef} src="https://actions.google.com/sounds/v1/transportation/railroad_track.ogg" loop />
        <audio ref={footstepsAudioRef} src="https://actions.google.com/sounds/v1/foley/footsteps_on_concrete.ogg" />
      </div>
    );
  }

  if (isEnd) {
    return (
      <div className="end-screen">
        <h1 className="end-text">Fin</h1>
      </div>
    );
  }

  const scene = scenes[currentScene];

  const renderSceneContent = () => {
    switch (scene.type) {
      case 'dark':
        return (
          <div className="dark-scene fade-in">
            <div className="dialog-overlay dark-mode-dialog">
              {textComplete ? (
                <span className="dialog-text dark-text">{scene.text}</span>
              ) : (
                <TypewriterText text={scene.text} onComplete={() => setTextComplete(true)} />
              )}
              {(textComplete) && <div className="next-indicator">▾</div>}
            </div>
          </div>
        );
      case 'bounceText':
        return (
          <div className="bounce-scene flex-center">
            <h1 className="bouncing-text">{scene.text}</h1>
            <div className="prompt-continue">Toca para continuar</div>
          </div>
        );
      case 'question':
        return (
          <div className="question-scene flex-center fade-in">
            <h2 className="question-text">{scene.text}</h2>
            <div className="prompt-continue">▾</div>
          </div>
        );
      case 'choice':
        return (
          <div className="choice-scene flex-center fade-in">
            <h2 className="choice-title">Elige una opción</h2>
            <div className="choice-grid">
              {scene.options.map(opt => (
                <div key={opt.id} className="choice-card" onClick={(e) => {
                  e.stopPropagation();
                  handleChoiceSelection(opt.id);
                }}>
                  <div className="card-image-wrapper">
                    {opt.image ? <img src={opt.image} alt={opt.name} /> : <div className="no-image">?</div>}
                  </div>
                  <h3>{opt.name}</h3>
                </div>
              ))}
            </div>
          </div>
        );
      case 'finalQuestions':
        return (
          <div className="final-scene flex-center fade-in">
            {scene.questions.map((q, idx) => (
              <h2 key={idx} className="final-question-text" style={{ animationDelay: `${idx * 2}s` }}>
                {q}
              </h2>
            ))}
          </div>
        );
      default:
        // Default visual novel screen
        return (
          <>
            <img 
              key={scene.image} // Force re-render relative animation
              src={scene.image} 
              alt={`Escena`} 
              className={`background-image ${imageLoaded ? 'loaded' : ''}`} 
              onLoad={() => setImageLoaded(true)}
            />
            
            <div className="dialog-overlay">
              {textComplete ? (
                <span className="dialog-text">{scene.text}</span>
              ) : (
                <TypewriterText 
                  text={scene.text} 
                  onComplete={() => setTextComplete(true)} 
                />
              )}
              {(textComplete || currentScene >= 0) && (
                <div className="next-indicator">▾</div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="visual-novel-container" onClick={handleNext}>
      <audio ref={suspenseAudioRef} src="https://actions.google.com/sounds/v1/horror/ambient_horror_drone.ogg" loop />
      <audio ref={trainAudioRef} src="https://actions.google.com/sounds/v1/transportation/railroad_track.ogg" loop />
      <audio ref={footstepsAudioRef} src="https://actions.google.com/sounds/v1/foley/footsteps_on_concrete.ogg" />

      {renderSceneContent()}
    </div>
  );
}

export default App;
