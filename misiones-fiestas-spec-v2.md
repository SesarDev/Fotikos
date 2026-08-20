# MISIONES — Documento funcional v2

**Juego de misiones fotográficas para las fiestas del pueblo**
15-20 jugadores · Viernes a martes · Webapp + grupo de WhatsApp

---

## 0. Qué hace la app y qué hace WhatsApp

Esta es la decisión que ordena todo el proyecto:

> **La app hace las dos únicas cosas que WhatsApp no puede hacer: repartir misiones en secreto y llevar la cuenta automáticamente. Todo lo demás lo hace WhatsApp.**

| | App | WhatsApp |
|---|---|---|
| Repartir misiones privadas | ✅ | ❌ imposible |
| Sobres cerrados y sorpresa | ✅ | ❌ |
| Puntuación y clasificación | ✅ | ❌ |
| Encargos del comité | ✅ | — |
| Fotos y vídeos | ❌ | ✅ |
| Muro y reacciones | ❌ | ✅ nativo |
| Avisos de drop | ❌ | ✅ |
| Votaciones de duelo | ❌ | ✅ encuesta nativa |
| Álbum final | ❌ | ✅ exportación del chat |

**Regla de oro para cualquier duda futura:** si WhatsApp ya lo hace, no lo programes.

Consecuencia directa: el proyecto pasa de ~45 h a **~15-18 h**, y desaparecen todos los riesgos técnicos serios (almacenamiento, códecs de vídeo, red saturada, moderación de contenido).

---

## 1. Concepto

Un grupo de amigos entra a una sala privada durante las fiestas. Cada varias horas reciben **sobres cerrados** con misiones fotográficas personales, que nadie más ve. Se cumplen haciendo la foto o el vídeo y **enviándolo al grupo de WhatsApp del juego**. En la app se marca como completada y se etiqueta a quien sale, y los puntos se reparten solos.

### 1.1 Principios

1. **Sin policía.** No hay validación, ni votos, ni jueces. El que quiera hacer trampas que las haga: el grupo de WhatsApp está a la vista de todos y ya se encarga solo.
2. **Asíncrono.** Nadie tiene que estar mirando el móvil a la vez que otro.
3. **Menos de 20 segundos por interacción.** Abrir sobre → hacer la foto → marcar hecho. Nada más.
4. **Colaborar puntúa.** Ayudar a otro también da puntos. Nadie debe poder decir "déjame en paz".
5. **La app no es el juego.** Sin scroll infinito, sin insistencia, sin rachas que castiguen no jugar. Al cerrarla tienes que sentir que has terminado, para volver a la fiesta.
6. **~10 minutos de atención al día.** Es lo máximo que se le puede pedir a alguien que está de fiestas.

### 1.2 Decisiones cerradas

| Decisión | Elección |
|---|---|
| Plataforma | Webapp (PWA), un código para iPhone y Android |
| Multimedia | **Fuera de la app.** Todo va al grupo de WhatsApp |
| Validación | **Ninguna.** Autodeclaración, sistema de honor |
| Formato de competición | Individual, con puntos compartidos por etiquetado |
| Formatos de misión | Personal · Carrera · Duelo · Cooperativa |
| Avisos | Cuenta atrás en la app + mensaje al grupo |
| Volumen | 3-4 misiones garantizadas por jugador y día |

### 1.3 Alcance de la v1

Automatizado en la app: **personales**, sobres cerrados, puntuación, clasificación, compositor del comité, recap.

Manual vía compositor del comité: **carreras, duelos y cooperativas**. No necesitan motor propio — son un encargo con destinatarios y un texto. El duelo se resuelve con una encuesta nativa de WhatsApp.

Para el año que viene: emparejamiento automático de duelos con citación, carreras con podio calculado, cadenas de misiones.

---

## 2. La sala

### 2.1 Roles

- **Comité** (1-2 personas) — crea la sala, escribe encargos, puede anular misiones. Durante las fiestas juega como uno más.
- **Jugador** — todos los demás. Sin cuentas ni contraseñas.

### 2.2 Entrada

1. Abre el enlace o escanea el QR → `misiones.app/#/r/KIWI7`
2. Escribe su nombre y elige un emoji de avatar
3. Acepta las normas de convivencia (una pantalla, cinco líneas)
4. Se le asigna un `player_id` persistente en el dispositivo

**El onboarding se hace el jueves, no el viernes.** Quince personas en una plaza a las nueve de la noche no es momento de explicar nada. Manda el enlace el jueves: *"entrad, poned vuestro nombre y un emoji, no hace falta nada más"*. El viernes el primer sobre cae sobre un grupo que ya está dentro.

