// ----- DICTIONNAIRE DES MOTS -----
const mots = {
    "chat": ["chien", "tigre", "lion"],
    "imprimante": ["scanner", "photocopieur", "fax"],
    "ordinateur": ["PC", "Mac", "portable"],
    "téléphone": ["smartphone", "fixe", "portable"],
    "chaise": ["fauteuil", "tabouret", "banc"],
    "table": ["bureau", "console", "chevet"],
    "lampe": ["applique", "lampadaire", "veilleuse"],
    "livre": ["roman", "manuel", "bande dessinée"],
    "stylo": ["crayon", "feutre", "marqueur"],
    "vélo": ["bicyclette", "VTT", "fixie"],
    "voiture": ["berline", "SUV", "cabriolet"],
    "train": ["TGV", "métro", "tramway"],
    "avion": ["hélicoptère", "jet", "ultraléger"],
    "bateau": ["yacht", "canoë", "voilier"],
    "chaussure": ["bottine", "sandale", "sneaker"],
    "t-shirt": ["chemise", "pull", "sweat"],
    "pantalon": ["jean", "short", "legging"],
    "chapeau": ["casquette", "béret", "bob"],
    "montre": ["bracelet", "chronomètre", "gousset"],
    "sac": ["cartable", "sac à dos", "pochette"],
    "ordinateur portable": ["notebook", "ultrabook", "chromebook"],
    "microphone": ["casque", "haut-parleur", "enregistreur"],
    "clavier": ["souris", "trackpad", "manette"],
    "écran": ["moniteur", "projecteur", "TV"],
    "appareil photo": ["caméra", "smartphone", "drone"],
    "casque": ["écouteurs", "bandeau audio", "micro-casque"],
    "route": ["autoroute", "rue", "avenue"],
    "pont": ["viaduc", "passerelle", "pont-levis"],
    "maison": ["villa", "appartement", "chalet"],
    "immeuble": ["gratte-ciel", "bloc", "pavillon"],
    "école": ["lycée", "université", "collège"],
    "bureau": ["open space", "cabinet", "studio"],
    "magasin": ["supermarché", "boutique", "épicerie"],
    "restaurant": ["bistrot", "brasserie", "cantine"],
    "café": ["salon de thé", "espresso", "bar"],
    "forêt": ["bois", "jungle", "bosquet"],
    "montagne": ["colline", "pic", "sommet"],
    "rivière": ["fleuve", "ruisseau", "canal"],
    "lac": ["étang", "mare", "réservoir"],
    "océan": ["mer", "golfe", "baie"],
    "île": ["archipel", "atoll", "cay"],
    "soleil": ["lune", "étoile", "planète"],
    "lune": ["satellite", "astre", "orbite"],
    "étoile": ["supernova", "nébuleuse", "constellation"],
    "nuage": ["brume", "cumulus", "stratus"],
    "pluie": ["averse", "bruine", "ondée"],
    "neige": ["grésil", "flocon", "verglas"],
    "vent": ["bourrasque", "tempête", "brise"],
    "orage": ["tonnerre", "foudre", "averse"],
    "arc": ["arc-en-ciel", "arche", "arbalète"],
    "feu": ["braise", "flamme", "incendie"],
    "eau": ["rivière", "lac", "océan"],
    "terre": ["sol", "argile", "roche"],
    "air": ["atmosphère", "brise", "vent"],
    "chat": ["chaton", "félin", "persan"],
    "chien": ["chiot", "canin", "labrador"],
    "oiseau": ["moineau", "perroquet", "aigle"],
    "poisson": ["saumon", "truite", "requin"],
    "cheval": ["poney", "jument", "étalon"],
    "vache": ["taureau", "veau", "bovin"],
    "cochon": ["porcelet", "sanglier", "truie"],
    "mouton": ["agneau", "brebis", "bélier"],
    "lapin": ["lièvre", "lapereau", "cuniculture"],
    "serpent": ["vipère", "boa", "python"],
    "souris": ["rat", "hamster", "mulot"],
    "tigre": ["lion", "léopard", "panthère"],
    "éléphant": ["mammouth", "rhinocéros", "buffle"],
    "lion": ["tigresse", "lionceau", "guépard"],
    "ours": ["panda", "grizzly", "ours polaire"],
    "grenouille": ["crapaud", "rainette", "têtard"],
    "abeille": ["guêpe", "bourdon", "mouche"],
    "fourmi": ["termitte", "puceron", "coccinelle"],
    "papillon": ["morpho", "piéride", "flambé"],
    "arbre": ["chêne", "sapin", "bouleau"],
    "fleur": ["rose", "tulipe", "orchidée"],
    "plante": ["cactus", "bambou", "fougère"],
    "herbe": ["gazon", "mousse", "pissenlit"],
    "fruit": ["pomme", "banane", "orange"],
    "légume": ["carotte", "tomate", "concombre"],
    "noix": ["amande", "noisette", "cacahuète"],
    "graines": ["tournesol", "lin", "courge"],
    "épice": ["curry", "poivre", "paprika"],
    "viande": ["poulet", "bœuf", "porc"],
    "poisson cru": ["saumon", "thon", "maquereau"],
    "produit laitier": ["lait", "fromage", "yaourt"],
    "boisson": ["eau", "jus", "café"],
    "dessert": ["gâteau", "tarte", "glace"],
    "pain": ["baguette", "brioche", "focaccia"],
    "riz": ["basmati", "japonica", "carnaroli"],
    "pâtes": ["spaghetti", "penne", "tagliatelle"],
    "pizza": ["margherita", "pepperoni", "reine"],
    "hamburger": ["cheeseburger", "veggie burger", "double"],
    "sandwich": ["club", "panini", "baguette"],
    "soupe": ["velouté", "bouillon", "minestrone"],
    "salade": ["cesar", "niçoise", "grecque"],
    "œuf": ["omelette", "œuf dur", "œuf poché"],
    "fromage": ["camembert", "roquefort", "emmental"],
    "beurre": ["margarine", "ghee", "beurre salé"],
    "chocolat": ["noir", "blanc", "au lait"],
    "sucre": ["cassonade", "roux", "glace"],
    "sel": ["fleur de sel", "gros sel", "sel fin"],
    "poivre": ["noir", "blanc", "vert"],
    "huile": ["olive", "tournesol", "colza"],
    "vinaigre": ["balsamique", "cidre", "vin"],
    "céréale": ["blé", "maïs", "avoine"],
    "yaourt": ["grec", "nature", "aux fruits"],
    "lait": ["entier", "demi-écrémé", "écrémé"],
    "jus de fruit": ["orange", "pomme", "ananas"],
    "thé": ["vert", "noir", "blanc"],
    "café": ["expresso", "americano", "latte"],
    "bière": ["blonde", "brune", "rousse"],
    "vin": ["rouge", "blanc", "rosé"],
    "cocktail": ["mojito", "pina colada", "martini"],
    "eau gazeuse": ["pétillante", "plate", "aromatisée"],
    "chocolat chaud": ["lait", "noisette", "cannelle"],
    "pain au chocolat": ["croissant", "chausson", "brioche"],
    "croissant": ["viennoiserie", "pain", "chausson"],
    "brioche": ["pain", "croissant", "pain aux raisins"],
    "glace": ["sorbet", "crème glacée", "parfait"],
    "gâteau": ["éponge", "fondant", "moelleux"],
    "tarte": ["tatin", "aux fruits", "au citron"],
    "muffin": ["cupcake", "brownie", "madeleine"],
    "cookie": ["biscuit", "brownie", "sablé"],
    "brownie": ["chocolat", "noix", "fondant"],
    "bonbon": ["gélifié", "acidulé", "chocolaté"],
    "yaourt glacé": ["frozen yogurt", "sorbet", "soft serve"],
    "pâte à tartiner": ["chocolat", "noisette", "caramel"],
    "confiture": ["fraise", "abricot", "orange"],
    "miel": ["acacia", "châtaignier", "lavande"],
    "beurre de cacahuète": ["crémeux", "crunchy", "naturel"],
    "chips": ["salées", "épices", "barbecue"],
    "popcorn": ["sucré", "salé", "caramel"],
    "noisette": ["amande", "noix", "cacahuète"],
    "amande": ["noix", "pistache", "cacahuète"],
    "pistache": ["noix", "amande", "cacahuète"],
    "cacahuète": ["noix", "amande", "pistache"],
    "tomate": ["cerise", "ronde", "coeur de boeuf"],
    "concombre": ["cornichon", "mini", "anglais"],
    "carotte": ["ronde", "longue", "bio"],
    "courgette": ["verte", "jaune", "rond"],
    "aubergine": ["violette", "allongée", "grande"],
    "poivron": ["rouge", "vert", "jaune"],
    "salade verte": ["laitue", "roquette", "mâche"],
    "épinard": ["frais", "bio", "jeune"],
    "brocoli": ["vert", "fleur", "chou"],
    "chou-fleur": ["blanc", "violet", "bio"],
    "navet": ["blanc", "rond", "long"],
    "oignon": ["jaune", "rouge", "blanc"],
    "ail": ["frais", "sec", "violet"],
    "gingembre": ["frais", "poudre", "confite"],
    "curcuma": ["poudre", "racine", "bio"],
    "cannelle": ["bâton", "poudre", "bio"],
    "clou de girofle": ["entier", "moulu", "bio"],
    "basilic": ["frais", "séché", "gel"],
    "persil": ["plat", "frisé", "frais"],
    "coriandre": ["frais", "séché", "poudre"],
    "menthe": ["frais", "séché", "huile"],
    "romarin": ["frais", "séché", "huile"],
    "thym": ["frais", "séché", "huile"],
    "sauge": ["frais", "séché", "huile"],
    "origan": ["frais", "séché", "huile"],
    "estragon": ["frais", "séché", "huile"],
    "ciboulette": ["frais", "séché", "huile"],
    "aneth": ["frais", "séché", "huile"],
    "lavande": ["fleur", "huile", "bio"],
    "camomille": ["fleur", "tisane", "bio"],
    "verveine": ["fleur", "tisane", "bio"],
    "tilleul": ["fleur", "tisane", "bio"],
    "mélisse": ["fleur", "tisane", "bio"],
    "hibiscus": ["fleur", "tisane", "bio"],
    "rose": ["fleur", "parfum", "bio"],
    "jasmin": ["fleur", "parfum", "bio"],
    "orchidée": ["fleur", "tropicale", "rare"],
    "lotus": ["fleur", "aquatique", "sacré"],
    "nénuphar": ["fleur", "aquatique", "blanc"],
    "lys": ["fleur", "blanc", "royal"],
    "pivoine": ["fleur", "rose", "parfumée"],
    "magnolia": ["fleur", "arbre", "blanc"],
    "camélia": ["fleur", "rose", "arbuste"],
    "bougainvillier": ["fleur", "violette", "arbuste"],
    "hibiscus tropical": ["fleur", "rouge", "exotique"],
    "plante grasse": ["cactus", "aloé", "succulente"],
    "plante verte": ["fougère", "lierre", "monstera"],
    "bonsaï": ["mini", "arbre", "feuillu"],
    "arbre fruitier": ["pommier", "cerisier", "abricotier"],
    "arbre à noix": ["noisetier", "noyer", "cajou"],
    "arbuste": ["buisson", "haie", "arbrisseau"],
    "liane": ["vigne", "lierre", "passiflore"],
    "plante aquatique": ["nénuphar", "lotus", "jonc"],
    "plante aromatique": ["basilic", "persil", "thym"],
    "plante médicinale": ["camomille", "menthe", "lavande"],
    "fleur sauvage": ["pissenlit", "coquelicot", "marguerite"],
    "fleur comestible": ["capucine", "violette", "bourrache"],
    "fruit sec": ["noix", "amande", "pistache"],
    "fruit exotique": ["mangue", "papaye", "fruit de la passion"],
    "fruit rouge": ["fraise", "framboise", "cerise"],
    "fruit jaune": ["banane", "ananas", "citron"],
    "fruit vert": ["kiwi", "pomme verte", "melon"],
    "fruit orange": ["orange", "mandarine", "abricot"],
    "fruit violet": ["raisin", "prune", "myrtille"],
    "fruit bleu": ["myrtille", "sureau", "baie de genièvre"],
    "fruit noir": ["mûre", "cassis", "olive"],
    "fruit blanc": ["litchi", "poire", "pêche blanche"],
    "fruit rond": ["pomme", "orange", "cerise"],
    "fruit allongé": ["banane", "courgette", "concombre"],
    "fruit sec à coque": ["noix", "amande", "noisette"],
    "fruit à noyau": ["pêche", "abricot", "prune"],
    "fruit à pépins": ["pomme", "poire", "coing"],
    "fruit tropical": ["mangue", "ananas", "papaye"],
    "fruit méditerranéen": ["figue", "olive", "grenade"],
    "fruit forestier": ["myrtille", "mûre", "cassis"],
    "fruit des bois": ["fraises", "framboises", "mûres"],
    "fruit à coques": ["amande", "noisette", "noix"],
    "fruit à graines": ["courge", "tournesol", "lin"],
    "fruit sauvage": ["cynorrhodon", "airelle", "mûre"],
    "fruit comestible": ["pomme", "poire", "banane"],
    "fruit non comestible": ["if", "manchineel", "datte de mer"],
    "fruit décoratif": ["glands", "noix", "capsule"],
    "fruit de saison": ["fraise", "abricot", "pomme"],
    "fruit d’hiver": ["orange", "clémentine", "pomme"],
    "fruit d’été": ["melon", "pastèque", "abricot"],
    "fruit d’automne": ["raisin", "pomme", "poire"],
    "fruit d’éte": ["cerise", "pêche", "abricot"],
    "fruit tropical sec": ["coco", "cacahuète", "noix de cajou"],
    "fruit tropical frais": ["mangue", "ananas", "papaye"],
    "fruit acidulé": ["citron", "groseille", "kiwi"],
    "fruit sucré": ["mangue", "fraise", "banane"],
    "fruit amer": ["pamplemousse", "citrus", "angélique"],
    "fruit parfumé": ["vanille", "fraise", "orange"],
    "fruit charnu": ["pêche", "abricot", "prune"],
    "fruit juteux": ["pastèque", "melon", "orange"],
    "fruit sec sucré": ["datte", "figue", "raisin"],
    "fruit sec salé": ["cacahuète", "noix", "amande"],
    "fruit sec amer": ["noix de kola", "noix", "amande"],
    "fruit sec neutre": ["noix de pécan", "amande", "noisette"],
    "fruit séché": ["raisin", "figue", "abricot"],
    "fruit confit": ["cerise", "orange", "citron"],
    "fruit glacé": ["fraise", "myrtille", "banane"],
    "pomme": ["poire", "banane", "raisin"],
    "plage": ["mer", "sable", "océan"],
    "voiture": ["camion", "moto", "bus"],
    "maison": ["appartement", "villa", "cabane"],
    "livre": ["journal", "roman", "magazine"],
    "ordinateur": ["téléphone", "tablette", "écran"],
    "musique": ["chanson", "mélodie", "rythme"],
    "hiver": ["neige", "froid", "glace"],
    "forêt": ["jungle", "bois", "nature"],
    "arbre": ["feuille", "branche", "racine"],
    "eau": ["rivière", "lac", "océan"],
    "feu": ["braise", "flamme", "cendre"],
    "terre": ["sol", "sable", "pierre"],
    "vent": ["bourrasque", "brise", "tempête"],
    "lune": ["astre", "croissant", "pleine"],
    "soleil": ["astre", "rayon", "énergie"],
    "école": ["classe", "professeur", "élève"],
    "stylo": ["crayon", "plume", "marqueur"],
    "voix": ["chant", "cris", "parole"],
    "chien": ["loup", "renard", "coyote"],
    "oiseau": ["aigle", "colombe", "perroquet"],
    "poisson": ["requin", "truite", "saumon"],
    "montagne": ["sommet", "vallée", "cime"],
    "rivière": ["fleuve", "torrent", "ruisseau"],
    "fleur": ["rose", "tulipe", "marguerite"],
    "fruit": ["banane", "pomme", "raisin"],
    "légume": ["carotte", "tomate", "salade"],
    "chocolat": ["noir", "au lait", "blanc"],
    "sucre": ["candy", "miel", "sirop"],
    "mer": ["vague", "plage", "sable"],
    "île": ["continent", "archipel", "lagon"],
    "bateau": ["navire", "canoë", "voilier"],
    "voiture": ["camion", "bus", "moto"],
    "train": ["locomotive", "wagon", "rail"],
    "avion": ["hélicoptère", "drone", "jet"],
    "fusée": ["satellite", "astronaute", "station"],
    "lait": ["fromage", "yaourt", "beurre"],
    "pain": ["baguette", "croissant", "brioche"],
    "riz": ["pâtes", "quinoa", "blé"],
    "viande": ["poulet", "boeuf", "porc"],
    "poivre": ["sel", "curry", "paprika"],
    "chaise": ["table", "bureau", "canapé"],
    "lit": ["matelas", "oreiller", "couette"],
    "porte": ["fenêtre", "mur", "cloison"],
    "fenêtre": ["rideau", "vitre", "balcon"],
    "horloge": ["montre", "cadran", "temps"],
    "soleil": ["lumière", "rayon", "chaleur"],
    "pluie": ["averse", "goutte", "orage"],
    "neige": ["flocon", "glace", "hiver"],
    "nuage": ["ciel", "orage", "brume"],
    "orage": ["tonnerre", "foudre", "pluie"],
    "vent": ["brise", "cyclone", "tempête"],
    "feu": ["flamme", "braise", "incendie"],
    "papier": ["livre", "journal", "affiche"],
    "stylo": ["crayon", "marqueur", "plume"],
    "téléphone": ["portable", "fixe", "smartphone"],
    "ordinateur": ["portable", "PC", "mac"],
    "table": ["chaise", "bureau", "commode"],
    "lampe": ["ampoule", "veilleuse", "lustre"],
    "voiture": ["camion", "bus", "vélo"],
    "route": ["autoroute", "rue", "chemin"],
    "pont": ["passerelle", "viaduc", "ponton"],
    "ville": ["quartier", "rue", "place"],
    "village": ["ferme", "hameau", "bourg"],
    "forêt": ["arbre", "bois", "jungle"],
    "désert": ["sable", "dune", "oasis"],
    "montagne": ["pic", "vallée", "sommet"],
    "rivière": ["fleuve", "torrent", "ruisseau"],
    "lac": ["étang", "mare", "plan d'eau"],
    "océan": ["mer", "vague", "plage"],
    "île": ["archipel", "lagon", "continent"],
    "bateau": ["navire", "canoë", "voilier"],
    "avion": ["hélicoptère", "jet", "drone"],
    "fusée": ["satellite", "astronaute", "station"],
    "chien": ["loup", "renard", "coyote"],
    "chat": ["tigre", "lion", "léopard"],
    "oiseau": ["aigle", "perroquet", "colombe"],
    "poisson": ["truite", "saumon", "requin"],
    "lapin": ["lièvre", "cochon d'inde", "lapereau"],
    "cheval": ["poney", "âne", "mulet"],
    "vache": ["taureau", "veau", "chèvre"],
    "cochon": ["porc", "sanglier", "mini cochon"],
    "souris": ["rat", "mulot", "campagnol"],
    "serpent": ["python", "cobra", "vipère"],
    "grenouille": ["crapaud", "têtard", "rainette"],
    "insecte": ["abeille", "papillon", "coccinelle"],
    "arbre": ["chêne", "sapin", "érable"],
    "fleur": ["rose", "tulipe", "marguerite"],
    "fruit": ["pomme", "banane", "orange"],
    "légume": ["carotte", "tomate", "poivron"],
    "fromage": ["camembert", "roquefort", "brie"],
    "pain": ["baguette", "croissant", "brioche"],
    "boisson": ["eau", "jus", "soda"],
    "café": ["thé", "infusion", "chocolat"],
    "gâteau": ["tarte", "brownie", "flan"],
    "chocolat": ["noir", "au lait", "blanc"],
    "sucre": ["candy", "miel", "sirop"],
    "sel": ["poivre", "curry", "paprika"],
    "épice": ["cannelle", "gingembre", "curcuma"],
    "vêtement": ["chemise", "pantalon", "robe"],
    "chaussure": ["bottes", "sandales", "sneakers"],
    "chapeau": ["casquette", "bonnet", "béret"],
    "bijou": ["collier", "bracelet", "bague"],
    "sac": ["cartable", "sac à dos", "pochette"],
    "lunette": ["soleil", "vue", "goggles"],
    "montre": ["bracelet", "cadran", "chronomètre"],
    "vélo": ["trottinette", "skate", "roller"],
    "moto": ["scooter", "mobylette", "quad"],
    "bateau": ["canoë", "voilier", "péniche"],
    "avion": ["hélicoptère", "jet", "drone"],
    "fusée": ["satellite", "astronaute", "station"],
    "ordinateur": ["PC", "Mac", "portable"],
    "téléphone": ["smartphone", "fixe", "portable"],
    "table": ["chaise", "bureau", "console"],
    "lampe": ["ampoule", "lustre", "veilleuse"],
    "livre": ["roman", "journal", "magazine"],
    "musique": ["chanson", "mélodie", "rythme"],
    "film": ["cinéma", "série", "documentaire"],
    "jeu": ["plateau", "cartes", "vidéo"],
    "sport": ["football", "basket", "tennis"],
    "animal": ["chat", "chien", "oiseau"],
    "plante": ["fleur", "arbre", "herbe"],
    "outil": ["marteau", "tournevis", "scie"],
    "véhicule": ["voiture", "camion", "moto"],
    "train": ["locomotive", "wagon", "rail"],
    "bus": ["minibus", "autocar", "tramway"],
    "moto": ["scooter", "quad", "sidecar"],
    "vélo": ["trottinette", "roller", "bmx"],
    "bateau": ["voilier", "canoë", "péniche"],
    "avion": ["hélicoptère", "jet", "drone"],
    "fusée": ["satellite", "astronaute", "station"],
    "chaise": ["tabouret", "fauteuil", "canapé"],
    "table": ["bureau", "console", "table basse"],
    "lit": ["matelas", "oreiller", "couette"],
    "armoire": ["commode", "étagère", "placard"],
    "porte": ["fenêtre", "cloison", "portail"],
    "fenêtre": ["rideau", "vitre", "volet"],
    "lampe": ["ampoule", "lustre", "veilleuse"],
    "ordinateur": ["PC", "Mac", "portable"],
    "téléphone": ["smartphone", "fixe", "portable"],
    "imprimante": ["scanner", "photocopieur", "fax"],
    "stylo": ["crayon", "marqueur", "plume"],
    "cahier": ["bloc", "agenda", "carnet"],
    "livre": ["roman", "journal", "magazine"],
    "papier": ["feuille", "carton", "papier journal"],
    "musique": ["chanson", "mélodie", "rythme"],
    "film": ["cinéma", "série", "documentaire"],
    "jeu": ["plateau", "cartes", "vidéo"],
    "sport": ["football", "basket", "tennis"],
    "ballon": ["foot", "basket", "volley"],
    "raquette": ["tennis", "badminton", "ping-pong"],
    "chaussure": ["bottes", "sandales", "sneakers"],
    "vêtement": ["chemise", "pantalon", "robe"],
    "chapeau": ["casquette", "béret", "bonnet"],
    "lunette": ["soleil", "vue", "goggles"],
    "montre": ["bracelet", "cadran", "chronomètre"],
    "bijou": ["collier", "bracelet", "bague"],
    "sac": ["cartable", "sac à dos", "pochette"],
    "nourriture": ["fruit", "légume", "viande"],
    "fruit": ["pomme", "banane", "orange"],
    "légume": ["carotte", "tomate", "salade"],
    "viande": ["poulet", "boeuf", "porc"],
    "poisson": ["saumon", "truite", "thon"],
    "boisson": ["eau", "jus", "soda"],
    "café": ["thé", "infusion", "chocolat"],
    "gâteau": ["tarte", "brownie", "flan"],
    "chocolat": ["noir", "au lait", "blanc"],
    "sucre": ["candy", "miel", "sirop"],
    "sel": ["poivre", "curry", "paprika"],
    "épice": ["cannelle", "gingembre", "curcuma"],
    "outil": ["marteau", "tournevis", "scie"],
    "voiture": ["camion", "bus", "moto"],
    "moto": ["scooter", "quad", "sidecar"],
    "vélo": ["trottinette", "roller", "bmx"],
    "bateau": ["voilier", "canoë", "péniche"],
    "avion": ["hélicoptère", "jet", "drone"],
    "fusée": ["satellite", "astronaute", "station"],
    "chien": ["loup", "renard", "coyote"],
    "chat": ["tigre", "lion", "léopard"],
    "oiseau": ["aigle", "perroquet", "colombe"],
    "lapin": ["lièvre", "cochon d'inde", "lapereau"],
    "cheval": ["poney", "âne", "mulet"],
    "vache": ["taureau", "veau", "chèvre"],
    "cochon": ["porc", "sanglier", "mini cochon"],
    "souris": ["rat", "mulot", "campagnol"],
    "serpent": ["python", "cobra", "vipère"],
    "grenouille": ["crapaud", "têtard", "rainette"],
    "insecte": ["abeille", "papillon", "coccinelle"],
    "arbre": ["chêne", "sapin", "érable"],
    "fleur": ["rose", "tulipe", "marguerite"],
    "plante": ["herbe", "mousse", "fougère"],
    "fruit": ["pomme", "banane", "orange"],
    "légume": ["carotte", "tomate", "poivron"],
    "fromage": ["camembert", "roquefort", "brie"],
    "pain": ["baguette", "croissant", "brioche"],
    "boisson": ["eau", "jus", "soda"],
    "café": ["thé", "infusion", "chocolat"],
    "gâteau": ["tarte", "brownie", "flan"],
    "chocolat": ["noir", "au lait", "blanc"],
    "sucre": ["candy", "miel", "sirop"],
    "épice": ["cannelle", "gingembre", "curcuma"],
    "sport": ["football", "basket", "tennis"],
    "jeu": ["plateau", "cartes", "vidéo"],
    "film": ["cinéma", "série", "documentaire"],
    "musique": ["chanson", "mélodie", "rythme"]
};

