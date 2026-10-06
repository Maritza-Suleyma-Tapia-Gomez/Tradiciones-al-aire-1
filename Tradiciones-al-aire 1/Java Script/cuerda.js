const botonLanzar = document.getElementById("botonLanzar");
const botonSonido = document.getElementById("botonSonido");
const escena = document.getElementById("escena");
const cuerda = document.getElementById("cuerda");
const cuerdaCamino = document.getElementById("cuerdaCamino");
const saltadora = document.getElementById("saltadora");
const mensaje = document.getElementById("mensajeJuego");

const aciertosTexto = document.getElementById("aciertos");
const recordTexto = document.getElementById("record");
const rachaTexto = document.getElementById("racha");

const nivelTexto = document.getElementById("nivelTexto");
const velocidadTexto = document.getElementById("velocidadTexto");


/* =========================
   CONFIGURACIÓN
========================= */

const URL_PROGRESO = "php/progreso.php";

const CLAVE_USUARIO_ID =
    "tradicionesUsuarioId";


/* =========================
   VARIABLES
========================= */

let jugando = false;
let saltando = false;
let sonidoActivo = true;

let aciertos =
    Number(
        localStorage.getItem("aciertosCuerda") || 0
    );

let record =
    Number(
        localStorage.getItem("recordCuerda") || 0
    );

let racha =
    Number(
        localStorage.getItem("rachaCuerda") || 0
    );

let saltosPartida = 0;
let nivel = 1;

let fase = 0;
let tiempoAnterior = 0;
let velocidad = 3;
let animacionActiva = false;

let cicloAnterior = 0;
let saltoAceptadoEsteCiclo = false;

let contextoAudio = null;


/* =========================
   EVITAR PUNTOS DOBLES
========================= */

let puntosPartidaEntregados = false;


/* =========================
   MARCADOR
========================= */

function actualizarMarcador() {

    aciertosTexto.textContent =
        aciertos;

    recordTexto.textContent =
        record;

    rachaTexto.textContent =
        racha;
}


/* =========================
   SONIDO
========================= */

function hacerSonido(
    frecuencia,
    duracion = 0.13
) {

    if (!sonidoActivo) return;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        if (!contextoAudio) {
            contextoAudio =
                new AudioContext();
        }

        if (
            contextoAudio.state ===
            "suspended"
        ) {

            contextoAudio.resume();
        }

        const oscilador =
            contextoAudio.createOscillator();

        const ganancia =
            contextoAudio.createGain();

        oscilador.type = "sine";

        oscilador.frequency.value =
            frecuencia;

        ganancia.gain.setValueAtTime(
            0.06,
            contextoAudio.currentTime
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.001,
            contextoAudio.currentTime +
            duracion
        );

        oscilador.connect(ganancia);

        ganancia.connect(
            contextoAudio.destination
        );

        oscilador.start();

        oscilador.stop(
            contextoAudio.currentTime +
            duracion
        );

    } catch (error) {

        console.log(
            "El sonido no está disponible."
        );

    }
}


/* =========================
   BOTÓN SONIDO
========================= */

botonSonido.addEventListener(
    "click",
    () => {

        sonidoActivo =
            !sonidoActivo;

        botonSonido.textContent =
            sonidoActivo
                ? "🔊"
                : "🔇";

        if (sonidoActivo) {
            hacerSonido(500);
        }

    }
);


/* =========================
   NIVELES
========================= */

function actualizarNivel() {

    nivel =
        Math.floor(
            saltosPartida / 5
        ) + 1;


    const velocidades = [

        3.20,
        2.75,
        2.35,
        2.00,
        1.72,
        1.50

    ];


    velocidad =
        velocidades[
            Math.min(
                nivel - 1,
                velocidades.length - 1
            )
        ];


    nivelTexto.textContent =
        "⭐ Nivel " + nivel;


    if (nivel === 1) {

        velocidadTexto.textContent =
            "🐢 Lento";

    } else if (nivel === 2) {

        velocidadTexto.textContent =
            "🚶 Normal";

    } else if (nivel === 3) {

        velocidadTexto.textContent =
            "🏃 Rápido";

    } else if (nivel === 4) {

        velocidadTexto.textContent =
            "⚡ Muy rápido";

    } else {

        velocidadTexto.textContent =
            "🔥 ¡Difícil!";

    }
}


