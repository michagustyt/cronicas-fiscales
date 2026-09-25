import { supabase } from './supabase.js';


const registroForm =
    document.getElementById('registroForm');

const nombreInput =
    document.getElementById('nombre');

const emailInput =
    document.getElementById('email');

const passwordInput =
    document.getElementById('contraseña');

const confirmarPasswordInput =
    document.getElementById('confirmar_contraseña');

const btnRegistro =
    document.getElementById('btnRegistro');

const errorMsg =
    document.getElementById('errorMsg');

const successMsg =
    document.getElementById('successMsg');


/* =========================
   MENSAJES
========================= */

function mostrarError(mensaje) {
    successMsg.style.display = 'none';

    errorMsg.textContent = mensaje;
    errorMsg.style.display = 'block';
}


function mostrarExito(mensaje) {
    errorMsg.style.display = 'none';

    successMsg.textContent = mensaje;
    successMsg.style.display = 'block';
}


function limpiarMensajes() {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    errorMsg.textContent = '';
    successMsg.textContent = '';
}


/* =========================
   REGISTRO
========================= */

registroForm.addEventListener(
    'submit',
    async event => {

        event.preventDefault();

        limpiarMensajes();


        const nombre =
            nombreInput.value.trim();

        const email =
            emailInput.value.trim();

        const contraseña =
            passwordInput.value;

        const confirmarContraseña =
            confirmarPasswordInput.value;


        /* =========================
           VALIDACIONES
        ========================= */

        if (
            !nombre ||
            !email ||
            !contraseña ||
            !confirmarContraseña
        ) {
            mostrarError(
                'Completa todos los campos.'
            );

            return;
        }


        if (contraseña.length < 6) {
            mostrarError(
                'La contraseña debe tener al menos 6 caracteres.'
            );

            return;
        }


        if (contraseña !== confirmarContraseña) {
            mostrarError(
                'Las contraseñas no coinciden.'
            );

            return;
        }


        btnRegistro.disabled = true;
        btnRegistro.textContent =
            'Creando cuenta...';


        try {

            /* =========================
               CREAR USUARIO EN AUTH
            ========================= */

            const {
                data: authData,
                error: authError
            } = await supabase.auth.signUp({
                email,
                password: contraseña
            });


            if (authError) {
                throw authError;
            }


            if (!authData.user) {
                throw new Error(
                    'Supabase no devolvió el usuario creado.'
                );
            }


            const userId =
                authData.user.id;


            /* =========================
               CREAR USUARIO DEL SISTEMA

               IMPORTANTE:
               El rol siempre será alumno.
               Nunca viene del formulario.
            ========================= */

            const {
                error: usuarioError
            } = await supabase
                .from('usuarios')
                .insert({
                    id: userId,
                    nombre,
                    email,
                    rol: 'alumno',
                    id_clase: null
                });


            if (usuarioError) {
                throw usuarioError;
            }


            /* =========================
               CREAR PERFIL
            ========================= */

            const {
                error: perfilError
            } = await supabase
                .from('perfiles')
                .insert({
                    id_usuario: userId
                });


            if (perfilError) {
                throw perfilError;
            }


            /* =========================
               CREAR PROGRESO / JUGADOR
            ========================= */

            const {
                error: jugadorError
            } = await supabase
                .from('jugadores')
                .insert({
                    id: userId,
                    nombre
                });


            if (jugadorError) {
                throw jugadorError;
            }


            /* =========================
               REGISTRO CORRECTO
            ========================= */

            mostrarExito(
                '¡Cuenta creada correctamente! Redirigiendo al inicio de sesión...'
            );


            registroForm.reset();


            setTimeout(() => {
                window.location.replace(
                    'login.html'
                );
            }, 1800);


        } catch (error) {

            console.error(
                'Error al registrar alumno:',
                error
            );


            const mensaje =
                error.message?.toLowerCase() || '';


            if (
                mensaje.includes('already registered') ||
                mensaje.includes('already been registered')
            ) {
                mostrarError(
                    'Ese correo ya tiene una cuenta registrada.'
                );

            } else {

                mostrarError(
                    'No fue posible crear la cuenta. ' +
                    'Inténtalo nuevamente.'
                );
            }


            btnRegistro.disabled = false;
            btnRegistro.textContent =
                'Crear cuenta de alumno';
        }
    }
);