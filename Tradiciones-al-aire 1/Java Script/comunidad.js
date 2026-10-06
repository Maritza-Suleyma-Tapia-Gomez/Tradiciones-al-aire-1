const URL_PUBLICACIONES = "php/publicaciones.php";
const URL_REACCIONES = "php/reacciones.php";
const URL_COMENTARIOS = "php/comentarios.php";
const URL_PARTIDAS = "php/partidas.php";

const CLAVE_USUARIO_ID = "tradicionesUsuarioId";

let categoriaSeleccionada = "Tradiciones";
let partidaActual = null;
let intervaloPartida = null;


/* =========================
   ELEMENTOS
========================= */

const textoPublicacion =
    document.getElementById("texto-publicacion");

const contador =
    document.getElementById("contador");

const botonPublicar =
    document.getElementById("boton-publicar");

const listaPublicaciones =
    document.getElementById("lista-publicaciones");

const botonesCategoria =
    document.querySelectorAll(".categoria");


/* =========================
   ELEMENTOS DE PARTIDA
========================= */

const juegoPartida =
    document.getElementById("juego-partida");

const maxJugadores =
    document.getElementById("max-jugadores");

const botonCrearPartida =
    document.getElementById("boton-crear-partida");

const partidaCreada =
    document.getElementById("partida-creada");

const codigoPartida =
    document.getElementById("codigo-partida");

const botonCopiarCodigo =
    document.getElementById("boton-copiar-codigo");

const nombreJuegoPartida =
    document.getElementById("nombre-juego-partida");

const jugadoresPartida =
    document.getElementById("jugadores-partida");

const botonVerPartida =
    document.getElementById("boton-ver-partida");

const codigoUnirse =
    document.getElementById("codigo-unirse");

const botonUnirse =
    document.getElementById("boton-unirse");


/* =========================
   CATEGORÍAS
========================= */

botonesCategoria.forEach(boton => {

    boton.addEventListener("click", () => {

        botonesCategoria.forEach(b => {
            b.classList.remove("activo");
        });

        boton.classList.add("activo");

        categoriaSeleccionada =
            boton.dataset.categoria;

    });

});


/* =========================
   CONTADOR PUBLICACIÓN
========================= */

if (textoPublicacion) {

    textoPublicacion.addEventListener("input", () => {

        contador.textContent =
            `${textoPublicacion.value.length} / 280`;

    });

}


/* =========================
   CREAR PUBLICACIÓN
========================= */

async function crearPublicacion() {

    const texto =
        textoPublicacion.value.trim();

    const usuarioId =
        localStorage.getItem(CLAVE_USUARIO_ID);


    if (!usuarioId) {

        alert(
            "Primero inicia sesión en Tradiciones al Aire."
        );

        return;
    }


    if (texto === "") {

        alert(
            "Escribe algo antes de publicar."
        );

        return;
    }


    botonPublicar.disabled = true;

    botonPublicar.textContent =
        "Publicando...";


    try {

        const respuesta =
            await fetch(
                URL_PUBLICACIONES,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            Number(usuarioId),

                        categoria:
                            categoriaSeleccionada,

                        texto:
                            texto

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            alert(
                datos.mensaje ||
                "No se pudo crear la publicación."
            );

            return;
        }


        textoPublicacion.value = "";

        contador.textContent =
            "0 / 280";


        await cargarPublicaciones();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );


    } finally {

        botonPublicar.disabled = false;

        botonPublicar.textContent =
            "🚀 Publicar";

    }

}


/* =========================
   CARGAR PUBLICACIONES
========================= */

async function cargarPublicaciones() {

    try {

        const respuesta =
            await fetch(URL_PUBLICACIONES);


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            mostrarMensaje(
                "😕",
                "No se pudieron cargar las publicaciones."
            );

            return;
        }


        if (datos.publicaciones.length === 0) {

            mostrarMensaje(
                "🌵",
                "Aún no hay publicaciones"
            );

            return;
        }


        listaPublicaciones.innerHTML =
            datos.publicaciones
                .map(publicacion =>
                    crearTarjeta(publicacion)
                )
                .join("");


        cargarReacciones();

        cargarTodosLosComentarios();

        conectarBotonesCompartir();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "📡",
            "No se pudo conectar"
        );

    }

}


/* =========================
   MENSAJE
========================= */