/* =========================
   DIBUJAR CUERDA
========================= */

function dibujarCuerda() {

    const centroY =
        150 +
        125 *
        Math.cos(fase);


    const extremoY =
        175;


    const d = `
        M 10 ${extremoY}
        C 180 ${extremoY},
          260 ${centroY},
          400 ${centroY}
        C 540 ${centroY},
          620 ${extremoY},
          790 ${extremoY}
    `;


    cuerdaCamino.setAttribute(
        "d",
        d
    );
}


/* =========================
   ZONA DE SALTO
========================= */

function cuerdaEnZonaDeSalto() {

    const coseno =
        Math.cos(fase);

    return coseno > 0.55;
}


/* =========================
   ANIMACIÓN
========================= */

function animarCuerda(tiempo) {

    if (!jugando) {

        animacionActiva =
            false;

        return;
    }


    if (!tiempoAnterior) {

        tiempoAnterior =
            tiempo;
    }


    const delta =
        Math.min(
            (tiempo -
                tiempoAnterior) /
                1000,
            0.05
        );


    tiempoAnterior =
        tiempo;


    const faseAnterior =
        fase;


    fase +=
        (2 * Math.PI / velocidad) *
        delta;


    if (
        fase >=
        2 * Math.PI
    ) {

        fase %= 2 * Math.PI;


        if (
            !saltoAceptadoEsteCiclo
        ) {

            perder();

            return;
        }


        saltoAceptadoEsteCiclo =
            false;

        cicloAnterior++;
    }


    const zonaActual =
        cuerdaEnZonaDeSalto();


    if (
        zonaActual &&
        !saltoAceptadoEsteCiclo &&
        faseAnterior > fase
    ) {

        // Evita errores al reiniciar la fase.
    }


    dibujarCuerda();


    requestAnimationFrame(
        animarCuerda
    );
}


/* =========================
   INICIAR ANIMACIÓN
========================= */

function iniciarAnimacion() {

    if (animacionActiva) return;

    animacionActiva =
        true;

    tiempoAnterior =
        0;

    requestAnimationFrame(
        animarCuerda
    );
}


/* =========================
   EMPEZAR
========================= */

function empezar() {

    if (jugando) return;


    jugando = true;

    saltando = false;


    saltosPartida =
        0;

    nivel =
        1;


    fase =
        0;

    velocidad =
        3.20;


    cicloAnterior =
        0;

    saltoAceptadoEsteCiclo =
        false;


    puntosPartidaEntregados =
        false;


    actualizarNivel();

    dibujarCuerda();

    iniciarAnimacion();


    botonLanzar.textContent =
        "⬆️ ¡SALTAR!";


    mensaje.textContent =
        "🪢 ¡Espera la cuerda y salta en el momento correcto!";


    hacerSonido(500);
}


/* =========================
   GUARDAR MARCADOR LOCAL
========================= */

function guardar() {

    localStorage.setItem(
        "aciertosCuerda",
        aciertos
    );

    localStorage.setItem(
        "recordCuerda",
        record
    );

    localStorage.setItem(
        "rachaCuerda",
        racha
    );


    actualizarMarcador();
}


/* =========================
   SUMAR PUNTOS
========================= */

