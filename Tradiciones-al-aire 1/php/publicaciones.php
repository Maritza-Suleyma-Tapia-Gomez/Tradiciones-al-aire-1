<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$metodo = $_SERVER["REQUEST_METHOD"];


/* =====================================================
   CREAR PUBLICACIÓN
===================================================== */

if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $usuario_id = intval(
        $datos["usuario_id"] ?? 0
    );

    $categoria = trim(
        $datos["categoria"] ?? ""
    );

    $texto = trim(
        $datos["texto"] ?? ""
    );


    if (
        $usuario_id <= 0 ||
        $categoria === "" ||
        $texto === ""
    ) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "Faltan datos para crear la publicación"
        ]);

        exit;
    }


    if (mb_strlen($texto) > 280) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "La publicación no puede superar 280 caracteres"
        ]);

        exit;
    }


    /* =================================================
       GUARDAR PUBLICACIÓN
    ================================================= */

    $stmt = $conexion->prepare(
        "INSERT INTO publicaciones
        (usuario_id, categoria, texto)
        VALUES (?, ?, ?)"
    );


    $stmt->bind_param(
        "iss",
        $usuario_id,
        $categoria,
        $texto
    );


    if (!$stmt->execute()) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "No se pudo crear la publicación"
        ]);

        exit;
    }


    $idPublicacion =
        $stmt->insert_id;


    $stmt->close();


    /* =================================================
       DAR 5 PUNTOS POR PUBLICAR
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
            $puntosActuales + 5;


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
            $idPublicacion,

        "puntos_ganados" =>
            5,

        "mensaje" =>
            "¡Publicación creada! +5 puntos 🎉"

    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =====================================================
   OBTENER PUBLICACIONES
===================================================== */

if ($metodo === "GET") {

    $sql = "
        SELECT
            publicaciones.id,
            publicaciones.usuario_id,
            publicaciones.categoria,
            publicaciones.texto,
            publicaciones.fecha_creacion,
            usuarios.nombre,
            usuarios.avatar
        FROM publicaciones
        INNER JOIN usuarios
            ON publicaciones.usuario_id = usuarios.id
        ORDER BY publicaciones.id DESC
    ";


    $resultado =
        $conexion->query($sql);


    if (!$resultado) {

        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "No se pudieron cargar las publicaciones"
        ]);

        exit;
    }


    $publicaciones = [];


    while (
        $fila =
        $resultado->fetch_assoc()
    ) {

        $publicaciones[] =
            $fila;
    }


    echo json_encode([

        "ok" => true,

        "publicaciones" =>
            $publicaciones

    ], JSON_UNESCAPED_UNICODE);

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