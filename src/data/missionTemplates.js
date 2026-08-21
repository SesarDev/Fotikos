// Catálogo de misiones, revisado y ampliado a partir del Anexo B de
// misiones-fiestas-spec-v2.md junto con el usuario (64 plantillas).
// roles solo se rellena en "cooperativa" cuando el texto asigna
// explícitamente un papel de "quien graba/fotografía" a uno de los dos
// nombrados; el resto de formatos (carrera/duelo/cooperativa sin roles
// claros) no los consume el motor de sorteo automático (solo "personal",
// §1.3) — quedan aquí como catálogo de referencia para los encargos
// manuales del comité.

const FACIL = { dificultad: 'facil', base_points: 10 }
const MEDIA = { dificultad: 'media', base_points: 25 }
const DIFICIL = { dificultad: 'dificil', base_points: 50 }
const EPICA = { dificultad: 'epica', base_points: 100 }

const COOP_ROLES = { A: 'artífice', B: 'fotógrafo' }

export const MISSION_TEMPLATES = [
  // Fácil · 10 pts
  { id: 'm01', text: 'Selfie con {A} poniendo la misma cara que él/ella', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player' }, tags: ['facil'] },
  { id: 'm02', text: 'Foto imitando la postura de la libertad', formato: 'carrera', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm03', text: 'Foto de tus zapatos junto a los de {A} y {B}', formato: 'personal', ...FACIL, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['facil'] },
  { id: 'm04', text: 'Selfie con alguien que lleve una prenda del mismo color que tú', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: {}, tags: ['facil'] },
  { id: 'm05', text: 'Foto de un animal del pueblo. Puntos morales extra si te hace caso', formato: 'carrera', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm06', text: 'Foto de las manos de {A} y {B} haciendo el mismo gesto', formato: 'personal', ...FACIL, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['facil'] },
  { id: 'm07', text: 'Foto con la peor iluminación posible en la que aún se te reconozca', formato: 'personal', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio', 'noche'] },
  { id: 'm08', text: 'Vídeo de 10s explicando tu plan de hoy como si fueras un telediario', formato: 'personal', ...FACIL, media: 'video', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm09', text: 'Brinda con {A} y {B} con un brindis inventado en el momento, cuanto más ridículo mejor', formato: 'cooperativa', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['actuacion', 'barra'] },
  { id: 'm10', text: 'Ponte una prenda de otra persona (gorra, gafas, pañuelo) y haz una selfie con ella', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: {}, tags: ['facil'] },
  { id: 'm11', text: 'Consigue que {A} te cuente un chiste y ríete aunque sea malísimo', formato: 'personal', ...FACIL, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['ingenio'] },
  { id: 'm12', text: 'Choca los cinco con 5 personas distintas en menos de un minuto', formato: 'personal', ...FACIL, media: 'video', min_personas: 5, slots: {}, tags: ['grupo', 'facil'] },
  { id: 'm13', text: 'Vídeo de 10s de {A} haciendo su mejor imitación de un famoso', formato: 'personal', ...FACIL, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion'] },
  { id: 'm14', text: 'Consigue el autógrafo de {A} en una servilleta', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player' }, tags: ['ingenio', 'facil'] },
  { id: 'm15', text: 'Inventa un mote para {A} y consigue que lo acepte en voz alta', formato: 'personal', ...FACIL, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['ingenio'] },
  { id: 'm16', text: 'Foto del cielo del pueblo, cuanto más épico salga mejor', formato: 'carrera', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['dia', 'ingenio'] },
  { id: 'm17', text: 'Consigue que {A} te enseñe su peor cara y ponla tú igual', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player' }, tags: ['facil'] },

  // Media · 25 pts
  { id: 'm18', text: '{A} baila como Michael Jackson mientras {B} lo graba', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion'] },
  { id: 'm19', text: 'Foto de 3 personas haciendo la misma pose ridícula a la vez', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: {}, tags: ['grupo'] },
  { id: 'm20', text: 'Vídeo de 15s cantando el estribillo de una canción con {A}', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion', 'noche'] },
  { id: 'm21', text: 'Foto en el parque con al menos 3 participantes', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: {}, tags: ['grupo', 'dia'] },
  { id: 'm22', text: '{A} hace de barman poniendo cubatas, {B} lo inmortaliza', formato: 'cooperativa', ...MEDIA, media: 'foto', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['barra', 'noche'] },
  { id: 'm23', text: 'Foto con alguien del pueblo que no esté jugando', formato: 'carrera', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['social'] },
  { id: 'm24', text: 'Vídeo enseñando a {A} un paso de baile inventado por ti', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion'] },
  { id: 'm25', text: 'Foto de un grupo de 4 ordenados de más alto a más bajo', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo'] },
  { id: 'm26', text: 'Consigue que se juegue al teléfono roto pero con mímica', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 4, slots: {}, tags: ['ingenio', 'grupo'] },
  { id: 'm27', text: 'Selfie con {A} y {B} en la que los tres señaléis a sitios distintos', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['ingenio'] },
  { id: 'm28', text: 'Consigue que un grupo de al menos 4 personas coree el nombre de {A}', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 5, slots: { A: 'player' }, tags: ['grupo', 'actuacion'] },
  { id: 'm29', text: 'Vídeo de 15s de {A} y {B} recreando una escena de peli', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['actuacion'] },
  { id: 'm30', text: 'Foto de 5 personas saltando a la vez, todas en el aire (o no cuenta)', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 5, slots: {}, tags: ['grupo', 'fisico'] },
  { id: 'm31', text: 'Consigue que alguien del pueblo os enseñe un paso de jota', formato: 'carrera', ...MEDIA, media: 'video', min_personas: 1, slots: {}, tags: ['social', 'actuacion'] },
  { id: 'm32', text: 'Vídeo de {A} narrando un momento cualquiera como si fuera comentarista deportivo', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion', 'ingenio'] },
  { id: 'm33', text: '{A} y {B} se intercambian una prenda y foto del resultado', formato: 'cooperativa', ...MEDIA, media: 'foto', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['ingenio'] },
  { id: 'm34', text: 'Monta una torre con lo que haya en la mesa sin que se caiga', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio', 'barra'] },
  { id: 'm35', text: 'Consigue que {A} pida algo en la barra cantando', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion', 'barra', 'noche'] },
  { id: 'm36', text: 'Grupo de 4 haciendo el baile del robot 10s sincronizados', formato: 'personal', ...MEDIA, media: 'video', min_personas: 4, slots: {}, tags: ['grupo', 'actuacion', 'fisico'] },
  { id: 'm37', text: 'Foto con alguien del pueblo disfrazado o con complemento de fiestas', formato: 'carrera', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['social'] },
  { id: 'm38', text: 'Vídeo de {A} y {B} discutiendo apasionadamente sobre una tontería (piña en la pizza) 15s', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['actuacion', 'ingenio'] },

  // Difícil · 50 pts
  { id: 'm39', text: 'Vídeo bailando la Macarena con mínimo 5 personas, sincronizados', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 5, slots: {}, tags: ['grupo', 'fisico', 'noche'] },
  { id: 'm40', text: 'Foto de 4 personas formando una palabra con el cuerpo', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo', 'fisico', 'ingenio'] },
  { id: 'm41', text: 'Recrea una portada de disco famosa con 4 participantes', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo', 'ingenio'] },
  { id: 'm42', text: '{A} da una entrevista de 15s sobre las fiestas, {B} hace de reportero', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion', 'ingenio'] },
  { id: 'm43', text: 'Foto en la que aparezcan 6 personas y ninguna mire a cámara', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 6, slots: {}, tags: ['grupo'] },
  { id: 'm44', text: 'Vídeo de una coreografía inventada de 15s con {A} y {B}', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['grupo', 'fisico'] },
  { id: 'm45', text: 'Foto de todos los que llevéis gafas de sol juntos', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 2, slots: {}, tags: ['dia', 'grupo'] },
  { id: 'm46', text: 'Vídeo de una pirámide humana de 3. Con cabeza, sin lesiones', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 3, slots: {}, tags: ['grupo', 'fisico'] },
  { id: 'm47', text: '{A} hace playback de una canción entera de 15s, {B} la graba', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion', 'noche'] },
  { id: 'm48', text: 'Recread el meme que elijáis con 4 participantes', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo', 'ingenio'] },
  { id: 'm49', text: 'Conseguid que 8 desconocidos hagan la ola con vosotros', formato: 'carrera', ...DIFICIL, media: 'video', min_personas: 8, slots: {}, tags: ['social', 'grupo'] },
  { id: 'm50', text: '{A} y {B} montan un anuncio de teletienda de un objeto random, 15s', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['actuacion', 'ingenio'] },
  { id: 'm51', text: 'Foto de 5 personas formando una figura reconocible (corazón, estrella)', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 5, slots: {}, tags: ['grupo', 'fisico', 'ingenio'] },
  { id: 'm52', text: 'Conseguid una foto con otra peña entera', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 1, slots: {}, tags: ['social', 'grupo'] },
  { id: 'm53', text: '{A} y {B} de estatuas humanas 30s sin moverse ni reírse', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, tags: ['actuacion', 'fisico'] },
  { id: 'm54', text: 'Cadena humana de 6 personas cruzando una calle sin soltarse', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 6, slots: {}, tags: ['grupo', 'fisico'] },
  { id: 'm55', text: 'Foto de 5 personas dormidas (o fingiendo) en 5 sitios distintos del mismo lugar', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 5, slots: {}, tags: ['grupo', 'ingenio'] },

  // Épica · 100 pts
  { id: 'm56', text: 'Vídeo coral: 15s con al menos 10 participantes haciendo la ola', formato: 'carrera', ...EPICA, media: 'video', min_personas: 10, slots: {}, tags: ['epica', 'grupo'] },
  { id: 'm57', text: 'Foto de familia: todos los jugadores conectados en una sola foto, todos etiquetados', formato: 'carrera', ...EPICA, media: 'foto', min_personas: 6, slots: {}, tags: ['epica', 'grupo'] },
  { id: 'm58', text: 'Videoclip: 15s con al menos 6 personas, coreografía, cambio de plano y final', formato: 'carrera', ...EPICA, media: 'video', min_personas: 6, slots: {}, tags: ['epica', 'grupo', 'actuacion'] },
  { id: 'm59', text: 'Vídeo de 15s: musical improvisado con 10 personas y estribillo pegadizo', formato: 'carrera', ...EPICA, media: 'video', min_personas: 10, slots: {}, tags: ['epica', 'grupo', 'actuacion'] },
  { id: 'm60', text: 'Reunid a 12 personas para una foto saltando todas a la vez en el aire', formato: 'carrera', ...EPICA, media: 'foto', min_personas: 12, slots: {}, tags: ['epica', 'grupo', 'fisico'] },
  { id: 'm61', text: 'Vídeo coral de 20s recreando un videoclip famoso con 8+ participantes', formato: 'carrera', ...EPICA, media: 'video', min_personas: 8, slots: {}, tags: ['epica', 'grupo', 'actuacion'] },
  { id: 'm62', text: 'Conseguid que otra peña os enseñe su grito de guerra y grabadlo', formato: 'carrera', ...EPICA, media: 'video', min_personas: 1, slots: {}, tags: ['epica', 'social'] },
  { id: 'm63', text: 'Conga de mínimo 15 personas por la calle, vídeo de 15s', formato: 'carrera', ...EPICA, media: 'video', min_personas: 15, slots: {}, tags: ['epica', 'grupo', 'fisico'] },
  { id: 'm64', text: 'Foto imposible: toda la peña en el sitio más emblemático del pueblo, todos visibles y reconocibles', formato: 'carrera', ...EPICA, media: 'foto', min_personas: 6, slots: {}, tags: ['epica', 'grupo'] },
].map((t) => ({ ventana: 'permanente', peso: 1, roles: {}, ...t }))
