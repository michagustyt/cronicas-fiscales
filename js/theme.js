// ============================================================
// theme.js
// Tema global de Crónicas Fiscales
// ============================================================

(function () {

    const temaGuardado = localStorage.getItem('theme') || 'light';
    const fondosOcultos =
        localStorage.getItem('hideBackgrounds') === 'true';

    // Aplicar preferencias antes de cargar la página
    document.documentElement.setAttribute('data-theme', temaGuardado);
    document.documentElement.setAttribute('data-hide-bg', fondosOcultos);


    // ========================================================
    // TEMA
    // ========================================================

    window.setTheme = function (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        actualizarControlesTema(theme);
    };


    window.toggleTheme = function () {
        const temaActual =
            localStorage.getItem('theme') || 'light';

        const nuevoTema =
            temaActual === 'dark'
                ? 'light'
                : 'dark';

        window.setTheme(nuevoTema);
    };


    function actualizarControlesTema(theme) {
        const oscuro = theme === 'dark';

        // Toggle de dashboards
        document
            .querySelectorAll('.theme-toggle-checkbox')
            .forEach(toggle => {
                toggle.checked = oscuro;
            });

        document
            .querySelectorAll('.theme-toggle-label')
            .forEach(label => {
                label.title = oscuro
                    ? 'Cambiar a modo claro'
                    : 'Cambiar a modo oscuro';
            });


        // Botón de inicio.html
        const botonInicio =
            document.getElementById('inicioThemeBtn');

        if (botonInicio) {
            botonInicio.textContent = oscuro
                ? '☀️ Modo claro'
                : '🌙 Modo oscuro';
        }
    }


    // ========================================================
    // FONDOS
    // ========================================================

    window.setHideBg = function (ocultar) {
        document.documentElement.setAttribute(
            'data-hide-bg',
            ocultar
        );

        localStorage.setItem(
            'hideBackgrounds',
            ocultar
        );

        const checkbox =
            document.getElementById('hideBgCheck');

        if (checkbox) {
            checkbox.checked = ocultar;
        }
    };


    // ========================================================
    // TOGGLE PARA DASHBOARDS
    // ========================================================

    function crearToggleDashboard() {
        const topbar =
            document.querySelector('.topbar-right');

        if (!topbar) return;

        // Evita duplicarlo
        if (topbar.querySelector('.theme-toggle-wrap')) {
            return;
        }

        const oscuro =
            (localStorage.getItem('theme') || 'light') === 'dark';

        const contenedor =
            document.createElement('div');

        contenedor.className = 'theme-toggle-wrap';

        contenedor.innerHTML = `
            <span class="theme-icon">☀️</span>

            <label
                class="theme-toggle-label"
                title="${oscuro
                    ? 'Cambiar a modo claro'
                    : 'Cambiar a modo oscuro'}"
            >
                <input
                    type="checkbox"
                    class="theme-toggle-checkbox"
                    ${oscuro ? 'checked' : ''}
                >

                <span class="theme-toggle-slider"></span>
            </label>

            <span class="theme-icon">🌙</span>
        `;

        topbar.insertBefore(
            contenedor,
            topbar.firstChild
        );

        const checkbox =
            contenedor.querySelector(
                '.theme-toggle-checkbox'
            );

        checkbox.addEventListener('change', function () {
            window.setTheme(
                this.checked
                    ? 'dark'
                    : 'light'
            );
        });
    }


    // ========================================================
    // MODAL DE CONFIGURACIÓN
    // ========================================================

    window.abrirConfiguracion = async function () {

        if (typeof Swal === 'undefined') {
            console.error('SweetAlert2 no está disponible.');
            return;
        }

        const temaActual =
            localStorage.getItem('theme') || 'light';

        const fondosOcultos =
            localStorage.getItem('hideBackgrounds') === 'true';


        const resultado = await Swal.fire({
            title: '⚙️ Configuración',

            html: `
                <div style="text-align:left;padding:10px;">

                    <div style="
                        margin-bottom:18px;
                        padding:14px;
                        border-radius:12px;
                        background:rgba(0,0,0,.05);
                    ">
                        <label>
                            <strong>🌙 Modo oscuro</strong>
                        </label>

                        <input
                            id="swal-theme"
                            type="checkbox"
                            ${temaActual === 'dark'
                                ? 'checked'
                                : ''}
                        >
                    </div>


                    <div style="
                        padding:14px;
                        border-radius:12px;
                        background:rgba(0,0,0,.05);
                    ">
                        <label>
                            <strong>
                                🖼️ Ocultar imágenes de fondo
                            </strong>
                        </label>

                        <input
                            id="swal-hide-bg"
                            type="checkbox"
                            ${fondosOcultos
                                ? 'checked'
                                : ''}
                        >
                    </div>

                </div>
            `,

            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',

            preConfirm: () => ({
                oscuro:
                    document
                        .getElementById('swal-theme')
                        .checked,

                ocultarFondos:
                    document
                        .getElementById('swal-hide-bg')
                        .checked
            })
        });


        if (!resultado.isConfirmed) {
            return;
        }


        window.setTheme(
            resultado.value.oscuro
                ? 'dark'
                : 'light'
        );

        window.setHideBg(
            resultado.value.ocultarFondos
        );
    };


    // ========================================================
    // ESCAPAR HTML
    // ========================================================

    window.escapeHtml = function (valor) {

        if (valor == null) {
            return '';
        }

        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };


    // ========================================================
    // INICIALIZACIÓN
    // ========================================================

    document.addEventListener(
        'DOMContentLoaded',
        () => {

            crearToggleDashboard();

            const temaActual =
                localStorage.getItem('theme') || 'light';

            actualizarControlesTema(temaActual);


            // Configuración de algunas pantallas
            const configBtn =
                document.getElementById('configBtn');

            if (configBtn) {
                configBtn.addEventListener(
                    'click',
                    window.abrirConfiguracion
                );
            }


            // Configuración del dashboard alumno
            const sideConfigBtn =
                document.getElementById('sideConfigBtn');

            if (sideConfigBtn) {
                sideConfigBtn.addEventListener(
                    'click',
                    window.abrirConfiguracion
                );
            }
        }
    );

})();