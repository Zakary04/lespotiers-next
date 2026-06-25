export interface Artisan {
  id: number;
  slug: string;
  name: string;
  title: string;
  experience?: string;
  yearsExperience?: number;
  shortBio?: string;
  bio?: string;
  biography: string[];
  philosophy: string;
  techniques: string;
  portraitImage: string;
  image?: string;
  quote?: string;
  specialties: string[];
  productIds: (string | number)[];
  location?: string;
}

export const artisans: Artisan[] = [
  {
    id: 2,
    slug: 'ahou-kouassi',
    name: 'Ahou KOUASSI',
    title: 'Maître Potière',
    experience: "28 ans d'expérience",
    shortBio: 'Ahou KOUASSI crée des formes épurées et contemporaines, alliant tradition et modernité avec une élégance rare.',
    biography: [
      "Ahou KOUASSI représente la nouvelle génération de potiers de Tanou-Sakassou, celle qui honore l'héritage tout en osant l'innovation. Formée aux techniques traditionnelles par les anciens du village, elle a ensuite étudié la céramique contemporaine, enrichissant son vocabulaire formel sans jamais renier ses racines.",
      "Son atelier, installé dans l'ancienne case de sa grand-mère, est un pont entre deux mondes. D'un côté, le tour de potier électrique qu'elle a acquis avec ses premières économies; de l'autre, les calebasses et pierres polies utilisées depuis des générations. Cette dualité nourrit son travail: des lignes épurées, presque minimalistes, mais habitées par une sensibilité profondément enracinée dans la culture baoulé.",
      "Ahou KOUASSI accorde une attention particulière aux détails de finition. Chacun de ses bols, chacune de ses carafes est poli avec une patience infinie jusqu'à obtenir cette surface soyeuse qui invite au toucher. 'La beauté réside dans la simplicité,' dit-elle. 'Quand on retire le superflu, l'essentiel rayonne.'",
    ],
    philosophy: "La modernité n'efface pas la tradition, elle la révèle sous un jour nouveau. Mes pièces sont des ponts entre hier et aujourd'hui.",
    techniques: "Tournage haute précision, émaillage artisanal, polissage intensif, cuisson contrôlée, décoration à l'engobe",
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/7c95d849368cec53d9ecdfb17093c3bc.jpg',
    quote: "Dans la courbe parfaite d'un bol se cache toute l'histoire de notre art. Simplicité n'est pas facilité.",
    specialties: ['Bols raffinés', 'Carafes élégantes', 'Formes contemporaines'],
    productIds: ['bowl-adjoua-1', 'vase-adjoua-2', 'decorative-adjoua-2', 'jar-adjoua-3'],
  },
  {
    id: 8,
    slug: 'anicet-gada',
    name: 'Anicet GADA',
    title: 'Maître Potier',
    experience: "18 ans d'expérience",
    yearsExperience: 18,
    shortBio: "Anicet GADA est un maître artisan spécialisé dans la création de pièces fonctionnelles et décoratives. Son approche holistique de la poterie intègre respect de l'environnement et qualité artisanale. Chaque création est une manifestation de son engagement envers l'excellence.",
    bio: "Anicet GADA est un maître artisan spécialisé dans la création de pièces fonctionnelles et décoratives. Son approche holistique de la poterie intègre respect de l'environnement et qualité artisanale. Chaque création est une manifestation de son engagement envers l'excellence.",
    biography: [
      "Anicet GADA est un maître artisan spécialisé dans la création de pièces fonctionnelles et décoratives. Son approche holistique de la poterie intègre respect de l'environnement et qualité artisanale. Chaque création est une manifestation de son engagement envers l'excellence.",
    ],
    philosophy: 'La beauté et la fonctionnalité doivent coexister harmonieusement.',
    techniques: 'Tournage au tour, Finition manuelle, Cuisson écologique',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/a804267f30cd3061a5caab5b60355830.jpg',
    image: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/a804267f30cd3061a5caab5b60355830.jpg',
    quote: 'Un objet bien fait est un objet qui dure.',
    specialties: ['Poterie fonctionnelle', 'Design durable', 'Art céramique'],
    location: 'Région Artisanale',
    productIds: [33, 34, 35, 36],
  },
  {
    id: 4,
    slug: 'charles-koffi',
    name: 'Charles KOFFI',
    title: 'Artiste Céramiste',
    experience: "22 ans d'expérience",
    shortBio: 'La plus jeune du collectif, Charles explore des formes contemporaines tout en puisant dans le répertoire symbolique baoulé.',
    biography: [
      "À 30 ans, Charles KOFFI est la benjamine du collectif Les Artisans de Tanou-Sakassou, mais aussi sa voix la plus audacieuse. Revenue au village après des études d'arts plastiques à Abidjan, elle a choisi de faire de la céramique son langage d'expression principal. Son retour n'était pas une fuite, mais un choix délibéré de s'ancrer dans ses racines pour mieux déployer ses ailes.",
      "Charles travaille à la frontière entre artisanat et art contemporain. Ses pièces – sculptures abstraites, assiettes murales, objets décoratifs – revisitent les motifs traditionnels baoulé avec un regard neuf. Elle ose les couleurs vives, les formes organiques, les assemblages inattendus. Pourtant, chacune de ses créations porte en elle l'empreinte de l'héritage: ces techniques millénaires qu'elle a apprises auprès des anciens.",
      "Son atelier est un laboratoire d'expérimentation. On y trouve des émaux qu'elle formule elle-même en mélangeant des cendres végétales locales avec des oxydes métalliques, des moules en plâtre qu'elle a sculptés, des carnets remplis d'esquisses et de formules chimiques. 'Je ne veux pas être une gardienne figée du passé,' dit-elle. 'Je veux être un pont vivant entre nos ancêtres et les générations futures.'",
    ],
    philosophy: "L'innovation ne trahit pas la tradition, elle la célèbre. Chaque nouvelle forme est un hommage renouvelé à ceux qui nous ont précédés.",
    techniques: 'Sculpture libre, impression végétale, émaillage expérimental, cuisson réductrice, assemblage de formes',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/58f432039a229eff8cd704a3a9efa6a6.jpg',
    quote: "Mes mains façonnent l'argile avec les gestes que m'ont transmis les anciens, mais mon esprit voyage vers demain.",
    specialties: ['Sculptures contemporaines', 'Pièces décoratives', 'Créations murales'],
    productIds: ['vase-affoue-1', 'jar-affoue-2', 'bowl-affoue-3', 'vase-affoue-3', 'decorative-affoue-3'],
  },
  {
    id: 1,
    slug: 'fulgence-kouassi',
    name: 'Fulgence KOUASSI',
    title: 'Maître Potier',
    experience: "35 ans d'expérience",
    shortBio: 'Spécialiste des grandes jarres traditionnelles, Fulgence perpétue les techniques ancestrales transmises par son grand-père.',
    biography: [
      "Fulgence KOUASSI a grandi au cœur de Tanou-Sakassou, bercé par le ronronnement des tours de potier. Dès l'âge de sept ans, il accompagnait son grand-père aux carrières d'argile, apprenant à reconnaître la terre par sa texture, sa couleur, son odeur. Cette initiation précoce a façonné non seulement ses mains, mais aussi son regard sur le monde.",
      "Aujourd'hui maître reconnu, Fulgence est le gardien des techniques les plus anciennes de notre village. Il façonne encore ses pièces au colombin, cette méthode millénaire où l'on monte l'argile boudin après boudin, dans un geste méditatif et précis. Ses grandes jarres, qui peuvent atteindre plus d'un mètre de hauteur, nécessitent plusieurs jours de travail patient.",
      "Au-delà de la technique, Fulgence transmet une philosophie: 'La terre nous parle si nous savons l'écouter. Chaque argile a sa personnalité, son rythme. Mon rôle n'est pas de la dominer, mais de collaborer avec elle.' Cette sagesse résonne dans chacune de ses créations, objets utilitaires devenus porteurs d'une mémoire collective.",
    ],
    philosophy: "La poterie n'est pas un combat contre la matière, c'est un dialogue. Je ne façonne pas l'argile, nous nous façonnons mutuellement.",
    techniques: 'Colombinage traditionnel, cuisson au feu de bois, polissage à la pierre de rivière, décoration incisée, enfumage contrôlé',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/d9dbc25867a507064e2cb1172a4e781c.jpg',
    quote: 'Chaque pièce porte en elle la mémoire de la terre d\'où elle vient et la sagesse des mains qui l\'ont façonnée.',
    specialties: ['Grandes jarres', 'Vases monumentaux', 'Formes traditionnelles'],
    productIds: ['vase-totem-fulgence', 'vase-kouame-1', 'bowl-kouame-2', 'decorative-kouame-3'],
  },
  {
    id: 5,
    slug: 'moise-kouame',
    name: 'Moise KOUAME',
    title: 'Maître Décorateur',
    experience: "38 ans d'expérience",
    shortBio: 'Moise KOUAME est reconnu pour ses décors sculptés en relief, inspirés de la mythologie et de la nature.',
    biography: [
      "Moise KOUAME est l'homme des détails. Là où d'autres potiers se concentrent sur la forme générale, lui passe des heures à ciseler la surface de ses créations, transformant chaque vase en un récit en relief. Serpents, calebasses, motifs géométriques, scènes de vie villageoise: ses pièces sont des livres ouverts sur la culture baoulé.",
      "Cette passion pour la décoration lui vient de son père, sculpteur sur bois renommé. Enfant, Moise passait des après-midi entiers à observer les mains de son père donner vie au bois brut. Quand il s'est tourné vers la poterie, il a naturellement transposé cette approche sculpturale à l'argile. Chacune de ses pièces nécessite un double travail: d'abord façonner la forme, ensuite la métamorphoser par la décoration.",
      "Moise travaille l'argile encore humide, à ce moment précis où elle est assez ferme pour supporter la pression des outils, mais encore assez souple pour recevoir l'empreinte. Avec des ébauchoirs, des mirettes, des bâtonnets de bois sculptés par ses soins, il incise, estampe, modèle. Le résultat: des surfaces vivantes, texturées, où la lumière joue et révèle toujours de nouveaux détails.",
    ],
    philosophy: "La surface d'une poterie n'est jamais neutre. C'est une peau qui porte les marques de son histoire, un parchemin qui raconte.",
    techniques: "Modelage au colombin, sculpture en relief, estampage de motifs, décoration incisée, patine d'enfumage",
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/f7f3eb6567e54deade11612b1cf51e2d.jpg',
    quote: 'Chaque motif que je grave raconte une légende. Mes poteries sont des contes en terre cuite.',
    specialties: ['Vases décorés', 'Motifs en relief', 'Sculptures narratives'],
    productIds: ['decorative-nguessan-1', 'bowl-nguessan-2', 'jar-nguessan-3', 'vase-nguessan-4'],
  },
  {
    id: 6,
    slug: 'severin-kouakou',
    name: 'Sévérin KOUAKOU',
    title: 'Maître Potier',
    experience: "15 ans d'expérience",
    yearsExperience: 15,
    shortBio: "Sévérin KOUAKOU est un artisan passionné par la céramique traditionnelle. Avec plus de 15 ans d'expérience, il crée des pièces uniques qui reflètent l'héritage culturel de la région.",
    bio: "Sévérin KOUAKOU est un artisan passionné par la céramique traditionnelle. Avec plus de 15 ans d'expérience, il crée des pièces uniques qui reflètent l'héritage culturel de la région.",
    biography: [
      "Sévérin KOUAKOU est un artisan passionné par la céramique traditionnelle. Avec plus de 15 ans d'expérience, il crée des pièces uniques qui reflètent l'héritage culturel de la région. Son travail combine techniques ancestrales et créativité contemporaine.",
    ],
    philosophy: "Chaque pièce raconte une histoire et porte l'âme de la terre.",
    techniques: 'Tournage à la main, Cuisson au four traditionnel, Décoration géométrique',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/8eb8f912cb5cbedffa384edece40a82b.jpg',
    image: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/8eb8f912cb5cbedffa384edece40a82b.jpg',
    quote: 'La poterie est un dialogue entre l\'artisan et la matière.',
    specialties: ['Céramique traditionnelle', 'Sculptures', 'Poterie utilitaire'],
    location: 'Région Artisanale',
    productIds: [25, 26, 27, 28],
  },
  {
    id: 7,
    slug: 'yolande-kouassi',
    name: 'Yolande KOUASSI',
    title: 'Maître Potière',
    experience: "12 ans d'expérience",
    yearsExperience: 12,
    shortBio: "Yolande KOUASSI est reconnue pour son innovation dans l'art de la poterie. Elle fusionne les traditions ancestrales avec des techniques modernes pour créer des œuvres d'art contemporaines.",
    bio: "Yolande KOUASSI est reconnue pour son innovation dans l'art de la poterie. Elle fusionne les traditions ancestrales avec des techniques modernes pour créer des œuvres d'art contemporaines.",
    biography: [
      "Yolande KOUASSI est reconnue pour son innovation dans l'art de la poterie. Elle fusionne les traditions ancestrales avec des techniques modernes pour créer des œuvres d'art contemporaines. Son atelier est un lieu de création et de transmission du savoir-faire.",
    ],
    philosophy: "L'art de la poterie est une expression de liberté et de créativité.",
    techniques: 'Modelage libre, Émaillage artistique, Cuisson haute température',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/6dba7f78c7ab38007186cacf5c7613b7.jpg',
    image: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/6dba7f78c7ab38007186cacf5c7613b7.jpg',
    quote: 'Transformer la terre en beauté est ma passion.',
    specialties: ['Poterie contemporaine', 'Art céramique', 'Design innovant'],
    location: 'Région Artisanale',
    productIds: [29, 30, 31, 32],
  },
  {
    id: 3,
    slug: 'yannis-koffi',
    name: 'Yannis KOFFI',
    title: 'Maître Potier',
    experience: "42 ans d'expérience",
    shortBio: 'Yannis KOFFI est le dépositaire des techniques les plus anciennes, pratiquant encore la cuisson traditionnelle en fosse.',
    biography: [
      "Yannis KOFFI est une légende vivante à Tanou-Sakassou. À 60 ans, il est le dernier du village à pratiquer encore la cuisson en fosse, cette technique ancestrale où les poteries sont enfouies dans un trou creusé à même le sol, recouvertes de bois et de paille, puis cuites pendant plusieurs jours. Cette méthode imprévisible, où le feu et la fumée créent des effets uniques sur chaque pièce, est devenue sa signature.",
      "Fils et petit-fils de potiers, Yannis n'a jamais quitté le village. Il travaille la même terre que ses ancêtres, extraite de la carrière familiale située à quelques kilomètres. Chaque matin, avant l'aube, il se rend à son atelier en plein air, un espace sacré où s'empilent des décennies de savoir-faire. Ses gestes sont lents, mesurés, fruit d'une pratique quotidienne ininterrompue depuis l'âge de 18 ans.",
      "Yannis ne fait aucune concession à la modernité. Pas d'électricité dans son atelier, pas de tour électrique, pas de four à gaz. Tout est fait comme il y a cent ans, peut-être mille ans. Cette rigueur n'est pas un refus du progrès, mais un choix conscient de préserver un patrimoine vivant. 'Si nous perdons ces techniques,' explique-t-il, 'nous perdons une partie de notre âme collective.'",
    ],
    philosophy: "Les méthodes anciennes ne sont pas dépassées, elles sont intemporelles. La lenteur est une forme de résistance à l'oubli.",
    techniques: 'Cuisson traditionnelle en fosse, colombinage ancestral, décoration géométrique incisée, polissage à la main, finitions naturelles',
    portraitImage: 'https://horizons-cdn.hostinger.com/16a2de43-e76a-4373-bd10-5884af11d433/214a520e3bd70e516606d53203729947.jpg',
    quote: 'La fumée qui s\'élève de la fosse de cuisson porte nos prières aux ancêtres. Chaque poterie est une offrande.',
    specialties: ['Bols rituels', 'Sculptures traditionnelles', 'Pièces enfumées'],
    productIds: ['jar-konan-1', 'decorative-konan-2', 'vase-konan-2', 'bowl-konan-3'],
  },
];
