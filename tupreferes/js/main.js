// Liste des mots (à personnaliser)
  function toggleMenu() {
    const nav = document.getElementById("main-nav");
    nav.classList.toggle("active");
  }

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
