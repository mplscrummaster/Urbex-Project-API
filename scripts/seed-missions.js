import db from "../db/index.js";
// Vide la table missions avant insertion
db.prepare("DELETE FROM missions").run();

// Récupère les scénarios directement depuis la base pour garantir la cohérence des IDs
const scenarios = db.prepare("SELECT * FROM scenarios").all();
// ...existing code...
import { communes } from "./seed-communes.cjs";
const missionsData = [
  {
    title_mission: "L'ancienne cimenterie",
    riddle_text:
      "De quelle matière grise ces murs portent-ils encore la poussière ?",
    answer_word: "ciment",
  },
  {
    title_mission: "La verrerie oubliée",
    riddle_text:
      "Quelle matière translucide a pris forme entre ces murs brûlants ?",
    answer_word: "verre",
  },
  {
    title_mission: "La briqueterie désaffectée",
    riddle_text: "Quel matériau façonné ici bâtissait les murs des villes ?",
    answer_word: "brique",
  },
  {
    title_mission: "L'usine textile",
    riddle_text: "Quelle matière souple dansait autrefois dans ce vacarme ?",
    answer_word: "tissu",
  },
  {
    title_mission: "La filature endormie",
    riddle_text: "Quelle fibre blanche s'enroulait sans fin sur ces machines ?",
    answer_word: "coton",
  },
  {
    title_mission: "La centrale électrique",
    riddle_text: "Quelle force invisible animait autrefois ces colosses ?",
    answer_word: "électricité",
  },
  {
    title_mission: "Le dépôt ferroviaire",
    riddle_text:
      "Quel moyen de transport reposait ici en attendant son prochain voyage ?",
    answer_word: "train",
  },
  {
    title_mission: "Le hangar rouillé",
    riddle_text: "Quel métal ronge lentement les parois de ce lieu ?",
    answer_word: "fer",
  },
  {
    title_mission: "La scierie abandonnée",
    riddle_text: "Quelle matière naturelle était découpée ici en planches ?",
    answer_word: "bois",
  },
  {
    title_mission: "Le silo à grains",
    riddle_text: "Quelle ressource nourrissait autrefois ce ventre de béton ?",
    answer_word: "grain",
  },
  {
    title_mission: "L'ancienne fonderie",
    riddle_text: "Quelle matière liquide et brûlante était domptée ici ?",
    answer_word: "métal",
  },
  {
    title_mission: "Le moulin industriel",
    riddle_text: "Quelle denrée était broyée ici avec régularité ?",
    answer_word: "farine",
  },
  {
    title_mission: "Le quai désert",
    riddle_text:
      "Quel type d'endroit servait de point de transit pour les marchandises ?",
    answer_word: "quai",
  },
  {
    title_mission: "Le garage oublié",
    riddle_text:
      "Quel moyen de transport dormait ici en attendant d'être réparé ?",
    answer_word: "voiture",
  },
  {
    title_mission: "L'atelier mécanique",
    riddle_text:
      "Quel type de lieu servait à réparer et construire des pièces métalliques ?",
    answer_word: "atelier",
  },
  {
    title_mission: "Le poste de contrôle",
    riddle_text:
      "Quel mot décrit cet endroit où l'on surveillait et dirigeait les opérations ?",
    answer_word: "poste",
  },
  {
    title_mission: "La station de pompage",
    riddle_text: "Quel élément essentiel était déplacé ici en continu ?",
    answer_word: "eau",
  },
  {
    title_mission: "La carrière effondrée",
    riddle_text: "Quelle ressource solide arrachait-on ici à la terre ?",
    answer_word: "pierre",
  },
  {
    title_mission: "Le chantier naval",
    riddle_text:
      "Quel type d'engin était construit dans ce lieu aujourd'hui désert ?",
    answer_word: "bateau",
  },
  {
    title_mission: "L'écluse rouillée",
    riddle_text:
      "Quel ouvrage permettait autrefois aux bateaux de franchir des différences de niveau ?",
    answer_word: "écluse",
  },
  {
    title_mission: "La mine oubliée",
    riddle_text: "Quel trésor caché extrayait-on autrefois de ses entrailles ?",
    answer_word: "minerai",
  },
  {
    title_mission: "Le tunnel effondré",
    riddle_text:
      "Quel passage souterrain servait jadis à relier deux points oubliés ?",
    answer_word: "tunnel",
  },
  {
    title_mission: "Le puits de mine",
    riddle_text:
      "Par quel conduit les hommes plongeaient-ils vers les profondeurs ?",
    answer_word: "puits",
  },
  {
    title_mission: "Le téléphérique figé",
    riddle_text:
      "Quel moyen aérien transportait hommes et marchandises sur ces câbles ?",
    answer_word: "téléphérique",
  },
  {
    title_mission: "Le réservoir abandonné",
    riddle_text: "Quel élément remplissait autrefois ce géant creux ?",
    answer_word: "eau",
  },
  {
    title_mission: "La grue figée",
    riddle_text:
      "Quel outil métallique soulevait autrefois les charges les plus lourdes ?",
    answer_word: "grue",
  },
  {
    title_mission: "La centrale à charbon",
    riddle_text:
      "Quelle matière fossile alimentait ici les chaudières géantes ?",
    answer_word: "charbon",
  },
  {
    title_mission: "Le haut-fourneau",
    riddle_text:
      "Quel édifice servait à fondre le minerai en métal incandescent ?",
    answer_word: "fourneau",
  },
  {
    title_mission: "La raffinerie désertée",
    riddle_text:
      "Quel lieu transformait ici la matière brute en liquide précieux ?",
    answer_word: "raffinerie",
  },
  {
    title_mission: "Le poste électrique",
    riddle_text:
      "Quel type d'énergie circulait ici, invisible mais puissante ?",
    answer_word: "électricité",
  },
  {
    title_mission: "L'hôpital en ruine",
    riddle_text: "Quel type d'établissement soignait autrefois les corps ici ?",
    answer_word: "hôpital",
  },
  {
    title_mission: "Le sanatorium",
    riddle_text:
      "Quel lieu accueillait autrefois les malades en quête d'air pur ?",
    answer_word: "sanatorium",
  },
  {
    title_mission: "L'hospice déserté",
    riddle_text:
      "Quel mot désigne un lieu où les plus fragiles finissaient leurs jours ?",
    answer_word: "hospice",
  },
  {
    title_mission: "L'orphelinat oublié",
    riddle_text: "Quel type d'institution abritait ici des vies sans parents ?",
    answer_word: "orphelinat",
  },
  {
    title_mission: "Le pensionnat abandonné",
    riddle_text: "Quel lieu accueillait ici des élèves venus de loin ?",
    answer_word: "pensionnat",
  },
  {
    title_mission: "L'école communale",
    riddle_text:
      "Quel type d'établissement instruisait les enfants du village ?",
    answer_word: "école",
  },
  {
    title_mission: "Le gymnase effondré",
    riddle_text:
      "Quel lieu résonnait autrefois des cris et des courses des élèves ?",
    answer_word: "gymnase",
  },
  {
    title_mission: "Le théâtre abandonné",
    riddle_text: "Quel type de lieu accueillait ici des représentations ?",
    answer_word: "théâtre",
  },
  {
    title_mission: "Le cinéma poussiéreux",
    riddle_text:
      "Quel type de bâtiment projetait autrefois des histoires en lumière ?",
    answer_word: "cinéma",
  },
  {
    title_mission: "La mairie vide",
    riddle_text:
      "Quel bâtiment servait autrefois de centre décisionnel local ?",
    answer_word: "mairie",
  },
  {
    title_mission: "Le tribunal en friche",
    riddle_text: "Quel lieu rendait ici autrefois des jugements officiels ?",
    answer_word: "tribunal",
  },
  {
    title_mission: "La poste déserte",
    riddle_text:
      "Quel bâtiment servait autrefois à distribuer des lettres et colis ?",
    answer_word: "poste",
  },
  {
    title_mission: "La bibliothèque silencieuse",
    riddle_text: "Quel type de lieu conserve les mots et le savoir ?",
    answer_word: "bibliothèque",
  },
  {
    title_mission: "Le musée fermé",
    riddle_text: "Quel lieu abritait jadis des collections précieuses ?",
    answer_word: "musée",
  },
  {
    title_mission: "L'observatoire déserté",
    riddle_text: "Quel bâtiment scrutait autrefois le ciel étoilé ?",
    answer_word: "observatoire",
  },
  {
    title_mission: "L'hôtel de ville en ruine",
    riddle_text:
      "Quel bâtiment symbolisait autrefois l'administration municipale ?",
    answer_word: "hôtel",
  },
  {
    title_mission: "Le château d'eau",
    riddle_text: "Quelle ressource vitale ce géant contenait-il en hauteur ?",
    answer_word: "eau",
  },
  {
    title_mission: "La prison oubliée",
    riddle_text: "Quel lieu enfermait autrefois ceux privés de liberté ?",
    answer_word: "prison",
  },
  {
    title_mission: "La caserne désaffectée",
    riddle_text: "Quel type de bâtiment abritait soldats ou pompiers ?",
    answer_word: "caserne",
  },
  {
    title_mission: "Le bunker enfoui",
    riddle_text: "Quel abri souterrain servait autrefois en cas de menace ?",
    answer_word: "bunker",
  },
  {
    title_mission: "L'église effondrée",
    riddle_text:
      "Quel édifice religieux se dresse souvent au cœur des villages ?",
    answer_word: "église",
  },
  {
    title_mission: "L'abbatiale",
    riddle_text:
      "Quel type d'édifice abritait autrefois des communautés religieuses ?",
    answer_word: "abbatiale",
  },
  {
    title_mission: "Le cloître silencieux",
    riddle_text:
      "Quel espace architectural reliait jadis les bâtiments monastiques ?",
    answer_word: "cloître",
  },
  {
    title_mission: "Le réfectoire des moines",
    riddle_text: "Quel lieu servait aux repas collectifs dans les abbayes ?",
    answer_word: "réfectoire",
  },
  {
    title_mission: "La chapelle souterraine",
    riddle_text: "Quel édifice religieux discret se cachait sous terre ?",
    answer_word: "chapelle",
  },
  {
    title_mission: "Le sanctuaire oublié",
    riddle_text: "Quel mot désigne un lieu consacré à une divinité ?",
    answer_word: "sanctuaire",
  },
  {
    title_mission: "L'autel brisé",
    riddle_text: "Quel objet religieux servait à célébrer les rituels ?",
    answer_word: "autel",
  },
  {
    title_mission: "La crypte enfouie",
    riddle_text: "Quel espace souterrain servait autrefois de sépulture ?",
    answer_word: "crypte",
  },
  {
    title_mission: "Le monastère déserté",
    riddle_text:
      "Quel lieu abritait une communauté religieuse retirée du monde ?",
    answer_word: "monastère",
  },
  {
    title_mission: "L'ermitage dans la roche",
    riddle_text: "Quel mot désigne l'habitat d'un religieux vivant seul ?",
    answer_word: "ermitage",
  },
  {
    title_mission: "Le couvent en ruine",
    riddle_text: "Quel type de bâtiment religieux abritait souvent des sœurs ?",
    answer_word: "couvent",
  },
  {
    title_mission: "Le clocher fissuré",
    riddle_text:
      "Quelle structure élancée abritait jadis les cloches d'une église ?",
    answer_word: "clocher",
  },
  {
    title_mission: "Le presbytère abandonné",
    riddle_text:
      "Quel bâtiment servait autrefois de demeure au prêtre du village ?",
    answer_word: "presbytère",
  },
  {
    title_mission: "Le jardin de l'abbé",
    riddle_text:
      "Quel espace vert soigné appartenait au chef spirituel du lieu ?",
    answer_word: "jardin",
  },
  {
    title_mission: "Le cimetière envahi",
    riddle_text: "Quel lieu accueille le repos éternel des disparus ?",
    answer_word: "cimetière",
  },
  {
    title_mission: "Le calvaire moussu",
    riddle_text:
      "Quel monument religieux marque souvent un lieu de dévotion en plein air ?",
    answer_word: "calvaire",
  },
  {
    title_mission: "Le baptistère ancien",
    riddle_text:
      "Quel édifice était consacré au rite d'entrée dans la communauté chrétienne ?",
    answer_word: "baptistère",
  },
  {
    title_mission: "Le cloître envahi",
    riddle_text:
      "Quel espace architectural était le cœur silencieux d'un monastère ?",
    answer_word: "cloître",
  },
  {
    title_mission: "Le tombeau scellé",
    riddle_text: "Quel lieu garde en silence celui qui y repose ?",
    answer_word: "tombeau",
  },
  {
    title_mission: "L'autel des saints perdus",
    riddle_text: "Quel meuble sacré servait à célébrer les offices religieux ?",
    answer_word: "autel",
  },
  {
    title_mission: "Le manoir abandonné",
    riddle_text: "Quel type d'habitation noble est désormais livrée au temps ?",
    answer_word: "manoir",
  },
  {
    title_mission: "La villa déchue",
    riddle_text: "Quel mot désigne une demeure luxueuse aujourd'hui en ruine ?",
    answer_word: "villa",
  },
  {
    title_mission: "La maison du gardien",
    riddle_text:
      "Quel logement modeste servait à héberger le surveillant d'un domaine ?",
    answer_word: "maison",
  },
  {
    title_mission: "La ferme en ruine",
    riddle_text:
      "Quel bâtiment agricole nourrissait autrefois toute une famille ?",
    answer_word: "ferme",
  },
  {
    title_mission: "La grange effondrée",
    riddle_text: "Quel type de bâtiment servait autrefois à stocker le foin ?",
    answer_word: "grange",
  },
  {
    title_mission: "Le pavillon déserté",
    riddle_text:
      "Quel petit bâtiment indépendant servait autrefois d'habitation secondaire ?",
    answer_word: "pavillon",
  },
  {
    title_mission: "L'immeuble fantôme",
    riddle_text:
      "Quel type de bâtiment abritait autrefois de nombreux logements ?",
    answer_word: "immeuble",
  },
  {
    title_mission: "Le grenier oublié",
    riddle_text:
      "Quel espace sous les toits cache souvent les souvenirs d'une maison ?",
    answer_word: "grenier",
  },
  {
    title_mission: "La cave scellée",
    riddle_text:
      "Quel espace souterrain servait autrefois à stocker vivres et vins ?",
    answer_word: "cave",
  },
  {
    title_mission: "Le pigeonnier envahi",
    riddle_text:
      "Quel petit édifice abritait autrefois des volatiles domestiqués ?",
    answer_word: "pigeonnier",
  },
  {
    title_mission: "Le puits asséché",
    riddle_text: "Quel élément vital a disparu de ce trou oublié ?",
    answer_word: "eau",
  },
  {
    title_mission: "Le kiosque rouillé",
    riddle_text:
      "Quel petit édifice de jardin accueillait autrefois promeneurs et musiciens ?",
    answer_word: "kiosque",
  },
  {
    title_mission: "La fontaine oubliée",
    riddle_text: "Quel ouvrage déversait autrefois l'eau au cœur du village ?",
    answer_word: "fontaine",
  },
  {
    title_mission: "Le lavoir déserté",
    riddle_text: "Quel lieu servait autrefois aux lavandières ?",
    answer_word: "lavoir",
  },
  {
    title_mission: "La tour de guet",
    riddle_text:
      "Quel type de structure servait autrefois à surveiller les environs ?",
    answer_word: "tour",
  },
  {
    title_mission: "Le bastion effrité",
    riddle_text:
      "Quel élément défensif d'une forteresse s'est lentement désagrégé ici ?",
    answer_word: "bastion",
  },
  {
    title_mission: "Le portail effondré",
    riddle_text: "Quel élément d'entrée monumentale est ici en ruine ?",
    answer_word: "portail",
  },
  {
    title_mission: "La cour intérieure",
    riddle_text:
      "Quel espace ouvert servait autrefois de cœur aux bâtiments alentour ?",
    answer_word: "cour",
  },
  {
    title_mission: "Le cellier humide",
    riddle_text: "Quel espace frais était idéal pour conserver le vin ?",
    answer_word: "cellier",
  },
  {
    title_mission: "L'escalier suspendu",
    riddle_text: "Quel élément architectural reliait jadis les étages ici ?",
    answer_word: "escalier",
  },
  {
    title_mission: "Le théâtre romain",
    riddle_text:
      "Quel type de structure antique accueillait spectacles et foules ?",
    answer_word: "théâtre",
  },
  {
    title_mission: "Le cirque romain",
    riddle_text: "Quel lieu antique était dédié aux courses de chars ?",
    answer_word: "cirque",
  },
  {
    title_mission: "L'amphithéâtre oublié",
    riddle_text: "Quel édifice accueillait jadis des combats et spectacles ?",
    answer_word: "amphithéâtre",
  },
  {
    title_mission: "Le fort englouti",
    riddle_text:
      "Quel type de structure défensive repose aujourd'hui sous la surface ?",
    answer_word: "fort",
  },
  {
    title_mission: "Le passage secret",
    riddle_text:
      "Quel type de chemin caché reliait souvent des bâtiments stratégiques ?",
    answer_word: "passage",
  },
  {
    title_mission: "Le souterrain des moines",
    riddle_text:
      "Quel type de galerie creusée sous terre abritait jadis des allées discrètes ?",
    answer_word: "souterrain",
  },
  {
    title_mission: "Le labyrinthe végétal",
    riddle_text:
      "Quel type d'installation naturelle pouvait égarer les promeneurs ?",
    answer_word: "labyrinthe",
  },
  {
    title_mission: "Le pont effondré",
    riddle_text:
      "Quel ouvrage permettait autrefois de franchir l'obstacle naturel ?",
    answer_word: "pont",
  },
  {
    title_mission: "La tour penchée",
    riddle_text: "Quel édifice vertical défie ici la gravité ?",
    answer_word: "tour",
  },
  {
    title_mission: "La salle aux fresques",
    riddle_text:
      "Quel type de décor peint orne les murs anciens de cette pièce ?",
    answer_word: "fresque",
  },
  {
    title_mission: "La galerie des statues",
    riddle_text: "Quel type d'œuvre sculptée ornait autrefois ces alcôves ?",
    answer_word: "statue",
  },
  {
    title_mission: "Le jardin suspendu",
    riddle_text:
      "Quel type d'espace vert s'élevait autrefois au-dessus du sol ?",
    answer_word: "jardin",
  },
  {
    title_mission: "La porte condamnée",
    riddle_text: "Quel élément architectural bloque ici tout accès ?",
    answer_word: "porte",
  },
  {
    title_mission: "Le dôme fissuré",
    riddle_text:
      "Quel élément architectural en forme de voûte s'élève au-dessus de la salle ?",
    answer_word: "dôme",
  },
  {
    title_mission: "Le passage des ombres",
    riddle_text: "Quel mot désigne cet étroit couloir mystérieux ?",
    answer_word: "passage",
  },
  {
    title_mission: "Le pavé mosaïque",
    riddle_text:
      "Quel type de décor composé de petits fragments recouvre ici le sol ?",
    answer_word: "mosaïque",
  },
  {
    title_mission: "Le belvédère désert",
    riddle_text:
      "Quel lieu élevé offrait autrefois une vue dégagée sur les environs ?",
    answer_word: "belvédère",
  },
  {
    title_mission: "La place silencieuse",
    riddle_text:
      "Quel espace public était autrefois le point de rencontre des habitants ?",
    answer_word: "place",
  },
  {
    title_mission: "Le tunnel des lanternes",
    riddle_text: "Quel mot désigne ce long passage creusé dans la pierre ?",
    answer_word: "tunnel",
  },
  {
    title_mission: "La salle d'orgue",
    riddle_text: "Quel instrument résonnait autrefois ici avec puissance ?",
    answer_word: "orgue",
  },
  {
    title_mission: "La forêt engloutie",
    riddle_text:
      "Quel type d'écosystème boisé repose maintenant sous les eaux ?",
    answer_word: "forêt",
  },
  {
    title_mission: "La carrière inondée",
    riddle_text:
      "Quel type de site d'extraction s'est transformé ici en bassin ?",
    answer_word: "carrière",
  },
  {
    title_mission: "La cascade oubliée",
    riddle_text: "Quel phénomène naturel s'écoule ici en hauteur ?",
    answer_word: "cascade",
  },
  {
    title_mission: "Le gouffre silencieux",
    riddle_text: "Quel mot désigne ce trou profond et abrupt dans la terre ?",
    answer_word: "gouffre",
  },
  {
    title_mission: "La grotte scellée",
    riddle_text: "Quel type de cavité naturelle s'ouvre ici sous la roche ?",
    answer_word: "grotte",
  },
  {
    title_mission: "La clairière des statues",
    riddle_text: "Quel mot désigne cet espace dégagé au milieu d'une forêt ?",
    answer_word: "clairière",
  },
  {
    title_mission: "Le pont moussu",
    riddle_text: "Quel type d'ouvrage permet de traverser un cours d'eau ?",
    answer_word: "pont",
  },
  {
    title_mission: "Le lac asséché",
    riddle_text: "Quel plan d'eau a ici disparu, ne laissant que son lit nu ?",
    answer_word: "lac",
  },
  {
    title_mission: "La falaise creusée",
    riddle_text: "Quel type de relief vertical domine cet endroit ?",
    answer_word: "falaise",
  },
  {
    title_mission: "Le dolmen isolé",
    riddle_text: "Quel monument mégalithique se dresse ici, solitaire ?",
    answer_word: "dolmen",
  },
  {
    title_mission: "Le menhir fendu",
    riddle_text:
      "Quel bloc de pierre dressé trône ici depuis des millénaires ?",
    answer_word: "menhir",
  },
  {
    title_mission: "La source oubliée",
    riddle_text: "Quel point d'eau naturelle jaillit ici de la terre ?",
    answer_word: "source",
  },
  {
    title_mission: "Le bois hanté",
    riddle_text: "Quel type d'espace naturel dense et sombre entoure ce lieu ?",
    answer_word: "bois",
  },
  {
    title_mission: "Le marais stagnant",
    riddle_text: "Quel type de zone humide est ici figée dans le temps ?",
    answer_word: "marais",
  },
  {
    title_mission: "La lande désertée",
    riddle_text: "Quel type de paysage ouvert, pauvre en arbres, s'étend ici ?",
    answer_word: "lande",
  },
  {
    title_mission: "La rivière souterraine",
    riddle_text: "Quel élément naturel coule ici à l'abri de la lumière ?",
    answer_word: "rivière",
  },
  {
    title_mission: "La plage abandonnée",
    riddle_text:
      "Quel lieu autrefois animé s'étend aujourd'hui désert sous le vent marin ?",
    answer_word: "plage",
  },
  {
    title_mission: "La dune figée",
    riddle_text: "Quel relief mouvant s'est immobilisé ici avec le temps ?",
    answer_word: "dune",
  },
  {
    title_mission: "Le sentier oublié",
    riddle_text: "Quel chemin discret a disparu des cartes ?",
    answer_word: "sentier",
  },
  {
    title_mission: "Le jardin envahi",
    riddle_text:
      "Quel espace autrefois soigné est aujourd'hui livré à la végétation ?",
    answer_word: "jardin",
  },
  {
    title_mission: "L'autoroute fantôme",
    riddle_text: "Quel type d'infrastructure moderne est ici désertée ?",
    answer_word: "autoroute",
  },
  {
    title_mission: "La bretelle condamnée",
    riddle_text: "Quel type de voie d'accès est aujourd'hui coupée ?",
    answer_word: "bretelle",
  },
  {
    title_mission: "La gare désaffectée",
    riddle_text:
      "Quel bâtiment accueillait autrefois les voyageurs en transit ?",
    answer_word: "gare",
  },
  {
    title_mission: "Le passage souterrain",
    riddle_text: "Quel type de passage reliait deux points sous la surface ?",
    answer_word: "passage",
  },
  {
    title_mission: "Le viaduc rouillé",
    riddle_text:
      "Quel grand pont servait autrefois aux trains ou aux voitures ?",
    answer_word: "viaduc",
  },
  {
    title_mission: "Le pont-levis bloqué",
    riddle_text:
      "Quel type d'ouvrage mobile permettait autrefois d'ouvrir un passage ?",
    answer_word: "pont-levis",
  },
  {
    title_mission: "La station-service abandonnée",
    riddle_text: "Quel type d'endroit ravitaillait autrefois les véhicules ?",
    answer_word: "station-service",
  },
  {
    title_mission: "Le parking fissuré",
    riddle_text:
      "Quel espace plane accueillait jadis des voitures stationnées ?",
    answer_word: "parking",
  },
  {
    title_mission: "La piste d'atterrissage",
    riddle_text:
      "Quel lieu servait autrefois aux décollages et arrivées aériennes ?",
    answer_word: "piste",
  },
  {
    title_mission: "La tour de contrôle désertée",
    riddle_text:
      "Quel bâtiment dirigeait autrefois les mouvements des avions ?",
    answer_word: "tour",
  },
  {
    title_mission: "L'escalator figé",
    riddle_text: "Quel dispositif facilitait autrefois la montée sans effort ?",
    answer_word: "escalator",
  },
  {
    title_mission: "Le centre commercial vide",
    riddle_text: "Quel vaste lieu de consommation est aujourd'hui désert ?",
    answer_word: "centre",
  },
  {
    title_mission: "La piscine municipale abandonnée",
    riddle_text: "Quel lieu accueillait autrefois les nageurs du quartier ?",
    answer_word: "piscine",
  },
  {
    title_mission: "Le stade désert",
    riddle_text: "Quel lieu accueillait autrefois compétitions et supporters ?",
    answer_word: "stade",
  },
  {
    title_mission: "Le skatepark fissuré",
    riddle_text:
      "Quel espace urbain accueillait autrefois des figures acrobatiques ?",
    answer_word: "skatepark",
  },
  {
    title_mission: "Le zoo oublié",
    riddle_text: "Quel lieu abritait autrefois une collection vivante ?",
    answer_word: "zoo",
  },
  {
    title_mission: "Le parc d'attractions",
    riddle_text:
      "Quel lieu résonnait autrefois de cris joyeux et de musiques mécaniques ?",
    answer_word: "parc",
  },
  {
    title_mission: "Le manège rouillé",
    riddle_text: "Quel dispositif tournant émerveillait jadis les enfants ?",
    answer_word: "manège",
  },
  {
    title_mission: "La ruine gallo-romaine",
    riddle_text: "Quel vestige ancien témoigne ici du passage des siècles ?",
    answer_word: "ruine",
  },
  {
    title_mission: "Le temple effondré",
    riddle_text: "Quel édifice sacré de l'Antiquité s'est ici écroulé ?",
    answer_word: "temple",
  },
  {
    title_mission: "L'aqueduc brisé",
    riddle_text:
      "Quel ouvrage transportait autrefois l'eau sur de longues distances ?",
    answer_word: "aqueduc",
  },
  {
    title_mission: "Le forum déserté",
    riddle_text:
      "Quel lieu public central des villes antiques est aujourd'hui vide ?",
    answer_word: "forum",
  },
  {
    title_mission: "La mosaïque cachée",
    riddle_text: "Quel décor en petits fragments orne ici le sol ancien ?",
    answer_word: "mosaïque",
  },
  {
    title_mission: "La crypte romaine",
    riddle_text: "Quel espace souterrain antique abritait des sépultures ?",
    answer_word: "crypte",
  },
  {
    title_mission: "Le théâtre antique",
    riddle_text:
      "Quel lieu accueillait jadis des tragédies et des comédies anciennes ?",
    answer_word: "théâtre",
  },
  {
    title_mission: "L'arène oubliée",
    riddle_text:
      "Quel espace accueillait autrefois des affrontements publics ?",
    answer_word: "arène",
  },
  {
    title_mission: "Le tumulus recouvert",
    riddle_text: "Quel mot désigne ce tertre funéraire préhistorique ?",
    answer_word: "tumulus",
  },
  {
    title_mission: "Le tombeau de pierre",
    riddle_text: "Quel édifice funéraire solitaire défie le temps ici ?",
    answer_word: "tombeau",
  },
  {
    title_mission: "Le mur cyclopéen",
    riddle_text:
      "Quel type de structure mégalithique impressionne encore par sa taille ?",
    answer_word: "mur",
  },
  {
    title_mission: "Le puits antique",
    riddle_text: "Quel ouvrage profond servait autrefois à puiser l'eau ?",
    answer_word: "puits",
  },
  {
    title_mission: "La route pavée",
    riddle_text: "Quel type de voie ancienne s'étend ici sous tes pas ?",
    answer_word: "route",
  },
  {
    title_mission: "La citerne souterraine",
    riddle_text:
      "Quel type de structure servait à stocker de l'eau sous terre ?",
    answer_word: "citerne",
  },
  {
    title_mission: "Le phare éteint",
    riddle_text: "Quel édifice guidait autrefois les navires dans la nuit ?",
    answer_word: "phare",
  },
  {
    title_mission: "Le port silencieux",
    riddle_text: "Quel lieu accueillait autrefois les bateaux en escale ?",
    answer_word: "port",
  },
  {
    title_mission: "La cale sèche",
    riddle_text:
      "Quel type de structure servait à réparer les navires hors de l'eau ?",
    answer_word: "cale",
  },
  {
    title_mission: "L'épave renversée",
    riddle_text: "Quel vestige maritime s'est échoué ici avec le temps ?",
    answer_word: "épave",
  },
  {
    title_mission: "Le chantier naval abandonné",
    riddle_text: "Quel type de lieu servait à construire des navires ?",
    answer_word: "chantier",
  },
  {
    title_mission: "La jetée fissurée",
    riddle_text:
      "Quel ouvrage en saillie permettait d'accoster ou de se protéger des flots ?",
    answer_word: "jetée",
  },
  {
    title_mission: "Le quai déserté",
    riddle_text:
      "Quel espace servait au chargement et au déchargement des bateaux ?",
    answer_word: "quai",
  },
  {
    title_mission: "Le phare englouti",
    riddle_text: "Quel édifice côtier est désormais submergé par la mer ?",
    answer_word: "phare",
  },
  {
    title_mission: "Le cimetière de bateaux",
    riddle_text: "Quel lieu rassemble les carcasses maritimes abandonnées ?",
    answer_word: "cimetière",
  },
  {
    title_mission: "La forteresse côtière",
    riddle_text:
      "Quel type de bâtiment militaire défendait autrefois les rivages ?",
    answer_word: "forteresse",
  },
  {
    title_mission: "La casemate oubliée",
    riddle_text: "Quel abri fortifié protégeait autrefois des tirs ennemis ?",
    answer_word: "casemate",
  },
  {
    title_mission: "Le fort effondré",
    riddle_text: "Quel édifice défensif s'est partiellement écroulé ici ?",
    answer_word: "fort",
  },
  {
    title_mission: "Le blockhaus ensablé",
    riddle_text:
      "Quel abri en béton de la Seconde Guerre mondiale gît ici dans le sable ?",
    answer_word: "blockhaus",
  },
  {
    title_mission: "La tour de guet marine",
    riddle_text:
      "Quel édifice permettait autrefois de surveiller l'horizon maritime ?",
    answer_word: "tour",
  },
  {
    title_mission: "La crique dissimulée",
    riddle_text: "Quel mot désigne cette petite baie cachée dans la côte ?",
    answer_word: "crique",
  },
  {
    title_mission: "Le phare brisé",
    riddle_text: "Quel édifice côtier guidait jadis les navires dans la nuit ?",
    answer_word: "phare",
  },
  {
    title_mission: "Le tunnel sous la falaise",
    riddle_text:
      "Quel type de passage creusé reliait les deux côtés de la falaise ?",
    answer_word: "tunnel",
  },
  {
    title_mission: "Le phare rouillé",
    riddle_text:
      "Quel édifice autrefois lumineux est aujourd'hui rongé par la mer ?",
    answer_word: "phare",
  },
  {
    title_mission: "La zone portuaire déserte",
    riddle_text:
      "Quel type d'espace servait autrefois aux activités maritimes et commerciales ?",
    answer_word: "port",
  },
  {
    title_mission: "Le hangar à bateaux",
    riddle_text:
      "Quel bâtiment abritait autrefois les embarcations à l'abri des tempêtes ?",
    answer_word: "hangar",
  },
  {
    title_mission: "La cale oubliée",
    riddle_text:
      "Quel mot désigne ce plan incliné utilisé pour mettre les navires à l'eau ?",
    answer_word: "cale",
  },
  {
    title_mission: "Le chantier naval en ruine",
    riddle_text: "Quel type de lieu construisait autrefois des bateaux ?",
    answer_word: "chantier",
  },
  {
    title_mission: "La tour radar",
    riddle_text:
      "Quel édifice technique scrutait autrefois les mouvements en mer et dans les airs ?",
    answer_word: "tour",
  },
  {
    title_mission: "Le quai militaire",
    riddle_text:
      "Quel type de quai accueillait autrefois navires de guerre et patrouilleurs ?",
    answer_word: "quai",
  },
  {
    title_mission: "L'entrepôt frigorifique",
    riddle_text: "Quel bâtiment conservait autrefois les denrées périssables ?",
    answer_word: "entrepôt",
  },
  {
    title_mission: "La conserverie abandonnée",
    riddle_text:
      "Quelle usine transformait et emballait jadis les aliments ici ?",
    answer_word: "conserverie",
  },
  {
    title_mission: "Le phare intérieur",
    riddle_text: "Quel édifice lumineux se dressait à distance du rivage ?",
    answer_word: "phare",
  },
  {
    title_mission: "La tour en béton",
    riddle_text:
      "Quel type de structure verticale servait ici à observer ou signaler ?",
    answer_word: "tour",
  },
  {
    title_mission: "Le poste de garde",
    riddle_text: "Quel type de bâtiment contrôlait autrefois les entrées ?",
    answer_word: "poste",
  },
  {
    title_mission: "La clôture éventrée",
    riddle_text:
      "Quel élément de sécurité entoure encore faiblement cette zone ?",
    answer_word: "clôture",
  },
  {
    title_mission: "La voie ferrée rouillée",
    riddle_text: "Quel type d'infrastructure guidait autrefois les trains ?",
    answer_word: "voie",
  },
  {
    title_mission: "L'atelier naval",
    riddle_text:
      "Quel lieu servait aux réparations et constructions maritimes ?",
    answer_word: "atelier",
  },
  {
    title_mission: "La passerelle branlante",
    riddle_text:
      "Quel type de structure permettait de franchir un vide étroit ?",
    answer_word: "passerelle",
  },
  {
    title_mission: "La zone industrielle",
    riddle_text:
      "Quel vaste secteur accueillait autrefois des activités de production ?",
    answer_word: "zone",
  },
  {
    title_mission: "Le dépôt d'armes",
    riddle_text:
      "Quel type de lieu servait autrefois à stocker des équipements militaires ?",
    answer_word: "dépôt",
  },
  {
    title_mission: "Le champ d'entraînement",
    riddle_text: "Quel type d'endroit servait à former les soldats ?",
    answer_word: "champ",
  },
  {
    title_mission: "La tour d'observation",
    riddle_text:
      "Quel édifice permettait autrefois de surveiller le territoire ?",
    answer_word: "tour",
  },
  {
    title_mission: "Le blockhaus côtier",
    riddle_text: "Quel abri fortifié défendait autrefois la côte ?",
    answer_word: "blockhaus",
  },
  {
    title_mission: "La friche ferroviaire",
    riddle_text:
      "Quel type de terrain désaffecté était autrefois dédié aux trains ?",
    answer_word: "friche",
  },
  {
    title_mission: "Le dépôt de locomotives",
    riddle_text:
      "Quel lieu servait autrefois à entretenir les machines roulantes ?",
    answer_word: "dépôt",
  },
  {
    title_mission: "Le passage à niveau",
    riddle_text:
      "Quel type de croisement marquait l'intersection d'une route et d'une voie ferrée ?",
    answer_word: "passage",
  },
  {
    title_mission: "La gare de triage",
    riddle_text:
      "Quel type de gare servait à organiser les convois de marchandises ?",
    answer_word: "triage",
  },
  {
    title_mission: "Le viaduc ferroviaire",
    riddle_text: "Quel type de pont supportait autrefois les trains ?",
    answer_word: "viaduc",
  },
  {
    title_mission: "Le tunnel ferroviaire",
    riddle_text:
      "Quel type de passage permettait aux trains de traverser la montagne ?",
    answer_word: "tunnel",
  },
  {
    title_mission: "Le quai de marchandises",
    riddle_text:
      "Quel type de quai accueillait autrefois le fret ferroviaire ?",
    answer_word: "quai",
  },
  {
    title_mission: "La rotonde ferroviaire",
    riddle_text:
      "Quel bâtiment permettait de manœuvrer et stocker des locomotives ?",
    answer_word: "rotonde",
  },
  {
    title_mission: "Le poste d'aiguillage",
    riddle_text:
      "Quel bâtiment commandait autrefois les mouvements des voies ferrées ?",
    answer_word: "poste",
  },
  {
    title_mission: "Le pont tournant",
    riddle_text:
      "Quel dispositif mécanique permettait de faire pivoter les locomotives ?",
    answer_word: "pont",
  },
  {
    title_mission: "La halle aux trains",
    riddle_text:
      "Quel grand bâtiment couvert protégeait autrefois les trains stationnés ?",
    answer_word: "halle",
  },
  {
    title_mission: "La voie de garage",
    riddle_text:
      "Quel type de voie servait à immobiliser temporairement les trains ?",
    answer_word: "garage",
  },
  {
    title_mission: "La friche industrielle",
    riddle_text: "Quel type d'espace déserté abritait autrefois des usines ?",
    answer_word: "friche",
  },
  {
    title_mission: "Le château d'usine",
    riddle_text:
      "Quel bâtiment servait souvent de point d'eau et de repère dans une usine ?",
    answer_word: "château",
  },
  {
    title_mission: "L'atelier principal",
    riddle_text:
      "Quel espace servait au cœur des réparations et constructions ?",
    answer_word: "atelier",
  },
  {
    title_mission: "La chaufferie",
    riddle_text:
      "Quel local abritait autrefois les machines de production de chaleur ?",
    answer_word: "chaufferie",
  },
  {
    title_mission: "La salle des machines",
    riddle_text: "Quel espace technique abritait le cœur battant d'une usine ?",
    answer_word: "salle",
  },
  {
    title_mission: "La cheminée d'usine",
    riddle_text: "Quel élément vertical évacuait les fumées industrielles ?",
    answer_word: "cheminée",
  },
  {
    title_mission: "La cour de manutention",
    riddle_text:
      "Quel espace servait aux opérations de chargement et de déchargement ?",
    answer_word: "cour",
  },
  {
    title_mission: "Le transformateur géant",
    riddle_text:
      "Quel appareil distribuait autrefois l'énergie aux bâtiments alentours ?",
    answer_word: "transformateur",
  },
  {
    title_mission: "Le réservoir d'eau",
    riddle_text:
      "Quel type de structure stockait autrefois l'eau pour alimenter la ville ?",
    answer_word: "réservoir",
  },
  {
    title_mission: "La station de pompage",
    riddle_text:
      "Quel type d'installation acheminait jadis l'eau vers les habitations ?",
    answer_word: "station",
  },
  {
    title_mission: "La salle des turbines",
    riddle_text:
      "Quel type de machine transformait l'énergie de l'eau ou de la vapeur ?",
    answer_word: "turbine",
  },
  {
    title_mission: "La centrale électrique",
    riddle_text:
      "Quel type de bâtiment produisait autrefois l'électricité pour la région ?",
    answer_word: "centrale",
  },
  {
    title_mission: "La mine abandonnée",
    riddle_text:
      "Quel type de site souterrain servait à extraire des ressources naturelles ?",
    answer_word: "mine",
  },
  {
    title_mission: "Le chevalement rouillé",
    riddle_text:
      "Quel type de structure surplombait l'accès principal d'une mine ?",
    answer_word: "chevalement",
  },
  {
    title_mission: "La galerie minière",
    riddle_text:
      "Quel nom donne-t-on à ces couloirs souterrains creusés dans une mine ?",
    answer_word: "galerie",
  },
  {
    title_mission: "Le terril",
    riddle_text: "Quel mot désigne ces amas de déchets miniers ?",
    answer_word: "terril",
  },
  {
    title_mission: "Le puits d'extraction",
    riddle_text:
      "Quel type de structure permettait d'accéder aux niveaux souterrains d'une mine ?",
    answer_word: "puits",
  },
  {
    title_mission: "Le bâtiment administratif",
    riddle_text:
      "Quel type de bâtiment accueillait autrefois la gestion du site industriel ?",
    answer_word: "bâtiment",
  },
  {
    title_mission: "Le dortoir des ouvriers",
    riddle_text:
      "Quel type de lieu hébergeait autrefois les travailleurs sur place ?",
    answer_word: "dortoir",
  },
  {
    title_mission: "La cantine abandonnée",
    riddle_text: "Quel type d'espace servait autrefois aux repas collectifs ?",
    answer_word: "cantine",
  },
  {
    title_mission: "La salle de contrôle",
    riddle_text:
      "Quel espace supervisait autrefois l'ensemble du site industriel ?",
    answer_word: "salle",
  },
  {
    title_mission: "La cheminée d'aération",
    riddle_text:
      "Quel élément servait autrefois à ventiler les galeries souterraines ?",
    answer_word: "cheminée",
  },
  {
    title_mission: "La carrière oubliée",
    riddle_text:
      "Quel type de site à ciel ouvert servait à extraire la pierre ?",
    answer_word: "carrière",
  },
  {
    title_mission: "Le hangar de stockage",
    riddle_text:
      "Quel type de bâtiment servait autrefois à entreposer des matériaux ?",
    answer_word: "hangar",
  },
  {
    title_mission: "La balance industrielle",
    riddle_text: "Quel dispositif servait à peser d'importantes charges ?",
    answer_word: "balance",
  },
  {
    title_mission: "La voie minière",
    riddle_text: "Quel type de voie étroite servait au transport du minerai ?",
    answer_word: "voie",
  },
  {
    title_mission: "La forge silencieuse",
    riddle_text:
      "Quel lieu servait autrefois à travailler le métal incandescent ?",
    answer_word: "forge",
  },
  {
    title_mission: "La salle des compresseurs",
    riddle_text:
      "Quel espace abritait autrefois des machines à air sous pression ?",
    answer_word: "salle",
  },
  {
    title_mission: "Le silo à grains",
    riddle_text:
      "Quel type de structure servait à stocker des céréales en grande quantité ?",
    answer_word: "silo",
  },
  {
    title_mission: "Le moulin effondré",
    riddle_text:
      "Quel type de bâtiment utilisait autrefois la force du vent ou de l'eau pour moudre ?",
    answer_word: "moulin",
  },
  {
    title_mission: "La grange abandonnée",
    riddle_text:
      "Quel type de bâtiment agricole servait à entreposer récoltes et matériel ?",
    answer_word: "grange",
  },
  {
    title_mission: "La ferme désertée",
    riddle_text:
      "Quel type d'exploitation rurale est ici laissée à l'abandon ?",
    answer_word: "ferme",
  },
  {
    title_mission: "L'étable vide",
    riddle_text:
      "Quel type de bâtiment abritait autrefois les bêtes domestiques ?",
    answer_word: "étable",
  },
  {
    title_mission: "Le pigeonnier effondré",
    riddle_text:
      "Quel type de structure accueillait autrefois des volatiles apprivoisés ?",
    answer_word: "pigeonnier",
  },
  {
    title_mission: "Le pressoir abandonné",
    riddle_text: "Quel outil servait autrefois à extraire le jus des fruits ?",
    answer_word: "pressoir",
  },
  {
    title_mission: "Le puits agricole",
    riddle_text: "Quel ouvrage permettait aux fermiers de remonter l'eau ?",
    answer_word: "puits",
  },
  {
    title_mission: "Le séchoir à tabac",
    riddle_text:
      "Quel type de bâtiment servait au séchage des récoltes spécifiques ?",
    answer_word: "séchoir",
  },
  {
    title_mission: "Le champ en friche",
    riddle_text: "Quel espace cultivé est redevenu sauvage avec le temps ?",
    answer_word: "champ",
  },
  {
    title_mission: "La remise aux outils",
    riddle_text:
      "Quel petit bâtiment servait à entreposer les instruments agricoles ?",
    answer_word: "remise",
  },
  {
    title_mission: "Le verger abandonné",
    riddle_text:
      "Quel espace planté d'arbres produisait autrefois des récoltes saisonnières ?",
    answer_word: "verger",
  },
  {
    title_mission: "Le lavoir rural",
    riddle_text: "Quel lieu servait autrefois aux lavandières de campagne ?",
    answer_word: "lavoir",
  },
  {
    title_mission: "La chapelle champêtre",
    riddle_text:
      "Quel type d'édifice religieux isolé se dressait au milieu des champs ?",
    answer_word: "chapelle",
  },
  {
    title_mission: "Le calvaire moussu",
    riddle_text: "Quel monument religieux bordait souvent les routes rurales ?",
    answer_word: "calvaire",
  },
  {
    title_mission: "La mare asséchée",
    riddle_text: "Quel petit plan d'eau naturel a disparu ici avec le temps ?",
    answer_word: "mare",
  },
  {
    title_mission: "La grange à foin",
    riddle_text:
      "Quel bâtiment stockait autrefois les récoltes sèches destinées aux animaux ?",
    answer_word: "grange",
  },
  {
    title_mission: "Le puits communal",
    riddle_text: "Quel ouvrage collectif permettait d'accéder à l'eau ?",
    answer_word: "puits",
  },
  {
    title_mission: "Le clocher isolé",
    riddle_text: "Quel élément architectural dominait autrefois les villages ?",
    answer_word: "clocher",
  },
  {
    title_mission: "La croix de chemin",
    riddle_text:
      "Quel symbole religieux marquait autrefois les intersections rurales ?",
    answer_word: "croix",
  },
  {
    title_mission: "Le château en ruine",
    riddle_text:
      "Quel ancien édifice seigneurial domine encore le paysage malgré les ravages du temps ?",
    answer_word: "château",
  },
  {
    title_mission: "La tour du guetteur",
    riddle_text:
      "Quel édifice permettait autrefois d'observer au loin pour prévenir des dangers ?",
    answer_word: "tour",
  },
  {
    title_mission: "Les remparts effondrés",
    riddle_text:
      "Quel système défensif entourait autrefois les villes et les forteresses ?",
    answer_word: "remparts",
  },
  {
    title_mission: "La porte fortifiée",
    riddle_text:
      "Quel élément architectural permettait de contrôler les entrées d'une enceinte ?",
    answer_word: "porte",
  },
  {
    title_mission: "La courtine moussue",
    riddle_text:
      "Quel terme désigne cette partie rectiligne d'une enceinte fortifiée ?",
    answer_word: "courtine",
  },
  {
    title_mission: "Le donjon effondré",
    riddle_text:
      "Quel élément central des châteaux médiévaux servait de dernier refuge ?",
    answer_word: "donjon",
  },
  {
    title_mission: "Le fossé envahi",
    riddle_text:
      "Quel dispositif défensif entourait autrefois les fortifications ?",
    answer_word: "fossé",
  },
  {
    title_mission: "La barbacane",
    riddle_text:
      "Quel élément défensif protégeait l'accès principal d'une fortification ?",
    answer_word: "barbacane",
  },
  {
    title_mission: "La tour de flanquement",
    riddle_text:
      "Quel type de tour servait à défendre les côtés d'une enceinte ?",
    answer_word: "tour",
  },
  {
    title_mission: "La poterne cachée",
    riddle_text:
      "Quel nom donne-t-on à une petite porte dérobée dans une enceinte fortifiée ?",
    answer_word: "poterne",
  },
  {
    title_mission: "La salle d'armes",
    riddle_text:
      "Quel lieu servait autrefois à stocker les épées, arcs et armures ?",
    answer_word: "salle",
  },
  {
    title_mission: "La cour basse",
    riddle_text:
      "Quel espace ouvert se trouvait au cœur des forteresses et des châteaux ?",
    answer_word: "cour",
  },
  {
    title_mission: "La chapelle castrale",
    riddle_text:
      "Quel édifice religieux se trouvait souvent à l'intérieur des fortifications ?",
    answer_word: "chapelle",
  },
  {
    title_mission: "La tour d'escalier",
    riddle_text:
      "Quel type de structure cylindrique abritait souvent des escaliers dans les châteaux ?",
    answer_word: "tour",
  },
  {
    title_mission: "La galerie couverte",
    riddle_text:
      "Quel mot désigne cette allée abritée reliant différentes parties d'un bâtiment ?",
    answer_word: "galerie",
  },
  {
    title_mission: "La cuisine médiévale",
    riddle_text:
      "Quel type de pièce servait autrefois à préparer les repas dans un château ?",
    answer_word: "cuisine",
  },
  {
    title_mission: "Le cellier voûté",
    riddle_text:
      "Quel espace souterrain conservait autrefois les vivres et les boissons ?",
    answer_word: "cellier",
  },
  {
    title_mission: "Le grenier effondré",
    riddle_text:
      "Quel étage supérieur servait autrefois au stockage des réserves sèches ?",
    answer_word: "grenier",
  },
  {
    title_mission: "La salle du trône",
    riddle_text:
      "Quel espace symbolique accueillait autrefois le pouvoir royal ou seigneurial ?",
    answer_word: "salle",
  },
  {
    title_mission: "La tour effilée",
    riddle_text:
      "Quel type de structure élancée dominait souvent les fortifications anciennes ?",
    answer_word: "tour",
  },
  {
    title_mission: "Le cloître envahi",
    riddle_text:
      "Quel espace architectural entourait autrefois les jardins des abbayes et monastères ?",
    answer_word: "cloître",
  },
  {
    title_mission: "L'abbatiale silencieuse",
    riddle_text:
      "Quel grand édifice religieux servait d'église principale d'une abbaye ?",
    answer_word: "abbatiale",
  },
  {
    title_mission: "Le réfectoire des moines",
    riddle_text:
      "Quel lieu servait autrefois aux repas silencieux des communautés religieuses ?",
    answer_word: "réfectoire",
  },
  {
    title_mission: "Le dortoir monastique",
    riddle_text:
      "Quel type d'espace abritait autrefois le sommeil des moines ?",
    answer_word: "dortoir",
  },
  {
    title_mission: "La salle capitulaire",
    riddle_text:
      "Quel espace servait aux réunions officielles des communautés religieuses ?",
    answer_word: "chapitre",
  },
  {
    title_mission: "Le jardin de l'abbé",
    riddle_text:
      "Quel espace cultivé alliait autrefois contemplation et culture vivrière ?",
    answer_word: "jardin",
  },
  {
    title_mission: "La bibliothèque monastique",
    riddle_text:
      "Quel lieu abritait autrefois les précieux écrits des moines copistes ?",
    answer_word: "bibliothèque",
  },
  {
    title_mission: "La crypte souterraine",
    riddle_text:
      "Quel espace sacré se trouvait souvent sous les édifices religieux ?",
    answer_word: "crypte",
  },
  {
    title_mission: "Le clocher penché",
    riddle_text:
      "Quel élément vertical abritait autrefois les cloches des églises ?",
    answer_word: "clocher",
  },
  {
    title_mission: "Le porche sculpté",
    riddle_text:
      "Quel élément architectural orne souvent l'entrée des édifices religieux ?",
    answer_word: "porche",
  },
  {
    title_mission: "La sacristie",
    riddle_text:
      "Quel lieu servait à conserver les vêtements et objets liturgiques ?",
    answer_word: "sacristie",
  },
  {
    title_mission: "Le cimetière monastique",
    riddle_text: "Quel lieu de repos éternel jouxtait souvent les monastères ?",
    answer_word: "cimetière",
  },
  {
    title_mission: "Le passage voûté",
    riddle_text:
      "Quel type de couloir abrité reliait souvent des parties d'un monastère ?",
    answer_word: "passage",
  },
  {
    title_mission: "La fontaine sacrée",
    riddle_text:
      "Quel élément symbolique et pratique trônait souvent dans les cloîtres ?",
    answer_word: "fontaine",
  },
  {
    title_mission: "La chapelle souterraine",
    riddle_text: "Quel édifice religieux secret se cache sous terre ?",
    answer_word: "chapelle",
  },
  {
    title_mission: "Le chemin des pèlerins",
    riddle_text:
      "Quel itinéraire spirituel menait autrefois aux lieux saints ?",
    answer_word: "chemin",
  },
  {
    title_mission: "Le sanctuaire oublié",
    riddle_text: "Quel mot désigne un lieu sacré voué au culte ?",
    answer_word: "sanctuaire",
  },
  {
    title_mission: "La grille en fer forgé",
    riddle_text:
      "Quel élément métallique décoratif sépare souvent les espaces religieux ?",
    answer_word: "grille",
  },
  {
    title_mission: "Le chemin de croix",
    riddle_text:
      "Quel itinéraire spirituel illustre les étapes de la Passion ?",
    answer_word: "chemin",
  },
  {
    title_mission: "La nef effondrée",
    riddle_text: "Quelle partie centrale d'une église s'est ici écroulée ?",
    answer_word: "nef",
  },
  {
    title_mission: "Le cloître supérieur",
    riddle_text:
      "Quel espace architectural se trouve souvent autour des cours monastiques ?",
    answer_word: "cloître",
  },
];

