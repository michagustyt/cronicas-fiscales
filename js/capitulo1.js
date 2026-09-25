import { supabase } from './supabase.js';

const NIVEL_ACTUAL = 1;
const TITULO_NIVEL = "Nivel 1: La Amenaza del Fisco";

const personajes = {
    Narrador: { img: "../assets/personajes/brenda.png", color: "#b8dcecff" },
    Brenda:   { img: "../assets/personajes/brenda2.jpeg", color: "#ecd089ff" },
    Rogelio:  { img: "../assets/personajes/donrogelio.jpeg", color: "#b8c2f3ff" },
    Carlos:   { img: "../assets/personajes/carlos1.jpeg", color: "#f3b8c2ff" },
    Jose:     { img: "../assets/personajes/jose2.jpeg", color: "#f3c2b8ff" }
};

const dialogos = [
    { personaje: "Narrador", texto: "¡¡Ay!, ¡Hola Godín. ¿Estás listo para enfrentar el Fisco?. Antes de empezar conoce al equipo de trabajo que te acompañará durante la aventura.", fondo: "../assets/oficina.png" },
    { personaje: "Rogelio",  texto: "Es el dueño de 'Seguros Patito, S.A. de C.V.'. Un hombre presumido y totalmente desconectado de la operación diaria de su empresa. Prefiere practicar su swing de golf en la oficina y mezclar sus gastos personales con los de la compañía. Para él, la 'sinergia' probablemente suena a un platillo exótico.", fondo: "../assets/oficina.png" },
    { personaje: "Carlos",   texto: "Es el héroe de esta historia. Un becario veinteañero lleno de optimismo y ganas de aprender. Aunque es ingenuo y tiene poca experiencia, su actitud positiva es su mejor herramienta para navegar el caótico mundo corporativo de 'Seguros Patito'. Es el godín promedio en su primer día, aún sin ser aplastado por la rutina.", fondo: "../assets/oficina.png" },
    { personaje: "Brenda",   texto: "Es la gerente de la oficina y la jefa directa de Carlos. Vive en un estado de estrés perpetuo, ansiosa y totalmente dependiente del café para sobrevivir al día. Su escritorio, lleno de post-its y papeles, es un reflejo de su caos mental. Aunque regaña a Carlos, en el fondo intenta guiarlo.", fondo: "../assets/oficina.png" },
    { personaje: "Jose",     texto: "Es el contador veterano de la oficina. Conoce las leyes fiscales de memoria, pero nunca tiene tiempo para explicar nada porque siempre apaga incendios.", fondo: "../assets/oficina.png" },
    { personaje: "Narrador", texto: "¡¡Bienvenido al Nivel 1, Godín! Prepárate.", fondo: "../assets/oficina.png" },
    { personaje: "Brenda",   texto: "¡Oye! ¡Tenemos un problema! ¡El Fisco viene!", fondo: "../assets/gente.png" },
    { personaje: "Rogelio",  texto: "Responde bien a las preguntas para salvar a la oficina.", fondo: "../assets/oficina.png" }
];

// Preguntas locales (fallback si Supabase falla)
const preguntasLocales = [
    {
        id: "pregunta_1", orden: 1, activa: true,
        pregunta: "1.- La empresa compra un flamenco rosa de plástico para decorar la oficina. ¿Cómo se registra contablemente?",
        opciones: ["Activo Fijo.", "Gasto de Decoración.", "Activo Biológico No Circulante.", "Tirar el recibo y hacerse guaje."],
        respuesta: 0,
        feedback: ["Correcto: El flamenco es un bien tangible con vida útil mayor a un año, se clasifica como Activo Fijo.", "Incorrecto: Un gasto de decoración aplica para artículos de consumo inmediato, no para bienes con vida útil prolongada.", "Incorrecto: Los activos biológicos son organismos vivos (ganado, plantas), no decoraciones de plástico.", "Incorrecto: Tirar el recibo genera problemas fiscales y contables."],
        fondo: "../assets/capitulo1/flamenco.jpg"
    },
    {
        id: "pregunta_2", orden: 2, activa: true,
        pregunta: "2.- El jefe paga una cena elegante, pero fue solo. ¿Cómo se registra?",
        opciones: ["Gasto de Venta (deducible)", "Llamar al restaurante", "Gasto No Deducible", "Tirar la factura y decir que se perdió"],
        respuesta: 2,
        feedback: ["Incorrecto: Para ser deducible, los gastos de representación deben tener sustancia de negocio.", "Incorrecto: Llamar al restaurante no resuelve el problema fiscal.", "Correcto: Una cena del jefe en solitario sin propósito de negocio comprobado es un Gasto No Deducible.", "Incorrecto: Tirar la factura no elimina la obligación fiscal."],
        fondo: "../assets/capitulo1/auto_jefe.jpg"
    }
    // (Acorté las locales aquí para el ejemplo, pero tú puedes dejar tus 10 completas si prefieres)
];