async function sumarPuntosPartida() {

    if (
        puntosPartidaEntregados
    ) {

        return;
    }


    puntosPartidaEntregados =
        true;


    const usuarioId =
        localStorage.getItem(
            CLAVE_USUARIO_ID
        );


    if (!usuarioId) {

        console.log(
            "No hay usuario registrado. No se pueden guardar puntos."
        );

        return;
    }


    /*
        Si logró al menos un salto,
        recibe 10 puntos por jugar.
    */

    let puntos =
        10;


    /*
        Si logró 10 o más saltos
        recibe 20 puntos extra.
    */

    if (
        saltosPartida >= 10
    ) {

        puntos += 20;
    }


    try {

        const respuesta =
            await fetch(
                URL_PROGRESO,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            Number(
                                usuarioId
                            ),

                        puntos:
                            puntos,

                        motivo:
                            "Partida de Saltar la cuerda"

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            console.error(
                "No se pudieron guardar los puntos:",
                datos.mensaje
            );

            puntosPartidaEntregados =
                false;

            return;
        }


        mensaje.textContent =
            `🏆 ¡Partida terminada! +${puntos} puntos`;


        if (
            datos.nivel
        ) {

            setTimeout(
                () => {

                    mensaje.textContent =
                        `⭐ Tienes ${datos.puntos_totales} puntos · Nivel ${datos.nivel}`;

                },
                1800
            );

        }


    } catch (error) {

        console.error(
            "Error guardando puntos:",
            error
        );

        puntosPartidaEntregados =
            false;
    }
}


/* =========================
   SALTAR
========================= */

function saltar() {

    if (
        !jugando ||
        saltando
    ) {

        return;
    }


    if (
        !cuerdaEnZonaDeSalto()
    ) {

        mensaje.textContent =
            "😅 ¡Todavía no! Espera a que llegue la cuerda.";

        hacerSonido(180);

        return;
    }


    if (
        saltoAceptadoEsteCiclo
    ) {

        mensaje.textContent =
            "⚠️ ¡Ese salto ya contó!";

        return;
    }


    saltoAceptadoEsteCiclo =
        true;


    saltando = true;


    aciertos++;

    racha++;

    saltosPartida++;


    if (
        racha > record
    ) {

        record =
            racha;
    }


    actualizarNivel();

    guardar();


    hacerSonido(
        650 +
        Math.min(
            racha * 8,
            300
        )
    );


    saltadora.classList.remove(
        "saltando"
    );


    void saltadora.offsetWidth;


    saltadora.classList.add(
        "saltando"
    );


    if (
        saltosPartida % 5 === 0
    ) {

        mensaje.textContent =
            "🎉 ¡Subiste al NIVEL " +
            nivel +
            "! ⚡";

        hacerSonido(
            850,
            0.2
        );

    } else if (
        racha % 10 === 0
    ) {

        mensaje.textContent =
            "🔥 ¡" +
            racha +
            " saltos seguidos!";

    } else {

        mensaje.textContent =
            "⭐ ¡Buen salto! " +
            saltosPartida +
            " saltos";

    }


    setTimeout(
        () => {

            saltando =
                false;

            saltadora.classList.remove(
                "saltando"
            );

        },
        420
    );
}


/* =========================
   PERDER
========================= */

function perder() {

    if (!jugando) return;


    jugando = false;

    saltando = false;

    animacionActiva = false;


    /*
        La partida terminó.
    */

    racha = 0;


    guardar();


    botonLanzar.textContent =
        "🔄 INTENTAR DE NUEVO";


    mensaje.textContent =
        "💥 ¡Uy! La cuerda te alcanzó. ¡Terminaste la partida!";


    hacerSonido(
        170,
        0.25
    );


    saltadora.classList.remove(
        "saltando"
    );


    /*
        Guardar los puntos después
        de terminar la partida.
    */

    sumarPuntosPartida();
}


/* =========================
   BOTÓN
========================= */

botonLanzar.addEventListener(
    "click",
    () => {

        if (!jugando) {

            empezar();

        } else {

            saltar();

        }

    }
);


/* =========================
   TECLADO
========================= */

document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.code !== "Space"
        ) {

            return;
        }


        evento.preventDefault();


        if (evento.repeat) {
            return;
        }


        if (!jugando) {

            empezar();

        } else {

            saltar();

        }

    }
);


/* =========================
   TOCAR ESCENA
========================= */

escena.addEventListener(
    "click",
    (evento) => {

        if (
            evento.target.closest(
                "button"
            )
        ) {

            return;
        }


        if (jugando) {

            saltar();

        }

    }
);


/* =========================
   INICIO
========================= */

dibujarCuerda();

actualizarNivel();

actualizarMarcador();