### 2.3 Sesiones

El juego no corre de forma continua: son **cuatro sesiones** con pausa diurna.

| Sesión | Horario | Duración | Drops |
|---|---|---|---|
| Viernes | 21:00 → 04:00 | 7 h | 3 |
| Sábado | 14:00 → 04:00 | 14 h | 4 |
| Domingo | 14:00 → 04:00 | 14 h | 4 |
| Lunes | 14:00 → 04:00 | 14 h | 4 |
| Martes | — | — | Recap a las 20:00 |

**Entre las 04:00 y las 14:00 el juego duerme.** No hay drops, no corren las caducidades, la app muestra *"el juego vuelve a las 14:00"*. Una sola regla que evita que nadie reciba misiones mientras duerme y que el juego te reclame con resaca.

---

## 3. Formatos de misión

Tres ejes independientes. Cualquier combinación es válida.

| Eje | Valores |
|---|---|
| **Formato** | personal · carrera · duelo · cooperativa |
| **Ventana** | permanente · flash · nocturna |
| **Origen** | automática · encargo del comité |

### 3.1 Personal

Solo la ve un jugador. Es el formato por defecto y el 75% del contenido.

**Regla de asignación automática:** si la plantilla contiene huecos de jugador (`{A}`, `{B}`) es personal; si no los contiene puede ser carrera. No hay que marcar nada a mano.

*Por qué las que nombran gente tienen que ser personales:* si "selfie con Marta bailando" fuese global, quince personas perseguirían a Marta la misma noche. Siendo personal, las interacciones se reparten por todo el grupo.

### 3.2 Carrera

La ve toda la sala. Cuenta el orden de finalización.

```
1º ×3   ·   2º ×2   ·   3º ×1,5   ·   resto ×1
```

**Nunca todo-o-nada.** Todo el que la complete se lleva algo. El pique sigue estando (×3 frente a ×1 es enorme) pero nadie que se haya esforzado se queda a cero, que en un juego asíncrono es fundamental: a lo mejor estabas cenando cuando cayó.

Una al día. Son el acontecimiento del día, no el pan de cada día.

### 3.3 Duelo

Dos jugadores concretos, la misma prueba, gana uno.

- **Citación 20 minutos antes, anunciada a toda la sala.** Estáis todos en el mismo pueblo: anunciarlo hace que la gente se junte a verlo. Convierte una foto en un espectáculo, y es gratis.
- Se revela **el rival, no la prueba**. Los 20 minutos son para picarse en el grupo y para encontrarse físicamente.
- Ventana de 45 minutos desde la revelación.
- **La votación se hace con una encuesta nativa de WhatsApp.** La ve todo el grupo, genera más ruido que dentro de la app, y no cuesta una línea de código.
- Ganador 100%, perdedor 30%.
- **Si uno no aparece:** el que sí lo hizo se lleva el 100% igual, el ausente no pierde nada. Puede que estuviera bailando.

*Regla imprescindible al elegir duelistas:* solo entre gente que **ha abierto la app en las últimas 2 horas**. Un duelo contra alguien dormido es un duelo muerto y una decepción para el otro.

### 3.4 Cooperativa

Dos personas, roles asimétricos: **artífice** (hace la cosa) y **fotógrafo** (la captura).

- **Cualquiera de los dos puede marcarla como hecha.** Los roles son narrativa. Si solo pudiera el fotógrafo y este se despista, el artífice ha hecho el ridículo para nada — y eso genera un cabreo real.
- **100% de los puntos para los dos.** No 60/40. El coste de una cooperativa es convencer a otra persona, y quieres que ese *"¿me ayudas?"* reciba un sí inmediato.
- Máximo 2 personas. Con 3 la coordinación se dispara.
- Caduca a las 12 h sin penalización para ninguno. Nada de descartes unilaterales que dejan tirado al otro.

---

## 4. El sobre cerrado

Las misiones llegan **cerradas**. No se ve el contenido hasta abrirlas, y ese gesto es medio juego.

```
        ✉️ ✉️
     2 SOBRES SIN ABRIR
        [ Abrir ]

   Hay 7 sobres sin abrir en la sala
```

**El secreto resuelve el problema de las notificaciones.** Si nadie sabe qué le ha tocado a nadie, el aviso no puede hacer spoiler — y entonces **un único mensaje genérico al grupo sirve para los quince**:

> 🔔 *Se han repartido sobres. Abrid la app.*

Cero infraestructura de push, cero problema con los iPhone.

