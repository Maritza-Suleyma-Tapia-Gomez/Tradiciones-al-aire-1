<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$metodo = $_SERVER["REQUEST_METHOD"];


/* =====================================================
   CREAR COMENTARIO
===================================================== */

if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $usuario_id =
        intval($datos["usuario_id"] ?? 0);

    $publicacion_id =
        intval($datos["publicacion_id"] ?? 0);

    $texto =
        trim($datos["texto"] ?? "");


    /* =========================
       VALIDAR
    ========================= */

    if (
        $usuario_id <= 0 ||
        $publicacion_id <= 0 ||
        $texto === ""
    ) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "Faltan datos para crear el comentario"
        ]);

        exit;
    }


    if (mb_strlen($texto) > 280) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "El comentario no puede superar 280 caracteres"
        ]);

        exit;
    }


    /* =========================
       GUARDAR COMENTARIO
    ========================= */

    $stmt = $conexion->prepare(
        "INSERT INTO comentarios
        (publicacion_id, usuario_id, texto)
        VALUES (?, ?, ?)"
    );


    $stmt->bind_param(
        "iis",
        $publicacion_id,
        $usuario_id,
        $texto
    );


    if (!$stmt->execute()) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "No se pudo guardar el comentario"
        ]);

        exit;
    }


    $idComentario =
        $stmt->insert_id;


    $stmt->close();


    /* =================================================
       DAR 2 PUNTOS POR COMENTAR
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


    if ($resultado->num_rows > 0) {

        $usuario =
            $resultado->fetch_assoc();


        $puntosActuales =
            intval($usuario["puntos"]);


        $nuevosPuntos =
            $puntosActuales + 2;


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


        $stmt->execute();

        $stmt->close();

    } else {

        $stmt->close();
    }


    /* =================================================
       RESPUESTA
    ================================================= */

    echo json_encode([

        "ok" => true,

        "id" =>
            $idComentario,

        "puntos_ganados" =>
            2,

        "mensaje" =>
            "¡Comentario creado! +2 puntos 💬⭐"

    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =====================================================
   OBTENER COMENTARIOS
===================================================== */

if ($metodo === "GET") {

    $publicacion_id =
        intval(
            $_GET["publicacion_id"] ?? 0
        );


    if ($publicacion_id <= 0) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "Publicación no válida"
        ]);

        exit;
    }


    $stmt = $conexion->prepare(
        "SELECT
            comentarios.id,
            comentarios.usuario_id,
            comentarios.texto,
            comentarios.fecha_creacion,
            usuarios.nombre,
            usuarios.avatar
         FROM comentarios
         INNER JOIN usuarios
            ON comentarios.usuario_id = usuarios.id
         WHERE comentarios.publicacion_id = ?
         ORDER BY comentarios.id ASC"
    );


    $stmt->bind_param(
        "i",
        $publicacion_id
    );


    $stmt->execute();


    $resultado =
        $stmt->get_result();


    $comentarios = [];


    while (
        $fila =
        $resultado->fetch_assoc()
    ) {

        $comentarios[] =
            $fila;
    }


    echo json_encode([

        "ok" => true,

        "comentarios" =>
            $comentarios

    ], JSON_UNESCAPED_UNICODE);


    $stmt->close();

    exit;
}


/* =====================================================
   MÉTODO NO PERMITIDO
===================================================== */

echo json_encode([
    "ok" => false,
    "mensaje" => "Método no permitido"
]);

?>