// Configuration de Supabase pour le mode multi-téléphone (WebSockets)
// Remplissez avec vos propres identifiants Supabase.
// Assurez-vous que l'option "Realtime" est bien activée sur votre projet Supabase.

const SUPABASE_CONFIG = {
    url: "https://ziywvyfbcbbtsuypqthu.supabase.co", // URL de votre projet Supabase
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeXd2eWZiY2JidHN1eXBxdGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NjQ3MDYsImV4cCI6MjA5ODA0MDcwNn0.NXW-gvzsq3JkPOZo6zqSkwcrLlk5s7RQ2F-aA0JQzYI"  // Votre clé API anonyme publique
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
