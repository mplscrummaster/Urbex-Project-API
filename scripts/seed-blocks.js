import db from "../db/index.js";
// import { scenarios } from "./seed-scenarios.js";
// Récupère les missions directement depuis la base
const missions = db.prepare("SELECT * FROM missions").all();

const scenarioBlocks = [
  {
    owner_type: "intro",
    content_text:
      "Chaque fissure raconte une histoire oubliée. Les murs semblent absorber les voix du passé, comme un livre silencieux attendant qu’on le lise.",
  },
  {
    owner_type: "outro",
    content_text:
      "Au moment de partir, un dernier regard révèle une inscription presque effacée, comme adressée au visiteur. Le lieu semble refermer ses souvenirs, en silence.",
  },

  {
    owner_type: "intro",
    content_text:
      "Ici, le temps s’est arrêté brutalement. Seuls le vent et les pas des curieux troublent la quiétude de ces ruines immobiles.",
  },
  {
    owner_type: "outro",
    content_text:
      "Lorsque le vent se tait enfin, un silence parfait recouvre tout. C’est comme si les ruines avaient attendu ce moment pour redevenir invisibles.",
  },

  {
    owner_type: "intro",
    content_text:
      "Anciennes voies ferrées perdues sous la végétation, elles mènent vers des lieux que la carte a effacés.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant la voie, le regard se perd dans la ligne droite rouillée. Elle s’éloigne vers un horizon qui n’existe plus.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une fine couche grise recouvre tout, comme une neige ancienne. En la soulevant, on découvre des fragments de vies figées depuis des décennies.",
  },
  {
    owner_type: "outro",
    content_text:
      "Un rayon de lumière traverse une vitre fendue et illumine un objet oublié. On referme doucement la porte, laissant la poussière retomber.",
  },

  {
    owner_type: "intro",
    content_text:
      "Dans ce vieux bâtiment, chaque pas déclenche un écho presque humain. Les murs de pierre semblent chuchoter à ceux qui osent s’y attarder.",
  },
  {
    owner_type: "outro",
    content_text:
      "En franchissant la dernière arche, les murmures s’estompent jusqu’à disparaître. Seul demeure le souvenir de ce dialogue silencieux.",
  },

  {
    owner_type: "intro",
    content_text:
      "Longs, étroits et plongés dans une semi-obscurité, ces couloirs serpentent dans un réseau que peu connaissent encore. On s’y perd facilement… ou volontairement.",
  },
  {
    owner_type: "outro",
    content_text:
      "À la sortie, la lumière naturelle paraît presque irréelle. On a l’impression d’avoir traversé un rêve enfoui sous la ville.",
  },

  {
    owner_type: "intro",
    content_text:
      "Les bruits lointains ressemblent à des voix. Certains disent qu’en restant immobile, on peut entendre les souvenirs de ceux qui ne sont jamais repartis.",
  },
  {
    owner_type: "outro",
    content_text:
      "Au moment de partir, un dernier écho résonne derrière soi. Était-ce le vent… ou une réponse ?",
  },

  {
    owner_type: "intro",
    content_text:
      "L’humidité envahit tout, créant une brume constante à l’intérieur. Elle floute les contours, transformant chaque pièce en rêve éveillé.",
  },
  {
    owner_type: "outro",
    content_text:
      "En sortant, la brume semble se refermer derrière vous comme un rideau. L’endroit redevient flou, presque irréel.",
  },

  {
    owner_type: "intro",
    content_text:
      "Sous les grandes artères se cachent des souterrains oubliés. Là, la lumière artificielle révèle des graffitis anciens et des histoires que la surface ignore.",
  },
  {
    owner_type: "outro",
    content_text:
      "Quand on remonte à la surface, les bruits de la ville paraissent étrangers. Comme si les ombres d’en bas s’accrochaient encore aux semelles.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une série de plans griffonnés sur les murs révèle une architecture étrange. Comme si quelqu’un avait voulu cartographier un lieu qui n’existe plus.",
  },
  {
    owner_type: "outro",
    content_text:
      "En suivant une dernière ligne du doigt, on réalise qu’elle s’arrête dans le vide. Peut-être que la carte était faite pour égarer.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une trappe cachée mène à des étages inférieurs jamais répertoriés. Plus on descend, plus le monde d’en haut semble lointain.",
  },
  {
    owner_type: "outro",
    content_text:
      "Quand la trappe se referme derrière soi, on garde la sensation d’avoir effleuré quelque chose d’enfoui — au propre comme au figuré.",
  },

  {
    owner_type: "intro",
    content_text:
      "Derrière une porte métallique anonyme, un escalier en colimaçon s’enfonce dans l’obscurité. Peu savent où il mène vraiment.",
  },
  {
    owner_type: "outro",
    content_text:
      "De retour à la surface, on hésite presque à refermer la porte. Comme si le passage pouvait disparaître pour toujours une fois clos.",
  },

  {
    owner_type: "intro",
    content_text:
      "Des barrières rouillées bloquent l’entrée, mais derrière elles, une structure gigantesque se dessine.",
  },
  {
    owner_type: "outro",
    content_text:
      "En se retournant, les grilles semblent plus hautes qu’à l’arrivée. Comme si le lieu avait voulu retenir ceux qui sont entrés.",
  },

  {
    owner_type: "intro",
    content_text:
      "Isolée sur une façade décrépite, une porte sans indication intrigue.",
  },
  {
    owner_type: "outro",
    content_text:
      "En la franchissant à nouveau, elle paraît différente. Peut-être que le vrai mystère n’est pas derrière, mais en elle-même.",
  },

  {
    owner_type: "intro",
    content_text:
      "D’anciens panneaux d’interdiction ponctuent le sentier. Ce qui était autrefois une zone fermée devient aujourd’hui un terrain d’exploration.",
  },
  {
    owner_type: "outro",
    content_text:
      "En repartant, les panneaux semblent plus nombreux qu’à l’aller. Comme si le lieu avait ses propres règles mouvantes.",
  },

  {
    owner_type: "intro",
    content_text:
      "Le lieu semble suspendu entre passé et présent, entre nature et béton. Chaque recoin évoque une frontière invisible.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant l’endroit, on ressent une étrange légèreté. Comme si on avait traversé un espace qui n’existe qu’entre deux souffles.",
  },

  {
    owner_type: "intro",
    content_text:
      "Cet endroit isolé demande de l’effort pour y accéder. Une fois sur place, la sensation d’être les premiers depuis des années est grisante.",
  },
  {
    owner_type: "outro",
    content_text:
      "Sur le chemin du retour, le paysage semble changé. Ou peut-être est-ce le regard qui a basculé.",
  },

  {
    owner_type: "intro",
    content_text:
      "Des couloirs sinueux s’entrelacent sans logique apparente. Ceux qui s’y aventurent finissent par perdre le nord, happés par l’endroit.",
  },
  {
    owner_type: "outro",
    content_text:
      "Retrouver la sortie donne presque l’impression d’avoir été choisi. Comme si le labyrinthe avait décidé de vous laisser partir.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une plateforme abandonnée offre une vue spectaculaire… sur un paysage oublié. L’horizon semble s’être retiré, comme avalé par le temps.",
  },
  {
    owner_type: "outro",
    content_text:
      "En descendant de la plateforme, on garde en tête cette ligne absente. Une image qui semble poursuivre longtemps après le départ.",
  },

  {
    owner_type: "intro",
    content_text:
      "À la tombée de la nuit, les toits prennent une allure de terrain de jeu secret. Le vent y chante des airs que personne ne connaît.",
  },
  {
    owner_type: "outro",
    content_text:
      "En redescendant, les bruits de la ville semblent lointains. Le vent des hauteurs accompagne encore vos pas.",
  },

  {
    owner_type: "intro",
    content_text:
      "De grandes structures métalliques rouillées s’élèvent dans le silence. Jadis animées, elles dorment aujourd’hui sous le poids des années.",
  },
  {
    owner_type: "outro",
    content_text:
      "Avant de partir, un dernier regard vers les poutrelles révèle une beauté tranquille. L’acier dort, mais il veille encore.",
  },

  {
    owner_type: "intro",
    content_text:
      "Sur une voie abandonnée, un unique wagon subsiste. À l’intérieur, des sièges déchirés et une atmosphère figée dans une autre époque.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant la rame, on croirait presque entendre le crissement d’un départ qui n’aura jamais lieu.",
  },

  {
    owner_type: "intro",
    content_text:
      "L’immense halle industrielle résonne d’un vide assourdissant. Les machines sont arrêtées, mais leur présence est presque palpable.",
  },
  {
    owner_type: "outro",
    content_text:
      "Quand la porte se referme, le silence redevient total. Comme si la visite n’avait été qu’une parenthèse dans un long sommeil.",
  },

  {
    owner_type: "intro",
    content_text:
      "Les turbines sont couvertes de poussière, les panneaux de contrôle clignotent encore faiblement. Comme si la centrale attendait un signal.",
  },
  {
    owner_type: "outro",
    content_text:
      "Sur le chemin du retour, une lampe s’éteint toute seule derrière vous. Peut-être que la centrale n’était pas totalement endormie.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un réseau complexe de conduits traverse le bâtiment. Ils semblent mener à un cœur invisible, englouti par la rouille.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant le lieu, un souffle discret s’échappe encore d’un tuyau. Comme si l’endroit continuait à respirer.",
  },

  {
    owner_type: "intro",
    content_text:
      "Des étagères métalliques ploient sous le poids de dossiers détrempés. Chaque feuille est une relique d’une époque bureaucratique disparue.",
  },
  {
    owner_type: "outro",
    content_text:
      "Avant de partir, une feuille se détache doucement et tombe au sol. Le passé insiste pour se faire entendre.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un quai déserté s’étend dans une semi-obscurité éternelle. Plus aucun train ne passe, mais les panneaux indiquent encore des destinations effacées.",
  },
  {
    owner_type: "outro",
    content_text:
      "Le dernier pas résonne sur le quai vide. Comme un départ qui n’aura jamais lieu.",
  },

  {
    owner_type: "intro",
    content_text:
      "Ce vaste espace ouvert abrite des carcasses de véhicules oubliés. L’air y est lourd de souvenirs mécaniques.",
  },
  {
    owner_type: "outro",
    content_text:
      "En sortant, le vent s’engouffre et fait grincer une porte métallique. Le hangar semble soupirer dans votre dos.",
  },

  {
    owner_type: "intro",
    content_text:
      "Des néons cassés pendent du plafond. Le bâtiment semble figé juste après une panne générale, dans une attente infinie.",
  },
  {
    owner_type: "outro",
    content_text:
      "Un néon clignote une dernière fois au moment où vous partez. Comme un au revoir électrique.",
  },

  {
    owner_type: "intro",
    content_text:
      "Entre les herbes hautes, des restes de structures métalliques calcinées témoignent d’un passé mouvementé. Le vent y transporte une odeur de rouille.",
  },
  {
    owner_type: "outro",
    content_text:
      "Au loin, une lumière orangée du coucher de soleil se reflète sur les débris, leur redonnant l’éclat d’autrefois.",
  },

  {
    owner_type: "intro",
    content_text:
      "Sous les eaux dormantes d’un barrage oublié, une ancienne forêt subsiste. Ses troncs morts émergent parfois, comme pour respirer.",
  },
  {
    owner_type: "outro",
    content_text:
      "En s’éloignant du rivage, on garde en tête l’image des troncs figés. Comme des mains tendues depuis un autre temps.",
  },

  {
    owner_type: "intro",
    content_text:
      "Le cours d’eau détourné a laissé une vallée asséchée. Au milieu, d’anciennes embarcations reposent dans la vase.",
  },
  {
    owner_type: "outro",
    content_text:
      "Avant de partir, un souffle de vent soulève la poussière du lit asséché. On jurerait entendre un murmure ancien.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une brume épaisse recouvre la surface, dissimulant ses profondeurs. Les légendes locales parlent de voix qui s’élèvent au crépuscule.",
  },
  {
    owner_type: "outro",
    content_text:
      "Quand la brume se lève un instant, le reflet du ciel dévoile une profondeur insoupçonnée. Puis tout redevient flou.",
  },

  {
    owner_type: "intro",
    content_text:
      "La nature a repris ses droits dans un bâtiment envahi de racines. Elles forment des sculptures naturelles qui étranglent les murs.",
  },
  {
    owner_type: "outro",
    content_text:
      "En sortant, on remarque que les racines s’étendent jusqu’au seuil. Comme si la nature suivait les visiteurs.",
  },

  {
    owner_type: "intro",
    content_text:
      "Les vitres sont éclatées, mais des plantes continuent de pousser librement. L’endroit est à la fois ruiné et vibrant de vie.",
  },
  {
    owner_type: "outro",
    content_text:
      "Un dernier regard révèle une fleur inattendue, poussant dans un éclat de verre. La vie, toujours, reprend.",
  },

  {
    owner_type: "intro",
    content_text:
      "Sur un toit oublié, une végétation luxuriante s’est développée. C’est une oasis cachée au-dessus du béton.",
  },
  {
    owner_type: "outro",
    content_text:
      "En descendant l’escalier, le chant des insectes s’éloigne lentement. Une oasis perchée disparaît derrière les murs.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une cavité dissimulée dans la roche donne accès à un réseau souterrain. Les parois portent des inscriptions anciennes et mystérieuses.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant la cavité, le vent semble porter un dernier mot inaudible. La falaise garde ses secrets.",
  },

  {
    owner_type: "intro",
    content_text:
      "L’air froid s’engouffre dans ces galeries naturelles. Chaque respiration résonne comme un battement d’ailes invisible.",
  },
  {
    owner_type: "outro",
    content_text:
      "En ressortant, la lumière du jour semble plus vive. Comme si l’air des profondeurs avait nettoyé le regard.",
  },

  {
    owner_type: "intro",
    content_text:
      "Sur le littoral abandonné, les vagues laissent des traînées mousseuses sur les ruines. L’air marin se mêle aux souvenirs.",
  },
  {
    owner_type: "outro",
    content_text:
      "La mer efface vos traces aussi vite que vous vous éloignez. Le lieu redevient désert, comme s’il n’avait jamais été foulé.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un courant d’air constant traverse le lieu, comme si la terre elle-même respirait. On ne sait jamais d’où il vient.",
  },
  {
    owner_type: "outro",
    content_text:
      "À la sortie, le vent se fait plus doux. Comme s’il vous raccompagnait vers la lumière.",
  },

  {
    owner_type: "intro",
    content_text:
      "Chaque rue débouche sur une nouvelle porte, souvent murée ou entrouverte. Le plan du lieu semble se réinventer à chaque passage.",
  },
  {
    owner_type: "outro",
    content_text:
      "En repartant, on a la sensation d’avoir oublié d’ouvrir la bonne. Une porte en particulier reste dans un coin de l’esprit.",
  },

  {
    owner_type: "intro",
    content_text:
      "Toutes les horloges du bâtiment affichent la même heure : celle de l’abandon. Le temps s’y est arrêté comme une montre cassée.",
  },
  {
    owner_type: "outro",
    content_text:
      "En quittant le lieu, on regarde sa propre montre. Elle semble avoir ralenti.",
  },

  {
    owner_type: "intro",
    content_text:
      "Dans ce complexe souterrain, la notion de jour et de nuit n’existe plus. Les lampes torches deviennent les seuls repères.",
  },
  {
    owner_type: "outro",
    content_text:
      "Quand on retrouve la lumière du jour, elle paraît étrangère. Comme si le temps avait coulé autrement là-dessous.",
  },

  {
    owner_type: "intro",
    content_text:
      "Une vaste salle centrale ressemble à un hall d’attente intemporel. Rien n’a bougé depuis des décennies.",
  },
  {
    owner_type: "outro",
    content_text:
      "En sortant, on a l’impression d’avoir attendu quelque chose… sans savoir quoi.",
  },

  {
    owner_type: "intro",
    content_text:
      "Les sièges vides font face à une scène en ruine. On a l’impression qu’une représentation s’apprête encore à commencer.",
  },
  {
    owner_type: "outro",
    content_text:
      "En franchissant les portes, un courant d’air fait craquer une planche de la scène. Le rideau tombe sur un spectacle invisible.",
  },

  {
    owner_type: "intro",
    content_text:
      "Des sons étranges se répercutent dans l’endroit. Impossible de savoir s’ils viennent de l’extérieur ou d’un autre temps.",
  },
  {
    owner_type: "outro",
    content_text:
      "À l’extérieur, le silence paraît anormalement dense. Les échos résonnent encore dans l’esprit.",
  },

  {
    owner_type: "intro",
    content_text:
      "Dans la pénombre, une verrière brisée laisse passer la lumière nocturne. Le ciel devient la seule toiture.",
  },
  {
    owner_type: "outro",
    content_text:
      "En sortant, on lève les yeux : le ciel est identique dehors. Pourtant, il semblait plus proche sous la verrière.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un long corridor mène vers une porte close au fond. Tout semble converger vers cet ultime passage.",
  },
  {
    owner_type: "outro",
    content_text:
      "En revenant sur ses pas, le couloir paraît plus court qu’à l’aller. Comme si la sortie avait toujours été là.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un vaste entrepôt accumule des objets de toutes époques. C’est comme si le monde entier avait déposé ses souvenirs ici.",
  },
  {
    owner_type: "outro",
    content_text:
      "Avant de refermer, un dernier objet attire le regard… sans qu’on sache pourquoi. Le lieu garde ses mystères.",
  },

  {
    owner_type: "intro",
    content_text:
      "Un escalier s’élève vers un étage effondré. Il donne l’impression de conduire vers un lieu qui n’existe plus.",
  },
  {
    owner_type: "outro",
    content_text:
      "En redescendant, les marches craquent une à une, comme pour compter votre départ.",
  },
];

