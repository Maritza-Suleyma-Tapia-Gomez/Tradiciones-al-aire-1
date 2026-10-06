const URL_RETOS = "php/retos.php";

const CLAVE_USUARIO_ID = "tradicionesUsuarioId";


/* =====================================================
   ELEMENTOS
===================================================== */

const nombreReto =
    document.getElementById("nombre-reto");

const descripcionReto =
    document.getElementById("descripcion-reto");

const metaReto =
    document.getElementById("meta-reto");

const botonCrearReto =
    document.getElementById("boton-crear-reto");

const listaRetos =
    document.getElementById("lista-retos");


/* =====================================================
   USUARIO
===================================================== */

function obtenerUsuarioId() {

    return Number(
        localStorage.getItem(
            CLAVE_USUARIO_ID
        )
    ) || 0;

}


/* =====================================================
   MENSAJE
===================================================== */

function mostrarMensaje(mensaje) {

    let elemento =
        document.querySelector(".mensaje-retos");


    if (!elemento) {

        elemento =
            document.createElement("div");

        elemento.className =
            "mensaje-retos";

        document.body.appendChild(
            elemento
        );
    }


    elemento.textContent =
        mensaje;


    elemento.classList.add(
        "mostrar"
    );


    setTimeout(() => {

        elemento.classList.remove(
            "mostrar"
        );

    }, 2500);

}


/* =====================================================
   CREAR RETO
===================================================== */

async function crearReto() {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarMensaje(
            "Primero inicia sesión para crear un reto."
        );

        return;
    }


    const nombre =
        nombreReto.value.trim();


    const descripcion =
        descripcionReto.value.trim();


    const meta =
        Number(metaReto.value);


    if (!nombre) {

        mostrarMensaje(
            "Escribe un nombre para el reto."
        );

        nombreReto.focus();

        return;
    }


    if (!meta || meta < 1) {

        mostrarMensaje(
            "La meta debe ser de al menos 1."
        );

        metaReto.focus();

        return;
    }


    botonCrearReto.disabled =
        true;

    botonCrearReto.textContent =
        "⏳ Creando...";


    try {

        const respuesta =
            await fetch(
                URL_RETOS,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        accion: "crear",

                        usuario_id:
                            usuarioId,

                        nombre:
                            nombre,

                        descripcion:
                            descripcion,

                        meta:
                            meta

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            mostrarMensaje(
                datos.mensaje ||
                "No se pudo crear el reto."
            );

            return;
        }


        nombreReto.value =
            "";

        descripcionReto.value =
            "";

        metaReto.value =
            "5";


        mostrarMensaje(
            "¡Reto creado correctamente! 🏆"
        );


        cargarRetos();


    } catch (error) {

        console.error(
            "Error creando reto:",
            error
        );


        mostrarMensaje(
            "No se pudo conectar con el servidor."
        );

    } finally {

        botonCrearReto.disabled =
            false;

        botonCrearReto.textContent =
            "🏆 Crear reto";

    }

}


/* =====================================================
   CARGAR RETOS
===================================================== */

async function cargarRetos() {

    try {

        const respuesta =
            await fetch(
                URL_RETOS
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            listaRetos.innerHTML = `
                <div class="sin-retos">
                    <div>😕</div>
                    <p>
                        No se pudieron cargar los retos.
                    </p>
                </div>
            `;

            return;
        }


        const retos =
            datos.retos || [];


        if (retos.length === 0) {

            listaRetos.innerHTML = `
                <div class="sin-retos">
                    <div>🏆</div>
                    <p>
                        Todavía no hay retos.
                        ¡Sé el primero en crear uno!
                    </p>
                </div>
            `;

            return;
        }


        listaRetos.innerHTML =
            retos
                .map(
                    crearTarjetaReto
                )
                .join("");


    } catch (error) {

        console.error(
            "Error cargando retos:",
            error
        );


        listaRetos.innerHTML = `
            <div class="sin-retos">
                <div>⚠️</div>
                <p>
                    No se pudo conectar con el servidor.
                </p>
            </div>
        `;

    }

}


/* =====================================================
   CREAR TARJETA
===================================================== */