### 4.1 Los dos relojes

| Reloj | Cuenta desde | Para qué |
|---|---|---|
| **Caducidad** | El reparto | Al cierre de la sesión (04:00). Los repartidos después de las 00:00 sobreviven hasta las 16:00 del día siguiente |
| **Bonus de rapidez** | La apertura | ×1,5 si la completas en los 90 min siguientes a abrir el sobre |

Separarlos es importante: no castigas a quien estaba cenando, pero tampoco premias guardarse sobres esperando el momento óptimo.

### 4.2 Sobres conjuntos

En cooperativas y duelos, si uno abre y el otro no, el primero se queda bloqueado. Al abrir aparece un botón **"Avisar a Marta"** que abre WhatsApp con el texto ya escrito. Es el único aviso dirigido que necesita el juego, no requiere backend, y lo manda una persona, no el sistema.

---

## 5. Completar una misión

Este es el flujo central de la app y tiene que ser de tres toques.

```
1. Abres el sobre y lees la misión
2. Haces la foto o el vídeo y lo mandas al grupo de WhatsApp
3. En la app: [ ✅ Completada ]
4. Etiquetas a quien sale (opcional pero rentable)
5. Puntos al instante. Sin esperas, sin validación
```

### 5.1 El pie de foto es obligatorio

El botón **Completada** copia al portapapeles un pie ya formateado y abre WhatsApp:

```
✅ M14 · Media · 25 pts
"Hazte un selfie con Marta imitando una estatua del pueblo"
— con Marta
```

Lo pegas como pie al mandar la foto. **Esto no es decorativo: es lo que salva el álbum.** Sin el texto de la misión, dentro de tres meses el grupo será doscientas fotos sin contexto que nadie entiende. Con él, es un archivo que se lee solo.

### 5.2 Etiquetado y confirmación

Etiquetas a quien sale contigo. Cada etiquetado recibe **el 30% de los puntos base** cuando confirma.

**La confirmación del etiquetado es la única comprobación que queda en todo el juego, y es suficiente.** No puedes reclamar una misión de grupo tú solo: hace falta que otra persona diga "sí, yo estaba ahí". Con eso y con el grupo de WhatsApp a la vista, el sistema de honor se sostiene sin necesidad de nada más.

**Tope anti-farming:** solo cuentan las 3 primeras veces al día que apareces como cómplice de la misma persona. Impide que dos amigos se hagan cuarenta fotos juntos.

---

## 6. Puntuación

### 6.1 Fórmula

```
puntos = base × rapidez × posición × grupo × día
```

| Factor | Valor |
|---|---|
| **base** | Fácil 10 · Media 25 · Difícil 50 · Épica 100 |
| **rapidez** | ×1,5 si completas en los 90 min tras abrir el sobre (solo personales) |
| **posición** | Solo carreras: 1º ×3 · 2º ×2 · 3º ×1,5 · resto ×1 |
| **grupo** | +10% por persona confirmada por encima del mínimo exigido. Tope ×2 |
| **día** | Viernes ×1 · Sábado ×1 · Domingo ×1,25 · **Lunes ×2** |

**Casos especiales:** cooperativa → 100% para los dos. Duelo → ganador 100%, perdedor 30%. Cómplice etiquetado → 30% de la base, sin multiplicadores.

**No hay penalizaciones de ningún tipo.** El juego premia, no castiga.

### 6.2 Clasificación diaria además de la general

Cuatro días es largo. Con una clasificación por día, el que se despiste el sábado no queda descartado el domingo, y tienes cuatro momentos de "he ganado algo" en vez de uno. Resuelve el problema del líder inalcanzable mejor que cualquier multiplicador.

El ×2 del lunes existe para que el último día sea un clímax, no un trámite.

### 6.3 Otras tablas

Además de la clasificación general, tres tablas que dan a más gente algo que ganar:

- **Más solicitado** — el más etiquetado por otros
- **Más colaborador** — más misiones de otros en las que ha participado
- **Más madrugador** — más misiones completadas en las primeras 2 h de cada sesión

---

## 7. Calendario de drops

### 7.1 Presupuesto diario

Con 15 jugadores, un día son **60 huecos de misión**:

```
1 carrera     × 15 jugadores  = 15 huecos
3 personales  × 15 jugadores  = 45 huecos
                                ─────────
                                 60 huecos
```

**Duelos y cooperativas van por encima**: a quien le toque ese día tiene una quinta misión, la más divertida. Que sea un premio, no una rutina.

### 7.2 Día completo (sábado, domingo, lunes)

