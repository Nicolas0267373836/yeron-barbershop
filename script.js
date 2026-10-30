/* ==========================================================================
   Yeron Barbershop — interacciones
   Los datos editables están al principio: negocio, horario, servicios y
   galería. Todo lo demás los lee de aquí, así que no hay que tocar el HTML
   para cambiar un servicio o una foto.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     DATOS EDITABLES
     ------------------------------------------------------------------------ */
  const NEGOCIO = {
    nombre: 'Yeron Barbershop',
    whatsapp: '18293374594',               // wa.me: código de país + número, sin «+»
    whatsappVisible: '+1 829-337-4594',
    instagram: 'https://www.instagram.com/yeron_barber/',
    direccion: 'Av. Presidente Enríquez, al lado de Plaza Jorge, San Pedro de Macorís', // ortografía de la avenida: por confirmar
    domicilioDesde: 'RD$1,000',
    utcOffset: -4,                          // República Dominicana: UTC−4 todo el año
  };

  // 0 = domingo … 6 = sábado · null = por confirmar · horas en formato 24 h
  const HORARIO = {
    0: { abre: 8, cierra: 21, modo: 'barberia' },   // domingo: igual que los demás días (confirmado)
    1: { abre: 8, cierra: 21, modo: 'barberia' },
    2: { abre: 8, cierra: 21, modo: 'barberia' },
    3: { abre: 8, cierra: 21, modo: 'domicilio' },  // miércoles: 100 % a domicilio
    4: { abre: 8, cierra: 21, modo: 'barberia' },
    5: { abre: 8, cierra: 21, modo: 'barberia' },
    6: { abre: 8, cierra: 21, modo: 'barberia' },   // sábado: igual que los demás días (confirmado)
  };

  // Servicios y precios: lista impresa de la barbería (foto del menú, oct-2026).
  // precio: null = «Precio: consultar». Sin foto propia, la ventana de detalle se muestra sin imagen.
  const SERVICIOS = [
    {
      id: 'lavado', nombre: 'Lavado de pelo', icono: 'i-bola', precio: 'RD$400',
      resumen: 'Lavado de pelo en la barbería.',
      texto: 'Lavado de pelo para salir fresco de la silla, solo o junto con tu corte.',
      incluye: ['Lavado de pelo', 'Se puede sumar a cualquier corte'],
    },
    {
      id: 'corte-adulto', nombre: 'Corte de adulto', icono: 'i-maquina', precio: 'RD$500',
      resumen: 'Skin, low, mid o high: el degradado que va con tu estilo.',
      texto: 'Degradado a la altura que elijas, parejo de lado a lado y con el contorno definido al final.',
      incluye: ['Te pregunta cómo lo quieres y revisa tu tipo de pelo', 'Degradado a la altura que elijas', 'Perfilado de frente, patillas y nuca'],
      foto: 'images/cortes/fade-con-raya.webp', alt: 'Ejemplo de fade con raya marcada y barba corta',
    },
    {
      id: 'corte-barba', nombre: 'Corte con barba / afeitada', icono: 'i-tijera', precio: 'RD$600',
      resumen: 'El servicio completo: corte y barba o afeitada.',
      texto: 'Corte con el degradado que elijas y barba recortada y perfilada, o afeitada, en una sola visita.',
      incluye: ['Corte con el degradado que elijas', 'Barba recortada y perfilada, o afeitada', 'Perfilado final de todo el contorno'],
      foto: 'images/cortes/twists-y-barba.webp', alt: 'Ejemplo de corte con twists, laterales degradados y barba completa',
    },
    {
      id: 'cejas', nombre: 'Chicas cejas', icono: 'i-navaja', precio: 'RD$100',
      resumen: 'Arreglo de cejas.',
      texto: 'Arreglo de cejas para completar tu corte.',
      incluye: ['Arreglo de cejas', 'Se puede sumar a cualquier corte'],
    },
    {
      id: 'corte-ninos', nombre: 'Corte de niños', icono: 'i-personas', precio: 'RD$300',
      resumen: 'Corte para los más pequeños.',
      texto: 'Corte de niños. Si el niño no deja recortarse, se cobran RD$200 por el atraso del servicio.',
      incluye: ['Corte para niños', 'Política: RD$200 de atraso si no deja recortarlo'],
    },
    {
      id: 'tintado-cejas', nombre: 'Tintado de cejas', icono: 'i-navaja', precio: 'RD$400',
      resumen: 'Color para las cejas.',
      texto: 'Tintado de cejas para darles más definición.',
      incluye: ['Tintado de cejas', 'Se puede sumar a cualquier corte'],
    },
    {
      id: 'rayas', nombre: 'Rayas', icono: 'i-peine', precio: 'Costo adicional',
      resumen: 'Raya marcada y detalles a tu gusto.',
      texto: 'Una raya marcada al lado o un detalle sobre el degradado para darle personalidad al corte. Tiene un costo adicional al del corte.',
      incluye: ['Raya del lado que prefieras', 'Detalles sobre el degradado', 'Se combina con cualquier corte'],
      foto: 'images/cortes/fade-con-raya.webp', alt: 'Ejemplo de raya marcada al lado sobre un fade bajo',
    },
    {
      id: 'faciales', nombre: 'Servicios de faciales', icono: 'i-estrella', precio: 'RD$600',
      resumen: 'Cuidado facial en la barbería.',
      texto: 'Servicios de faciales para cuidar la piel del rostro.',
      incluye: ['Servicio de faciales', 'Se puede sumar a cualquier corte'],
    },
    {
      id: 'domicilio', nombre: 'A domicilio', icono: 'i-casa', destacado: true,
      get precio() { return `Desde ${NEGOCIO.domicilioDesde}`; },   // la tarifa se cambia desde el panel
      resumen: 'Solo los miércoles. Yeron va a tu casa.',
      get texto() { return `Los miércoles Yeron trabaja 100 % a domicilio. El traslado es ${NEGOCIO.domicilioDesde} y se agrega un costo adicional según la distancia.`; },
      get incluye() { return ['El servicio que elijas, en tu casa', `Traslado desde ${NEGOCIO.domicilioDesde}`, 'Costo adicional según la distancia']; },
    },
  ];

  // cats: fades · barba · texturas · reconocidos. pendiente: espacio para una foto aún no entregada
  const GALERIA = [
    { src: 'images/cortes/fade-con-raya.webp', w: 601, h: 887, titulo: 'Fade con raya', etiqueta: 'Fades', cats: ['fades'],
      alt: 'Cliente con fade bajo, raya marcada al lado y barba corta perfilada, frente a una pared de mármol' },
    { src: 'images/cortes/twists-y-barba.webp', w: 552, h: 666, titulo: 'Twists y barba', etiqueta: 'Texturas · Barba', cats: ['texturas', 'barba'],
      alt: 'Cliente de perfil con twists arriba, laterales degradados y barba completa perfilada' },
    { src: 'images/cortes/high-fade-y-barba.webp', w: 552, h: 667, titulo: 'High fade y barba', etiqueta: 'Fades · Barba', cats: ['fades', 'barba'],
      alt: 'Cliente de perfil con degradado alto, rizos arriba y barba tupida con contorno definido' },
    { src: 'images/cortes/taper-con-rizos.webp', w: 582, h: 872, titulo: 'Taper con rizos', etiqueta: 'Fades · Texturas', cats: ['fades', 'texturas'],
      alt: 'Cliente con rizos definidos arriba, taper en los laterales, perfilado limpio y chivita' },
    { src: 'images/yeron-con-estrellas.webp', w: 697, h: 931, titulo: 'Con Estrellas', etiqueta: 'Reconocidos', cats: ['reconocidos'], reconocido: true,
      alt: 'Yeron con chaleco portaherramientas de barbero y un maletín de Estrellas, junto a una persona con gorra de Estrellas' },
    { pendiente: true, cats: ['reconocidos'], titulo: 'Foto con figura reconocida', nota: 'Pendiente: foto, nombre y permiso de uso.' },
    { pendiente: true, cats: ['reconocidos'], titulo: 'Foto con figura reconocida', nota: 'Pendiente: foto, nombre y permiso de uso.' },
  ];

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mqReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqEscritorio = window.matchMedia('(min-width: 900px)');
  const mqMovil = window.matchMedia('(max-width: 767px)');
  const reducido = () => mqReducido.matches;
  const suave = () => (reducido() ? 'auto' : 'smooth');
  const alCambiar = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const NBSP = ' ';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pad = (n) => String(n).padStart(2, '0');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /** Fecha y hora actuales en República Dominicana (sin depender de la zona del visitante). */
  const ahoraRD = () => {
    const d = new Date(Date.now() + NEGOCIO.utcOffset * 3600000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay(), h: d.getUTCHours(), min: d.getUTCMinutes() };
  };
  const diaRD = (base, n) => new Date(Date.UTC(base.y, base.m, base.d + n));
  const claveFecha = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
  const fechaLarga = (dt) => `${DIAS[dt.getUTCDay()]} ${dt.getUTCDate()} de ${MESES[dt.getUTCMonth()]}`;
  const formatoHora = (h, plano = false) => {
    const e = plano ? ' ' : NBSP;
    if (h === 12) return `12:00${e}m.`;
    return h < 12 ? `${h}:00${e}a.${e}m.` : `${h - 12}:00${e}p.${e}m.`;
  };
  const waLink = (texto) => `https://wa.me/${NEGOCIO.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
  const icono = (id, clase = '') => `<svg${clase ? ` class="${clase}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;

  // Bloqueo de scroll compartido por menú, modal y lightbox
  let bloqueos = 0;
  const bloquearScroll = (activar) => {
    bloqueos = Math.max(0, bloqueos + (activar ? 1 : -1));
    const root = document.documentElement;
    if (bloqueos > 0) {
      const barra = window.innerWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      if (barra > 0) root.style.paddingRight = `${barra}px`;
    } else {
      root.style.overflow = '';
      root.style.paddingRight = '';
    }
  };

  const enfocables = (cont) => $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', cont)
    .filter((el) => el.getClientRects().length > 0 && !el.closest('[hidden]'));
  const atraparFoco = (cont, e) => {
    if (e.key !== 'Tab') return;
    const f = enfocables(cont);
    if (!f.length) return;
    const primero = f[0];
    const ultimo = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === primero || !cont.contains(document.activeElement))) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  };

  // Aviso breve
  const toastEl = $('[data-toast]');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  };

  // Copiar al portapapeles (con alternativa para navegadores que lo bloquean)
  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (err) {
      try {
        const ta = document.createElement('textarea');
        ta.value = texto;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (err2) {
        return false;
      }
    }
  };
  const marcarExito = (btn, texto = 'Copiado') => {
    const t = $('.btn__texto', btn);
    const uso = $('use', btn);
    const textoOriginal = t ? t.textContent : '';
    const iconoOriginal = uso ? uso.getAttribute('href') : '';
    btn.classList.add('is-success');
    if (t) t.textContent = texto;
    if (uso) uso.setAttribute('href', '#i-check');
    clearTimeout(btn._exito);
    btn._exito = setTimeout(() => {
      btn.classList.remove('is-success');
      if (t) t.textContent = textoOriginal;
      if (uso) uso.setAttribute('href', iconoOriginal);
    }, 2200);
  };

  // Errores de campo
  const marcarError = (campo, msg) => {
    if (!campo) return;
    campo.classList.remove('is-error', 'is-ok');
    void campo.offsetWidth; // reinicia la vibración
    campo.classList.add('is-error');
    const err = $('.campo__error', campo);
    if (err) err.textContent = msg;
    const input = $('input, select, textarea', campo);
    if (input) input.setAttribute('aria-invalid', 'true');
  };
  const limpiarError = (campo, ok = false) => {
    if (!campo) return;
    campo.classList.remove('is-error');
    campo.classList.toggle('is-ok', ok);
    const err = $('.campo__error', campo);
    if (err) err.textContent = '';
    const input = $('input, select, textarea', campo);
    if (input) input.removeAttribute('aria-invalid');
  };
  const vibrar = (el) => {
    if (!el || reducido()) return;
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
  };

  // Estado compartido
  let proximoMiercoles = null;
  let reserva = null;

  /* ------------------------------------------------------------------------
     Datos en vivo (funciones /api + Neon): horario, días cerrados, aviso, tarifa y horas ocupadas.
     Si config.js tiene «api» vacío, o la API no responde, la web funciona sola con los datos de arriba.
     El navegador nunca ve la base de datos: solo habla con /api.
     ------------------------------------------------------------------------ */
  const CFG = window.YERON_CONFIG || {};
  const enVivo = Boolean(CFG.api);
  const CIERRES = {};            // 'AAAA-MM-DD' → { tipo: 'feriado' | 'cerrado', motivo }
  const OCUPADAS = new Set();    // 'AAAA-MM-DD|hora'
  const AVISO = { activo: false, texto: '' };
  let horarioEnVivo = false;
  let repintarEstado = null;
  let ultimaCarga = 0;
  const esDiaDomicilio = (dow) => Boolean(HORARIO[dow] && HORARIO[dow].modo === 'domicilio');

  const api = async (ruta, { metodo = 'GET', cuerpo, espera = 6000 } = {}) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), espera);
    try {
      const r = await fetch(`${String(CFG.api).replace(/\/$/, '')}/${ruta}`, {
        method: metodo,
        headers: cuerpo ? { 'Content-Type': 'application/json' } : {},
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
        signal: ctl.signal,
      });
      const texto = await r.text();
      let datos = null;
      try { datos = texto ? JSON.parse(texto) : null; } catch (err) { datos = null; }
      if (!r.ok) {
        const e = new Error((datos && datos.error) || `http_${r.status}`);
        e.codigo = (datos && datos.error) || '';
        e.status = r.status;
        throw e;
      }
      return datos;
    } finally { clearTimeout(t); }
  };

  const aplicarHorario = (filas) => {
    filas.forEach((f) => {
      if (f.dow < 0 || f.dow > 6) return;
      if (f.modo === 'barberia' || f.modo === 'domicilio') HORARIO[f.dow] = { abre: f.abre, cierra: f.cierra, modo: f.modo };
      else if (f.modo === 'cerrado') HORARIO[f.dow] = { abre: 0, cierra: 0, modo: 'cerrado' };
      else HORARIO[f.dow] = null;
    });
  };
  const aplicarCierres = (filas) => {
    Object.keys(CIERRES).forEach((k) => delete CIERRES[k]);
    filas.forEach((f) => { CIERRES[f.fecha] = { tipo: f.tipo, motivo: f.motivo || '' }; });
  };
  const aplicarOcupadas = (filas) => {
    OCUPADAS.clear();
    filas.forEach((f) => OCUPADAS.add(`${f.fecha}|${f.hora}`));
  };
  const aplicarConfig = (f) => {
    NEGOCIO.domicilioDesde = `RD$${miles(f.domicilio_desde)}`;
    AVISO.activo = Boolean(f.aviso_activo && f.aviso);
    AVISO.texto = f.aviso || '';
  };

  /** Frase para un día cerrado: «cerrado por feriado», «cerrado (motivo)». */
  const frasePorCierre = (c) => `cerrado${c.motivo ? ` (${c.motivo})` : (c.tipo === 'feriado' ? ' por feriado' : '')}`;
  const cierresProximos = (dias = 14) => {
    const ahora = ahoraRD();
    const lista = [];
    for (let k = 0; k < dias; k += 1) {
      const dt = diaRD(ahora, k);
      const c = CIERRES[claveFecha(dt)];
      if (c) lista.push({ k, dt, c });
    }
    return lista;
  };

  const pintarPrecios = () => {
    $$('[data-precio-domicilio]').forEach((el) => { el.textContent = NEGOCIO.domicilioDesde; });
    $$('[data-precio-domicilio-desde]').forEach((el) => { el.textContent = `Desde ${NEGOCIO.domicilioDesde}`; });
  };
  const pintarTabla = () => {
    const tb = $('[data-horario-filas]');
    if (!tb || !horarioEnVivo) return;
    tb.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const h = HORARIO[d];
      let celda;
      if (!h) celda = `<span class="chip-pendiente" data-pendiente="Horario de ${DIAS[d]}">Por confirmar</span>`;
      else if (h.modo === 'cerrado') celda = 'Cerrado';
      else if (h.modo === 'domicilio') celda = `<span class="chip chip--rojo">100${NBSP}%${NBSP}a${NBSP}domicilio</span>`;
      else celda = `${formatoHora(h.abre)}–${formatoHora(h.cierra)}`;
      return `<tr data-dia="${d}"><th scope="row">${cap(DIAS[d])}</th><td>${celda}</td></tr>`;
    }).join('');
  };
  const pintarResumenHorario = () => {
    const el = $('[data-horario-resumen]');
    if (!el || !horarioEnVivo) return;
    const dias = [1, 2, 3, 4, 5, 6, 0].filter((d) => HORARIO[d] && HORARIO[d].modo === 'barberia');
    if (!dias.length) { el.textContent = 'Horario por confirmar'; return; }
    const nombres = dias.map((d, i) => (i === 0 ? cap(DIAS_CORTOS[d]) : DIAS_CORTOS[d]));
    const lista = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0];
    const horas = new Set(dias.map((d) => `${HORARIO[d].abre}-${HORARIO[d].cierra}`));
    el.textContent = horas.size === 1
      ? `${lista} · ${formatoHora(HORARIO[dias[0]].abre)}–${formatoHora(HORARIO[dias[0]].cierra)}`
      : `${lista} · horario según el día`;
  };
  const pintarAvisos = () => {
    const cont = $('[data-avisos]');
    if (!cont) return;
    const items = [];
    if (AVISO.activo) items.push(AVISO.texto);
    cierresProximos(14).forEach(({ k, dt, c }) => {
      const cuando = `${k === 0 ? 'Hoy, ' : k === 1 ? 'Mañana, ' : ''}${fechaLarga(dt)}`;
      items.push(`${cap(cuando)}: ${frasePorCierre(c)}`);
    });
    $('[data-avisos-lista]', cont).innerHTML = items.map((t) => `<li>${esc(t)}</li>`).join('');
    cont.hidden = items.length === 0;
  };
  const refrescarDatos = () => {
    pintarPrecios();
    pintarTabla();
    pintarResumenHorario();
    pintarAvisos();
    if (repintarEstado) repintarEstado();
    if (reserva && reserva.refrescar) reserva.refrescar();
  };

  const rangoFechas = () => {
    const ahora = ahoraRD();
    return { desde: claveFecha(diaRD(ahora, 0)), hasta: claveFecha(diaRD(ahora, 30)) };
  };
  const cargarOcupadas = async () => {
    if (!enVivo) return;
    const { desde, hasta } = rangoFechas();
    const d = await api(`publico?desde=${desde}&hasta=${hasta}`);
    if (d && Array.isArray(d.ocupadas)) aplicarOcupadas(d.ocupadas);
  };
  const cargarEnVivo = async () => {
    if (!enVivo) return;
    const { desde, hasta } = rangoFechas();
    const d = await api(`publico?desde=${desde}&hasta=${hasta}`);
    if (!d) return;
    if (Array.isArray(d.horario) && d.horario.length) { aplicarHorario(d.horario); horarioEnVivo = true; }
    if (Array.isArray(d.cierres)) aplicarCierres(d.cierres);
    if (d.config) aplicarConfig(d.config);
    if (Array.isArray(d.ocupadas)) aplicarOcupadas(d.ocupadas);
    ultimaCarga = Date.now();
    refrescarDatos();
  };
  const iniciarEnVivo = () => {
    if (!enVivo) return;
    cargarEnVivo().catch(() => {});
    setInterval(() => { if (!document.hidden) cargarEnVivo().catch(() => {}); }, 300000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && Date.now() - ultimaCarga > 60000) cargarEnVivo().catch(() => {});
    });
  };

  /* ------------------------------------------------------------------------
     Carga nítida: desenfoque → nítido cuando la foto termina de cargar
     ------------------------------------------------------------------------ */
  const initNitidas = (scope = document) => {
    $$('img.nitida:not(.is-cargada)', scope).forEach((img) => {
      const listo = () => img.classList.add('is-cargada');
      if (img.complete && img.naturalWidth > 0) listo();
      else {
        img.addEventListener('load', listo, { once: true });
        img.addEventListener('error', listo, { once: true });
      }
    });
  };

  /* ------------------------------------------------------------------------
     Navegación: compactar al hacer scroll, barra de progreso y sección activa
     ------------------------------------------------------------------------ */
  const initNav = () => {
    const nav = $('[data-nav]');
    const barra = $('[data-progreso]');
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const y = window.scrollY;
      if (nav) nav.classList.toggle('is-solida', y > 24);
      if (barra) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        barra.style.setProperty('--progreso', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
      }
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    actualizar();

    // Sección activa: la última cuyo borde superior pasó el 45 % de la pantalla.
    // Se calcula con el scroll (y no con rootMargin) para que funcione también dentro de iframes.
    const enlaces = $$('.nav__menu a[href^="#"]');
    const porId = new Map(enlaces.map((a) => [a.getAttribute('href').slice(1), a]));
    const secciones = $$('main > section[id]');
    let actual = null;
    let pendienteSpy = false;
    const espiar = () => {
      pendienteSpy = false;
      const linea = window.innerHeight * 0.45;
      let activa = null;
      secciones.forEach((s) => { if (s.getBoundingClientRect().top <= linea) activa = s; });
      const a = activa ? porId.get(activa.id) || null : null;
      if (a === actual) return;
      actual = a;
      enlaces.forEach((x) => x.removeAttribute('aria-current'));
      if (a) a.setAttribute('aria-current', 'true');
    };
    window.addEventListener('scroll', () => { if (!pendienteSpy) { pendienteSpy = true; requestAnimationFrame(espiar); } }, { passive: true });
    window.addEventListener('resize', espiar);
    espiar();
  };

  /* ------------------------------------------------------------------------
     Menú móvil
     ------------------------------------------------------------------------ */
  const initMenu = () => {
    const menu = $('[data-menu]');
    const abrirBtn = $('[data-menu-abrir]');
    if (!menu || !abrirBtn) return;
    const cerrarBtn = $('[data-menu-cerrar]', menu);
    $$('.menu-movil__lista a', menu).forEach((a, i) => a.style.setProperty('--i', i));
    let abierto = false;

    const onTecla = (e) => {
      if (e.key === 'Escape') cerrar();
      else atraparFoco(menu, e);
    };
    const abrir = () => {
      abierto = true;
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-abierto')));
      abrirBtn.setAttribute('aria-expanded', 'true');
      bloquearScroll(true);
      document.addEventListener('keydown', onTecla);
      setTimeout(() => cerrarBtn.focus(), 60);
    };
    function cerrar(devolverFoco = true) {
      if (!abierto) return;
      abierto = false;
      menu.classList.remove('is-abierto');
      abrirBtn.setAttribute('aria-expanded', 'false');
      bloquearScroll(false);
      document.removeEventListener('keydown', onTecla);
      setTimeout(() => { if (!abierto) menu.hidden = true; }, reducido() ? 0 : 300);
      if (devolverFoco) abrirBtn.focus();
    }
    abrirBtn.addEventListener('click', abrir);
    cerrarBtn.addEventListener('click', () => cerrar());
    $$('a', menu).forEach((a) => a.addEventListener('click', () => cerrar(false)));
    window.addEventListener('resize', () => { if (abierto && window.innerWidth > 1080) cerrar(false); });
  };

  /* ------------------------------------------------------------------------
     Revelado al hacer scroll (visible en reposo; solo se oculta lo que está
     por debajo del pliegue al cargar)
     ------------------------------------------------------------------------ */
  const initReveal = () => {
    $$('.reveal-grupo').forEach((g) => $$(':scope > .reveal', g).forEach((el, i) => el.style.setProperty('--i', i)));
    if (!('IntersectionObserver' in window) || reducido()) return;
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.remove('reveal--espera');
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    const vh = window.innerHeight;
    $$('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > vh * 0.92) {
        el.classList.add('reveal--espera');
        io.observe(el);
      }
    });
  };

  /* ------------------------------------------------------------------------
     Parallax ligero (solo ≥ 900 px y sin movimiento reducido)
     ------------------------------------------------------------------------ */
  const initParallax = () => {
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let activo = false;
    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      const vh = window.innerHeight;
      els.forEach((el) => {
        const ref = el.parentElement.getBoundingClientRect();
        if (ref.bottom < -300 || ref.top > vh + 300) return;
        const desplazamiento = ref.top + ref.height / 2 - vh / 2;
        const f = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = `translate3d(0, ${(-desplazamiento * f).toFixed(1)}px, 0)`;
      });
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); } };
    const evaluar = () => {
      const debe = mqEscritorio.matches && !reducido();
      if (debe && !activo) {
        activo = true;
        window.addEventListener('scroll', pedir, { passive: true });
        window.addEventListener('resize', pedir);
        calcular();
      } else if (!debe && activo) {
        activo = false;
        window.removeEventListener('scroll', pedir);
        window.removeEventListener('resize', pedir);
        els.forEach((el) => { el.style.transform = ''; });
      }
    };
    evaluar();
    alCambiar(mqEscritorio, evaluar);
    alCambiar(mqReducido, evaluar);
  };

  /* ------------------------------------------------------------------------
     Panel de domicilio: se expande a todo el ancho con el scroll
     ------------------------------------------------------------------------ */
  const initExpandir = () => {
    const sec = $('[data-expandir]');
    const lienzo = sec && $('.domicilio__lienzo', sec);
    if (!lienzo) return;
    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      if (reducido()) { lienzo.style.setProperty('--expandir', '1'); return; }
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      lienzo.style.setProperty('--expandir', p.toFixed(3));
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    calcular();
  };

  /* ------------------------------------------------------------------------
     Cifras: cuentan desde cero al entrar en pantalla
     ------------------------------------------------------------------------ */
  const initContadores = () => {
    const els = $$('[data-contar]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const animar = (el) => {
      const fin = parseInt(el.dataset.contar, 10);
      if (reducido()) { el.textContent = miles(fin); return; }
      const duracion = 1400;
      const t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / duracion);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = miles(Math.round(fin * e));
        if (p < 1) requestAnimationFrame(paso);
      };
      el.textContent = '0';
      requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        animar(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  };

  /* ------------------------------------------------------------------------
     Estado en vivo (hora dominicana), día de hoy en la tabla y próximo miércoles
     ------------------------------------------------------------------------ */
  const initEstado = () => {
    const pintar = () => {
      const ahora = ahoraRD();
      const hora = ahora.h + ahora.min / 60;
      const hoy = HORARIO[ahora.dow];
      const cierreHoy = CIERRES[claveFecha(diaRD(ahora, 0))];
      const cierreManana = CIERRES[claveFecha(diaRD(ahora, 1))];
      let texto;
      let abierto = 'no';
      if (cierreHoy) {
        texto = `Hoy ${frasePorCierre(cierreHoy)}`;
      } else if (!hoy) {
        texto = 'Fin de semana: horario por confirmar';
      } else if (hoy.modo === 'cerrado') {
        texto = 'Hoy cerrado';
      } else if (hoy.modo === 'domicilio') {
        if (hora < hoy.cierra) { texto = 'Hoy miércoles: solo a domicilio'; abierto = 'domicilio'; }
        else texto = `Cerrado · mañana abre a las ${formatoHora(HORARIO[4] ? HORARIO[4].abre : 8)}`;
      } else if (hora < hoy.abre) {
        texto = `Abre hoy a las ${formatoHora(hoy.abre)}`;
      } else if (hora < hoy.cierra) {
        texto = `Abierto ahora · hasta las ${formatoHora(hoy.cierra)}`;
        abierto = 'si';
      } else {
        const manana = HORARIO[(ahora.dow + 1) % 7];
        if (cierreManana) texto = `Cerrado · mañana ${frasePorCierre(cierreManana)}`;
        else if (!manana) texto = 'Cerrado · fin de semana por confirmar';
        else if (manana.modo === 'cerrado') texto = 'Cerrado · mañana no abre';
        else if (manana.modo === 'domicilio') texto = 'Cerrado · mañana miércoles, a domicilio';
        else texto = `Cerrado · mañana abre a las ${formatoHora(manana.abre)}`;
      }
      $$('[data-estado]').forEach((el) => {
        el.dataset.abierto = abierto;
        const t = $('[data-estado-texto]', el);
        if (t) t.textContent = texto;
      });

      $$('[data-horario-filas] tr').forEach((tr) => {
        const esHoy = Number(tr.dataset.dia) === ahora.dow;
        tr.classList.toggle('is-hoy', esHoy);
        const th = $('th', tr);
        let etiqueta = $('.etiqueta-hoy', th);
        if (esHoy && !etiqueta) {
          etiqueta = document.createElement('span');
          etiqueta.className = 'etiqueta-hoy';
          etiqueta.textContent = 'Hoy';
          th.appendChild(etiqueta);
        } else if (!esHoy && etiqueta) etiqueta.remove();
      });

      let delta = (3 - ahora.dow + 7) % 7;
      if (delta === 0 && HORARIO[3] && hora >= HORARIO[3].cierra) delta = 7;
      const mie = diaRD(ahora, delta);
      proximoMiercoles = { fecha: mie, esHoy: delta === 0 };
      const corto = `${mie.getUTCDate()} de ${MESES_CORTOS[mie.getUTCMonth()]}.`;
      $$('[data-proximo-miercoles]').forEach((el) => { el.textContent = delta === 0 ? `Hoy, mié ${corto}` : `Mié ${corto}`; });
      $$('[data-proximo-dia]').forEach((el) => { el.textContent = mie.getUTCDate(); });
      $$('[data-proximo-mes]').forEach((el) => { el.textContent = MESES_CORTOS[mie.getUTCMonth()]; });
      $$('[data-anio]').forEach((el) => { el.textContent = ahora.y; });
      document.dispatchEvent(new CustomEvent('yeron:estado'));
    };
    repintarEstado = pintar;
    pintar();
    setInterval(pintar, 60000);
  };

  /* ------------------------------------------------------------------------
     Servicios y modal de detalle
     ------------------------------------------------------------------------ */
  const initServicios = () => {
    const panel = $('[data-servicios]');
    const modal = $('[data-modal]');
    if (!panel || !modal) return;

    panel.innerHTML = SERVICIOS.map((s) => `
      <button type="button" class="servicio${s.destacado ? ' servicio--destacado' : ''}" data-servicio="${s.id}" id="servicio-${s.id}" aria-haspopup="dialog" aria-label="${esc(s.nombre)}: ver detalle">
        <span class="servicio__icono">${icono(s.icono)}</span>
        ${s.destacado ? '<span class="servicio__etiqueta chip chip--rojo">Solo miércoles</span>' : ''}
        <span class="servicio__nombre">${esc(s.nombre)}</span>
        <span class="servicio__resumen">${esc(s.resumen)}</span>
        <span class="servicio__pie">
          <span class="servicio__precio${s.precio ? '' : ' servicio__precio--consultar'}"${s.precio ? '' : ` data-pendiente="Precio: ${esc(s.nombre)}"`}${s.id === 'domicilio' ? ' data-precio-domicilio-desde' : ''}>${s.precio ? esc(s.precio) : 'Precio: consultar'}</span>
          <span class="servicio__ver">Ver detalle ${icono('i-flecha', 'ico')}</span>
        </span>
      </button>`).join('');

    const caja = $('.modal__caja', modal);
    let origen = null;
    let actual = null;
    let abierto = false;

    const onTecla = (e) => {
      if (e.key === 'Escape') cerrar();
      else atraparFoco(modal, e);
    };
    const abrir = (id, desde) => {
      const s = SERVICIOS.find((x) => x.id === id);
      if (!s) return;
      actual = s;
      origen = desde || null;
      $('[data-modal-titulo]', modal).textContent = s.nombre;
      $('[data-modal-eyebrow]', modal).textContent = s.destacado ? 'Solo los miércoles' : 'Servicio';
      $('[data-modal-texto]', modal).textContent = s.texto;
      $('[data-modal-incluye]', modal).innerHTML = s.incluye.map((i) => `<li>${esc(i)}</li>`).join('');
      $('[data-modal-precio]', modal).innerHTML = s.precio
        ? esc(s.precio)
        : '<span class="chip-pendiente" data-pendiente="Precio del servicio">Consultar</span>';
      const media = $('[data-modal-media]', modal);
      media.innerHTML = s.foto
        ? `<img class="nitida" src="${s.foto}" alt="${esc(s.alt)}">`
        : `<div class="modal__media-icono">${icono(s.icono)}<p>Miércoles<br>a domicilio</p><span class="poste" aria-hidden="true"><span class="poste__cilindro"></span></span></div>`;
      initNitidas(media);
      $('[data-modal-wa]', modal).href = waLink(`Hola, Yeron. Quiero información sobre: ${s.nombre}.`);
      abierto = true;
      modal.hidden = false;
      if (desde) {
        // el detalle crece desde la tarjeta que se tocó
        const rd = desde.getBoundingClientRect();
        const rc = caja.getBoundingClientRect();
        caja.style.setProperty('--origen', `${Math.round(rd.left + rd.width / 2 - rc.left)}px ${Math.round(rd.top + rd.height / 2 - rc.top)}px`);
      }
      bloquearScroll(true);
      requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-abierto')));
      document.addEventListener('keydown', onTecla);
      setTimeout(() => $('.modal__cerrar', modal).focus(), 60);
    };
    function cerrar(despues) {
      if (!abierto) return;
      abierto = false;
      modal.classList.remove('is-abierto');
      document.removeEventListener('keydown', onTecla);
      setTimeout(() => {
        modal.hidden = true;
        bloquearScroll(false);
        if (typeof despues === 'function') despues();
        else if (origen) origen.focus({ preventScroll: true });
      }, reducido() ? 0 : 380);
    }

    panel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-servicio]');
      if (b) abrir(b.dataset.servicio, b);
    });
    $$('[data-modal-cerrar]', modal).forEach((el) => el.addEventListener('click', () => cerrar()));
    $('[data-modal-reservar]', modal).addEventListener('click', () => {
      const id = actual && actual.id;
      cerrar(() => {
        if (reserva && id) reserva.preseleccionar(id);
        const destino = document.getElementById('reservar');
        if (destino) destino.scrollIntoView({ behavior: suave(), block: 'start' });
      });
    });

    // Enlace directo: index.html#servicio-fade abre el detalle
    const abrirDesdeHash = () => {
      const m = window.location.hash.match(/^#servicio-([a-z-]+)$/);
      if (m && SERVICIOS.some((s) => s.id === m[1])) abrir(m[1], document.getElementById(`servicio-${m[1]}`));
    };
    window.addEventListener('hashchange', abrirDesdeHash);
    abrirDesdeHash();
  };

  /* ------------------------------------------------------------------------
     Cotizador del domicilio (miércoles)
     ------------------------------------------------------------------------ */
  const initCotizador = () => {
    const form = $('[data-cotizador]');
    if (!form) return;
    const sector = $('#coti-sector', form);
    const hora = $('#coti-hora', form);
    const salida = $('#coti-personas', form);
    const enviar = $('[data-coti-enviar]', form);
    const burbuja = $('[data-coti-mensaje]', form);
    const menos = $('[data-contador="-1"]', form);
    const mas = $('[data-contador="1"]', form);
    const campoSector = sector.closest('.campo');
    let personas = 1;

    const mensaje = () => {
      const fecha = proximoMiercoles ? fechaLarga(proximoMiercoles.fecha) : 'miércoles';
      const s = sector.value.trim();
      return [
        `Hola, Yeron. Quiero un corte a domicilio el ${fecha}.`,
        `• Sector: ${s || '(escribe tu sector)'}`,
        `• Personas: ${personas}`,
        `• Hora: ${hora.value}`,
        '¿Cuánto sería con la distancia?',
      ].join('\n');
    };
    const actualizar = (destello = false) => {
      const m = mensaje();
      burbuja.textContent = m;
      enviar.href = waLink(m);
      salida.textContent = personas;
      menos.disabled = personas <= 1;
      mas.disabled = personas >= 6;
      if (destello && !reducido()) {
        burbuja.classList.remove('is-actualizado');
        void burbuja.offsetWidth;
        burbuja.classList.add('is-actualizado');
      }
    };
    sector.addEventListener('input', () => { if (campoSector.classList.contains('is-error') && sector.value.trim().length >= 3) limpiarError(campoSector, true); actualizar(true); });
    hora.addEventListener('change', () => actualizar(true));
    [menos, mas].forEach((b) => b.addEventListener('click', () => {
      personas = Math.min(6, Math.max(1, personas + Number(b.dataset.contador)));
      actualizar(true);
    }));
    enviar.addEventListener('click', (e) => {
      if (sector.value.trim().length < 3) {
        e.preventDefault();
        marcarError(campoSector, 'Escribe tu sector o zona para que Yeron calcule la distancia.');
        sector.focus();
        return;
      }
      limpiarError(campoSector, true);
      enviar.href = waLink(mensaje());
      toast('Abriendo WhatsApp con tu mensaje…');
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    document.addEventListener('yeron:estado', () => actualizar(false));
    actualizar(false);
  };

  /* ------------------------------------------------------------------------
     Galería: filtros, carrusel arrastrable y lightbox
     ------------------------------------------------------------------------ */
  const initGaleria = () => {
    const pista = $('[data-pista]');
    if (!pista) return;

    pista.innerHTML = GALERIA.map((g, i) => {
      if (g.pendiente) {
        return `<li class="foto-item" data-cats="${g.cats.join(' ')}" data-pendiente-item hidden>
          <div class="foto-card foto-card--pendiente" data-pendiente="Foto con figura reconocida: nombre y permiso de uso">
            ${icono('i-camara')}
            <strong>${esc(g.titulo)}</strong>
            <p>${esc(g.nota)}</p>
            <span class="poste" aria-hidden="true"><span class="poste__cilindro"></span></span>
          </div></li>`;
      }
      return `<li class="foto-item" data-cats="${g.cats.join(' ')}">
        <button type="button" class="foto-card" data-foto="${i}" aria-label="Ampliar foto: ${esc(g.alt)}">
          <img class="nitida" src="${g.src}" width="${g.w}" height="${g.h}" alt="" loading="lazy" draggable="false">
          ${g.reconocido ? `<span class="foto-card__sello">${icono('i-estrella')}Reconocido</span>` : ''}
          <span class="foto-card__zoom">${icono('i-ampliar')}</span>
          <span class="foto-card__meta"><span class="foto-card__titulo">${esc(g.titulo)}</span><span class="foto-card__cat">${esc(g.etiqueta)}</span></span>
        </button></li>`;
    }).join('');
    initNitidas(pista);

    const filtros = $('[data-filtros]');
    const pildora = filtros && $('.filtros__pildora', filtros);
    const botones = filtros ? $$('[data-filtro]', filtros) : [];
    const barra = $('[data-carrusel-barra]');
    const actualEl = $('[data-carrusel-actual]');
    const totalEl = $('[data-carrusel-total]');
    const prev = $('[data-carrusel-prev]');
    const sig = $('[data-carrusel-sig]');

    const visibles = () => $$('.foto-item:not([hidden])', pista);
    const paso = () => {
      const v = visibles();
      if (!v.length) return 300;
      const gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return v[0].getBoundingClientRect().width + gap;
    };
    const actualizarControles = () => {
      const v = visibles();
      const max = pista.scrollWidth - pista.clientWidth;
      const alFinal = pista.scrollLeft >= max - 4;
      // rango de fotos que se ven completas: «01–03 / 05»
      const rp = pista.getBoundingClientRect();
      let primero = -1;
      let ultimo = -1;
      v.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        if (r.left >= rp.left - 2 && r.right <= rp.right + 2) { if (primero < 0) primero = i; ultimo = i; }
      });
      if (primero < 0) { primero = Math.min(v.length - 1, Math.round(pista.scrollLeft / paso())); ultimo = primero; }
      if (actualEl) actualEl.textContent = primero === ultimo ? pad(primero + 1) : `${pad(primero + 1)}–${pad(ultimo + 1)}`;
      if (totalEl) totalEl.textContent = pad(v.length);
      const fraccion = pista.scrollWidth > 0 ? Math.min(1, pista.clientWidth / pista.scrollWidth) : 1;
      if (barra) {
        barra.style.width = `${fraccion * 100}%`;
        barra.style.transform = `translateX(${fraccion < 1 ? (pista.scrollLeft / pista.clientWidth) * 100 : 0}%)`;
      }
      if (prev) prev.disabled = pista.scrollLeft <= 4;
      if (sig) sig.disabled = max <= 4 || alFinal;
    };
    let pendiente = false;
    pista.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; actualizarControles(); }); } }, { passive: true });
    window.addEventListener('resize', actualizarControles);

    const moverPildora = () => {
      if (!pildora) return;
      const b = botones.find((x) => x.getAttribute('aria-pressed') === 'true');
      if (!b) return;
      pildora.style.width = `${b.offsetWidth}px`;
      pildora.style.transform = `translateX(${b.offsetLeft}px)`;
    };
    const aplicarFiltro = (f, animar = true) => {
      botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === f)));
      moverPildora();
      let i = 0;
      $$('.foto-item', pista).forEach((li) => {
        const cats = li.dataset.cats.split(' ');
        const esPendiente = li.hasAttribute('data-pendiente-item');
        const visible = f === 'todos' ? !esPendiente : cats.includes(f);
        li.hidden = !visible;
        li.classList.remove('is-apareciendo');
        if (visible && animar && !reducido()) {
          li.style.setProperty('--i', i);
          void li.offsetWidth;
          li.classList.add('is-apareciendo');
        }
        if (visible) i += 1;
      });
      pista.scrollLeft = 0;
      actualizarControles();
    };
    botones.forEach((b) => b.addEventListener('click', () => aplicarFiltro(b.dataset.filtro)));
    $$('[data-filtro-atajo]').forEach((b) => b.addEventListener('click', () => {
      aplicarFiltro(b.dataset.filtroAtajo);
      if (filtros) filtros.scrollIntoView({ behavior: suave(), block: 'center' });
    }));
    window.addEventListener('resize', moverPildora);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moverPildora);

    const mover = (dir) => pista.scrollBy({ left: dir * paso(), behavior: suave() });
    if (prev) prev.addEventListener('click', () => mover(-1));
    if (sig) sig.addEventListener('click', () => mover(1));

    // Teclado: flechas mueven el carrusel o el foco entre fotos
    pista.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const cards = visibles().map((li) => $('.foto-card', li)).filter((c) => c.matches('button'));
      const idx = cards.indexOf(document.activeElement);
      if (idx >= 0) {
        const destino = cards[Math.min(cards.length - 1, Math.max(0, idx + dir))];
        destino.focus({ preventScroll: true });
        destino.scrollIntoView({ behavior: suave(), inline: 'nearest', block: 'nearest' });
      } else mover(dir);
    });

    // Arrastre con mouse (el táctil usa el scroll nativo)
    let arrastre = null;
    let movio = false;
    pista.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arrastre = { x: e.clientX, sl: pista.scrollLeft, id: e.pointerId };
      movio = false;
    });
    pista.addEventListener('pointermove', (e) => {
      if (!arrastre) return;
      const dx = e.clientX - arrastre.x;
      if (!movio && Math.abs(dx) > 6) {
        movio = true;
        pista.classList.add('is-arrastrando', 'sin-snap');
        try { pista.setPointerCapture(arrastre.id); } catch (err) { /* sin captura */ }
      }
      if (movio) pista.scrollLeft = arrastre.sl - dx;
    });
    const soltar = () => {
      if (!arrastre) return;
      arrastre = null;
      if (!movio) return;
      pista.classList.remove('is-arrastrando');
      const p = paso();
      pista.scrollTo({ left: Math.round(pista.scrollLeft / p) * p, behavior: suave() });
      setTimeout(() => pista.classList.remove('sin-snap'), 450);
      setTimeout(() => { movio = false; }, 0);
    };
    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointercancel', soltar);
    pista.addEventListener('click', (e) => { if (movio) { e.preventDefault(); e.stopPropagation(); } }, true);

    // Lightbox
    const lb = $('[data-lightbox]');
    if (!lb) { aplicarFiltro('todos', false); return; }
    const lbImg = $('[data-lb-img]', lb);
    const lbPie = $('[data-lb-pie]', lb);
    const lbCont = $('[data-lb-contador]', lb);
    const lbPrev = $('[data-lb-prev]', lb);
    const lbSig = $('[data-lb-sig]', lb);
    let lista = [];
    let indice = 0;
    let origen = null;

    const mostrar = (i) => {
      indice = (i + lista.length) % lista.length;
      const g = GALERIA[lista[indice]];
      lbImg.classList.remove('is-lista');
      const poner = () => {
        lbImg.src = g.src;
        lbImg.alt = g.alt;
        lbImg.width = g.w;
        lbImg.height = g.h;
        requestAnimationFrame(() => lbImg.classList.add('is-lista'));
      };
      const pre = new Image();
      pre.onload = poner;
      pre.onerror = poner;
      pre.src = g.src;
      lbPie.textContent = `${g.titulo} · ${g.etiqueta}`;
      lbCont.textContent = `${indice + 1} / ${lista.length}`;
      lbPrev.hidden = lista.length < 2;
      lbSig.hidden = lista.length < 2;
    };
    const onTecla = (e) => {
      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowRight' && lista.length > 1) mostrar(indice + 1);
      else if (e.key === 'ArrowLeft' && lista.length > 1) mostrar(indice - 1);
      else atraparFoco(lb, e);
    };
    const abrir = (galIndex, desde) => {
      lista = visibles().map((li) => $('[data-foto]', li)).filter(Boolean).map((b) => Number(b.dataset.foto));
      if (!lista.length) return;
      origen = desde;
      lb.hidden = false;
      bloquearScroll(true);
      requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-abierto')));
      mostrar(Math.max(0, lista.indexOf(galIndex)));
      document.addEventListener('keydown', onTecla);
      setTimeout(() => $('[data-lb-cerrar]', lb).focus(), 60);
    };
    function cerrar() {
      lb.classList.remove('is-abierto');
      document.removeEventListener('keydown', onTecla);
      setTimeout(() => {
        lb.hidden = true;
        lbImg.classList.remove('is-lista');
        bloquearScroll(false);
        if (origen) origen.focus({ preventScroll: true });
      }, reducido() ? 0 : 300);
    }
    pista.addEventListener('click', (e) => {
      const b = e.target.closest('[data-foto]');
      if (b) abrir(Number(b.dataset.foto), b);
    });
    $('[data-lb-cerrar]', lb).addEventListener('click', cerrar);
    lbPrev.addEventListener('click', () => mostrar(indice - 1));
    lbSig.addEventListener('click', () => mostrar(indice + 1));
    const figura = $('.lightbox__figura', lb);
    let inicioX = null;
    figura.addEventListener('pointerdown', (e) => { inicioX = e.clientX; });
    figura.addEventListener('pointerup', (e) => {
      if (inicioX === null) return;
      const dx = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(dx) > 50 && lista.length > 1) mostrar(indice + (dx < 0 ? 1 : -1));
    });
    figura.addEventListener('click', (e) => { if (e.target === figura) cerrar(); });

    aplicarFiltro('todos', false);
  };

  /* ------------------------------------------------------------------------
     Reserva en 4 pasos → guarda la cita en el panel (si está conectado) y abre WhatsApp
     ------------------------------------------------------------------------ */
  const initReserva = () => {
    const cont = $('[data-reserva]');
    const form = $('#form-reserva');
    if (!cont || !form) return null;
    const pasos = $$('.paso', form);
    const indicadores = $$('[data-indicador]', cont);
    const barra = $('[data-reserva-barra]', cont);
    const progreso = $('.reserva__barra', cont);
    const anuncio = $('[data-reserva-anuncio]', cont);
    const btnAtras = $('[data-reserva-atras]', form);
    const btnSig = $('[data-reserva-siguiente]', form);
    const btnEnviar = $('[data-reserva-enviar]', form);
    const exito = $('[data-reserva-exito]', cont);
    const opciones = $('[data-opciones-servicio]', form);
    const diasEl = $('[data-dias]', form);
    const horasEl = $('[data-horas]', form);
    const avisoMie = $('[data-aviso-miercoles]', form);
    const notaCierres = $('[data-cierres-nota]', form);
    const inNombre = $('#res-nombre', form);
    const inTel = $('#res-telefono', form);
    const inSector = $('#res-sector', form);
    const inPersonas = $('#res-personas', form);
    const inNota = $('#res-nota', form);
    const NOMBRES = ['Servicio', 'Día y hora', 'Tus datos', 'Confirmar'];
    const st = { paso: 1, servicios: [], fecha: null, dow: null, hora: null };
    let ultimoMensaje = '';

    opciones.innerHTML = SERVICIOS.map((s) => `
      <div class="opcion-servicio">
        <input type="checkbox" name="servicio" id="srv-${s.id}" value="${s.id}">
        <label for="srv-${s.id}">
          <span class="opcion-servicio__icono">${icono(s.icono)}</span>
          <span><span class="opcion-servicio__nombre">${esc(s.nombre)}</span><span class="opcion-servicio__precio"${s.id === 'domicilio' ? ' data-precio-domicilio-desde' : ''}>${s.precio ? esc(s.precio) : 'Precio: consultar'}</span></span>
          <span class="opcion-servicio__check">${icono('i-check')}</span>
        </label>
      </div>`).join('');

    const tiene = (id) => st.servicios.includes(id);
    const esDomicilio = () => tiene('domicilio') || esDiaDomicilio(st.dow);
    const elegidos = () => SERVICIOS.filter((s) => tiene(s.id));          // en el orden del menú
    const nombresServicios = () => elegidos().map((s) => s.nombre).join(' + ');
    // Precio estimado: suma los servicios con precio fijo; el traslado a domicilio y las rayas son «desde» / «adicional».
    const aMonto = (txt) => { const m = /(\d[\d,.]*)/.exec(String(txt || '')); return m ? Number(m[1].replace(/[,.]/g, '')) : 0; };
    const calcularPrecio = () => {
      let base = 0; let adicional = false;
      elegidos().forEach((s) => {
        if (s.id === 'domicilio') return;
        if (/^\s*RD\$\s*\d/.test(s.precio || '')) base += aMonto(s.precio); else adicional = true;
      });
      const dom = esDomicilio();
      const traslado = dom ? aMonto(NEGOCIO.domicilioDesde) : 0;
      const total = base + traslado;
      const fmt = (n) => `RD$${miles(n)}`;
      let texto = fmt(total);
      if (dom) texto = `Desde ${fmt(total)}`;
      const extras = [dom ? 'costo según la distancia' : '', adicional ? 'costo adicional de rayas' : ''].filter(Boolean);
      if (extras.length) texto += ` + ${extras.join(' y ')}`;
      const detalle = dom && base ? `Servicios ${fmt(base)} + traslado ${fmt(traslado)}` : (dom ? `Traslado ${fmt(traslado)}` : '');
      return { total, texto, detalle, hay: st.servicios.length > 0 };
    };
    const pintarTotal = () => {
      const el = $('[data-total]', form);
      if (!el) return;
      const p = calcularPrecio();
      el.hidden = !p.hay;
      if (!p.hay) return;
      $('[data-total-valor]', el).textContent = p.texto;
      $('[data-total-detalle]', el).textContent = p.detalle;
    };
    const fechaSel = () => {
      const [y, m, d] = st.fecha.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };
    const errorPaso = (n, msg) => { const el = $(`[data-error-paso="${n}"]`, form); if (el) el.textContent = msg; };

    const renderHoras = () => {
      if (!st.fecha) {
        horasEl.innerHTML = '<p class="horas__vacio">Elige un día para ver las horas.</p>';
        return;
      }
      const h = HORARIO[st.dow];
      const ahora = ahoraRD();
      const esHoy = st.fecha === claveFecha(diaRD(ahora, 0));
      const html = [];
      for (let x = h.abre; x < h.cierra; x += 1) {
        const pasada = esHoy && x < ahora.h + 1;
        const ocupada = OCUPADAS.has(`${st.fecha}|${x}`);
        const deshabilitada = pasada || ocupada;
        const marcada = st.hora === x && !deshabilitada;
        html.push(`<div class="hora${ocupada ? ' hora--ocupada' : ''}"><input type="radio" name="hora" id="hora-${x}" value="${x}"${deshabilitada ? ' disabled' : ''}${marcada ? ' checked' : ''}><label for="hora-${x}">${formatoHora(x)}${ocupada ? '<span class="sr"> (ocupada)</span>' : ''}</label></div>`);
      }
      horasEl.innerHTML = html.join('');
      if (st.hora !== null && !$(`input[value="${st.hora}"]:checked`, horasEl)) st.hora = null;
    };

    const renderDias = () => {
      const ahora = ahoraRD();
      const html = [];
      for (let k = 0; k < 14; k += 1) {
        const dt = diaRD(ahora, k);
        const dow = dt.getUTCDay();
        const h = HORARIO[dow];
        const clave = claveFecha(dt);
        let deshabilitado = false;
        let etiqueta = '';
        const cierre = CIERRES[clave];
        if (cierre) { deshabilitado = true; etiqueta = cierre.tipo === 'feriado' ? 'Feriado' : 'Cerrado'; }
        else if (!h) { deshabilitado = true; etiqueta = 'Por confirmar'; }
        else if (h.modo === 'cerrado') { deshabilitado = true; etiqueta = 'Cerrado'; }
        else {
          if (h.modo === 'domicilio') etiqueta = 'Domicilio';
          if (tiene('domicilio') && h.modo !== 'domicilio') { deshabilitado = true; etiqueta = 'Solo mié.'; }
          if (k === 0 && ahora.h + 1 >= h.cierra) { deshabilitado = true; etiqueta = 'Cerrado'; }
        }
        if (!etiqueta && k === 0) etiqueta = 'Hoy';
        else if (!etiqueta && k === 1) etiqueta = 'Mañana';
        const marcado = st.fecha === clave && !deshabilitado;
        const nombre = `${DIAS[dow]} ${dt.getUTCDate()} de ${MESES[dt.getUTCMonth()]}${etiqueta ? `, ${etiqueta.toLowerCase()}` : ''}${cierre && cierre.motivo ? ` (${cierre.motivo})` : ''}`;
        html.push(`<div class="dia${esDiaDomicilio(dow) ? ' dia--miercoles' : ''}${cierre ? ' dia--cierre' : ''}"><input type="radio" name="dia" id="dia-${clave}" value="${clave}" data-dow="${dow}" aria-label="${nombre}"${deshabilitado ? ' disabled' : ''}${marcado ? ' checked' : ''}><label for="dia-${clave}"><span class="dia__semana">${DIAS_CORTOS[dow]}</span><span class="dia__num">${dt.getUTCDate()}</span><span class="dia__mes">${MESES_CORTOS[dt.getUTCMonth()]}</span>${etiqueta ? `<span class="dia__tag">${etiqueta}</span>` : ''}</label></div>`);
      }
      diasEl.innerHTML = html.join('');
      if (st.fecha && !$(`input[value="${st.fecha}"]:checked`, diasEl)) { st.fecha = null; st.dow = null; st.hora = null; }
      avisoMie.hidden = !(esDiaDomicilio(st.dow) && !tiene('domicilio'));
      const cierres = cierresProximos(14);
      if (notaCierres) {
        notaCierres.hidden = cierres.length === 0;
        $('span', notaCierres).textContent = `Días cerrados: ${cierres.map(({ dt, c }) => `${DIAS_CORTOS[dt.getUTCDay()]} ${dt.getUTCDate()} de ${MESES_CORTOS[dt.getUTCMonth()]}.${c.motivo ? ` (${c.motivo})` : (c.tipo === 'feriado' ? ' (feriado)' : '')}`).join(' · ')}`;
      }
      renderHoras();
    };

    const construirMensaje = () => {
      const dom = esDomicilio();
      const lineas = [
        'Hola, Yeron. Quiero reservar un turno desde tu página web.',
        `• ${st.servicios.length > 1 ? 'Servicios' : 'Servicio'}: ${nombresServicios()}`,
        `• Día: ${st.fecha ? fechaLarga(fechaSel()) : ''}`,
        `• Hora: ${st.hora !== null ? formatoHora(st.hora, true) : ''}`,
        `• Lugar: ${dom ? 'a domicilio' : 'en la barbería'}`,
      ];
      if (dom) {
        lineas.push(`• Sector: ${inSector.value.trim()}`);
        lineas.push(`• Personas: ${inPersonas.value}`);
      }
      lineas.push(`• Nombre: ${inNombre.value.trim()}`, `• Mi WhatsApp: ${inTel.value.trim()}`);
      if (inNota.value.trim()) lineas.push(`• Nota: ${inNota.value.trim()}`);
      lineas.push(`• Total estimado: ${calcularPrecio().texto}`);
      if (dom) lineas.push('', `Sé que el domicilio arranca en ${NEGOCIO.domicilioDesde} y el precio final depende de la distancia.`);
      return lineas.join('\n');
    };

    const renderResumen = () => {
      const dom = esDomicilio();
      const personas = inPersonas.value;
      const filas = [
        [st.servicios.length > 1 ? 'Servicios' : 'Servicio', nombresServicios(), 1],
        ['Día', cap(fechaLarga(fechaSel())), 2],
        ['Hora', formatoHora(st.hora), 2],
        ['Lugar', dom ? `A domicilio · ${inSector.value.trim()} · ${personas} ${personas === '1' ? 'persona' : 'personas'}` : 'En la barbería', dom ? 3 : 2],
        ['Nombre', inNombre.value.trim(), 3],
        ['WhatsApp', inTel.value.trim(), 3],
      ];
      if (inNota.value.trim()) filas.push(['Nota', inNota.value.trim(), 3]);
      filas.push(['Total estimado', calcularPrecio().texto, 1]);
      $('[data-resumen]', form).innerHTML = filas.map(([k, v, p]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd>${p ? `<button type="button" data-ir="${p}">Cambiar<span class="sr"> ${k.toLowerCase()}</span></button>` : '<span></span>'}</div>`).join('');
      ultimoMensaje = construirMensaje();
      $('[data-reserva-mensaje]', form).textContent = ultimoMensaje;
      btnEnviar.href = waLink(ultimoMensaje);
    };

    const validarCampo = (input) => {
      const campo = input.closest('.campo');
      if (input === inNombre) {
        if (inNombre.value.trim().length < 2) { marcarError(campo, 'Escribe tu nombre para que Yeron sepa quién eres.'); return false; }
      } else if (input === inTel) {
        const digitos = inTel.value.replace(/\D/g, '');
        if (digitos.length < 10 || digitos.length > 15) { marcarError(campo, 'Escribe tu WhatsApp con código de área (10 dígitos), por ejemplo 829-555-1234.'); return false; }
      } else if (input === inSector) {
        if (esDomicilio() && inSector.value.trim().length < 3) { marcarError(campo, 'Indica tu sector o dirección para cotizar la distancia.'); return false; }
      }
      limpiarError(campo, true);
      return true;
    };

    const validar = (n) => {
      if (n === 1) {
        if (!st.servicios.length) { errorPaso(1, 'Elige al menos un servicio para continuar.'); vibrar(opciones); return false; }
        errorPaso(1, '');
        return true;
      }
      if (n === 2) {
        if (!st.fecha) { errorPaso(2, 'Elige un día.'); vibrar(diasEl); return false; }
        if (st.hora === null) { errorPaso(2, 'Elige una hora.'); vibrar(horasEl); return false; }
        errorPaso(2, '');
        return true;
      }
      if (n === 3) {
        const campos = [inNombre, inTel].concat(esDomicilio() ? [inSector] : []);
        const malos = campos.filter((c) => !validarCampo(c));
        if (malos.length) { malos[0].focus(); return false; }
        return true;
      }
      return true;
    };

    const irA = (n, dir = 1) => {
      const anterior = st.paso;
      st.paso = n;
      if (n === 2) {
        renderDias();
        if (enVivo) cargarOcupadas().then(() => { if (st.paso === 2) renderHoras(); }).catch(() => {});
      }
      if (n === 3) {
        $$('[data-solo-domicilio]', form).forEach((el) => { el.hidden = !esDomicilio(); });
        inSector.required = esDomicilio();
      }
      if (n === 4) renderResumen();
      pasos.forEach((p) => {
        const activo = Number(p.dataset.paso) === n;
        p.hidden = !activo;
        p.classList.toggle('is-activo', activo);
        p.classList.remove('is-entrando', 'is-entrando-atras');
        if (activo && anterior !== n && !reducido()) {
          void p.offsetWidth;
          p.classList.add(dir > 0 ? 'is-entrando' : 'is-entrando-atras');
        }
      });
      indicadores.forEach((li) => {
        const k = Number(li.dataset.indicador);
        li.classList.toggle('is-activo', k === n);
        li.classList.toggle('is-hecho', k < n);
      });
      barra.style.width = `${(n / 4) * 100}%`;
      progreso.setAttribute('aria-valuenow', String(n));
      progreso.setAttribute('aria-valuetext', `Paso ${n} de 4: ${NOMBRES[n - 1]}`);
      btnAtras.disabled = n === 1;
      btnSig.hidden = n === 4;
      btnEnviar.hidden = n !== 4;
      if (anterior !== n) {
        anuncio.textContent = `Paso ${n} de 4: ${NOMBRES[n - 1]}`;
        const leyenda = $(`.paso[data-paso="${n}"] .paso__titulo`, form);
        if (leyenda) leyenda.focus({ preventScroll: true });
        if (cont.getBoundingClientRect().top < 70) cont.scrollIntoView({ behavior: suave(), block: 'start' });
      }
    };

    opciones.addEventListener('change', (e) => {
      if (e.target.name !== 'servicio') return;
      st.servicios = $$('input[name="servicio"]:checked', opciones).map((i) => i.value);
      errorPaso(1, '');
      avisoMie.hidden = !(esDiaDomicilio(st.dow) && !tiene('domicilio'));
      pintarTotal();
      if (tiene('domicilio') && st.dow !== null && !esDiaDomicilio(st.dow)) { st.fecha = null; st.dow = null; st.hora = null; }
    });
    diasEl.addEventListener('change', (e) => {
      if (e.target.name !== 'dia') return;
      st.fecha = e.target.value;
      st.dow = Number(e.target.dataset.dow);
      st.hora = null;
      avisoMie.hidden = !(esDiaDomicilio(st.dow) && !tiene('domicilio'));
      errorPaso(2, '');
      renderHoras();
    });
    horasEl.addEventListener('change', (e) => {
      if (e.target.name !== 'hora') return;
      st.hora = Number(e.target.value);
      errorPaso(2, '');
    });
    [inNombre, inTel, inSector].forEach((input) => {
      input.addEventListener('blur', () => { if (input.value.trim()) validarCampo(input); });
      input.addEventListener('input', () => { if (input.closest('.campo').classList.contains('is-error')) validarCampo(input); });
    });

    btnSig.addEventListener('click', () => { if (validar(st.paso)) irA(st.paso + 1, 1); });
    btnAtras.addEventListener('click', () => irA(Math.max(1, st.paso - 1), -1));
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input:not([type="radio"])')) {
        e.preventDefault();
        if (!btnSig.hidden) btnSig.click();
      }
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ir]');
      if (b) irA(Number(b.dataset.ir), -1);
    });

    const textosExito = { titulo: $('h3', exito).textContent, texto: $('p', exito).textContent };
    const mostrarExito = (guardada) => {
      btnEnviar.classList.remove('is-loading');
      btnEnviar.removeAttribute('aria-busy');
      form.hidden = true;
      indicadores.forEach((li) => { li.classList.remove('is-activo'); li.classList.add('is-hecho'); });
      barra.style.width = '100%';
      $('h3', exito).textContent = guardada ? 'Tu cita quedó registrada' : textosExito.titulo;
      $('p', exito).textContent = guardada
        ? 'Yeron la ve en su panel y te confirma por WhatsApp. Para agilizarlo, envía el mensaje que abrimos. Si no se abrió, usa los botones de abajo.'
        : textosExito.texto;
      exito.hidden = false;
      $('[data-exito-wa]', exito).href = btnEnviar.href;
      exito.focus();
      anuncio.textContent = guardada ? 'Tu cita quedó registrada.' : 'Tu mensaje está listo en WhatsApp.';
    };
    const ERRORES_CITA = {
      hora_ocupada: 'Esa hora acaba de ser tomada. Elige otra.',
      dia_cerrado: 'Ese día Yeron no atiende. Elige otro día.',
      hora_pasada: 'Esa hora ya pasó. Elige otra.',
      hora_invalida: 'Esa hora no está disponible. Elige otra.',
      dia_no_disponible: 'Ese día no está disponible. Elige otro.',
      fecha_invalida: 'Esa fecha no está disponible. Elige otra.',
      servicio_no_disponible: 'Ese servicio no está disponible ese día. Elige otro día.',
    };
    const guardarCita = () => api('reservar', {
      metodo: 'POST',
      espera: 8000,
      cuerpo: {
        servicio: st.servicios.join(','),
        fecha: st.fecha,
        hora: st.hora,
        nombre: inNombre.value.trim(),
        telefono: inTel.value.trim(),
        sector: esDomicilio() ? inSector.value.trim() : '',
        personas: esDomicilio() ? Number(inPersonas.value) || 1 : 1,
        nota: inNota.value.trim(),
      },
    });

    btnEnviar.addEventListener('click', async (e) => {
      if (!(validar(1) && validar(2) && validar(3))) { e.preventDefault(); return; }
      if (btnEnviar.classList.contains('is-loading')) { e.preventDefault(); return; }
      ultimoMensaje = construirMensaje();
      btnEnviar.href = waLink(ultimoMensaje);
      btnEnviar.classList.add('is-loading');
      btnEnviar.setAttribute('aria-busy', 'true');
      const espera = new Promise((r) => setTimeout(r, reducido() ? 60 : 900));
      if (!enVivo) { await espera; mostrarExito(false); return; }   // sin panel: abre WhatsApp como siempre

      e.preventDefault();   // con panel: primero se guarda la cita y luego se abre WhatsApp
      let guardada = false;
      try {
        await Promise.all([guardarCita(), espera]);
        guardada = true;
      } catch (err) {
        const msg = ERRORES_CITA[err.codigo];
        if (msg) {            // la hora o el día dejó de estar disponible: volver a elegir
          btnEnviar.classList.remove('is-loading');
          btnEnviar.removeAttribute('aria-busy');
          st.hora = null;
          await cargarEnVivo().catch(() => {});
          irA(2, -1);
          errorPaso(2, msg);
          return;
        }
        toast(err.codigo === 'demasiadas_citas'
          ? 'Ya tienes 3 citas activas con ese WhatsApp. Escríbele a Yeron para cambiarlas.'
          : 'No se pudo registrar la cita en el panel. Envía el mensaje por WhatsApp.');
        await espera;
      }
      mostrarExito(guardada);
      window.open(btnEnviar.href, '_blank', 'noopener');
    });

    const reiniciar = () => {
      form.reset();
      st.servicios = []; pintarTotal(); st.fecha = null; st.dow = null; st.hora = null;
      $$('.campo', form).forEach((c) => limpiarError(c));
      errorPaso(1, ''); errorPaso(2, '');
      exito.hidden = true;
      form.hidden = false;
      irA(1, -1);
    };
    $('[data-reserva-reiniciar]', exito).addEventListener('click', reiniciar);
    const btnCopiarMensaje = $('[data-copiar-mensaje]', exito);
    btnCopiarMensaje.addEventListener('click', async () => {
      const ok = await copiar(ultimoMensaje);
      if (ok) { marcarExito(btnCopiarMensaje, 'Mensaje copiado'); toast('Mensaje copiado. Pégalo en WhatsApp.'); }
      else toast('No se pudo copiar el mensaje.');
    });

    irA(1);

    return {
      refrescar() { if (st.paso === 2) renderDias(); },
      preseleccionar(id) {
        if (!exito.hidden) reiniciar();
        const radio = $(`#srv-${id}`, form);
        if (!radio) return;
        $$('input[name="servicio"]', form).forEach((i) => { i.checked = false; });
        radio.checked = true;
        st.servicios = [id];
        pintarTotal();
        errorPaso(1, '');
        if (id === 'domicilio' && st.dow !== null && !esDiaDomicilio(st.dow)) { st.fecha = null; st.dow = null; st.hora = null; }
        irA(2, 1);
      },
    };
  };

  /* ------------------------------------------------------------------------
     Preguntas frecuentes
     ------------------------------------------------------------------------ */
  const initAcordeon = () => {
    const acordeon = $('[data-acordeon]');
    if (!acordeon) return;
    const items = $$('.acordeon__item', acordeon);
    const poner = (item, abrir) => {
      item.classList.toggle('is-abierto', abrir);
      $('.acordeon__boton', item).setAttribute('aria-expanded', String(abrir));
    };
    items.forEach((item) => {
      $('.acordeon__boton', item).addEventListener('click', () => {
        const abrir = !item.classList.contains('is-abierto');
        if (abrir && mqMovil.matches) items.forEach((otro) => { if (otro !== item) poner(otro, false); });
        poner(item, abrir);
      });
    });
    if (items[0]) poner(items[0], true);
  };

  /* ------------------------------------------------------------------------
     Copiar número y dirección
     ------------------------------------------------------------------------ */
  const initCopiar = () => {
    $$('[data-copiar]').forEach((btn) => btn.addEventListener('click', async () => {
      const texto = btn.dataset.copiar;
      const ok = await copiar(texto);
      if (ok) { marcarExito(btn); toast(`Copiado: ${texto}`); }
      else toast('No se pudo copiar. Selecciona el texto y cópialo.');
    }));
  };

  /* ------------------------------------------------------------------------
     WhatsApp flotante: visible fuera del hero, oculto sobre la reserva y el pie
     ------------------------------------------------------------------------ */
  const initWhatsappFlotante = () => {
    const wa = $('[data-wa-flotante]');
    if (!wa) return;
    if (!('IntersectionObserver' in window)) { wa.classList.add('is-visible'); return; }
    const zonas = { hero: true, reservar: false, pie: false };
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { zonas[en.target.dataset.waZona] = en.isIntersecting; });
      wa.classList.toggle('is-visible', !zonas.hero && !zonas.reservar && !zonas.pie);
    }, { threshold: 0.12 });
    [['hero', '.hero'], ['reservar', '#reservar'], ['pie', '.pie']].forEach(([zona, sel]) => {
      const el = $(sel);
      if (el) { el.dataset.waZona = zona; io.observe(el); }
    });
  };

  /* ------------------------------------------------------------------------
     Arranque: cada módulo aislado para que un error no detenga el resto
     ------------------------------------------------------------------------ */
  const iniciar = (nombre, fn) => {
    try { return fn(); } catch (err) { console.error(`[Yeron] Error en ${nombre}:`, err); return null; }
  };
  iniciar('nítidas', () => initNitidas());
  iniciar('estado', initEstado);
  iniciar('navegación', initNav);
  iniciar('menú', initMenu);
  iniciar('servicios', initServicios);
  iniciar('cotizador', initCotizador);
  iniciar('galería', initGaleria);
  reserva = iniciar('reserva', initReserva);
  iniciar('acordeón', initAcordeon);
  iniciar('datos en vivo', iniciarEnVivo);
  iniciar('copiar', initCopiar);
  iniciar('whatsapp', initWhatsappFlotante);
  iniciar('parallax', initParallax);
  iniciar('expandir', initExpandir);
  iniciar('contadores', initContadores);
  iniciar('revelado', initReveal);

  window.YERON = { NEGOCIO, HORARIO, SERVICIOS, GALERIA, CIERRES };
})();
