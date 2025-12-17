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

// ----- PARAMÈTRES DU JEU -----
// On récupère la liste. Si elle n'existe pas, on met des joueurs fictifs pour tester.
let listJoueurs = JSON.parse(localStorage.getItem('joueurs'));

// SÉCURITÉ : Si aucune liste n'est trouvée, on avertit ou on met des données de test
if (!listJoueurs || listJoueurs.length === 0) {
    console.warn("Aucun joueur trouvé dans le localStorage ! Utilisation de joueurs tests.");
    listJoueurs = ["Alice", "Bob", "Charlie", "David"]; // Joueurs par défaut pour tester
}

const nbJoueurs = listJoueurs.length;
let joueursMots = []; 

// Fonction pour mélanger un tableau (Algorithme de Fisher-Yates) - Vraiment aléatoire
function melangerTableau(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ----- DISTRIBUTION DES MOTS -----
function distribuerMots() {
    // Vérifier si des mots sont déjà attribués pour ce jour
    const joueursMotsStored = localStorage.getItem('joueursMots');
    const dayStored = localStorage.getItem('day');
    
    // Si on a des mots en cache et qu'on n'a pas changé de jour, les réutiliser
    if (joueursMotsStored && dayStored) {
        const storedMots = JSON.parse(joueursMotsStored);
        const storedDay = Number(dayStored);
        // Si les mots viennent du même jour, on les garde
        if (Array.isArray(storedMots) && storedMots.length === nbJoueurs) {
            joueursMots = storedMots;
            console.log("Mots réutilisés du jour", storedDay);
            return;
        }
    }
    
    // Sinon, générer une nouvelle distribution
    // 1. Choisir les mots
    const keys = Object.keys(mots);
    const categorie = keys[Math.floor(Math.random() * keys.length)];
    const motPrincipal = mots[categorie][0]; // Le premier mot est le principal
    const motSimilaire = mots[categorie][1]; // Le deuxième est pour la taupe

    // 2. Créer les rôles
    // Par défaut, tout le monde a le mot principal
    let distribution = Array(nbJoueurs).fill(motPrincipal);

    // 3. Créer une liste d'index mélangée [0, 1, 2, 3...]
    let indices = Array.from({length: nbJoueurs}, (_, i) => i);
    indices = melangerTableau(indices);

    // 4. Assigner le Fantôme (Index 0 du mélange)
    // Le fantôme n'a pas de mot (null)
    const indexFantome = indices[0];
    distribution[indexFantome] = null; 

    // 5. Assigner la Taupe (Index 1 du mélange)
    const nbTaupes = nbJoueurs > 6 ? 2 : 1; // 2 taupes si plus de 6 joueurs
    
    for(let i = 1; i <= nbTaupes; i++) {
        // Attention : Dans le vrai jeu, la taupe NE SAIT PAS qu'elle est la taupe.
        // Elle voit juste un mot différent. J'ai enlevé "La Taupe :" pour plus de fun,
        // mais tu peux le remettre si tu veux.
        distribution[indices[i]] = motSimilaire; 
    }

    joueursMots = distribution;
    
    // Debug dans la console pour vérifier
    console.log("Joueurs :", listJoueurs);
    console.log("Rôles attribués (dans l'ordre) :", joueursMots);
}

// ----- LOGIQUE D’AFFICHAGE -----
let current = 0;
const joueurDiv = document.getElementById("joueur");
const motDiv = document.getElementById("mot");
const btnVoir = document.getElementById("voirMot");
const btnSuivant = document.getElementById("suivant");

// Mise à jour de l'interface
function updateUI() {
    if (current >= nbJoueurs) {
        // Fin du tour de table
        joueurDiv.textContent = "Distribution terminée !";
        motDiv.textContent = "Le jeu commence...";
        btnVoir.style.display = "none";
        btnSuivant.style.display = "none";
        
        // Optionnel : Redirection automatique après quelques secondes
        // setTimeout(() => window.location.href = "jeu.html", 2000);
        return;
    }

    joueurDiv.textContent = listJoueurs[current];
    motDiv.textContent = "Prêt ?";
    btnVoir.style.display = "inline-block";
    btnSuivant.style.display = "none";
}

btnVoir.addEventListener("click", () => {
    const sonMot = joueursMots[current];
    if (sonMot === null) {
        motDiv.textContent = "Tu es le Fantôme ! 👻";
    } else {
        motDiv.textContent = sonMot;
    }
    btnVoir.style.display = "none";
    btnSuivant.style.display = "inline-block";
});

btnSuivant.addEventListener("click", () => {
    current++;
    updateUI();
});

// Bouton retour : on s'assure que l'élément existe avant d'attacher l'événement
const _monBouton = document.getElementById("monBouton");
if (_monBouton) {
    _monBouton.addEventListener("click", () => {
        // Sauvegarde des mots attribués pour que les autres pages y accèdent
        localStorage.setItem('joueursMots', JSON.stringify(joueursMots));
        // Initialiser le compteur de jours si absent
        if (!localStorage.getItem('day')) localStorage.setItem('day', '1');
        // Réinitialiser l'indicateur de fin de jeu
        localStorage.setItem('jeuTermine', JSON.stringify(false));
        window.location.href = "lataupe3.html"; // Passage à la phase des tours
    });
} else {
    // Si l'élément n'existe pas au moment de l'exécution du script,
    // on l'ajoute au chargement complet de la page.
    window.addEventListener('load', () => {
        const btn = document.getElementById('monBouton');
        if (btn) {
            btn.addEventListener("click", () => {
                localStorage.setItem('joueursMots', JSON.stringify(joueursMots));
                if (!localStorage.getItem('day')) localStorage.setItem('day', '1');
                localStorage.setItem('jeuTermine', JSON.stringify(false));
                window.location.href = "lataupe3.html";
            });
        }
    });
}

// ----- INITIALISATION -----
// ----- INITIALISATION -----
distribuerMots();
// Sauvegarde initiale pour que les autres pages puissent lire les mots
localStorage.setItem('joueursMots', JSON.stringify(joueursMots));
// Initialisation du compteur d'éliminations si absent
if (!localStorage.getItem('elimCount')) localStorage.setItem('elimCount', '0');
// Initialisation du jour (1..3)
if (!localStorage.getItem('day')) localStorage.setItem('day', '1');
// Assure que le flag de fin de jeu est false
localStorage.setItem('jeuTermine', JSON.stringify(false));
// Initialisation du cycle dans la journée (nombre de mini-rounds effectués)
if (!localStorage.getItem('cycle')) localStorage.setItem('cycle', '1');
// Nombre de cycles (mini-rounds) par jour (par défaut 3)
if (!localStorage.getItem('cyclesPerDay')) localStorage.setItem('cyclesPerDay', '3');
updateUI();