let preguntas = [];
let puntajeNivel = 0;
let preguntaActual = 0;
let indexDialogo = 0;
let vidas = 5;
let userId = null;
let nombreJugador = "Godín";
let intervaloMaquinaEscribir;
let respondiendo = false;

// --- Elementos del DOM ---
const dialogoEl       = document.getElementById("dialogo");
const juegoEl         = document.getElementById("juego");
const barraSuperiorEl = document.getElementById("barraSuperior");
const vidasEl         = document.getElementById("vidas");
const avatarImgEl     = document.getElementById("avatarImg");
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const textoDialogoEl  = document.getElementById("textoDialogo");
const mensajeEl       = document.getElementById("mensaje");
const mensajeContenidoEl = document.getElementById("mensajeContenido");
const mensajeTextoEl  = document.getElementById("mensajeTexto");
const mensajeBotonEl  = document.getElementById("mensajeBotonPrincipal");
const gameContainerEl = document.querySelector(".game-container");

// --- Música ---
const musicButtonEl      = document.getElementById("musicButton");
const backgroundMusicEl  = document.getElementById("backgroundMusic");
let isMusicPlaying = false;

function playMusic() {
    if (localStorage.getItem('musicEnabled') === 'false') {
        musicButtonEl.innerHTML = '<span>🎵</span> Música';
        return;
    }
    if (!isMusicPlaying && backgroundMusicEl) {
        backgroundMusicEl.play().then(() => {
            isMusicPlaying = true;
            musicButtonEl.innerHTML = '<span>🔇</span> Silencio';
            localStorage.setItem('musicEnabled', 'true');
        }).catch(e => {});
    }
}

if(musicButtonEl) {
    musicButtonEl.onclick = () => {
        if (isMusicPlaying) {
            backgroundMusicEl.pause();
            isMusicPlaying = false;
            musicButtonEl.innerHTML = '<span>🎵</span> Música';
            localStorage.setItem('musicEnabled', 'false');
        } else {
            backgroundMusicEl.play();
            isMusicPlaying = true;
            musicButtonEl.innerHTML = '<span>🔇</span> Silencio';
            localStorage.setItem('musicEnabled', 'true');
        }
    };
}

// ── CONEXIÓN SUPABASE: SESIÓN ────────────────────────
async function cargarSesion() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            window.location.href = '../login.html';
            return false;
        }
        userId = session.user.id;
        
        // Obtener el nombre del jugador para felicitarlo
        const { data: user } = await supabase.from('usuarios').select('nombre').eq('id', userId).single();
        if(user) nombreJugador = user.nombre;
        
        return true;
    } catch (error) {
        console.error('Error al obtener sesión:', error);
        window.location.href = '../login.html';
        return false;
    }
}

// ── CONEXIÓN SUPABASE: PREGUNTAS ────────────────────────
async function cargarPreguntas() {
    try {
        const { data, error } = await supabase
            .from('preguntas_json')
            .select('contenido')
            .eq('nivel', NIVEL_ACTUAL)
            .single();

        if (error) throw error;

        if (data && data.contenido) {
            preguntas = data.contenido;
            console.log(`✅ ${preguntas.length} preguntas cargadas desde Supabase`);
            return true;
        }
        throw new Error('Sin datos en BD');
    } catch (error) {
        console.warn('⚠️ Falló Supabase, usando preguntas locales:', error.message);
        preguntas = [...preguntasLocales];
        return true;
    }
}

// --- Inicialización del Nivel ---
async function inicializarNivel() {
    document.title = TITULO_NIVEL;
    const info = document.getElementById("nivelInfo");
    if(info) info.textContent = TITULO_NIVEL;

    if (!await cargarSesion()) return;

    const cargadas = await cargarPreguntas();
    if (!cargadas || preguntas.length === 0) {
        Swal.fire({ title: "Error", text: "No hay preguntas disponibles.", icon: "error" })
            .then(() => {window.location.href = '../dashboard_alumno.html'; });
        return;
    }

    actualizarVidas();
    playMusic();
    mostrarDialogo(dialogos[indexDialogo]);
}

