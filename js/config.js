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

  // Lo que pasa en la puerta del final (lo definimos después)
  ending: [
    "Esta puerta todavía está cerrada...",
    "(Aquí irá la sorpresa final ♥)",
  ],

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
