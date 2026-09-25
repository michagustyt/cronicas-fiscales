import { supabase } from './supabase.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    const errorMsg = document.getElementById('errorMsg');
    
    errorMsg.style.display = 'none';
    
    try {
        // 1. Autenticar al usuario con Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: contraseña
        });
        
        if (authError) throw authError;
        
        // 2. Buscar el rol del usuario en nuestra tabla 'usuarios'
        const userId = authData.user.id;
        const { data: userData, error: dbError } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', userId)
            .single();
            
        if (dbError) throw dbError;
        
        // 3. Redirigir según el rol
        const rol = userData.rol;
        if (rol === 'alumno') {
            window.location.href = 'dashboard_alumno.html';
        } else if (rol === 'docente') {
            window.location.href = 'dashboard_docente.html';
        } else if (rol === 'admin') {
            window.location.href = 'dashboard_admin.html';
        } else {
            window.location.href = 'introduccion.html';
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Ahora nos dirá el error exacto de Supabase
        errorMsg.textContent = 'Fallo al entrar: ' + (error.message || 'Error desconocido');
        errorMsg.style.display = 'block';
    }
});

// Verificar si ya hay sesión activa al cargar la página
window.addEventListener('load', async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id', session.user.id)
                .single();
                
            if (userData) {
                const rol = userData.rol;
                if (rol === 'alumno') window.location.href = 'dashboard_alumno.html';
                else if (rol === 'docente') window.location.href = 'dashboard_docente.html';
                else if (rol === 'admin') window.location.href = 'dashboard_admin.html';
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
});

// Ojo de la contraseña
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('contraseña');

if (togglePassword && passwordField) {
    togglePassword.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}