const missionBlocks = [
  {
    owner_type: "mission",
    content_text:
      "Bâtie à flanc de colline, l'usine s'étend comme une carcasse grise rongée par le vent. Les machines silencieuses semblent attendre un signal oublié depuis longtemps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Derrière les vitres brisées, des fours éteints depuis des décennies sommeillent. Une odeur âcre flotte encore, comme si la dernière cuisson datait d'hier.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les arches en ruine dessinent des ombres rouges au coucher du soleil. On imagine encore les ouvriers empilant les briques, jour après jour, dans un vacarme assourdissant.",
  },
  {
    owner_type: "mission",
    content_text:
      "De grands métiers à tisser rouillés se dressent comme des bêtes mécaniques endormies. Des fils pendent du plafond comme des toiles d'araignée géantes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Dans l'air flotte encore une fine poussière de coton. Le silence qui règne ici contraste avec l'agitation passée des bobines en mouvement.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les générateurs immenses trônent dans une salle vide, semblables à des monstres métalliques endormis. Les murs vibrent encore parfois, comme si une étincelle pouvait tout rallumer.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rails rouillés serpentent dans la poussière. Des wagons vides, éventrés, gardent le silence des trajets qu'ils ne feront plus.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les grandes portes métalliques grincent au vent. À l'intérieur, l'écho d'un simple pas se répercute comme dans une cathédrale industrielle.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les lames immobiles sont couvertes de sciure figée. L'air sent encore la résine et la poussière de bois mouillé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des silos géants s'élèvent vers le ciel, vides mais encore imposants. Le sol craque sous des restes secs qui sentent la récolte passée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des crochets pendent au-dessus des fosses refroidies. Les murs sont noirs de suie, témoins d'une chaleur aujourd'hui disparue.",
  },
  {
    owner_type: "mission",
    content_text:
      "La roue géante ne tourne plus mais grince encore quand le vent s'y engouffre. Autrefois, des centaines de sacs y étaient remplis chaque jour.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les entrepôts aux fenêtres cassées longent une voie ferrée silencieuse. On devine la rumeur des chargements qui animaient autrefois la nuit.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des carcasses de voitures rouillent sous des bâches déchirées. Les outils sont restés comme figés dans le temps, prêts à resservir.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des établis couverts d'outils rouillés bordent la pièce. On entend presque encore le marteau frapper le métal dans l'écho du vide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des panneaux d'indicateurs éteints tapissent les murs. Des boutons usés racontent l'histoire d'un lieu autrefois animé par des mains expertes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des tuyaux massifs serpentent dans la salle souterraine. L'eau a laissé des traces calcaires blanches sur le béton gris.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les parois abruptes sont couvertes de mousses et de fissures. Un silence profond règne, troublé seulement par quelques gouttes tombant du plafond.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des poutres métalliques dessinent encore la silhouette d'un navire jamais achevé. Le sol résonne comme une cale vide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les portes massives grincent mais ne bougent plus. L'eau stagnante reflète le ciel gris comme un miroir fatigué.",
  },
  {
    owner_type: "mission",
    content_text:
      "Son entrée béante s'ouvre comme une bouche noire dans la colline. À l'intérieur, l'air devient froid et humide, chargé d'histoires murmurées par la roche.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des poutres brisées barrent le passage. La poussière s'accroche à la lumière des lampes comme une brume ancienne.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une cage rouillée descend dans l'obscurité sans fond. Le vertige s'empare de quiconque ose s'en approcher.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les cabines suspendues dans le vide oscillent doucement au vent. Les câbles grincent comme une plainte venue d'un autre temps.",
  },
  {
    owner_type: "mission",
    content_text:
      "La cuve immense, vide, résonne au moindre bruit. Les murs portent les marques d'anciennes vagues comme une mémoire liquide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Dressée comme une sentinelle rouillée, elle domine encore la zone industrielle. Ses bras immobiles pointent vers un ciel sans activité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une odeur âcre flotte encore entre les cheminées noircies. Les sols sont couverts d'une fine poussière sombre qui colle aux bottes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sa silhouette massive découpe l'horizon comme une cathédrale industrielle. À l'intérieur, la chaleur semble encore dormir dans les murs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des kilomètres de tuyauterie s'entrelacent comme une toile métallique. L'air y est étrangement immobile, comme si tout retenait son souffle.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des isolateurs en porcelaine bordent des structures silencieuses. On pourrait presque entendre encore le bourdonnement des lignes à haute tension.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des couloirs vides s'étirent comme un labyrinthe blême. Des brancards rouillés et des papiers jaunis témoignent d'un passé agité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Perché en montagne, il est enveloppé d'une brume persistante. Les chambres aux grandes fenêtres ouvrent sur des forêts silencieuses.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des lits vides s'alignent dans une salle commune. Une pendule arrêtée marque une heure qui ne reviendra pas.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des dessins d'enfants jaunis sont encore accrochés aux murs. Les dortoirs glacés résonnent du silence des voix disparues.",
  },
  {
    owner_type: "mission",
    content_text:
      "Le parquet craque sous chaque pas dans les couloirs interminables. Des casiers encore remplis racontent des départs précipités.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les pupitres en bois sont alignés comme au premier jour. Une odeur de craie flotte encore dans l'air immobile.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les poutres tordues pendent au-dessus d'un sol fissuré. Des paniers de basket rouillés se dressent comme des reliques sportives.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les rideaux poussiéreux sont encore tirés devant la scène. Des rangées de fauteuils déchirés regardent un espace désormais muet.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un projecteur silencieux trône dans la cabine, figé dans le temps. L'écran craquelé garde la trace d'images disparues.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les portraits officiels sont restés accrochés aux murs ternis. Le silence y a remplacé les voix administratives.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bancs de bois poussiéreux font face à un pupitre déserté. Les couloirs, autrefois solennels, résonnent maintenant d'un silence pesant.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des casiers à courrier vides s'alignent contre les murs jaunis. L'odeur du papier humide flotte encore dans l'air stagnant.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des étagères croulent sous des ouvrages oubliés. Le moindre pas soulève une poussière qui danse dans la lumière oblique.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des vitrines vides font face à des murs nus où pendaient autrefois des œuvres. L'air sent la cire froide et l'abandon.",
  },
  {
    owner_type: "mission",
    content_text:
      "La grande coupole est immobile, figée dans une direction oubliée. Les instruments sont couverts d'une fine pellicule de poussière stellaire.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les escaliers majestueux s'effritent sous le poids des années. Les bureaux abandonnés regorgent de dossiers jaunis aux tampons effacés.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sa structure cylindrique domine la plaine, silhouette familière au loin. L'intérieur vide résonne comme une cathédrale de béton.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les cellules sombres sont alignées comme une rangée de bouches closes. Les portes grincent encore lorsqu'on les effleure.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des uniformes abandonnés pendent dans les vestiaires. Les dortoirs sont figés comme au lendemain d'un départ précipité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une porte blindée entrouverte laisse filtrer un souffle froid. Des néons éteints bordent un couloir profondément silencieux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Le clocher brisé penche dangereusement vers la nef éventrée. Des vitraux éclatés projettent encore quelques éclats de lumière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses arches massives s'élèvent dans un silence sacré. Les murs, encore debout, gardent la mémoire des chants lointains.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes usées bordent un jardin intérieur envahi de lierre. Le vent y transporte une quiétude séculaire.",
  },
  {
    owner_type: "mission",
    content_text:
      "De longues tables en bois massif occupent la salle voûtée. L'écho des repas communautaires semble flotter dans l'air.",
  },
  {
    owner_type: "mission",
    content_text:
      "En contrebas d'un escalier de pierre humide, une petite nef s'ouvre dans la roche. Des chandeliers rouillés y dorment dans l'ombre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des statues abîmées bordent une allée recouverte de mousse. Le lieu semble suspendu entre le sacré et l'abandon.",
  },
  {
    owner_type: "mission",
    content_text:
      "Le marbre fendu repose au centre d'une salle vide. Des cierges consumés ont laissé des coulées figées sur la pierre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un couloir étroit descend vers une salle basse. L'air y est frais, presque immobile, chargé d'une odeur de pierre humide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des couloirs aux portes ouvertes laissent entrevoir des cellules vides. La cour intérieure est envahie d'herbes folles.",
  },
  {
    owner_type: "mission",
    content_text:
      "Creusé à même la falaise, l'endroit est minuscule et isolé. La vue plonge sur une vallée silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les murs fissurés laissent deviner des fresques effacées. La cour intérieure est envahie d'herbes folles, silencieuse comme une prière interrompue.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sa flèche penche dangereusement vers le ciel gris. Les cloches, muettes, oscillent faiblement dans le vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les volets grincent sur une façade austère. À l'intérieur, les planchers craquent sous le poids de décennies oubliées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des allées de buis forment encore un dessin géométrique précis. Au centre, une vieille fontaine couverte de mousse murmure faiblement.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des pierres tombales inclinées disparaissent sous le lierre. Le vent y soulève parfois un silence lourd et respectueux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une croix sculptée se dresse au sommet d'une butte, rongée par le temps. La pierre verte d'humidité raconte les saisons passées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite cuve de pierre trône au centre de la pièce circulaire. Les murs portent des fresques à peine visibles.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes rongées par la végétation entourent un carré d'herbes folles. On y marche comme dans un rêve interrompu.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une lourde dalle de pierre ferme l'accès à la crypte. Des symboles effacés décorent encore son pourtour.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sous une voûte fissurée, des statues effacées fixent l'obscurité. La pierre de l'autel est fendue comme par un ancien séisme.",
  },
  {
    owner_type: "mission",
    content_text:
      "La façade imposante se dresse derrière des grilles tordues. Des fenêtres béantes donnent l'impression d'un regard vide sur le monde.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes blanches tachées d'humidité encadrent une porte entrouverte. À l'intérieur, les mosaïques sont ternies par la poussière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Petite bâtisse à l'écart, ses vitres sales laissent entrevoir des meubles abandonnés. Un vieux manteau est encore accroché à une patère.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les murs en torchis s'effritent lentement. Des outils agricoles rouillent dans la cour, figés comme des souvenirs de moissons.",
  },
  {
    owner_type: "mission",
    content_text:
      "La charpente brisée repose dans un chaos de poutres. Des bottes de foin aplaties témoignent de récoltes anciennes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses murs autrefois pimpants sont ternis par la pluie. Des rideaux défraîchis battent doucement dans le courant d'air.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les couloirs sombres sentent la poussière et le plâtre humide. Des boîtes aux lettres rouillées s'alignent comme des témoins muets.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sous la charpente grinçante, des malles et des jouets anciens dorment dans la pénombre. La poussière recouvre tout d'une fine pellicule dorée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une lourde porte de bois barre l'accès à une pièce enfouie. L'odeur de terre humide s'en échappe par les interstices.",
  },
  {
    owner_type: "mission",
    content_text:
      "La tour de pierre est percée de dizaines d'ouvertures. Des plantes grimpantes s'y sont installées à la place des oiseaux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au centre d'une cour envahie d'herbes, une margelle en pierre cerne un puits sans fond visible. Le vent y descend avec un écho inquiétant.",
  },
  {
    owner_type: "mission",
    content_text:
      "La structure métallique croule sous la rouille. Autrefois lieu de rencontre, il est maintenant envahi par les ronces.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des vasques de pierre fêlées reposent au milieu d'une place déserte. Un filet d'eau obstiné s'échappe encore d'un bec érodé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des dalles inclinées bordent un bassin à moitié comblé. L'écho des conversations d'autrefois semble s'accrocher aux pierres.",
  },
  {
    owner_type: "mission",
    content_text:
      "Isolée sur une colline, elle offre une vue dégagée à 360 degrés. Les marches étroites mènent à une plateforme battue par le vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les murs massifs sont entamés par des siècles d'intempéries. Des meurtrières béantes regardent encore la vallée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Deux piliers en pierre brisée gisent au sol comme des géants abattus. La grille rouillée repose tordue à leurs pieds.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les murs qui l'entourent forment une enceinte silencieuse. Au centre, une herbe haute pousse là où résonnaient autrefois des pas réguliers.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rangées de tonneaux vides bordent un sol couvert de mousse. Des gouttes tombent lentement du plafond voûté.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les marches en colimaçon sont suspendues dans le vide, certaines manquantes. Monter ici, c'est affronter le vertige.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les gradins en pierre dessinent un demi-cercle majestueux. Le vent y porte encore une acoustique parfaite.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une longue piste ovale se devine sous les herbes hautes. Les ruines des gradins abritent désormais des lézards.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des gradins écroulés encerclent une arène silencieuse. Les pierres semblent encore vibrer du grondement des foules passées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Seuls quelques murs émergent des eaux calmes. Les algues ondulent entre les pierres comme des drapeaux engloutis.",
  },
  {
    owner_type: "mission",
    content_text:
      "Derrière une porte dérobée, un couloir étroit s'enfonce dans la pierre. Le silence y est presque inquiétant.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un long couloir voûté s'enfonce sous l'ancien monastère. Des torches éteintes sont encore fixées aux murs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des haies hautes dessinent un tracé compliqué. Le centre est invisible depuis l'extérieur, perdu dans la verdure.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses arches brisées plongent dans une rivière paisible. Des morceaux de pierre émergent comme les dents d'un géant disparu.",
  },
  {
    owner_type: "mission",
    content_text:
      "Légèrement inclinée, elle semble défier l'équilibre depuis des décennies. Ses marches usées tournent dans une spirale vertigineuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des peintures murales effacées couvrent les murs voûtés. À la lueur d'une lampe, des scènes oubliées reprennent vie un instant.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une enfilade de niches vides longe un couloir aux murs fissurés. Quelques statues mutilées demeurent, témoins muets d'un autre temps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des arcades couvertes de lierre entourent une terrasse effondrée. Des racines pendantes témoignent de la luxuriance passée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Scellée par des planches épaisses, elle semble interdire un passage oublié. Une gravure presque effacée reste visible sur le linteau.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une coupole majestueuse laisse filtrer des rais de lumière par ses craquelures. Au sol, des morceaux de plâtre dessinent une constellation involontaire.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un couloir étroit et voûté plonge dans une obscurité presque totale. Les murs semblent absorber les bruits.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au sol, des motifs géométriques apparaissent sous la poussière. Les couleurs, bien que ternies, révèlent une grande finesse d'exécution.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une plateforme surplombe un paysage boisé. Le garde-corps tordu menace de céder à la moindre rafale.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au centre du hameau abandonné, la place pavée est déserte. Une fontaine asséchée en marque encore le cœur.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des crochets rouillés bordent les parois où étaient suspendues des lampes. L'humidité a couvert le sol d'une fine couche glissante.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un orgue monumental trône au fond de la pièce. Ses tuyaux muets semblent attendre un souffle disparu depuis longtemps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des troncs noyés émergent d'un lac sombre et calme. L'eau a remplacé les sentiers, engloutissant la mémoire des arbres.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des parois abruptes plongent dans une eau claire et immobile. Des outils rouillés dorment sous la surface turquoise.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au détour d'un sentier effacé, une chute d'eau mince s'écoule sur des roches moussues. Le bruit apaise l'endroit comme une respiration lente.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un trou béant s'ouvre dans le sol, avalant la lumière. Un léger courant d'air froid en émane, comme un soupir ancien.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une paroi effondrée bouche partiellement l'entrée. À travers une fissure, on aperçoit un espace sombre et intact.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au centre d'un bois épais, plusieurs silhouettes de pierre veillent dans le silence. La mousse couvre leurs visages figés.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses pierres humides sont couvertes d'un tapis vert. Sous ses arches coule un filet d'eau tranquille.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une vaste cuvette craquelée s'étend à perte de vue. Des coques de barques abandonnées gisent dans la boue durcie.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des cavités naturelles parsèment la paroi abrupte. Le vent y produit une mélodie basse et continue.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au sommet d'une butte herbeuse, trois pierres dressées soutiennent une dalle massive. L'endroit respire un mystère ancien.",
  },
  {
    owner_type: "mission",
    content_text:
      "Dressé au milieu d'un champ désert, le menhir présente une large fissure verticale. Les légendes locales murmurent qu'elle s'est ouverte en une nuit d'orage.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un filet d'eau clair s'écoule d'une pierre moussue. Autour, des marches en ruine témoignent d'une ancienne fréquentation.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les arbres serrés laissent peu passer la lumière. Le bruissement des feuilles semble parfois former des mots.",
  },
  {
    owner_type: "mission",
    content_text:
      "L'eau verdâtre est couverte de lentilles et de roseaux immobiles. Des bulles remontent lentement à la surface comme une respiration enfouie.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bruyères fanées couvrent une étendue plane sous un ciel changeant. Le vent s'y engouffre librement, sans obstacle.",
  },
  {
    owner_type: "mission",
    content_text:
      "On l'entend avant de la voir : un grondement profond résonne dans les cavernes. Son cours invisible file dans l'obscurité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des cabines de bain en ruine bordent une étendue de sable vide. Le ressac vient mourir dans un silence étrange.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une haute dune s'élève comme une vague de sable pétrifiée. Le vent a sculpté sa surface en motifs changeants.",
  },
  {
    owner_type: "mission",
    content_text:
      "À peine visible sous les feuilles mortes, il serpente entre les arbres. Quelques vieilles bornes moussues indiquent qu'il était jadis fréquenté.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des statues à demi recouvertes de ronces bordent d'anciennes allées. La nature a repris possession de chaque recoin.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des panneaux délavés bordent une chaussée sans voitures. Les herbes folles poussent dans les fissures du bitume.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des barrières rouillées ferment une rampe qui ne mène plus nulle part. Les lignes blanches s'effacent lentement sous la pluie.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des quais envahis d'herbes attendent des trains qui ne viendront plus. Des pancartes rouillées indiquent encore des destinations oubliées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sous une route abandonnée, un tunnel court et sombre résonne au moindre bruit. Des graffitis effacés décorent ses parois.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des arches métalliques s'étendent au-dessus d'une vallée boisée. Le métal est rouge de corrosion et craque au vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les chaînes rouillées pendent mollement de chaque côté. La structure est figée en position basse, comme figée dans une attente infinie.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les pompes rouillées se dressent comme des spectres. Des affiches effacées vantent encore des prix d'un autre temps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des lignes blanches à moitié effacées dessinent un quadrillage désert. Des herbes folles poussent entre les dalles de béton.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une longue bande d'asphalte fend la plaine. Le vent siffle librement là où les avions touchaient autrefois le sol.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses vitres sales surplombent un aérodrome muet. À l'intérieur, les écrans sont noirs et les fauteuils vides.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses marches métalliques sont couvertes de poussière. Il ne mène plus qu'au silence des étages supérieurs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des vitrines brisées reflètent des allées désertes. L'écho des pas résonne comme dans une ville fantôme moderne.",
  },
  {
    owner_type: "mission",
    content_text:
      "Le bassin vidé révèle des carreaux fissurés. Des bouées oubliées flottent dans une eau stagnante au fond.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les gradins de béton sont envahis de végétation. Le vent traverse les couloirs comme une rumeur lointaine de victoires passées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les rampes effritées sont marquées par les années d'abandon. Quelques planches cassées traînent encore au sol.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des enclos vides bordent un sentier envahi de ronces. Les cages rouillées racontent des histoires silencieuses d'animaux disparus.",
  },
  {
    owner_type: "mission",
    content_text:
      "La grande roue immobile se découpe sur le ciel gris. Des stands aux couleurs ternies bordent une allée silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les chevaux de bois sont figés dans une danse éternelle. Le mécanisme central grince au moindre souffle de vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des fondations en pierre tracent les contours d'un bâtiment oublié. Le sol porte les marques d'une civilisation disparue.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes brisées jonchent le sol poussiéreux. Au centre, un autel effacé domine encore le silence.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une enfilade d'arches entamées s'élève au-dessus d'une vallée boisée. L'eau n'y coule plus depuis des siècles.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une vaste esplanade dallée s'étend au milieu des ruines. Des colonnes solitaires se dressent sous le ciel changeant.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sous une couche de terre, des motifs colorés réapparaissent lentement. Les tesselles racontent une histoire effacée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des voûtes basses soutiennent une salle fraîche et silencieuse. Des niches vides bordent les murs de pierre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des gradins de pierre semi-circulaires surplombent une scène nue. Les herbes folles envahissent les marches.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un ovale de pierre silencieux repose au milieu des broussailles. Des tunnels vides mènent vers des cages rouillées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une butte herbeuse dissimule une ancienne tombe. Une entrée à demi effondrée s'ouvre sur un passage étroit.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une structure massive et simple repose au bord d'un champ. La pierre est gravée de symboles effacés par le vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "De gigantesques blocs imbriqués forment une enceinte ancienne. Aucun ciment ne les unit, seulement leur poids millénaire.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un trou circulaire bordé de pierres polies descend dans la pénombre. L'air qui en émane est frais et sec.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des pavés irréguliers s'étendent à perte de vue sous la mousse. Chaque pierre semble marquée par des siècles de passages silencieux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un vaste réservoir voûté recueillait jadis l'eau de pluie. Aujourd'hui, seules quelques gouttes résonnent dans le vide humide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Perché sur une falaise, la lanterne brisée surplombe la mer. Son faisceau ne guide plus personne depuis longtemps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des quais vides bordent une eau calme et sombre. Les amarres pendent mollement aux anneaux rouillés.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un grand bassin vide attend des navires imaginaires. Des traces d'outils rouillés longent ses parois de pierre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un vieux navire repose sur le flanc dans une crique silencieuse. Les algues ont colonisé chaque planche de sa coque.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des poutres de bois dessinent encore la silhouette d'une coque inachevée. Le vent siffle dans les poutrelles métalliques.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une longue digue de pierre avance dans la mer. Des vagues viennent s'y briser dans un fracas monotone.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bollards rouillés émergent d'un sol fissuré. On imagine encore les cris des dockers et les cornes de brume.",
  },
  {
    owner_type: "mission",
    content_text:
      "À marée haute, seule la lanterne dépasse encore des flots. Le reste repose, englouti par des décennies de montée des eaux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des coques éventrées reposent côte à côte dans une vasière. Le bois craque doucement sous le poids des années.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses murs épais font face à l'horizon marin. Des embrasures rouillées surveillent encore la mer comme des yeux sans sommeil.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un étroit abri en béton s'enfonce dans la falaise. L'air y est froid, humide et résonne de gouttes régulières.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses bastions brisés s'ouvrent vers la mer. Les murs rongés par le sel s'écroulent lentement dans l'écume.",
  },
  {
    owner_type: "mission",
    content_text:
      "À moitié enfoui dans la dune, le béton gris émerge comme un vestige étranger. À l'intérieur, des inscriptions militaires sont encore visibles.",
  },
  {
    owner_type: "mission",
    content_text:
      "Elle domine la côte depuis un promontoire. Son escalier en colimaçon mène à une salle vitrée ouverte aux vents.",
  },
  {
    owner_type: "mission",
    content_text:
      "Entre deux falaises, une anse étroite abrite des eaux calmes. L'accès se devine à peine depuis la terre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Son sommet éventré laisse entrer les goélands. Les marches intérieures sont effondrées par endroits, rendant l'ascension périlleuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un couloir sombre traverse la roche de part en part. Le bruit des vagues résonne à l'autre extrémité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les plaques de métal qui le recouvrent sont mangées par le sel. Sa lumière n'a pas brillé depuis des décennies.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les entrepôts aux murs métalliques reflètent une lumière grise et plate. Les rails de manutention disparaissent sous les herbes hautes.",
  },
  {
    owner_type: "mission",
    content_text:
      "De grandes portes coulissantes ouvrent sur une nef vide. Des poutres en bois portent encore les traces de coques suspendues.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une pente pavée descend vers la mer. Les anneaux d'amarrage rouillés témoignent d'activités révolues.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des structures métalliques dessinent la silhouette d'un navire inachevé. Le sol est couvert d'outils abandonnés et de bois gonflé d'humidité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Surplombant la mer, elle est hérissée d'antennes silencieuses. À l'intérieur, des écrans vides surveillent un ciel vide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bollards massifs bordent une jetée en béton épais. L'air porte encore une odeur métallique et d'huile lourde.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les chambres froides sont couvertes de givre ancien. Des portes épaisses grincent en s'ouvrant sur des salles vides.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des machines couvertes de rouille bordent des couloirs étroits. Des boîtes cabossées traînent encore dans les recoins.",
  },
  {
    owner_type: "mission",
    content_text:
      "Construit en retrait de la côte, il guidait les marins à travers des chenaux complexes. Son faisceau est éteint depuis longtemps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Massive et sans ornement, elle domine une esplanade vide. Des escaliers en colimaçon montent vers une plateforme éventrée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite cabane vitrée se dresse près d'une barrière rouillée. À l'intérieur, une chaise renversée et un carnet jauni reposent dans la poussière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Le grillage tordu pend mollement le long des poteaux rouillés. Un ancien panneau 'Accès interdit' est à moitié effacé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rails déformés serpentent entre des herbes folles. On devine encore le passage des convois dans le sol tassé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des établis encombrés font face à une large porte donnant sur la mer. Des outils lourds reposent là, comme prêts à resservir.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des planches disjointes composent une passerelle suspendue au-dessus d'une eau sombre. Chaque pas résonne dangereusement.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des cheminées muettes et des hangars délabrés bordent une route vide. L'air sent encore le métal froid et la poussière d'usine.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un bâtiment bas et solide aux portes renforcées gît dans l'ombre d'une colline. À l'intérieur, les étagères sont vides mais menaçantes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des silhouettes en bois percées de balles se dressent dans l'herbe haute. Des tranchées effondrées sillonnent encore le terrain.",
  },
  {
    owner_type: "mission",
    content_text:
      "De là-haut, la vue embrasse toute la zone alentour. Les marches grincent, mais la structure tient encore debout.",
  },
  {
    owner_type: "mission",
    content_text:
      "Enfoui dans la dune, il regarde toujours la mer à travers ses meurtrières. Le béton épais est craquelé par les embruns.",
  },
  {
    owner_type: "mission",
    content_text:
      "D'anciennes voies rouillées serpentent au milieu des herbes folles. Des wagons abandonnés sont figés comme des bêtes métalliques endormies.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une grande rotonde abrite encore des locomotives couvertes de rouille. Les vitres cassées laissent entrer une lumière blafarde.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les barrières sont levées en permanence. Les cloches muettes rouillent au-dessus d'une voie envahie d'herbes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des dizaines de voies parallèles s'étendent à perte de vue. Les aiguillages sont bloqués dans une position figée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un immense ouvrage en arc surplombe une vallée boisée. Les rails rouillés serpentent au-dessus du vide.",
  },
  {
    owner_type: "mission",
    content_text:
      "Long et sombre, il garde encore la fraîcheur humide de la pierre. Des inscriptions effacées ornent son entrée voûtée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une plateforme en béton bordée de rails s'étend derrière un entrepôt vide. Des crochets de levage pendent encore du plafond.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un bâtiment circulaire abrite des locomotives silencieuses. Une plaque tournante rouillée occupe le centre de la structure.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des leviers massifs alignés bordent une grande baie vitrée. La salle surplombe des rails envahis par la végétation.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une structure circulaire rouillée pivote encore légèrement sous le vent. Elle desservait jadis les voies rayonnant de la rotonde.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une immense charpente métallique abrite des voies abandonnées. Le silence y est seulement troublé par le vent qui siffle entre les poutres.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une voie unique s'enfonce dans la végétation. Des tampons amortisseurs rouillés marquent sa fin oubliée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bâtiments en briques et en acier bordent une cour vide. Les vitres brisées reflètent un ciel d'acier.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une tour en briques domine un bâtiment effondré. Jadis, elle symbolisait la puissance industrielle de l'endroit.",
  },
  {
    owner_type: "mission",
    content_text:
      "De larges verrières éclairent une salle remplie d'outils figés. Les établis sont encore en place comme si le travail s'était arrêté hier.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des chaudières massives bordent une pièce au plafond suintant. Des tuyaux rouillés serpentent dans toutes les directions.",
  },
  {
    owner_type: "mission",
    content_text:
      "De lourdes structures mécaniques occupent toute la pièce. Un grondement imaginaire semble encore vibrer dans les murs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une haute colonne de briques fend le ciel gris. Autrefois, elle rejetait d'épaisses volutes noires au-dessus du quartier.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rails encastrés dans le sol dessinent des chemins oubliés. Des crochets et poulies pendent encore aux structures métalliques.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des câbles épais relient un bloc métallique imposant à des pylônes rouillés. L'air y vibre d'un silence électrique figé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un grand cylindre en béton domine une colline. L'intérieur vide résonne comme une cathédrale silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des tuyaux massifs sortent du sol et s'entrelacent dans une salle vide. Le bourdonnement des machines a cessé depuis longtemps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des roues métalliques gigantesques reposent dans l'ombre. La rouille grignote lentement ces témoins d'une puissance révolue.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un vaste hall abrite des machines imposantes et des tableaux de commande poussiéreux. Les câbles pendent comme des lianes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une bouche béante s'ouvre dans la colline, bordée de poutres noircies. Des rails descendent dans l'obscurité.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une structure métallique élancée se détache sur le ciel nuageux. Elle surplombe une fosse silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un couloir étroit s'enfonce dans la roche. Des planches effritées soutiennent encore la voûte sombre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une montagne artificielle de gravats domine le paysage. Des arbustes clairsemés s'accrochent à ses pentes instables.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un grand trou vertical descend dans les ténèbres. Des poutres métalliques rouillées bordent encore son ouverture.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bureaux poussiéreux s'alignent derrière une façade sévère. Des classeurs ouverts et des machines à écrire témoignent d'une activité révolue.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rangées de lits métalliques rouillés bordent une grande pièce. Les couvertures sont mangées par le temps.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des tables alignées font face à un comptoir de service désert. Des assiettes cassées jonchent le sol carrelé.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des boutons poussiéreux et des cadrans figés couvrent les murs. Des vitres surplombent un vaste hall technique.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un conduit vertical fend la colline. Le vent y siffle comme dans une flûte géante.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des parois abruptes entourent une vaste cuvette envahie par les ronces. Des blocs entiers sont encore posés à moitié taillés.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une vaste structure métallique abrite des sacs éventrés et des outils rouillés. Des pigeons ont élu domicile dans la charpente.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une large plateforme métallique repose au milieu d'une cour. Les chiffres sur le cadran sont effacés mais lisibles à la lumière rasante.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rails étroits serpentent vers une entrée béante dans la colline. Quelques wagonnets abandonnés gisent sur le côté.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une enclume trône au centre d'une salle noire de suie. Le foyer éteint garde les marques d'une chaleur intense passée.",
  },
  {
    owner_type: "mission",
    content_text:
      "De grands cylindres métalliques alignés longent les murs d'une pièce sombre. Le silence y est presque mécanique.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une haute tour cylindrique se dresse au bord d'une voie ferrée désaffectée. À l'intérieur, la poussière forme un voile suspendu dans l'air immobile.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses pales brisées reposent dans l'herbe haute. Le bâtiment en pierre garde encore la trace des engrenages anciens.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les planches disjointes laissent passer la lumière en fins rayons. À l'intérieur, des outils agricoles rouillés dorment dans la poussière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un corps de ferme en U entoure une cour silencieuse. Des abreuvoirs vides et des charrettes cassées jonchent le sol.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des stalles alignées bordent une pièce à la charpente sombre. L'odeur d'animaux a disparu, ne laissant que le craquement du bois.",
  },
  {
    owner_type: "mission",
    content_text:
      "La petite tour en pierre est éventrée. Les alvéoles intérieures sont visibles comme un nid géant à ciel ouvert.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une grande vis métallique rouillée repose au centre d'une salle de pierre. Des taches sombres marquent encore le sol.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un cercle de pierres polies encadre un trou profond. Une manivelle grinçante est encore fixée au-dessus.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une haute charpente ajourée s'élève au bord d'un champ. L'air y circulait autrefois librement entre les feuilles suspendues.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des herbes hautes ont remplacé les rangées ordonnées de cultures. Le vent ondule comme une mer végétale oubliée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite cabane en bois abrite des pelles et des faucilles rouillées. L'air y sent la terre et le métal froid.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des rangées d'arbres fruitiers tordus s'étendent à perte de vue. Les fruits tombés pourrissent dans l'herbe haute.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite construction en pierre borde un bassin rectangulaire. L'eau claire reflète les poutres du toit effondré.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite construction de pierre repose au bout d'un chemin de terre. À l'intérieur, une statue effritée veille encore.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une croix en pierre envahie de lichen se dresse au bord d'un chemin creux. Le socle est fendu par les racines voisines.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un creux circulaire craquelé s'étend au pied d'un bosquet. Des roseaux morts marquent les anciennes berges.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des bottes anciennes reposent sur des planches grinçantes. La lumière entre par les interstices, illuminant les particules en suspension.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au centre d'une placette herbeuse, un puits de pierre surmonté d'une poutre en bois résiste au temps. Des cordes effilochées pendent encore.",
  },
  {
    owner_type: "mission",
    content_text:
      "Seule la tour d'une ancienne église se dresse au milieu d'un champ. Les cloches sont silencieuses depuis des décennies.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite croix en fer forgé est plantée à la croisée de deux sentiers. La rouille a mangé ses volutes décoratives.",
  },
  {
    owner_type: "mission",
    content_text:
      "Ses tours éventrées dominent la vallée. Des pans de murs tiennent encore debout, défiant les siècles dans un silence noble.",
  },
  {
    owner_type: "mission",
    content_text:
      "Isolée sur un piton rocheux, elle surplombe une plaine brumeuse. Ses escaliers étroits mènent à une plateforme ouverte au vent.",
  },
  {
    owner_type: "mission",
    content_text:
      "D'énormes blocs de pierre gisent dans les fossés. Des pans de murs crénelés sont encore visibles au sommet de la colline.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un grand arc en pierre encadre une herse rouillée. Le passage, autrefois contrôlé, est aujourd'hui envahi par la végétation.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une longue muraille rectiligne est recouverte de mousse et de lierre. Ses pierres parfaitement ajustées témoignent d'un savoir-faire ancien.",
  },
  {
    owner_type: "mission",
    content_text:
      "La tour centrale du château est éventrée. Des pans de murs laissent voir des étages autrefois impénétrables.",
  },
  {
    owner_type: "mission",
    content_text:
      "Autour des murs, un large fossé rempli de végétation remplace l'eau disparue. Des pierres taillées dessinent encore son tracé net.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une structure avancée défendait l'entrée principale. Ses murs épais encadrent une cour étroite à demi effondrée.",
  },
  {
    owner_type: "mission",
    content_text:
      "Placée à l'angle d'une muraille, elle permettait de surveiller les abords latéraux. Ses archères sont encore visibles.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite ouverture dans la muraille mène à un sentier secret. La porte de bois vermoulu est à moitié ouverte.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des râteliers vides longent les murs épais. L'air y est froid et chargé d'une solennité silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Entre les murs intérieurs, une grande cour pavée s'ouvre sur les dépendances. Des herbes fines ont remplacé les soldats.",
  },
  {
    owner_type: "mission",
    content_text:
      "Petite mais ornée, elle occupe un angle discret du château. Les fresques à demi effacées murmurent encore des prières muettes.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un escalier en colimaçon monte dans une étroite tourelle. La lumière y entre par de rares fentes verticales.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une allée abritée longe les remparts intérieurs. Des poutres sombres soutiennent une toiture en partie effondrée.",
  },
  {
    owner_type: "mission",
    content_text:
      "De grandes cheminées en pierre dominent une salle voûtée. Des crochets pendent encore au-dessus des foyers noirs de suie.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une pièce fraîche et humide s'enfonce sous la cour. Des tonneaux éclatés reposent contre les murs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sous la charpente effondrée, des sacs éventrés libèrent un flot de grains fossilisés. Des poutres craquent sous leur propre poids.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une grande pièce aux murs nus accueille une estrade vide. Des fenêtres étroites éclairent une atmosphère solennelle.",
  },
  {
    owner_type: "mission",
    content_text:
      "Fine et élancée, elle se détache au-dessus des toits en ruine. Des oiseaux ont élu domicile dans ses fissures.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des arcades élégantes entourent un jardin couvert de ronces. Le silence y est profond, seulement troublé par le vent entre les colonnes.",
  },
  {
    owner_type: "mission",
    content_text:
      "La nef immense résonne au moindre pas. Des vitraux fissurés laissent filtrer une lumière pâle sur les dalles usées.",
  },
  {
    owner_type: "mission",
    content_text:
      "De longues tables en bois bordent une salle voûtée. Une chaire de lecture surplombe l'endroit, figée dans le silence.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une longue pièce sobre est éclairée par des fenêtres étroites. Les lits alignés ont disparu, ne laissant que des traces dans la poussière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes fines soutiennent un plafond voûté délicat. Les bancs de pierre longent les murs dans une symétrie parfaite.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des allées rectilignes bordées de buis envahis dessinent encore des motifs géométriques. Au centre, une fontaine sèche trône silencieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des étagères vides bordent une salle lumineuse. Des fragments de manuscrits effacés jonchent encore le sol.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes trapues soutiennent une salle basse et fraîche. Des niches vides évoquent des sépultures oubliées.",
  },
  {
    owner_type: "mission",
    content_text:
      "Sa base fissurée l'incline légèrement vers le ciel. Les cloches sont figées, mais le vent les fait parfois vibrer doucement.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des arcs richement décorés encadrent une porte monumentale. Les sculptures sont usées mais encore expressives.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une petite pièce attenante renferme des armoires vides. Des niches dans les murs gardent la mémoire d'objets précieux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des pierres tombales alignées sont à demi englouties par la mousse. Le silence y est total, presque solennel.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un couloir de pierre relie discrètement deux bâtiments. La lumière y filtre par de petites ouvertures en hauteur.",
  },
  {
    owner_type: "mission",
    content_text:
      "Au centre d'une cour, une vasque taillée dans la pierre laisse encore suinter une eau claire. Des croix sont gravées sur ses rebords.",
  },
  {
    owner_type: "mission",
    content_text:
      "Nichée sous une église en ruine, elle est accessible par un escalier étroit. Des fresques effacées décorent encore ses murs.",
  },
  {
    owner_type: "mission",
    content_text:
      "Une allée bordée de pierres plates serpente entre champs et forêts. Des croix gravées jalonnent discrètement le parcours.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des colonnes brisées entourent une petite abside. L'endroit est chargé d'une atmosphère recueillie et mystérieuse.",
  },
  {
    owner_type: "mission",
    content_text:
      "Elle sépare encore le chœur de la nef, tordue par les siècles mais toujours debout. Des motifs floraux rouillés décorent ses barreaux.",
  },
  {
    owner_type: "mission",
    content_text:
      "Des stations numérotées bordent un sentier sinueux. Les sculptures érodées racontent une histoire gravée dans la pierre.",
  },
  {
    owner_type: "mission",
    content_text:
      "Les piliers brisés bordent un couloir de pierre ouvert au ciel. L'air circule librement là où régnait autrefois la prière.",
  },
  {
    owner_type: "mission",
    content_text:
      "Un étage de galeries surplombe la cour intérieure. Des arcs élégants encadrent une vue saisissante sur les ruines en contrebas.",
  },
];

