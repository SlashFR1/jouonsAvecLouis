const GAME_DATA = [
    {
        id: 1,
        theme: "Darwin Awards",
        title: "La Chute de l'Avocat",
        story: "Garry Hoy, un avocat respecté de Toronto, avait une étrange habitude pour impressionner les stagiaires : il se jetait de tout son poids contre la vitre de la salle de réunion au 24ème étage pour prouver la solidité inébranlable du verre du Toronto-Dominion Centre. Il avait réalisé cette cascade des dizaines de fois sans incident. Mais ce jour de juillet 1993, la physique a décidé de changer la variable. Le verre ne s'est pas brisé. C'est le cadre entier, fatigué par les chocs répétés, qui a cédé. Garry a traversé le vide, toujours appuyé contre sa vitre intacte, observant avec horreur les 24 étages défiler sous ses yeux avant l'impact final.",
        keyPhrase: "Une confiance transparente qui cède sous le poids de sa propre certitude."
    },
    {
        id: 2,
        theme: "Darwin Awards",
        title: "Le Cameraman du Vide",
        story: "Ivan Lester McGuire était un parachutiste chevronné avec plus de 800 sauts à son actif. Ce jour-là, sa mission était de filmer un élève et un instructeur pour une vidéo souvenir. Concentré sur le cadrage, l'angle de la lumière et le poids de son lourd équipement vidéo fixé à son casque, il sauta de l'avion à 3000 mètres d'altitude. Il filma la chute des autres avec une stabilité parfaite. Ce n'est qu'au moment de tirer sur la poignée d'ouverture qu'il réalisa, alors que le sol se ruait vers lui, qu'il avait confondu le poids de son parachute avec celui de sa caméra. Il avait sauté dans le néant avec pour seule protection une lentille de verre.",
        keyPhrase: "Vouloir capturer l'instant peut nous faire perdre de vue l'essentiel."
    },
    {
        id: 3,
        theme: "Darwin Awards ",
        title: "La Morsure du Mort",
        story: "Sigurd Eysteinsson, un puissant chef Viking, venait de remporter une bataille contre son ennemi Mael Brigte. Pour humilier son adversaire vaincu, il décapita le cadavre et attacha la tête à sa selle comme un trophée macabre. Alors qu'il chevauchait triomphalement vers chez lui, la tête ballottait contre le flanc du cheval. À un moment donné, une dent saillante de la bouche ouverte du mort écorcha profondément la jambe de Sigurd. La blessure, infectée par la bouche du cadavre, provoqua une gangrène foudroyante. Le vainqueur mourut quelques jours plus tard, tué par l'homme qu'il avait lui-même décapité.",
        keyPhrase: "Même séparée du corps, la haine peut encore mordre."
    },
    {
        id: 4,
        theme: "Darwin Awards ",
        title: "L'Ombre du Saguaro",
        story: "Dans le désert de l'Arizona, David Grundman décida de tester la puissance de son fusil de chasse sur la flore locale. Il choisit pour cible un cactus Saguaro centenaire, une plante majestueuse de 8 mètres de haut. Après avoir tiré plusieurs fois à la base pour le faire tomber, il cria victoire lorsque la plante géante commença à basculer. Mais il n'avait pas anticipé la trajectoire. Un bras du cactus, pesant plus de 200 kilos et hérissé d'épines longues comme des doigts, se détacha et s'abattit sur lui avec la précision d'un marteau de justice, l'écrasant instantanément sous le poids de ce qu'il voulait détruire.",
        keyPhrase: "Le désert garde ses épines pour ceux qui pensent que l'immobilité est une absence de vengeance."
    },
    {
        id: 5,
        theme: "Darwin Awards",
        title: "Le Pari Semi-Automatique",
        story: "Lors d'une soirée, un jeune homme voulut jouer à une variante moderne de la roulette russe pour prouver son courage. Il ne disposait pas d'un revolver, mais d'un pistolet semi-automatique. Il retira le chargeur, persuadé que l'arme était désormais inoffensive, ignorant le fonctionnement mécanique basique de cet outil de mort : une balle reste toujours chambrée même sans le chargeur. Il posa le canon sur sa tempe, sourit à ses amis, et pressa la détente. La mécanique fit exactement ce pour quoi elle avait été conçue, sans se soucier des intentions ludiques de son utilisateur.",
        keyPhrase: "Le hasard n'a pas sa place dans une mécanique conçue pour ne jamais échouer à sa tâche sombre."
    },
    {
        id: 6,
        theme: "Darwin Awards ",
        title: "L'Explosion de Lumière",
        story: "Philip Quinn, fasciné par sa lampe à lave mais frustré par la lenteur de la cire à fondre, décida d'accélérer le processus. Il plaça la lampe en verre scellé directement sur une plaque de cuisson électrique allumée au maximum. La chaleur fit monter la pression interne bien au-delà des limites physiques du verre. Alors qu'il s'approchait pour vérifier si la cire bougeait enfin, la lampe explosa avec la force d'une grenade. Un éclat de verre transperça sa poitrine et atteignit son cœur. On le retrouva mort, entouré de cire chaude et de débris scintillants.",
        keyPhrase: "Forcer le rythme de la lumière pour qu'elle danse plus vite ne fait qu'inviter les ténèbres à entrer par le cœur."
    },
    {
        id: 7,
        theme: "Darwin Awards",
        title: "Le Retriever Explosif",
        story: "Deux amis pêchaient sur un lac gelé en Ukraine, mais trouvant la méthode traditionnelle trop lente, ils décidèrent d'utiliser de la dynamite. L'un d'eux alluma la mèche d'un bâton et le lança loin sur la glace. C'est alors que leur fidèle Golden Retriever, dressé pour rapporter les objets lancés, s'élança avec enthousiasme. Il attrapa le bâton fumant et courut joyeusement vers ses maîtres pour leur rendre leur 'jouet'. Les deux hommes prirent la fuite en hurlant, mais le chien, pensant à un jeu de poursuite, les suivit de près. L'explosion finale ne laissa que des trous dans la glace et une leçon tragique sur la loyauté canine mal placée.",
        keyPhrase: "La fidélité aveugle rapporte parfois ce que l'homme a voulu rejeter."
    },
    {
        id: 8,
        theme: "Darwin Awards",
        title: "L'Armure de la Foi",
        story: "Un jeune homme de 23 ans, persuadé de l'efficacité de sa nouvelle veste anti-couteau achetée sur un marché douteux, mit ses amis au défi de le poignarder. Après avoir essuyé plusieurs refus, il finit par convaincre un ami réticent de frapper fort pour prouver la qualité du matériel. L'ami s'exécuta avec un couteau de cuisine. Malheureusement, la veste n'était pas conçue pour résister à une lame pointue, mais seulement aux coupures latérales. La lame traversa le tissu 'protecteur' et le cœur du jeune homme sans la moindre résistance, transformant une démonstration technique en scène de crime involontaire.",
        keyPhrase: "Se croire invulnérable est la première faille de toute armure."
    },
    {
        id: 9,
        theme: "Darwin Awards",
        title: "Le Voleur de Cuivre",
        story: "James voulait voler du câble de cuivre pour le revendre à la ferraille, un métal prisé. Il jeta son dévolu sur une sous-station électrique industrielle, ignorant les panneaux 'Haute Tension' et le bourdonnement menaçant des transformateurs. Armé d'une simple pince coupante non isolée, il tenta de sectionner un câble principal transportant 11 000 volts. Au moment où le métal de la pince toucha le cuivre, un arc électrique plus chaud que la surface du soleil vaporisa l'outil et son propriétaire instantanément, plongeant tout le quartier dans le noir, seule trace de son passage.",
        keyPhrase: "L'avidité conduit souvent à une lumière bien trop vive pour être supportée."
    },
    {
        id: 10,
        theme: "Darwin Awards",
        title: "L'Ascenseur pour l'Au-delà",
        story: "En Corée du Sud, un homme en fauteuil roulant, furieux d'avoir raté son ascenseur de quelques secondes, décida de passer sa colère sur les portes métalliques. Il recula son fauteuil électrique pour prendre de l'élan et percuta les portes fermées à plusieurs reprises. Après le troisième impact violent, les portes cédèrent finalement sous la force de bélier. Sauf que la cabine, elle, était déjà partie. L'homme bascula dans la cage vide et fit une chute mortelle de plusieurs étages, victime de son impatience et de sa propre obstination mécanique.",
        keyPhrase: "Forcer le destin ouvre parfois des portes qui ne mènent nulle part."
    },
    {
        id: 11,
        theme: "Darwin Awards",
        title: "Le Saut de l'Élastique",
        story: "Eric voulait marquer les esprits en effectuant un saut à l'élastique depuis un pont de chemin de fer haut de 25 mètres. Méticuleux, il avait mesuré la hauteur exacte du pont et coupé une corde élastique de 24 mètres, pensant se laisser une marge de sécurité d'un mètre. Il attacha la corde, sauta avec confiance, et s'écrasa violemment au sol. Dans ses calculs, il avait oublié une loi physique élémentaire : l'élasticité. Une corde de 24 mètres s'étire bien au-delà de sa longueur au repos sous le poids d'un corps en chute libre. Les mathématiques ne pardonnent aucune omission.",
        keyPhrase: "La théorie est une ligne droite, la réalité est une courbe qui s'étire."
    },
    {
        id: 12,
        theme: "Darwin Awards",
        title: "Le Sommeil du Camionneur",
        story: "Lors d'une chaude journée d'été sur une aire de repos, un chauffeur routier cherchait désespérément de l'ombre pour faire une sieste. Ne trouvant aucun arbre, il eut l'idée de se coucher sous son propre camion, entre les roues, là où l'ombre était la plus dense. Il s'endormit profondément sur le bitume frais. Malheureusement, il avait oublié de serrer le frein à main. Une légère pente, une vibration, et le mastodonte de 40 tonnes se mit lentement en mouvement, ne laissant aucune chance au dormeur qui avait cherché refuge sous la source même du danger.",
        keyPhrase: "Chercher le repos sous le poids de sa propre charge est un pari risqué."
    },
    {
        id: 13,
        theme: "Darwin Awards",
        title: "La Curiosité Enflammée",
        story: "Un homme soupçonnait une fuite dans le réservoir d'essence de sa voiture garée dans un garage sombre. N'ayant pas de lampe de poche sous la main et incapable de voir le niveau de liquide, il sortit son briquet pour éclairer l'intérieur du goulot de remplissage. La vapeur d'essence, invisible et hautement volatile, n'attendait que cette étincelle. L'explosion qui s'ensuivit projeta l'homme contre le mur opposé et incendia sa maison, prouvant que parfois, mieux vaut rester dans l'obscurité que d'apporter la mauvaise lumière.",
        keyPhrase: "Vouloir faire la lumière sur un danger peut parfois l'allumer pour de bon."
    },
    {
        id: 14,
        theme: "Darwin Awards",
        title: "Le Poids de la Machine",
        story: "Frustré par un distributeur automatique qui avait avalé sa pièce sans délivrer sa barre chocolatée, un étudiant décida de secouer la machine pour récupérer son dû. Voyant que cela ne suffisait pas, il commença à la balancer d'avant en arrière avec force. La machine de 400 kilos, dont le centre de gravité est trompeusement haut, finit par basculer vers l'avant. L'étudiant, coincé contre un mur, fut écrasé par le distributeur. Il mourut pour une friandise à deux euros, vaincu par la gravité et une impatience sucrée.",
        keyPhrase: "L'équilibre des choses ne doit pas être perturbé pour une maigre récompense."
    },
    {
        id: 15,
        theme: "Darwin Awards",
        title: "Le Prêtre aux Ballons",
        story: "Adelir de Carli, un prêtre brésilien, voulait battre un record et lever des fonds en volant à l'aide de 1000 ballons de fête gonflés à l'hélium. Équipé d'un GPS dont il ne savait pas se servir et d'un téléphone satellite, il s'envola vers le ciel. Le vent le poussa rapidement vers l'océan Atlantique. Incapable de redescendre ou de donner sa position exacte, il dériva pendant des heures avant de s'écraser en mer. On retrouva des morceaux de ballons flottant sur l'eau, mais la foi seule n'avait pas suffi à contrer les vents contraires.",
        keyPhrase: "S'élever vers les cieux requiert plus que de l'hélium et de bonnes intentions."
    },
    {
        id: 16,
        theme: "Darwin Awards",
        title: "La Démonstration Mortelle",
        story: "Clement Vallandigham, un avocat du 19ème siècle, défendait un homme accusé de meurtre. Sa théorie : la victime s'était tirée dessus accidentellement en sortant son arme. Pour convaincre le jury, Clement prit une arme qu'il croyait déchargée et reconstitua la scène en plein tribunal. Il mit le pistolet dans sa poche, le tira, et le coup partit réellement, le blessant mortellement à l'abdomen. Il mourut de sa blessure, mais son client fut acquitté grâce à cette démonstration irréfutable. Une victoire juridique payée au prix fort.",
        keyPhrase: "La vérité éclate parfois au détriment de celui qui veut la prouver."
    },
    {
        id: 17,
        theme: "Darwin Awards",
        title: "Le Chimiste du Dimanche",
        story: "Une femme de ménage zélée voulait nettoyer la cuvette des toilettes qui lui résistait. Trouvant que son détergent habituel n'était pas assez puissant, elle décida de créer un 'super nettoyant' en mélangeant de l'eau de Javel avec un détartrant à base d'ammoniaque. Elle se pencha au-dessus de la cuvette pour frotter énergiquement. La réaction chimique immédiate dégagea un nuage de gaz chloramine, un agent toxique puissant. Elle s'évanouit, la tête dans la cuvette, et mourut asphyxiée par les vapeurs de sa propre création domestique.",
        keyPhrase: "La pureté recherchée peut engendrer un poison invisible."
    },
    {
        id: 18,
        theme: "Darwin Awards",
        title: "La Moto Volante",
        story: "Lors d'une manifestation contre le port du casque obligatoire, un motard voulut montrer qu'il maîtrisait parfaitement sa machine et que les protections étaient superflues. Roulant à vive allure, il freina brusquement pour faire une figure de style, mais la roue avant se bloqua. Il fut projeté par-dessus le guidon, sa tête heurtant violemment le trottoir. Les médecins confirmèrent plus tard qu'un simple casque, l'objet même de sa protestation, lui aurait sauvé la vie. L'ironie du sort fut la seule chose qu'il laissa derrière lui.",
        keyPhrase: "Lutter contre la protection, c'est inviter le danger à avoir le dernier mot."
    },
    {
        id: 19,
        theme: "Darwin Awards",
        title: "Le Selfie de la Falaise",
        story: "Un couple de touristes visitait le Cabo da Roca au Portugal. Voulant la photo parfaite avec l'océan en arrière-plan, ils franchirent la barrière de sécurité. Ils se positionnèrent au bord du précipice, tournant le dos au vide pour un selfie. En reculant d'un pas pour mieux cadrer, l'homme perdit l'équilibre sur la roche friable, entraînant sa compagne dans sa chute. Ils tombèrent de 80 mètres sous les yeux de leurs enfants restés derrière la barrière, prouvant qu'aucune image ne vaut le prix de l'existence.",
        keyPhrase: "Vouloir figer l'instant éternel peut parfois conduire à l'éternité."
    },
    {
        id: 20,
        theme: "Darwin Awards",
        title: "Le Braquage à la Dynamite",
        story: "Deux voleurs en Belgique décidèrent de faire sauter un distributeur de billets pour s'emparer du cash. Ne connaissant rien aux explosifs, ils utilisèrent une quantité de dynamite suffisante pour démolir un immeuble entier. Lorsqu'ils déclenchèrent la charge, non seulement le distributeur fut pulvérisé, mais le bâtiment qui l'abritait s'effondra sur eux. L'un mourut sur le coup sous les décombres, l'autre fut arrêté, sonné, au milieu des billets brûlés qui voletaient comme des confettis tragiques.",
        keyPhrase: "La démesure dans l'effort détruit souvent l'objet même de la convoitise."
    },
    {
        id: 21,
        theme: "Darwin Awards",
        title: "La Barre de Trop",
        story: "Un culturiste s'entraînait seul chez lui avec un banc de musculation. Voulant battre son record personnel au développé couché, il chargea la barre à 150 kilos. Il réussit à la soulever, mais au moment de la reposer, ses bras tétanisèrent. Sans partenaire pour l'aider (le 'spotter'), la barre s'écrasa sur sa gorge. Il ne put ni crier ni se dégager, coincé sous le poids de son ambition. Il fut retrouvé le lendemain, étranglé par l'instrument censé le rendre plus fort.",
        keyPhrase: "La force solitaire devient une faiblesse quand le poids dépasse l'orgueil."
    },
    {
        id: 22,
        theme: "Darwin Awards",
        title: "L'Homme-Fusée",
        story: "La légende raconte qu'un ancien sergent de l'armée de l'air américaine, passionné de vitesse, se procura un moteur de fusée JATO (utilisé pour le décollage assisté des avions). Il le fixa sur le toit de sa Chevrolet Impala dans le désert d'Arizona. Il trouva une ligne droite et alluma le moteur. La voiture atteignit plus de 400 km/h en quelques secondes. Les freins fondirent instantanément, et la voiture décolla littéralement avant de s'encastrer dans une falaise 30 mètres plus haut, fusionnant le métal et l'homme en un seul bloc.",
        keyPhrase: "Accélérer le temps ne fait que rapprocher l'inévitable impact."
    },
    {
        id: 23,
        theme: "Darwin Awards",
        title: "Le Plongeon Hivernal",
        story: "Après une séance de sauna bien arrosée, un homme décida de respecter la tradition nordique en plongeant dans la piscine extérieure de la résidence. Il sortit en courant dans le froid, monta sur le plongeoir et s'élança pour un saut de l'ange parfait. Il avait cependant oublié un détail crucial : nous étions en janvier, et la piscine n'était pas chauffée. L'eau avait gelé en un bloc solide. Il se brisa la nuque et plusieurs vertèbres à l'impact, transformant un bain rafraîchissant en traumatisme final.",
        keyPhrase: "La surface des choses est parfois bien plus dure qu'elle n'y paraît."
    },
    {
        id: 24,
        theme: "Darwin Awards",
        title: "Le Roi de la Tyrolienne",
        story: "Pour l'anniversaire de son fils, un père bricoleur installa une tyrolienne artisanale dans le jardin, reliant le toit de la maison à un grand chêne. Pour tester la solidité de son œuvre, il décida de l'essayer lui-même. Il s'élança du toit en tenant la poignée. La corde tint bon, mais il n'avait pas prévu de système de freinage. Il dévala la pente à toute vitesse et s'écrasa violemment contre le tronc du chêne à l'arrivée. La nature a arrêté brutalement ce que l'ingénierie amateur avait lancé.",
        keyPhrase: "Le départ est une chose, mais l'arrivée est celle qui compte vraiment."
    },
    {
        id: 25,
        theme: "Darwin Awards",
        title: "Le Gaz Hilarant",
        story: "Deux employés d'usine découvrirent une bonbonne de gaz non étiquetée et décidèrent de s'amuser en pensant qu'il s'agissait d'hélium pour changer leur voix. Ils prirent de grandes inspirations à tour de rôle, riant de l'effet potentiel. Ce n'était pas de l'hélium, mais de l'argon, un gaz inerte plus lourd que l'air. Le gaz remplit leurs poumons, chassant l'oxygène et restant au fond sans pouvoir être expiré facilement. Ils moururent d'asphyxie silencieuse, sans jamais avoir réussi à changer leur voix.",
        keyPhrase: "Inhaler l'inconnu, c'est laisser le silence prendre toute la place."
    },
    {
        id: 26,
        theme: "Darwin Awards",
        title: "La Course au Train",
        story: "Un homme ivre, rentrant chez lui à pied, arriva à un passage à niveau dont les barrières étaient baissées. Voyant le train de marchandises approcher lentement, il décida de prouver sa rapidité en essayant de passer sous les wagons en mouvement pour atteindre l'autre côté. Il réussit à passer sous le premier, mais trébucha en essayant de sortir. Sa veste se prit dans l'essieu du wagon suivant. Le train, inexorable et aveugle, le traîna sur plusieurs kilomètres, indifférent à son passager clandestin.",
        keyPhrase: "Vouloir doubler une force inarrêtable est une course perdue d'avance."
    },
    {
        id: 27,
        theme: "Darwin Awards",
        title: "Le Nettoyeur de Gouttières",
        story: "Voulant nettoyer ses gouttières encombrées de feuilles, un homme plaça son échelle sur le seul endroit plat disponible : le toit de sa camionnette. Trouvant que ce n'était pas assez stable, il demanda à son fils de déplacer lentement le véhicule pendant qu'il était en haut pour atteindre la section suivante sans descendre. Au premier coup de frein, l'échelle bascula par l'inertie. L'homme fut projeté sur la clôture en fer forgé du voisin, transformant un après-midi de bricolage en tragédie familiale.",
        keyPhrase: "Bâtir sa sécurité sur un sol mouvant est la promesse d'une chute."
    },
    {
        id: 28,
        theme: "Darwin Awards",
        title: "La Scie et la Mine",
        story: "Un collectionneur d'armes trouva une vieille mine antichar de la Seconde Guerre mondiale dans un champ. Convaincu qu'elle était inerte après tant d'années, il la ramena dans son atelier. Voulant voir le mécanisme interne, il la fixa dans un étau et commença à scier le métal avec une meuleuse d'angle. La chaleur et les étincelles réveillèrent les explosifs dormants. La détonation rasa son garage et endommagea les maisons voisines, rappelant que la guerre ne meurt jamais vraiment.",
        keyPhrase: "Le passé, même enfoui, peut exploser si on le frotte trop fort."
    },
    {
        id: 29,
        theme: "Darwin Awards",
        title: "Le Golf Orageux",
        story: "Un golfeur passionné refusait de laisser une 'petite pluie' gâcher sa partie, malgré le ciel noir et le tonnerre grondant au loin. Au 9ème trou, alors qu'il levait son club en fer vers le ciel pour préparer son swing, il devint le point le plus haut et le plus conducteur de tout le fairway. La foudre frappa le club, traversa son corps et sortit par ses chaussures à clous en métal. Il avait terminé son parcours, mais pas de la façon dont il l'espérait.",
        keyPhrase: "Défier les cieux avec du métal en main est une invitation à la foudre."
    },
    {
        id: 30,
        theme: "Darwin Awards",
        title: "L'Ami des Ours",
        story: "Un touriste dans un parc national, ignorant les nombreux panneaux d'avertissement, voulut s'approcher d'un ourson pour lui donner du miel et prendre une photo 'mignonne'. Il ne vit pas la mère, une ourse de 300 kilos, cachée dans les fourrés juste derrière. Lorsqu'elle surgit pour protéger sa progéniture, l'homme n'eut que le temps de réaliser que la nature sauvage n'est pas un dessin animé. Son appareil photo fut retrouvé intact, contenant la dernière erreur de sa vie.",
        keyPhrase: "La nature sauvage ne connaît pas la tendresse que l'homme projette sur elle."
    },
    {
        id: 31,
        theme: "Darwin Awards",
        title: "Le Test de la Grenade",
        story: "Lors d'une soirée arrosée au Brésil, un homme sortit une grenade qu'il gardait illégalement. Pour prouver à ses amis qu'elle était réelle mais 'sécurisée', il décida de jouer avec la goupille. Il la retira, puis, pris d'un doute soudain ou d'une maladresse, la laissa tomber. Au lieu de s'enfuir ou de la lancer, il tenta de ramasser la goupille pour la remettre en place. La grenade explosa dans sa main, mettant fin à la fête et à sa vie, démontrant que certains jouets ne pardonnent aucune hésitation.",
        keyPhrase: "Une fois le mécanisme enclenché, le regret n'arrête pas l'explosion."
    },
    {
        id: 32,
        theme: "Insolite",
        title: "La Plaidoirie Finale",
        story: "Clement, un brillant avocat du XIXe siècle, défendait un homme accusé de meurtre. Sa théorie : la victime s'était tirée dessus accidentellement en dégainant son arme. Pour convaincre le jury, Clement saisit l'arme à feu (qu'il croyait déchargée), la pointa vers lui-même et mima le geste maladroit. Le coup partit réellement, le tuant sur le coup. Sa démonstration fut si convaincante que son client fut acquitté, libre grâce au sacrifice involontaire de son défenseur.",
        keyPhrase: "La vérité éclate parfois avec un bruit de poudre, libérant l'accusé et condamnant l'avocat."
    },
    {
        id: 33,
        theme: "Insolite",
        title: "Le Propriétaire Roulant",
        story: "Jimi, le propriétaire de la société fabriquant les célèbres gyropodes Segway, testait un nouveau modèle tout-terrain dans sa propriété. Voulant laisser passer un promeneur sur un chemin étroit au bord d'une falaise, il manœuvra maladroitement. La machine, conçue pour l'équilibre parfait, ne put compenser la gravité lorsqu'elle bascula dans le vide, emportant son maître dans une chute fatale de 25 mètres.",
        keyPhrase: "L'équilibre technologique ne pèse rien face à la lourdeur du destin."
    },
    {
        id: 34,
        theme: "Insolite",
        title: "Le Prêtre Volant",
        story: "Au Brésil, le père Adelir voulait battre un record pour une œuvre caritative : voler attaché à 1000 ballons de fête foraine gonflés à l'hélium. Équipé d'un GPS dont il ne savait pas se servir et d'un téléphone satellite déchargé, il s'envola joyeusement. Le vent le poussa vers l'océan Atlantique. On retrouva des ballons colorés flottant sur l'eau, mais le prêtre avait rejoint les cieux bien plus littéralement que prévu.",
        keyPhrase: "S'élever vers Dieu avec du plastique demande plus qu'une simple foi en l'hélium."
    },
    {
        id: 35,
        theme: "Insolite",
        title: "Le Smartphone des Enfers",
        story: "En Chine, une femme fit tomber son smartphone neuf dans la fosse sceptique des toilettes communes. Son mari sauta dedans pour le récupérer, mais perdit connaissance à cause des gaz toxiques. La mère du mari sauta pour aider son fils et s'évanouit. La femme sauta à son tour. Au final, deux personnes moururent asphyxiées dans les excréments pour un appareil électronique qui ne captait plus aucun réseau.",
        keyPhrase: "La valeur d'un objet ne vaut jamais le prix de l'air que l'on respire."
    },
    {
        id: 36,
        theme: "Insolite",
        title: "La Caresse du Castor",
        story: "Un pêcheur biélorusse aperçut un castor sur le bord de la route. Voulant une photo souvenir insolite, il s'approcha pour caresser l'animal sauvage. Le castor, peu enclin aux selfies, le mordit violemment à la cuisse, sectionnant l'artère fémorale. L'homme se vida de son sang en quelques minutes, terrassé par un rongeur architecte.",
        keyPhrase: "La nature sauvage ne pose pas pour la postérité, elle se défend."
    },
    {
        id: 37,
        theme: "Insolite",
        title: "L'Aspirateur de l'Apocalypse",
        story: "Voulant vider le réservoir d'essence de sa voiture par siphonnage mais trouvant le goût du carburant désagréable, un homme eut l'idée d'utiliser son aspirateur industriel (Shop-Vac). Il inséra le tuyau dans le réservoir et alluma l'appareil. Le moteur électrique de l'aspirateur créa une étincelle, transformant les vapeurs d'essence aspirées en une bombe thermobarique domestique.",
        keyPhrase: "Vouloir nettoyer l'inflammable avec de l'électrique ne fait que polir sa propre tombe."
    },
    {
        id: 38,
        theme: "Insolite",
        title: "Le Cafard Explosif",
        story: "Agacé par un cafard qui courait dans sa cuisine, un homme vida une bombe entière d'insecticide sur la bête, saturant l'air d'un nuage chimique dense. Satisfait de son attaque, il décida de fumer une cigarette pour célébrer sa victoire. L'explosion qui s'ensuivit souffla les fenêtres de l'appartement, tua le cafard, et envoya l'homme aux urgences avec des brûlures au troisième degré.",
        keyPhrase: "La guerre contre le petit finit parfois par la destruction du grand."
    },
    {
        id: 39,
        theme: "Insolite",
        title: "Le Casque Musical",
        story: "Un joggeur passionné courait chaque matin le long d'une voie ferrée désaffectée... qui venait d'être réhabilitée. Portant un casque antibruit de haute qualité avec la musique à fond, il n'entendit ni le klaxon du train, ni les cris des témoins, ni le grondement des rails. Il courut littéralement jusqu'à l'impact, vivant sa propre bande originale jusqu'à la dernière note.",
        keyPhrase: "S'isoler du bruit du monde empêche d'entendre le signal de la fin."
    },
    {
        id: 40,
        theme: "Insolite",
        title: "Le Sommeil de la Benne",
        story: "Après une soirée très arrosée, un étudiant chercha un endroit chaud et douillet pour dormir. Il trouva une benne à ordures remplie de cartons derrière un supermarché. Au petit matin, le camion poubelle fit sa tournée. Le compacteur hydraulique ne fit aucune distinction entre le carton recyclé et l'étudiant endormi.",
        keyPhrase: "Chercher le confort dans les déchets expose au tri sélectif final."
    },
    {
        id: 41,
        theme: "Insolite",
        title: "L'Exterminateur de Taupes",
        story: "Un homme excédé par les taupinières dans son jardin décida d'employer les grands moyens. Il planta des tiges métalliques dans le sol et les relia à une ligne à haute tension qu'il avait bricolée. Satisfait de son piège, il sortit sous la pluie pour vérifier si les taupes étaient mortes. Le sol mouillé conduisit l'électricité bien mieux qu'il ne l'avait prévu, l'arrêtant net.",
        keyPhrase: "Vouloir foudroyer le sous-sol finit souvent par griller la surface."
    },
    {
        id: 42,
        theme: "Insolite",
        title: "Le Gilet à l'Épreuve des Couteaux",
        story: "Lors d'une soirée, un homme voulut prouver à ses amis que son gilet tactique était 'indestructible'. Il tendit un couteau de chasse à son ami et lui ordonna de frapper en plein cœur. Le gilet était conçu pour arrêter les éclats, pas les coups d'estoc directs. La lame traversa le tissu, le gilet, et le cœur, mettant fin à la démonstration marketing.",
        keyPhrase: "La confiance aveugle dans le tissu ne protège pas de l'acier pointu."
    },
    {
        id: 43,
        theme: "Insolite",
        title: "La Descente en Caddie",
        story: "Deux adolescents trouvèrent un caddie de supermarché et une rue en pente raide. Ils montèrent dedans, sans freins ni protection, et atteignirent rapidement les 50 km/h. Au bas de la pente, ils rencontrèrent un trottoir, puis un mur de briques. Le caddie résista, mais la physique de l'arrêt brutal projeta les passagers vers une fin cinétique.",
        keyPhrase: "Emprunter un véhicule sans frein mène toujours à une destination finale."
    },
    {
        id: 44,
        theme: "Insolite",
        title: "Le Sauna Improvisé",
        story: "Durant une panne de courant hivernale, un homme voulut chauffer sa maison. Il rentra son barbecue à charbon encore fumant dans sa chambre à coucher et ferma hermétiquement fenêtres et portes pour garder la chaleur. La chaleur fut douce, mais le monoxyde de carbone fut impitoyable. Il s'endormit pour ne jamais se réveiller.",
        keyPhrase: "La chaleur sans souffle est un baiser qui étouffe l'âme."
    },
    {
        id: 45,
        theme: "Insolite",
        title: "La Pêche à la Dynamite",
        story: "Sur un lac gelé en Alaska, un homme jeta un bâton de dynamite allumé pour briser la glace. Son fidèle labrador, croyant à un jeu, courut chercher le bâton et le ramena vers son maître, la mèche brûlant toujours. L'homme courut, le chien le poursuivit joyeusement. La déflagration confirma que le chien est bien le meilleur ami de l'homme, jusqu'à la mort.",
        keyPhrase: "Quand la loyauté rapporte la foudre, la fuite est inutile."
    },
    {
        id: 46,
        theme: "Insolite",
        title: "Le Hamac du Pylône",
        story: "Cherchant la vue parfaite et la tranquillité, deux campeurs installèrent leur hamac entre deux pylônes à haute tension. La nuit, le poids des corps fit descendre le hamac, rapprochant dangereusement les cordes des câbles électriques. Un arc électrique se forma, transformant le couchage suspendu en grille-pain géant.",
        keyPhrase: "Suspendre ses rêves aux câbles de la foudre garantit un réveil fulgurant."
    },
    {
        id: 47,
        theme: "Insolite",
        title: "L'Obus Souvenir",
        story: "Un collectionneur d'armes militaria décida de polir un vieil obus de la Seconde Guerre mondiale avec une meuleuse d'angle pour le faire briller. La friction chauffa le métal, réveillant les explosifs dormants à l'intérieur depuis 70 ans. Il rejoignit l'histoire de manière explosive, laissant derrière lui un atelier en ruines.",
        keyPhrase: "Le passé ne dort jamais vraiment, surtout quand on le frotte avec du feu."
    },
    {
        id: 48,
        theme: "Insolite",
        title: "Le Golf Aquatique",
        story: "Voulant récupérer sa balle de golf tombée dans un étang en Floride, un homme plongea malgré les panneaux 'Attention Alligators'. Déterminé à ne pas prendre une pénalité de score, il chercha au fond de l'eau trouble. Il trouva sa balle, mais l'alligator de 3 mètres le trouva aussi. Il sauva son par, mais perdit la partie.",
        keyPhrase: "L'économie d'une balle coûte parfois le prix d'une vie."
    },
    {
        id: 49,
        theme: "Insolite",
        title: "La Vérification du Canon",
        story: "Un passionné de reconstitution historique utilisait un vieux canon à poudre noire. Le coup ne partit pas. Au lieu d'attendre ou de verser de l'eau, il se plaça directement devant la gueule du canon pour regarder à l'intérieur avec une allumette. La poudre, retardataire mais coopérative, choisit cet instant pour s'enflammer.",
        keyPhrase: "Regarder la mort en face avec une flamme est une invitation qu'elle refuse rarement."
    },
    {
        id: 50,
        theme: "Insolite",
        title: "Le Saut de l'Ange",
        story: "Lors d'une fête bien arrosée au 10ème étage, un invité voulut prouver qu'il pouvait sauter dans la piscine située au rez-de-chaussée, dans le jardin. Il prit son élan, courut, sauta par-dessus le balcon... et manqua la piscine de deux bons mètres, atterrissant sur le béton du patio. La visée est un art qui ne supporte pas l'alcool.",
        keyPhrase: "Viser l'eau depuis les nuages exige une précision que l'ivresse ne fournit pas."
    },
    {
        id: 51,
        theme: "Insolite",
        title: "La Méthode Forte",
        story: "Un homme souffrant d'une rage de dents insupportable et ayant peur du dentiste décida de lier sa dent malade à l'arrière de sa voiture avec une ficelle solide, puis de démarrer en trombe. Il oublia un détail : la longueur de la ficelle. Au démarrage, au lieu d'arracher la dent, la tension projeta sa tête contre le pare-chocs arrière, l'assommant mortellement.",
        keyPhrase: "Vouloir extraire la douleur par la vitesse finit parfois par extraire l'âme."
    },
    {
        id: 52,
        theme: "Insolite",
        title: "L'Enema au Xérès",
        story: "Michael, un alcoolique texan de 58 ans, souffrait d'une infection de la gorge qui l'empêchait d'avaler. Ne voulant pas renoncer à son ivresse quotidienne, il décida d'ingérer ses deux bouteilles de Xérès (Sherry) par voie rectale via un lavement improvisé. L'alcool fut absorbé directement par les muqueuses, sans filtration par le foie. Son taux d'alcoolémie grimpa instantanément à un niveau mortel, transformant son addiction en embaumement interne.",
        keyPhrase: "Prendre un raccourci vers l'ivresse mène souvent à l'impasse de l'existence."
    },
    {
        id: 53,
        theme: "Insolite",
        title: "Le Pari du Mollusque",
        story: "Lors d'une soirée entre amis, Sam, un jeune rugbyman, accepta le défi stupide d'avaler une limace vivante trouvée dans le jardin. Il ignorait que le gastéropode portait un parasite, le ver pulmonaire du rat. Quelques jours plus tard, il tomba dans un coma de 420 jours et se réveilla tétraplégique avant de mourir. Une bravade culinaire qui transforma une vie prometteuse en tragédie lente.",
        keyPhrase: "Ce qui glisse sans bruit dans la gorge peut hurler dans les veines."
    },
    {
        id: 54,
        theme: "Insolite",
        title: "La Collecte Fatale",
        story: "Une femme voulut récupérer des vêtements dans un conteneur de dons caritatif sans payer. Elle utilisa un escabeau pour plonger le haut de son corps dans la trappe basculante. Le mécanisme anti-vol se referma sur son cou, et ses pieds quittèrent l'escabeau. Elle resta suspendue, à moitié à l'intérieur, mourant asphyxiée au milieu de la générosité des autres.",
        keyPhrase: "La cupidité est un piège qui se referme souvent plus vite que la charité."
    },
    {
        id: 55,
        theme: "Insolite",
        title: "Le Yoga de l'Extrême",
        story: "Une étudiante mexicaine passionnée de 'yoga extrême' voulut prendre une photo pour Instagram en faisant la posture du 'cochon pendu' au-dessus de la rambarde de son balcon du sixième étage. La gravité, peu impressionnée par sa souplesse et ses leggings de marque, l'attira vers le bas lorsque ses genoux glissèrent. La chute de 25 mètres mit fin à sa quête de l'équilibre spirituel.",
        keyPhrase: "Chercher l'alignement parfait des chakras ne protège pas de la désarticulation du corps."
    },
    {
        id: 56,
        theme: "Insolite",
        title: "Le Baiser du Cobra",
        story: "Un charmeur de serpents autoproclamé 'l'homme immunisé' voulut prouver sa résistance en embrassant un cobra royal sur la bouche devant une foule. Le reptile, peu adepte des démonstrations d'affection, le mordit directement sur la langue. Le venin neurotoxique atteignit le cerveau en quelques secondes, coupant la respiration de l'homme avant qu'il ne puisse finir sa phrase.",
        keyPhrase: "Vouloir charmer la mort par un baiser est l'assurance d'un dernier soupir."
    },
    {
        id: 57,
        theme: "Insolite",
        title: "Le Golf Vengeur",
        story: "Un golfeur irascible, furieux d'avoir raté un putt facile, frappa violemment son club contre un banc en bois. Le manche en métal du club se brisa net sous l'impact. La partie supérieure, devenue une lance acérée, rebondit et vint se planter directement dans l'artère du cou du joueur. Il s'effondra sur le green, pénalisé définitivement.",
        keyPhrase: "La colère est un boomerang dont le retour est souvent plus tranchant que l'envoi."
    },
    {
        id: 58,
        theme: "Insolite",
        title: "La Vengeance du Pneu",
        story: "Voulant se venger de son voisin, un homme décida de crever les pneus de son camion avec un couteau de chasse. Il choisit un pneu énorme sous haute pression. Lorsqu'il planta la lame, l'air comprimé explosa avec la force d'une grenade, propulsant le couteau et le caoutchouc vers lui. L'onde de choc lui brisa le bras et le projeta mortellement contre le trottoir.",
        keyPhrase: "La pression contenue ne demande qu'une issue pour dévaster celui qui l'offre."
    },
    {
        id: 59,
        theme: "Insolite",
        title: "Le Vampire Solaire",
        story: "Un adepte du 'Breatharianisme' (qui croit pouvoir vivre de lumière et d'air) décida de cesser toute alimentation et hydratation pour se nourrir uniquement de rayons solaires. Après sept jours d'exposition intense au soleil sans eau, ses organes lâchèrent les uns après les autres. On le retrouva desséché, ayant littéralement brûlé ses réserves vitales pour une illumination qui n'est jamais venue.",
        keyPhrase: "Ceux qui refusent le pain de la terre finissent par devenir poussière."
    },
    {
        id: 60,
        theme: "Insolite",
        title: "Le Casque à la Super Glue",
        story: "Un homme voulut éviter de payer une amende pour non-port de casque à moto. Ne trouvant pas de sangle, il eut la brillante idée de coller le casque directement sur sa tête avec de la colle industrielle extra-forte. Lors d'un accident mineur, les secours ne purent retirer le casque pour soigner son œdème cérébral. La compression fit le reste.",
        keyPhrase: "S'attacher à sa sécurité de façon permanente empêche parfois d'être sauvé."
    },
    {
        id: 61,
        theme: "Insolite",
        title: "Le Fantôme de l'Autoroute",
        story: "Pour effrayer les automobilistes le soir d'Halloween, un homme se déguisa en fantôme avec un drap blanc et se plaça au milieu d'une route sombre. Il réussit son coup : un conducteur, terrifié par l'apparition blanche surgissant du néant, ne freina pas mais donna un coup de volant... directement sur le farceur. Il devint un véritable esprit ce soir-là.",
        keyPhrase: "Jouer avec la frontière des mondes invite souvent à la traverser pour de bon."
    },
    {
        id: 62,
        theme: "Insolite",
        title: "La Bouée Humaine",
        story: "Lors d'une inondation, un homme refusa de quitter sa maison, affirmant qu'il avait construit un radeau insubmersible avec des bouteilles de soda vides et du ruban adhésif. Lorsque l'eau monta, la structure se disloqua immédiatement. Lesté par ses poches remplies d'or et d'argent qu'il voulait sauver, il coula à pic comme une pierre précieuse.",
        keyPhrase: "La valeur de ce que l'on porte pèse plus lourd que l'ingéniosité du plastique."
    },
    {
        id: 63,
        theme: "Insolite",
        title: "Le Micro-Oondes Explosif",
        story: "Un passionné de pyrotechnie voulut sécher sa poudre noire artisanale qui avait pris l'humidité. Pressé, il étala la poudre sur une assiette et la mit au micro-ondes pour 'quelques secondes'. Les ondes excitèrent les molécules nitrates. L'explosion souffla la cuisine, le mur porteur, et le chimiste amateur qui attendait devant la vitre.",
        keyPhrase: "L'impatience face au temps transforme la science en destruction massive."
    },
    {
        id: 64,
        theme: "Insolite",
        title: "L'Amour du Béton",
        story: "Un homme avait un fétichisme étrange pour les lavements au béton liquide. Il demanda à son partenaire de lui injecter un mélange à prise rapide. Le plaisir fut de courte durée. Le béton durcit dans son rectum, créant une occlusion intestinale massive et une toxicité aiguë. Les médecins ne purent rien faire pour extraire le bloc monolithique qui l'avait tué de l'intérieur.",
        keyPhrase: "Solidifier ses fantasmes peut transformer le corps en statue funéraire."
    },
    {
        id: 65,
        theme: "Insolite",
        title: "Le Surfeur d'Ouragan",
        story: "Ignorant les ordres d'évacuation lors d'un ouragan de catégorie 4, un kitesurfeur décida de profiter des 'vents légendaires'. Il s'élança sur l'océan déchaîné. Une rafale l'arracha de l'eau, le fit voler sur 300 mètres au-dessus de la plage et l'écrasa contre le deuxième étage d'un hôtel vide. Il eut sa légende, brève et brutale.",
        keyPhrase: "Vouloir dompter la tempête finit souvent par être brisé contre ses murs."
    },
    {
        id: 66,
        theme: "Insolite",
        title: "Le Scaphandre Bricolé",
        story: "Un adolescent péruvien voulut explorer le fond d'un lac. Il se fabriqua un casque de plongée avec un seau en plastique et un tuyau d'arrosage relié à une pompe à vélo actionnée par un ami en surface. À 5 mètres de fond, la pression de l'eau écrasa ses poumons car la pompe n'envoyait pas assez d'air pour compenser. La physique des fluides ne pardonne pas le bricolage.",
        keyPhrase: "La profondeur de l'eau exige un respect que l'improvisation ne peut offrir."
    },
    {
        id: 67,
        theme: "Insolite",
        title: "La Descente de Gouttière",
        story: "Enfermé hors de son appartement au 4ème étage, un étudiant tenta de descendre par la gouttière en cuivre, vieille de 50 ans. À mi-chemin, les fixations rouillées cédèrent. La gouttière se détacha du mur, s'arquant vers l'extérieur comme un ressort géant, propulsant l'étudiant non pas vers le sol, mais à travers la fenêtre fermée du voisin du 2ème, la tête la première.",
        keyPhrase: "S'accrocher à la vétusté est un pari où la chute est la seule constante."
    },
    {
        id: 68,
        theme: "Insolite",
        title: "Le Cocktali Azoté",
        story: "Pour célébrer ses 21 ans, une jeune femme commanda un cocktail à l'azote liquide fumant. Ignorant l'instruction d'attendre que la fumée se dissipe, elle avala le verre d'un trait. L'azote à -196°C gela instantanément son estomac, perforant la paroi gastrique comme du verre brisé. La fête se termina en salle d'opération, puis à la morgue.",
        keyPhrase: "Boire le froid absolu fige le temps et la vie dans un même instant."
    },
    {
        id: 69,
        theme: "Insolite",
        title: "La Sieste sous le Camion",
        story: "Un chauffeur routier s'arrêta sur une aire de repos bondée. Ne trouvant pas de place à l'ombre pour sa chaise pliante, il décida de faire sa sieste sous son propre camion, à l'ombre du châssis. Un autre camionneur, voulant se garer à côté, le réveilla. Il se leva précipitamment... oubliant qu'il était sous le camion. Il se brisa le cou contre l'essieu.",
        keyPhrase: "Chercher l'ombre sous des tonnes d'acier transforme le repos en écrasement."
    },
    {
        id: 70,
        theme: "Insolite",
        title: "La Chasse au Trésor",
        story: "Un touriste sur une plage de Floride voulut creuser le trou le plus profond possible. Il atteignit 3 mètres de profondeur. Fier de son œuvre, il s'assit au fond pour savourer le silence. Les parois de sable instable, séchées par le soleil, s'effondrèrent soudainement. Il fallut 30 minutes aux secours pour le déterrer, 25 minutes trop tard.",
        keyPhrase: "Creuser sa propre place dans la terre revient parfois à anticiper sa sépulture."
    },
    {
        id: 71,
        theme: "Insolite",
        title: "L'Extincteur Propulseur",
        story: "Lors d'une fête de bureau, un employé s'assit sur une chaise à roulettes et utilisa un gros extincteur industriel comme propulseur pour traverser le couloir. Il n'avait pas prévu le recul violent. L'extincteur lui échappa des mains, lui fracassa la mâchoire et continua sa course folle à travers la vitre de la salle de réunion, tandis que l'homme s'étouffait dans la mousse carbonique.",
        keyPhrase: "Vouloir voler avec le souffle de la sécurité finit souvent par couper le sien."
    },
    {
        id: 72,
        theme: "Ig Nobel",
        title: "La Grenouille Volante",
        story: "Andre Geim et Michael Berry voulaient démontrer les propriétés du diamagnétisme de l'eau d'une manière inoubliable. Au lieu d'utiliser des graphiques ennuyeux, ils placèrent une grenouille vivante dans un champ magnétique extrêmement puissant de 16 teslas. La grenouille, dont le corps est composé principalement d'eau, se mit à léviter gracieusement dans le vide, défiant la gravité comme un astronaute amphibien. Cette expérience prouva que tout peut voler si l'aimant est assez gros, et valut à Geim un Ig Nobel dix ans avant qu'il ne reçoive le vrai prix Nobel pour le graphène.",
        keyPhrase: "La gravité n'est qu'une suggestion pour ceux qui possèdent assez d'énergie magnétique."
    },
    {
        id: 73,
        theme: "Ig Nobel",
        title: "Le Craquement d'une Vie",
        story: "Donald Unger a passé 60 ans de sa vie à mener une expérience sur son propre corps pour clouer le bec à sa mère qui lui disait que faire craquer ses doigts donnait de l'arthrite. Chaque jour, il faisait craquer les articulations de sa main gauche, mais jamais celles de sa main droite. Après plus de 21 000 séances de craquements unilatéraux, il compara ses deux mains à l'aide de radiographies. Résultat : aucune différence, pas la moindre trace d'arthrite. Il avait dédié six décennies à prouver qu'une mère peut avoir tort.",
        keyPhrase: "La patience est une science qui se mesure en décennies de silence articulaire."
    },
    {
        id: 74,
        theme: "Ig Nobel",
        title: "La Peau de Banane",
        story: "Kiyoshi Mabuchi et son équipe japonaise ont décidé de s'attaquer à l'un des plus vieux gags du cinéma muet : la glissade sur une peau de banane. Ils ont mesuré scientifiquement le coefficient de friction de la peau sous une chaussure. Ils ont découvert que le gel folliculaire polysaccharide à l'intérieur de la peau réduit la friction au sol de manière spectaculaire, rendant la banane presque aussi glissante que du téflon sur de la glace. Le dessin animé n'était pas une exagération, mais un documentaire physique précis.",
        keyPhrase: "Le rire cache souvent une vérité physique aussi tranchante que le sol qui approche."
    },
    {
        id: 75,
        theme: "Ig Nobel",
        title: "L'Amour des Autruches",
        story: "Des chercheurs britanniques ont passé des mois à observer le comportement des autruches dans les fermes d'élevage. Ils ont remarqué un phénomène troublant : les autruches semblaient beaucoup plus excitées sexuellement lorsqu'elles voyaient des humains que lorsqu'elles voyaient d'autres autruches. L'étude a conclu que pour ces oiseaux, le fermier en bottes de caoutchouc était un partenaire romantique bien plus désirable que leurs congénères à plumes, remettant en question la notion d'attirance inter-espèces.",
        keyPhrase: "Le désir a des yeux que la biologie peine parfois à comprendre."
    },
    {
        id: 76,
        theme: "Ig Nobel",
        title: "Le Canard Nécrophile",
        story: "Kees Moeliker, un ornithologue néerlandais, a été témoin d'une scène unique un après-midi : un canard colvert s'est tué en percutant la vitre de son musée. Immédiatement, un autre canard mâle s'est approché du cadavre et s'est accouplé avec lui pendant 75 minutes. Moeliker a décrit cet événement comme le premier cas scientifiquement recensé de nécrophilie homosexuelle chez le canard. Il a prouvé que la nature n'a non seulement aucune morale, mais qu'elle manque aussi parfois cruellement de discernement vital.",
        keyPhrase: "La pulsion de vie persiste parfois absurdement face à l'évidence de la mort."
    },
    {
        id: 77,
        theme: "Ig Nobel",
        title: "Le Soutien-gorge Masque à Gaz",
        story: "Elena Bodnar, marquée par la catastrophe de Tchernobyl, a inventé un vêtement capable de sauver des vies en cas d'attaque chimique ou biologique. Elle a créé un soutien-gorge qui, en quelques secondes, se sépare en deux masques faciaux filtrants indépendants. L'un pour la porteuse, l'autre pour un passant chanceux. Son invention transforme un sous-vêtement quotidien en kit de survie solidaire, prouvant que la protection peut venir des endroits les plus intimes.",
        keyPhrase: "Le salut réside parfois là où l'on garde ce que l'on a de plus précieux."
    },
    {
        id: 78,
        theme: "Ig Nobel",
        title: "La Toast beurrée",
        story: "Robert Matthews a voulu mettre fin au débat séculaire : la tartine tombe-t-elle vraiment toujours du côté beurré par malchance ? Grâce à des calculs complexes et des expériences rigoureuses, il a démontré que ce n'est pas le hasard ni le karma, mais la hauteur moyenne d'une table et la vitesse de rotation de la tartine qui rendent la chute côté beurre inévitable. La tartine n'a tout simplement pas le temps de faire un tour complet avant de toucher le sol.",
        keyPhrase: "Ce que nous appelons malchance n'est souvent qu'une question de hauteur insuffisante."
    },
    {
        id: 79,
        theme: "Ig Nobel",
        title: "Les Vaches Nommées",
        story: "Catherine Douglas et Peter Rowlinson de l'Université de Newcastle ont étudié le lien affectif entre les éleveurs et leurs vaches. Ils ont découvert que les vaches à qui l'on donne un prénom et que l'on traite comme des individus produisent significativement plus de lait (environ 250 litres de plus par an) que celles qui restent anonymes. Un peu de tendresse et d'identité personnelle s'avère être un investissement agroalimentaire plus rentable que la haute technologie.",
        keyPhrase: "Être reconnu par son nom nourrit l'âme et remplit les seaux."
    },
    {
        id: 80,
        theme: "Ig Nobel",
        title: "Le Grincement du Tableau",
        story: "Pourquoi le son des ongles sur un tableau noir est-il si insupportable ? Lynn Halpern et son équipe ont analysé les fréquences sonores de ce bruit atroce. Ils ont découvert qu'il se situe dans une plage de fréquences qui amplifie naturellement la résonance du canal auditif humain, ressemblant étrangement au cri d'alerte des macaques. Notre dégoût pour ce crissement serait donc un vestige évolutif, une peur primitive encodée dans notre oreille interne.",
        keyPhrase: "L'horreur sonore est un écho lointain d'un danger que nous avons oublié."
    },
    {
        id: 81,
        theme: "Ig Nobel",
        title: "Le Canon Vocal",
        story: "La Royal Navy britannique a reçu un prix Ig Nobel de la Paix pour une mesure d'économie radicale. Lors des entraînements d'artillerie, pour économiser des munitions coûteuses, les marins avaient reçu l'ordre de ne pas tirer d'obus réels, mais de crier 'Bang !' très fort dans le micro au moment du tir simulé. Cette méthode pacifiste involontaire a transformé la puissance navale en une chorale absurde, remplaçant la poudre par la voix.",
        keyPhrase: "Le silence des armes est parfois comblé par le ridicule des hommes."
    },
    {
        id: 82,
        theme: "Ig Nobel",
        title: "Pigeons Critiques d'Art",
        story: "Shigeru Watanabe a entraîné des pigeons à distinguer les peintures de Picasso de celles de Monet. Contre toute attente, les oiseaux ont réussi non seulement à différencier les deux maîtres, mais aussi à généraliser leur apprentissage à d'autres peintres cubistes ou impressionnistes qu'ils n'avaient jamais vus. Les pigeons ont démontré qu'il n'est pas nécessaire d'avoir un cerveau complexe ou une âme sensible pour catégoriser l'art humain, juste de bonnes graines.",
        keyPhrase: "La beauté est peut-être dans l'œil de celui qui regarde, même s'il a un bec."
    },
    {
        id: 83,
        theme: "Ig Nobel",
        title: "L'Armure Anti-Ours",
        story: "Troy Hurtubise, un Canadien obsédé par les grizzlys, a passé des années à construire une armure invincible pour pouvoir les approcher sans danger. Il a testé son invention en se faisant percuter par un camion, frapper avec des battes de baseball et jeter du haut d'une colline. Bien que l'armure ait résisté aux chocs, il ressemblait à un robot bibendum indestructible incapable de se mouvoir discrètement. Il n'a jamais vraiment pu tester son costume contre un ours sauvage.",
        keyPhrase: "Se protéger de tout empêche parfois de vivre l'expérience recherchée."
    },
    {
        id: 84,
        theme: "Ig Nobel",
        title: "L'Acarien dans l'Oreille",
        story: "Le vétérinaire Robert Lopez voulait savoir si les mites d'oreilles des chats pouvaient infecter les humains. Ne trouvant pas de volontaires, il inséra des acariens prélevés sur un chat directement dans sa propre oreille gauche. Il nota scrupuleusement le bruit de grattement 'comme du papier froissé' et la douleur intense alors que les parasites colonisaient son canal auditif. Il répéta l'expérience trois fois pour être sûr. La science a avancé, mais son audition en a payé le prix.",
        keyPhrase: "Écouter la nature de trop près peut devenir un supplice bruyant."
    },
    {
        id: 85,
        theme: "Ig Nobel",
        title: "Le Soulagement Vulgaire",
        story: "Richard Stephens a voulu vérifier si jurer faisait du bien. Il a demandé à des volontaires de plonger leur main dans de l'eau glacée aussi longtemps que possible. Un groupe devait répéter des mots neutres (comme 'table'), l'autre pouvait proférer des jurons. Résultat : ceux qui juraient pouvaient supporter la douleur beaucoup plus longtemps. Le blasphème déclenche une réaction émotionnelle qui agit comme un analgésique naturel puissant.",
        keyPhrase: "La vulgarité est parfois le seul bouclier contre la souffrance."
    },
    {
        id: 86,
        theme: "Ig Nobel",
        title: "Le Scarabée Astronome",
        story: "Marie Dacke a découvert que les bousiers, ces scarabées qui poussent des boules d'excréments, utilisent la Voie lactée pour s'orienter la nuit. Lorsqu'on leur mettait des petits chapeaux bloquant la vue du ciel, ils tournaient en rond, perdus. C'est la première fois qu'on prouvait qu'un insecte utilisait les étoiles pour naviguer. Ces humbles nettoyeurs de crottes ont les yeux fixés sur l'immensité galactique pour guider leur fardeau terrestre.",
        keyPhrase: "Même le nez dans la fange, on peut être guidé par les étoiles."
    },
    {
        id: 87,
        theme: "Ig Nobel",
        title: "Les Chats Liquides",
        story: "Marc-Antoine Fardin a utilisé la rhéologie, l'étude de l'écoulement de la matière, pour répondre à une question d'internet : les chats sont-ils liquides ? En observant comment les chats adoptent parfaitement la forme de n'importe quel récipient (vaste, boîte, évier), il a calculé leur 'nombre de Deborah'. Il a conclu que, techniquement, sur une période de temps suffisante, les chats se comportent effectivement comme un fluide visqueux capable de remplir l'espace disponible.",
        keyPhrase: "La matière vivante refuse parfois les définitions rigides de l'état solide."
    },
    {
        id: 88,
        theme: "Ig Nobel",
        title: "Les Montagnes Russes Médicales",
        story: "Le Dr. Wartinger a entendu plusieurs patients dire qu'ils avaient passé leurs calculs rénaux après avoir fait un tour de montagnes russes à Disney World. Intrigué, il a emporté un modèle en silicone de rein rempli d'urine et de vrais calculs dans l'attraction 'Big Thunder Mountain'. Après 20 tours, il a confirmé que les secousses du manège, surtout à l'arrière du train, aidaient à évacuer les petites pierres avec un taux de réussite de 64%.",
        keyPhrase: "Le frisson de la chute peut libérer ce qui pèse à l'intérieur."
    },
    {
        id: 89,
        theme: "Ig Nobel",
        title: "La Pizza Contre la Mort",
        story: "Des scientifiques italiens, dont Silvano Gallus, ont mené une série d'études pour prouver que la pizza protégeait contre le cancer et l'infarctus. Leurs résultats étaient positifs, mais avec une clause cruciale écrite en petits caractères : la pizza devait être fabriquée en Italie et mangée en Italie. C'était une démonstration brillante que le contexte culturel et la qualité des ingrédients comptent plus que le nom du plat lui-même.",
        keyPhrase: "Le remède ne fonctionne que s'il est pris à la source de son histoire."
    },
    {
        id: 90,
        theme: "Ig Nobel",
        title: "Le Wombat Cubique",
        story: "Patricia Yang s'est demandé pourquoi les wombats sont les seuls animaux au monde à faire des crottes en forme de cube parfait. En disséquant des intestins de wombats accidentés, elle a découvert que la dernière partie de leur intestin possède des propriétés élastiques irrégulières qui moulent les fèces en cubes. Cette adaptation permet aux wombats de marquer leur territoire sur des rochers sans que leurs messages olfactifs ne roulent et tombent.",
        keyPhrase: "La nature invente la géométrie pour que le message reste en place."
    },
    {
        id: 91,
        theme: "Ig Nobel",
        title: "L'Alarme au Wasabi",
        story: "Makoto Imai et son équipe ont cherché une solution pour réveiller les personnes sourdes en cas d'incendie, car elles n'entendent pas les alarmes sonores. Ils ont synthétisé un spray à base de wasabi (raifort japonais) qui est diffusé dans l'air. L'odeur piquante irrite le nez et réveille instantanément même les dormeurs les plus profonds. Ils ont déterminé la densité exacte de wasabi nécessaire pour sauver une vie sans aveugler la victime.",
        keyPhrase: "Quand l'oreille est close, il faut piquer les sens pour sauver l'esprit."
    },
    {
        id: 92,
        theme: "Ig Nobel",
        title: "La Fin du Monde Mathématique",
        story: "Le prix de Mathématiques 2011 a été décerné collectivement à plusieurs prophètes de fin du monde (Dorothy Martin, Pat Robertson, Harold Camping, etc.) qui avaient prédit des dates précises pour l'apocalypse (1954, 1982, 1990, 2011...). Le comité les a remerciés pour avoir enseigné au monde entier qu'il faut être prudent lorsqu'on fait des calculs mathématiques basés sur des hypothèses imaginaires.",
        keyPhrase: "L'erreur de calcul est humaine, mais la persévérance dans l'erreur est prophétique."
    },
    {
        id: 93,
        theme: "Ig Nobel",
        title: "Hamsters et Viagra",
        story: "Des chercheurs argentins ont découvert une méthode surprenante pour aider les hamsters à se remettre du décalage horaire (jet lag). En leur administrant du Viagra, ils ont constaté que les rongeurs réajustaient leurs rythmes circadiens 50% plus vite après un vol transatlantique simulé. La molécule agit sur l'horloge biologique, prouvant que ce qui réveille une partie du corps peut aussi réveiller le cerveau.",
        keyPhrase: "Remettre les pendules à l'heure demande parfois un coup de pouce inattendu."
    },
    {
        id: 94,
        theme: "Ig Nobel",
        title: "Le Beau Poulet",
        story: "Stefano Ghirlanda a étudié les préférences esthétiques des poulets. Il a entraîné des poulets à réagir à des visages humains. Il a découvert que les poulets préféraient systématiquement les mêmes visages humains que ceux jugés 'beaux' par des étudiants universitaires. Cette étude suggère que nos standards de beauté ne sont pas culturels ou spécifiquement humains, mais peut-être encodés profondément dans le système nerveux des vertébrés.",
        keyPhrase: "La beauté est universelle, même pour ceux qui finissent en nuggets."
    },
    {
        id: 95,
        theme: "Ig Nobel",
        title: "Le Pivert sans Mal de Tête",
        story: "Ivan Schwab a voulu comprendre pourquoi les piverts ne souffrent pas de maux de tête ni de décollement de la rétine alors qu'ils frappent le bois 12 000 fois par jour avec une force de 1 200 g. Il a découvert que le pivert a un os spongieux spécial et une langue qui s'enroule autour de son crâne pour agir comme une ceinture de sécurité cérébrale. L'oiseau est un marteau-piqueur vivant parfaitement amorti.",
        keyPhrase: "La violence de l'impact est annulée par une architecture interne parfaite."
    },
    {
        id: 96,
        theme: "Ig Nobel",
        title: "L'Avaleur de Sabre",
        story: "Brian Witcombe, radiologue, et Dan Meyer, avaleur de sabre, ont mené une étude médicale complète sur les effets secondaires de l'avalement de sabre. Ils ont recensé des maux de gorge (le 'sabre throat'), des perforations de l'œsophage et des hémorragies internes. Leur conclusion majeure fut que la pratique devient particulièrement dangereuse si l'avaleur est distrait ou s'il a le hoquet. Une vérité médicale tranchante.",
        keyPhrase: "Accueillir l'acier en soi demande une concentration qui ne tolère aucun spasme."
    },
    {
        id: 97,
        theme: "Ig Nobel",
        title: "Le Spermicide Pétillant",
        story: "Une légende urbaine des années 50 affirmait que le Coca-Cola était un contraceptif efficace. Deborah Anderson et son équipe ont testé cette théorie en laboratoire. Ils ont découvert que le Coca-Cola 'Diet' tuait effectivement tous les spermatozoïdes en une minute, tandis que le 'New Coke' en laissait 41% vivants. Bien que chimiquement vrai, ils ont déconseillé la méthode, car le sucre favorise les infections, transformant un bain contraceptif en bouillon de culture.",
        keyPhrase: "La chimie du plaisir sucré n'est pas celle de la sécurité biologique."
    },
    {
        id: 98,
        theme: "Ig Nobel",
        title: "L'Ingénieur Mucilagineux",
        story: "Des chercheurs japonais ont placé un blob (une moisissure visqueuse) dans un labyrinthe reproduisant la carte de Tokyo, avec des flocons d'avoine aux emplacements des grandes villes. Le blob, sans cerveau ni système nerveux, a grandi pour connecter les points de nourriture en recréant un réseau presque identique au système ferroviaire optimisé par des ingénieurs humains. La nature trouve le chemin le plus court sans avoir besoin de diplôme.",
        keyPhrase: "L'intelligence n'a pas besoin de neurones pour trouver la voie optimale."
    },
    {
        id: 99,
        theme: "Ig Nobel",
        title: "La Tour Eiffel de Gauche",
        story: "Anita Eerland et Rolf Zwaan ont démontré que la posture physique influence notre estimation des quantités. Ils ont demandé à des volontaires d'estimer la hauteur de la Tour Eiffel. Ceux qui étaient penchés (à leur insu) vers la gauche donnaient des estimations systématiquement plus basses que ceux penchés vers la droite. Notre ligne mentale des nombres semble être physiquement connectée à notre équilibre corporel.",
        keyPhrase: "Notre vision de la grandeur dépend de quel côté nous penchons."
    },
    {
        id: 100,
        theme: "Ig Nobel",
        title: "Le Couteau de Caca",
        story: "Metin Eren a voulu vérifier une célèbre histoire ethnographique inuit racontant qu'un homme avait fabriqué un couteau avec ses propres excréments gelés pour dépecer un chien. L'équipe a reproduit l'expérience en laboratoire, congelant des fèces humaines en forme de lame à -50°C. Lorsqu'ils ont essayé de couper de la viande, le couteau n'a pas coupé ; il a simplement laissé une trace marron fondue. La légende était fausse : la merde, même gelée, reste molle face à la réalité.",
        keyPhrase: "Transformer ses déchets en arme est une idée qui fond au contact du réel."
    },
    {
        id: 101,
        theme: "Ig Nobel",
        title: "La Mouche et le Vin",
        story: "Les sommeliers savent reconnaître un vin au goût, mais la mouche du vinaigre aussi. Des chercheurs suédois ont découvert que grâce à des récepteurs ultra-sensibles, une mouche peut distinguer un millésime d'un autre et même détecter si un verre de vin contient une phéromone de mouche tombée dedans. Ils ont créé un 'nez électronique' inspiré de la mouche, prouvant que l'ivrogne le plus petit du bar est aussi le plus grand expert.",
        keyPhrase: "La taille du connaisseur ne fait pas la finesse de son palais."
    },
    {
        id: 104,
        theme: "Crime",
        title: "Le Tunnel sans Fin",
        story: "Trois cambrioleurs décidèrent de creuser un tunnel pour atteindre la chambre forte d'une banque à Rio. Ils travaillèrent pendant des semaines, étayant mal leur galerie souterraine dans un sol sablonneux et instable. La nuit du casse, alors qu'ils étaient sous les fondations du bâtiment, le poids de la structure fit s'effondrer le tunnel. Ils ne furent pas arrêtés par la police, mais scellés vivants dans une tombe de béton et de terre, étouffés par l'or qu'ils convoitaient.",
        keyPhrase: "Creuser vers la richesse, c'est parfois approfondir sa propre sépulture."
    },
    {
        id: 105,
        theme: "Crime",
        title: "L'Évasion Glaciale",
        story: "Fuyant une scène de meurtre, un criminel chercha à se cacher dans la chambre froide d'un camion de viande stationné. Pensant attendre que la police s'éloigne, il s'enferma de l'intérieur. Malheureusement, le mécanisme d'ouverture était défectueux et le camion, programmé pour une livraison longue distance, maintint une température de -20°C. On retrouva l'homme le lendemain, parfaitement conservé, gelé dans une expression de terreur éternelle.",
        keyPhrase: "Le froid préserve la chair, mais il ne sauve jamais l'âme."
    },
    {
        id: 106,
        theme: "Crime",
        title: "Le Câble de la Fortune",
        story: "Motivé par le prix élevé du cuivre, un voleur s'introduisit dans une sous-station électrique active. Équipé d'une simple pince coupante non isolée, il tenta de sectionner un câble principal de 13 000 volts. L'arc électrique qui se forma fut si puissant qu'il vaporisa instantanément le métal de la pince et les mains du voleur, avant de traverser son corps, le transformant en une torche humaine visible à des kilomètres.",
        keyPhrase: "Voler la foudre exige une main que nul mortel ne possède."
    },
    {
        id: 107,
        theme: "Crime",
        title: "La Chimère de l'Or",
        story: "Un plongeur expérimenté mais avide découvrit l'épave d'un navire contenant des lingots d'or. Il décida de remonter plus de poids que son équipement ne le permettait. Il attacha les lingots à sa ceinture, ignorant les lois de la flottabilité. Lorsqu'il tenta de remonter, le poids l'ancra au fond. À court d'oxygène, incapable de défaire les nœuds complexes qu'il avait lui-même serrés par avidité, il mourut riche, noyé par son trésor.",
        keyPhrase: "Le poids du désir est souvent plus lourd que l'eau qui nous porte."
    },
    {
        id: 108,
        theme: "Crime",
        title: "L'Exécution par Ricochet",
        story: "Un homme voulait éliminer sa femme pour toucher l'assurance-vie. Il l'attendit dans le jardin et tira un coup de feu alors qu'elle était sur la terrasse. Il manqua sa cible. La balle de gros calibre frappa un poteau en acier trempé de la clôture, ricocha avec une précision géométrique et revint frapper le tireur en plein front. La justice physique fut rendue en moins d'une seconde.",
        keyPhrase: "La trajectoire de la haine est un cercle qui revient toujours à son origine."
    },
    {
        id: 109,
        theme: "Crime",
        title: "Le Masque de la Mort",
        story: "Pour un braquage, un criminel utilisa un masque en latex qu'il avait peint à la bombe dorée juste avant de l'enfiler. Les vapeurs toxiques de la peinture fraîche, combinées à l'effort physique et au stress du vol, provoquèrent une asphyxie chimique rapide. Il s'effondra en sortant de la banque, non pas sous les balles, mais étouffé par son propre déguisement.",
        keyPhrase: "Se cacher derrière un visage artificiel peut effacer le souffle du véritable visage."
    },
    {
        id: 110,
        theme: "Crime",
        title: "L'Ascension Interrompue",
        story: "Un cambrioleur tenta de s'introduire dans un appartement de luxe en passant par le vide-ordures depuis le toit. Il avait sous-estimé l'étroitesse du conduit et sa propre corpulence. Il glissa sur trois étages avant de se coincer irrémédiablement, les bras bloqués le long du corps. Personne n'entendit ses cris étouffés. Il fut découvert deux semaines plus tard, victime de la faim, de la soif et de sa propre stupidité.",
        keyPhrase: "Le chemin le plus court vers le bas est souvent un aller simple vers le néant."
    },
    {
        id: 111,
        theme: "Crime",
        title: "La Bombe Ventrale",
        story: "Un passeur de drogue (mule) ingéra 80 capsules de cocaïne pure pour passer la douane. Pour calmer ses nerfs avant le vol, il but un verre d'alcool fort. L'alcool dissolut l'enveloppe fragile des capsules dans son estomac. L'overdose massive fut foudroyante, son corps convulsant violemment alors que des quantités létales de drogue inondaient son sang en une fois.",
        keyPhrase: "Le corps n'est pas un coffre-fort; ce qu'il contient finit par se répandre."
    },
    {
        id: 112,
        theme: "Crime",
        title: "Le Coffre-Fort Vengeur",
        story: "Deux voleurs tentèrent de descendre un coffre-fort de 400 kilos dans les escaliers d'un manoir. L'un tirait par en bas, l'autre poussait par en haut. Celui du bas glissa sur le tapis. Le coffre, obéissant à la gravité, prit de la vitesse et écrasa le voleur contre le mur du palier, réduisant sa cage thoracique en miettes. Son complice s'enfuit, laissant l'argent et le cadavre.",
        keyPhrase: "La lourdeur du secret écrase toujours celui qui tente de le porter seul."
    },
    {
        id: 113,
        theme: "Crime",
        title: "L'Arme du Jardinier",
        story: "Un homme voulait tuer son voisin bruyant en piégeant sa tondeuse à gazon avec de l'explosif artisanal. En installant le dispositif sous la machine, il oublia de verrouiller la lame. Un faux mouvement déclencha le mécanisme de démarrage. La lame rotative frappa le détonateur qu'il tenait en main, provoquant une explosion qui le déchiqueta au milieu de sa propre pelouse.",
        keyPhrase: "Semer la mort dans son jardin garantit une récolte de sang."
    },
    {
        id: 114,
        theme: "Crime",
        title: "La Fuite par les Égouts",
        story: "Pour échapper à une patrouille de police, un voleur souleva une plaque d'égout et sauta dans l'obscurité. Il ignorait que de fortes pluies avaient transformé le réseau souterrain en un torrent furieux. Emporté par le courant des eaux usées, il fut traîné sur des kilomètres, heurtant les parois de béton jusqu'à ce que son corps sans vie soit rejeté dans le fleuve.",
        keyPhrase: "L'obscurité souterraine ne cache pas les péchés, elle les noie."
    },
    {
        id: 115,
        theme: "Crime",
        title: "Le Poison Partagé",
        story: "Une femme empoisonna le ragoût de son mari avec de l'arsenic. Pour ne pas éveiller les soupçons, elle servit le plat lors d'un dîner, prévoyant de ne pas en manger. Cependant, sous la pression sociale des invités qui vantaient sa cuisine, elle fut forcée de goûter son propre plat pour prouver sa modestie. Elle mourut quelques heures après son mari, victime de sa propre ruse.",
        keyPhrase: "Le banquet de la trahison a toujours un couvert pour le cuisinier."
    },
    {
        id: 116,
        theme: "Crime",
        title: "L'Explosif au Micro-ondes",
        story: "Un apprenti terroriste tentait de sécher du peroxyde d'acétone (un explosif très instable) qu'il venait de fabriquer. Trouvant le séchage à l'air libre trop lent, il mit la substance dans son four à micro-ondes. Les ondes excitèrent les molécules instables en quelques secondes. L'explosion qui s'ensuivit rasa sa cuisine et mit fin à sa carrière criminelle avant qu'elle ne commence.",
        keyPhrase: "L'impatience est l'étincelle qui transforme l'ambition en poussière."
    },
    {
        id: 117,
        theme: "Crime",
        title: "La Fenêtre Trop Solide",
        story: "Un cambrioleur, surpris par les propriétaires, tenta de s'enfuir en sautant à travers une grande baie vitrée fermée, pensant qu'elle se briserait comme dans les films. Il s'agissait de verre feuilleté anti-effraction. Il rebondit violemment contre la vitre, se brisa les cervicales sous le choc de l'impact, et tomba inanimé aux pieds de ses victimes.",
        keyPhrase: "La transparence de l'obstacle ne garantit pas la fragilité de la barrière."
    },
    {
        id: 118,
        theme: "Crime",
        title: "Le Braquage Allergique",
        story: "Un homme allergique aux arachides braqua une boulangerie. Pour intimider le personnel, il saisit un muffin et en prit une bouchée agressive en hurlant ses ordres. Le muffin contenait des noix de macadamia et des traces d'arachide. Il fit un choc anaphylactique massif et mourut, gonflé et suffoquant, sur le sol du commerce qu'il voulait piller.",
        keyPhrase: "Le destin se cache parfois dans une miette que l'on ne soupçonne pas."
    },
    {
        id: 119,
        theme: "Crime",
        title: "La Corde Trop Longue",
        story: "Voulant simuler un suicide par pendaison pour effrayer son ex-petite amie lors d'un appel vidéo, un harceleur installa une corde. Il se tint sur un tabouret instable. Dans son excitation théâtrale, il glissa réellement. Le nœud, qu'il croyait lâche, se serra parfaitement. Il mourut en direct, victime de sa propre mise en scène macabre.",
        keyPhrase: "Jouer avec la corde du bourreau finit toujours par un nœud gordien."
    },
    {
        id: 120,
        theme: "Crime",
        title: "Le Silencieux de Fortune",
        story: "Un tueur à gages amateur voulut fabriquer un silencieux pour son pistolet en utilisant un filtre à huile de voiture rempli de laine d'acier. Lors du premier tir d'essai, la pression des gaz ne put s'échapper. Le canon du pistolet explosa vers l'arrière, envoyant la culasse en métal directement dans l'orbite droite du tireur, pénétrant le cerveau.",
        keyPhrase: "Vouloir étouffer le bruit de la mort fait souvent hurler le silence."
    },
    {
        id: 121,
        theme: "Crime",
        title: "L'Attaque de la Ruche",
        story: "Un voleur de bois précieux s'attaqua à un vieux chêne creux dans une forêt protégée. Il utilisa une tronçonneuse bruyante. Les vibrations réveillèrent une colonie massive de frelons asiatiques nichée à l'intérieur. Enragés, les insectes attaquèrent l'homme. Il lâcha la tronçonneuse en marche sur sa jambe et mourut d'une combinaison d'hémorragie et de choc toxique.",
        keyPhrase: "La nature garde ses trésors avec des soldats que l'on ne voit pas venir."
    },
    {
        id: 122,
        theme: "Crime",
        title: "Le Ciment de la Mafia",
        story: "Un gangster devait se débarrasser d'un corps en le coulant dans le béton. Il prépara le mélange dans une petite pièce mal ventilée au sous-sol. Il trébucha, se renversa le seau de ciment rapide dessus et se cogna la tête, perdant connaissance. Le ciment durcit autour de lui, le transformant en statue aux côtés de sa victime.",
        keyPhrase: "Ceux qui construisent des prisons pour les autres finissent souvent emmurés."
    },
    {
        id: 123,
        theme: "Crime",
        title: "La Voiture Piégée",
        story: "Un homme jaloux installa une bombe sous la voiture de l'amant de sa femme. Il connecta le détonateur au système d'allumage. Voulant vérifier une dernière fois les connexions, il demanda à quelqu'un de tourner la clé pour voir si le voyant s'allumait, oubliant qu'il était toujours sous le véhicule. L'explosion ne laissa aucune chance à l'ingénieur de sa propre fin.",
        keyPhrase: "Vérifier la mécanique de la vengeance est un travail qui ne pardonne pas l'oubli."
    },
    {
        id: 124,
        theme: "Crime",
        title: "Le Gaz Anesthésiant",
        story: "Un groupe de voleurs voulut endormir les occupants d'une maison en injectant du gaz anesthésiant par la ventilation. Ils se trompèrent de dosage et de produit, utilisant un gaz lourd qui resta au rez-de-chaussée où ils entrèrent. Ils s'endormirent eux-mêmes dans le salon, sacs à la main, jusqu'à l'arrivée de la police au matin.",
        keyPhrase: "Le marchand de sable ne distingue pas le voleur du dormeur."
    },
    {
        id: 125,
        theme: "Crime",
        title: "La Cachette du Broyeur",
        story: "Fuyant la sécurité d'une déchetterie où il volait des métaux, un homme sauta dans une benne industrielle. Il ignorait qu'il s'agissait de l'alimentation d'un broyeur à métaux automatique. Les capteurs détectèrent son poids et activèrent les cylindres dentés. Ses cris furent couverts par le bruit du métal déchiré.",
        keyPhrase: "Se jeter dans la gueule de la machine, c'est accepter d'être réduit en pièces."
    },
    {
        id: 126,
        theme: "Crime",
        title: "L'Arbalète Inversée",
        story: "Un homme voulait tuer son associé avec une arbalète de chasse. Ne connaissant pas le fonctionnement de l'arme, il la tint à l'envers pour regarder si la flèche était bien enclenchée. Son doigt glissa sur la gâchette sensible. Le carreau partit à 300 km/h, lui transperçant le crâne par le menton.",
        keyPhrase: "La direction de la flèche importe peu si l'archer ne regarde pas la cible."
    },
    {
        id: 127,
        theme: "Crime",
        title: "Le Siphon de la Mort",
        story: "Un voleur de carburant voulut siphonner le réservoir d'un camping-car. Dans l'obscurité, il introduisit son tuyau non pas dans le réservoir d'essence, mais dans la trappe de vidange des toilettes chimiques. L'aspiration brutale lui envoya un flot de produits chimiques caustiques et d'excréments dans les poumons, provoquant une noyade infectieuse atroce.",
        keyPhrase: "Voler l'essence de la vie expose parfois à boire la pourriture de l'âme."
    },
    {
        id: 128,
        theme: "Crime",
        title: "L'Airbag du Voleur",
        story: "Un voleur de voiture tentait de retirer un volant de luxe équipé d'un airbag sans débrancher la batterie. Il utilisa un marteau pour forcer le verrou. Le choc déclencha l'airbag. L'explosion projeta le marteau qu'il tenait directement dans son front, lui enfonçant la boîte crânienne.",
        keyPhrase: "La protection explosive ne juge pas l'intention, elle punit l'impact."
    },
    {
        id: 129,
        theme: "Crime",
        title: "La Tombe de Neige",
        story: "Après avoir volé un chalet de montagne, un criminel s'enfuit en ski hors-piste pour éviter les routes. Il déclencha une avalanche massive par son passage maladroit. Au lieu de skier plus vite, il tenta de se cacher derrière un rocher. La neige l'ensevelit sous six mètres de blanc, le gardant caché jusqu'au printemps.",
        keyPhrase: "La montagne blanche recouvre tout, même les cœurs les plus noirs."
    },
    {
        id: 130,
        theme: "Crime",
        title: "Le Chien de Garde",
        story: "Un intrus entra dans une propriété gardée par deux Dobermans. Il avait apporté des steaks empoisonnés. Les chiens mangèrent la viande, mais l'un d'eux, malade avant de mourir, vomit violemment sur le sol carrelé. Le voleur glissa sur le vomi, tomba à la renverse et se fracassa le crâne sur le coin d'une marche en marbre.",
        keyPhrase: "La bête trahie peut encore mordre par-delà la mort."
    },
    {
        id: 131,
        theme: "Crime",
        title: "Le Grenade Degoupillée",
        story: "Un braqueur voulait menacer un caissier avec une grenade réelle. Il enleva la goupille pour montrer qu'il était sérieux, mais garda la cuillère (levier) enfoncée. Dans le stress, il eut une crampe à la main et changea de main pour tenir la grenade. Durant ce millième de seconde de transfert, le levier sauta. L'explosion pulvérisa le braqueur et le guichet.",
        keyPhrase: "Tenir la mort dans sa main demande une poigne que la peur relâche toujours."
    },
    {
        id: 132,
        theme: "Crime",
        title: "La Fuite par le Toit",
        story: "Poursuivi par la police, un criminel sauta d'un toit d'immeuble à un autre. Il réussit son saut, mais atterrit sur une verrière ancienne peinte en noir qui dissimulait un puits de lumière de cinq étages. Le verre céda instantanément. Il traversa le vide et s'écrasa au milieu du hall d'entrée de l'immeuble voisin.",
        keyPhrase: "Croire que le sol est solide juste parce qu'il est obscur est une erreur fatale."
    },
    {
        id: 133,
        theme: "Crime",
        title: "Le Gilet Pare-Balles Fait Maison",
        story: "Un chef de gang paranoïaque se fabriqua un gilet pare-balles avec des annuaires téléphoniques et du scotch, croyant à une légende urbaine. Il demanda à son lieutenant de tester l'efficacité avec un calibre .45. Le papier ne ralentit même pas la balle qui perfora son cœur. La stupidité tua plus vite que la balle.",
        keyPhrase: "Les mots imprimés peuvent sauver l'esprit, mais ils n'arrêtent pas le plomb."
    },
    {
        id: 134,
        theme: "Crime",
        title: "L'Acide dans la Baignoire",
        story: "Inspiré par une série télévisée, un tueur voulut dissoudre le corps de sa victime dans une baignoire avec de l'acide fluorhydrique. Il ne savait pas que l'acide rongerait l'émail et la fonte de la baignoire. Le fond de la baignoire céda, déversant le mélange liquéfié de chair et d'acide à travers le plafond, directement sur le tueur qui nettoyait l'étage du dessous.",
        keyPhrase: "La chimie de la dissolution ne respecte pas les frontières des étages."
    },
    {
        id: 135,
        theme: "Crime",
        title: "Le Lasso Électrique",
        story: "Un voleur de bétail utilisa un lasso muni d'un câble en acier pour attraper un taureau dans un pré. L'animal, paniqué, courut vers un pylône électrique tombé au sol. Le câble en acier toucha le fil haute tension. Le courant remonta le lasso instantanément, foudroyant le voleur et sa monture.",
        keyPhrase: "Le lien qui capture peut devenir le fil qui exécute."
    },
    {
        id: 136,
        theme: "Crime",
        title: "La Cachette du Four",
        story: "Lors d'une perquisition surprise, un fabricant de méthamphétamine tenta de cacher ses produits chimiques volatils dans le four de sa cuisine. Dans la panique, il heurta le bouton de mise en marche. La chaleur fit réagir les solvants. L'explosion souffla la façade de la maison, exposant son laboratoire clandestin au monde entier.",
        keyPhrase: "Cacher le feu par le feu ne fait qu'attiser le brasier de la vérité."
    },
    {
        id: 137,
        theme: "Crime",
        title: "Le Plongeon dans le Vide",
        story: "Un voleur d'hôtel, surpris dans une chambre au 10ème étage, enjamba le balcon pour atteindre celui d'à côté. Il s'accrocha à la rambarde qui, rongée par l'air salin, se détacha du mur. Il tomba en arrière, serrant toujours la barre de métal inutile contre sa poitrine, hurlant jusqu'au sol.",
        keyPhrase: "S'appuyer sur la rouille pour sauver sa peau est un pari perdu d'avance."
    },
    {
        id: 138,
        theme: "Crime",
        title: "L'Hameçon Humain",
        story: "Un braconnier utilisait une arbalète de pêche modifiée pour tirer des flèches reliées à une corde. En armant son dispositif, la flèche glissa et se planta dans sa cuisse, traversant l'artère fémorale. Relié à un arbre par la corde, il ne put ramper pour chercher de l'aide et se vida de son sang, piégé comme le gibier qu'il chassait.",
        keyPhrase: "Le chasseur devient la proie quand l'arme choisit sa propre cible."
    },
    {
        id: 139,
        theme: "Crime",
        title: "Le Gaz Sarin Amateur",
        story: "Un extrémiste solitaire tenta de synthétiser du gaz neurotoxique dans sa cuisine avec un équipement de protection acheté dans un magasin de déguisement. Le masque n'était pas étanche. À la première émanation, ses muscles se paralysèrent, l'empêchant de fuir ou de fermer le récipient. Il mourut en regardant son œuvre mortelle s'évaporer inutilement.",
        keyPhrase: "Le poison ne respecte pas son créateur, il ne connaît que la biologie."
    },
    {
        id: 140,
        theme: "Crime",
        title: "La Trottinette de Fuite",
        story: "Après avoir arraché le sac d'une vieille dame, un voleur s'enfuit sur une trottinette électrique débridée. Roulant à 50 km/h sur un trottoir, il ne vit pas une chaîne tendue entre deux poteaux pour empêcher le stationnement. La chaîne le frappa à la gorge, l'arrêtant net et lui brisant la trachée. Le sac retomba doucement à côté de son corps inerte.",
        keyPhrase: "La vitesse sans vision transforme l'obstacle en guillotine."
    },
    {
        id: 141,
        theme: "Crime",
        title: "L'Œil du Voyeur",
        story: "Un homme avait percé un trou dans le mur de la cabine d'essayage d'un magasin pour espionner. Un jour, alors qu'il regardait, une cliente remarqua le trou et y enfonça violemment un stylo pointu qu'elle avait en main. Le stylo pénétra l'œil du voyeur et atteignit le cerveau, transformant sa curiosité malsaine en lobotomie fatale.",
        keyPhrase: "Regarder là où l'on n'est pas invité expose l'œil à la pointe de la justice."
    },
    {
        id: 142,
        theme: "Crime",
        title: "Le Souffle du Dragon",
        story: "Un pyromane nommé Arthur voulait incendier un entrepôt pour toucher une prime d'assurance frauduleuse. Il répandit généreusement cinquante litres d'essence dans une pièce fermée hermétiquement, saturant l'air de vapeurs inflammables denses. Au moment d'allumer sa mèche, il ne réalisa pas qu'il se tenait au cœur d'une bombe thermobarique. L'étincelle provoqua une déflagration instantanée, soufflant les murs de briques et propulsant Arthur à travers la rue, son corps calciné devenant la seule preuve de son forfait.",
        keyPhrase: "Celui qui danse avec l'enfer oublie souvent que le diable mène la cadence."
    },
    {
        id: 143,
        theme: "Crime",
        title: "L'Armure de Chair",
        story: "Lors d'une dispute violente liée à un trafic de stupéfiants, un homme tenta de poignarder son rival. Ce dernier, paniqué, attrapa la première chose à sa portée pour se protéger : un grand miroir ancien. L'assaillant, aveuglé par la rage, frappa de toutes ses forces. La lame traversa le verre, se brisa, et l'élan fit tomber l'homme sur les éclats tranchants du miroir brisé. Il mourut, le corps transpercé par son propre reflet fragmenté.",
        keyPhrase: "Frapper son image renvoie parfois une blessure que le temps ne peut guérir."
    },
    {
        id: 143,
        theme: "Politique",
        title: "Le Discours Mortel",
        story: "William Henry Harrison, 9ème président des États-Unis, voulait prouver sa vigueur malgré ses 68 ans. Le jour de son investiture, par un froid glacial et sous une pluie battante, il refusa de porter un manteau ou un chapeau. Il prononça le plus long discours d'inauguration de l'histoire : 8 445 mots pendant près de deux heures. Le froid pénétra ses os, se transformant en pneumonie sévère. Il mourut 31 jours plus tard, ayant passé moins de temps à gouverner qu'à agoniser de sa propre vanité.",
        keyPhrase: "La voix porte loin, mais le froid pénètre plus vite que les mots."
    },
    {
        id: 144,
        theme: "Politique",
        title: "Le Premier Ministre Disparu",
        story: "Harold Holt, Premier ministre australien, aimait l'océan plus que le protocole. Un jour de décembre 1967, il partit se baigner à Cheviot Beach malgré une mer agitée, laissant ses gardes du corps sur la plage. Il plongea dans les rouleaux et ne remonta jamais. Malgré l'une des plus grandes opérations de recherche de l'histoire, son corps ne fut jamais retrouvé. L'Australie, avec une ironie mordante, a nommé une piscine municipale en son honneur quelques années plus tard.",
        keyPhrase: "L'océan ne se soucie guère du titre de ceux qu'il décide de garder."
    },
    {
        id: 145,
        theme: "Politique",
        title: "L'Armée qui s'Agrandit",
        story: "En 1866, lors de la guerre austro-prussienne, le Liechtenstein envoya une armée de 80 hommes pour garder un col italien. Ils ne virent aucun combat, passèrent leur temps à boire du vin et à admirer le paysage. Lors de leur retour à Vaduz, on compta 81 hommes. Ils avaient gagné un ami italien en chemin qui décida de rentrer avec eux. C'est sans doute la seule campagne militaire de l'histoire à avoir enregistré un taux de pertes négatif.",
        keyPhrase: "La meilleure victoire est celle où l'ennemi devient un invité."
    },
    {
        id: 146,
        theme: "Politique",
        title: "La Guerre des Émeus",
        story: "En 1932, l'armée australienne déclara officiellement la guerre à une population de 20 000 émeus qui ravageaient les cultures. Armés de mitrailleuses Lewis et de milliers de munitions, les soldats pensaient la victoire facile. Mais les oiseaux, dotés d'une tactique de guérilla naturelle, se dispersaient rapidement et couraient plus vite que les véhicules. Après avoir gaspillé des milliers de balles pour abattre une poignée d'oiseaux, l'armée capitula. Les émeus avaient gagné la guerre.",
        keyPhrase: "La nature a sa propre stratégie que la poudre ne peut briser."
    },
    {
        id: 147,
        theme: "Politique",
        title: "La Chute en Pyjama",
        story: "Paul Deschanel, président français en 1920, voyageait de nuit en train présidentiel. Pris d'une insomnie et d'une envie de prendre l'air, il ouvrit la fenêtre de sa cabine. Le train tangua et le président bascula dans le vide, en pyjama, au milieu de la campagne. Il survécut et marcha jusqu'à la maison d'un garde-barrière, qui refusa d'abord de croire que cet homme écorché en vêtements de nuit dirigeait la France. La dignité de la fonction ne résista pas à l'anecdote.",
        keyPhrase: "Le pouvoir ne tient parfois qu'à une poignée de fenêtre mal fermée."
    },
    {
        id: 148,
        theme: "Politique",
        title: "La Mort Heureuse",
        story: "Félix Faure, président de la République française, mourut subitement en 1899 dans le salon bleu du palais de l'Élysée. Il n'était pas au travail, mais en charmante compagnie avec sa maîtresse, Marguerite Steinheil. La rumeur dit qu'il expira lors d'une gâterie un peu trop intense pour son cœur fatigué. Clemenceau eut ce mot cruel pour sa nécrologie : 'Il voulait être César, il ne fut que Pompée', scellant la légende d'une fin aussi tragique que scandaleuse.",
        keyPhrase: "Le plaisir ultime peut parfois être le dernier souffle."
    },
    {
        id: 149,
        theme: "Politique",
        title: "La Guerre de 38 Minutes",
        story: "Le 27 août 1896, le sultanat de Zanzibar refusa un ultimatum britannique demandant au nouveau sultan de descendre du trône. À 9h02, les navires de la Royal Navy ouvrirent le feu sur le palais. À 9h40, le drapeau du sultan fut amené et le feu cessa. Ce conflit détient le record de la guerre la plus courte de l'histoire. Le sultan eut à peine le temps de finir son petit-déjeuner que son règne et son palais étaient déjà en ruines.",
        keyPhrase: "L'histoire ne laisse parfois même pas le temps de cligner des yeux."
    },
    {
        id: 150,
        theme: "Politique",
        title: "Le Sénateur à Quatre Pattes",
        story: "L'empereur romain Caligula, ivre de pouvoir et de mépris pour les institutions, décida de ridiculiser le Sénat romain. Il nomma son cheval préféré, Incitatus, au rang de prêtre et projeta même de le faire consul, la plus haute charge de l'État. Le cheval avait une écurie en marbre, une mangeoire en ivoire et des esclaves à son service. Une façon brutale de rappeler aux sénateurs que leur vie valait moins que celle d'une bête de somme impériale.",
        keyPhrase: "Quand la folie tient les rênes, la bête s'assoit sur le trône."
    },
    {
        id: 151,
        theme: "Politique",
        title: "Le Procès du Cadavre",
        story: "En 897, le pape Étienne VI fit déterrer le cadavre de son prédécesseur, le pape Formose, mort depuis neuf mois. Il fit habiller le corps en décomposition des vêtements pontificaux, l'assit sur un trône et lui fit un procès public pour parjure. Le cadavre, resté silencieux, fut jugé coupable. On lui coupa les trois doigts de la bénédiction et on jeta sa dépouille dans le Tibre. La justice divine a parfois des odeurs de putréfaction terrestre.",
        keyPhrase: "La haine politique ne s'arrête pas aux portes du tombeau."
    },
    {
        id: 152,
        theme: "Politique",
        title: "La Guerre du Cochon",
        story: "En 1859, un fermier américain tua un cochon appartenant à un voisin irlandais sur l'île de San Juan, un territoire disputé entre les États-Unis et le Royaume-Uni. Ce simple fait divers déclencha une escalade militaire massive : navires de guerre, canons et milliers de soldats se firent face pendant des mois, prêts à déclencher une guerre mondiale pour du bacon. Heureusement, la seule victime de ce conflit international resta le cochon.",
        keyPhrase: "Une étincelle porcine peut faillir incendier deux empires."
    },
    {
        id: 153,
        theme: "Politique",
        title: "La Déroute des Lapins",
        story: "Après la signature des traités de Tilsit, Napoléon organisa une chasse au lapin pour célébrer. Son chef d'état-major acheta des centaines de lapins domestiques au lieu de lièvres sauvages. Lorsqu'ils furent relâchés, au lieu de fuir, les lapins, pensant qu'on allait les nourrir, foncèrent en masse vers l'Empereur. Submergé par une horde de boules de poils affamées, le conquérant de l'Europe dut battre en retraite et s'enfuir dans son carrosse.",
        keyPhrase: "Même le plus grand stratège peut être vaincu par la douceur du nombre."
    },
    {
        id: 154,
        theme: "Politique",
        title: "Le Châtiment de l'Eau",
        story: "Xerxès Ier, roi des Perses, fit construire un pont de bateaux pour traverser l'Hellespont et envahir la Grèce. Une tempête détruisit l'ouvrage. Furieux contre la nature elle-même, Xerxès ordonna que la mer reçoive 300 coups de fouet et fit jeter des chaînes dans l'eau pour 'l'emprisonner'. Il fit également décapiter les ingénieurs. Punir l'océan n'a pas empêché sa flotte de couler plus tard à Salamine, mais l'hubris du roi resta légendaire.",
        keyPhrase: "Fouetter les vagues n'empêche pas la tempête de revenir."
    },
    {
        id: 155,
        theme: "Politique",
        title: "Le Perroquet Vulgaire",
        story: "Andrew Jackson, 7ème président des USA, était connu pour son tempérament explosif et son langage fleuri. Son perroquet, Poll, avait tout retenu. Lors des funérailles nationales du président, le perroquet commença à débiter une telle quantité de jurons et d'obscénités appris de son maître qu'il dut être évacué de la cérémonie. Même dans la mort, la voix colérique du président continuait de résonner par le bec de l'oiseau.",
        keyPhrase: "Les mots que l'on sème finissent toujours par être répétés."
    },
    {
        id: 156,
        theme: "Politique",
        title: "La Peur du Petit Père",
        story: "Lorsque Joseph Staline fut frappé par une attaque cérébrale dans sa chambre, ses gardes entendirent sa chute. Cependant, il avait donné l'ordre strict de ne jamais le déranger sous peine de mort. Terrifiés par son autorité, personne n'osa entrer pendant des heures pour vérifier son état. Lorsqu'ils se décidèrent enfin, il était trop tard. Le dictateur mourut victime de la terreur absolue qu'il avait lui-même instaurée autour de sa personne.",
        keyPhrase: "Construire un mur de peur finit par vous enfermer seul avec la mort."
    },
    {
        id: 157,
        theme: "Politique",
        title: "Le Milkshake Empoisonné",
        story: "La CIA a tenté d'assassiner Fidel Castro plus de 600 fois. L'une des tentatives les plus proches du succès impliquait une pilule de poison à glisser dans son milkshake au chocolat favori à l'hôtel Habana Libre. Le serveur, un agent double, cacha la pilule dans le congélateur. Au moment de servir, la pilule avait gelé et collé à la paroi. En essayant de la décoller, elle se brisa, ruinant le plan. L'histoire a tenu à un problème de réfrigération.",
        keyPhrase: "Les complots les plus complexes se brisent parfois sur de la glace."
    },
    {
        id: 158,
        theme: "Politique",
        title: "L'Attaque du Lapin Nageur",
        story: "En 1979, le président Jimmy Carter pêchait seul dans une barque en Géorgie. Un lapin de marais, fuyant des prédateurs et nageant de manière erratique, s'approcha de son embarcation en sifflant de manière menaçante. Carter dut repousser l'animal avec sa pagaie. La presse s'empara de l'affaire, ridiculisant le président attaqué par un lapin tueur. Cet incident bizarre contribua à l'image de faiblesse qui le poursuivit durant son mandat.",
        keyPhrase: "Quand la nature se rebelle, le ridicule peut être une arme politique."
    },
    {
        id: 159,
        theme: "Politique",
        title: "La Pizza Présidentielle",
        story: "Lors d'une visite officielle à Washington en 1995, le président russe Boris Eltsine, connu pour son amour de la vodka, échappa à la vigilance des services secrets. Il fut retrouvé plus tard dans la rue, en caleçon, essayant de héler un taxi. Il expliqua aux agents stupéfaits qu'il voulait simplement aller manger une pizza. L'homme qui détenait les codes nucléaires russes errait à moitié nu pour une part de pepperoni.",
        keyPhrase: "Même au sommet du monde, la faim ramène aux besoins les plus simples."
    },
    {
        id: 160,
        theme: "Politique",
        title: "Les Excuses de la Victime",
        story: "En 2006, le vice-président américain Dick Cheney chassait la caille au Texas. En se tournant pour tirer, il envoya une gerbe de plombs dans le visage de son ami Harry Whittington. L'histoire prit une tournure surréaliste lorsque la victime, à sa sortie de l'hôpital avec des plombs encore dans le cœur, fit une conférence de presse pour s'excuser publiquement auprès de Cheney pour 'les troubles occasionnés'. Le pouvoir ne demande jamais pardon.",
        keyPhrase: "La véritable puissance est quand la victime s'excuse d'avoir été sur le chemin."
    },
    {
        id: 161,
        theme: "Politique",
        title: "Le Maire en Fumée",
        story: "Rob Ford, maire de Toronto, fut filmé en train de fumer du crack dans une vidéo scandaleuse. Au lieu de démissionner, il admit les faits en précisant qu'il était 'probablement dans une de ses phases d'ivresse'. Contre toute attente, sa popularité grimpa en flèche après les révélations. Il devint une célébrité mondiale, prouvant que pour une partie de l'électorat, le spectacle de l'autodestruction est plus divertissant que la bonne gestion.",
        keyPhrase: "Le scandale n'est pas une fin, c'est parfois un nouveau carburant."
    },
    {
        id: 162,
        theme: "Politique",
        title: "La Laitue Gagnante",
        story: "En 2022, le mandat de la Première ministre britannique Liz Truss semblait si fragile qu'un tabloïd lança un pari en direct : qui durerait le plus longtemps, Liz Truss ou une laitue iceberg achetée au supermarché ? La laitue fut filmée jour et nuit avec une perruque. Liz Truss démissionna après seulement 49 jours, faisant de la salade la grande gagnante politique de l'année. La légitimité avait flétri plus vite que le légume.",
        keyPhrase: "La date de péremption du pouvoir est parfois plus courte que celle du frais."
    },
    {
        id: 163,
        theme: "Politique",
        title: "Le Calendrier Réécrit",
        story: "Saparmurat Niyazov, dictateur du Turkménistan, décida que les noms des mois étaient trop banals. Il renomma le mois de janvier en son propre nom et le mois d'avril du nom de sa mère (ou du pain, selon les sources). Il fit aussi construire une statue en or de lui-même qui tournait pour toujours faire face au soleil. Il voulait que le temps et la lumière tournent littéralement autour de sa personne.",
        keyPhrase: "Vouloir contrôler le temps ne vous rend pas éternel pour autant."
    },
    {
        id: 164,
        theme: "Politique",
        title: "Le Fléau Sanguin",
        story: "Attila le Hun, le 'Fléau de Dieu' qui avait terrifié l'Empire romain, ne mourut pas au combat. Lors de sa nuit de noces avec une nouvelle épouse, Ildico, il but énormément et s'endormit sur le dos. Il saigna du nez durant son sommeil. Trop ivre pour se réveiller, le sang coula dans sa gorge et il mourut noyé dans son propre fluide vital. Le guerrier que le fer ne pouvait tuer fut vaincu par un simple vaisseau sanguin.",
        keyPhrase: "On peut conquérir le monde et se noyer dans une goutte de son propre sang."
    },
    {
        id: 165,
        theme: "Politique",
        title: "Le Roi Tireur",
        story: "Le roi Zog Ier d'Albanie détient le record du chef d'État ayant survécu au plus grand nombre de tentatives d'assassinat (plus de 50). En 1931, alors qu'il sortait de l'opéra à Vienne, des assassins ouvrirent le feu. Zog, qui ne se séparait jamais de son revolver, sortit son arme et riposta, tirant sur ses agresseurs. Il est le seul monarque de l'histoire moderne à avoir rendu les coups de feu lors de son propre attentat.",
        keyPhrase: "La meilleure défense est parfois de vider son propre chargeur."
    },
    {
        id: 166,
        theme: "Politique",
        title: "La Tente du Désert",
        story: "Mouammar Kadhafi, lors de ses voyages officiels à Paris, Rome ou New York, refusait de dormir à l'hôtel. Il exigeait de planter sa gigantesque tente bédouine dans les jardins des palais présidentiels ou à Central Park, amenant avec lui ses amazones et ses chameaux. Ce caprice diplomatique transformait chaque sommet international en cirque logistique, imposant l'esthétique du désert au cœur des capitales occidentales.",
        keyPhrase: "Le pouvoir, c'est d'imposer son toit là où les autres ont des murs."
    },
    {
        id: 167,
        theme: "Politique",
        title: "Le Papier de la Paix",
        story: "En 1938, Neville Chamberlain revint de Munich en agitant une feuille de papier signée par Hitler, déclarant fièrement 'La paix pour notre temps'. Il croyait sincèrement avoir évité la guerre par la diplomatie. Moins d'un an plus tard, l'Europe était à feu et à sang. Ce bout de papier est devenu le symbole éternel de la naïveté politique face à la malveillance absolue.",
        keyPhrase: "L'encre sèche plus vite que le sang ne coule."
    },
    {
        id: 168,
        theme: "Politique",
        title: "La Morsure du Singe",
        story: "Le roi Alexandre Ier de Grèce se promenait dans ses jardins royaux en 1920 lorsqu'il tenta de séparer son chien qui se battait avec un singe domestique. Le singe mordit le roi à la jambe. La plaie s'infecta, la septicémie se déclara et le roi mourut peu après. Sa mort entraîna un changement de régime, le retour de son père, et une guerre désastreuse contre la Turquie. Un empire a vacillé à cause d'une dent de macaque.",
        keyPhrase: "Le destin d'une nation tient parfois à l'humeur d'un petit animal."
    },
    {
        id: 169,
        theme: "Politique",
        title: "La Défenestration Molle",
        story: "En 1618, des représentants catholiques furent jetés par la fenêtre du château de Prague par des protestants en colère. Ils firent une chute de 21 mètres. Miraculeusement, ils survécurent tous. Les catholiques crièrent au miracle divin, affirmant que des anges les avaient portés. Les protestants, plus pragmatiques, firent remarquer qu'ils étaient simplement tombés dans un énorme tas de fumier accumulé dans les douves sèches.",
        keyPhrase: "La survie dépend parfois de la quantité d'ordures qui nous attend en bas."
    },
    {
        id: 170,
        theme: "Politique",
        title: "Le Discours Blindé",
        story: "En 1912, Teddy Roosevelt fut victime d'une tentative d'assassinat avant un meeting. La balle de calibre 38 lui perça la poitrine, mais fut ralentie par son étui à lunettes en acier et le manuscrit de son discours de 50 pages plié dans sa poche. Saignant abondamment mais sentant qu'il n'avait pas de sang dans la bouche, il insista pour prononcer son discours pendant 90 minutes avant d'aller à l'hôpital. 'Il faut plus que ça pour tuer un élan', dit-il.",
        keyPhrase: "Les mots peuvent sauver une vie, surtout s'ils sont écrits sur du papier épais."
    },
    {
        id: 171,
        theme: "Politique",
        title: "La Trahison Ultime",
        story: "Jules César, l'homme le plus puissant de Rome, entra au Sénat sans garde, confiant en son autorité et ignorant les avertissements. Lorsqu'il fut entouré par les conjurés, il vit parmi eux Brutus, qu'il considérait comme un fils. Il cessa alors de se défendre, couvrit son visage de sa toge et accepta les 23 coups de poignard. La douleur de la trahison fut plus tranchante que l'acier des lames.",
        keyPhrase: "Le coup le plus mortel est celui porté par la main qu'on a serrée."
    },
    {
        id: 172,
        theme: "Politique",
        title: "La Faim du Roi",
        story: "Louis XVI, fuyant la Révolution française avec sa famille, aurait pu réussir son évasion vers l'étranger. Mais le roi, grand gourmand, insista pour faire des pauses repas et voyager confortablement, ralentissant considérablement le convoi. À Varennes, ce retard permit au maître de poste Drouet, qui l'avait reconnu grâce à une pièce de monnaie, de donner l'alerte. L'appétit royal a coûté sa tête à la monarchie.",
        keyPhrase: "S'arrêter pour le confort, c'est laisser l'histoire vous rattraper."
    },
    {
        id: 173,
        theme: "Politique",
        title: "La Collection d'Imelda",
        story: "Lorsque le peuple philippin prit d'assaut le palais présidentiel après la fuite du dictateur Ferdinand Marcos en 1986, ils découvrirent le train de vie extravagant de la Première dame, Imelda. Dans ses placards, on trouva plus de 3000 paires de chaussures de luxe, alors que le peuple vivait dans la pauvreté. Cette montagne de cuir et de talons est devenue le symbole mondial de la corruption déconnectée de la réalité.",
        keyPhrase: "L'excès laisse une empreinte que l'histoire n'efface jamais."
    },
    {
        id: 174,
        theme: "Politique",
        title: "Le Roi de Verre",
        story: "Le roi Charles VI de France sombra dans une folie étrange. Il était persuadé que son corps était entièrement fait de verre. Il refusait qu'on le touche et faisait insérer des tiges de fer dans ses vêtements pour éviter de se 'briser' en cas de choc. Le souverain du royaume le plus puissant d'Europe vivait dans la terreur permanente d'éclater en mille morceaux, paralysant la cour et le pays.",
        keyPhrase: "La fragilité du pouvoir est parfois littérale dans l'esprit du monarque."
    },
    {
        id: 175,
        theme: "Politique",
        title: "La Victoire Amère",
        story: "Le roi Pyrrhus d'Épire combattit les Romains et remporta la bataille d'Héraclée, mais au prix de pertes effroyables parmi ses meilleures troupes. Contemplant le champ de bataille jonché de ses amis morts, il déclara : 'Encore une victoire comme celle-ci et nous sommes perdus'. Il donna son nom à la 'victoire à la Pyrrhus', celle qui coûte si cher qu'elle ressemble trait pour trait à une défaite.",
        keyPhrase: "Gagner à tout prix revient souvent à tout perdre."
    },
    {
        id: 176,
        theme: "Politique",
        title: "Les Funérailles Explosives",
        story: "Guillaume le Conquérant devint extrêmement obèse à la fin de sa vie. Lors de ses funérailles, son corps gonflé par la chaleur et la décomposition ne rentrait pas dans le sarcophage de pierre. Les évêques et les moines forcèrent pour le faire entrer. Le corps éclata littéralement sous la pression, répandant une odeur pestilentielle insupportable dans l'église. La cérémonie fut expédiée en vitesse, les invités fuyant l'horreur olfactive.",
        keyPhrase: "La grandeur d'un homme ne devrait pas dépasser la taille de sa dernière demeure."
    },
    {
        id: 177,
        theme: "Politique",
        title: "L'Erreur de Distance",
        story: "Pendant la guerre de Sécession, le général John Sedgwick inspectait ses troupes sous le feu ennemi. Voyant ses hommes se baisser par peur des balles, il se moqua d'eux en restant debout : 'Ils ne pourraient pas toucher un éléphant à cette dist...'. Il fut interrompu par une balle de tireur d'élite qui le frappa sous l'œil gauche, le tuant sur le coup. L'ironie fut sa dernière parole.",
        keyPhrase: "Le mépris du danger offre une cible parfaite au destin."
    },
    {
        id: 178,
        theme: "Politique",
        title: "Le Remède Mortel",
        story: "George Washington, premier président des USA, tomba malade d'une infection de la gorge. Ses médecins, suivant la meilleure science de l'époque, décidèrent de le soigner par la saignée. Ils lui retirèrent près de 40% de son sang en quelques heures, l'affaiblissant fatalement. Il mourut sans doute plus du traitement que de la maladie elle-même, victime de la médecine de son temps.",
        keyPhrase: "Vouloir purger le mal peut parfois vider la vie elle-même."
    },
    {
        id: 179,
        theme: "Politique",
        title: "Le Maire Félin",
        story: "Déçus par les politiciens humains, les habitants de Talkeetna, en Alaska, élurent un chat nommé Stubbs comme maire honoraire. Il occupa ce poste pendant 20 ans. Il buvait de l'eau avec de l'herbe à chat dans un verre à vin tous les jours au bar local et attirait les touristes. Il n'a jamais augmenté les impôts ni déclenché de guerre, ce qui fait de lui, techniquement, l'un des meilleurs maires de l'histoire.",
        keyPhrase: "Le silence et la sieste sont parfois la meilleure politique."
    },
    {
        id: 180,
        theme: "Politique",
        title: "La Fuite Déguisée",
        story: "En 1945, Benito Mussolini tenta de fuir l'Italie vers la Suisse caché dans un convoi allemand. Il se déguisa en soldat de la Luftwaffe, portant un casque trop grand et un manteau militaire, feignant d'être ivre pour ne pas parler. Malgré la mascarade, des partisans reconnurent ses traits distinctifs. Le Duce, qui avait cultivé l'image du surhomme, finit sa course tremblant au fond d'un camion, trahi par son propre visage.",
        keyPhrase: "Le masque ne cache jamais ce que tout le monde connaît déjà."
    },
    {
        id: 181,
        theme: "Politique",
        title: "Le Golfeur Divin",
        story: "La propagande nord-coréenne a affirmé que lors de sa toute première partie de golf, Kim Jong-il avait réalisé 11 trous en un coup et fini avec un score de 38 sous le par. Un exploit statistiquement impossible même pour un dieu. Ses gardes du corps, terrifiés, notaient scrupuleusement chaque coup imaginaire. Cette anecdote illustre l'absurdité totale du culte de la personnalité poussé à son paroxysme.",
        keyPhrase: "Quand la réalité est interdite, le miracle devient obligatoire."
    },
    {
        id: 182,
        theme: "Politique",
        title: "La Guerre du Football",
        story: "En 1969, les tensions entre le Honduras et le Salvador étaient à leur comble. Une série de trois matchs de qualification pour la Coupe du Monde de football servit de catalyseur. Des émeutes éclatèrent après chaque match, les supporters s'affrontèrent, et finalement, les armées envahirent les frontières. La 'Guerre de Cent Heures' fit des milliers de morts. Le sport, censé unir les peuples, devint le sifflet du coup d'envoi d'un massacre.",
        keyPhrase: "Le jeu cesse d'être un jeu quand le sang remplace la sueur."
    }

];
const THEMES = [...new Set(GAME_DATA.map(item => item.theme))];