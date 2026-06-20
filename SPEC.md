# Olimpo 2.0 — Spec v1.0

**No es un sitio web brochure. Es una consola interactiva** — a donde vas cuando extrañas a tu gente del Olimpo y no puedes ir. Tablero de personajes, anuncios y radio en vivo, estética de consola/game (scanlines, monospace, sprites).

Centro cultural y asociación civil. Local esquinero, 3 niveles, semiescalera conecta todo (sótano: barra/café/cine/conferencias · calle: arte y camisetas · arriba: oficina de Jose) — contexto del lugar físico, no estructura de la consola.

Look: 1/3 ancestral · 1/3 grecorromano · 1/3 futurista · 1% sensual/sexy, siempre trascendente.

## Microsistemas v1.0 (este repo)

### 1. Tablero de personajes — IMPLEMENTADO (local, sin backend aún)
- 11 personajes fijos: Jose, David, Fer, Mateo, Kevin, Matto, Mateo Tusisabes, Juan, Anahi, Laura, Maria.
- Sprites generados 100% en CSS (cuadro de color + iniciales) — cero dependencia de iconos externos, cero riesgo de licencia, carga instantánea.
- Tocas tu personaje → te identificas como él en este navegador (`localStorage`). Se ve reflejado en el tablero de mensajes.
- Mensajes del tablero: localStorage por navegador en v1.0 (cada quien ve solo lo que escribió en su propio dispositivo). **v1.1: Firestore en tiempo real** para que todo el club vea los mismos mensajes — junto con el PIN de 3 emojis para evitar suplantación:
  - Stack: **Firebase** (Firestore para mensajes/presencia, Auth anónimo)
  - Login sin password: **PIN de 3 emojis** elegido en la primera visita, guardado hasheado en Firestore junto al nombre de personaje. Reset vía email (Firebase Auth email link).
  - Evita suplantación: ~125,000 combinaciones posibles de 3 emojis (set de ~50), validado server-side (Cloud Function) antes de asociar el nombre.
  - **No implementado aún** — requiere proyecto Firebase propio de Jose (billing/quota).

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
- Crear proyecto Firebase (gratis, Spark plan alcanza para empezar)
- Cuenta tawk.to
- Fotos del local en alta res para hero (ya tenemos 5 referencia)
