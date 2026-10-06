/* =====================================================
   BALERO - TRADICIONES AL AIRE
   Juego de arrastrar y meter la punta en el hoyito
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const escena = document.getElementById("escena");
    const palito = document.getElementById("palitoBalero");
    const punta = document.querySelector(".punta-balero");
    const hoyo = document.getElementById("hoyoBalero");
    const lineaCuerda = document.getElementById("lineaCuerda");

    const botonLanzar = document.getElementById("botonLanzar");
    const botonSonido = document.getElementById("botonSonido");

    const mensaje = document.getElementById("mensajeJuego");
    const zonaExito = document.getElementById("zonaExito");

    const aciertosElemento = document.getElementById("aciertos");
    const recordElemento = document.getElementById("record");
    const rachaElemento = document.getElementById("racha");

    /* =================================================
       DATOS
       ================================================= */

    let aciertos = Number(localStorage.getItem("baleroAciertos")) || 0;
    let record = Number(localStorage.getItem("baleroRecord")) || 0;
    let racha = Number(localStorage.getItem("baleroRacha")) || 0;

    let arrastrando = false;
    let intentoActivo = true;

    let offsetX = 0;
    let offsetY = 0;

    let posicionInicial = {
        x: 0,
        y: 0
    };

    /* =================================================
       MARCADOR
       ================================================= */

    function actualizarMarcador() {
        aciertosElemento.textContent = aciertos;
        recordElemento.textContent = record;
        rachaElemento.textContent = racha;
    }

    actualizarMarcador();

    /* =================================================
       POSICIÓN INICIAL
       ================================================= */

    function colocarPalitoInicial() {

        const escenaRect = escena.getBoundingClientRect();

        const x = escena.clientWidth / 2 - palito.offsetWidth / 2;

        let y;

        if (window.innerWidth <= 700) {
            y = escena.clientHeight - 160;
        } else {
            y = escena.clientHeight - 175;
        }

        palito.style.left = `${x}px`;
        palito.style.top = `${y}px`;

        palito.style.transform = "rotate(-12deg)";

        posicionInicial.x = x;
        posicionInicial.y = y;

        actualizarCuerda();
    }

    /* =================================================
       CUERDA
       ================================================= */

    function actualizarCuerda() {

        const escenaRect = escena.getBoundingClientRect();

        const copaRect = document
            .getElementById("copaBalero")
            .getBoundingClientRect();

        const palitoRect = palito.getBoundingClientRect();

        const inicioX =
            copaRect.left +
            copaRect.width / 2 -
            escenaRect.left;

        const inicioY =
            copaRect.bottom -
            escenaRect.top -
            10;

        const finalX =
            palitoRect.left +
            palitoRect.width / 2 -
            escenaRect.left;

        const finalY =
            palitoRect.top +
            palitoRect.height / 2 -
            escenaRect.top;

        const dx = finalX - inicioX;
        const dy = finalY - inicioY;

        const distancia = Math.sqrt(
            dx * dx + dy * dy
        );

        const angulo =
            Math.atan2(dy, dx) * 180 / Math.PI;

        lineaCuerda.style.left = `${inicioX}px`;
        lineaCuerda.style.top = `${inicioY}px`;
        lineaCuerda.style.width = `${distancia}px`;
        lineaCuerda.style.transform =
            `rotate(${angulo}deg)`;
    }

    /* =================================================
       OBTENER POSICIÓN DE LA PUNTA
       ================================================= */

    function obtenerCentroPunta() {

        const rect = punta.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + 3
        };
    }

    /* =================================================
       OBTENER CENTRO DEL HOYO
       ================================================= */

    function obtenerCentroHoyo() {

        const rect = hoyo.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    /* =================================================
       DISTANCIA ENTRE PUNTA Y HOYO
       ================================================= */

    function calcularDistancia() {

        const puntaPos = obtenerCentroPunta();
        const hoyoPos = obtenerCentroHoyo();

        const dx = puntaPos.x - hoyoPos.x;
        const dy = puntaPos.y - hoyoPos.y;

        return Math.sqrt(
            dx * dx + dy * dy
        );
    }

    /* =================================================
       POINTER DOWN
       ================================================= */

    palito.addEventListener("pointerdown", (e) => {

        if (e.button !== undefined && e.button !== 0) {
            return;
        }

        e.preventDefault();

        arrastrando = true;
        intentoActivo = true;

        palito.classList.add("agarrado");

        try {
            palito.setPointerCapture(e.pointerId);
        } catch (error) {
            // Algunos navegadores pueden no soportarlo.
        }

        const rect = palito.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        mensaje.textContent =
            "🎯 ¡Muy bien! Ahora llévalo hasta el hoyito";

        escena.classList.remove("acierto", "fallo");
    });

    /* =================================================
       POINTER MOVE
       ================================================= */

    palito.addEventListener("pointermove", (e) => {

        if (!arrastrando) {
            return;
        }

        e.preventDefault();

        const escenaRect = escena.getBoundingClientRect();

        let x =
            e.clientX -
            escenaRect.left -
            offsetX;

        let y =
            e.clientY -
            escenaRect.top -
            offsetY;

        /* Límites */

        const margen = 4;

        x = Math.max(
            margen,
            Math.min(
                x,
                escena.clientWidth -
                palito.offsetWidth -
                margen
            )
        );

        y = Math.max(
            margen,
            Math.min(
                y,
                escena.clientHeight -
                palito.offsetHeight -
                margen
            )
        );

        palito.style.left = `${x}px`;
        palito.style.top = `${y}px`;

        /* Inclinar un poco el palito según el movimiento */

        const centroX =
            escena.clientWidth / 2;

        const diferencia =
            x +
            palito.offsetWidth / 2 -
            centroX;

        const inclinacion =
            Math.max(
                -28,
                Math.min(
                    28,
                    diferencia / 8
                )
            );

        palito.style.transform =
            `rotate(${inclinacion}deg)`;

        actualizarCuerda();

        /* Detectar cercanía */

        const distancia = calcularDistancia();

        if (distancia < 75) {

            escena.classList.add("cerca");

            if (distancia < 40) {
                mensaje.textContent =
                    "🔥 ¡Ahí! Suelta para intentar meterlo";
            }

        } else {

            escena.classList.remove("cerca");

            mensaje.textContent =
                "🖐️ Sigue acercando la punta al hoyito";
        }
    });

    /* =================================================
       POINTER UP
       ================================================= */

    palito.addEventListener("pointerup", (e) => {

        if (!arrastrando) {
            return;
        }

        e.preventDefault();

        arrastrando = false;

        palito.classList.remove("agarrado");

        try {
            palito.releasePointerCapture(e.pointerId);
        } catch (error) {
            // No pasa nada si el navegador no lo permite.
        }

        escena.classList.remove("cerca");

        intentarMeter();

    });

    /* =================================================
       POINTER CANCEL
       ================================================= */

    palito.addEventListener("pointercancel", () => {

        if (!arrastrando) {
            return;
        }

        arrastrando = false;

        palito.classList.remove("agarrado");

        regresarPalito();

    });

    /* =================================================
       INTENTAR METER
       ================================================= */

    function intentarMeter() {

        const distancia = calcularDistancia();

        /*
         * Esta es la parte importante:
         * NO hay azar.
         *
         * Si la punta está suficientemente cerca
         * del centro del hoyito, gana.
         */

        if (distancia <= 34) {

            ganar();

        } else {

            perder();

        }
    }

    /* =================================================
       GANAR
       ================================================= */

    function ganar() {

        aciertos++;
        racha++;

        if (racha > record) {
            record = racha;
        }

        localStorage.setItem(
            "baleroAciertos",
            aciertos
        );

        localStorage.setItem(
            "baleroRecord",
            record
        );

        localStorage.setItem(
            "baleroRacha",
            racha
        );

        actualizarMarcador();

        escena.classList.add("acierto");

        mensaje.textContent =
            "🎉 ¡LO LOGRASTE! ¡La punta entró en el hoyito!";

        botonLanzar.innerHTML =
            "<span>🪀</span> ¡Otro intento!";

        /* Colocar visualmente la punta dentro */

        const escenaRect = escena.getBoundingClientRect();
        const hoyoPos = obtenerCentroHoyo();

        const nuevoX =
            hoyoPos.x -
            escenaRect.left -
            palito.offsetWidth / 2;

        const nuevoY =
            hoyoPos.y -
            escenaRect.top -
            3;

        palito.style.left = `${nuevoX}px`;
        palito.style.top = `${nuevoY}px`;
        palito.style.transform =
            "rotate(0deg) scale(.82)";

        actualizarCuerda();

        mostrarCelebracion();

        intentoActivo = false;
    }

    /* =================================================
       PERDER
       ================================================= */

    function perder() {

        racha = 0;

        localStorage.setItem(
            "baleroRacha",
            racha
        );

        actualizarMarcador();

        escena.classList.add("fallo");

        mensaje.textContent =
            "😅 ¡Casi! La punta no quedó en el hoyito";

        botonLanzar.innerHTML =
            "<span>↻</span> Intentar otra vez";

        setTimeout(() => {

            escena.classList.remove("fallo");

            regresarPalito();

        }, 450);

        intentoActivo = false;
    }

    /* =================================================
       REGRESAR PALITO
       ================================================= */

    function regresarPalito() {

        palito.style.transition =
            "left .35s ease, top .35s ease, transform .35s ease";

        palito.style.left =
            `${posicionInicial.x}px`;

        palito.style.top =
            `${posicionInicial.y}px`;

        palito.style.transform =
            "rotate(-12deg)";

        actualizarCuerda();

        setTimeout(() => {

            palito.style.transition = "";

        }, 380);

        mensaje.textContent =
            "🖐️ Agarra el palito y vuelve a intentarlo";
    }

    /* =================================================
       BOTÓN NUEVO INTENTO
       ================================================= */

    botonLanzar.addEventListener("click", () => {

        escena.classList.remove(
            "acierto",
            "fallo",
            "cerca"
        );

        intentoActivo = true;

        regresarPalito();

        botonLanzar.innerHTML =
            "<span>🪀</span> Intentar";

        mensaje.textContent =
            "🖐️ Agarra el palito y llévalo hasta el hoyito";
    });

    /* =================================================
       TECLADO
       ================================================= */

    palito.addEventListener("keydown", (e) => {

        const paso = 10;

        let x = parseFloat(
            palito.style.left
        ) || posicionInicial.x;

        let y = parseFloat(
            palito.style.top
        ) || posicionInicial.y;

        if (
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowDown"
        ) {

            e.preventDefault();

            if (e.key === "ArrowLeft") {
                x -= paso;
            }

            if (e.key === "ArrowRight") {
                x += paso;
            }

            if (e.key === "ArrowUp") {
                y -= paso;
            }

            if (e.key === "ArrowDown") {
                y += paso;
            }

            x = Math.max(
                0,
                Math.min(
                    x,
                    escena.clientWidth -
                    palito.offsetWidth
                )
            );

            y = Math.max(
                0,
                Math.min(
                    y,
                    escena.clientHeight -
                    palito.offsetHeight
                )
            );

            palito.style.left = `${x}px`;
            palito.style.top = `${y}px`;

            actualizarCuerda();

            mensaje.textContent =
                "🎯 Usa las flechas para acercar la punta al hoyito";
        }

        if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            intentarMeter();
        }
    });

    /* =================================================
       SONIDO
       ================================================= */

    let sonidoActivo = true;

    botonSonido.addEventListener("click", () => {

        sonidoActivo = !sonidoActivo;

        botonSonido.textContent =
            sonidoActivo ? "🔊" : "🔇";
    });

    /* =================================================
       CELEBRACIÓN
       ================================================= */

    function mostrarCelebracion() {

        for (let i = 0; i < 14; i++) {

            const particula =
                document.createElement("span");

            particula.textContent =
                ["✦", "★", "✧", "●"][i % 4];

            particula.style.position = "absolute";

            particula.style.left =
                `${45 + Math.random() * 10}%`;

            particula.style.top =
                `${25 + Math.random() * 20}%`;

            particula.style.fontSize =
                `${15 + Math.random() * 14}px`;

            particula.style.color =
                [
                    "#2864e8",
                    "#7146d9",
                    "#f05a9d",
                    "#ffd447",
                    "#35c9bd"
                ][i % 5];

            particula.style.pointerEvents = "none";

            particula.style.zIndex = "30";

            particula.style.transition =
                "all .8s ease";

            escena.appendChild(particula);

            requestAnimationFrame(() => {

                particula.style.transform =
                    `translate(
                        ${(Math.random() - .5) * 180}px,
                        ${(Math.random() - .5) * 160}px
                    ) scale(.3)`;

                particula.style.opacity = "0";
            });

            setTimeout(() => {
                particula.remove();
            }, 850);
        }
    }

    /* =================================================
       INICIALIZACIÓN
       ================================================= */

    colocarPalitoInicial();

    window.addEventListener("resize", () => {

        colocarPalitoInicial();

    });

});