/* ==========================================
   AVIONCITO ✈️
   Movimiento con flechas del teclado
   Recorrido hasta la casilla 10
   ========================================== */

const botonLanzar = document.getElementById("botonLanzar");
const botonSonido = document.getElementById("botonSonido");

const mensajeJuego = document.getElementById("mensajeJuego");
const aciertosTexto = document.getElementById("aciertos");
const recordTexto = document.getElementById("record");
const rachaTexto = document.getElementById("racha");

let sonidoActivo = true;

let aciertos = Number(
    localStorage.getItem("aciertosAvioncito") || 0
);

let record = Number(
    localStorage.getItem("recordAvioncito") || 0
);

let racha = Number(
    localStorage.getItem("rachaAvioncito") || 0
);

aciertosTexto.textContent = aciertos;
recordTexto.textContent = record;
rachaTexto.textContent = racha;


/* ==========================================
   SONIDO
   ========================================== */

botonSonido.addEventListener("click", () => {

    sonidoActivo = !sonidoActivo;

    botonSonido.textContent =
        sonidoActivo ? "🔊" : "🔇";
});


function beep(freq) {

    if (!sonidoActivo) return;

    try {

        const ctx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        const oscilador =
            ctx.createOscillator();

        const ganancia =
            ctx.createGain();

        oscilador.frequency.value = freq;

        ganancia.gain.value = 0.08;

        oscilador.connect(ganancia);

        ganancia.connect(ctx.destination);

        oscilador.start();

        oscilador.stop(
            ctx.currentTime + 0.12
        );

    } catch (e) {}
}


/* ==========================================
   GUARDAR MARCADORES
   ========================================== */

function guardar() {

    localStorage.setItem(
        "aciertosAvioncito",
        aciertos
    );

    localStorage.setItem(
        "recordAvioncito",
        record
    );

    localStorage.setItem(
        "rachaAvioncito",
        racha
    );

    aciertosTexto.textContent = aciertos;
    recordTexto.textContent = record;
    rachaTexto.textContent = racha;
}


function sumarPunto() {

    aciertos++;

    racha++;

    if (racha > record) {
        record = racha;
    }

    guardar();
}


function fallar() {

    racha = 0;

    guardar();
}


/* ==========================================
   CREAR TABLERO
   ========================================== */

const tablero =
    document.getElementById("avionTablero");

let activo = false;

let piedra = 0;

let jugador = 1;

const casillas = {};


/*
       [10]
    [8] [9]
       [7]
    [5] [6]
       [4]
       [3]
       [2]
       [1]
*/


[
    [10],
    [8, 9],
    [7],
    [5, 6],
    [4],
    [3],
    [2],
    [1]

].forEach(fila => {

    const div =
        document.createElement("div");

    div.className = "avion-fila";


    fila.forEach(numero => {

        const casilla =
            document.createElement("button");

        casilla.className = "casilla";

        casilla.textContent = numero;

        casilla.type = "button";

        casillas[numero] = casilla;

        div.appendChild(casilla);

    });


    tablero.appendChild(div);

});


/* ==========================================
   MOSTRAR AVIONCITO
   ========================================== */

function marcarJugador() {

    Object.values(casillas).forEach(casilla => {

        casilla.classList.remove("jugador");

    });


    if (casillas[jugador]) {

        casillas[jugador]
            .classList.add("jugador");


        if (jugador === piedra) {

            casillas[jugador]
                .classList.remove("jugador");

        }

    }
}


/* ==========================================
   RUTA DEL AVIONCITO
   ========================================== */

/*
   1 ⬆️ 2
   2 ⬆️ 3
   3 ⬆️ 4
   4 ⬆️ 5
   5 ➡️ 6
   6 ⬆️ 7
   7 ⬆️ 8
   8 ➡️ 9
   9 ⬆️ 10
*/

const ruta = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10
];


/* ==========================================
   ENCONTRAR SIGUIENTE CASILLA
   ========================================== */

function siguienteCasilla() {

    let posicion =
        ruta.indexOf(jugador);


    if (posicion === -1) {
        return null;
    }


    posicion++;


    while (posicion < ruta.length) {

        const siguiente =
            ruta[posicion];


        // Si es la piedra,
        // la saltamos.

        if (siguiente === piedra) {

            posicion++;

            continue;
        }


        return siguiente;
    }


    return null;
}


/* ==========================================
   POSICIONES DEL TABLERO
   ========================================== */

const posicionesAvion = {

    1: {
        fila: 7,
        columna: 0
    },

    2: {
        fila: 6,
        columna: 0
    },

    3: {
        fila: 5,
        columna: 0
    },

    4: {
        fila: 4,
        columna: 0
    },

    5: {
        fila: 3,
        columna: 0
    },

    6: {
        fila: 3,
        columna: 1
    },

    7: {
        fila: 2,
        columna: 0
    },

    8: {
        fila: 1,
        columna: 0
    },

    9: {
        fila: 1,
        columna: 1
    },

    10: {
        fila: 0,
        columna: 0
    }

};


/* ==========================================
   DIRECCIÓN CORRECTA
   ========================================== */

