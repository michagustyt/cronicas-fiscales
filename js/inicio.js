import { supabase } from './supabase.js';

const audio = document.getElementById('background-music');
const musicIcon = document.getElementById('music-icon');
const musicText = document.getElementById('music-text');

let isMusicPlaying = false;

if (audio) {
    audio.volume = 0.3;
}


/* =========================
   SESIÓN
========================= */

async function obtenerSesion() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        console.error('Error al obtener la sesión:', error.message);
        return null;
    }

    return session;
}


/* =========================
   USUARIO
========================= */

async function obtenerUsuario(userId) {
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('nombre, email, rol')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error al obtener usuario:', error.message);
        return null;
    }

    return usuario;
}


/* =========================
   REDIRECCIÓN SEGÚN ROL
========================= */

function redirigirSegunRol(rol) {
    switch (rol) {
        case 'alumno':
            window.location.href = 'dashboard_alumno.html';
            break;

        case 'docente':
            window.location.href = 'dashboard_docente.html';
            break;

        case 'admin':
            window.location.href = 'dashboard_admin.html';
            break;

        default:
            window.location.href = 'login.html';
    }
}


/* =========================
   COMENZAR AVENTURA
========================= */

async function iniciarJuego() {
    const session = await obtenerSesion();

    // Si no tiene sesión, primero debe iniciar sesión.
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = await obtenerUsuario(session.user.id);

    // Si existe sesión pero no encontramos al usuario,
    // lo mandamos nuevamente al login.
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    redirigirSegunRol(usuario.rol);
}


/* =========================
   MÚSICA
========================= */

function toggleMusic() {
    if (!audio) {
        console.error('No se encontró el elemento de audio.');
        return;
    }

    if (isMusicPlaying) {
        audio.pause();

        isMusicPlaying = false;

        if (musicIcon) {
            musicIcon.textContent = '🎵';
        }

        if (musicText) {
            musicText.textContent = 'Música';
        }

        return;
    }

    audio.play()
        .then(() => {
            isMusicPlaying = true;

            if (musicIcon) {
                musicIcon.textContent = '🔇';
            }

            if (musicText) {
                musicText.textContent = 'Silencio';
            }
        })
        .catch(error => {
            console.error('No se pudo reproducir el audio:', error);
        });
}


/* =========================
   FUNCIONES DISPONIBLES
   PARA EL HTML
========================= */

window.toggleMusic = toggleMusic;
window.iniciarJuego = iniciarJuego;