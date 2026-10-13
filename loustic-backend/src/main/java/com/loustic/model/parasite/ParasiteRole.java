package com.loustic.model.parasite;

public enum ParasiteRole {
    COLON("Colon", ParasiteCamp.COLONIE, "Membre innocent de la colonie. Aucune compétence spéciale, comptez sur votre flair pour débusquer les envahisseurs."),
    SCIENTIFIQUE("Scientifique", ParasiteCamp.COLONIE, "Chaque nuit, vous analysez un habitant pour révéler son camp véritable (Colonie ou Alien)."),
    MEDECIN("Médecin", ParasiteCamp.COLONIE, "Vous possédez 1 sérum de guérison pour sauver la cible des aliens et 1 sérum létal pour éliminer un suspect."),
    GARDE("Garde", ParasiteCamp.COLONIE, "Chaque nuit, vous protégez 1 joueur des attaques aliens. Interdiction de protéger la même personne 2 nuits de suite."),
    INGENIEUR("Ingénieur", ParasiteCamp.COLONIE, "Si vous mourez, vous emportez immédiatement dans votre explosion un joueur de votre choix !"),
    OFFICIER("Officier", ParasiteCamp.COLONIE, "La 1ère nuit, vous liez 2 joueurs par les liens sacrés de l'amour : si l'un meurt, l'autre succombe sur le coup."),
    ALIEN("Alien", ParasiteCamp.ALIENS, "Chaque nuit, vous votez en secret avec vos congénères aliens pour éliminer un membre de la colonie."),
    ALPHA("Alpha", ParasiteCamp.ALPHA, "Vous jouez avec les aliens, mais les nuits paires (2, 4...) vous pouvez dévorer un autre joueur. Vous gagnez seul si vous êtes le dernier survivant !"),
    ANDROID("Android", ParasiteCamp.INCONNU, "La 1ère nuit, vous pouvez échanger votre identité avec celle d'un autre rôle.");

    private final String displayName;
    private final ParasiteCamp camp;
    private final String description;

    ParasiteRole(String displayName, ParasiteCamp camp, String description) {
        this.displayName = displayName;
        this.camp = camp;
        this.description = description;
    }

    public String getDisplayName() { return displayName; }
    public ParasiteCamp getCamp() { return camp; }
    public String getDescription() { return description; }
}
