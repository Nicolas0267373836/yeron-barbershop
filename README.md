# Yeron Barbershop — sitio web

Sitio de una página para **Yeron Barbershop** (Instagram [@yeron_barber](https://www.instagram.com/yeron_barber/)): barbería dominicana que atiende de lunes a viernes y trabaja 100 % a domicilio los miércoles.

- Proyecto WebDom nuevo e independiente: no pertenece a `webdom-site`, `webdom-citas`, Martis, Integraxis ni Abud & Martínez.
- Estado: **prototipo de alta fidelidad para revisión con el cliente**. Sin repositorio, sin dominio y sin deploy. Las reservas no envían datos: la página arma el mensaje y abre WhatsApp.
- Inspiración: estructura y lenguaje de la plantilla **Beard X** (beardtemplate.webflow.io): hero oscuro con título en mayúsculas muy pesadas, fondos claros alternos, divisor con ícono sobre cada título, panel de servicios con precio, galería asimétrica, banda de Instagram y botones de esquinas rectas. No se copiaron textos, fotos, marca ni diseño exacto.
- Identidad propia: el **poste de barbería** del logo (rojo, blanco y azul, que además son los colores de la bandera dominicana) y una tipografía de **camiseta de béisbol** (bloque condensado + script con cola), a partir del lema «Flow de la mata! 🇩🇴⚾️🔥».

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Contenido, secciones, datos estructurados (JSON-LD) y sprite de íconos |
| `styles.css` | Tokens, componentes, secciones, movimiento y responsive (1440 / 768 / 390) |
| `script.js` | **Datos editables** (negocio, horario, 6 servicios, galería) e interacciones |
| `revision.js` · `revision.css` | Herramientas de revisión: 20 anotaciones de movimiento, datos por confirmar y sistema de diseño. **Eliminar en producción** |
| `vista-responsive.html` | Escritorio, tablet y móvil uno junto a otro |
| `images/` | Fotos optimizadas (WebP), logo en versión clara y oscura, favicon e imagen para compartir |

No necesita build. Para verlo en local: `npx serve .` y abrir `http://localhost:3000` (o `python -m http.server`).

## Secciones

1. Barra superior con estado en vivo (abierto / cerrado / miércoles a domicilio, en hora dominicana), horario y WhatsApp.
2. Navegación fija que se compacta al hacer scroll; menú a pantalla completa en tablet y móvil.
3. Hero «**FLOW** *de la mata*» con fotos en cápsulas (la forma del cilindro del poste), sello giratorio y tarjeta con el próximo miércoles a domicilio.
4. Cinta roja inclinada con los servicios.
5. Sobre Yeron: foto con Estrellas, texto y cifras reales de Instagram.
6. Servicios: 6 tarjetas con detalle en ventana (foto de ejemplo, qué incluye, precio, duración) y botón que preselecciona el servicio en la reserva.
7. Miércoles a domicilio: desde RD$1,000, precio final según distancia, y cotizador que arma el mensaje de WhatsApp.
8. Galería de resultados con filtros (Todos, Fades, Barba, Texturas, **Reconocidos**), carrusel arrastrable y lightbox.
9. Banda de Instagram con las cifras del perfil.
10. Reserva en 4 pasos (servicio → día y hora → datos → confirmar) que termina en WhatsApp.
11. Preguntas frecuentes (solo con datos confirmados).
12. Visítanos: dirección, horario semanal con «Hoy», copiar número o dirección.
13. Cierre con el retrato del guante y dos llamados a la acción.
14. Pie y botón flotante de WhatsApp.

## Cómo revisar el prototipo

Botón «Revisión» en la esquina inferior izquierda:

1. **Movimiento**: 20 marcadores numerados sobre la página. Cada uno explica la animación y sus estados.
2. **Por confirmar**: lista para el cliente y todas las marcas «por confirmar» de la página (botón «Ir» para cada una), con opción de resaltarlas.
3. **Sistema**: colores con contraste, tipografía, botones en sus 7 estados, espaciado, curvas de movimiento y puntos de corte.

Enlaces directos a cada servicio: `index.html#servicio-fade`, `#servicio-perfilado`, `#servicio-barba`, `#servicio-corte-barba`, `#servicio-rayas`, `#servicio-domicilio`.

## Datos usados y su fuente

| Dato | Fuente |
|---|---|
| Perfil @yeron_barber, lema «Flow de la mata! 🇩🇴⚾️🔥», rubro barbería | Instagram (revisión del usuario, sept. 2026) |
| Horario lunes a viernes, 8:00 a. m.–9:00 p. m. | Instagram |
| WhatsApp +1 829-337-4594 | Instagram |
| «Av. Presidente Enríquez, al lado de Plaza Jorge» | Instagram. **Falta la ciudad y la referencia completa** |
| 350 publicaciones y 2,707 seguidores | Instagram al momento de la revisión. En la página: «350+» y «2,700+» |
| Miércoles 100 % a domicilio, RD$1,000, el precio se cotiza según la distancia | Publicación de Instagram indicada por el usuario |
| Ha recortado a figuras reconocidas | Usuario |
| Logo, foto con Estrellas, retrato con guante y 4 cortes | Imágenes entregadas por el usuario |

No se inventaron cifras, reseñas, años de experiencia ni precios. «13 h» sale del horario (8:00 a. m. a 9:00 p. m.). Los nombres de los servicios salen de los cortes que se ven en las fotos (fade, perfilado, barba, raya) y están marcados para confirmar.

## Imágenes

| Archivo | Origen | Dónde se usa |
|---|---|---|
| `logo/yeron-logo-claro.png` | Logo entregado: fondo transparente, letras claras, poste intacto | Navegación, menú móvil, pie |
| `logo/yeron-logo-oscuro.png`, `logo/yeron-sello-*.png` | Logo entregado (lockup y sello circular) | Versiones de repuesto para fondos claros y redes |
| `yeron-con-estrellas.webp` | Foto con Estrellas | Sobre Yeron y galería («Reconocidos») |
| `retrato-guante.webp` | Retrato con guante | Cierre de la página, sin nombre |
| `cortes/fade-con-raya.webp`, `taper-con-rizos.webp`, `high-fade-y-barba.webp`, `twists-y-barba.webp` | Fotos de clientes | Hero, galería, detalle de servicios, banda de Instagram |
| `og-yeron.jpg` | Composición nueva (1200 × 630) | Vista previa al compartir en WhatsApp y redes |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Poste dibujado en SVG | Ícono de la pestaña y del teléfono |

Las fotos vienen de Instagram (máx. 1024 px). Se optimizaron a WebP sin cambiar su contenido.

## Pendiente de confirmar con Yeron

- Ciudad y punto de referencia completo de la dirección; si la avenida es «Enríquez» o «Henríquez».
- Pin o enlace de Google Maps (hoy el botón pide la ubicación por WhatsApp).
- Horario de sábado y domingo.
- Hora del domicilio de los miércoles (la reserva ofrece de 8:00 a. m. a 8:00 p. m.).
- Lista de servicios y precios (solo está confirmado el domicilio desde RD$1,000), y la descripción de cada uno.
- Cómo se cotiza la distancia del domicilio.
- Duración aproximada de cada servicio.
- **Figuras reconocidas**: fotos, nombres y permiso de uso (2 espacios pendientes en el filtro «Reconocidos»).
- Contexto de la foto con Estrellas y permiso de la otra persona.
- Quién aparece en el retrato con guante (¿Yeron o un cliente?) y permiso de uso.
- Permiso de los clientes que aparecen en la galería.
- Historia de Yeron (opcional): desde cuándo corta, dónde empezó.
- Métodos de pago y si atiende sin cita.
- Que el WhatsApp +1 829-337-4594 recibe reservas y cotizaciones.
- Fotos originales en mejor resolución.
- Testimonios reales con autorización (no se agregaron reseñas).
- Dominio y publicación.

## Cómo editar el contenido

Todo está al principio de `script.js`:

- **Precios**: en `SERVICIOS`, cambiar `precio: null` por `precio: 'RD$…'`.
- **Servicios**: agregar, quitar o renombrar objetos de `SERVICIOS`; las tarjetas, el detalle y las opciones de la reserva se actualizan solos.
- **Foto de una figura reconocida**: copiar la imagen a `images/` y reemplazar una entrada `pendiente: true` de `GALERIA` por `{ src, w, h, titulo, etiqueta: 'Reconocidos', cats: ['reconocidos'], reconocido: true, alt }`.
- **Horario del fin de semana**: en `HORARIO`, cambiar `6: null` o `0: null` por `{ abre: 9, cierra: 18, modo: 'barberia' }`. Actualizar también la tabla de horario, el pie, la pregunta frecuente y el JSON-LD de `index.html`.

## Sistema de diseño

**Color** (tokens en `:root` de `styles.css`)

| Token | Valor | Uso |
|---|---|---|
| `--noche` | `#0A1220` | Hero, domicilio, horario y pie (azul noche de la bandera) |
| `--marmol` / `--blanco` | `#F3F2EF` / `#FFFFFF` | Fondos claros alternos (paredes de mármol de la barbería) |
| `--rojo` | `#D42A31` | Botón principal y acentos (5,0:1 con blanco) |
| `--rojo-hover` | `#B51F26` | Hover y texto rojo sobre claro (5,9:1) |
| `--azul` | `#1F7FC4` | Poste y anillo de foco |
| `--vena` / `--vena-oscura` | `#C9B28A` / `#7A6440` | Eyebrows y líneas (veta del mármol) |
| `--tinta` / `--pizarra` / `--niebla` | `#0E1624` / `#4A5363` / `#AEB7C5` | Texto principal, secundario sobre claro, secundario sobre noche |
| `--whatsapp` | `#157F45` | Botones de WhatsApp (5,1:1 con blanco) |
| `--negro` | `#030303` | Cierre (mismo negro del retrato) |

**Tipografía** (Google Fonts): **Archivo** 850–900 con ancho 72–82 % para títulos, botones y cifras; **Yellowtail** para acentos en script; **Schibsted Grotesk** para texto e interfaz. Escala fluida: H1 6,5 → 15 rem · H2 2,35 → 4,3 rem.

**Espacio y forma**: contenedor de 1280 px, margen lateral 16–56 px, secciones de 76–136 px, radios de 2 / 4 / 10 px y píldora.

**Franjas del poste**: `repeating-linear-gradient(45deg)` rojo · blanco · azul · blanco con período `--p` y mosaico de p·√2 para que el giro sea continuo. Se usan en la barra de progreso, el subrayado del menú, los divisores, la barra de la reserva y la carga de los botones.

## Estados de botones

| Estado | Comportamiento |
|---|---|
| Normal | Rojo (o variante), esquinas rectas, flecha |
| Hover | Sube 2 px, sombra del color del botón, la flecha avanza 4 px |
| Active | Escala 0,97 durante 80 ms |
| Focus | Anillo azul de 3 px con separación de 3 px (`:focus-visible`) |
| Loading | `.is-loading`: el texto se oculta y gira un poste de barbería |
| Success | `.is-success`: verde con check que rebota (copiar número, dirección o mensaje) |
| Disabled | Gris, sin sombra ni movimiento |

## Sistema de movimiento

Todo usa `transform`, `opacity`, `filter` o `clip-path`. Curva principal `cubic-bezier(.22, 1, .36, 1)`. El contenido es visible en reposo: solo lo que está por debajo del pliegue al cargar se oculta y se revela al entrar en pantalla.

| Elemento | Animación |
|---|---|
| Carga | Barra superior y navegación bajan 10 px → «FLOW» sube desde una máscara → «de la mata» se escribe con clip-path y se dibuja la cola → texto y botones escalonados |
| Fotos del hero | Desenfoque → nítido al cargar, parallax 0,06 / 0,13 (≥ 900 px), flotación de 9 px, zoom 3 % al pasar el cursor |
| Scroll | Bloques suben 28 px con fade; grupos escalonados cada 90 ms |
| Cifras | Cuentan desde 0 en 1,4 s al entrar en pantalla |
| Servicios | Ícono gira −6° y se rellena, franja del poste en el borde, detalle que crece desde la tarjeta |
| Domicilio | El panel azul se expande a todo el ancho con el scroll |
| Galería | Píldora deslizante en los filtros, fotos que reaparecen escalonadas, arrastre, lightbox con teclado y gestos |
| Reserva | Barra con franjas, pasos que se deslizan, vibración leve en errores, poste girando al enviar, check dibujado |
| FAQ | Altura animada; + gira a ×; en móvil una respuesta a la vez |
| WhatsApp | Aparece al salir del hero; se oculta sobre la reserva y el pie; pulso cada 8 s |

Con `prefers-reduced-motion: reduce` se desactivan parallax, flotación, cinta, revelados, contadores y el recorte del domicilio. En móvil no hay flotación ni parallax.

## Reserva por WhatsApp

La reserva no guarda ni envía datos. Al final abre `wa.me/18293374594` con un mensaje como este:

```
Hola, Yeron. Quiero reservar un turno desde tu página web.
• Servicio: Corte + barba
• Día: jueves 1 de octubre
• Hora: 10:00 a. m.
• Lugar: en la barbería
• Nombre: …
• Mi WhatsApp: …
```

Los miércoles solo permite domicilio: pide sector y cantidad de personas, y agrega que el precio arranca en RD$1,000 según la distancia. Sábado y domingo aparecen deshabilitados («Por confirmar») y las horas que ya pasaron hoy no se pueden elegir.

## Antes de publicar

1. Confirmar los pendientes de arriba.
2. Borrar `revision.js`, `revision.css` y sus dos líneas en `index.html`.
3. Completar la dirección en el JSON-LD y usar una URL absoluta en `og:image` cuando haya dominio.
4. Publicar solo cuando WebDom lo apruebe (sitio estático, sin build).
