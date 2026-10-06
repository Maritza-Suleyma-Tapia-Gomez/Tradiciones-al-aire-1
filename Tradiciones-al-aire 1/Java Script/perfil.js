const URL_PERFIL = "php/perfil.php";

const CLAVE_USUARIO_ID =
    "tradicionesUsuarioId";


/* =========================
   ELEMENTOS
========================= */

const avatarPerfil =
    document.getElementById("avatar-perfil");

const nombrePerfil =
    document.getElementById("nombre-perfil");

const nivelPerfil =
    document.getElementById("nivel-perfil");

const puntosPerfil =
    document.getElementById("puntos-perfil");

const barraProgreso =
    document.getElementById("barra-progreso");

const estadisticaPuntos =
    document.getElementById("estadistica-puntos");

const estadisticaPartidas =
    document.getElementById("estadistica-partidas");

const estadisticaRetos =
    document.getElementById("estadistica-retos");


/* =========================
   CARGAR PERFIL
========================= */

async function cargarPerfil() {

    const usuarioId =
        localStorage.getItem(
            CLAVE_USUARIO_ID
        );


    /* =========================
       COMPROBAR USUARIO
    ========================== */

    if (!usuarioId) {

        mostrarPerfilPredeterminado();

        return;
    }


    try {

        const respuesta =
            await fetch(
                `${URL_PERFIL}?usuario_id=${encodeURIComponent(
                    usuarioId
                )}`
            );


        const datos =
            await respuesta.json();


        console.log(
            "Respuesta del perfil:",
            datos
        );


        if (!datos.ok) {

            console.error(
                "Error del perfil:",
                datos.mensaje
            );

            mostrarPerfilPredeterminado();

            return;
        }


        const usuario =
            datos.usuario;


        const estadisticas =
            datos.estadisticas;


        /* =========================
           DATOS DEL USUARIO
        ========================== */

        nombrePerfil.textContent =
            usuario.nombre ||
            "Jugador";


        avatarPerfil.textContent =
            usuario.avatar ||
            "🧑🏻‍🎮";


        const puntos =
            Number(
                usuario.puntos || 0
            );


        const nivel =
            Number(
                usuario.nivel || 1
            );


        nivelPerfil.textContent =
            nivel;


        puntosPerfil.textContent =
            `${puntos} puntos`;


        estadisticaPuntos.textContent =
            puntos;


        /* =========================
           PARTIDAS
        ========================== */

        estadisticaPartidas.textContent =
            estadisticas.partidas || 0;


        /* =========================
           RETOS
        ========================== */

        estadisticaRetos.textContent =
            estadisticas.retos_completados || 0;


        /* =========================
           BARRA DE PROGRESO
        ========================== */

        const puntosPorNivel =
            100;


        const puntosActuales =
            puntos %
            puntosPorNivel;


        let progreso =
            puntosActuales;


        if (
            progreso === 0 &&
            puntos > 0
        ) {

            progreso = 100;

        }


        if (progreso < 8) {

            progreso = 8;

        }


        barraProgreso.style.width =
            `${progreso}%`;


        /* =========================
           INSIGNIAS
        ========================== */

        actualizarInsignias(
            puntos,
            estadisticas
        );


    } catch (error) {

        console.error(
            "Error cargando perfil:",
            error
        );


        mostrarPerfilPredeterminado();

    }

}


/* =========================
   INSIGNIAS
========================= */

function actualizarInsignias(
    puntos,
    estadisticas
) {

    const insignias =
        document.querySelectorAll(
            ".insignia"
        );


    if (insignias.length < 4) {
        return;
    }


    /* =========================
       INSIGNIA TRADICIONAL
    ========================== */

    if (puntos >= 0) {

        insignias[0]
            .classList.remove(
                "bloqueada"
            );

        insignias[0]
            .querySelector("small")
            .textContent =
            "¡Desbloqueada!";

    }


    /* =========================
       CAMPEÓN
    ========================== */

    if (
        Number(
            estadisticas.retos_completados || 0
        ) >= 3
    ) {

        insignias[1]
            .classList.remove(
                "bloqueada"
            );

        insignias[1]
            .querySelector("small")
            .textContent =
            "3 retos completados";

    }


    /* =========================
       JUGADOR
    ========================== */

    if (
        Number(
            estadisticas.partidas || 0
        ) >= 3
    ) {

        insignias[2]
            .classList.remove(
                "bloqueada"
            );

        insignias[2]
            .querySelector("small")
            .textContent =
            "3 partidas jugadas";

    }


    /* =========================
       IMPARABLE
    ========================== */

    if (puntos >= 500) {

        insignias[3]
            .classList.remove(
                "bloqueada"
            );

        insignias[3]
            .querySelector("small")
            .textContent =
            "500 puntos";

    }

}


/* =========================
   PERFIL SIN USUARIO
========================= */

function mostrarPerfilPredeterminado() {

    const nombreGuardado =
        localStorage.getItem(
            "tradicionesNombre"
        );


    nombrePerfil.textContent =
        nombreGuardado ||
        "Jugador";


    avatarPerfil.textContent =
        "🧑🏻‍🎮";


    nivelPerfil.textContent =
        "1";


    puntosPerfil.textContent =
        "0 puntos";


    estadisticaPuntos.textContent =
        "0";


    estadisticaPartidas.textContent =
        "0";


    estadisticaRetos.textContent =
        "0";


    barraProgreso.style.width =
        "8%";

}


/* =========================
   INICIAR
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Perfil iniciado correctamente."
        );


        cargarPerfil();

    }
);