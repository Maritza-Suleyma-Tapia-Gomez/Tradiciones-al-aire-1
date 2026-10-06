/* =====================================
   LOTERÍA | TRADICIONES AL AIRE
   🎴 24 CARTAS REALES
===================================== */


/* =====================================
   CARTAS
===================================== */

const cartas = [

    {
        nombre: "El Árbol",
        imagen: "imagenes/arbol.jpg"
    },

    {
        nombre: "El Bandolón",
        imagen: "imagenes/bandolon.jpg"
    },

    {
        nombre: "La Bandera",
        imagen: "imagenes/bandera.jpg"
    },

    {
        nombre: "El Barril",
        imagen: "imagenes/barril.jpg"
    },

    {
        nombre: "La Bota",
        imagen: "imagenes/bota.jpg"
    },

    {
        nombre: "La Botella",
        imagen: "imagenes/botella.jpg"
    },

    {
        nombre: "El Catrín",
        imagen: "imagenes/catrin.jpg"
    },

    {
        nombre: "El Cotorro",
        imagen: "imagenes/cotorro.jpg"
    },

    {
        nombre: "La Dama",
        imagen: "imagenes/dama.jpg"
    },

    {
        nombre: "El Diablo",
        imagen: "imagenes/diablo.jpg"
    },

    {
        nombre: "La Escalera",
        imagen: "imagenes/escalera.jpg"
    },

    {
        nombre: "El Gallo",
        imagen: "imagenes/gallo.jpg"
    },

    {
        nombre: "La Garza",
        imagen: "imagenes/garza.jpg"
    },

    {
        nombre: "El Gorrito",
        imagen: "imagenes/gorrito.jpg"
    },

    {
        nombre: "La Luna",
        imagen: "imagenes/luna.jpg"
    },

    {
        nombre: "La Mano",
        imagen: "imagenes/mano.jpg"
    },

    {
        nombre: "El Melón",
        imagen: "imagenes/melon.jpg"
    },

    {
        nombre: "La Muerte",
        imagen: "imagenes/muerte.jpg"
    },

    {
        nombre: "El Pájaro",
        imagen: "imagenes/pajaro.jpg"
    },

    {
        nombre: "El Paraguas",
        imagen: "imagenes/paraguas.jpg"
    },

    {
        nombre: "La Pera",
        imagen: "imagenes/pera.jpg"
    },

    {
        nombre: "La Sirena",
        imagen: "imagenes/sirena.jpg"
    },

    {
        nombre: "El Valiente",
        imagen: "imagenes/valiente.jpg"
    },

    {
        nombre: "El Violoncello",
        imagen: "imagenes/violoncello.jpg"
    }

];


/* =====================================
   ELEMENTOS
===================================== */

const tablero =
    document.getElementById("tablero");

const botonSacar =
    document.getElementById("botonSacar");

const botonCantar =
    document.getElementById("botonCantar");

const botonComenzar =
    document.getElementById("botonComenzar");

const botonNueva =
    document.getElementById("botonNueva");

const botonSonido =
    document.getElementById("botonSonido");

const cartaImagen =
    document.getElementById("cartaImagen");

const cartaNombre =
    document.getElementById("cartaNombre");

const mensajeCarta =
    document.getElementById("mensajeCarta");

const cartasSalidas =
    document.getElementById("cartasSalidas");

const cartasAcertadas =
    document.getElementById("cartasAcertadas");

const victoriasTexto =
    document.getElementById("victorias");

const progresoTablero =
    document.getElementById("progresoTablero");

const resultadoCard =
    document.getElementById("resultadoCard");

const resultadoIcono =
    document.getElementById("resultadoIcono");

const resultadoTitulo =
    document.getElementById("resultadoTitulo");

const resultadoTexto =
    document.getElementById("resultadoTexto");


/* =====================================
   ESTADO DEL JUEGO
===================================== */

let tableroJugador = [];

let cartasDisponibles = [];

let cartaActual = null;

let cartasSalidasNumero = 0;

let cartasAcertadasNumero = 0;

let partidaActiva = false;

let sonidoActivo = true;


let victorias = Number(
    localStorage.getItem(
        "victoriasLoteria"
    ) || 0
);


victoriasTexto.textContent =
    victorias;


/* =====================================
   CREAR TABLERO
===================================== */

function crearTablero() {

    tablero.innerHTML = "";


    /*
       Mezclamos las 24 cartas.

       El jugador recibe solamente 16.
    */

    const mezcla =
        [...cartas].sort(
            () => Math.random() - 0.5
        );


    tableroJugador =
        mezcla
            .slice(0, 16)
            .map(carta => ({

                ...carta,

                marcada: false

            }));


    tableroJugador.forEach(
        (carta, indice) => {


            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "carta-tablero";


            boton.dataset.indice =
                indice;


            boton.type =
                "button";


            boton.innerHTML = `

                <div class="carta-mini">

                    <img
                        src="${carta.imagen}"
                        alt="${carta.nombre}"
                    >

                </div>


                <div class="nombre-mini">

                    ${carta.nombre}

                </div>

            `;


            boton.addEventListener(
                "click",
                () => marcarCarta(indice)
            );


            tablero.appendChild(
                boton
            );

        }
    );


    actualizarProgreso();

}