function mostrarMensaje(icono, mensaje) {

    listaPublicaciones.innerHTML = `
        <div class="mensaje-vacio">

            <div>${icono}</div>

            <h3>${mensaje}</h3>

            <p>
                Revisa que Apache y MySQL estén encendidos.
            </p>

        </div>
    `;

}


/* =========================
   CREAR TARJETA
========================= */

function crearTarjeta(publicacion) {

    const avatar =
        publicacion.avatar ||
        "🧑🏻‍🎮";


    const nombre =
        escaparHTML(publicacion.nombre);


    const texto =
        escaparHTML(publicacion.texto);


    const categoria =
        escaparHTML(publicacion.categoria);


    const fecha =
        formatearFecha(publicacion.fecha_creacion);


    return `
        <article
            class="publicacion"
            data-publicacion-id="${publicacion.id}"
        >

            <div class="publicacion-cabeza">

                <div class="avatar">
                    ${avatar}
                </div>

                <div class="datos-usuario">

                    <strong>
                        ${nombre}
                    </strong>

                    <span>
                        ${fecha}
                    </span>

                </div>

                <span class="etiqueta">
                    ${categoria}
                </span>

            </div>


            <p class="texto-publicacion">
                ${texto}
            </p>


            <div class="acciones-publicacion">

                <button
                    type="button"
                    class="boton-like"
                    data-id="${publicacion.id}"
                >
                    ❤️ Me gusta
                    <span class="contador-like">0</span>
                </button>


                <button
                    type="button"
                    class="boton-comentar"
                    data-id="${publicacion.id}"
                >
                    💬 Comentar
                </button>


                <button
                    type="button"
                    class="boton-compartir"
                    data-id="${publicacion.id}"
                >
                    🔗 Compartir
                </button>

            </div>


            <div
                class="zona-comentarios"
                id="comentarios-${publicacion.id}"
            >
            </div>

        </article>
    `;
}


/* =========================
   CARGAR REACCIONES
========================= */

async function cargarReacciones() {

    const botones =
        document.querySelectorAll(".boton-like");


    for (const boton of botones) {

        const publicacionId =
            boton.dataset.id;


        try {

            const respuesta =
                await fetch(
                    `${URL_REACCIONES}?publicacion_id=${publicacionId}`
                );


            const datos =
                await respuesta.json();


            if (datos.ok) {

                const contadorLike =
                    boton.querySelector(
                        ".contador-like"
                    );


                contadorLike.textContent =
                    datos.total;

            }

        } catch (error) {

            console.error(
                "Error cargando reacciones:",
                error
            );

        }

    }


    conectarBotonesLike();

}


/* =========================
   CONECTAR LIKES
========================= */

function conectarBotonesLike() {

    const botones =
        document.querySelectorAll(".boton-like");


    botones.forEach(boton => {

        boton.addEventListener(
            "click",
            () => darLike(boton)
        );

    });

}


/* =========================
   DAR / QUITAR LIKE
========================= */

async function darLike(boton) {

    const usuarioId =
        localStorage.getItem(CLAVE_USUARIO_ID);


    if (!usuarioId) {

        alert("Primero inicia sesión.");

        return;
    }


    const publicacionId =
        boton.dataset.id;


    boton.disabled = true;


    try {

        const respuesta =
            await fetch(
                URL_REACCIONES,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            Number(usuarioId),

                        publicacion_id:
                            Number(publicacionId)

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            alert(
                datos.mensaje ||
                "No se pudo guardar el me gusta."
            );

            return;
        }


        const contadorLike =
            boton.querySelector(
                ".contador-like"
            );


        let total =
            Number(contadorLike.textContent);


        if (datos.activo) {

            total++;

            boton.classList.add(
                "like-activo"
            );

        } else {

            total--;

            if (total < 0) {
                total = 0;
            }

            boton.classList.remove(
                "like-activo"
            );

        }


        contadorLike.textContent =
            total;


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );


    } finally {

        boton.disabled = false;

    }

}


/* =========================
   CARGAR COMENTARIOS
========================= */

async function cargarTodosLosComentarios() {

    const tarjetas =
        document.querySelectorAll(".publicacion");


    for (const tarjeta of tarjetas) {

        await cargarComentarios(
            tarjeta.dataset.publicacionId
        );

    }


    conectarBotonesComentar();

}