| Hora | Se reparte | Por jugador |
|---|---|---|
| **15:00** | 1 personal a cada uno · apertura del día | 1 |
| **19:00** | **Carrera del día** · 2 cooperativas | 1 (+1 a 4 personas) |
| **22:00** | 1 personal a cada uno · 2-3 duelos | 1 (+1 a 4-6 personas) |
| **01:00** | 1 personal nocturna a cada uno | 1 |

### 7.3 Viernes (arranque suave)

| Hora | Se reparte | Por jugador |
|---|---|---|
| **21:00** | 1 personal **muy fácil** · bienvenida y normas | 1 |
| **23:30** | **Carrera de apertura** · 2 duelos de presentación | 1 |
| **01:30** | 1 personal nocturna | 1 |

La primera misión del viernes tiene que ser absurdamente fácil. El primer sobre da un chute inmediato, no plantea un reto.

### 7.4 Horas redondas y memorables

15, 19, 22, 01. En dos días la gente se sabe el horario de memoria y mira el móvil sola. Con drops cada dos horas eso no pasa: es ruido.

### 7.5 Carácter de cada día

| Día | Carácter | Cómo se consigue |
|---|---|---|
| **Viernes** | Arranque. Que entiendan el juego y se rían | Solo misiones fáciles |
| **Sábado** | Día grande. Máxima intensidad | Peso alto a tags `locura`, `grupo` |
| **Domingo** | Mantenimiento. La gente está tocada | Peso alto a `ingenio`, bajo a `físico` |
| **Lunes** | Clímax. Las épicas, todo vale doble | Peso alto a `épica`, multiplicador ×2 |

Se controla solo con los `tags` y los `peso` de las plantillas. No hace falta código específico.

### 7.6 Totales del juego

| | |
|---|---|
| Misiones garantizadas por jugador | **15** (11 personales + 4 carreras) |
| Con duelos y cooperativas | ~17-19 |
| Instancias a generar | ~255 |
| Plantillas necesarias | **40-60** |
| Atención pedida al jugador | ~10 min/día |

---

## 8. Encargos del comité

Con el volumen automático bajo, **los encargos son el 30% del juego**. El motor no llena el día, tú sí. Y tú sabes cosas que ningún algoritmo puede saber: que Susana está de barra esta noche, que esos dos se tienen ganas desde el año pasado.

En la v1, además, **los encargos son el único vehículo de carreras, duelos y cooperativas**.

### 8.1 El compositor

Tiene que ser usable a la una de la mañana, con una mano, de pie.

```
┌────────────────────────────────┐
│ Texto de la misión             │
│ ┌────────────────────────────┐ │
│ │ Juan hace una foto a       │ │
│ │ Susana de barman poniendo  │ │
│ │ cubatas                    │ │
│ └────────────────────────────┘ │
│                                │
│ Formato   [Cooperativa ▾]      │
│ A quién   [Juan] [Susana] [+]  │
│ Roles     Juan=📷 Susana=🎭    │
│ Nivel     [Media · 25 pts]     │
│ Caduca    [en 3 h ▾]           │
│                                │
│ [Programar ▾]   [ Enviar ]     │
└────────────────────────────────┘
```

**Cinco toques y fuera.**

### 8.2 Cómo hacerlo sostenible cuatro noches

- **Borradores programados.** El viernes por la tarde escribes 12-15 y les pones hora. El grueso hecho antes de empezar.
- **Improvisas 2-3 por noche.** Son las que más gracia hacen porque están pegadas a lo que está pasando.
- **"Repetir con otras personas"** — coges un encargo que funcionó y lo relanzas cambiando nombres. Un toque.
- **Propuestas de jugadores** con aprobación de un toque. Cuando vean que sus ideas salen, te van a llover — y te quitan a ti el trabajo.
- **Cupo sugerido:** 5-8 encargos al día.

### 8.3 Anular

Como cada misión pesa más ahora, necesitas poder **matar una sobre la marcha**: el sitio ha cerrado, esa persona se ha ido a casa. Botón de anular, desaparece de los tablones, sin drama.

### 8.4 Dos salvaguardas

Una herramienta de "mandar misiones a personas concretas" puede acabar señalando siempre al mismo, aunque no sea la intención:

- **Tope de 2-3 encargos al mismo destinatario por día.**
- **Rechazo silencioso sin coste.** El destinatario puede decir "esta no": la misión desaparece sin aviso a nadie, sin restar puntos, sin aparecer en ningún sitio. No es un descarte, es un no. Son cinco líneas de código y evitan el único escenario feo que tiene este juego.

---

## 9. Interfaz

