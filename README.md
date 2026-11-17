# Arena

Reloj de arena 3D de tres minutos para acompañar una partida de Magic Maze. Prototipo independiente, sin afiliación con el juego.

## Abrir el prototipo

Abre `index.html` en un navegador de ordenador. Mantén juntos los archivos de esta carpeta. No hace falta instalar paquetes ni crear una cuenta.

Un móvil puede mostrar un adjunto HTML como documento sin ejecutar sus controles. Para probarlo en Safari o Chrome del móvil, sirve esta carpeta mediante una web. No se ha publicado ni configurado ningún alojamiento.

## Usarlo

- Pulsa Empezar partida. Este gesto también activa el sonido cuando el navegador lo permite.
- Toca el reloj o Dar la vuelta. El nuevo tiempo es 180 segundos menos el tiempo que quedaba. Ejemplo: de 2:20 a 0:40. No es una recarga de tres minutos.
- El volumen de arena representa la proporción del tiempo restante. El nivel se calcula integrando las secciones circulares de la cámara 3D, no de forma lineal.
- Hay un tono al minuto, dos a los 30 segundos, uno por segundo del 10 al 1 y una señal final. Puedes silenciarlos.
- Al agotarse el tiempo termina la partida y se bloquea el volteo. Reiniciar pide confirmación y prepara una partida nueva, sin empezarla.
- Si recargas en el mismo navegador se intenta recuperar la partida guardada localmente. Tras recargar, pulsa Activar sonido para volver a permitir los avisos. La aplicación puede funcionar sin almacenamiento, pero entonces no recupera partidas.

## En el móvil

Mantén la página visible y el teléfono con sonido. El tiempo se calcula con una hora de vencimiento y no se detiene al suspender la pestaña, pero el navegador puede suspender el sonido al bloquear la pantalla o cambiar de aplicación. Al volver se muestra el tiempo real restante, sin reproducir los avisos atrasados.

La página intenta mantener la pantalla encendida si el navegador permite Screen Wake Lock. No se garantiza en todos los dispositivos. No cambies la hora del sistema durante una partida. Usa una sola pestaña para la partida.

El botón de pantalla completa utiliza la opción nativa cuando existe. En navegadores que no la ofrecen se puede añadir la web a la pantalla de inicio una vez alojada. Se incluyen iconos y un manifiesto; no se incluye una caché sin conexión ni se promete instalación en todos los navegadores.

## Publicar en Vercel cuando se apruebe el diseño

Proyecto estático, sin claves ni servicios externos. Se incluye Three.js en scene.js, con su licencia MIT. No necesita descargarse al abrir la web. Sube el contenido de esta carpeta a un repositorio elegido para este proyecto e impórtalo en Vercel con Framework Preset: Other, sin comando de compilación y directorio de salida en la raíz. Revisa la configuración antes de desplegar. No hace falta contratar ningún servicio adicional para ejecutar el código.

## Verificación realizada

- 14 pruebas lógicas del reloj. Además se verificó el volumen 3D con integración independiente en 101 proporciones (error inferior al 0,001 % del volumen total). Para repetirlas: `node test-core.cjs`.
- Controles, inicio, volteo, confirmación de reinicio, silencio, ayuda, agotamiento y señales de AudioContext probados en Chrome automatizado.
- Recuperación tras recarga, suspensión simulada, cuenta del 10 al 1 y señal final comprobadas.
- Capturas inspeccionadas a 320, 390 y 1280 píxeles, además de orientación horizontal 844 × 390.

No se ha probado en un iPhone o iPad físico. La comprobación de audio verifica las señales que genera el navegador, no el volumen real de los altavoces de un teléfono. Conviene hacer una prueba breve de sonido en el dispositivo de la partida antes de usarlo.

## Regla consultada

Reglamento del editor: https://sitdown-games.com/wp-content/uploads/2018/09/MM_Rules_EN_HR_Sept2018_LD.pdf

La sección Time Restriction indica que se debe voltear el reloj al entrar en una casilla disponible, aunque eso dé más o menos tiempo, y que al agotarse se pierde la partida. La web no controla qué casillas se han usado ni las demás reglas del tablero.

## Versión visual revisada

Modelo propio generado con geometría 3D: cámaras curvas, tapas rojas con relieve, cristal transparente, reflejos, arena con textura, granos y volteo animado de 180 grados. Fondo dorado y superficie violeta, siguiendo la referencia visual enviada, sin extraer imágenes ni recursos de esa aplicación.

La visualización necesita WebGL. Si el navegador no lo admite, se muestra una advertencia y el contador continúa. El render sigue los fotogramas de la pantalla, sin límite artificial de 30 fps, y reduce la resolución del reloj si detecta lentitud; el rendimiento real y el consumo dependen del teléfono. No se ha validado la fluidez en un iPhone físico. La geometría de arena se actualiza reutilizando sus vértices, sin crear y destruir la malla en cada actualización. El giro dura 1,05 segundos, con aceleración y frenado progresivos.

`scene-source.js` contiene el código editable de la escena; `scene.js` es su versión empaquetada. Three.js tiene licencia MIT, incluida en `THIRD-PARTY-LICENSE.txt`. El resto de archivos se sirve directamente, sin compilación.