async function cargarComentarios(
    publicacionId
) {

    const zona =
        document.getElementById(
            `comentarios-${publicacionId}`
        );


    if (!zona) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${URL_COMENTARIOS}?publicacion_id=${publicacionId}`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {
            return;
        }


        mostrarComentarios(
            zona,
            datos.comentarios
        );


    } catch (error) {

        console.error(
            "Error cargando comentarios:",
            error
        );

    }

}


/* =========================
   MOSTRAR COMENTARIOS
========================= */

function mostrarComentarios(
    zona,
    comentarios
) {

    let html = "";


    if (comentarios.length > 0) {

        html += `
            <div class="lista-comentarios">
        `;


        comentarios.forEach(comentario => {

            html += `
                <div class="comentario">

                    <div class="comentario-avatar">
                        ${comentario.avatar || "🧑🏻‍🎮"}
                    </div>

                    <div class="comentario-contenido">

                        <strong>
                            ${escaparHTML(comentario.nombre)}
                        </strong>

                        <span>
                            ${escaparHTML(comentario.texto)}
                        </span>

                        <small>
                            ${formatearFecha(
                                comentario.fecha_creacion
                            )}
                        </small>

                    </div>

                </div>
            `;

        });


        html += `
            </div>
        `;

    }


    html += `
        <div class="formulario-comentario">

            <input
                type="text"
                class="input-comentario"
                placeholder="Escribe un comentario..."
                maxlength="280"
            >

            <button
                type="button"
                class="boton-enviar-comentario"
            >
                💬
            </button>

        </div>
    `;


    zona.innerHTML = html;

}


/* =========================
   BOTONES COMENTAR
========================= */

function conectarBotonesComentar() {

    const botones =
        document.querySelectorAll(".boton-comentar");


    botones.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const zona =
                    document.getElementById(
                        `comentarios-${boton.dataset.id}`
                    );


                if (!zona) {
                    return;
                }


                zona.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                const input =
                    zona.querySelector(
                        ".input-comentario"
                    );


                if (input) {
                    input.focus();
                }

            }
        );

    });


    conectarBotonesEnviarComentario();

}


/* =========================
   ENVIAR COMENTARIO
========================= */

function conectarBotonesEnviarComentario() {

    const botones =
        document.querySelectorAll(
            ".boton-enviar-comentario"
        );


    botones.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const zona =
                    boton.closest(
                        ".zona-comentarios"
                    );


                const input =
                    zona.querySelector(
                        ".input-comentario"
                    );


                const tarjeta =
                    boton.closest(
                        ".publicacion"
                    );


                enviarComentario(
                    tarjeta.dataset.publicacionId,
                    input.value.trim(),
                    input
                );

            }
        );

    });

}


async function enviarComentario(
    publicacionId,
    texto,
    input
) {

    const usuarioId =
        localStorage.getItem(CLAVE_USUARIO_ID);


    if (!usuarioId) {

        alert("Primero inicia sesión.");

        return;
    }


    if (texto === "") {

        alert("Escribe un comentario.");

        return;
    }


    try {

        const respuesta =
            await fetch(
                URL_COMENTARIOS,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        usuario_id:
                            Number(usuarioId),

                        publicacion_id:
                            Number(publicacionId),

                        texto:
                            texto

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            alert(
                datos.mensaje ||
                "No se pudo guardar el comentario."
            );

            return;
        }


        input.value = "";

        await cargarComentarios(
            publicacionId
        );

        conectarBotonesComentar();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );

    }

}


/* =========================
   COMPARTIR
========================= */

function conectarBotonesCompartir() {

    document
        .querySelectorAll(".boton-compartir")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => compartirPublicacion(boton)
            );

        });

}


async function compartirPublicacion(boton) {

    const publicacionId =
        boton.dataset.id;


    const enlace =
        `${window.location.origin}${window.location.pathname}?publicacion=${publicacionId}`;


    try {

        if (
            navigator.share &&
            /Android|iPhone|iPad|iPod/i.test(
                navigator.userAgent
            )
        ) {

            await navigator.share({

                title:
                    "Tradiciones al Aire 🇲🇽",

                text:
                    "Mira esta publicación en Tradiciones al Aire",

                url:
                    enlace

            });

        } else {

            await navigator.clipboard.writeText(
                enlace
            );

            alert(
                "🔗 ¡Enlace copiado!"
            );

        }

    } catch (error) {

        if (error.name !== "AbortError") {

            console.error(error);

            alert(
                "No se pudo compartir."
            );

        }

    }

}


/* =====================================================
   PARTIDAS
===================================================== */


/* =========================
   CREAR PARTIDA
========================= */

async function crearPartida() {

    console.log("CREAR PARTIDA: botón presionado");


    const usuarioId =
        localStorage.getItem(
            CLAVE_USUARIO_ID
        );


    if (!usuarioId) {

        alert(
            "⚠️ No encontramos tu usuario. Regresa al inicio e inicia sesión nuevamente."
        );

        return;
    }


    if (!juegoPartida || !maxJugadores) {

        alert(
            "⚠️ No se encontraron los controles de la partida en esta página."
        );

        return;
    }


    const juego =
        juegoPartida.value;


    const max =
        Number(
            maxJugadores.value
        );


    console.log(
        "Datos de partida:",
        {
            usuarioId,
            juego,
            max
        }
    );


    botonCrearPartida.disabled = true;

    botonCrearPartida.textContent =
        "⏳ Creando...";


    try {

        const respuesta =
            await fetch(
                URL_PARTIDAS,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        accion: "crear",

                        usuario_id:
                            Number(usuarioId),

                        juego:
                            juego,

                        max_jugadores:
                            max

                    })
                }
            );


        console.log(
            "Respuesta HTTP:",
            respuesta.status
        );


        const textoRespuesta =
            await respuesta.text();


        console.log(
            "Respuesta PHP:",
            textoRespuesta
        );


        let datos;


        try {

            datos =
                JSON.parse(
                    textoRespuesta
                );

        } catch (error) {

            alert(
                "⚠️ PHP respondió algo que no es JSON:\n\n" +
                textoRespuesta
            );

            return;
        }


        if (!datos.ok) {

            alert(
                "⚠️ No se pudo crear la partida:\n\n" +
                (datos.mensaje ||
                "Error desconocido")
            );

            return;
        }


        console.log(
            "Partida creada:",
            datos
        );


        partidaActual = {

            partida_id:
                datos.partida_id,

            codigo:
                datos.codigo,

            juego:
                datos.juego,

            max_jugadores:
                datos.max_jugadores

        };


        if (partidaCreada) {

            partidaCreada.classList.remove(
                "oculto"
            );

            partidaCreada.style.display =
                "block";

        }


        if (codigoPartida) {

            codigoPartida.textContent =
                datos.codigo;

        }


        if (nombreJuegoPartida) {

            nombreJuegoPartida.textContent =
                datos.juego;

        }


        if (jugadoresPartida) {

            jugadoresPartida.textContent =
                `1/${datos.max_jugadores}`;

        }


        alert(
            "🎉 ¡Partida creada!\n\n" +
            "Código: " +
            datos.codigo
        );


        iniciarActualizacionPartida();


    } catch (error) {

        console.error(
            "ERROR CREANDO PARTIDA:",
            error
        );


        alert(
            "❌ Ocurrió un error al crear la partida.\n\n" +
            error.message
        );


    } finally {

        botonCrearPartida.disabled = false;

        botonCrearPartida.textContent =
            "🎮 Crear partida";

    }

}


/* =========================
   COPIAR CÓDIGO
========================= */

async function copiarCodigoPartida() {

    if (!partidaActual) {

        alert(
            "Primero crea una partida."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            partidaActual.codigo
        );


        alert(
            "📋 Código copiado:\n\n" +
            partidaActual.codigo
        );


    } catch (error) {

        alert(
            "Código de partida:\n\n" +
            partidaActual.codigo
        );

    }

}


/* =========================
   UNIRSE A PARTIDA
========================= */

async function unirsePartida() {

    const usuarioId =
        localStorage.getItem(
            CLAVE_USUARIO_ID
        );


    if (!usuarioId) {

        alert(
            "Primero inicia sesión."
        );

        return;
    }


    const codigo =
        codigoUnirse.value
            .trim()
            .toUpperCase();


    if (!codigo) {

        alert(
            "Escribe el código de la partida."
        );

        return;
    }


    botonUnirse.disabled = true;

    botonUnirse.textContent =
        "⏳ Uniéndote...";


    try {

        const respuesta =
            await fetch(
                URL_PARTIDAS,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        accion:
                            "unirse",

                        usuario_id:
                            Number(usuarioId),

                        codigo:
                            codigo

                    })
                }
            );


        const textoRespuesta =
            await respuesta.text();


        let datos;


        try {

            datos =
                JSON.parse(
                    textoRespuesta
                );

        } catch (error) {

            alert(
                "⚠️ PHP respondió algo inesperado:\n\n" +
                textoRespuesta
            );

            return;
        }


        if (!datos.ok) {

            alert(
                "⚠️ " +
                (
                    datos.mensaje ||
                    "No se pudo unir a la partida."
                )
            );

            return;
        }


        partidaActual = {

            partida_id:
                datos.partida_id,

            codigo:
                codigo,

            juego:
                datos.juego,

            max_jugadores:
                datos.max_jugadores

        };


        codigoUnirse.value = "";


        partidaCreada.classList.remove(
            "oculto"
        );


        partidaCreada.style.display =
            "block";


        codigoPartida.textContent =
            codigo;


        nombreJuegoPartida.textContent =
            datos.juego;


        jugadoresPartida.textContent =
            `${datos.total}/${datos.max_jugadores}`;


        alert(
            datos.ya_estaba
                ? "👋 Ya estabas dentro."
                : "🎉 ¡Te uniste a la partida!"
        );


        iniciarActualizacionPartida();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor.\n\n" +
            error.message
        );


    } finally {

        botonUnirse.disabled = false;

        botonUnirse.textContent =
            "🚀 Unirme";

    }

}


/* =========================
   ACTUALIZAR PARTIDA
========================= */

function iniciarActualizacionPartida() {

    if (intervaloPartida) {

        clearInterval(
            intervaloPartida
        );

    }


    actualizarPartida();


    intervaloPartida =
        setInterval(
            actualizarPartida,
            3000
        );

}


async function actualizarPartida() {

    if (!partidaActual) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${URL_PARTIDAS}?codigo=${encodeURIComponent(
                    partidaActual.codigo
                )}`
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {
            return;
        }


        const total =
            datos.participantes.length;


        const max =
            Number(
                datos.partida.max_jugadores
            );


        jugadoresPartida.textContent =
            `${total}/${max}`;


        nombreJuegoPartida.textContent =
            datos.partida.juego;


        if (total >= max) {

            clearInterval(
                intervaloPartida
            );

        }

    } catch (error) {

        console.error(
            "Error actualizando partida:",
            error
        );

    }

}


