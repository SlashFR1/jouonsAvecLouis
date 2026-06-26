// Configuration de Supabase pour le mode multi-téléphone (WebSockets)
// Remplissez avec vos propres identifiants Supabase.
// Assurez-vous que l'option "Realtime" est bien activée sur votre projet Supabase.

const SUPABASE_CONFIG = {
    url: "https://ziywvyfbcbbtsuypqthu.supabase.co", // URL de votre projet Supabase
    key: "sb_publishable_BIKM6kixJOmF9uh1Tlyg-A_oefirOIG"  // Votre clé API anonyme publique
};

// Message d'avertissement si non configuré
if (typeof window !== 'undefined' && (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key)) {
    console.warn(
        "%c⚠️ Configuration Supabase manquante %c\n" +
        "Pour utiliser le mode multi-téléphones, veuillez ouvrir le fichier 'supabase-config.js' " +
        "et y copier l'URL de votre projet ainsi que votre clé anon API publique.",
        "background: #e74c3c; color: white; padding: 3px 5px; font-weight: bold; border-radius: 3px;",
        "color: inherit;"
    );
}
