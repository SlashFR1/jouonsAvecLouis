const AudioManager = {
    
    backgroundMusic: new Audio('audio/loupGarouBS.mp3'),
    isInitialized: false,

    
    init() {
        if (this.isInitialized) return;

        this.backgroundMusic.loop = true;      
        this.backgroundMusic.volume = 0.3;     
        this.isInitialized = true;
    },

    
    play() {
        
        this.backgroundMusic.play().catch(e => {
            console.warn("La lecture automatique de la musique a été bloquée. Elle démarrera après une interaction de l'utilisateur.");
        });
    },

    
    pause() {
        this.backgroundMusic.pause();
    },

    
    resume() {
        this.backgroundMusic.play().catch(e => console.error("Erreur à la reprise de la musique :", e));
    }
};