// Helper pour récupérer les communes d'un scénario
function getCommunesForScenario(scenarioId) {
  // Récupère les communes liées au scénario depuis la table scenario_communes
  const communeIds = db
    .prepare("SELECT _id_commune FROM scenario_communes WHERE _id_scenario = ?")
    .all(scenarioId);
  if (!communeIds || communeIds.length === 0) return [];
  const getCommuneById = db.prepare(
    "SELECT * FROM communes WHERE _id_commune = ?"
  );
  return communeIds.map((row) => getCommuneById.get(row._id_commune));
}

// Répartition des missions sur les scénarios
const scenarioCount = scenarios.length;
const missionCount = missionsData.length;
const missionsPerScenario = Array(scenarioCount).fill(3); // Commence par 3 missions/scénario
let remaining = missionCount - scenarioCount * 3;
let idx = 0;
while (remaining > 0) {
  if (missionsPerScenario[idx] < 7) {
    missionsPerScenario[idx]++;
    remaining--;
  }
  idx = (idx + 1) % scenarioCount;
}

// Génération des missions
// Nouvelle logique : 1 mission du tableau = 1 entrée en base, répartie cycliquement sur les scénarios
// Nouvelle logique : chaque scénario reçoit entre 3 et 7 missions, sans duplication
const missions = [];
let missionId = 1;
// Mélange les missions
const shuffledMissions = [...missionsData].sort(() => Math.random() - 0.5);
let missionIdx = 0;
for (let s = 0; s < scenarioCount; s++) {
  const scenario = scenarios[s];
  const scenarioId = scenario._id_scenario;
  const numMissions = missionsPerScenario[s]; // Utilise la répartition calculée
  let communesForScenario = getCommunesForScenario(scenarioId);
  if (!communesForScenario || communesForScenario.length === 0) {
    const randomCommune = communes[Math.floor(Math.random() * communes.length)];
    communesForScenario = [randomCommune];
  }
  for (
    let pos = 1;
    pos <= numMissions && missionIdx < shuffledMissions.length;
    pos++
  ) {
    const missionData = shuffledMissions[missionIdx];
    const commune = communesForScenario[(pos - 1) % communesForScenario.length];
    const minDist = 100;
    const maxDist = 300;
    const angle = Math.random() * 2 * Math.PI;
    const dist = minDist + Math.random() * (maxDist - minDist);
    const deltaLat = (dist * Math.cos(angle)) / 111320;
    const deltaLon =
      (dist * Math.sin(angle)) /
      ((40075e3 * Math.cos((commune.geo_point_lat * Math.PI) / 180)) / 360);
    const jitterLat = commune.geo_point_lat + deltaLat;
    const jitterLon = commune.geo_point_lon + deltaLon;
    missions.push({
      _id_mission: missionId,
      _id_scenario: scenarioId,
      position_mission: pos,
      title_mission: missionData.title_mission,
      riddle_text: missionData.riddle_text,
      answer_word: missionData.answer_word,
      latitude: Number(jitterLat.toFixed(7)),
      longitude: Number(jitterLon.toFixed(7)),
    });
    missionId++;
    missionIdx++;
  }
  if (missionIdx >= shuffledMissions.length) break;
}

const insertMission = db.prepare(`
  INSERT INTO missions (
    _id_mission,
    _id_scenario,
    position_mission,
    title_mission,
    riddle_text,
    answer_word,
    latitude,
    longitude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAllMissions = db.transaction(() => {
  for (const mission of missions) {
    insertMission.run(
      mission._id_mission,
      mission._id_scenario,
      mission.position_mission,
      mission.title_mission,
      mission.riddle_text,
      mission.answer_word,
      mission.latitude,
      mission.longitude
    );
  }
});

insertAllMissions();

console.log(`Seed missions: ${missions.length} missions insérées.`);

export { missions };
