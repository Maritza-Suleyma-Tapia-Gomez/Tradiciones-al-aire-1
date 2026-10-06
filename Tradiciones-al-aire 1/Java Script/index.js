/* =========================================================
   TRADICIONES AL AIRE
   INDEX.JS
   ========================================================= */

/* =========================================================
   ELEMENTOS
   ========================================================= */

const pantallaInicio =
    document.getElementById("pantalla-inicio");

const aplicacion =
    document.getElementById("aplicacion");

const nombreInput =
    document.getElementById("nombre-jugador");

const nombreMostrado =
    document.getElementById("nombre-mostrado");

const botonIniciar =
    document.getElementById("boton-iniciar");

const contenedorConfeti =
    document.getElementById("contenedor-confeti");

const mariachi =
    document.getElementById("mariachi-bienvenida");

const musica =
    document.getElementById("musica-mexicana");


/* =========================================================
   CLAVES DE SESIÓN
   ========================================================= */

const CLAVE_NOMBRE = "tradicionesNombre";
const CLAVE_SESION = "tradicionesSesionActiva";
const CLAVE_USUARIO_ID = "tradicionesUsuarioId";


/* =========================================================
   INICIAR JUEGO
   ========================================================= */

function iniciarJuego() {

    const nombre = nombreInput
        ? nombreInput.value.trim()
        : "";


    /* -----------------------------------------
       Comprobar nombre
       ----------------------------------------- */

    if (nombre === "") {

        if (nombreInput) {

            nombreInput.focus();

            nombreInput.classList.add("error");

            setTimeout(() => {

                nombreInput.classList.remove("error");

            }, 500);

        }

        return;
    }

    /* -----------------------------------------
       Guardar sesión (Compatibilidad total)
       ----------------------------------------- */

    localStorage.setItem(CLAVE_NOMBRE, nombre);
    localStorage.setItem(CLAVE_SESION, "true");
    localStorage.setItem(CLAVE_USUARIO_ID, "1");

    localStorage.setItem("tradicionesNombre", nombre);
    localStorage.setItem("tradicionesSesionActiva", "true");

    sessionStorage.setItem("sesionIniciada", "true");

    /* -----------------------------------------
       Mostrar nombre y mariachi
       ----------------------------------------- */

    mostrarNombre(nombre);
    actualizarBienvenida(nombre);

    /* -----------------------------------------
       Animación de salida del login
       ----------------------------------------- */

    if (pantallaInicio) {
        pantallaInicio.classList.add("salida");
    }

    /* -----------------------------------------
       Música mexicana
       ----------------------------------------- */

    reproducirMusica();

    /* -----------------------------------------
       Confeti
       ----------------------------------------- */

    lanzarConfeti();

    /* -----------------------------------------
       Mostrar bienvenida con mariachi
       ----------------------------------------- */

    if (mariachi) {
        mariachi.classList.add("mostrar");
    }

    /* -----------------------------------------
       Mostrar aplicación principal
       ----------------------------------------- */

    if (aplicacion) {
        aplicacion.classList.remove("oculto");
        aplicacion.style.display = "block";
    }

    /* -----------------------------------------
       Ocultar login después de la animación
       ----------------------------------------- */

    setTimeout(() => {

        if (pantallaInicio) {
            pantallaInicio.classList.add("oculto");
            pantallaInicio.style.display = "none";
        }

    }, 700);

    /* -----------------------------------------
       Ocultar mariachi
       ----------------------------------------- */

    setTimeout(() => {

        if (mariachi) {
            mariachi.classList.remove("mostrar");
        }

    }, 3500);
}


/* =========================================================
   HACER VISIBLE EL NOMBRE
   ========================================================= */

function mostrarNombre(nombre) {

    if (!nombreMostrado) {
        return;
    }

    nombreMostrado.textContent =
        `¡Hola, ${nombre}!`;
}


/* =========================================================
   ACTUALIZAR MENSAJE DEL MARIACHI
   ========================================================= */

