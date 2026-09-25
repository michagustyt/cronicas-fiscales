import { supabase } from './supabase.js';

const NIVEL_ACTUAL = 8;
const TITULO_NIVEL = "Nivel 8: Matemáticas del Riesgo.";

const personajes = {
    Narrador: { img: "../assets/personajes/brenda.png", color: "#b8dcecff" },
    Brenda: { img: "../assets/personajes/brenda2.jpeg", color: "#ecd089ff" },
    Rogelio: { img: "../assets/personajes/donrogelio.jpeg", color: "#b8c2f3ff" },
    Carlos: { img: "../assets/personajes/carlos1.jpeg", color: "#f3b8c2ff" },
    Jose: { img: "../assets/personajes/jose2.jpeg", color: "#f3c2b8ff" }
};

const dialogos = [
    { 
        personaje: "Narrador", 
        texto: "Has llegado lejos, Godín. Pero ahora... las matemáticas se ponen serias.",
        fondo: "../assets/oficina.png" 
    },
    { 
        personaje: "Rogelio", 
        texto: "Black-Scholes, Value at Risk, CAPM... ¡Bienvenido al mundo cuantitativo.",
        fondo: "../assets/oficina.png" 
    },
    { 
        personaje: "Brenda", 
        texto: "¿Opciones? ¿Derivados? ¿Simulaciones Montecarlo? ¡Esto es de otro nivel!",
        fondo: "../assets/oficina.png" 
    },
    { 
        personaje: "Rogelio", 
        texto: "Aquíí no hay espacio para intuiciones. Solo fórmulas, probabilidades y gestión de riesgos.",
        fondo: "../assets/oficina.png" 
    },
    { 
        personaje: "Narrador", 
        texto: "Las finanzas cuantitativas son el arma definitiva. ¿Puedes dominarlas, Godín?",
        fondo: "../assets/oficina.png" 
    }
];