/* =========================
   VER PARTIDA
========================= */

function verPartida() {

    if (!partidaActual) {

        alert(
            "Primero crea o únete a una partida."
        );

        return;
    }


    alert(
        "🎮 PARTIDA\n\n" +
        "Juego: " +
        partidaActual.juego +
        "\n\n" +
        "Código: " +
        partidaActual.codigo +
        "\n\n" +
        "Comparte este código con tus amigos."
    );

}


/* =========================
   FECHA
========================= */

function formatearFecha(fecha) {

    const fechaObjeto =
        new Date(fecha);


    if (isNaN(fechaObjeto)) {

        return "Ahora";

    }


    return fechaObjeto.toLocaleString(
        "es-MX",
        {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================
   SEGURIDAD
========================= */

function escaparHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent =
        texto;


    return div.innerHTML;

}


/* =====================================================
   BOTONES
===================================================== */

if (botonPublicar) {

    botonPublicar.addEventListener(
        "click",
        crearPublicacion
    );

}


if (botonCrearPartida) {

    botonCrearPartida.addEventListener(
        "click",
        crearPartida
    );

}


if (botonCopiarCodigo) {

    botonCopiarCodigo.addEventListener(
        "click",
        copiarCodigoPartida
    );

}


if (botonUnirse) {

    botonUnirse.addEventListener(
        "click",
        unirsePartida
    );

}


if (botonVerPartida) {

    botonVerPartida.addEventListener(
        "click",
        verPartida
    );

}


if (codigoUnirse) {

    codigoUnirse.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Enter") {

                unirsePartida();

            }

        }
    );

}


/* =========================
   INICIAR
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Comunidad iniciada correctamente."
        );

        console.log(
            "Botón crear partida:",
            botonCrearPartida
        );

        cargarPublicaciones();

    }
);