function actualizarBienvenida(nombre) {

    if (!mariachi) {
        return;
    }

    const titulo =
        mariachi.querySelector("strong");

    const mensaje =
        mariachi.querySelector("span");


    if (titulo) {

        titulo.textContent =
            `¡Bienvenida, ${nombre}!`;

    }


    if (mensaje) {

        mensaje.textContent =
            "¡Bienvenida a Tradiciones al Aire!";

    }

}


/* =========================================================
   MÚSICA
   ========================================================= */

function reproducirMusica() {

    if (!musica) {
        return;
    }


    musica.volume = 0.35;


    const promesa =
        musica.play();


    if (promesa !== undefined) {

        promesa.catch(() => {

            console.log(
                "La música no pudo reproducirse."
            );

        });

    }

}


/* =========================================================
   CONFETI
   ========================================================= */

function lanzarConfeti() {

    if (!contenedorConfeti) {
        return;
    }


    /* Limpiar confeti anterior */

    contenedorConfeti.innerHTML = "";


    /* Cantidad de piezas */

    const cantidad = 120;


    for (let i = 0; i < cantidad; i++) {

        const pieza =
            document.createElement("span");


        pieza.classList.add(
            "confeti-pieza"
        );


        /* Posición horizontal */

        pieza.style.left =
            Math.random() * 100 + "%";


        /* Tamaño */

        const ancho =
            Math.random() * 8 + 6;

        const alto =
            Math.random() * 13 + 8;


        pieza.style.width =
            ancho + "px";

        pieza.style.height =
            alto + "px";


        /* Movimiento lateral */

        const movimiento =
            (Math.random() * 300 - 150) + "px";


        pieza.style.setProperty(
            "--movimiento",
            movimiento
        );


        /* Retraso */

        pieza.style.animationDelay =
            Math.random() * 0.8 + "s";


        /* Duración */

        pieza.style.animationDuration =
            (Math.random() * 1.5 + 2) + "s";


        /* Rotación */

        pieza.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        contenedorConfeti.appendChild(
            pieza
        );

    }


    /* Limpiar después de la animación */

    setTimeout(() => {

        contenedorConfeti.innerHTML = "";

    }, 4500);

}


/* =========================================================
   RECUPERAR JUGADOR
   ========================================================= */

function cargarJugador() {

    const urlParams = new URLSearchParams(window.location.search);
    const vieneDeJuego = urlParams.get("sesion") === "activa";
    
    const sesionEnMemoria = sessionStorage.getItem("sesionIniciada");
    const nombreGuardado = localStorage.getItem("tradicionesNombre") || localStorage.getItem(CLAVE_NOMBRE);

    // SI VIENE DE UN JUEGO O YA HABÍA INICIADO SESIÓN:
    if (vieneDeJuego || sesionEnMemoria === "true") {

        sessionStorage.setItem("sesionIniciada", "true");

        // Ocultar pantalla de inicio
        if (pantallaInicio) {
            pantallaInicio.classList.add("oculto");
            pantallaInicio.style.display = "none";
        }

        // Mostrar el menú principal de los juegos
        if (aplicacion) {
            aplicacion.classList.remove("oculto");
            aplicacion.style.display = "block";
        }

        if (nombreGuardado) {
            mostrarNombre(nombreGuardado);
        }

    } else {
        // PRIMERA ENTRADA (Muestra la pantalla de inicio con mariachi y login)
        if (pantallaInicio) {
            pantallaInicio.classList.remove("oculto");
            pantallaInicio.style.display = "";
        }

        if (aplicacion) {
            aplicacion.classList.add("oculto");
            aplicacion.style.display = "";
        }
    }
}


/* =========================================================
   BOTÓN DE INICIO
   ========================================================= */

if (botonIniciar) {

    botonIniciar.addEventListener(
        "click",
        iniciarJuego
    );

}


/* =========================================================
   HACER LA FUNCIÓN GLOBAL
   ========================================================= */

window.iniciarJuego =
    iniciarJuego;


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarJugador();

    }
);