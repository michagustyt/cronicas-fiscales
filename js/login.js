import { supabase } from './supabase.js';

const loginForm =
    document.getElementById('loginForm');

const emailInput =
    document.getElementById('email');

const passwordInput =
    document.getElementById('contraseña');

const errorMsg =
    document.getElementById('errorMsg');

const btnLogin =
    document.getElementById('btnLogin');

const togglePassword =
    document.getElementById('togglePassword');


/* =========================
   MOSTRAR ERROR
========================= */

function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.style.display = 'block';
}


/* =========================
   OCULTAR ERROR
========================= */

function ocultarError() {
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
}


/* =========================
   REDIRECCIÓN SEGÚN ROL
========================= */

function redirigirSegunRol(rol) {

    switch (rol) {

        case 'alumno':
            window.location.replace(
                'dashboard_alumno.html'
            );
            break;


        case 'docente':
            window.location.replace(
                'dashboard_docente.html'
            );
            break;


        case 'admin':
            window.location.replace(
                'dashboard_admin.html'
            );
            break;


        default:
            throw new Error(
                'El usuario tiene un rol no válido.'
            );
    }
}


/* =========================
   OBTENER ROL DEL USUARIO
========================= */

async function obtenerRol(userId) {

    const {
        data: usuario,
        error
    } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();


    if (error) {
        throw error;
    }


    if (!usuario || !usuario.rol) {
        throw new Error(
            'No se encontró el perfil del usuario.'
        );
    }


    return usuario.rol;
}


/* =========================
   ENVIAR LOGIN
========================= */

loginForm.addEventListener(
    'submit',
    async event => {

        event.preventDefault();

        ocultarError();


        const email =
            emailInput.value.trim();

        const contraseña =
            passwordInput.value;


        if (!email || !contraseña) {
            mostrarError(
                'Completa todos los campos.'
            );

            return;
        }


        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';


        try {

            /* =========================
               AUTENTICACIÓN
            ========================= */

            const {
                data,
                error
            } = await supabase.auth
                .signInWithPassword({
                    email,
                    password: contraseña
                });


            if (error) {
                throw error;
            }


            if (!data.user) {
                throw new Error(
                    'No fue posible obtener el usuario.'
                );
            }


            /* =========================
               OBTENER ROL
            ========================= */

            const rol =
                await obtenerRol(
                    data.user.id
                );


            /* =========================
               REDIRECCIÓN
            ========================= */

            redirigirSegunRol(rol);


        } catch (error) {

            console.error(
                'Error al iniciar sesión:',
                error
            );


            if (
                error.message
                    ?.toLowerCase()
                    .includes(
                        'invalid login credentials'
                    )
            ) {

                mostrarError(
                    'Correo o contraseña incorrectos.'
                );

            } else {

                mostrarError(
                    'No fue posible iniciar sesión. ' +
                    'Inténtalo nuevamente.'
                );

            }


            btnLogin.disabled = false;
            btnLogin.textContent =
                'Iniciar Sesión';
        }
    }
);


/* =========================
   COMPROBAR SESIÓN EXISTENTE
========================= */

async function comprobarSesion() {

    try {

        const {
            data: { session },
            error
        } = await supabase.auth
            .getSession();


        if (error) {
            throw error;
        }


        if (!session) {
            return;
        }


        const rol =
            await obtenerRol(
                session.user.id
            );


        redirigirSegunRol(rol);


    } catch (error) {

        console.error(
            'Error verificando sesión:',
            error
        );

    }
}


/* =========================
   MOSTRAR / OCULTAR
   CONTRASEÑA
========================= */

if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        'click',
        () => {

            const mostrando =
                passwordInput.type === 'text';


            passwordInput.type =
                mostrando
                    ? 'password'
                    : 'text';


            const icono =
                togglePassword.querySelector('i');


            if (!icono) {
                return;
            }


            icono.classList.toggle(
                'fa-eye',
                mostrando
            );

            icono.classList.toggle(
                'fa-eye-slash',
                !mostrando
            );
        }
    );
}


/* =========================
   INICIALIZACIÓN
========================= */

comprobarSesion();