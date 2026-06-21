# Olimpo 2.0 — Spec v1.2

**No es un sitio web brochure. Es una consola interactiva** — a donde vas cuando extrañas a tu gente del Olimpo y no puedes ir.

Centro cultural y asociación civil. Local esquinero, 3 niveles, semiescalera conecta todo (sótano: barra/café/cine/conferencias · calle: arte y camisetas · arriba: oficina de Jose) — contexto del lugar físico, no estructura de la consola.

Look: 1/3 ancestral · 1/3 grecorromano · 1/3 futurista · 1% sensual/sexy, siempre trascendente.

## Orden de la página (de arriba a abajo)
1. **Saluda al club** — input de mensaje, lo primero que ve quien llega. Saludas, tu mensaje aparece como burbuja sobre tu personaje.
2. **El Mostrador** — especiales del día/semana. Por ahora "atiende Jose"; pronto un chatbot 24/7 aquí mismo (ver sección 2).
3. **El chat de personajes** — el tablero: eliges/creas tu personaje, ves a todo el club con sus burbujas de diálogo.
4. **Eventos y anuncios** — novedades generales del club.
5. **Confidencialidad y control total del usuario** — qué se guarda, qué no, quién puede ver qué.

## Microsistemas

### 1. Identidad: PIN de 3 símbolos → llave criptográfica real en Nostr — IMPLEMENTADO
**La identidad ya NO depende de una base de datos central.** Tu PIN deriva una llave secp256k1 real (la misma criptografía de Bitcoin/Nostr), y "ser dueño" de un nombre se demuestra firmando un evento — publicado en relés públicos de Nostr, verificable por cualquiera, sin pedirle permiso a nadie ni confiar en un servidor.

- 11 personajes fundadores: Jose, David, Fer, Mateo, Kevin, Matto, Mateo Tusisabes, Juan, Anahi, Laura, Maria. Cualquiera suma uno propio tocando "+ Nuevo" — nickname libre (2-20 caracteres), **nunca se pide ni se guarda nombre real**.
- **Avatares cyborg reales: "Club Cyborg Roster", provisto por JFC** (`avatars/*.png`, generados con Grok, fondo transparente). 11 diseños únicos (`mascot`, `cyborg02`...`cyborg10`) — 3 leen como mujer (`cyborg02`, `cyborg04`, `cyborg06`), mapeados 1:1 a Anahi/Laura/Maria. De los 8 hombres founders solo hay 7 diseños masculinos/neutros disponibles, así que Jose y Juan comparten el diseño `mascot` (único reuso del set, mapeo en `FOUNDER_AVATAR` en `index.html`). Nicknames nuevos ciclan por hash entre los 10 diseños humanos (`HUMAN_AVATARS`, sin Pelusa). Reemplaza dos intentos previos: un SVG dibujado a mano (floja calidad) y un primer set de solo 8 diseños (2 mujer/6 hombre, insuficiente).
- **Pelusa** (`avatars/pelusa.png`) — la perrita Shih Tzu de Jose, mascota del club ("cuida el club"). Aparece en el footer de la página. No es un personaje jugable: no tiene PIN ni claim en Nostr, es decorativo.
- **Pendiente / guardado para después:** `griddeiconosadicionales.png` (raíz del repo) trae elementos cyborg sueltos (consola DJ, celular, boombox, disco ball, audífonos, cóctel, trompeta, láser, "mascot party") — *"para la página en general y en adelante para varios usos"*. Todavía no se integró a ningún lado. Encaja naturalmente con el roadmap de "Lounge virtual con streams/DJs" — usar ahí cuando se construya esa sección. `grid4.png`/`grid5.png`/`grid6.png` quedaron como fuente original de los avatares, por si hace falta re-recortar algo. Ningún archivo que JFC sube se borra sin su permiso explícito (ver feedback memory global).
- **PIN de 3 símbolos, 30 emojis (3 por dígito 0-9) — salvaguarda anti-espionaje de hombro.** Quien te ve tocar un emoji no puede deducir tu dígito real sin el mapeo (`PIN_DIGIT_OF` en el código). Emoji y dígito son la MISMA llave — el hash/derivación se calcula sobre el dígito real, no sobre el emoji.
- **Cómo funciona la identidad (NIP-33, eventos direccionables):**
  1. Tu PIN (3 dígitos, venga de emoji o teclado numérico) + tu nombre/nickname → `sha256('olimpo-v1|'+nombre+'|'+digitos)` → llave secreta secp256k1. Esta llave **nunca se transmite ni se guarda en ningún lado** — se deriva de nuevo cada vez que la necesitas, vive solo en la memoria de tu sesión.
  2. Para reclamar un nombre por primera vez: firmas un evento `kind 30078` con tag `['d','olimpo-claim-{nombre}']` y lo publicas en 4 relés públicos (`relay.damus.io`, `nos.lol`, `relay.nostr.band`, `relay.snort.social`). Basta con que UNO lo acepte.
  3. Para verificar quién es el dueño real: se consultan los 4 relés por todos los eventos con ese `d`-tag; el de **`created_at` más antiguo** es el canónico — "primer claim, gana". Si tu llave deriva el mismo `pubkey` que ese evento, eres tú; si no, el PIN es incorrecto.
  4. **Staff con activación gateada (`STAFF_SEEDS` en el código):** tocar su nombre sin que nadie lo haya reclamado pide un código de activación antes de dejar usar/elegir el PIN — así nadie puede reclamarlos por accidente o malicia.
     - **Jose** (owner, control total): código ⚡⚡⚡ (dígitos `0,0,0`). `forceChange:true` — el código solo activa, de inmediato debe elegir un PIN definitivo distinto.
     - **Juan** (webmaster/co-admin, menos permisos que Jose — alcance exacto pendiente de definir cuando exista moderación real): código 🔥🔥🔥 (dígitos `2,2,2`). `forceChange:false` — el código YA es su PIN real, utilizable de inmediato. Rotarlo a otro PIN más adelante es una función pendiente (ver Roadmap), por ahora cambiarlo requeriría coordinarlo aparte.
