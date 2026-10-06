<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$metodo = $_SERVER["REQUEST_METHOD"];


/* =========================
   AGREGAR / QUITAR REACCIÓN
========================= */

if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $usuario_id = intval($datos["usuario_id"] ?? 0);
    $publicacion_id = intval($datos["publicacion_id"] ?? 0);

    if ($usuario_id <= 0 || $publicacion_id <= 0) {

        echo json_encode([
            "ok" => false,
            "mensaje" => "Faltan datos"
        ]);

        exit;
    }


    /* Comprobar si ya existe */

    $stmt = $conexion->prepare(
        "SELECT id
         FROM reacciones
         WHERE publicacion_id = ?
         AND usuario_id = ?"
    );

    $stmt->bind_param(
        "ii",
        $publicacion_id,
        $usuario_id
    );

    $stmt->execute();

    $resultado = $stmt->get_result();


    /* =========================
       SI YA LE DIO ME GUSTA
    ========================= */

    if ($resultado->num_rows > 0) {

        $reaccion = $resultado->fetch_assoc();

        $stmt->close();

        $stmt = $conexion->prepare(
            "DELETE FROM reacciones
             WHERE id = ?"
        );

        $stmt->bind_param(
            "i",
            $reaccion["id"]
        );

        $stmt->execute();

        echo json_encode([
            "ok" => true,
            "activo" => false,
            "mensaje" => "Me gusta quitado"
        ]);

        $stmt->close();

        exit;
    }


    /* =========================
       AGREGAR ME GUSTA
    ========================= */

    $stmt->close();

    $stmt = $conexion->prepare(
        "INSERT INTO reacciones
        (publicacion_id, usuario_id, tipo)
        VALUES (?, ?, 'like')"
    );

    $stmt->bind_param(
        "ii",
        $publicacion_id,
        $usuario_id
    );


    if ($stmt->execute()) {

        echo json_encode([
            "ok" => true,
            "activo" => true,
            "mensaje" => "Me gusta agregado"
        ]);

    } else {

        echo json_encode([
            "ok" => false,
            "mensaje" => "No se pudo guardar el me gusta"
        ]);
    }

    $stmt->close();

    exit;
}


/* =========================
   OBTENER REACCIONES
========================= */

if ($metodo === "GET") {

    $publicacion_id =
        intval($_GET["publicacion_id"] ?? 0);

    if ($publicacion_id <= 0) {

        echo json_encode([
            "ok" => false,
            "mensaje" => "Publicación no válida"
        ]);

        exit;
    }


    $stmt = $conexion->prepare(
        "SELECT COUNT(*) AS total
         FROM reacciones
         WHERE publicacion_id = ?"
    );

    $stmt->bind_param(
        "i",
        $publicacion_id
    );

    $stmt->execute();

    $resultado = $stmt->get_result();

    $fila = $resultado->fetch_assoc();

    echo json_encode([
        "ok" => true,
        "total" => intval($fila["total"])
    ]);

    $stmt->close();

    exit;
}


echo json_encode([
    "ok" => false,
    "mensaje" => "Método no permitido"
]);

?>