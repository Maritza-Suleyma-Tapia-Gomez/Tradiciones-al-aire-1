<?php

// Desactivar impresión de advertencias HTML para evitar romper el JSON de JavaScript
error_reporting(0);
ini_set('display_errors', '0');

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$metodo = $_SERVER["REQUEST_METHOD"];


/* =====================================================
   POST
===================================================== */

if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $accion = $datos["accion"] ?? "";

    $usuario_id = intval(
        $datos["usuario_id"] ?? 0
    );


    /* =================================================
       CREAR RETO
    ================================================= */

    if ($accion === "crear") {

        $nombre = trim(
            $datos["nombre"] ?? ""
        );

        $descripcion = trim(
            $datos["descripcion"] ?? ""
        );

        $meta = intval(
            $datos["meta"] ?? 5
        );


        if (
            $usuario_id <= 0 ||
            $nombre === ""
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Faltan datos para crear el reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        if ($meta < 1) {
            $meta = 5;
        }


        $stmt = $conexion->prepare(
            "INSERT INTO retos
            (creador_id, nombre, descripcion, meta)
            VALUES (?, ?, ?, ?)"
        );


        $stmt->bind_param(
            "issi",
            $usuario_id,
            $nombre,
            $descripcion,
            $meta
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No se pudo crear el reto: " . $stmt->error
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $reto_id =
            $stmt->insert_id;


        $stmt->close();


        /* El creador se une automáticamente */

        $stmt = $conexion->prepare(
            "INSERT INTO participantes_retos
            (reto_id, usuario_id)
            VALUES (?, ?)"
        );


        $stmt->bind_param(
            "ii",
            $reto_id,
            $usuario_id
        );


        $stmt->execute();

        $stmt->close();


        echo json_encode([

            "ok" => true,

            "reto_id" =>
                $reto_id,

            "mensaje" =>
                "¡Reto creado correctamente! 🏆"

        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /* =================================================
       UNIRSE A RETO
    ================================================= */

    if ($accion === "unirse") {

        $reto_id = intval(
            $datos["reto_id"] ?? 0
        );


        if (
            $usuario_id <= 0 ||
            $reto_id <= 0
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Faltan datos para unirse al reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        /* Comprobar que existe */

        $stmt = $conexion->prepare(
            "SELECT id, estado
             FROM retos
             WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $reto_id
        );


        $stmt->execute();

        $resultado =
            $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "El reto no existe"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $reto =
            $resultado->fetch_assoc();


        $stmt->close();


        if ($reto["estado"] === "completado") {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Este reto ya está completado"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        /* Comprobar si ya participa */

        $stmt = $conexion->prepare(
            "SELECT id
             FROM participantes_retos
             WHERE reto_id = ?
             AND usuario_id = ?"
        );


        $stmt->bind_param(
            "ii",
            $reto_id,
            $usuario_id
        );


        $stmt->execute();

        $resultado =
            $stmt->get_result();


        if ($resultado->num_rows > 0) {

            echo json_encode([
                "ok" => true,
                "ya_estaba" => true,
                "mensaje" =>
                    "Ya participas en este reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $stmt->close();


        /* Agregar participante */

        $stmt = $conexion->prepare(
            "INSERT INTO participantes_retos
            (reto_id, usuario_id)
            VALUES (?, ?)"
        );


        $stmt->bind_param(
            "ii",
            $reto_id,
            $usuario_id
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No se pudo unir al reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $stmt->close();


        echo json_encode([

            "ok" => true,

            "ya_estaba" => false,

            "mensaje" =>
                "¡Te uniste al reto! 🎯"

        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /* =================================================
       COMPLETAR RETO
    ================================================= */

    if ($accion === "completar") {

        $reto_id = intval(
            $datos["reto_id"] ?? 0
        );


        if (
            $usuario_id <= 0 ||
            $reto_id <= 0
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Faltan datos para completar el reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        /* Buscar reto */

        $stmt = $conexion->prepare(
            "SELECT
                id,
                nombre,
                meta,
                progreso,
                estado
             FROM retos
             WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $reto_id
        );


        $stmt->execute();

        $resultado =
            $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "El reto no existe"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $reto =
            $resultado->fetch_assoc();


        $stmt->close();


        /* Comprobar participante */

        $stmt = $conexion->prepare(
            "SELECT id
             FROM participantes_retos
             WHERE reto_id = ?
             AND usuario_id = ?"
        );


        $stmt->bind_param(
            "ii",
            $reto_id,
            $usuario_id
        );


        $stmt->execute();

        $resultado =
            $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Primero debes unirte al reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $stmt->close();


        /* Evitar cobrar el reto dos veces */

        if ($reto["estado"] === "completado") {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Este reto ya fue completado"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        /* Marcar progreso como completado */

        $meta =
            intval($reto["meta"]);


        $stmt = $conexion->prepare(
            "UPDATE retos
             SET progreso = ?, estado = 'completado'
             WHERE id = ?"
        );


        $stmt->bind_param(
            "ii",
            $meta,
            $reto_id
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No se pudo completar el reto"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $stmt->close();


        /* =================================================
           DAR 25 PUNTOS
        ================================================= */

        $stmt = $conexion->prepare(
            "SELECT puntos
             FROM usuarios
             WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $usuario_id
        );


        $stmt->execute();

        $resultado =
            $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Usuario no encontrado"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $usuario =
            $resultado->fetch_assoc();


        $puntosActuales =
            intval($usuario["puntos"] ?? 0);


        $nuevosPuntos =
            $puntosActuales + 25;


        $nuevoNivel =
            floor(
                $nuevosPuntos / 100
            ) + 1;


        $stmt->close();


        $stmt = $conexion->prepare(
            "UPDATE usuarios
             SET puntos = ?, nivel = ?
             WHERE id = ?"
        );


        $stmt->bind_param(
            "iii",
            $nuevosPuntos,
            $nuevoNivel,
            $usuario_id
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No se pudieron actualizar los puntos"
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        $stmt->close();


        echo json_encode([

            "ok" => true,

            "reto_id" =>
                $reto_id,

            "puntos_ganados" =>
                25,

            "puntos_totales" =>
                $nuevosPuntos,

            "nivel" =>
                $nuevoNivel,

            "mensaje" =>
                "¡Reto completado! +25 puntos 🏆🎉"

        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    echo json_encode([
        "ok" => false,
        "mensaje" => "Acción no válida"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =====================================================
   GET — LISTAR RETOS
===================================================== */

if ($metodo === "GET") {

    // Cambiado a LEFT JOIN para evitar fallos si un usuario no existe
    $sql = "
        SELECT
            retos.id,
            retos.creador_id,
            retos.nombre,
            retos.descripcion,
            retos.meta,
            retos.progreso,
            retos.estado,
            COALESCE(usuarios.nombre, 'Jugador') AS creador
        FROM retos
        LEFT JOIN usuarios
            ON retos.creador_id = usuarios.id
        ORDER BY retos.id DESC
    ";


    $resultado =
        $conexion->query($sql);


    if (!$resultado) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "No se pudieron cargar los retos"
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $retos = [];


    while (
        $fila =
        $resultado->fetch_assoc()
    ) {

        $retos[] =
            $fila;
    }


    echo json_encode([

        "ok" => true,

        "retos" =>
            $retos

    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =====================================================
   MÉTODO NO PERMITIDO
===================================================== */

echo json_encode([
    "ok" => false,
    "mensaje" => "Método no permitido"
], JSON_UNESCAPED_UNICODE);

?>