- **Verificado funcionando en vivo, con datos reales** (no solo en teoría): Jose y Juan ya están activados de verdad — sus eventos de claim están publicados y son consultables ahora mismo en `relay.damus.io`/`nos.lol`/`relay.nostr.band`/`relay.snort.social`. El club ya puede usarse.
- **Firebase = espejo de cortesía, no fuente de verdad.** Tal como se pidió ("cositas en Firebase por redundancia, sin problema"): cada claim también se escribe best-effort (nunca bloquea, si falla no pasa nada) a Firestore (`olimpo_personajes/{nombre}` con `pubkey` + `role`) — sirve solo para que la app pueda listar nicknames existentes sin tener que adivinarlos en los relés. Si Firebase desapareciera mañana, la identidad real sigue intacta en Nostr.
- **Recuperación de acceso:** si pierdes tu PIN, no hay self-service — nadie puede "resetear" una llave criptográfica derivada (esa es la idea: ni Jose, ni nosotros, ni nadie tiene una puerta trasera). La única opción es elegir un nuevo nickname y empezar de cero. Esto es una propiedad de seguridad, no una limitación a arreglar.

### 2. Chat = burbujas P2P + Nostr, cero servidor central — IMPLEMENTADO
**Reemplaza por completo el chat tipo lista.** Tu mensaje aparece como burbuja flotante sobre tu avatar y **persiste hasta que escribas otro** (sin timeout, sin borrado automático).