// --- Lógica de Diálogos ---
function mostrarDialogo(dialogo) {
    if (!dialogo) return;
    if (dialogo.fondo) {
        document.body.style.backgroundImage = `url('${dialogo.fondo}')`;
    }
    const p = personajes[dialogo.personaje];
    avatarImgEl.src = p.img;
    nombrePersonajeEl.textContent = dialogo.personaje;
    const burbuja = document.querySelector(".burbuja");
    burbuja.style.borderColor = p.color;
    burbuja.style.borderWidth = '4px';
    burbuja.style.backgroundColor = '';
    avatarImgEl.style.borderColor = p.color;
    textoDialogoEl.textContent = "";
    let i = 0;
    const velocidad = 30;
    const texto = dialogo.texto.normalize("NFC");
    if (intervaloMaquinaEscribir) clearInterval(intervaloMaquinaEscribir);
    intervaloMaquinaEscribir = setInterval(() => {
        if (i < texto.length) { textoDialogoEl.textContent += texto[i]; i++; }
        else { clearInterval(intervaloMaquinaEscribir); }
    }, velocidad);
}

window.siguienteDialogo = () => {
    if (respondiendo) return;
    if (intervaloMaquinaEscribir && textoDialogoEl.textContent.length < dialogos[indexDialogo].texto.length) {
        clearInterval(intervaloMaquinaEscribir);
        textoDialogoEl.textContent = dialogos[indexDialogo].texto;
        return;
    }
    indexDialogo++;
    if (indexDialogo < dialogos.length) {
        mostrarDialogo(dialogos[indexDialogo]);
    } else {
        iniciarJuego();
    }
};

// --- Lógica del Juego ---
function iniciarJuego() {
    respondiendo = true;
    dialogoEl.style.animation = "fadeOut 0.5s ease-out forwards";
    setTimeout(() => {
        dialogoEl.classList.add("oculto");
        barraSuperiorEl.classList.remove("oculto");
        juegoEl.classList.remove("oculto");
        juegoEl.style.zIndex = 5;
        if (preguntas.length > 0 && preguntas[0].fondo) {
            document.body.style.backgroundImage = `url('${preguntas[0].fondo}')`;
        }
        mostrarPregunta();
    }, 500);
}

function mostrarPregunta() {
    const barra = document.getElementById('nivelProgreso');
    if(barra && typeof preguntas !== 'undefined' && preguntas.length > 0) {
        const p = (preguntaActual / preguntas.length) * 100;
        barra.style.width = p + '%';
    }
    if (preguntaActual >= preguntas.length) { mostrarVictoria(); return; }
    const p = preguntas[preguntaActual];
    juegoEl.classList.add('fading-out');
    setTimeout(() => {
        document.getElementById("pregunta").textContent = p.pregunta;
        if (p.fondo) { document.body.style.backgroundImage = `url('${p.fondo}')`; }
        const opcionesDiv = document.querySelector(".opciones");
        opcionesDiv.innerHTML = "";
        p.opciones.forEach((opcion, i) => {
            const btn = document.createElement("button");
            btn.textContent = opcion;
            btn.dataset.index = i;
            btn.onclick = () => verificarRespuesta(btn, i);
            opcionesDiv.appendChild(btn);
        });
        juegoEl.classList.remove('fading-out');
        respondiendo = false;
    }, 400);
}

function verificarRespuesta(btnPresionado, indice) {
    if (respondiendo) return;
    respondiendo = true;
    const p = preguntas[preguntaActual];
    const esCorrecta = (indice === p.respuesta);
    const feedbackTexto = p.feedback[indice];
    document.querySelectorAll(".opciones button").forEach(btn => { btn.disabled = true; });
    
    if (esCorrecta) {
        if(window.playCorrect) playCorrect();
        btnPresionado.classList.add("correct");
        puntajeNivel++;
        setTimeout(() => {
            mostrarMensaje(feedbackTexto, "correcto");
            mensajeBotonEl.textContent = "¡Siguiente!";
            mensajeBotonEl.onclick = () => { cerrarMensaje(); preguntaActual++; mostrarPregunta(); };
        }, 1000);
    } else {
        if(window.playWrong) playWrong();
        document.body.classList.add('shake-effect');
        setTimeout(() => document.body.classList.remove('shake-effect'), 500);
        btnPresionado.classList.add("incorrect");
        vidas--;
        actualizarVidas();
        const btnCorrecto = document.querySelector(`.opciones button[data-index="${p.respuesta}"]`);
        if (btnCorrecto) btnCorrecto.classList.add("reveal-correct");
        setTimeout(() => {
            mostrarMensaje(feedbackTexto, "incorrecto");
            if (vidas === 0) {
                mensajeBotonEl.textContent = "Ver Resultado";
                mensajeBotonEl.onclick = () => mostrarGameOver();
            } else {
                mensajeBotonEl.textContent = "Continuar";
                mensajeBotonEl.onclick = () => { cerrarMensaje(); preguntaActual++; mostrarPregunta(); };
            }
        }, 2000);
    }
}

