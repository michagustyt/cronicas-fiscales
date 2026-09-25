import { supabase } from './supabase.js';

let datosClases = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtenemos los docentes (usuarios con rol 'docente')
        const { data: docentes, error: errDocentes } = await supabase
            .from('usuarios')
            .select('id, nombre')
            .eq('rol', 'docente');

        if (errDocentes) throw errDocentes;

        const docenteSelect = document.getElementById('docente_select');
        docentes.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = d.nombre;
            docenteSelect.appendChild(option);
        });

        // Obtenemos todas las clases para el select dependiente
        const { data: clases, error: errClases } = await supabase
            .from('clases')
            .select('id, nombre, id_docente');
            
        if (errClases) throw errClases;
        datosClases = clases;

    } catch (e) {
        console.error('Error cargando datos iniciales:', e);
    }
});

// NUEVO: Ocultar/Mostrar selector de maestro según el rol
document.getElementById('rol').addEventListener('change', (e) => {
    const seccionClase = document.getElementById('seccion_clase');
    const docenteSelect = document.getElementById('docente_select');
    const claseSelect = document.getElementById('clase_select');
    const labelClase = document.getElementById('label_clase');

    if (e.target.value === 'alumno') {
        seccionClase.style.display = 'block';
    } else {
        // Si es Docente o Admin, ocultamos y limpiamos las clases
        seccionClase.style.display = 'none';
        docenteSelect.value = '';
        claseSelect.value = '';
        claseSelect.style.display = 'none';
        labelClase.style.display = 'none';
    }
});

// Lógica para mostrar las clases según el docente elegido
document.getElementById('docente_select').addEventListener('change', (e) => {
    const idDocente = e.target.value;
    const claseSelect = document.getElementById('clase_select');
    const labelClase = document.getElementById('label_clase');
    
    claseSelect.innerHTML = '<option value="">— Selecciona la Clase —</option>';
    
    if (idDocente) {
        const clasesDocente = datosClases.filter(c => c.id_docente === idDocente);
        clasesDocente.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            claseSelect.appendChild(option);
        });
        claseSelect.style.display = 'block';
        labelClase.style.display = 'block';
    } else {
        claseSelect.style.display = 'none';
        labelClase.style.display = 'none';
    }
});

document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    const confirmar_contraseña = document.getElementById('confirmar_contraseña').value;
    const rol = document.getElementById('rol').value;
    const id_clase = document.getElementById('clase_select').value;
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    if (contraseña !== confirmar_contraseña) {
        errorMsg.textContent = 'Las contraseñas no coinciden.';
        errorMsg.style.display = 'block';
        return;
    }
    
    try {
        // 1. Crear el usuario en la Autenticación de Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: contraseña,
        });

        if (authError) throw authError;

        // Validar si id_clase está vacío para mandar 'null' a la base de datos
        const classIdToInsert = (rol === 'alumno' && id_clase) ? parseInt(id_clase) : null;

        // 2. Guardar sus datos extra en nuestra tabla pública 'usuarios'
        const userId = authData.user.id;
        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([
                { 
                    id: userId, 
                    nombre: nombre, 
                    email: email, 
                    rol: rol, 
                    id_clase: classIdToInsert
                }
            ]);

        if (dbError) throw dbError;

        // 3. Crear su perfil vacío
        await supabase.from('perfiles').insert([{ id_usuario: userId }]);

        // 4. Crear su entrada en el ranking de jugadores
        await supabase.from('jugadores').insert([{ id: userId, nombre: nombre }]);

        successMsg.textContent = '¡Cuenta creada! Redirigiendo a login...';
        successMsg.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        errorMsg.textContent = error.message || 'Error al crear cuenta. Intenta de nuevo.';
        errorMsg.style.display = 'block';
    }
});