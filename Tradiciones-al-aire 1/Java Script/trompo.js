const trompo = document.getElementById("trompo");
const botonLanzar = document.getElementById("botonLanzar");
const botonSonido = document.getElementById("botonSonido");

const mensajeGiro = document.getElementById("mensajeGiro");
const tiempoTexto = document.getElementById("tiempo");
const recordTexto = document.getElementById("record");
const rachaTexto = document.getElementById("racha");

let girando = false;

let racha = Number(localStorage.getItem("rachaTrompo") || 0);
let record = Number(localStorage.getItem("recordTrompo") || 0);

let sonidoActivo = true;
let tiempoInicio = 0;
let intervaloTiempo = null;

const musica = new Audio("sonidos/move.mp3");
musica.loop = true;
musica.volume = 0.35;

recordTexto.textContent = `${record.toFixed(1)} s`;
rachaTexto.textContent = racha;


/* =========================
   SONIDO
========================= */

botonSonido.addEventListener("click", () => {
    sonidoActivo = !sonidoActivo;

    if (sonidoActivo) {
        botonSonido.textContent = "🔊";
        musica.play().catch(() => {});
        mensajeGiro.textContent = "🎵 ¡Música mexicana activada!";
    } else {
        botonSonido.textContent = "🔇";
        musica.pause();
        mensajeGiro.textContent = "🔇 Sonido desactivado";
    }
});


/* =========================
   IMPULSO DEL TROMPO
========================= */

function darImpulso() {
    if (!girando) return;

    mensajeGiro.textContent = "💪✨ ¡Buen toque! ¡Sigue girando!";

    crearChispas();

    trompo.classList.remove("impulso");
    void trompo.offsetWidth;
    trompo.classList.add("impulso");
}

trompo.style.cursor = "pointer";

trompo.addEventListener("click", darImpulso);

trompo.addEventListener(
    "touchstart",
    (e) => {
        e.preventDefault();
        darImpulso();
    },
    { passive: false }
);


/* =========================
   BOTÓN LANZAR
========================= */

botonLanzar.addEventListener("click", () => {
    if (girando) return;

    iniciarGiro();
});


/* =========================
   INICIAR GIRO
========================= */

function iniciarGiro() {

    girando = true;

    tiempoInicio = Date.now();

    botonLanzar.disabled = true;

    botonLanzar.innerHTML = `
        <span>⏳</span> ¡Está girando!
    `;

    mensajeGiro.textContent =
        "👆 ¡Toca el trompo para darle impulso!";

    trompo.classList.remove("temblando", "celebracion");

    trompo.classList.add("girando");

    if (sonidoActivo) {
        musica.play().catch(() => {});
    }

    crearChispas();
    crearParticulas();

    /*
       EL TIEMPO YA NO TIENE LÍMITE DE 2.5 SEGUNDOS.
       Sigue contando hasta que el trompo termine.
    */

    intervaloTiempo = setInterval(() => {

        const tiempoActual =
            (Date.now() - tiempoInicio) / 1000;

        tiempoTexto.textContent =
            `${tiempoActual.toFixed(1)} s`;

    }, 50);


    /*
       Después de un tiempo empezamos a avisar
       que el trompo está perdiendo estabilidad.
       Esto NO termina el giro.
    */

    setTimeout(() => {

        if (!girando) return;

        mensajeGiro.textContent =
            "⚠️ ¡Se está tambaleando! ¡Dale impulso!";

        trompo.classList.add("temblando");

    }, 2500);


    /*
       Otro aviso para que se sienta más natural.
    */

    setTimeout(() => {

        if (!girando) return;

        mensajeGiro.textContent =
            "🌀 ¡Sigue girando!";

    }, 4000);
}


/* =========================
   TERMINAR GIRO
========================= */

