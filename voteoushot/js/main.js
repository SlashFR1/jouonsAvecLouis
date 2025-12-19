
    
    let index = 0;
    function changeWord() {
        const motEl = document.getElementById("words");
        motEl.classList.add("fade-out");

        setTimeout(() => {
            // choisir un mot aléatoire différent du mot actuel
            let newWord;
            do {
                newWord = words[Math.floor(Math.random() * words.length)];
            } while (newWord === motEl.textContent);

            motEl.textContent = newWord;
            motEl.classList.remove("fade-out");
            motEl.classList.add("fade-in");

            setTimeout(() => motEl.classList.remove("fade-in"), 400);
        }, 400);
    }

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }

    const btn = document.querySelector('button');
    btn.addEventListener('click', () => {
        createConfetti();
    });






