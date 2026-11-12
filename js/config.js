/* =========================================================
   CONFIGURACIÓN DE LA GALERÍA
   Aquí cambias todo: nombres, textos, fotos, salas y colores.
   No necesitas tocar los demás archivos.
   ========================================================= */

const CONFIG = {
  // Cómo la llamas a ella (aparece en la portada y en el cartel de la entrada)
  herName: "Mi amor",

  // Tu nombre (aparece en los cuadros de diálogo)
  guideName: "Fidel",

  // Título de la portada
  titleMain: "Feliz cumpleaños",
  titleSmall: "Una pequeña galería de nosotros",

  // Tu personaje (el guía que la acompaña)
  him: {
    hair:  "#3b2416",
    skin:  "#f1c7a1",
    shirt: "#f2ede3",
    pants: "#34405e",
    shoes: "#4a3226",
  },

  // Su personaje (ella es quien camina)
  her: {
    hair:  "#18110f",
    hairShine: "#3a2a24",
    skin:  "#7a4b36",
    blush: "#8c4a3c",
    shirt: "#2f8f55",
    pants: "#3b5a8a",
    shoes: "#ece4d4",
  },

  // Música de fondo: pon un archivo en la carpeta "musica" y escribe su ruta,
  // por ejemplo "musica/nuestra-cancion.mp3". Si lo dejas en null suena una
  // cajita musical generada por el juego.
  music: null,

  // Lo primero que le dices al entrar
  intro: [
    "¡Hola, mi amor! Bienvenida a un lugar muy especial.",
    "Construí este museo solo para ti. Cada cuadro guarda un pedacito de nuestra historia.",
    "Tú decides el camino, yo voy contigo. ♥",
  ],

  // Lo que dices cuando ya vio todos los recuerdos
  allVisited: [
    "¡Viste todos nuestros recuerdos!",
    "Pero todavía falta algo... la puerta del fondo te está esperando. ♥",
  ],

  // ====== LA CARPA FINAL (pista del regalo) ======
  // La puerta del fondo de la última sala lleva a una carpa de circo.
  // Tú te quedas ahí y la mandas a buscar una pista en cada sala.
  // Cada pista es un objeto con un mensaje (sin decir el nombre del libro);
  // al juntarlas te busca de nuevo y le das la carta con el boleto.
  caraval: {
    roomSmall: "Sala final",
    roomName: "La carpa",

    // Lo que le dices al llegar a la carpa
    intro: [
      "Llegamos a la última sala, mi amor...",
      "Pero esta no es una sala cualquiera. Aquí empieza un juego.",
      "Tu regalo está escondido detrás de un misterio, y para descubrirlo vas a necesitar pistas.",
      "Acabo de esconder una pista en cada sala del museo.",
      "Vuelve sobre tus pasos y encuéntralas todas. Yo te espero aquí. ♥",
    ],
    // Si le hablas antes de tener todas (usa {n} para las que faltan)
    reminder: [
      "Todavía te faltan {n}... Hay una escondida en cada sala. ¡Busca bien! ♥",
    ],
    reminderOne: [
      "¡Solo te falta una! Revisa bien todas las salas. ♥",
    ],
    // Cuando encuentra la última
    allFound: [
      "¡Encontraste todas las pistas!",
      "Vuelve a la carpa... te estoy esperando. ♥",
    ],
    // Cuando vuelve a hablarte con todas las pistas
    finale: [
      "Lo lograste, mi amor. Encontraste las tres pistas.",
      "Así que esta es mi última sorpresa de la noche...",
      "Tengo algo para ti. ♥",
    ],
    // Las pistas (en el orden en que las va encontrando)
    clues: [
      "Algunos regalos no se abren de golpe... se descubren poco a poco.",
      "No todo lo que verás será lo que parece. Mantén los ojos bien abiertos.",
      "Toda gran aventura empieza con una invitación.",
    ],
    // La carta final (usa \n\n para separar párrafos)
    letterTo: "Mi amor:",
    letter:
      "Toda esta galería es un pedacito de nosotros, pero tu regalo no cabía en una pared.\n\n" +
      "Es un lugar lleno de magia y misterio, donde nada es lo que parece y todo es parte de un juego. " +
      "Las pistas ya te lo dijeron: para entrar necesitas una invitación...\n\n" +
      "y aquí está la tuya.\n\n" +
      "Feliz cumpleaños. Te amo. ♥",
    letterFrom: "Fidel",
    // El boleto
    ticket: {
      top: "Admite a una",
      title: "Invitación",             // el nombre del libro no aparece en ningún lado
      line1: "Entrada válida solo para",
      name: "Estefani Flores",
      side: "Edición de cumpleaños",
      number: "Nº 001",
    },
    // Lo que le dices al cerrar la carta
    after: [
      "Este boleto es solo el comienzo...",
      "Tu verdadera entrada no está en la pantalla. Pídemela. ♥",
    ],
  },

  // ====== LAS SALAS ======
  // Cada sala tiene: nombre, color de pared (rosa, azul, verde, morado),
  // lo que dices al entrar (intro, opcional) y sus recuerdos en orden.
  //
  // Cada recuerdo:
  //  photo: ruta de la foto
  //  title: título (si lo dejas "" no aparece)
  //  date:  fecha o lugar (si lo dejas "" no aparece)
  //  text:  lo que le quieres decir (usa \n para un salto de línea; "" = sin texto)
  rooms: [
    {
      name: "El comienzo",
      theme: "rosa",
      intro: [],
      memories: [
        {
          photo: "fotos/01.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/02.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/03.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/04.jpeg",
          title: "",
          date: "",
          text: "",
        },
      ],
    },
    {
      name: "Nuestros momentos",
      theme: "azul",
      intro: ["Esta sala está llena de momentos nuestros. ♥"],
      memories: [
        {
          photo: "fotos/05.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/06.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/07.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/08.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/09.jpeg",
          title: "",
          date: "",
          text: "",
        },
      ],
    },
    {
      name: "Juntos",
      theme: "morado",
      intro: ["Y esta sala... también es toda tuya. ♥"],
      memories: [
        {
          photo: "fotos/10.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/11.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/12.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/13.jpeg",
          title: "",
          date: "",
          text: "",
        },
        {
          photo: "fotos/14.jpeg",
          title: "",
          date: "",
          text: "",
        },
      ],
    },
  ],
};
