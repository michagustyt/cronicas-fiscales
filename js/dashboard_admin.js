import { supabase } from './supabase.js';

let usuarioActual = null;
let todosUsuarios = [];
let todasClases = [];
let todosJugadores = [];

async function inicializar() {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) { window.location.href = 'login.html'; return; }

    const { data: usuario, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (dbError || !usuario || usuario.rol !== 'admin') { 
        window.location.href = 'login.html'; return; 
    }

    usuarioActual = usuario;
    document.getElementById('userName').textContent  = usuario.nombre;
    document.getElementById('userEmail').textContent = usuario.email;

    await cargarTodo();
  } catch(e) { console.error(e); }
}

// Cargar toda la base de datos a memoria para armar las tablas
async function cargarTodo() {
    const [resUsers, resClases, resJugadores] = await Promise.all([
        supabase.from('usuarios').select('*'),
        supabase.from('clases').select('*'),
        supabase.from('jugadores').select('*').order('puntaje', { ascending: false })
    ]);

    todosUsuarios = resUsers.data || [];
    todasClases = resClases.data || [];
    todosJugadores = resJugadores.data || [];

    cargarStats();
    cargarTopAlumnos();
    cargarDocentes();
    cargarClases();
    cargarAlumnos();
    cargarReporte();
}

function cargarStats() {
    const docentes = todosUsuarios.filter(u => u.rol === 'docente').length;
    const alumnos = todosUsuarios.filter(u => u.rol === 'alumno').length;

    document.getElementById('stTotal').textContent = todosUsuarios.length;
    document.getElementById('stDocentes').textContent = docentes;
    document.getElementById('stAlumnos').textContent = alumnos;
    document.getElementById('stClases').textContent = todasClases.length;
}

function cargarTopAlumnos() {
    const top = todosJugadores.slice(0, 5);
    const body = document.getElementById('topBody');
    if (!top.length) { body.innerHTML = '<tr><td colspan="5" class="empty-state">Sin datos aún.</td></tr>'; return; }
    
    body.innerHTML = top.map((a,i) => {
        const infoUser = todosUsuarios.find(u => u.id === a.id);
        const infoClase = todasClases.find(c => c.id === infoUser?.id_clase);
        const infoDocente = todosUsuarios.find(u => u.id === infoClase?.id_docente);

        return `<tr>
            <td class="centered">${['🥇','🥈','🥉','4.','5.'][i]}</td>
            <td>${a.nombre}</td>
            <td>${infoDocente ? infoDocente.nombre : '—'}</td>
            <td class="centered"><span class="nivel-pill">${a.nivel}</span></td>
            <td class="centered"><span class="pts-pill">${a.puntaje.toLocaleString()}</span></td>
        </tr>`;
    }).join('');
}

function cargarDocentes() {
    const docentes = todosUsuarios.filter(u => u.rol === 'docente');
    const body = document.getElementById('docentesBody');
    if (!docentes.length) { body.innerHTML = '<tr><td colspan="6" class="empty-state">Sin docentes.</td></tr>'; return; }

    body.innerHTML = docentes.map(d => {
        const clasesDelDocente = todasClases.filter(c => c.id_docente === d.id);
        const idsClases = clasesDelDocente.map(c => c.id);
        const alumnosAsignados = todosUsuarios.filter(u => idsClases.includes(u.id_clase)).length;

        return `<tr>
            <td>${d.nombre}</td>
            <td>${d.email}</td>
            <td class="centered">${alumnosAsignados}</td>
            <td class="centered">${clasesDelDocente.length}</td>
            <td class="centered"><span class="badge ${d.activo?'badge-ok':'badge-off'}">${d.activo?'Activo':'Inactivo'}</span></td>
            <td class="centered">
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${d.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function cargarClases() {
    const body = document.getElementById('clasesBody');
    if (!todasClases.length) { body.innerHTML = '<tr><td colspan="5" class="empty-state">Sin clases.</td></tr>'; return; }

    body.innerHTML = todasClases.map(c => {
        const profe = todosUsuarios.find(u => u.id === c.id_docente);
        const totalAlumnos = todosUsuarios.filter(u => u.id_clase === c.id).length;
        
        return `<tr>
            <td>${c.nombre}</td>
            <td>${profe ? profe.nombre : '—'}</td>
            <td class="centered"><span class="badge badge-alumno">${totalAlumnos}</span></td>
            <td>${c.descripcion || '—'}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarClase(${c.id})"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

function cargarAlumnos() {
    const alumnos = todosUsuarios.filter(u => u.rol === 'alumno');
    const body = document.getElementById('alumnosBody');
    if (!alumnos.length) { body.innerHTML = '<tr><td colspan="6" class="empty-state">Sin alumnos.</td></tr>'; return; }

    body.innerHTML = alumnos.map(a => {
        const infoClase = todasClases.find(c => c.id === a.id_clase);
        const infoDocente = todosUsuarios.find(u => u.id === infoClase?.id_docente);

        return `<tr>
            <td>${a.nombre}</td>
            <td>${a.email}</td>
            <td>${infoDocente ? infoDocente.nombre : '—'}</td>
            <td>${infoClase ? infoClase.nombre : '—'}</td>
            <td class="centered"><span class="badge ${a.activo?'badge-ok':'badge-off'}">${a.activo?'Activo':'Inactivo'}</span></td>
            <td class="centered">
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${a.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function cargarReporte() {
    const body = document.getElementById('reporteBody');
    if (!todosJugadores.length) { body.innerHTML = '<tr><td colspan="6" class="empty-state">Sin datos.</td></tr>'; return; }

    body.innerHTML = todosJugadores.map(j => {
        const infoUser = todosUsuarios.find(u => u.id === j.id);
        const infoClase = todasClases.find(c => c.id === infoUser?.id_clase);
        const infoDocente = todosUsuarios.find(u => u.id === infoClase?.id_docente);
        const fecha = new Date(j.timestamp).toLocaleDateString('es-MX');

        return `<tr>
            <td>${j.nombre}</td>
            <td>${infoDocente ? infoDocente.nombre : '—'}</td>
            <td class="centered"><span class="nivel-pill">${j.nivel}</span></td>
            <td class="centered"><span class="pts-pill">${j.puntaje.toLocaleString()}</span></td>
            <td class="centered">${j.precision_pct}%</td>
            <td>${fecha}</td>
        </tr>`;
    }).join('');
}

// ── ELIMINACIONES ──
window.eliminarUsuario = async function(id) {
    if(confirm("¿Seguro que deseas eliminar este usuario?")) {
        await supabase.from('usuarios').delete().eq('id', id);
        cargarTodo();
    }
}
window.eliminarClase = async function(id) {
    if(confirm("¿Seguro que deseas eliminar esta clase?")) {
        await supabase.from('clases').delete().eq('id', id);
        cargarTodo();
    }
}

// ── NAVEGACIÓN Y LOGOUT ──────────────────────
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// PDF Generador
document.getElementById('btnPDF').addEventListener('click', () => {
  if (!todosJugadores.length) { alert('Sin datos'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Reporte General - Crónicas Fiscales', 15, 20);
  doc.autoTable({
    startY: 30,
    head: [['Alumno', 'Nivel', 'Puntaje', 'Precisión']],
    body: todosJugadores.map(j => [j.nombre, j.nivel, j.puntaje, j.precision_pct + '%'])
  });
  doc.save('reporte_admin.pdf');
});

document.getElementById('btnRefresh').addEventListener('click', cargarTodo);

inicializar();