/* =====================================
   MARCAR CARTA
===================================== */

function marcarCarta(indice) {


    if (!partidaActiva) {

        mensajeCarta.textContent =
            "🎮 Primero presiona «Comenzar partida».";

        return;

    }


    const carta =
        tableroJugador[indice];


    if (carta.marcada) {

        return;

    }


    if (!cartaActual) {

        mensajeCarta.textContent =
            "🎴 Primero saca una carta.";

        return;

    }


    /*
       Comparamos la carta seleccionada
       con la carta que salió.
    */

    if (
        carta.nombre ===
        cartaActual.nombre
    ) {


        carta.marcada = true;


        cartasAcertadasNumero++;


        const elemento =
            tablero.children[indice];


        elemento.classList.add(
            "marcada"
        );


        cartasAcertadas.textContent =
            cartasAcertadasNumero;


        mensajeCarta.textContent =
            `🎯 ¡Correcto! Era ${carta.nombre}.`;


        actualizarProgreso();


        comprobarVictoria();


    } else {


        mensajeCarta.textContent =
            `❌ Esa no es. Busca "${cartaActual.nombre}".`;

    }

}


/* =====================================
   COMENZAR PARTIDA
===================================== */

botonComenzar.addEventListener(
    "click",
    comenzarPartida
);


function comenzarPartida() {


    crearTablero();


    cartasDisponibles =
        [...cartas];


    cartasSalidasNumero = 0;

    cartasAcertadasNumero = 0;

    cartaActual = null;

    partidaActiva = true;


    cartasSalidas.textContent =
        "0";


    cartasAcertadas.textContent =
        "0";


    botonSacar.disabled = false;


    botonComenzar.disabled = true;


    botonComenzar.textContent =
        "🎮 Partida en curso";


    resultadoCard.classList.remove(
        "mostrar"
    );


    cartaImagen.innerHTML =
        "🃏";


    cartaNombre.textContent =
        "¡Partida comenzada!";


    mensajeCarta.textContent =
        "🎴 Saca la primera carta.";


    actualizarProgreso();

}


/* =====================================
   SACAR CARTA
===================================== */

botonSacar.addEventListener(
    "click",
    sacarCarta
);


function sacarCarta() {


    if (!partidaActiva) {

        mensajeCarta.textContent =
            "🎮 Primero comienza una partida.";

        return;

    }


    if (
        cartasDisponibles.length === 0
    ) {

        finalizarDerrota();

        return;

    }


    const indice =
        Math.floor(
            Math.random() *
            cartasDisponibles.length
        );


    cartaActual =
        cartasDisponibles.splice(
            indice,
            1
        )[0];


    cartasSalidasNumero++;


    cartasSalidas.textContent =
        cartasSalidasNumero;


    /*
       Mostrar imagen real.
    */

    cartaImagen.innerHTML = `

        <img
            src="${cartaActual.imagen}"
            alt="${cartaActual.nombre}"
        >

    `;


    cartaNombre.textContent =
        cartaActual.nombre;


    /*
       Animación de la carta.
    */

    const marco =
        document.getElementById(
            "cartaMarco"
        );


    if (marco) {

        marco.classList.remove(
            "nueva"
        );


        void marco.offsetWidth;


        marco.classList.add(
            "nueva"
        );

    }


    mensajeCarta.textContent =
        `🔎 Busca "${cartaActual.nombre}" en tu tablero.`;


    /*
       Cantar automáticamente.
    */

    if (sonidoActivo) {

        cantarCarta();

    }


    revisarCartasDisponibles();

}


/* =====================================
   CANTAR CARTA
===================================== */

if (botonCantar) {

    botonCantar.addEventListener(
        "click",
        cantarCarta
    );

}


function cantarCarta() {


    if (!cartaActual) {

        mensajeCarta.textContent =
            "🎴 Primero saca una carta.";

        return;

    }


    if (!sonidoActivo) {

        mensajeCarta.textContent =
            "🔇 El sonido está desactivado.";

        return;

    }


    if (
        "speechSynthesis" in window
    ) {


        speechSynthesis.cancel();


        const voz =
            new SpeechSynthesisUtterance(
                `¡${cartaActual.nombre}!`
            );


        voz.lang =
            "es-MX";


        voz.rate =
            0.85;


        voz.pitch =
            1.05;


        voz.volume =
            1;


        speechSynthesis.speak(
            voz
        );


        mensajeCarta.textContent =
            `🔊 ¡${cartaActual.nombre}!`;

    }

}


/* =====================================
   BOTÓN SONIDO
===================================== */

botonSonido.addEventListener(
    "click",
    () => {


        sonidoActivo =
            !sonidoActivo;


        botonSonido.textContent =
            sonidoActivo
                ? "🔊"
                : "🔇";


        if (!sonidoActivo) {


            if (
                "speechSynthesis" in window
            ) {

                speechSynthesis.cancel();

            }


            mensajeCarta.textContent =
                "🔇 Sonido desactivado.";


        } else {


            mensajeCarta.textContent =
                "🔊 Sonido activado.";


            if (cartaActual) {

                cantarCarta();

            }

        }

    }
);