function direccionCorrecta() {

    const siguiente =
        siguienteCasilla();


    if (siguiente === null) {
        return null;
    }


    const actual =
        posicionesAvion[jugador];


    const destino =
        posicionesAvion[siguiente];


    if (!actual || !destino) {
        return null;
    }


    /*
       Subir
    */

    if (destino.fila < actual.fila) {

        return "ArrowUp";

    }


    /*
       Bajar
    */

    if (destino.fila > actual.fila) {

        return "ArrowDown";

    }


    /*
       Derecha
    */

    if (destino.columna > actual.columna) {

        return "ArrowRight";

    }


    /*
       Izquierda
    */

    if (destino.columna < actual.columna) {

        return "ArrowLeft";

    }


    return null;
}


/* ==========================================
   TEXTO DE AYUDA
   ========================================== */

function actualizarMensaje() {

    if (!activo) return;


    const siguiente =
        siguienteCasilla();


    if (siguiente === null) {
        return;
    }


    const direccion =
        direccionCorrecta();


    const flechas = {

        ArrowUp: "⬆️",

        ArrowDown: "⬇️",

        ArrowLeft: "⬅️",

        ArrowRight: "➡️"

    };


    const flecha =
        flechas[direccion] || "⬆️";


    mensajeJuego.textContent =
        `✈️ Ahora ve a la casilla ${siguiente} usando ${flecha}`;
}


/* ==========================================
   LANZAR PIEDRITA
   ========================================== */

function lanzarPiedra() {

    /*
       La piedra caerá entre 2 y 9.
       Así siempre queda una ruta
       hasta llegar a la casilla 10.
    */

    piedra =
        Math.floor(Math.random() * 8) + 2;


    jugador = 1;

    activo = true;


    /* Limpiar tablero */

    Object.entries(casillas).forEach(
        ([numero, casilla]) => {

            casilla.className = "casilla";

            casilla.textContent = numero;

        }
    );


    /* Mostrar piedra */

    casillas[piedra]
        .classList.add("piedra");

    casillas[piedra]
        .textContent = "⚫";


    /* Mostrar jugador */

    marcarJugador();


    beep(300);


    botonLanzar.innerHTML =
        "<span>⚫</span> ¡Nueva piedrita!";


    mensajeJuego.textContent =
        `⚫ La piedra cayó en la ${piedra}. ¡Comienza en la 1!`;


    setTimeout(() => {

        if (activo) {

            actualizarMensaje();

        }

    }, 700);
}


/* ==========================================
   MOVER CON LAS FLECHAS
   ========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const teclas = [

            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight"

        ];


        if (!teclas.includes(event.key)) {
            return;
        }


        event.preventDefault();


        if (!activo) {

            mensajeJuego.textContent =
                "⚫ Primero presiona «¡Lanzar piedrita!»";

            return;
        }


        const siguiente =
            siguienteCasilla();


        const direccion =
            direccionCorrecta();


        /*
           Si presiona una flecha incorrecta
        */

        if (event.key !== direccion) {

            beep(160);


            const flechas = {

                ArrowUp: "⬆️",

                ArrowDown: "⬇️",

                ArrowLeft: "⬅️",

                ArrowRight: "➡️"

            };


            mensajeJuego.textContent =
                `❌ Esa no. Usa ${flechas[direccion]} para llegar a la casilla ${siguiente}.`;

            return;
        }


        /*
           Avanzamos
        */

        jugador = siguiente;


        marcarJugador();


        beep(350);


        /*
           ¿Llegó al 10?
        */

        if (jugador === 10) {

            activo = false;


            sumarPunto();


            lanzarConfeti();


            mensajeJuego.textContent =
                "🎉 ¡LO LOGRASTE! Llegaste hasta el 10.";


            botonLanzar.innerHTML =
                "<span>✈️</span> ¡Jugar otra vez!";


            return;
        }


        /*
           Todavía falta avanzar
        */

        actualizarMensaje();

    }
);


/* ==========================================
   BOTÓN LANZAR
   ========================================== */

botonLanzar.addEventListener(
    "click",
    lanzarPiedra
);


/* ==========================================
   CONFETI
   ========================================== */

function lanzarConfeti() {

    const colores = [

        "#087443",
        "#ffffff",
        "#d92832",
        "#ffd34d"

    ];


    for (let i = 0; i < 45; i++) {

        const pieza =
            document.createElement("span");


        pieza.style.position =
            "fixed";

        pieza.style.top =
            "-20px";

        pieza.style.left =
            `${Math.random() * 100}%`;


        pieza.style.width =
            "9px";

        pieza.style.height =
            "15px";


        pieza.style.background =
            colores[
                Math.floor(
                    Math.random() *
                    colores.length
                )
            ];


        pieza.style.zIndex =
            "9999";

        pieza.style.pointerEvents =
            "none";


        pieza.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        pieza.style.transition =
            "transform 3s ease, top 3s ease, opacity 3s ease";


        document.body.appendChild(pieza);


        setTimeout(() => {

            pieza.style.top =
                "110vh";


            pieza.style.transform =
                `translateX(${Math.random() * 240 - 120}px)
                 rotate(720deg)`;


            pieza.style.opacity =
                "0";

        }, 50);


        setTimeout(() => {

            pieza.remove();

        }, 3200);

    }
}