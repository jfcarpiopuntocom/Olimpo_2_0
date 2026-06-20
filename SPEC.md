# Olimpo 2.0 — Spec v1.0

Local esquinero, 3 niveles, semiescalera conecta todo. Smoke shop → centro cultural.
- **Sótano:** barra de jugos/café, peliculas, conferencias
- **Calle:** camisetas + pinturas de autores cuencanos/amigos
- **Arriba:** oficina privada de Jose (propietario)

Look: 1/3 ancestral · 1/3 grecorromano · 1/3 futurista · 1% sensual/sexy, siempre trascendente.

## Microsistemas v1.0 (este repo)

### 1. Avatares + chat (pendiente backend)
- Stack propuesto: **Firebase** (Firestore + Realtime DB para presencia/chat, Auth anónimo)
- Login sin password: **PIN de 3 emojis** elegidos por el usuario en su primera visita, guardado hasteado en Firestore junto a su nombre de personaje. Reset vía email (Firebase Auth email link) si lo pierde.
- Evita suplantación: el PIN de 3 emojis (de un set de ~50) da ~125,000 combinaciones; se valida server-side (Cloud Function) antes de asociar el nombre.
- Tablero: pixel-art simple (canvas o CSS grid), personajes se mueven con flechas, dejan mensajes flotantes (tipo post-it) anclados a coordenadas — sirve para coordinar el club en la vida real.
- **No implementado aún en este push** — requiere proyecto Firebase propio de Jose (billing/quota). Placeholder UI ya en `index.html` (#tablero).

### 2. Novedades/ofertas + chatbot
- Chatbot recomendado: **Tawk.to** (gratis, sin límite de mensajes, widget JS de una línea, permite respuestas predefinidas/quick replies — ideal para upselling y "especial del día"). Alternativa: Crisp (free tier más limitado).
- Placeholder de instalación dejado en `index.html` (comentario `<!-- TAWK.TO WIDGET -->`) — Jose pega su Property ID cuando cree su cuenta tawk.to (gratis, 2 min).
- Sección "Especial del día/semana" ya maquetada, editable a mano por ahora (JSON simple `ofertas.json` para que Jose la actualice sin tocar código).

### 3. Radio
- Reusa el motor de `ajedrez-16bit` (audio tag + playlist array), sin pistas gregorianas.
- Playlist v1 (progressive house / electrónica 70s / lounge / Burning Man-adjacent, todas CC0/royalty-free):
  1. Progressive House mix — fuente: archive.org / freemusicarchive
  2. Tangerine Dream-style synth (electrónica 70s)
  3. Progressive Lounge ambient
  4. Desert/Playa tribal-electronic (Burning Man soundtrack vibe)
- Audio real pendiente: Jose sube 4 mp3 a `/audio/` o se linkea streaming gratuito (definir fuente legal en v1.1).

### 4. Admin / moderación
- Jose = super-admin (controla mute/ban, otorga admins limitados).
- v1: tabla de roles en Firestore (`users/{uid}.role = owner|admin|user`), reglas de seguridad Firestore restringen mute/ban a `role in [owner, admin]`.
- No implementado en este push (depende de #1).

## Pendiente para v1.1 (requiere decisiones/cuentas de Jose)
- Crear proyecto Firebase (gratis, Spark plan alcanza para empezar)
- Cuenta tawk.to
- 4 audios de radio definitivos
- Fotos del local en alta res para hero (ya tenemos 5 referencia)
