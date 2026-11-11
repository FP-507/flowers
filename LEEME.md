# Galería de Recuerdos ♥

Un pequeño juego en pixel art: tu personaje la guía por un museo donde cada cuadro es una foto de ustedes.

Ella camina y tú (el guía) la sigues y le hablas. El museo tiene varias salas;
se pasa de una a otra caminando hacia el arco del fondo.

## Fotos y salas

Las fotos están en `fotos/`, numeradas de la más vieja (`01`) a la más reciente (`14`).
En `js/config.js`, dentro de `rooms`, cada sala tiene su nombre, su color de pared
(`rosa`, `azul`, `verde` o `morado`), lo que dices al entrar (`intro`) y sus recuerdos:
   - `photo`: la ruta, por ejemplo `"fotos/15.jpeg"` (fíjate en mayúsculas y minúsculas)
   - `title`: el título del recuerdo
   - `date`: la fecha o el lugar (si lo dejas `""` no aparece)
   - `text`: lo que le quieres decir (`\n` hace un salto de línea)

Para mover una foto de sala o de orden, mueve su bloque `{ ... }` dentro de la lista.
Puedes agregar más salas copiando un bloque de sala completo.

**Los títulos y textos actuales son borradores**: cámbialos por tus propias palabras.

Consejo: reduce las fotos a unos 1600 px de ancho para que carguen rápido en el celular.

## Personalizar

En `js/config.js` también puedes cambiar:
- Su nombre (`herName`) y el tuyo (`guideName`)
- Los colores de tu personaje (`him`) y del de ella (`her`, incluidos los lentes)
- Lo que le dices al entrar (`intro`) y al ver todos los recuerdos (`allVisited`)
- La música: pon un `.mp3` en `musica/` y escribe su ruta en `music`

## Probarlo en tu computadora

```
node serve.js
```
y abre http://localhost:8080

## Controles

- PC: flechas o WASD para caminar, E / Enter / Espacio para mirar un cuadro
- Celular: flechas en pantalla y botón ♥ (mejor con el celular de lado)
