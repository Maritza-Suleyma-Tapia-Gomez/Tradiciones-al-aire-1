/* =====================================
   MATATENA | JUEGO
   Tradiciones al Aire
===================================== */

const pelota = document.getElementById("pelota");
const piezas = document.querySelectorAll(".pieza");

const botonJugar = document.getElementById("botonJugar");
const botonSonido = document.getElementById("botonSonido");

const mensajeJuego = document.getElementById("mensajeJuego");

const piezasAtrapadasTexto =
    document.getElementById("piezasAtrapadas");

const recordTexto =
    document.getElementById("record");

const rachaTexto =
    document.getElementById("racha");


/* =====================================
   ESTADO
===================================== */

let jugando = false;
let atrapadasRonda = 0;
let tiempoRonda = null;
let pelotaArriba = false;


/* =====================================
   DATOS GUARDADOS
===================================== */

let piezasAtrapadas = Number(
    localStorage.getItem("piezasMatatena") || 0
);

let record = Number(
    localStorage.getItem("recordMatatena") || 0
);

let racha = Number(
    localStorage.getItem("rachaMatatena") || 0
);

let sonidoActivo = true;


/* =====================================
   MARCADOR
===================================== */

piezasAtrapadasTexto.textContent =
    piezasAtrapadas;

recordTexto.textContent =
    record;

rachaTexto.textContent =
    racha;


/* =====================================
   SONIDO
===================================== */

const sonido = new Audio(
    "sonidos/musica-mexicana.mp3"
);

sonido.loop = true;
sonido.volume = 0.25;


botonSonido.addEventListener("click", () => {

    sonidoActivo = !sonidoActivo;

    botonSonido.textContent =
        sonidoActivo ? "🔊" : "🔇";

    if (!sonidoActivo) {

        sonido.pause();

        mensajeJuego.textContent =
            "🔇 Sonido desactivado";

    } else {

        sonido.play().catch(() => {});

        mensajeJuego.textContent =
            "🔊 Sonido activado";
    }
});


/* =====================================
   BOTÓN JUGAR
===================================== */

botonJugar.addEventListener(
    "click",
    iniciarRonda
);


/* =====================================
   PIEZAS
===================================== */

piezas.forEach((pieza, indice) => {

    pieza.style.cursor = "pointer";

    pieza.addEventListener("click", () => {

        if (!jugando) return;

        if (pieza.classList.contains("atrapada")) {
            return;
        }

        if (!pelotaArriba) {

            mensajeJuego.textContent =
                "⏳ ¡Espera! ¡La pelota todavía está subiendo!";

            return;
        }


        /* ==============================
           ATRAPAR PIEZA
        ============================== */

        pieza.classList.add("atrapada");

        atrapadasRonda++;


        mensajeJuego.textContent =
            `✨ ¡Pieza ${indice + 1} atrapada! ${atrapadasRonda}/5`;


        crearChispas(pieza);


        if (atrapadasRonda === piezas.length) {

            clearTimeout(tiempoRonda);

            terminarRonda(
                atrapadasRonda
            );
        }

    });

});


/* =====================================
   INICIAR RONDA
===================================== */

function iniciarRonda() {

    if (jugando) return;


    jugando = true;

    atrapadasRonda = 0;

    pelotaArriba = false;


    botonJugar.disabled = true;

    botonJugar.innerHTML =
        `<span>⏳</span> ¡Atrapa las piezas!`;


    mensajeJuego.textContent =
        "🟡 ¡Prepárate... la pelota va subiendo!";


    /* ==============================
       RESTAURAR PIEZAS
    ============================== */

    piezas.forEach(pieza => {

        pieza.classList.remove(
            "atrapada"
        );

        pieza.style.opacity = "";

    });


    /* ==============================
       REINICIAR PELOTA
    ============================== */

    pelota.classList.remove(
        "lanzando",
        "momento-atrapar"
    );

    void pelota.offsetWidth;

    pelota.classList.add(
        "lanzando"
    );


    /* ==============================
       MÚSICA
    ============================== */

    if (sonidoActivo) {

        sonido.play().catch(() => {});

    }


    /* ==============================
       MOMENTO PARA ATRAPAR
    ============================== */

    setTimeout(() => {

        if (!jugando) return;


        pelotaArriba = true;


        mensajeJuego.textContent =
            "🎯 ¡AHORA! ¡ATRAPA LAS 5 PIEZAS!";


        pelota.classList.add(
            "momento-atrapar"
        );

    }, 1200);


    /* ==============================
       TIEMPO DE LA RONDA
    ============================== */

    tiempoRonda = setTimeout(() => {

        if (!jugando) return;


        terminarRonda(
            atrapadasRonda
        );

    }, 6000);

}