### 9.1 Estructura

Tres pestañas. Ya no hace falta muro: el muro es WhatsApp.

```
┌──────────────────────────────────┐
│  MISIONES      ✉️ 2   ⏱ 1:47    │
├──────────────────────────────────┤
│                                  │
│           (contenido)            │
│                                  │
├──────────────────────────────────┤
│    🎯          🏆          👤    │
│  Misiones   Ranking       Yo     │
└──────────────────────────────────┘
```

La cabecera lleva siempre **sobres sin abrir** y **cuenta atrás al próximo drop**. Esa cuenta atrás es la razón para volver a abrir la app.

### 9.2 Pantalla · Misiones

```
✉️  SOBRES SIN ABRIR          ← lo primero, imposible de ignorar

⚡  CADUCAN PRONTO             ← reloj en rojo

🎯  ABIERTAS                   ← lo que tienes entre manos

✅  COMPLETADAS HOY            ← plegado
```

**Anatomía de la tarjeta:**

- Chip de nivel con color y chip de formato
- Texto de la misión, con el avatar de la persona nombrada incrustado
- **Los puntos que darían a ti concretamente**, ya con tus multiplicadores. No los puntos base: nadie va a multiplicar mentalmente
- En carreras: quién la ha completado ya y en qué posición
- Botón grande de **Completada**

### 9.3 Pantalla · Yo

Tus misiones, tus puntos desglosados, etiquetas pendientes de confirmar, tu descarte del día, y cambiar nombre y avatar (todo el mundo escribe una tontería la primera vez).

### 9.4 Reglas de UX no negociables

- Botones de 48 px mínimo, `touch-action: manipulation`
- **Usable con una mano y a oscuras.** Tema oscuro por defecto, contraste alto
- Sin scroll infinito, sin insistencia, sin rachas. La app tiene que sentirse "terminada" al cerrarla
- Nada de polling agresivo: refresco al abrir y poco más. La batería es un recurso escaso durante cuatro noches

---

## 10. Integración con WhatsApp

### 10.1 Grupo dedicado

**Crea un grupo aparte**, solo para el juego: `MISIONES · Fiestas 2026`. No lo mezcles con el grupo de logística. El grupo del juego es el álbum, y quieres que el martes sea contenido puro sin "¿a qué hora quedamos?" cada veinte mensajes.

### 10.2 Protocolo de mensajes

| Momento | Mensaje | Quién lo manda |
|---|---|---|
| Drop | `🔔 Se han repartido sobres. Abrid la app.` | Comité, texto generado por la app |
| Completar misión | Foto/vídeo + pie generado por la app | El jugador |
| Citación de duelo | `⚔️ 22:00 · DUELO · Juan vs Marta` | Comité |
| Voto de duelo | Encuesta nativa de WhatsApp | Comité |
| Resultado | `🏆 Gana Marta 8-4` | Comité |
| Cierre de sesión | `😴 Hasta mañana a las 14:00. Va ganando Juan con 340 pts` | Comité |

### 10.3 Salvar el álbum

WhatsApp comprime las fotos y el contenido puede desaparecer del móvil con el tiempo. Dos precauciones baratas:

- **Alguien exporta el chat con contenido al final de cada sesión.** Cinco minutos al día. Si el grupo se borra o alguien lo abandona, no pierdes cuatro días de fiestas.
- Activad *"Mantener en el chat"* en las fotos buenas.

No optimices más de esto: la calidad de WhatsApp es peor que la original pero perfectamente digna para un álbum de fiestas.

### 10.4 Plan B

**El grupo de WhatsApp es también el plan B de la app.** Si el sábado a las dos de la mañana algo revienta — se cae el proveedor, se agota una cuota, metes un bug — ten la lista de misiones en un sitio desde el que copiar y pegar. El juego sigue a mano y nadie nota la diferencia. Lo que no puede pasar es que cuatro días dependan de que tu servidor aguante.

---

## 11. Arquitectura técnica

### 11.1 Lo que ya no hace falta

Al sacar la media a WhatsApp desaparecen: almacenamiento de objetos, subida con URLs firmadas, conversión HEIC, compresión de imagen, generación de miniaturas, códecs de vídeo, cola offline con reintentos, reproducción de vídeo multiplataforma, moderación, reportes y borrado de contenido.

**Eso era el 70% del trabajo y el 100% del riesgo técnico.**

### 11.2 Stack

| Capa | Elección |
|---|---|
| Frontend | React + Vite, PWA |
| Backend / BD | **Supabase** (Postgres + auth anónimo) |
| Programación de drops | `pg_cron`, o un cron de GitHub Actions llamando a un endpoint |
| Hosting | Cloudflare Pages o Netlify |