// Helper pour générer une URL d'image liée au texte
function getImageUrl(text, type, idx) {
  // Utilise Lorem Picsum pour une image différente à chaque bloc
  return `https://picsum.photos/seed/${idx}-urbex/800/600`;
}

// Place la logique d'insertion APRÈS la déclaration complète des tableaux
setTimeout(() => {
  // Purge la table blocks avant insertion
  db.prepare("DELETE FROM blocks").run();
  const blocks = [];
  // Récupère les scénarios depuis la base de données
  const dbScenarios = db
    .prepare("SELECT _id_scenario FROM scenarios ORDER BY _id_scenario ASC")
    .all();
  // Synchronise le nombre d'intros/outros avec le nombre réel de scénarios (50)
  const scenarioCount = Math.min(dbScenarios.length, 50);
  for (let i = 0; i < scenarioCount; i++) {
    const scenario = dbScenarios[i];
    // Sécurise l'accès au tableau
    const introIdx = i * 2;
    const outroIdx = i * 2 + 1;
    if (introIdx < scenarioBlocks.length) {
      blocks.push({
        owner_type: "scenario_intro",
        _id_scenario: scenario._id_scenario,
        position_block: 1,
        type_block: "text",
        content_text: scenarioBlocks[introIdx].content_text,
        url_media: null,
      });
      blocks.push({
        owner_type: "scenario_intro",
        _id_scenario: scenario._id_scenario,
        position_block: 2,
        type_block: "image",
        content_text: null,
        url_media: getImageUrl(
          scenarioBlocks[introIdx].content_text,
          "intro",
          i
        ),
      });
    }
    if (outroIdx < scenarioBlocks.length) {
      blocks.push({
        owner_type: "scenario_outro",
        _id_scenario: scenario._id_scenario,
        position_block: 1,
        type_block: "text",
        content_text: scenarioBlocks[outroIdx].content_text,
        url_media: null,
      });
      if (i % 3 === 0) {
        blocks.push({
          owner_type: "scenario_outro",
          _id_scenario: scenario._id_scenario,
          position_block: 2,
          type_block: "image",
          content_text: null,
          url_media: getImageUrl(
            scenarioBlocks[outroIdx].content_text,
            "outro",
            i
          ),
        });
      }
    }
  }

  // Synchronise le nombre de blocs de mission avec le nombre de missions
  for (let i = 0; i < missions.length; i++) {
    const mission = missions[i];
    blocks.push({
      owner_type: "mission",
      _id_mission: mission._id_mission,
      position_block: 1,
      type_block: "text",
      content_text: missionBlocks[i % missionBlocks.length].content_text,
      url_media: null,
    });
    // Ajoute une image à 1 mission sur 4
    if (i % 4 === 0) {
      blocks.push({
        owner_type: "mission",
        _id_mission: mission._id_mission,
        position_block: 2,
        type_block: "image",
        content_text: null,
        url_media: getImageUrl(
          missionBlocks[i % missionBlocks.length].content_text,
          "mission"
        ),
      });
    }
  }

  const insertBlock = db.prepare(`
    INSERT INTO blocks (
      owner_type,
      _id_scenario,
      _id_mission,
      position_block,
      type_block,
      content_text,
      url_media
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertAllBlocks = db.transaction(() => {
    for (const block of blocks) {
      // Respecte la contrainte CHECK du schéma
      if (
        block.owner_type === "scenario_intro" ||
        block.owner_type === "scenario_outro"
      ) {
        // Ces blocs doivent avoir _id_scenario défini et _id_mission null
        if (!block._id_scenario || block._id_mission) {
          console.warn("Bloc ignoré (contrainte):", block);
          continue;
        }
      } else if (block.owner_type === "mission") {
        // Ces blocs doivent avoir _id_mission défini et _id_scenario null
        if (!block._id_mission || block._id_scenario) {
          console.warn("Bloc ignoré (contrainte):", block);
          continue;
        }
      }
      insertBlock.run(
        block.owner_type,
        block._id_scenario || null,
        block._id_mission || null,
        block.position_block,
        block.type_block,
        block.content_text,
        block.url_media
      );
    }
  });

  insertAllBlocks();
  console.log(`Seed blocks: ${blocks.length} blocs insérés.`);
}, 0);
