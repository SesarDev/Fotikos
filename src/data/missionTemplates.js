// Catálogo semilla — Anexo B de misiones-fiestas-spec-v2.md.
// {N} y {lugar} del documento original se han resuelto a valores concretos
// aquí porque el modelo de datos solo soporta huecos de jugador ({A}, {B}).
// roles solo aplica a formato "cooperativa" (artífice / fotógrafo, §3.4).

const FACIL = { dificultad: 'facil', base_points: 10 }
const MEDIA = { dificultad: 'media', base_points: 25 }
const DIFICIL = { dificultad: 'dificil', base_points: 50 }
const EPICA = { dificultad: 'epica', base_points: 100 }

const COOP_ROLES = { A: 'artífice', B: 'fotógrafo' }

export const MISSION_TEMPLATES = [
  // Fácil · 10 pts
  { id: 'm01', text: 'Selfie con {A} poniendo la misma cara que él/ella', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player' }, tags: ['facil'] },
  { id: 'm02', text: 'Foto imitando la postura de una estatua o cartel del pueblo', formato: 'carrera', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm03', text: 'Foto de tus zapatos junto a los de {A} y {B}', formato: 'personal', ...FACIL, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['facil'] },
  { id: 'm04', text: 'Selfie con alguien que lleve una prenda del mismo color que tú', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: {}, tags: ['facil'] },
  { id: 'm05', text: 'Foto de un animal del pueblo. Puntos morales extra si te hace caso', formato: 'carrera', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm06', text: 'Vídeo de {A} diciendo tu nombre con el peor acento que sepa', formato: 'personal', ...FACIL, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['facil'] },
  { id: 'm07', text: 'Foto de las manos de {A} y {B} haciendo el mismo gesto', formato: 'personal', ...FACIL, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['facil'] },
  { id: 'm08', text: 'Foto con la peor iluminación posible en la que aún se te reconozca', formato: 'personal', ...FACIL, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio', 'noche'] },
  { id: 'm09', text: 'Vídeo de 10 s explicando tu plan de hoy como si fueras un telediario', formato: 'personal', ...FACIL, media: 'video', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm10', text: 'Foto de tu desayuno con {A} de testigo al fondo', formato: 'personal', ...FACIL, media: 'foto', min_personas: 2, slots: { A: 'player' }, tags: ['facil', 'dia'] },

  // Media · 25 pts
  { id: 'm11', text: '{A} baila como Michael Jackson mientras {B} lo graba', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion'] },
  { id: 'm12', text: 'Foto de 3 personas haciendo la misma pose ridícula a la vez', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: {}, tags: ['grupo'] },
  { id: 'm13', text: 'Vídeo de 15 s cantando el estribillo de una canción con {A}', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion', 'noche'] },
  { id: 'm14', text: 'Foto en la plaza del pueblo con al menos 3 participantes', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: {}, tags: ['grupo'] },
  { id: 'm15', text: 'Recrea una foto tuya de la infancia con quien tengas a mano', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['ingenio'] },
  { id: 'm16', text: '{A} hace de barman poniendo cubatas, {B} lo inmortaliza', formato: 'cooperativa', ...MEDIA, media: 'foto', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['barra', 'noche'] },
  { id: 'm17', text: 'Foto con alguien del pueblo que no esté jugando. Pide permiso', formato: 'carrera', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['social'] },
  { id: 'm18', text: 'Vídeo enseñando a {A} un paso de baile inventado por ti', formato: 'personal', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player' }, tags: ['actuacion'] },
  { id: 'm19', text: 'Foto de un grupo de 4 ordenados de más alto a más bajo', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo'] },
  { id: 'm20', text: '{A} imita a {B} y {B} lo graba sin reírse', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion'] },
  { id: 'm21', text: 'Selfie con {A} y {B} en la que los tres miréis a sitios distintos', formato: 'personal', ...MEDIA, media: 'foto', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['ingenio'] },
  { id: 'm22', text: 'Foto de la merienda más exagerada que consigas montar', formato: 'carrera', ...MEDIA, media: 'foto', min_personas: 1, slots: {}, tags: ['dia'] },
  { id: 'm23', text: '{A} hace de estatua viviente durante 30 s, {B} graba a la gente reaccionando', formato: 'cooperativa', ...MEDIA, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion', 'ingenio'] },

  // Difícil · 50 pts
  { id: 'm24', text: 'Vídeo bailando la Macarena con mínimo 5 personas, sincronizados', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 5, slots: {}, tags: ['grupo', 'fisico', 'noche'] },
  { id: 'm25', text: 'Foto de 4 personas formando una letra con el cuerpo', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo', 'fisico'] },
  { id: 'm26', text: 'Recrea una portada de disco famosa con 4 participantes', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 4, slots: {}, tags: ['grupo', 'ingenio'] },
  { id: 'm27', text: '{A} da una entrevista de 15 s sobre las fiestas, {B} hace de reportero con micro improvisado', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion', 'ingenio'] },
  { id: 'm28', text: 'Foto en la que aparezcan 6 personas y ninguna mire a cámara', formato: 'personal', ...DIFICIL, media: 'foto', min_personas: 6, slots: {}, tags: ['grupo'] },
  { id: 'm29', text: 'Vídeo de una coreografía inventada de 15 s con {A} y {B}, los tres a la vez', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 3, slots: { A: 'player', B: 'player' }, tags: ['grupo', 'fisico'] },
  { id: 'm30', text: 'Foto de todos los que llevéis gafas de sol juntos', formato: 'carrera', ...DIFICIL, media: 'foto', min_personas: 2, slots: {}, tags: ['dia', 'grupo'] },
  { id: 'm31', text: 'Vídeo de una pirámide humana de 3. Con cabeza, sin lesiones', formato: 'personal', ...DIFICIL, media: 'video', min_personas: 3, slots: {}, tags: ['grupo', 'fisico'] },
  { id: 'm32', text: '{A} hace playback de una canción entera de 15 s, {B} la graba en plano fijo', formato: 'cooperativa', ...DIFICIL, media: 'video', min_personas: 2, slots: { A: 'player', B: 'player' }, roles: COOP_ROLES, tags: ['actuacion', 'noche'] },

  // Épica · 100 pts
  { id: 'm33', text: 'Vídeo coral: 15 s con al menos 10 participantes haciendo la ola', formato: 'carrera', ...EPICA, media: 'video', min_personas: 10, slots: {}, tags: ['epica', 'grupo'] },
  { id: 'm34', text: 'Foto de familia: todos los jugadores conectados en una sola foto, todos etiquetados', formato: 'carrera', ...EPICA, media: 'foto', min_personas: 6, slots: {}, tags: ['epica', 'grupo'] },
  { id: 'm35', text: 'Videoclip: 15 s con al menos 6 personas, coreografía, cambio de plano y final', formato: 'carrera', ...EPICA, media: 'video', min_personas: 6, slots: {}, tags: ['epica', 'grupo', 'actuacion'] },
].map((t) => ({ ventana: 'permanente', peso: 1, roles: {}, ...t }))