function actualizarVidas() {
    vidasEl.innerHTML = '<i class="fas fa-heart"></i>'.repeat(vidas) + '<i class="far fa-heart" style="opacity:0.5;"></i>'.repeat(5 - vidas);
}

function mostrarMensaje(texto, tipo = "incorrecto") {
    mensajeContenidoEl.classList.remove("correcto", "incorrecto");
    mensajeContenidoEl.classList.add(tipo);
    const btnMenuExistente = document.getElementById("btnMenuGameOver");
    if (btnMenuExistente) btnMenuExistente.remove();
    if (tipo === "correcto") {
        mensajeTextoEl.innerHTML = "Correcto. " + texto;
    } else {
        if (texto.startsWith("<h1")) { mensajeTextoEl.innerHTML = texto; }
        else { mensajeTextoEl.innerHTML = "Incorrecto. " + texto; }
    }
    mensajeEl.classList.remove("oculto");
    mensajeBotonEl.onclick = cerrarMensaje;
}

window.cerrarMensaje = () => { mensajeEl.classList.add("oculto"); };

function mostrarGameOver() {
    cerrarMensaje();
    mostrarMensaje(
        `<h1 style="font-family: 'Fredoka One', cursive; color: var(--border-incorrect);">💀 Game Over 💀</h1>
        <p>¡Oh no, ${nombreJugador}! El Fisco te ha vencido esta vez. ¡Puedes intentarlo de nuevo!</p>`,
        "incorrecto"
    );
    mensajeBotonEl.textContent = "Reintentar Nivel";
    mensajeBotonEl.onclick = () => location.reload();
    const btnMenu = document.createElement("button");
    btnMenu.id = "btnMenuGameOver";
    btnMenu.textContent = "Volver al Menú";
    btnMenu.style.backgroundColor = "var(--secondary-color)";
    btnMenu.style.color = "var(--text-dark)";
    btnMenu.style.marginTop = "10px";
    btnMenu.onclick = () => window.location.href = '../dashboard_alumno.html'; // Ajusta la ruta si es necesario
    mensajeContenidoEl.appendChild(btnMenu);
}

// ── CONEXIÓN SUPABASE: GUARDAR PROGRESO ────────────────────────
async function mostrarVictoria() {
    juegoEl.classList.add("oculto");
    barraSuperiorEl.classList.add("oculto");
    const totalPreguntas = preguntas.length;
    const precisionNivel = ((puntajeNivel / totalPreguntas) * 100).toFixed(0);
    document.body.style.backgroundImage = `url('../assets/fondoVictoria.png')`;

    try {
        // 1. Obtener datos actuales del jugador
        const { data: jugadorActual } = await supabase
            .from('jugadores')
            .select('*')
            .eq('id', userId)
            .single();

        const nivelGuardado  = jugadorActual ? (jugadorActual.nivel || 0) : 0;
        const puntajeAnterior = jugadorActual ? (jugadorActual.puntaje || 0) : 0;
        
        // 2. Calcular nuevos valores (solo sube de nivel si es mayor al actual)
        const nuevoNivel = Math.max(nivelGuardado, NIVEL_ACTUAL);
        const puntajeAcumulativo = puntajeAnterior + puntajeNivel;

        // 3. Actualizar en Supabase
        await supabase
            .from('jugadores')
            .update({
                nivel: nuevoNivel,
                puntaje: puntajeAcumulativo,
                precision_pct: precisionNivel // Guarda la última precisión
            })
            .eq('id', userId);

    } catch (error) {
        console.error('Error al guardar progreso:', error);
        Swal.fire({ title: "¡Aviso!", text: "No se pudo guardar tu progreso.", icon: "warning" });
    }

    const contenedor = document.createElement("div");
    contenedor.className = "contenedor-victoria";
    contenedor.innerHTML = `
        <h1>¡Nivel ${NIVEL_ACTUAL} Superado!</h1>
        <p>¡Felicidades, ${nombreJugador}!</p>
        <p>Respuestas Correctas: <strong>${puntajeNivel} / ${totalPreguntas}</strong></p>
        <p>Precisión: <strong>${precisionNivel}%</strong></p>
        <p>Vidas Restantes: <strong style="font-size: 1.8rem;">${"❤️".repeat(vidas)}</strong></p>
        <button id="btnSiguiente">Volver al Menú</button>
    `;
    gameContainerEl.appendChild(contenedor);
    document.getElementById("btnSiguiente").onclick = () => {
        window.location.href = '../dashboard_alumno.html'; // Ajusta la ruta a tu dashboard_alumno.html
    };
}

inicializarNivel();