// DANS LE FICHIER js/audio.js

const AudioManager = {
    sounds: {
        nuit: new Audio('audio/nuit.mp3'),
        jour: new Audio('audio/jour.mp3'),
        cupidon: new Audio('audio/cupidon.mp3'),
        protecteur: new Audio('audio/protecteur.mp3'),
        voyante: new Audio('audio/voyante.mp3'),
        loups: new Audio('audio/loups.mp3'),
        loup_blanc: new Audio('audio/loup_blanc.mp3'),
        sorciere: new Audio('audio/sorciere.mp3'),
        voleur: new Audio('audio/voleur.mp3'),
    },

    currentSound: null, // Pour se souvenir du son en cours

    // La fonction play est maintenant "asynchrone"
    play: function(soundName) {
        return new Promise((resolve) => {
            // Si un son est déjà en train de jouer, on le coupe
            if (this.currentSound) {
                this.currentSound.pause();
                this.currentSound.currentTime = 0;
            }

            const sound = this.sounds[soundName];
            if (sound) {
                this.currentSound = sound; // On mémorise le nouveau son
                sound.currentTime = 0;

                // Quand le son est terminé, la promesse se résout
                sound.onended = () => {
                    this.currentSound = null;
                    resolve();
                };

                sound.play().catch(e => {
                    console.error(`Erreur audio sur ${soundName}:`, e);
                    this.currentSound = null;
                    resolve(); // On résout même en cas d'erreur pour ne pas bloquer le jeu
                });
            } else {
                console.warn(`Son non trouvé: ${soundName}`);
                resolve(); // On résout pour ne pas bloquer le jeu
            }
        });
    }
};