Los datos totales del juego son unos cientos de filas y cero bytes de media. Cabe holgadamente en cualquier plan gratuito. Realtime es opcional: con refrescar al abrir la app y cada 30 s es más que suficiente.

**Autenticación:** sesión anónima en el primer acceso, vinculada a una fila de `players`. Ni email ni contraseñas. RLS restringiendo todo a la sala del jugador.

### 11.3 Modelo de datos

```sql
rooms
  id, code, name, organizer_ids[], settings jsonb

sessions
  id, room_id, label,          -- "viernes", "sábado"...
  opens_at, closes_at,          -- en UTC
  day_multiplier

mission_templates
  id, text, formato, dificultad, base_points,
  media,                        -- foto | video | cualquiera
  min_personas, slots jsonb,    -- {"A":"player"}
  roles jsonb,                  -- {"A":"artífice","B":"fotógrafo"}
  ventana, tags[], peso

missions
  id, room_id, session_id, template_id,
  rendered_text, slot_values jsonb,
  formato, assignee_id, target_ids[],
  base_points, published_at, expires_at,
  origen,                       -- automatica | encargo
  opened_at,                    -- ← cuándo se abrió el sobre
  cancelled_at, rejected_at

completions
  id, mission_id, player_id,
  completed_at, position,       -- posición en carreras
  points_awarded, breakdown jsonb

completion_tags
  completion_id, player_id, confirmed, confirmed_at

admin_drafts
  id, room_id, text, formato, target_ids[],
  dificultad, scheduled_for, sent_at
```

### 11.4 Guarda todos los timestamps

`published_at`, `opened_at`, `completed_at`, `confirmed_at`. Guardarlos es gratis ahora e **imposible retroactivamente**. El martes decidirás que mola un premio a "quien antes abre sus sobres", y si nunca guardaste `opened_at`, ese premio no existe.

### 11.5 Motor de sorteo

Reglas al asignar personales:

1. Nunca repetir plantilla al mismo jugador
2. Respetar la proporción de dificultades pase lo que pase con el azar
3. Priorizar en los huecos `{A}`/`{B}` a los jugadores **menos nombrados** hasta el momento
4. Máximo **3 menciones simultáneas** por jugador
5. Filtrar por `tags` según el día y la hora (nada de misiones de barra a las tres de la tarde)
6. Ponderar por `peso`

### 11.6 Zona horaria

Vuestro horario es Europe/Madrid, UTC+2 en agosto. Postgres, los crons y los navegadores trabajan en UTC.

**Guarda todo en UTC, convierte solo al pintar.** Y prueba explícitamente el cruce de medianoche: la sesión del sábado va de las 14:00 a las 04:00 del domingo, así que **"día de juego" no es lo mismo que "día del calendario"**. La clasificación diaria y la caducidad de misiones dependen de que eso esté bien. Es el bug más probable de todo el proyecto.

---

## 12. Recap del martes

Se publica el **martes a las 20:00**, cuando todo el mundo está en casa, recuperado y con ganas de revivirlo. Ese es el momento en que pega más fuerte.

La app aporta las estadísticas; el álbum está en WhatsApp.

- **Podio final** con los puntos desglosados, y los cuatro ganadores diarios
- **Premios automáticos:**
  - 🏆 Campeón general
  - 📅 Los cuatro campeones del día
  - 🤝 Más solicitado — el más etiquetado por otros
  - 🎭 Más colaborador — más misiones ajenas en las que participó
  - ⚡ Más rápido — mejor tiempo medio entre abrir el sobre y completar
  - 🌙 Criatura de la noche — más misiones entre las 02:00 y las 04:00
  - 📬 Impaciente — menor tiempo medio en abrir los sobres
  - ⚔️ Rey del duelo — más duelos ganados
- **Estadísticas tontas**, que siempre funcionan: misiones completadas, la pareja que más veces salió junta, la hora más activa, cuántas misiones quedaron sin abrir
- **Enlace al grupo** para descargar el álbum

---

## 13. Privacidad y convivencia

Menos crítico que en la v1 original, porque la app ya no almacena ninguna foto. Aun así:

- **Sala cerrada** por código, sin listados públicos, `noindex`
- **Pantalla de normas al entrar.** Cinco líneas, aceptación explícita. Que no todo el mundo quiere salir en fotos, y que lo que se manda al grupo se queda en el grupo
- **Rechazo silencioso** de cualquier misión, sin coste ni aviso
- La gestión del contenido es la de WhatsApp: quien quiera borrar algo, lo borra en el grupo