// Preguntas locales (fallback si falla la API)
const preguntasLocales = [
    {
        pregunta: "¿Cómo valuas una opción europea usando el modelo Black-Scholes con los parámetros dados?",
        opciones: [
            "Black-Scholes: N(d1)S − N(d2)Ke^(−rT)",
            "Precio con volado 'cara o cruz'",
            "Valor intrínseco = 0",
            "Intuición de mercado"
        ],
        respuesta: 0,
        feedback: [
            "Correcto: Modelo estándar para valuación de opciones europeas.",
            "Incorrecto: Las decisiones financieras requieren modelos matemáticos, no azar.",
            "Incorrecto: Ignora el valor temporal y la volatilidad del activo subyacente",
            "Incorrecto: La intuición no sustituye modelos cuantitativos validados"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "Calcula el Value at Risk al 99% para un portafolio con desviación estándar de 1 millón.",
        opciones: [
            "1M porque es la desviación",
            "Preguntar al brujo de la bolsa",
            "10M 'para no fallar'",
            "VaR = 2.33σ ≈ 2.33M"
        ],
        respuesta: 3,
        feedback: [
            "Incorrecto: Confunde desviación estándar con VaR - falta el factor de confianza",
            "Incorrecto: Las finanzas cuantitativas se basan en matemáticas, no adivinación",
            "Incorrecto: Arbitrario y sin base estadística",
            "Correcto: Para un nivel de confianza del 99%, el factor es 2.33"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "Tienes un flujo futuro en USD que quieres cubrir. ¿Qué estrategia de hedging implementas?",
        opciones: [
            "Pedirle al banco que no suba el peso",
            "No hacer nada",
            "Vender futuros de USD para cubrir flujo",
            "Comprar futuros de USD"
        ],
        respuesta: 2,
        feedback: [
            "Incorrecto: No es una estrategia de gestión de riesgos válida.",
            "Incorrecto: Deja la posición completamente expuesta a volatilidad cambiaria",
            "Correcto: Vender futuros protege contra depreciación del USD",
            "Incorrecto: Aumenta la exposición al riesgo cambiario"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "Calcula el retorno esperado usando CAPM: Rf=4%, β=1.2, Rm=10%",
        opciones: [
            "E(R) = Rf + β(Rm−Rf) = 11.2%",
            "Multiplicar todo por beta",
            "Promediar 4% y 10%",
            "Media geométrica random"
        ],
        respuesta: 0,
        feedback: [
            "Correcto: 4% + 1.2×(10%-4%) = 11.2%",
            "Incorrecto: Multiplicar todo por beta da 12%",
            "Incorrecto: Ignora el coeficiente beta que mide el riesgo sistemático",
            "Incorrecto: Sin fundamento en teoría financiera"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "¿Cómo evalúas el riesgo de un proyecto usando simulación Montecarlo?",
        opciones: [
            "Modelar 10k escenarios, distribución de NPV",
            "Tomar media de 2 casos",
            "Preguntar a la suerte",
            "Usar solo escenario optimista"
        ],
        respuesta: 0,
        feedback: [
            "Correcto: Análisis estadístico robusto con múltiples escenarios",
            "Incorrecto: Muestra insuficiente para análisis de riesgos significativo",
            "Incorrecto: Las decisiones de inversión requieren análisis cuantitativo",
            "Incorrecto: Sesgo de optimismo - ignora riesgos potenciales"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "¿Cómo te proteges contra el riesgo de default de un bono corporativo?",
        opciones: [
            "Rezar por liquidez",
            "Dar crédito ilimitado",
            "Mover deuda a 'otros activos'",
            "Comprar CDS como seguro"
        ],
        respuesta: 3,
        feedback: [
            "Incorrecto: No es una estrategia de gestión de riesgos",
            "Incorrecto: Aumenta la exposición al riesgo crediticio",
            "Incorrecto: No elimina el riesgo de default, solo lo oculta",
            "Correcto: Los CDS funcionan como seguro contra incumplimiento"
        ],
        fondo: "../assets/oficina.png"
    },
    {
        pregunta: "¿Cómo construyes un portafolio óptimo considerando riesgo y retorno?",
        opciones: [
            "Poner más al que te gusta",
            "Frontera eficiente con covarianzas",
            "Diversificar en pares",
            "Uno de cada uno 'por no errar'"
        ],
        respuesta: 1,
        feedback: [
            "Incorrecto: Decisión emocional sin base en análisis cuantitativo",
            "Correcto: Teoría moderna de portafolio de Markowitz",
            "Incorrecto: Diversificación insuficiente - no considera correlaciones",
            "Incorrecto: Enfoque naive sin optimización matemática"
        ],
        fondo: "../assets/oficina.png"
    }
];

let preguntas = [];

// --- Variables del juego ---
let puntajeNivel = 0;
let preguntaActual = 0;
let indexDialogo = 0;
let vidas = 5;
let userId = null;
let nombreJugador = "Godín";

// ── CONEXIÓN SUPABASE: SESIÓN ──────────────────────
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
        if (user) nombreJugador = user.nombre;

        return true;
    } catch (error) {
        console.error('Error al obtener sesión:', error);
        window.location.href = '../login.html';
        return false;
    }
}
let intervaloMaquinaEscribir;
let respondiendo = false;

// --- Elementos del DOM ---
const dialogoEl = document.getElementById("dialogo");
const juegoEl = document.getElementById("juego");
const barraSuperiorEl = document.getElementById("barraSuperior");
const vidasEl = document.getElementById("vidas");
const avatarImgEl = document.getElementById("avatarImg");
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const textoDialogoEl = document.getElementById("textoDialogo");
const mensajeEl = document.getElementById("mensaje");
const mensajeContenidoEl = document.getElementById("mensajeContenido");
const mensajeTextoEl = document.getElementById("mensajeTexto");
const mensajeBotonEl = document.getElementById("mensajeBotonPrincipal");
const gameContainerEl = document.querySelector(".game-container");

// --- Lógica de Música ---
const musicButtonEl = document.getElementById("musicButton");
const backgroundMusicEl = document.getElementById("backgroundMusic");
let isMusicPlaying = false;

function playMusic() {
    if (localStorage.getItem('musicEnabled') === 'false') {
        musicButtonEl.innerHTML = '<span>🎵</span> Música';
        return;
    }
    if (!isMusicPlaying) {
        backgroundMusicEl.play().then(() => {
            isMusicPlaying = true;
            musicButtonEl.innerHTML = '<span>🔇</span> Silencio';
            localStorage.setItem('musicEnabled', 'true');
        }).catch(e => {});
    }
}
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

// ── CONEXIÓN SUPABASE: PREGUNTAS ──────────────────────
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
    document.getElementById("nivelInfo").textContent = TITULO_NIVEL;

    if (!await cargarSesion()) return;

    const cargadas = await cargarPreguntas();
    if (!cargadas || preguntas.length === 0) {
        Swal.fire({
            title: "Error",
            text: "No hay preguntas disponibles para este nivel.",
            icon: "error"
        }).then(() => {
            window.location.href = '../dashboard_alumno.html';
        });
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
        if (i < texto.length) {
            textoDialogoEl.textContent += texto[i];
            i++;
        } else {
            clearInterval(intervaloMaquinaEscribir);
        }
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
    if (preguntaActual >= preguntas.length) {
        mostrarVictoria();
        return;
    }
    const p = preguntas[preguntaActual];
    juegoEl.classList.add('fading-out');
    setTimeout(() => {
        document.getElementById("pregunta").textContent = p.pregunta;
        if (p.fondo) {
            document.body.style.backgroundImage = `url('${p.fondo}')`;
        }
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
    const todosLosBotones = document.querySelectorAll(".opciones button");
    todosLosBotones.forEach(btn => { btn.disabled = true; });
    if (esCorrecta) {
        if(window.playCorrect) playCorrect();
        btnPresionado.classList.add("correct");
        puntajeNivel++;
        setTimeout(() => {
            mostrarMensaje(feedbackTexto, "correcto");
            mensajeBotonEl.textContent = "¡Siguiente!";
            mensajeBotonEl.onclick = () => {
                cerrarMensaje();
                preguntaActual++;
                mostrarPregunta();
            };
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
                mensajeBotonEl.onclick = () => {
                    cerrarMensaje();
                    preguntaActual++;
                    mostrarPregunta();
                };
            }
        }, 1500);
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
        if (texto.startsWith("<h1")) {
            mensajeTextoEl.innerHTML = texto;
        } else {
            mensajeTextoEl.innerHTML = "No es correcto... " + texto;
        }
    }
    mensajeEl.classList.remove("oculto");
    mensajeBotonEl.onclick = cerrarMensaje;
}

window.cerrarMensaje = () => {
    mensajeEl.classList.add("oculto");
};

function mostrarGameOver() {
    cerrarMensaje();
    mostrarMensaje(
        `<h1 style="font-family: 'Fredoka One', cursive; color: var(--border-incorrect);">💀 Game Over 💀</h1>
        <p>¡¡Oh no, ${nombreJugador}! El Fisco te ha vencido esta vez. ¡Puedes intentarlo de nuevo!</p>`,
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
    btnMenu.onclick = () => window.location.href = '../dashboard_alumno.html';
    mensajeContenidoEl.appendChild(btnMenu);
}

// ── CONEXIÓN SUPABASE: GUARDAR PROGRESO ──────────────────────
async function mostrarVictoria() {
    juegoEl.classList.add("oculto");
    barraSuperiorEl.classList.add("oculto");
    const totalPreguntas = preguntas.length;
    const precisionNivel = ((puntajeNivel / totalPreguntas) * 100).toFixed(0);
    document.body.style.backgroundImage = `url('../assets/fondovictoria.png')`;

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
                precision_pct: precisionNivel
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
        window.location.href = '../dashboard_alumno.html';
    };
}

// --- Iniciar ---
inicializarNivel();