function terminarGiro() {

    if (!girando) return;

    girando = false;

    clearInterval(intervaloTiempo);
    intervaloTiempo = null;

    const tiempoFinal =
        (Date.now() - tiempoInicio) / 1000;

    trompo.classList.remove(
        "girando",
        "temblando"
    );

    tiempoTexto.textContent =
        `${tiempoFinal.toFixed(1)} s`;

    botonLanzar.disabled = false;

    botonLanzar.innerHTML = `
        <span>🌀</span> ¡Lanzar otra vez!
    `;


    /* =========================
       ACTUALIZAR RÉCORD
    ========================= */

    if (tiempoFinal > record) {

        record = tiempoFinal;

        recordTexto.textContent =
            `${record.toFixed(1)} s`;

        localStorage.setItem(
            "recordTrompo",
            record
        );

        mensajeGiro.textContent =
            `🏆✨ ¡NUEVO RÉCORD! ¡${record.toFixed(1)} segundos!`;

        lanzarConfeti();
        crearChispas();

        trompo.classList.add("celebracion");

        setTimeout(() => {
            trompo.classList.remove("celebracion");
        }, 1200);

    } else {

        mensajeGiro.textContent =
            `💪 ¡Buen giro! Tu récord sigue siendo ${record.toFixed(1)} s.`;
    }


    /* =========================
       RACHA
    ========================= */

    racha++;

    rachaTexto.textContent = racha;

    localStorage.setItem(
        "rachaTrompo",
        racha
    );


    /* Guardar que ya jugó */

    localStorage.setItem(
        "jugado_trompo",
        "true"
    );
}


/* =========================
   DETECTAR CAÍDA DEL TROMPO
========================= */

trompo.addEventListener("animationend", (e) => {

    if (
        e.animationName === "temblarTrompo" &&
        girando
    ) {
        terminarGiro();
    }

});


/*
   Si la animación de temblor no es la que
   termina el giro en tu CSS, podemos hacer
   que el trompo termine al quitarse el
   temblor.
*/

let observadorTemblor = new MutationObserver(() => {

    if (
        girando &&
        trompo.classList.contains("temblando")
    ) {

        setTimeout(() => {

            if (girando) {
                terminarGiro();
            }

        }, 900);
    }

});

observadorTemblor.observe(trompo, {
    attributes: true,
    attributeFilter: ["class"]
});


/* =========================
   CHISPAS
========================= */

function crearChispas() {

    const escena =
        document.querySelector(".trompo-escena");

    if (!escena) return;

    for (let i = 0; i < 8; i++) {

        const chispa =
            document.createElement("span");

        chispa.className = "chispa";

        chispa.textContent = "✦";

        chispa.style.left =
            `${35 + Math.random() * 30}%`;

        chispa.style.top =
            `${35 + Math.random() * 30}%`;

        chispa.style.animationDelay =
            `${Math.random() * 0.2}s`;

        escena.appendChild(chispa);

        setTimeout(() => {
            chispa.remove();
        }, 1000);
    }
}


/* =========================
   PARTÍCULAS
========================= */

function crearParticulas() {

    const escena =
        document.querySelector(".trompo-escena");

    if (!escena) return;

    for (let i = 0; i < 12; i++) {

        const particula =
            document.createElement("span");

        particula.className =
            "particula-trompo";

        particula.style.left =
            `${40 + Math.random() * 20}%`;

        particula.style.top =
            `${45 + Math.random() * 10}%`;

        particula.style.setProperty(
            "--x",
            `${(Math.random() - 0.5) * 180}px`
        );

        particula.style.setProperty(
            "--y",
            `${(Math.random() - 0.5) * 120}px`
        );

        escena.appendChild(particula);

        setTimeout(() => {
            particula.remove();
        }, 900);
    }
}


/* =========================
   CONFETI
========================= */

function lanzarConfeti() {

    const escena =
        document.querySelector(".trompo-escena");

    if (!escena) return;

    for (let i = 0; i < 25; i++) {

        const confeti =
            document.createElement("span");

        confeti.className = "confeti";

        confeti.textContent =
            ["✦", "✧", "•", "★"][
                Math.floor(Math.random() * 4)
            ];

        confeti.style.left =
            `${30 + Math.random() * 40}%`;

        confeti.style.top =
            "35%";

        confeti.style.setProperty(
            "--x",
            `${(Math.random() - 0.5) * 300}px`
        );

        confeti.style.setProperty(
            "--y",
            `${100 + Math.random() * 180}px`
        );

        confeti.style.animationDelay =
            `${Math.random() * 0.3}s`;

        escena.appendChild(confeti);

        setTimeout(() => {
            confeti.remove();
        }, 1600);
    }
}