---

## 14. Plan de construcción

| Fase | Qué | Horas |
|---|---|---|
| **0** | Sala, entrada con código y nombre, navegación | 3 |
| **1** | Motor de plantillas, sorteo, reparto y **sobres cerrados** | 5 |
| **2** | Completar, etiquetado, confirmación, puntos, ranking | 4 |
| **3** | Compositor del comité con borradores programados | 3 |
| **4** | Recap y premios | 2 |
| | **Total** | **~17 h** |

> **Punto de control al final de la fase 2.** Ahí ya tienes el juego entero funcionando. Las fases 3 y 4 lo mejoran mucho, pero si te quedas sin tiempo, con las fases 0-2 y los encargos escritos a mano en WhatsApp el fin de semana sale igual.

**Orden de recorte si vas justo:** primero el recap (se monta a mano el martes), luego los borradores programados (mandas los encargos en vivo), luego las tablas secundarias del ranking. **Nunca recortes el sobre cerrado ni la confirmación de etiquetas**: son el corazón del juego y su único mecanismo de integridad.

---

## 15. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La gente no entra el viernes | **Crítico** | Onboarding el jueves. Es el mayor riesgo del proyecto |
| Fatiga acumulada en 4 noches | Alto | Clasificación diaria, caducidad de misiones, intensidad escalada por día |
| Bug de zona horaria en el cruce de medianoche | Alto | Todo en UTC, probar el cruce explícitamente |
| Misión imposible (sitio cerrado, gente ausente) | Medio | Descarte (1/día) + botón de anular del comité |
| El comité se quema escribiendo encargos | Medio | Borradores el viernes + propuestas de jugadores |
| La app falla a mitad de fiestas | Medio | Plan B: lista de misiones a mano, seguir por WhatsApp |
| Batería agotada | Medio | Sin polling, sin vídeo en la app. Batería externa por cuadrilla |
| Alguien infla sus puntos | Bajo | Confirmación de etiquetas + el grupo a la vista. No hay más y no hace falta |

---

## 16. Checklist

**Una semana antes**

- [ ] 40-60 plantillas escritas en el formato del anexo A
- [ ] Tags y pesos asignados para poder modular el carácter de cada día
- [ ] Calendario de sesiones y drops cargado, con horas en UTC
- [ ] **Simulacro real:** una tarde, cinco personas, un bar, 30 minutos, dos misiones de verdad. No para probar el código, sino para ver si la gente entiende qué hacer sin que se lo expliques. Lo que descubras será de redacción, no de software

**El jueves**

- [ ] Grupo de WhatsApp `MISIONES · Fiestas 2026` creado
- [ ] Enlace y QR enviados: *"entrad, poned nombre y emoji"*
- [ ] Confirmado que están dentro los 15
- [ ] Probado en un iPhone **y** un Android reales
- [ ] 12-15 encargos escritos y programados

**El viernes**

- [ ] Verificar a las 20:55 que el drop de las 21:00 sale solo
- [ ] Batería externa
- [ ] Primera misión revisada: tiene que ser absurdamente fácil

**Cada noche**

- [ ] Exportar el chat con contenido
- [ ] Mandar el mensaje de cierre con el marcador

---

## Anexo A · Formato de plantilla

Fija esto **antes** de escribir las 50 misiones. Si las escribes en prosa, luego las reformateas las 50.

```json
{
  "id": "coop-barman-01",
  "text": "{A} hace de barman poniendo cubatas mientras {B} lo inmortaliza",
  "formato": "cooperativa",
  "roles": { "A": "artífice", "B": "fotógrafo" },
  "dificultad": "media",
  "base_points": 25,
  "media": "foto",
  "min_personas": 2,
  "ventana": "permanente",
  "tags": ["barra", "noche", "actuacion"],
  "peso": 1
}
```

**Los tres campos que parecen menores y no lo son:**

- **`tags`** — permiten soltar misiones según contexto y modular el carácter de cada día. Sin ellos, con un pozo grande y aleatorio te saldrá una misión de la barra a las tres de la tarde.
- **`peso`** — frecuencia relativa. Las que sabes que van a ser un exitazo, peso 3. Las raras, 0,5.
- **`roles`** — obligatorio en cooperativas. Es lo que permite que la misma plantilla se renderice distinta en cada móvil: *"tú haces de barman"* frente a *"tú fotografías a Susana de barman"*.

---

## Anexo B · Catálogo semilla