/* =====================================
   COMPROBAR VICTORIA
===================================== */

function comprobarVictoria() {


    if (
        cartasAcertadasNumero ===
        tableroJugador.length
    ) {


        partidaActiva =
            false;


        victorias++;


        victoriasTexto.textContent =
            victorias;


        localStorage.setItem(
            "victoriasLoteria",
            victorias
        );


        botonSacar.disabled =
            true;


        botonComenzar.disabled =
            false;


        botonComenzar.textContent =
            "🎮 Comenzar otra partida";


        resultadoIcono.textContent =
            "🏆";


        resultadoTitulo.textContent =
            "¡LOTERÍA! 🎉";


        resultadoTexto.textContent =
            "¡Completaste las 16 cartas de tu tablero!";


        resultadoCard.classList.add(
            "mostrar"
        );


        mensajeCarta.textContent =
            "🎉 ¡LOTERÍA! ¡Ganaste!";


        if (sonidoActivo) {

            hablar(
                "¡Lotería! ¡Ganaste!"
            );

        }


        lanzarConfeti();

    }

}


/* =====================================
   NUEVA PARTIDA
===================================== */

botonNueva.addEventListener(
    "click",
    nuevaPartida
);


function nuevaPartida() {


    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();

    }


    partidaActiva =
        false;


    cartaActual =
        null;


    cartasDisponibles =
        [];


    cartasSalidasNumero =
        0;


    cartasAcertadasNumero =
        0;


    tablero.innerHTML =
        "";


    cartasSalidas.textContent =
        "0";


    cartasAcertadas.textContent =
        "0";


    progresoTablero.textContent =
        "0 / 16";


    cartaImagen.innerHTML =
        "🃏";


    cartaNombre.textContent =
        "¡Presiona comenzar!";


    mensajeCarta.textContent =
        "Cuando salga una carta, búscala en tu tablero.";


    botonSacar.disabled =
        false;


    botonComenzar.disabled =
        false;


    botonComenzar.textContent =
        "🎮 Comenzar partida";


    resultadoCard.classList.remove(
        "mostrar"
    );

}


/* =====================================
   PROGRESO
===================================== */

function actualizarProgreso() {


    progresoTablero.textContent =
        `${cartasAcertadasNumero} / ${tableroJugador.length}`;

}


/* =====================================
   REVISAR CARTAS
===================================== */

function revisarCartasDisponibles() {


    const botones =
        tablero.querySelectorAll(
            ".carta-tablero"
        );


    botones.forEach(
        (boton, indice) => {


            const carta =
                tableroJugador[indice];


            if (carta.marcada) {

                boton.classList.add(
                    "marcada"
                );

            }

        }
    );

}


/* =====================================
   FINALIZAR SI SE ACABA EL MAZO
===================================== */

function finalizarDerrota() {


    partidaActiva =
        false;


    botonSacar.disabled =
        true;


    botonComenzar.disabled =
        false;


    botonComenzar.textContent =
        "🎮 Comenzar otra partida";


    resultadoIcono.textContent =
        "💪";


    resultadoTitulo.textContent =
        "Se acabaron las cartas";


    resultadoTexto.textContent =
        `Marcaste ${cartasAcertadasNumero} de 16 cartas.`;


    resultadoCard.classList.add(
        "mostrar"
    );


    mensajeCarta.textContent =
        "💪 ¡Casi! Inténtalo otra vez.";

}


/* =====================================
   FUNCIÓN PARA HABLAR
===================================== */

function hablar(texto) {


    if (
        !sonidoActivo ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    speechSynthesis.cancel();


    const voz =
        new SpeechSynthesisUtterance(
            texto
        );


    voz.lang =
        "es-MX";


    voz.rate =
        0.85;


    voz.pitch =
        1.05;


    voz.volume =
        1;


    speechSynthesis.speak(
        voz
    );

}


/* =====================================
   CONFETI 🎉
===================================== */

function lanzarConfeti() {


    const colores = [

        "#087443",
        "#ffffff",
        "#d92332",
        "#ffd447"

    ];


    for (
        let i = 0;
        i < 70;
        i++
    ) {


        const pieza =
            document.createElement(
                "span"
            );


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


        pieza.style.borderRadius =
            "2px";


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
            `rotate(
                ${Math.random() * 360}deg
            )`;


        pieza.style.transition =
            "transform 3s ease, top 3s ease, opacity 3s ease";


        document.body.appendChild(
            pieza
        );


        setTimeout(
            () => {


                pieza.style.top =
                    "110vh";


                pieza.style.transform =
                    `translateX(
                        ${Math.random() * 240 - 120}px
                    )
                    rotate(720deg)`;


                pieza.style.opacity =
                    "0";


            },
            50
        );


        setTimeout(
            () => {

                pieza.remove();

            },
            3200
        );

    }

}