// ----- INITIALISATION DES VARIABLES -----
let listJoueurs = JSON.parse(localStorage.getItem('joueurs'));

// Fallback si aucun joueur n'est trouvé (pour les tests)
if (!listJoueurs || listJoueurs.length === 0) {
    console.warn("Aucun joueur trouvé ! Utilisation de joueurs tests.");
    listJoueurs = ["Alice", "Bob", "Charlie", "David"];
    localStorage.setItem('joueurs', JSON.stringify(listJoueurs)); // Sauvegarder pour les autres pages
}

const nbJoueurs = listJoueurs.length;
let joueursMots = []; // Ce tableau contiendra les mots/rôles dans l'ordre de listJoueurs

// ----- FONCTIONS UTILITAIRES -----
function melangerTableau(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRolesConfig(nbJoueurs) {
    if (nbJoueurs <= 5) return { taupes: 1, fantomes: 0 };
    if (nbJoueurs >= 6 && nbJoueurs <= 8) return { taupes: 1, fantomes: 1 };
    return { taupes: 2, fantomes: 1 }; // Pour 9 joueurs et plus
}


// ----- DISTRIBUTION DES MOTS -----
function distribuerMots() {
    // Si des mots existent déjà pour le jour actuel, on ne redistribue pas
    if (localStorage.getItem('joueursMots')) {
        joueursMots = JSON.parse(localStorage.getItem('joueursMots'));
        console.log("Mots réutilisés pour le jour en cours.");
        return;
    }

    // --- BLOC DE CODE CORRIGÉ SELON VOTRE PRINCIPE ---

    // 1. Choisir la catégorie (la clé de l'objet)
    const keys = Object.keys(mots);
    const categorieChoisie = keys[Math.floor(Math.random() * keys.length)];

    // 2. Le mot de la Foule est le nom de la catégorie elle-même
    const motPrincipal = categorieChoisie; // Ex: "Plage"

    // 3. Les mots pour la Taupe sont dans le tableau associé à la catégorie
    const motsTaupePossibles = mots[categorieChoisie]; // Ex: ["Vacances", "Sable", "desert"]

    // 4. On en choisit un au hasard pour la Taupe
    const motSimilaire = motsTaupePossibles[Math.floor(Math.random() * motsTaupePossibles.length)];

    console.log("ESPION N°3.1: Catégorie choisie ->", categorieChoisie);
    console.log("ESPION N°3.2: Mots possibles pour la taupe ->", motsTaupePossibles);
  if (!motsTaupePossibles) {
        console.error("ERREUR FATALE: La catégorie '" + categorieChoisie + "' n'a pas de tableau de mots associé ! Vérifiez votre objet 'mots'.");
        return;
    }

    // Le reste de la fonction ne change pas
    let distribution = Array(nbJoueurs).fill(motPrincipal);
    let indices = Array.from({ length: nbJoueurs }, (_, i) => i);
    indices = melangerTableau(indices);

    const { taupes, fantomes } = getRolesConfig(nbJoueurs);

    let cursor = 0;
    // Assigner le(s) Fantôme(s)
    for (let i = 0; i < fantomes; i++) {
        distribution[indices[cursor]] = null;
        cursor++;
    }
    // Assigner la/les Taupe(s)
    for (let i = 0; i < taupes; i++) {
        distribution[indices[cursor]] = motSimilaire;
        cursor++;
    }

    joueursMots = distribution;
    console.log("ESPION N°5: Distribution finale des rôles ->", joueursMots);

    // Debug dans la console pour vérifier que tout fonctionne
    console.log(`Thème du tour : ${motPrincipal}`);
    console.log(`Mot de la Taupe : ${motSimilaire}`);
    console.log("Rôles attribués :", joueursMots);
}

// ----- LOGIQUE D’AFFICHAGE INTERACTIF -----
let current = 0;
const joueurDiv = document.getElementById("joueur");
const motDiv = document.getElementById("mot");
const btnVoir = document.getElementById("voirMot");
const btnSuivant = document.getElementById("suivant");
const boutonContinuer = document.getElementById("monBouton");

function updateUI() {
    if (current >= nbJoueurs) {
        // Fin de la distribution
        joueurDiv.textContent = "Distribution terminée !";
        motDiv.textContent = "Tout le monde a reçu son rôle secret.";
        btnVoir.style.display = "none";
        btnSuivant.style.display = "none";
        boutonContinuer.style.display = "block"; // On affiche le bouton pour continuer
        return;
    }

    joueurDiv.textContent = `Passez le téléphone à ${listJoueurs[current]}`;
    motDiv.textContent = "Prêt à découvrir ton rôle ?";
    btnVoir.style.display = "inline-block";
    btnSuivant.style.display = "none";
    boutonContinuer.style.display = "none"; // On cache le bouton pendant la distribution
}

btnVoir.addEventListener("click", () => {
    const sonMot = joueursMots[current];

    if (sonMot === null) {
        motDiv.textContent = "Tu es le Fantôme ! 👻";
    } else {
        motDiv.textContent = `Ton mot est : ${sonMot}`;
    }
    btnVoir.style.display = "none";
    btnSuivant.style.display = "inline-block";
});

btnSuivant.addEventListener("click", () => {
    current++;
    updateUI();
});

// ----- GESTION DE LA TRANSITION VERS LA PHASE DE JEU -----
boutonContinuer.addEventListener("click", () => {
    // 1. Sauvegarder la liste des joueurs de départ (utile pour la fin de partie et pour rejouer)
    if (!localStorage.getItem('joueursInitiale')) {
        localStorage.setItem('joueursInitiale', JSON.stringify(listJoueurs));
    }

    // 2. Sauvegarder les mots qui viennent d'être distribués
    localStorage.setItem('joueursMots', JSON.stringify(joueursMots));

    // 3. Préparer les variables pour le NOUVEAU jour de jeu
    let maxTours = (listJoueurs.length === 4) ? 2 : 3;
    localStorage.setItem('maxTours', maxTours);
    localStorage.setItem('tourActuel', '1');

    // S'assurer que le jour est bien initialisé (commence à 1)
    const currentDay = Number(localStorage.getItem('day')) || 1;
    localStorage.setItem('day', currentDay);

    // Réinitialiser l'index du joueur qui parle pour la page suivante
    localStorage.setItem('currentJoueurIndex', '0');
    localStorage.setItem('jeuTermine', JSON.stringify(false));

    // 4. Rediriger vers la page des tours de parole
    window.location.href = "lataupe3.html";
});

// ----- DÉMARRAGE DU SCRIPT -----
distribuerMots();
updateUI();