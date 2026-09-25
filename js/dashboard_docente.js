import { supabase } from './supabase.js';

let usuarioActual = null;
let misClases = [];

// ── INIT ──────────────────────────────────────
async function inicializar() {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) { window.location.href = 'login.html'; return; }

    const { data: usuario, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

    // 1. LA SEGURIDAD (Si no es docente ni admin, patéalo)
    if (dbError || !usuario || (usuario.rol !== 'docente' && usuario.rol !== 'admin')) {
        window.location.href = 'login.html'; 
        return; 
    }

    // 2. GUARDAMOS AL USUARIO (¡Tú pasaste la seguridad!)
    usuarioActual = usuario;

    // --- 3. BOTÓN VIP DE REGRESO PARA ADMIN (Aquí va, libre y feliz) ---
    if (usuario.rol === 'admin') {
        const btnAdmin = document.createElement('button');
        btnAdmin.innerHTML = '👑 Volver a Admin';
        btnAdmin.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background-color: #ff4757; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; z-index: 9999; font-weight: bold; font-family: sans-serif; box-shadow: 0px 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s;';
        btnAdmin.onmouseover = () => btnAdmin.style.transform = 'scale(1.05)';
        btnAdmin.onmouseout = () => btnAdmin.style.transform = 'scale(1)';
        btnAdmin.onclick = () => window.location.href = 'dashboard_admin.html';
        document.body.appendChild(btnAdmin);
    }
    // -------------------------------------------------------------------

    document.getElementById('userName').textContent  = usuario.nombre;
    document.getElementById('userEmail').textContent = usuario.email;
    document.getElementById('pNombre').value = usuario.nombre;
    document.getElementById('pEmail').value  = usuario.email;

    const { data: perfil } = await supabase.from('perfiles').select('*').eq('id_usuario', usuario.id).single();
    if(perfil) {
        document.getElementById('pBio').value       = perfil.bio || '';
        document.getElementById('pTelefono').value  = perfil.telefono || '';
        document.getElementById('pFecha').value     = perfil.fecha_nacimiento || '';
    }

    await cargarDatosDocente();
  } catch(e) { 
      console.error(e); 
  }
}

// ── CARGAR DATOS (Clases, Alumnos y Stats) ──────────────────
async function cargarDatosDocente() {
  try {
    // 1. Cargar clases creadas por este docente
    const { data: clases, error: errClases } = await supabase
      .from('clases')
      .select('*')
      .eq('id_docente', usuarioActual.id);

    misClases = clases || [];
    document.getElementById('stClases').textContent = misClases.length;

    // Llenar selectores de clases en los modales
    ['alClase', 'asClase', 'filtroClaseReporte'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const base = id === 'alClase' ? '<option value="">— Sin asignar —</option>' :
                   id === 'filtroClaseReporte' ? '<option value="">— Todos los alumnos —</option>' :
                   '<option value="">— Selecciona —</option>';
      sel.innerHTML = base + misClases.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
    });

    renderClases();

    // 2. Cargar alumnos que pertenecen a las clases de este docente
    const idsClases = misClases.map(c => c.id);
    
    if (idsClases.length > 0) {
      const { data: alumnos, error: errAlumnos } = await supabase
        .from('usuarios')
        .select(`
          id, nombre, email, id_clase,
          jugadores (nivel, puntaje, precision_pct)
        `)
        .eq('rol', 'alumno')
        .in('id_clase', idsClases);

      renderTablaAlumnos(alumnos || []);
      document.getElementById('stAlumnos').textContent = (alumnos || []).length;
    } else {
      document.getElementById('alumnosBody').innerHTML = '<tr><td colspan="6" class="empty-state">No tienes clases creadas, por lo tanto no hay alumnos.</td></tr>';
      document.getElementById('stAlumnos').textContent = "0";
    }

  } catch (e) {
    console.error("Error cargando datos del docente:", e);
  }
}

