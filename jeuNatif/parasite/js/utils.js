// utils.js
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const StorageService = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Sauvegarde effectuée.");
    },
    load: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};