- **Transporte:** [Trystero](https://github.com/dmotz/trystero) (la misma librería que `ajedrez-16bit`) sobre **Nostr** como red de señalización para WebRTC — fallback automático a BitTorrent trackers si Nostr no conecta. Las conexiones son **P2P directas entre navegadores**, sin servidor de Olimpo en el medio.
- **Triple capa, "fractal y fragmentaria" a propósito:**
  1. Tu mensaje se guarda al instante en TU `localStorage` — funciona aunque nadie más esté conectado.
  2. Se transmite directo (WebRTC) a quien esté conectado contigo ahora mismo.
  3. Se publica como evento Nostr firmado (`kind 1`, tag `['t','olimpo-club-v1']`) en los mismos 4 relés — así quien NO estaba conectado en ese momento lo recupera después (`backfillFromNostr`, al cargar la página).
  - Nadie — ni Jose, ni el equipo, ni un tercero con una orden judicial a un servidor — tiene jamás el historial completo. Cada relé y cada dispositivo solo tiene fragmentos.
- **Verificado funcionando en vivo:** mensaje de prueba publicado y recuperado independientemente desde `relay.damus.io` y `nos.lol` en este repo.
- **Seguridad:** nickname y texto se escapan (`escapeHtml`) antes de insertarse en el DOM (previene XSS). Nicknames con "/" se rechazan.

### 3. El Mostrador: especiales + DM privado al staff + chatbot — IMPLEMENTADO (DM), PARCIAL (chatbot)
- Especiales del día/semana ya maquetados, editables a mano vía `ofertas.json` (sin tocar código).
- **DM privado, cifrado de extremo a extremo (NIP-04) — IMPLEMENTADO y verificado en vivo.** Aparte del chat general (burbujas, público), el Mostrador tiene su propio campo: "Escríbele en privado al Mostrador". Al enviar, el mensaje se cifra por separado para cada miembro del staff (Jose + Juan, vía `STAFF_SEEDS`, más cualquiera que el espejo de Firebase marque con `role !== 'member'`) y se publica como evento `kind 4` en los mismos 4 relés. Solo quien tiene la llave privada correspondiente puede descifrarlo — ni los relés, ni Firebase, ni nadie más ve el texto plano.
  - Si entras como Jose o Juan, ves automáticamente la **"Bandeja del Mostrador"** debajo del campo de DM: consulta los relés por eventos dirigidos a tu pubkey y los descifra en el momento, en tu navegador.
  - **No depende del espejo de Firebase para funcionar** — la lista de destinatarios se resuelve consultando los claims reales de Jose/Juan en Nostr (`getStaffPubkeys`), así que el DM funciona aunque las reglas de Firestore todavía no estén actualizadas en la consola.
  - Verificado en vivo: mensaje de prueba cifrado, publicado, y descifrado correctamente en la Bandeja del Mostrador, en este repo.
- **"Atiende Jose" en el chat general** — su personaje en el tablero es, de hecho, el primer "chatbot": cualquiera puede dejarle un mensaje público y él responde como cualquier otro miembro, vía las burbujas P2P.
- **Chatbot automatizado (roadmap, no implementado):** recomendado **Tawk.to** (gratis, sin límite, widget de una línea, respuestas predefinidas — bueno para upselling/especial del día) como primera capa simple. Para algo más "ente vivo" — que conteste con personalidad, en el DM o en el mostrador — la vía natural es un bot que escucha el mismo canal Nostr (kind 1 público y/o kind 4 privado) y responde firmando como su propio personaje; la infraestructura de DM cifrado ya está lista para que ese bot la use. Documentado, no construido — falta decidir el motor.

### 4. Radio — IMPLEMENTADO (live, sin mp3)
- Mismo motor que `ajedrez-16bit`: 4 emisoras online en vivo vía **radio-browser.info** (gratis, sin auth) + streams pinned como respaldo, fallback automático si caen.
- Progressive House (SomaFM Beat Blender) · Electrónica 70s (SomaFM Drone Zone) · Progressive Lounge (SomaFM Groove Salad) · Burning Man/Playa (SomaFM Deep Space One). Botón Stop.

### 5. Admin / moderación
- Jose = owner, Juan = webmaster/co-admin (ambos con `role` en su claim de Nostr, ver sección 1 — `STAFF_SEEDS` en el código).
- Falta construir las acciones de moderación en sí (mute/ban) y el alcance exacto de "menos permisos" para Juan — v1.2. Sin un servidor central, mute/ban probablemente se implementa como "lista de pubkeys bloqueados" que cada cliente respeta localmente (firmada/publicada por Jose), no como un borrado real — coherente con la filosofía P2P de esta app.
- **Rotación de PIN — IMPLEMENTADA y usada en vivo.** El dueño actual puede firmar, con su llave VIEJA, un evento de "sucesión" (`content.supersededBy = nuevaPubkey`) que apunta a una llave nueva — solo quien tiene la llave vieja puede producirlo, nadie puede secuestrar el personaje publicando una rotación falsa. `getCanonicalClaim` resuelve primero el claim original (primer claim manda) y desde ahí sigue la cadena de sucesiones firmadas hasta la pubkey vigente. Juan ya rotó su PIN desde el código inicial 🔥🔥🔥 (demasiado obvio/adivinable) a uno nuevo — el código nuevo se le comunicó solo en el chat, no se documenta aquí ni en ningún archivo del repo, por la misma razón por la que se rotó.
- **Nota de manejo de secretos:** generar un PIN nuevo *para* alguien (en vez de que la persona lo elija ella misma en la app) implica que ese código queda expuesto en el canal por el que se comunicó — en este caso, esta conversación. Es aceptable para resolver una urgencia puntual, pero el patrón correcto a futuro es que cada quien elija/rote su propio PIN directamente en el tablero, sin pedírselo a un tercero.
- **Google Sign-In para Jose (pedido, no implementado):** capa extra opcional sobre la activación por código — requiere su Gmail real y habilitar el proveedor en Firebase Console. No se construye hasta tener esos datos.

## Archivos del repo
- `index.html` — toda la app (HTML+CSS+JS, sin build step)
- `firebase-config.js` — config web pública de Firebase (no es secreta), espejo de cortesía
- `firestore.rules` — reglas para pegar **dentro** de las reglas existentes del ajedrez (instrucciones paso a paso en el archivo)
- `ofertas.json` — especiales/novedades, editable a mano

## Pendiente para v1.1 (requiere a Jose)
- Pegar el bloque actualizado de `firestore.rules` en la consola de Firebase (el espejo de cortesía no escribirá hasta entonces — el chat y la identidad real en Nostr funcionan igual sin esto)
- Cuenta tawk.to si se decide ir por esa vía para el chatbot del Mostrador
- Probar el flujo completo en un navegador real, no solo en el sandbox de desarrollo

## Roadmap (pedido, aún sin construir — documentado para no prometer de más)
- **Lounge virtual con streams/DJs en vivo**
- **DMs entre personajes cualquiera** (hoy el DM solo existe hacia el staff del Mostrador, no persona-a-persona) — misma base NIP-04 ya construida, solo falta la UI
- **Pre-pedidos y pedidos a la barra de Jose**
- **Reservaciones de espacio** (medicina del futuro, DJs que quieren poner música)
- **Chatbot/ente vivo** en el Mostrador (ver sección 3)
- Mute/ban reales, rotación de PIN, permisos exactos de webmaster (ver sección 5)
