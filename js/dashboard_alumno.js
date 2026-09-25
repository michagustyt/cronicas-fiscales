import { supabase } from './supabase.js';

const NIVELES = [
  'La Amenaza del Fisco','La Travesía del IVA Perdido','El Misterio de las Deducciones',
  'La Batalla de los Impuestos','El Laberinto de la Nómina','Los Secretos del CFDI',
  'La Conspiración Contable','El Último Recurso Fiscal','La Victoria Final'
];

let usuarioActual = null;

async function inicializar() {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) { 
        window.location.href = 'login.html'; 
        return; 
    }

    // 1. Obtener usuario (Hacemos consultas separadas para evitar errores de estructura)
    const { data: usuario, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (dbError) throw new Error("Error cargando usuario: " + dbError.message);
    if (!usuario || (usuario.rol !== 'alumno' && usuario.rol !== 'admin')) {
          window.location.href = 'login.html'; 
        return; 
    }
    
    usuarioActual = usuario;

    if (usuario.rol === 'admin') {
        const btnAdmin = document.createElement('button');
        btnAdmin.innerHTML = 'Volver a Admin';
        btnAdmin.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background-color: #ff4757; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; z-index: 9999; font-weight: bold; font-family: sans-serif; box-shadow: 0px 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s;';
        btnAdmin.onmouseover = () => btnAdmin.style.transform = 'scale(1.05)';
        btnAdmin.onmouseout = () => btnAdmin.style.transform = 'scale(1)';
        btnAdmin.onclick = () => window.location.href = 'dashboard_admin.html';
        document.body.appendChild(btnAdmin);
    }

    // 2. Llenar HTML básico
    document.getElementById('userName').textContent  = usuario.nombre;
    document.getElementById('userEmail').textContent = usuario.email;
    if (document.getElementById('pNombre')) document.getElementById('pNombre').value = usuario.nombre;
    if (document.getElementById('pEmail')) document.getElementById('pEmail').value  = usuario.email;

    // 3. Buscar nombre de la clase y docente manualmente
    let nombreClase = 'Sin clase';
    let nombreDocente = 'Sin docente';

    if (usuario.id_clase) {
        const { data: clase } = await supabase.from('clases').select('*').eq('id', usuario.id_clase).single();
        if (clase) {
            nombreClase = clase.nombre;
            if (clase.id_docente) {
                const { data: docente } = await supabase.from('usuarios').select('nombre').eq('id', clase.id_docente).single();
                if (docente) nombreDocente = docente.nombre;
            }
        }
    }

    const classDiv = document.getElementById('userClass');
    if (classDiv) {
        classDiv.innerHTML = `
          <div style="margin-bottom:4px;"><strong>Clase:</strong> ${nombreClase}</div>
          <div><strong>Docente:</strong> ${nombreDocente}</div>
        `;
    }

    await cargarProgreso();
  } catch(e) { 
      console.error(e);
      alert("Error al cargar el panel: " + e.message); // Esto nos dirá qué falló
  }
}

async function cargarProgreso() {
  try {
    const { data: jugador } = await supabase.from('jugadores').select('*').eq('id', usuarioActual.id).single();

    const nivel = jugador ? (jugador.nivel || 0) : 0;
    const puntaje = jugador ? (jugador.puntaje || 0) : 0;
    const prec = jugador ? (jugador.precision_pct || 0) : 0;

    document.getElementById('statNivel').textContent = nivel;
    document.getElementById('statPuntaje').textContent = puntaje.toLocaleString();
    document.getElementById('statPrecision').textContent = prec + '%';
    document.getElementById('statNiveles').textContent = `${nivel}/9`;

    const pct = Math.round((nivel / 9) * 100);
    const resumenDiv = document.getElementById('resumenProgreso');
    if (resumenDiv) {
        resumenDiv.innerHTML = `
          <div style="margin-bottom:10px;font-weight:700;color:var(--text-light, #fff);">Avance general: ${pct}%</div>
          <div class="prog-bar-wrap"><div class="prog-bar-fill" style="width:${pct}%"></div></div>
          <p style="margin-top:10px;font-size:13px;opacity:0.8;">Has completado <strong>${nivel}</strong> de <strong>9</strong> capítulos con un puntaje de <strong>${puntaje.toLocaleString()} pts</strong>.</p>
        `;
    }

    renderActividades(jugador);
  } catch(e) { console.error("Error en progreso:", e); }
}

function renderActividades(jugador) {
  const grid = document.getElementById('nivGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  NIVELES.forEach((nombre, i) => {
    const num = i + 1;
    const nivelJugador = jugador ? (jugador.nivel || 0) : 0;
    const completado = nivelJugador >= num;
    const actual = nivelJugador === (num - 1);
    
    const card = document.createElement('div');
    card.className = 'niv-card' + (completado ? ' completado' : '');
    card.innerHTML = `
      <div class="niv-num">Capítulo ${num}</div>
      <div class="niv-name">${nombre}</div>
      <span class="niv-status ${completado ? 'done' : actual ? 'pending' : 'locked'}">
        ${completado ? 'Completado' : actual ? 'Disponible' : 'Bloqueado'}
      </span>
    `;
    
    if (completado || actual) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => window.location.href = `html/capitulo${num}.html`);    }
    grid.appendChild(card);
  });
}

// ── NAVEGACIÓN Y LOGOUT ──────────────────────
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(btn.dataset.section);
    if(target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'login.html';
    });
}

window.cerrarModal = (id) => {
    const mod = document.getElementById(id);
    if(mod) mod.style.display = 'none';
};

inicializar();