/* ==========================================================================
   Herramientas de revisión del prototipo (WebDom)
   ELIMINAR EN PRODUCCIÓN: borrar este archivo, revision.css y sus dos
   líneas en index.html.
   ========================================================================== */
(() => {
  'use strict';
  // Dentro de vista-responsive.html (index.html#vista) no se muestran las herramientas
  if (window.location.hash === '#vista') return;

  const NOTAS = [
    { n: 1, titulo: 'Barra de progreso del poste', texto: 'Franja fija de 3 px en el borde superior. Se llena con el scroll mediante clip-path (sin reflujo) y sus franjas rojo-blanco-azul se desplazan como un poste de barbería girando (1,4 s, lineal, infinito).' },
    { n: 2, titulo: 'Navegación', texto: 'Fija arriba. Después de 24 px de scroll se compacta (86 → 68 px, logo 60 → 46 px) con desenfoque de fondo. El subrayado del enlace es una franja del poste que crece desde la izquierda (350 ms) y marca la sección activa. Menos de 1080 px: menú a pantalla completa con enlaces escalonados (45 ms), Esc para cerrar y foco atrapado.' },
    { n: 3, titulo: 'Entrada del hero', texto: 'Topbar y navbar bajan 10 px con fade (700 ms). «FLOW» sube desde una máscara (1 s, retraso 250 ms). Texto, botones y datos suben 22 px con fade, escalonados a 0,95 / 1,05 / 1,15 s.' },
    { n: 4, titulo: 'Script con cola de béisbol', texto: '«de la mata» se escribe de izquierda a derecha con clip-path (1,05 s desde 620 ms) y después se dibuja la cola, como en las camisetas de béisbol (700 ms desde 1,4 s).' },
    { n: 5, titulo: 'Fotos del hero', texto: 'Cápsulas con la forma del cilindro del poste. Entran subiendo 34 px con escala 1,04 → 1 y cada foto pasa de desenfocada a nítida al cargar. Parallax 0,06 y 0,13 (solo ≥ 900 px) y flotación de 9 px (7 s y 8 s) con la propiedad translate para no chocar con el parallax. Hover: zoom 3 % y brillo +5 %. En móvil no flotan.' },
    { n: 6, titulo: 'Sello giratorio', texto: 'Texto circular «Yeron Barbershop · Flow de la mata» que gira en 30 s. En el centro, el poste vertical con las franjas en movimiento.' },
    { n: 7, titulo: 'Tarjeta del próximo miércoles', texto: 'Calcula en hora dominicana el próximo miércoles (o «hoy» si es miércoles antes de las 9 p. m.) y se actualiza cada minuto. Flota 9 px en 6 s.' },
    { n: 8, titulo: 'Cinta roja', texto: 'Banda inclinada −1,4° con desplazamiento infinito de 40 s; se pausa con el cursor encima. Con movimiento reducido queda quieta y centrada.' },
    { n: 9, titulo: 'Cifras', texto: 'Solo datos reales (Instagram y horario). Cuentan desde 0 en 1,4 s (ease-out cúbico) cuando el 60 % del número entra en pantalla, una sola vez.' },
    { n: 10, titulo: 'Tarjetas de servicio', texto: 'Hover: fondo mármol, el ícono gira −6° y se rellena de rojo, la flecha avanza 4 px y una franja del poste crece en el borde inferior. Clic: el detalle crece desde la tarjeta (fade + escala, 500 ms) con foto de ejemplo, qué incluye y un botón que preselecciona el servicio en la reserva. Enlace directo: #servicio-fade, #servicio-barba…' },
    { n: 11, titulo: 'Panel del domicilio', texto: 'El fondo azul noche se expande con el scroll: empieza con 4 vw de margen lateral y esquinas de 32 px y llega a todo el ancho cuando la sección alcanza el 40 % de la pantalla. Franja del poste arriba y la palabra «Miércoles» en contorno al fondo.' },
    { n: 12, titulo: 'Cotizador del domicilio', texto: 'Cada cambio (sector, personas, hora) reescribe la vista previa del mensaje con un destello verde y actualiza el enlace de WhatsApp. Sin sector, el botón no abre WhatsApp: marca el error con una vibración leve y devuelve el foco al campo.' },
    { n: 13, titulo: 'Filtros de la galería', texto: 'Píldora azul noche que se desliza hasta el filtro activo (450 ms). Las fotos visibles reaparecen escalonadas (60 ms) subiendo 18 px. «Reconocidos» muestra la foto con Estrellas y los espacios pendientes.' },
    { n: 14, titulo: 'Carrusel y lightbox', texto: 'Scroll-snap con arrastre de mouse (soltar no abre la foto), deslizamiento táctil, flechas del teclado y botones anterior/siguiente; barra y contador indican la posición. Clic: lightbox con escala 0,96 → 1, flechas ← →, Esc, gesto de deslizar y foco atrapado.' },
    { n: 15, titulo: 'Banda de Instagram', texto: 'Tríptico de fotos en blanco y negro con parallax 0,08 detrás de una capa azul noche. Muestra las cifras reales del perfil.' },
    { n: 16, titulo: 'Reserva en 4 pasos', texto: 'Barra con franjas del poste (ancho animado 550 ms). Cada paso entra deslizándose 26 px (al volver, desde la izquierda) y el foco pasa al título del paso. Validación por paso con mensajes claros. Botón final: estado de carga con el poste girando (900 ms) y pantalla de éxito con check dibujado. No envía datos: abre WhatsApp con el mensaje listo.' },
    { n: 17, titulo: 'Preguntas frecuentes', texto: 'Altura animada con grid-template-rows 0fr → 1fr (450 ms); el + gira 135° y se rellena de azul noche. En móvil solo una respuesta abierta a la vez.' },
    { n: 18, titulo: 'Estado en vivo', texto: 'Se calcula en hora dominicana (UTC−4) cada minuto: abierto, cerrado, miércoles a domicilio o fin de semana por confirmar. El punto late en verde cuando está abierto y en rojo los miércoles. Marca «Hoy» en la tabla de horario.' },
    { n: 19, titulo: 'CTA final', texto: 'El retrato se funde con el negro de la sección mediante una máscara en los bordes izquierdo e inferior; parallax 0,05 en escritorio.' },
    { n: 20, titulo: 'WhatsApp flotante', texto: 'Aparece al salir del hero y se oculta sobre la reserva y el pie para no tapar botones. Pulso suave cada 8 s; con el cursor encima se abre la etiqueta «Escríbele a Yeron».' },
  ];

  const PENDIENTES = [
    { t: 'Dirección completa', d: 'Hoy: «Av. Presidente Enríquez, al lado de Plaza Jorge». Falta la ciudad y el punto de referencia completo. Confirmar también si se escribe «Enríquez» o «Henríquez».' },
    { t: 'Pin de Google Maps', d: 'Para enlazar «Cómo llegar». Mientras tanto, el botón pide la ubicación por WhatsApp.' },
    { t: 'Horario de sábado y domingo', d: 'Solo está confirmado lunes a viernes, 8:00 a. m.–9:00 p. m.' },
    { t: 'Hora del domicilio de los miércoles', d: '¿Es el mismo rango de 8:00 a. m. a 9:00 p. m.? La reserva ofrece esas horas.' },
    { t: 'Servicios y precios', d: 'Solo está confirmado el domicilio desde RD$1,000. Revisar nombres y descripciones de los 6 servicios y dar precios (hoy dicen «Precio: consultar»).' },
    { t: 'Tarifa por distancia', d: 'Cómo se cotiza el domicilio: por zonas, por kilómetro o caso a caso.' },
    { t: 'Duración de cada servicio', d: 'Aparece «Por confirmar» en el detalle de cada servicio.' },
    { t: 'Figuras reconocidas', d: 'Fotos, nombres y permiso de uso. Hay 2 espacios pendientes en el filtro «Reconocidos» de la galería.' },
    { t: 'Foto con Estrellas', d: 'Confirmar el contexto de la foto y el permiso de la persona que aparece con Yeron.' },
    { t: 'Retrato con guante', d: '¿Es Yeron o un cliente? Se usa sin nombre en el cierre de la página. Confirmar permiso de uso.' },
    { t: 'Permiso de los clientes', d: 'Autorización de las personas que aparecen en la galería de resultados.' },
    { t: 'Historia de Yeron (opcional)', d: 'Desde cuándo corta, dónde empezó, en qué se especializa.' },
    { t: 'Pagos y visitas sin cita', d: 'Métodos de pago aceptados y si atiende sin reservar.' },
    { t: 'WhatsApp para reservas', d: 'Confirmar que +1 829-337-4594 recibe reservas y cotizaciones de domicilio.' },
    { t: 'Fotos en mejor resolución', d: 'Las actuales vienen de Instagram (máx. 1024 px).' },
    { t: 'Cifras de Instagram', d: '350 publicaciones y 2,707 seguidores según la revisión del perfil. Se muestran como «350+» y «2,700+».' },
    { t: 'Testimonios', d: 'No se agregaron reseñas: solo con capturas reales y autorización.' },
    { t: 'Dominio y publicación', d: 'Sin dominio ni despliegue todavía.' },
  ];

  const COLORES = [
    ['--noche', '#0A1220', 'Hero, domicilio, horario, pie', 'Texto blanco 17,1:1'],
    ['--marmol', '#F3F2EF', 'Fondo claro (paredes de mármol)', 'Tinta 16,2:1'],
    ['--blanco', '#FFFFFF', 'Servicios, reserva, contacto', 'Tinta 17,7:1'],
    ['--rojo', '#D42A31', 'Botón principal, íconos, script', 'Texto blanco 5,0:1'],
    ['--rojo-hover', '#B51F26', 'Hover y texto rojo sobre claro', '5,9:1 sobre mármol'],
    ['--azul', '#1F7FC4', 'Poste, anillo de foco', '4,3:1 sobre blanco'],
    ['--vena', '#C9B28A', 'Eyebrows y líneas sobre noche', '9,1:1 sobre noche'],
    ['--vena-oscura', '#7A6440', 'Eyebrows sobre mármol', '5,0:1'],
    ['--pizarra', '#4A5363', 'Texto secundario sobre claro', '6,9:1 sobre mármol'],
    ['--niebla', '#AEB7C5', 'Texto secundario sobre noche', '9,3:1'],
    ['--whatsapp', '#157F45', 'Botones de WhatsApp', 'Texto blanco 5,1:1'],
    ['--negro', '#030303', 'CTA final (fondo del retrato)', 'Texto blanco 20:1'],
  ];

  const flecha = '<svg class="btn__flecha" aria-hidden="true"><use href="#i-flecha"/></svg>';
  const html = document.documentElement;

  /* ---------------- Interfaz ---------------- */
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'rev-boton';
  boton.setAttribute('aria-expanded', 'false');
  boton.setAttribute('aria-controls', 'rev-panel');
  boton.innerHTML = '<span class="rev-boton__punto" aria-hidden="true"></span>Revisión';

  const panel = document.createElement('aside');
  panel.id = 'rev-panel';
  panel.className = 'rev-panel';
  panel.setAttribute('aria-label', 'Herramientas de revisión del prototipo');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="rev-cabeza">
      <div><p class="rev-kicker">Prototipo · WebDom</p><h2>Revisión de Yeron Barbershop</h2></div>
      <button type="button" class="rev-cerrar" data-rev-cerrar aria-label="Cerrar revisión">×</button>
    </header>
    <div class="rev-tabs" role="tablist" aria-label="Secciones de revisión">
      <button type="button" role="tab" id="rev-t-mov" aria-controls="rev-p-mov" aria-selected="true">Movimiento <span class="rev-badge">${NOTAS.length}</span></button>
      <button type="button" role="tab" id="rev-t-pen" aria-controls="rev-p-pen" aria-selected="false" tabindex="-1">Por confirmar <span class="rev-badge rev-badge--ambar">${PENDIENTES.length}</span></button>
      <button type="button" role="tab" id="rev-t-sis" aria-controls="rev-p-sis" aria-selected="false" tabindex="-1">Sistema</button>
    </div>
    <div class="rev-cuerpo">
      <section class="rev-seccion" id="rev-p-mov" role="tabpanel" aria-labelledby="rev-t-mov">
        <label class="rev-switch"><input type="checkbox" data-rev-marcadores><span></span>Mostrar marcadores numerados en la página</label>
        <p class="rev-ayuda">Toca una nota para ir al elemento. Todas las animaciones usan transform, opacity, filter o clip-path y se desactivan con «reducir movimiento».</p>
        <ol class="rev-notas">
          ${NOTAS.map((n) => `<li><button type="button" data-rev-ir="${n.n}"><span class="rev-num">${n.n}</span><span><strong>${n.titulo}</strong>${n.texto}</span></button></li>`).join('')}
        </ol>
      </section>
      <section class="rev-seccion" id="rev-p-pen" role="tabpanel" aria-labelledby="rev-t-pen" hidden>
        <label class="rev-switch"><input type="checkbox" data-rev-resaltar><span></span>Resaltar en la página lo que falta confirmar</label>
        <h3>Para confirmar con Yeron</h3>
        <ul class="rev-pendientes">
          ${PENDIENTES.map((p) => `<li><strong>${p.t}</strong>${p.d}</li>`).join('')}
        </ul>
        <h3>Marcas «por confirmar» en la página</h3>
        <ul class="rev-marcas" data-rev-marcas></ul>
      </section>
      <section class="rev-seccion" id="rev-p-sis" role="tabpanel" aria-labelledby="rev-t-sis" hidden>
        <h3>Color</h3>
        <ul class="rev-colores">
          ${COLORES.map(([v, hex, uso, cr]) => `<li><span class="rev-muestra" style="background:${hex}"></span><span><code>${v}</code> ${hex}<small>${uso} · ${cr}</small></span></li>`).join('')}
        </ul>
        <p class="rev-ayuda">Franjas del poste: <code>repeating-linear-gradient(45deg)</code> rojo · blanco · azul · blanco con período <code>--p</code> y mosaico de p·√2 para que el giro no tenga saltos.</p>
        <div class="rev-poste-demo" aria-hidden="true"><span class="poste" style="--p:16px"><span class="poste__cilindro"></span></span></div>

        <h3>Tipografía</h3>
        <div class="rev-tipo">
          <p class="rev-tipo__display">Flow <span>de la mata</span></p>
          <p><strong>Archivo</strong> 850–900, ancho 72–82 %, mayúsculas: títulos, botones, cifras. <strong>Yellowtail</strong>: acentos en script (camiseta de béisbol). <strong>Schibsted Grotesk</strong> 400–700: texto e interfaz.</p>
          <p>Escala fluida: H1 6,5 → 15 rem · H2 2,35 → 4,3 rem · entrada 1,06 → 1,25 rem · texto 17 px (16 px en móvil) · eyebrow 12,5 px con 0,22 em de interletrado.</p>
        </div>

        <h3>Botones · 7 estados</h3>
        <div class="rev-demo rev-botones">
          <div><span class="rev-etq">Normal</span><span class="btn btn--rojo"><span class="btn__texto">Reservar turno</span>${flecha}</span></div>
          <div><span class="rev-etq">Hover</span><span class="btn btn--rojo rev-hover"><span class="btn__texto">Reservar turno</span>${flecha}</span></div>
          <div><span class="rev-etq">Active</span><span class="btn btn--rojo rev-active"><span class="btn__texto">Reservar turno</span>${flecha}</span></div>
          <div><span class="rev-etq">Focus</span><span class="btn btn--rojo rev-focus"><span class="btn__texto">Reservar turno</span>${flecha}</span></div>
          <div><span class="rev-etq">Loading</span><span class="btn btn--whatsapp is-loading"><svg class="btn__icono" aria-hidden="true"><use href="#i-chat"/></svg><span class="btn__texto">Enviar por WhatsApp</span><span class="btn__carga" aria-hidden="true"><span class="poste"><span class="poste__cilindro"></span></span></span></span></div>
          <div><span class="rev-etq">Success</span><span class="btn btn--linea is-success"><svg class="btn__icono" aria-hidden="true"><use href="#i-check"/></svg><span class="btn__texto">Copiado</span></span></div>
          <div><span class="rev-etq">Disabled</span><button class="btn btn--fantasma" type="button" disabled><svg class="btn__flecha btn__flecha--izq" aria-hidden="true"><use href="#i-flecha-izq"/></svg><span class="btn__texto">Atrás</span></button></div>
        </div>
        <p class="rev-ayuda">Hover: sube 2 px, sombra del color del botón, la flecha avanza 4 px (250 ms). Active: escala 0,97 (80 ms). Focus: anillo azul de 3 px con separación de 3 px (<code>:focus-visible</code>). Loading: el texto se oculta y gira un poste. Success: verde con check que rebota (2,2 s). Disabled: gris, sin sombra ni movimiento.</p>
        <div class="rev-demo rev-variantes">
          <span class="btn btn--rojo btn--chico"><span class="btn__texto">Rojo</span></span>
          <span class="btn btn--tinta btn--chico"><span class="btn__texto">Tinta</span></span>
          <span class="btn btn--linea btn--chico"><span class="btn__texto">Línea</span></span>
          <span class="btn btn--whatsapp btn--chico"><span class="btn__texto">WhatsApp</span></span>
          <span class="rev-oscuro"><span class="btn btn--linea-clara btn--chico"><span class="btn__texto">Línea clara</span></span><span class="btn btn--claro btn--chico"><span class="btn__texto">Claro</span></span></span>
        </div>

        <h3>Espacio, forma y movimiento</h3>
        <ul class="rev-lista">
          <li><strong>Contenedor</strong> 1280 px · margen lateral 16 → 56 px · secciones 76 → 136 px de alto de relleno.</li>
          <li><strong>Radios</strong> 2 / 4 / 10 px y píldora: bordes rectos como la plantilla de referencia; la forma redonda queda para cápsulas, sellos y píldoras.</li>
          <li><strong>Sombras</strong> dos niveles, teñidas con azul noche.</li>
          <li><strong>Curvas</strong> principal <code>cubic-bezier(.22, 1, .36, 1)</code>; escritura del script <code>cubic-bezier(.65, 0, .35, 1)</code>.</li>
          <li><strong>Duraciones</strong> micro 200–250 ms · componentes 350–550 ms · entradas 0,9–1,2 s.</li>
          <li><strong>Puntos de corte</strong> 1180 · 1080 (menú) · 900 (una columna) · 640 (móvil) · 380 px.</li>
        </ul>
      </section>
    </div>`;

  const capa = document.createElement('div');
  capa.className = 'rev-capa';
  capa.hidden = true;
  const pop = document.createElement('div');
  pop.className = 'rev-pop';
  pop.hidden = true;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Nota de movimiento');

  document.body.append(boton, panel, capa, pop);

  /* ---------------- Panel ---------------- */
  const abrirPanel = (abrir) => {
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    html.classList.toggle('rev-abierto', abrir);
    if (abrir) { pintarMarcas(); panel.querySelector('[role="tab"][aria-selected="true"]').focus(); }
    else boton.focus();
  };
  boton.addEventListener('click', () => abrirPanel(panel.hidden));
  panel.querySelector('[data-rev-cerrar]').addEventListener('click', () => abrirPanel(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!pop.hidden) { pop.hidden = true; return; }
    if (!panel.hidden && panel.contains(document.activeElement)) abrirPanel(false);
  });

  const tabs = Array.from(panel.querySelectorAll('[role="tab"]'));
  const activarTab = (tab) => {
    tabs.forEach((t) => {
      const sel = t === tab;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      panel.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !sel;
    });
    if (tab.id === 'rev-t-pen') pintarMarcas();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activarTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      activarTab(sig);
      sig.focus();
    });
  });

  /* ---------------- Marcadores de movimiento ---------------- */
  let marcadoresOn = false;
  let pendiente = false;
  const pines = [];
  const construirPines = () => {
    capa.innerHTML = '';
    pines.length = 0;
    NOTAS.forEach((n) => {
      const el = document.querySelector(`[data-nota="${n.n}"]`);
      if (!el) return;
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'rev-pin';
      pin.textContent = n.n;
      pin.setAttribute('aria-label', `Nota ${n.n}: ${n.titulo}`);
      pin.addEventListener('click', (e) => { e.stopPropagation(); mostrarPop(n, pin); });
      capa.appendChild(pin);
      pines.push({ pin, el });
    });
  };
  const posicionar = () => {
    pendiente = false;
    pines.forEach(({ pin, el }) => {
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.height > 0 && !el.closest('[hidden]');
      pin.hidden = !visible;
      if (!visible) return;
      const top = Math.min(Math.max(r.top + 6, 6), window.innerHeight - 34);
      pin.style.transform = `translate(${Math.round(Math.max(r.left + 6, 6))}px, ${Math.round(top)}px)`;
      pin.style.opacity = r.bottom < 0 || r.top > window.innerHeight ? '0' : '1';
    });
  };
  const pedir = () => { if (marcadoresOn && !pendiente) { pendiente = true; requestAnimationFrame(posicionar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  const activarMarcadores = (on) => {
    marcadoresOn = on;
    capa.hidden = !on;
    pop.hidden = true;
    panel.querySelector('[data-rev-marcadores]').checked = on;
    if (on) { construirPines(); posicionar(); }
  };
  panel.querySelector('[data-rev-marcadores]').addEventListener('change', (e) => activarMarcadores(e.target.checked));

  const mostrarPop = (n, ancla) => {
    pop.innerHTML = `<p class="rev-pop__num">Nota ${n.n}</p><h4>${n.titulo}</h4><p>${n.texto}</p><button type="button" class="rev-pop__cerrar" aria-label="Cerrar nota">×</button>`;
    pop.hidden = false;
    const r = ancla.getBoundingClientRect();
    const ancho = Math.min(340, window.innerWidth - 24);
    pop.style.width = `${ancho}px`;
    const x = Math.min(Math.max(12, r.left), window.innerWidth - ancho - 12);
    const y = r.bottom + 10 + pop.offsetHeight > window.innerHeight ? Math.max(12, r.top - pop.offsetHeight - 10) : r.bottom + 10;
    pop.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    pop.querySelector('.rev-pop__cerrar').addEventListener('click', () => { pop.hidden = true; ancla.focus(); });
  };
  document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target)) pop.hidden = true; });

  const destacar = (el) => {
    el.classList.remove('rev-destello');
    void el.offsetWidth;
    el.classList.add('rev-destello');
    setTimeout(() => el.classList.remove('rev-destello'), 1800);
  };
  panel.querySelectorAll('[data-rev-ir]').forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.revIr);
    const el = document.querySelector(`[data-nota="${n}"]`);
    if (!el) return;
    if (!marcadoresOn) activarMarcadores(true);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    destacar(el);
    if (window.innerWidth < 760) abrirPanel(false);
  }));

  /* ---------------- Pendientes ---------------- */
  panel.querySelector('[data-rev-resaltar]').addEventListener('change', (e) => html.classList.toggle('rev-resaltar', e.target.checked));
  function pintarMarcas() {
    const lista = panel.querySelector('[data-rev-marcas]');
    const vistos = new Set();
    const items = [];
    document.querySelectorAll('[data-pendiente]').forEach((el, i) => {
      if (panel.contains(el)) return;
      const etiqueta = el.getAttribute('data-pendiente');
      const oculto = !!el.closest('[hidden]');
      const clave = `${etiqueta}|${oculto}`;
      if (oculto && vistos.has(clave)) return;
      vistos.add(clave);
      items.push(`<li><span>${etiqueta}</span>${oculto ? '<em>En un panel cerrado (detalle o filtro)</em>' : `<button type="button" data-rev-marca="${i}">Ir</button>`}</li>`);
    });
    lista.innerHTML = items.join('');
    const todos = Array.from(document.querySelectorAll('[data-pendiente]'));
    lista.querySelectorAll('[data-rev-marca]').forEach((b) => b.addEventListener('click', () => {
      const el = todos[Number(b.dataset.revMarca)];
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      destacar(el);
      if (window.innerWidth < 760) abrirPanel(false);
    }));
  }
})();
