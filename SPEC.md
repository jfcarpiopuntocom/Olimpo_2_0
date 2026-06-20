# Olimpo 2.0 — Spec v1.0

**No es un sitio web brochure. Es una consola interactiva** — a donde vas cuando extrañas a tu gente del Olimpo y no puedes ir. Tablero de personajes, anuncios y radio en vivo, estética de consola/game (scanlines, monospace, sprites).

Centro cultural y asociación civil. Local esquinero, 3 niveles, semiescalera conecta todo (sótano: barra/café/cine/conferencias · calle: arte y camisetas · arriba: oficina de Jose) — contexto del lugar físico, no estructura de la consola.

Look: 1/3 ancestral · 1/3 grecorromano · 1/3 futurista · 1% sensual/sexy, siempre trascendente.

## Microsistemas v1.0 (este repo)

### 1. Tablero de personajes + PIN de 3 símbolos — IMPLEMENTADO (Firestore, en vivo)
- 11 personajes fijos: Jose, David, Fer, Mateo, Kevin, Matto, Mateo Tusisabes, Juan, Anahi, Laura, Maria.
- Avatares vía **DiceBear** (estilo "adventurer"), open source, licencia MIT, uso comercial libre sin attribution requerida (https://www.dicebear.com/licenses/). Seed = nombre del personaje, así el avatar es siempre el mismo para cada quien.
- **Primer club con contraseña de 3 símbolos.** Set serio/synthwave (⚡🌙🔥💀🗲☄️🌑🩸🖤⚜️♾️🔱🧿🌌🛸🔺⛓️🌀), nada de emoji infantil — pensado para gente de 28-52 años.
- Flujo: tocas tu personaje → si nadie lo ha tomado, eliges 3 símbolos en orden y quedas registrado (`olimpo_personajes/{nombre}` en Firestore, guardando el hash SHA-256 del PIN, nunca el PIN en claro); si ya está tomado, debes ingresar el mismo PIN para "ser" ese personaje — así nadie suplanta a nadie.
- Identidad cacheada en `localStorage` de tu navegador (no te vuelve a preguntar cada visita) + sincronizada a la nube (Firestore es la fuente de verdad, localStorage es solo caché local).
- **Stack:** Firebase Firestore — proyecto compartido temporalmente con `ajedrez-16bit` (`elmultiversodelajedrez`), todo en colecciones con prefijo `olimpo_` para no chocar con nada del ajedrez. Mover a un Firebase propio de Jose es solo cambiar `firebase-config.js`.
- Archivos: `firebase-config.js` (config web pública, no es secreta — la protección real son las Firestore Rules), `firestore.rules` (reglas de referencia que Jose debe pegar en la consola de Firebase, junto a las reglas existentes del ajedrez, sin reemplazarlas).
- **Pendiente real:** reset de PIN vía email (requiere Cloud Functions, v1.2). Por ahora, si alguien pierde su PIN, solo Jose puede liberar el nombre borrando el doc manualmente desde la consola de Firebase.
- Mensajes del tablero: sincronizados en vivo entre todo el club vía Firestore (`olimpo_mensajes`), requiere haber elegido personaje antes de escribir.
- **Nota de verificación:** el entorno de preview sandboxeado de esta sesión bloquea las conexiones de streaming/long-polling de Firestore (se ve `ERR_ABORTED` repetido en la consola de red), aunque el resto de internet (ej. DiceBear) sí carga — es una restricción del sandbox de desarrollo, no del código. Se agregó `experimentalAutoDetectLongPolling` como defensa para redes restrictivas reales. Falta verificar en un navegador real (Chrome/Safari, desktop o móvil) sobre la URL pública de GitHub Pages.

### 2. Novedades/ofertas + chatbot
- Chatbot recomendado: **Tawk.to** (gratis, sin límite de mensajes, widget JS de una línea, permite respuestas predefinidas/quick replies — ideal para upselling y "especial del día"). Alternativa: Crisp (free tier más limitado).
- Placeholder de instalación dejado en `index.html` (comentario `<!-- TAWK.TO WIDGET -->`) — Jose pega su Property ID cuando cree su cuenta tawk.to (gratis, 2 min).
- Sección "Especial del día/semana" ya maquetada, editable a mano por ahora (JSON simple `ofertas.json` para que Jose la actualice sin tocar código).

### 3. Radio — IMPLEMENTADO (live, sin mp3)
- Mismo motor que `ajedrez-16bit`: 4 emisoras online en vivo vía **radio-browser.info** (directorio gratis, sin auth) + streams pinned como respaldo.
- Sin archivos que subir ni mantener — siempre suena, no depende de Jose subiendo audio.
- 4 botones de género en la barra inferior:
  1. **Progressive House** — pinned: SomaFM Beat Blender
  2. **Electrónica 70s** — pinned: SomaFM Drone Zone (kosmische/synth, vibra Tangerine Dream)
  3. **Progressive Lounge** — pinned: SomaFM Groove Salad
  4. **Burning Man / Playa** — pinned: SomaFM Deep Space One (psybient/desert)
- Si el stream pinned cae, fallback automático a búsqueda por tag/nombre en radio-browser.info.

### 4. Admin / moderación
- Jose = super-admin (controla mute/ban, otorga admins limitados).
- v1: tabla de roles en Firestore (`users/{uid}.role = owner|admin|user`), reglas de seguridad Firestore restringen mute/ban a `role in [owner, admin]`.
- No implementado en este push (depende de #1).

## Pendiente para v1.1 (requiere decisiones/cuentas de Jose)
- Pegar `firestore.rules` en la consola de Firebase del proyecto compartido (sin esto, el tablero y los mensajes no van a poder leer/escribir)
- Cuenta tawk.to
- Verificar el flujo de PIN en navegador real (no en sandbox de preview)

## Roadmap v1.2 (pedido por Jose, aún sin construir — documentado para no prometer de más)
- **Lounge virtual con streams/DJs**, livestream en vivo en la página
- **Mensajes privados** entre personajes (hoy el tablero es público, todos ven todo)
- **Pre-pedidos y pedidos a la barra de Jose**
- **Reservaciones de espacio** (medicina del futuro, DJs que quieren poner música)
- Reset de PIN vía email (Cloud Functions)
- Cada uno de estos es su propia colección Firestore + UI; se construyen uno a la vez para no romper lo que ya funciona.