/* =====================================
   TERMINAR RONDA
===================================== */

function terminarRonda(cantidad) {

    if (!jugando) return;


    jugando = false;

    pelotaArriba = false;


    clearTimeout(
        tiempoRonda
    );


    pelota.classList.remove(
        "lanzando",
        "momento-atrapar"
    );


    botonJugar.disabled = false;

    botonJugar.innerHTML =
        `<span>🎾</span> ¡Lanzar pelota!`;


    /* ==============================
       GUARDAR PIEZAS
    ============================== */

    piezasAtrapadas += cantidad;

    piezasAtrapadasTexto.textContent =
        piezasAtrapadas;


    localStorage.setItem(
        "piezasMatatena",
        piezasAtrapadas
    );


    /* ==============================
       RÉCORD
    ============================== */

    if (cantidad > record) {

        record = cantidad;

        recordTexto.textContent =
            record;

        localStorage.setItem(
            "recordMatatena",
            record
        );
    }


    /* ==============================
       RESULTADO
    ============================== */

    if (cantidad === 5) {

        mensajeJuego.textContent =
            "🏆🎉 ¡PERFECTO! ¡ATRAPASTE LAS 5!";

        racha++;

        lanzarConfeti();

        crearCelebracion();

    } else if (cantidad >= 3) {

        mensajeJuego.textContent =
            `🎯 ¡Muy bien! Atrapaste ${cantidad} piezas.`;

        racha++;

    } else if (cantidad > 0) {

        mensajeJuego.textContent =
            `💪 Atrapaste ${cantidad} piezas. ¡Intenta conseguir las 5!`;

        racha = 0;

    } else {

        mensajeJuego.textContent =
            "😮 ¡No atrapaste ninguna! ¡Inténtalo otra vez!";

        racha = 0;
    }


    /* ==============================
       ACTUALIZAR RACHA
    ============================== */

    rachaTexto.textContent =
        racha;


    localStorage.setItem(
        "rachaMatatena",
        racha
    );


    /* ==============================
       RESTAURAR PIEZAS
    ============================== */

    setTimeout(() => {

        piezas.forEach(pieza => {

            pieza.classList.remove(
                "atrapada"
            );

        });

    }, 900);

}


/* =====================================
   CHISPAS
===================================== */

function crearChispas(elemento) {

    const rect =
        elemento.getBoundingClientRect();


    for (let i = 0; i < 8; i++) {

        const chispa =
            document.createElement("span");


        chispa.textContent =
            i % 2 === 0
                ? "✨"
                : "✦";


        chispa.style.position =
            "fixed";


        chispa.style.left =
            `${rect.left + rect.width / 2}px`;


        chispa.style.top =
            `${rect.top + rect.height / 2}px`;


        chispa.style.fontSize =
            `${Math.random() * 12 + 10}px`;


        chispa.style.zIndex =
            "9999";


        chispa.style.pointerEvents =
            "none";


        chispa.style.transition =
            "transform .7s ease, opacity .7s ease";


        document.body.appendChild(
            chispa
        );


        const x =
            Math.random() * 100 - 50;


        const y =
            Math.random() * 100 - 50;


        setTimeout(() => {

            chispa.style.transform =
                `translate(${x}px, ${y}px)`;


            chispa.style.opacity =
                "0";

        }, 20);


        setTimeout(() => {

            chispa.remove();

        }, 800);

    }

}


/* =====================================
   CELEBRACIÓN
===================================== */

function crearCelebracion() {

    pelota.animate(
        [
            {
                transform:
                    "translateX(-50%) scale(1)"
            },

            {
                transform:
                    "translateX(-50%) scale(1.25)"
            },

            {
                transform:
                    "translateX(-50%) scale(1)"
            }
        ],
        {
            duration: 700,
            iterations: 2
        }
    );


    mensajeJuego.animate(
        [
            {
                transform: "scale(1)"
            },

            {
                transform: "scale(1.08)"
            },

            {
                transform: "scale(1)"
            }
        ],
        {
            duration: 500
        }
    );

}


/* =====================================
   CONFETI
===================================== */

function lanzarConfeti() {

    const colores = [
        "#087443",
        "#ffffff",
        "#d92832",
        "#ffd34d"
    ];


    for (let i = 0; i < 50; i++) {

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


        document.body.appendChild(
            pieza
        );


        setTimeout(() => {

            pieza.style.top =
                "110vh";


            pieza.style.transform =
                `translateX(
                    ${Math.random() * 240 - 120}px
                )
                rotate(720deg)`;


            pieza.style.opacity =
                "0";

        }, 50);


        setTimeout(() => {

            pieza.remove();

        }, 3200);

    }

}