// ── RENDERIZAR CLASES ────────────────────────
function renderClases() {
  const cont = document.getElementById('clasesGrid');
  if (!misClases.length) { 
    cont.innerHTML = '<div class="empty-state"><div class="e-icon"></div>Aún no tienes clases. ¡Crea una!</div>'; 
    return; 
  }
  cont.innerHTML = '<div class="niv-grid">' + misClases.map(c => `
    <div class="card" style="border-left:5px solid var(--accent);">
      <div class="card-title">${escapeHtml(c.nombre)}</div>
      <p style="font-size:13px;color:#9c7a5a;margin-bottom:10px;">${escapeHtml(c.descripcion||'Sin descripción')}</p>
    </div>`).join('') + '</div>';
}

// ── RENDERIZAR TABLA DE ALUMNOS ──────────────
function renderTablaAlumnos(alumnos) {
  const body = document.getElementById('alumnosBody');
  if (!alumnos.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state">No hay alumnos asignados a tus clases todavía.</td></tr>';
    return;
  }
  body.innerHTML = alumnos.map(a => {
    const clase = misClases.find(c => c.id == a.id_clase)?.nombre || '—';
    const nivel = a.jugadores?.[0]?.nivel || 0;
    const puntaje = a.jugadores?.[0]?.puntaje || 0;
    return `<tr>
      <td>${escapeHtml(a.nombre)}</td>
      <td>${escapeHtml(a.email)}</td>
      <td>${escapeHtml(clase)}</td>
      <td class="centered"><span class="nivel-pill">${nivel}</span></td>
      <td class="centered"><span class="pts-pill">${puntaje.toLocaleString()}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="desasignarAlumno('${a.id}', '${a.nombre.replace(/'/g, "\\'")}')"><i class="fas fa-times"></i> Remover</button>
      </td>
    </tr>`;
  }).join('');
}

// ── CREAR CLASE ──────────────────────────────
document.getElementById('btnNuevaClase').addEventListener('click', () => {
  document.getElementById('claseNombre').value = '';
  document.getElementById('claseDesc').value = '';
  document.getElementById('modalClase').style.display = 'flex';
});

document.getElementById('guardarClase').addEventListener('click', async () => {
  const nombre = document.getElementById('claseNombre').value.trim();
  const desc   = document.getElementById('claseDesc').value.trim();
  if (!nombre) { Swal.fire('Error','El nombre es requerido','warning'); return; }

  const { error } = await supabase
    .from('clases')
    .insert([{ nombre: nombre, descripcion: desc, id_docente: usuarioActual.id }]);

  if (!error) {
    Swal.fire({icon:'success',title:'Clase creada',timer:1500,showConfirmButton:false});
    document.getElementById('modalClase').style.display = 'none';
    await cargarDatosDocente();
  } else {
    Swal.fire('Error', error.message, 'error');
  }
});

// ── EXPULSAR / REMOVER ALUMNO DE CLASE ──────────────────
window.desasignarAlumno = async function(id_alumno, nombre_alumno) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres remover a ${nombre_alumno} de tu clase?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, remover',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    const { error } = await supabase
      .from('usuarios')
      .update({ id_clase: null })
      .eq('id', id_alumno);

    if (!error) {
      Swal.fire('Removido', 'El alumno ha sido quitado de la clase.', 'success');
      cargarDatosDocente();
    } else {
      Swal.fire('Error', error.message, 'error');
    }
  }
};

// ── NAVEGACIÓN Y LOGOUT ──────────────────────
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {

    logoutBtn.addEventListener(
        'click',
        async () => {

            logoutBtn.disabled = true;
            logoutBtn.textContent = 'Saliendo...';

            try {

                const { error } =
                    await supabase.auth.signOut();

                if (error) {
                    throw error;
                }

                window.location.replace(
                    'inicio.html'
                );

            } catch (error) {

                console.error(
                    'Error al cerrar sesión:',
                    error
                );

                logoutBtn.disabled = false;
                logoutBtn.textContent = 'Salir';

                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo cerrar sesión',
                    text: 'Inténtalo nuevamente.'
                });
            }
        }
    );
}

window.cerrarModal = (id) => document.getElementById(id).style.display = 'none';

// Arrancar
inicializar();