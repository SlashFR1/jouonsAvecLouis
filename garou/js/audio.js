const AudioManager = {
    sounds: {
        nuit: new Audio('audio/nuit.mp3'),
        jour: new Audio('audio/jour.mp3'),
        //mort: new Audio('audio/mort.mp3'),
        voleur: new Audio('audio/voleur.mp3'),
        cupidon: new Audio('audio/cupidon.mp3'),
        amoureux: new Audio('audio/amoureux.mp3'),
        voyante: new Audio('audio/voyante.mp3'),
        loups: new Audio('audio/loups.mp3'),
        loup_blanc: new Audio('audio/loup_blanc.mp3'),
        sorciere: new Audio('audio/sorciere.mp3'),
        protecteur: new Audio('audio/protecteur.mp3'),
    },

    play: function(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }
};