function crearTarjetaReto(reto) {

    const meta =
        Number(reto.meta || 1);


    const progreso =
        Number(reto.progreso || 0);


    let porcentaje =
        (progreso / meta) * 100;


    porcentaje =
        Math.min(
            100,
            Math.max(0, porcentaje)
        );


    const completado =
        reto.estado === "completado";


    return `

        <article
            class="reto-card ${
                completado
                    ? "reto-completado"
                    : ""
            }"
        >

            <div class="reto-top">

                <div class="reto-titulo">

                    <span>
                        ${
                            completado
                                ? "🏆"
                                : "🎯"
                        }
                    </span>

                    <div>

                        <h3>
                            ${escaparHTML(
                                reto.nombre
                            )}
                        </h3>

                    </div>

                </div>


                ${
                    completado
                        ? `
                            <span class="estado-completado">
                                ✅ Completado
                            </span>
                        `
                        : ""
                }

            </div>


            <p class="reto-descripcion">
                ${
                    escaparHTML(
                        reto.descripcion ||
                        "Reto tradicional mexicano"
                    )
                }
            </p>


            <p class="reto-creador">
                👤 Creado por:
                <strong>
                    ${escaparHTML(
                        reto.creador ||
                        "Jugador"
                    )}
                </strong>
            </p>


            <div class="progreso-contenedor">

                <div class="progreso-texto">

                    <span>
                        📈 Progreso
                    </span>

                    <span>
                        ${progreso} / ${meta}
                    </span>

                </div>


                <div class="progreso-barra">

                    <div
                        class="progreso-relleno"
                        style="width:${porcentaje}%"
                    ></div>

                </div>

            </div>


            <div class="reto-botones">

                ${
                    !completado
                        ? `
                            <button
                                type="button"
                                class="boton-reto boton-unirse"
                                onclick="unirseReto(${reto.id})"
                            >
                                👥 Unirme
                            </button>

                            <button
                                type="button"
                                class="boton-reto boton-completar"
                                onclick="completarReto(${reto.id})"
                            >
                                🏆 Completar
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="boton-reto boton-completar"
                                disabled
                            >
                                ✅ Reto terminado
                            </button>
                        `
                }

            </div>

        </article>

    `;

}


/* =====================================================
   UNIRSE A RETO
===================================================== */

async function unirseReto(retoId) {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarMensaje(
            "Primero inicia sesión para unirte."
        );

        return;
    }


    try {

        const respuesta =
            await fetch(
                URL_RETOS,
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
                            usuarioId,

                        reto_id:
                            retoId

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            mostrarMensaje(
                datos.mensaje ||
                "No se pudo unir al reto."
            );

            return;
        }


        mostrarMensaje(
            datos.ya_estaba
                ? "Ya participas en este reto. 🎯"
                : "¡Te uniste al reto! 🎯"
        );


        cargarRetos();


    } catch (error) {

        console.error(
            "Error al unirse:",
            error
        );


        mostrarMensaje(
            "No se pudo conectar con el servidor."
        );

    }

}


/* =====================================================
   COMPLETAR RETO
===================================================== */

async function completarReto(retoId) {

    const usuarioId =
        obtenerUsuarioId();


    if (!usuarioId) {

        mostrarMensaje(
            "Primero inicia sesión para completar el reto."
        );

        return;
    }


    const confirmar =
        confirm(
            "¿Seguro que ya completaste este reto? 🏆"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                URL_RETOS,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        accion:
                            "completar",

                        usuario_id:
                            usuarioId,

                        reto_id:
                            retoId

                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!datos.ok) {

            mostrarMensaje(
                datos.mensaje ||
                "No se pudo completar el reto."
            );

            return;
        }


        mostrarMensaje(
            "🏆 ¡Reto completado! +25 puntos"
        );


        cargarRetos();


    } catch (error) {

        console.error(
            "Error completando reto:",
            error
        );


        mostrarMensaje(
            "No se pudo conectar con el servidor."
        );

    }

}


/* =====================================================
   PROTEGER TEXTO
===================================================== */

function escaparHTML(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Retos iniciado correctamente."
        );


        if (botonCrearReto) {

            botonCrearReto.addEventListener(
                "click",
                crearReto
            );

        }


        cargarRetos();

    }
);