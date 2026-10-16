/* ==========================================================================
   Panel de Yeron — citas, días cerrados y horario
   Habla solo con /api/admin. La sesión es una cookie HttpOnly firmada por el servidor:
   este archivo nunca ve la contraseña guardada ni la conexión a la base (Neon).
   ========================================================================== */
(() => {
  'use strict';

  const CFG = window.YERON_CONFIG || {};
  const BASE = String(CFG.api || '').replace(/\/$/, '');
  const configurado = Boolean(BASE);

  /* ---------- Utilidades ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const NBSP = ' ';
  const SERVICIOS = { lavado: 'Lavado de pelo', 'corte-adulto': 'Corte de adulto', 'corte-barba': 'Corte con barba / afeitada', cejas: 'Chicas cejas', 'corte-ninos': 'Corte de niños', 'tintado-cejas': 'Tintado de cejas', rayas: 'Rayas', faciales: 'Servicios de faciales', domicilio: 'A domicilio' };
  const ESTADOS = { pendiente: 'Por confirmar', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada' };
  const MODOS = { barberia: 'En la barbería', domicilio: 'A domicilio', cerrado: 'Cerrado', por_confirmar: 'Por confirmar' };
  const ACTIVAS = ['pendiente', 'confirmada'];

  // Hora de República Dominicana (UTC−4 todo el año)
  const ahoraRD = () => {
    const d = new Date(Date.now() - 4 * 3600000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours() };
  };
  const claveDe = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
  const diaRD = (n) => { const a = ahoraRD(); return new Date(Date.UTC(a.y, a.m, a.d + n)); };
  const hoyClave = () => claveDe(diaRD(0));
  const deClave = (c) => { const [y, m, d] = c.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fechaCorta = (c) => { const dt = deClave(c); return `${cap(DIAS_CORTOS[dt.getUTCDay()])} ${dt.getUTCDate()} ${MESES_CORTOS[dt.getUTCMonth()]}.`; };
  const fechaLarga = (c) => { const dt = deClave(c); return `${DIAS[dt.getUTCDay()]} ${dt.getUTCDate()} de ${MESES[dt.getUTCMonth()]}`; };
  const hora12 = (h) => {
    if (h === 12) return `12:00${NBSP}m.`;
    if (h === 0 || h === 24) return `12:00${NBSP}a.${NBSP}m.`;
    return h < 12 ? `${h}:00${NBSP}a.${NBSP}m.` : `${h - 12}:00${NBSP}p.${NBSP}m.`;
  };
  const waNumero = (tel) => { const d = String(tel).replace(/\D/g, ''); return d.length === 10 ? `1${d}` : d; };
  const waEnlace = (tel, texto) => `https://wa.me/${waNumero(tel)}?text=${encodeURIComponent(texto)}`;

  let toastTimer;
  const toast = (msg, error = false) => {
    const el = $('[data-toast]');
    el.textContent = msg;
    el.classList.toggle('toast--error', error);
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  };
  const cargando = (btn, on) => { btn.classList.toggle('is-loading', on); btn.disabled = on; };

  /* ---------- API del panel (sesión en cookie HttpOnly) ---------- */
  class ErrorApi extends Error {
    constructor(status, datos) {
      super((datos && datos.error) || `http_${status}`);
      this.status = status;
      this.codigo = (datos && datos.error) || '';
    }
  }
  const llamar = async (accion, datos = {}) => {
    const r = await fetch(`${BASE}/admin`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Yeron': '1' },
      body: JSON.stringify({ accion, ...datos }),
    });
    const texto = await r.text();
    let d = null;
    try { d = texto ? JSON.parse(texto) : null; } catch (err) { d = null; }
    if (!r.ok) throw new ErrorApi(r.status, d);
    return d;
  };

  /* ---------- Estado ---------- */
  const est = { citas: [], cierres: [], horario: [], config: null, filtro: 'agenda', pendientesVistos: null, primeraCarga: true };

  const mostrar = (vista) => {
    $$('[data-vista]').forEach((el) => { el.hidden = el.dataset.vista !== vista; });
    $('[data-salir]').hidden = vista !== 'panel';
    if (vista === 'login') $('#login-correo').focus();
  };
  const salir = async () => {
    try { await llamar('logout'); } catch (err) { /* sin conexión: igual se cierra aquí */ }
    clearInterval(est.timer);
    mostrar('login');
  };

  /* ---------- Carga de datos ---------- */
  const cargarCitas = async () => {
    const d = await llamar('citas', { desde: claveDe(diaRD(-45)), hoy: hoyClave() });
    est.citas = d.citas;
    est.cierres = d.cierres;
  };
  const cargarCierres = async () => { await cargarCitas(); };
  const cargarHorarioConfig = async () => {
    const d = await llamar('ajustes');
    est.horario = d.horario;
    est.config = d.config || { domicilio_desde: 1000, aviso: '', aviso_activo: false };
  };

  /* ---------- Citas ---------- */
  const esFutura = (c) => c.fecha >= hoyClave();
  const pendientes = () => est.citas.filter((c) => c.estado === 'pendiente' && esFutura(c));
  const lugarTexto = (c) => (c.lugar === 'domicilio'
    ? `A domicilio · ${c.sector || 'sin sector'} · ${c.personas} ${c.personas === 1 ? 'persona' : 'personas'}`
    : 'En la barbería');

  const mensajeWa = (c) => {
    const cuando = `${fechaLarga(c.fecha)} a las ${hora12(c.hora)}`;
    const nombre = c.nombre.split(' ')[0];
    if (c.estado === 'confirmada') return `Hola ${nombre}, tu cita quedó confirmada: ${cuando}${c.lugar === 'domicilio' ? ' (a domicilio)' : ''}. ¡Te espero!`;
    if (c.estado === 'cancelada') return `Hola ${nombre}, tuve que cancelar tu cita del ${cuando}. ¿La reprogramamos?`;
    if (c.estado === 'completada') return `Hola ${nombre}, gracias por venir. ¡Flow de la mata!`;
    return `Hola ${nombre}, soy Yeron. Recibí tu solicitud de cita para el ${cuando}.`;
  };

  const accionesDe = (c) => {
    const b = (accion, texto, clase) => `<button type="button" class="btn btn--chico ${clase}" data-accion="${accion}" data-id="${esc(c.id)}">${texto}</button>`;
    if (c.estado === 'pendiente') return b('confirmar', 'Confirmar', 'btn--verde') + b('reprogramar', 'Reprogramar', 'btn--linea') + b('cancelar', 'Cancelar', 'btn--peligro');
    if (c.estado === 'confirmada') return b('completar', 'Marcar completada', 'btn--linea') + b('reprogramar', 'Reprogramar', 'btn--linea') + b('cancelar', 'Cancelar', 'btn--peligro');
    return b('reabrir', 'Volver a pendiente', 'btn--linea');
  };

  const tarjetaCita = (c) => `
    <article class="cita cita--${esc(c.estado)}" data-cita="${esc(c.id)}">
      <header class="cita__cab">
        <p class="cita__cuando"><strong>${esc(fechaCorta(c.fecha))}</strong> · ${hora12(c.hora)}</p>
        <span class="estado estado--${esc(c.estado)}">${esc(ESTADOS[c.estado] || c.estado)}</span>
      </header>
      <h3 class="cita__nombre">${esc(c.nombre)}</h3>
      <p class="cita__detalle">${esc(SERVICIOS[c.servicio] || c.servicio)} · ${esc(lugarTexto(c))}</p>
      ${c.nota ? `<p class="cita__nota">«${esc(c.nota)}»</p>` : ''}
      <p class="cita__contacto"><a href="tel:+${esc(waNumero(c.telefono))}">${esc(c.telefono)}</a> · <a href="${esc(waEnlace(c.telefono, mensajeWa(c)))}" target="_blank" rel="noopener">Escribir por WhatsApp</a></p>
      <div class="cita__acciones">${accionesDe(c)}</div>
    </article>`;

  const pintarCitas = () => {
    const pend = pendientes();
    const contador = $('[data-contador]');
    contador.textContent = pend.length;
    contador.hidden = pend.length === 0;
    $('[data-n-pendientes]').textContent = pend.length;
    document.title = `${pend.length ? `(${pend.length}) ` : ''}Panel · Yeron Barbershop`;
    $$('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === est.filtro)));

    const lista = $('[data-lista-citas]');
    let citas;
    if (est.filtro === 'pendientes') citas = pend;
    else if (est.filtro === 'agenda') citas = est.citas.filter((c) => ACTIVAS.includes(c.estado) && esFutura(c));
    else citas = est.citas.filter((c) => !(ACTIVAS.includes(c.estado) && esFutura(c))).sort((a, b) => (a.fecha === b.fecha ? b.hora - a.hora : (a.fecha < b.fecha ? 1 : -1)));

    if (!citas.length) {
      const textos = { pendientes: 'No hay citas por confirmar. 🎉', agenda: 'No hay citas próximas.', historial: 'Todavía no hay historial.' };
      lista.innerHTML = `<p class="vacio">${textos[est.filtro]}</p>`;
      return;
    }
    if (est.filtro === 'historial') { lista.innerHTML = citas.map(tarjetaCita).join(''); return; }
    const grupos = [];
    citas.forEach((c) => {
      const g = grupos[grupos.length - 1];
      if (g && g.fecha === c.fecha) g.citas.push(c); else grupos.push({ fecha: c.fecha, citas: [c] });
    });
    const hoy = hoyClave();
    const manana = claveDe(diaRD(1));
    lista.innerHTML = grupos.map((g) => `
      <h2 class="dia-grupo"><strong>${g.fecha === hoy ? 'Hoy' : g.fecha === manana ? 'Mañana' : esc(cap(fechaLarga(g.fecha)))}</strong>${g.fecha === hoy || g.fecha === manana ? ` · ${esc(fechaCorta(g.fecha))}` : ''}</h2>
      ${g.citas.map(tarjetaCita).join('')}`).join('');
  };

  const actualizarCita = async (id, cambios, mensaje) => {
    try {
      const r = await llamar('cita_actualizar', { id, ...cambios });
      if (r && r.cita) est.citas = est.citas.map((c) => (c.id === id ? r.cita : c));
      est.citas.sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : (a.fecha < b.fecha ? -1 : 1)));
      pintarCitas();
      if (mensaje) toast(mensaje);
      return true;
    } catch (err) {
      if (err.status === 401) { sesionVencida(); return false; }
      toast(err.codigo === 'hora_ocupada' ? 'Esa hora ya está ocupada por otra cita.' : 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.', true);
      return false;
    }
  };

  /* ---------- Reprogramar ---------- */
  const dlg = $('[data-dialogo-reprog]');
  let citaEnEdicion = null;
  const opcionesHoras = (clave, cita) => {
    const dt = deClave(clave);
    const h = est.horario.find((x) => x.dow === dt.getUTCDay());
    if (est.cierres.some((x) => x.fecha === clave)) return { error: 'Ese día está cerrado.' };
    if (!h || !['barberia', 'domicilio'].includes(h.modo)) return { error: 'Ese día no hay servicio.' };
    if (h.modo !== cita.lugar) return { error: h.modo === 'domicilio' ? 'Ese día es solo a domicilio.' : 'Esa cita es a domicilio y ese día no hay domicilios.' };
    const ocupadas = new Set(est.citas.filter((c) => ACTIVAS.includes(c.estado) && c.fecha === clave && c.id !== cita.id).map((c) => c.hora));
    const ahora = ahoraRD();
    const horas = [];
    for (let x = h.abre; x < h.cierra; x += 1) {
      const pasada = clave === hoyClave() && x < ahora.h + 1;
      horas.push({ x, libre: !ocupadas.has(x) && !pasada });
    }
    return { horas };
  };
  const pintarHorasReprog = () => {
    const clave = $('#reprog-fecha').value;
    const sel = $('#reprog-hora');
    const err = $('[data-reprog-error]');
    err.textContent = '';
    if (!clave) { sel.innerHTML = '<option value="">Elige un día</option>'; return; }
    const r = opcionesHoras(clave, citaEnEdicion);
    if (r.error) { sel.innerHTML = '<option value="">—</option>'; err.textContent = r.error; return; }
    const actual = citaEnEdicion.fecha === clave ? citaEnEdicion.hora : null;
    sel.innerHTML = r.horas.map(({ x, libre }) => `<option value="${x}"${libre ? '' : ' disabled'}${x === actual ? ' selected' : ''}>${hora12(x)}${libre ? '' : ' (no disponible)'}</option>`).join('');
  };
  const abrirReprogramar = (cita) => {
    citaEnEdicion = cita;
    $('[data-reprog-quien]').textContent = `${cita.nombre} · ahora: ${fechaCorta(cita.fecha)} a las ${hora12(cita.hora)}`;
    const f = $('#reprog-fecha');
    f.min = hoyClave();
    f.value = cita.fecha >= hoyClave() ? cita.fecha : hoyClave();
    pintarHorasReprog();
    dlg.showModal();
  };

  /* ---------- Días cerrados ---------- */
  const citasActivasEn = (clave) => est.citas.filter((c) => c.fecha === clave && ACTIVAS.includes(c.estado));
  const pintarCierres = () => {
    const lista = $('[data-lista-cierres]');
    if (!est.cierres.length) { lista.innerHTML = '<p class="vacio">No hay días cerrados próximos.</p>'; return; }
    lista.innerHTML = est.cierres.map((c) => {
      const n = citasActivasEn(c.fecha).length;
      return `<div class="cierre">
        <div>
          <p class="cierre__fecha">${esc(cap(fechaLarga(c.fecha)))} <span class="estado estado--cancelada">${c.tipo === 'feriado' ? 'Feriado' : 'Cerrado'}</span></p>
          <p class="cierre__motivo">${c.motivo ? esc(c.motivo) : 'Sin motivo'}${n ? ` · ⚠ ${n} ${n === 1 ? 'cita activa' : 'citas activas'}` : ''}</p>
        </div>
        <button type="button" class="btn btn--chico btn--peligro" data-reabrir-dia="${esc(c.fecha)}">Volver a abrir</button>
      </div>`;
    }).join('');
  };

  /* ---------- Horario, tarifa y aviso ---------- */
  const optHoras = (desde, hasta, sel) => {
    let h = '';
    for (let x = desde; x <= hasta; x += 1) h += `<option value="${x}"${x === sel ? ' selected' : ''}>${hora12(x)}</option>`;
    return h;
  };
  const pintarHorario = () => {
    const orden = [1, 2, 3, 4, 5, 6, 0];
    $('[data-filas-horario]').innerHTML = orden.map((dow) => {
      const f = est.horario.find((x) => x.dow === dow) || { dow, modo: 'por_confirmar', abre: null, cierra: null };
      const modos = ['barberia'].concat(dow === 3 ? ['domicilio'] : [], ['cerrado', 'por_confirmar']);
      const conHoras = f.modo === 'barberia' || f.modo === 'domicilio';
      return `<div class="fila-dia" data-dow="${dow}">
        <p class="fila-dia__nombre">${esc(cap(DIAS[dow]))}</p>
        <div class="fila-dia__modo"><label for="modo-${dow}">Ese día</label>
          <select id="modo-${dow}" name="modo">${modos.map((m) => `<option value="${m}"${m === f.modo ? ' selected' : ''}>${MODOS[m]}</option>`).join('')}</select></div>
        <div><label for="abre-${dow}">Abre</label><select id="abre-${dow}" name="abre"${conHoras ? '' : ' disabled'}>${optHoras(0, 23, f.abre ?? 8)}</select></div>
        <div><label for="cierra-${dow}">Cierra</label><select id="cierra-${dow}" name="cierra"${conHoras ? '' : ' disabled'}>${optHoras(1, 24, f.cierra ?? 21)}</select></div>
      </div>`;
    }).join('');
    $('#tarifa-desde').value = est.config.domicilio_desde;
    $('#aviso-texto').value = est.config.aviso || '';
    $('[data-form-aviso] [name="activo"]').checked = Boolean(est.config.aviso_activo);
  };

  /* ---------- Eventos ---------- */
  const iniciarEventos = () => {
    // Pestañas
    const tabs = $$('[data-tab]');
    const activarTab = (nombre, enfocar = false) => {
      tabs.forEach((t) => { const on = t.dataset.tab === nombre; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && enfocar) t.focus(); });
      $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== nombre; });
    };
    tabs.forEach((t) => t.addEventListener('click', () => activarTab(t.dataset.tab)));
    $('.pestanas').addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      activarTab(sig.dataset.tab, true);
    });

    // Sesión
    $('[data-salir]').addEventListener('click', salir);
    $('[data-form-login]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const btn = $('[data-login-btn]');
      const err = $('[data-login-error]');
      err.textContent = '';
      const correo = f.correo.value.trim();
      if (!correo || !f.clave.value) { err.textContent = 'Escribe tu usuario y tu contraseña.'; return; }
      cargando(btn, true);
      try {
        await llamar('login', { usuario: correo, clave: f.clave.value });
        f.clave.value = '';
        await entrar();
      } catch (er) {
        err.textContent = er.status === 401 ? 'Usuario o contraseña incorrectos.'
          : er.status === 429 ? 'Demasiados intentos. Espera 15 minutos e intenta de nuevo.'
            : er.status ? 'No se pudo iniciar sesión. Intenta de nuevo.'
              : 'No hay conexión. Revisa tu internet e intenta de nuevo.';
      } finally { cargando(btn, false); }
    });

    // Citas
    $$('[data-filtro]').forEach((b) => b.addEventListener('click', () => { est.filtro = b.dataset.filtro; pintarCitas(); }));
    $('[data-actualizar]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      cargando(btn, true);
      try { await recargar(true); } finally { cargando(btn, false); }
    });
    $('[data-lista-citas]').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-accion]');
      if (!b) return;
      const cita = est.citas.find((c) => c.id === b.dataset.id);
      if (!cita) return;
      const a = b.dataset.accion;
      if (a === 'reprogramar') { abrirReprogramar(cita); return; }
      if (a === 'cancelar' && !b.dataset.armado) {     // dos toques para no cancelar por error
        b.dataset.armado = '1';
        b.textContent = '¿Seguro? Toca otra vez';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armado; b.textContent = 'Cancelar'; } }, 4000);
        return;
      }
      const cambios = { confirmar: ['confirmada', 'Cita confirmada. Avísale por WhatsApp.'], completar: ['completada', 'Cita marcada como completada.'], cancelar: ['cancelada', 'Cita cancelada. Avísale por WhatsApp.'], reabrir: ['pendiente', 'La cita volvió a «Por confirmar».'] }[a];
      if (cambios) { b.disabled = true; await actualizarCita(cita.id, { estado: cambios[0] }, cambios[1]); }
    });
    $('#reprog-fecha').addEventListener('change', pintarHorasReprog);
    $('[data-reprog-cancelar]').addEventListener('click', () => dlg.close());
    $('[data-form-reprog]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('[data-reprog-error]');
      const fecha = $('#reprog-fecha').value;
      const hora = Number($('#reprog-hora').value);
      if (!fecha || $('#reprog-hora').value === '') { err.textContent = 'Elige un día y una hora disponibles.'; return; }
      const btn = $('[data-reprog-guardar]');
      cargando(btn, true);
      const ok = await actualizarCita(citaEnEdicion.id, { fecha, hora }, 'Cita reprogramada. Avísale por WhatsApp.');
      cargando(btn, false);
      if (ok) dlg.close();
    });

    // Días cerrados
    $$('[data-atajo]').forEach((b) => b.addEventListener('click', () => { $('#cierre-fecha').value = claveDe(diaRD(Number(b.dataset.atajo))); }));
    $('#cierre-fecha').min = hoyClave();
    $('[data-form-cierre]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const err = $('[data-cierre-error]');
      const aviso = $('[data-cierre-citas]');
      err.textContent = ''; aviso.hidden = true;
      const fecha = f.fecha.value;
      if (!fecha) { err.textContent = 'Elige el día que vas a cerrar.'; return; }
      if (fecha < hoyClave()) { err.textContent = 'Ese día ya pasó.'; return; }
      const btn = $('[data-cierre-btn]');
      cargando(btn, true);
      try {
        const motivo = f.motivo.value.trim();
        await llamar('cierre_guardar', { fecha, tipo: f.tipo.value, motivo });
        await cargarCierres();
        pintarCierres();
        toast(`${cap(fechaLarga(fecha))} quedó cerrado en la web.`);
        const afectadas = citasActivasEn(fecha);
        if (afectadas.length) {
          aviso.innerHTML = `⚠ Ese día tienes ${afectadas.length} ${afectadas.length === 1 ? 'cita activa' : 'citas activas'}. Avísales y reprográmalas:<br>${afectadas.map((c) => `<a href="${esc(waEnlace(c.telefono, `Hola ${c.nombre.split(' ')[0]}, el ${fechaLarga(fecha)} no abro${motivo ? ` (${motivo})` : ''}. ¿Reprogramamos tu cita de las ${hora12(c.hora)}?`))}" target="_blank" rel="noopener">${esc(c.nombre)} · ${hora12(c.hora)}</a>`).join(' · ')}`;
          aviso.hidden = false;
        }
        f.motivo.value = '';
      } catch (er) {
        err.textContent = 'No se pudo cerrar el día. Intenta de nuevo.';
      } finally { cargando(btn, false); }
    });
    $('[data-lista-cierres]').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-reabrir-dia]');
      if (!b) return;
      if (!b.dataset.armado) {
        b.dataset.armado = '1';
        b.textContent = '¿Seguro? Toca otra vez';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armado; b.textContent = 'Volver a abrir'; } }, 4000);
        return;
      }
      b.disabled = true;
      try {
        await llamar('cierre_borrar', { fecha: b.dataset.reabrirDia });
        await cargarCierres();
        pintarCierres();
        toast('Día abierto otra vez.');
      } catch (er) { toast('No se pudo abrir el día. Intenta de nuevo.', true); b.disabled = false; }
    });

    // Horario
    $('[data-filas-horario]').addEventListener('change', (e) => {
      if (e.target.name !== 'modo') return;
      const fila = e.target.closest('.fila-dia');
      const conHoras = e.target.value === 'barberia' || e.target.value === 'domicilio';
      $$('[name="abre"], [name="cierra"]', fila).forEach((s) => { s.disabled = !conHoras; });
    });
    $('[data-form-horario]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('[data-horario-error]');
      err.textContent = '';
      const cambios = [];
      for (const fila of $$('.fila-dia')) {
        const dow = Number(fila.dataset.dow);
        const modo = $('[name="modo"]', fila).value;
        const conHoras = modo === 'barberia' || modo === 'domicilio';
        const abre = Number($('[name="abre"]', fila).value);
        const cierra = Number($('[name="cierra"]', fila).value);
        if (conHoras && abre >= cierra) { err.textContent = `${cap(DIAS[dow])}: la hora de cierre debe ser después de la de apertura.`; return; }
        cambios.push(conHoras ? { dow, modo, abre, cierra } : { dow, modo });
      }
      const btn = $('[data-horario-btn]');
      cargando(btn, true);
      try {
        await llamar('horario_guardar', { dias: cambios });
        await cargarHorarioConfig();
        pintarHorario();
        toast('Horario guardado. Ya se ve en la web.');
      } catch (er) { err.textContent = 'No se pudo guardar el horario. Intenta de nuevo.'; } finally { cargando(btn, false); }
    });
    $('[data-form-tarifa]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('[data-tarifa-error]');
      err.textContent = '';
      const valor = Math.round(Number($('#tarifa-desde').value));
      if (!Number.isFinite(valor) || valor < 0 || $('#tarifa-desde').value === '') { err.textContent = 'Escribe un monto válido en pesos.'; return; }
      const btn = $('[data-tarifa-btn]');
      cargando(btn, true);
      try {
        await llamar('config_guardar', { domicilio_desde: valor });
        est.config.domicilio_desde = valor;
        toast('Tarifa guardada. Ya se ve en la web.');
      } catch (er) { err.textContent = 'No se pudo guardar la tarifa. Intenta de nuevo.'; } finally { cargando(btn, false); }
    });
    $('[data-form-aviso]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const err = $('[data-aviso-error]');
      err.textContent = '';
      const texto = f.texto.value.trim();
      if (f.activo.checked && !texto) { err.textContent = 'Escribe el mensaje que quieres mostrar.'; return; }
      const btn = $('[data-aviso-btn]');
      cargando(btn, true);
      try {
        await llamar('config_guardar', { aviso: texto, aviso_activo: f.activo.checked });
        est.config.aviso = texto; est.config.aviso_activo = f.activo.checked;
        toast(f.activo.checked ? 'Aviso publicado en la web.' : 'Aviso guardado (oculto).');
      } catch (er) { err.textContent = 'No se pudo guardar el aviso. Intenta de nuevo.'; } finally { cargando(btn, false); }
    });

    document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('[data-vista="panel"]').hidden) recargar(false); });
  };

  /* ---------- Arranque ---------- */
  const recargar = async (avisar) => {
    try {
      await Promise.all([cargarCitas(), cargarCierres()]);
      const ids = new Set(pendientes().map((c) => c.id));
      if (est.pendientesVistos && [...ids].some((id) => !est.pendientesVistos.has(id))) toast('Tienes una cita nueva por confirmar.');
      est.pendientesVistos = ids;
      pintarCitas();
      pintarCierres();
      const d = new Date();
      $('[data-ultima]').textContent = `Actualizado a las ${pad(d.getHours())}:${pad(d.getMinutes())}. Se refresca solo cada minuto.`;
      if (avisar) toast('Citas actualizadas.');
    } catch (err) {
      if (err.status === 401) { sesionVencida(); return; }
      toast('No se pudo actualizar. Revisa tu conexión.', true);
    }
  };

  const sesionVencida = () => { clearInterval(est.timer); mostrar('login'); toast('Tu sesión venció. Entra de nuevo.', true); };

  const entrar = async () => {
    mostrar('panel');
    await Promise.all([recargar(false), cargarHorarioConfig().then(pintarHorario).catch(() => toast('No se pudo cargar el horario.', true))]);
    if (est.primeraCarga) { est.primeraCarga = false; if (pendientes().length) { est.filtro = 'pendientes'; pintarCitas(); } }
    clearInterval(est.timer);
    est.timer = setInterval(() => { if (!document.hidden) recargar(false); }, 60000);
  };

  iniciarEventos();
  if (!configurado) mostrar('sin-config');
  else {
    llamar('sesion').then(() => entrar()).catch(() => mostrar('login'));
  }
})();