35 plantillas para empezar. Ajusta nombres de sitios y referencias locales; lo que mejor funciona siempre es lo específico de vuestro pueblo.

### Fácil · 10 pts

| # | Texto | Formato | Tags |
|---|---|---|---|
| 1 | Selfie con `{A}` poniendo la misma cara que él/ella | personal | facil |
| 2 | Foto imitando la postura de una estatua o cartel del pueblo | carrera | ingenio |
| 3 | Foto de tus zapatos junto a los de `{A}` y `{B}` | personal | facil |
| 4 | Selfie con alguien que lleve una prenda del mismo color que tú | personal | facil |
| 5 | Foto de un animal del pueblo. Puntos morales extra si te hace caso | carrera | ingenio |
| 6 | Vídeo de `{A}` diciendo tu nombre con el peor acento que sepa | personal | facil |
| 7 | Foto de las manos de `{A}` y `{B}` haciendo el mismo gesto | personal | facil |
| 8 | Foto con la peor iluminación posible en la que aún se te reconozca | personal | ingenio, noche |
| 9 | Vídeo de 10 s explicando tu plan de hoy como si fueras un telediario | personal | ingenio |
| 10 | Foto de tu desayuno con `{A}` de testigo al fondo | personal | facil, dia |

### Media · 25 pts

| # | Texto | Formato | Tags |
|---|---|---|---|
| 11 | `{A}` baila como Michael Jackson mientras `{B}` lo graba | cooperativa | actuacion |
| 12 | Foto de `{N}` personas haciendo la misma pose ridícula a la vez | personal | grupo |
| 13 | Vídeo de 15 s cantando el estribillo de una canción con `{A}` | personal | actuacion, noche |
| 14 | Foto en `{lugar}` con al menos 3 participantes | personal | grupo |
| 15 | Recrea una foto tuya de la infancia con quien tengas a mano | personal | ingenio |
| 16 | `{A}` hace de barman poniendo cubatas, `{B}` lo inmortaliza | cooperativa | barra, noche |
| 17 | Foto con alguien del pueblo que no esté jugando. Pide permiso | carrera | social |
| 18 | Vídeo enseñando a `{A}` un paso de baile inventado por ti | personal | actuacion |
| 19 | Foto de un grupo de 4 ordenados de más alto a más bajo | personal | grupo |
| 20 | `{A}` imita a `{B}` y `{B}` lo graba sin reírse | cooperativa | actuacion |
| 21 | Selfie con `{A}` y `{B}` en la que los tres miréis a sitios distintos | personal | ingenio |
| 22 | Foto de la merienda más exagerada que consigas montar | carrera | dia |
| 23 | `{A}` hace de estatua viviente durante 30 s, `{B}` graba a la gente reaccionando | cooperativa | actuacion, ingenio |

### Difícil · 50 pts

| # | Texto | Formato | Tags |
|---|---|---|---|
| 24 | Vídeo bailando la Macarena con **mínimo 5 personas**, sincronizados | personal | grupo, fisico, noche |
| 25 | Foto de `{N}` personas formando una letra con el cuerpo | personal | grupo, fisico |
| 26 | Recrea una portada de disco famosa con 4 participantes | carrera | grupo, ingenio |
| 27 | `{A}` da una entrevista de 15 s sobre las fiestas, `{B}` hace de reportero con micro improvisado | cooperativa | actuacion, ingenio |
| 28 | Foto en la que aparezcan 6 personas y ninguna mire a cámara | personal | grupo |
| 29 | Vídeo de una coreografía inventada de 15 s con `{A}` y `{B}`, los tres a la vez | personal | grupo, fisico |
| 30 | Foto de todos los que llevéis gafas de sol juntos | carrera | dia, grupo |
| 31 | Vídeo de una pirámide humana de 3. Con cabeza, sin lesiones | personal | grupo, fisico |
| 32 | `{A}` hace playback de una canción entera de 15 s, `{B}` la graba en plano fijo | cooperativa | actuacion, noche |

### Épica · 100 pts

| # | Texto | Formato | Tags |
|---|---|---|---|
| 33 | **Vídeo coral:** 15 s con al menos 10 participantes haciendo la ola | carrera | epica, grupo |
| 34 | **Foto de familia:** todos los jugadores conectados en una sola foto, todos etiquetados | carrera | epica, grupo |
| 35 | **Videoclip:** 15 s con al menos 6 personas, coreografía, cambio de plano y final | carrera | epica, grupo, actuacion |

---

*Documento vivo. Lo que más se afina con la práctica son el calendario de drops y la redacción de las misiones — el software es la parte fácil.*
