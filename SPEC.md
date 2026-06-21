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
- Avatares vía **DiceBear "bottts-neutral"** (robots, MIT, uso comercial libre, sin attribution: https://www.dicebear.com/licenses/). Gafas/visores fijados a variantes serias estilo "rave anónimo" (`eyes=frame1,frame2,glow,robocop,sensor,shade01`) — nada tierno/infantil.
- **PIN de 3 símbolos, 30 emojis (3 por dígito 0-9) — salvaguarda anti-espionaje de hombro.** Quien te ve tocar un emoji no puede deducir tu dígito real sin el mapeo (`PIN_DIGIT_OF` en el código). Emoji y dígito son la MISMA llave — el hash/derivación se calcula sobre el dígito real, no sobre el emoji.
- **Cómo funciona la identidad (NIP-33, eventos direccionables):**
  1. Tu PIN (3 dígitos, venga de emoji o teclado numérico) + tu nombre/nickname → `sha256('olimpo-v1|'+nombre+'|'+digitos)` → llave secreta secp256k1. Esta llave **nunca se transmite ni se guarda en ningún lado** — se deriva de nuevo cada vez que la necesitas, vive solo en la memoria de tu sesión.
  2. Para reclamar un nombre por primera vez: firmas un evento `kind 30078` con tag `['d','olimpo-claim-{nombre}']` y lo publicas en 4 relés públicos (`relay.damus.io`, `nos.lol`, `relay.nostr.band`, `relay.snort.social`). Basta con que UNO lo acepte.
  3. Para verificar quién es el dueño real: se consultan los 4 relés por todos los eventos con ese `d`-tag; el de **`created_at` más antiguo** es el canónico — "primer claim, gana". Si tu llave deriva el mismo `pubkey` que ese evento, eres tú; si no, el PIN es incorrecto.
  4. **Jose, admin del tablero:** activación especial. Tocar "Jose" sin que nadie lo haya reclamado pide un código de activación (⚡⚡⚡ = dígitos `0,0,0`, dado por el equipo fuera de la app) antes de dejar elegir el PIN definitivo — así nadie puede reclamar "Jose" por accidente o malicia con un PIN cualquiera. Su evento de claim queda con `role:'owner'` en el contenido.
- **Verificado funcionando en vivo** (no solo en teoría): se probó el flujo completo en este repo — activación de Jose, publicación del evento en relés reales, y consulta independiente confirmando el claim visible en `relay.damus.io`/`nos.lol`.
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

### 3. El Mostrador: especiales + chatbot — PARCIAL
- Especiales del día/semana ya maquetados, editables a mano vía `ofertas.json` (sin tocar código).
- **"Atiende Jose" por ahora** — su personaje en el tablero es, de hecho, el primer "chatbot": cualquiera puede dejarle un mensaje y él responde como cualquier otro miembro, vía las burbujas P2P. Cuando se conecte un chatbot automatizado, hereda exactamente ese mismo canal (mismo tablero, misma identidad de personaje) — no hace falta UI nueva.
- **Chatbot automatizado (roadmap, no implementado):** recomendado **Tawk.to** (gratis, sin límite, widget de una línea, respuestas predefinidas — bueno para upselling/especial del día) como primera capa simple. Para algo más "ente vivo" — que conteste como si fuera Jose o la barra, con personalidad, en DMs o en el mostrador — la vía natural una vez exista mensajería privada (ver Roadmap) es un bot que escucha el mismo canal Nostr/P2P y responde firmando como su propio personaje. Documentado, no construido — falta decidir el motor (Tawk.to vs bot propio) antes de built.

### 4. Radio — IMPLEMENTADO (live, sin mp3)
- Mismo motor que `ajedrez-16bit`: 4 emisoras online en vivo vía **radio-browser.info** (gratis, sin auth) + streams pinned como respaldo, fallback automático si caen.
- Progressive House (SomaFM Beat Blender) · Electrónica 70s (SomaFM Drone Zone) · Progressive Lounge (SomaFM Groove Salad) · Burning Man/Playa (SomaFM Deep Space One). Botón Stop.

### 5. Admin / moderación
- Jose = owner (`role:'owner'` en su claim de Nostr, ver sección 1).
- Falta construir las acciones de moderación en sí (mute/ban) — v1.2. Sin un servidor central, mute/ban probablemente se implementa como "lista de pubkeys bloqueados" que cada cliente respeta localmente (firmada/publicada por Jose), no como un borrado real — coherente con la filosofía P2P de esta app.
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
- **Mensajes privados (DMs)** entre personajes — base natural para esto: NIP-04/NIP-44 de Nostr (mensajes cifrados extremo a extremo), ya tenemos las llaves derivadas del PIN listas para usarse
- **Pre-pedidos y pedidos a la barra de Jose**
- **Reservaciones de espacio** (medicina del futuro, DJs que quieren poner música)
- **Chatbot/ente vivo** en el Mostrador y/o DMs (ver sección 3)
- Mute/ban reales (ver sección 5)
