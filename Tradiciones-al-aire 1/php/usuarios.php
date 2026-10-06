<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    $nombre = trim($datos["nombre"] ?? "");

    if ($nombre === "") {
        echo json_encode([
            "ok" => false,
            "mensaje" => "El nombre es obligatorio"
        ]);
        exit;
    }

    $stmt = $conexion->prepare(
        "INSERT INTO usuarios (nombre) VALUES (?)"
    );

    $stmt->bind_param("s", $nombre);

    if ($stmt->execute()) {

        echo json_encode([
            "ok" => true,
            "id" => $stmt->insert_id,
            "nombre" => $nombre,
            "mensaje" => "Usuario creado correctamente"
        ]);

    } else {

        echo json_encode([
            "ok" => false,
            "mensaje" => "No se pudo crear el usuario"
        ]);
    }

    $stmt->close();
    exit;
}

if ($metodo === "GET") {

    $sql = "SELECT id, nombre, avatar, puntos, nivel
            FROM usuarios
            ORDER BY id DESC";

    $resultado = $conexion->query($sql);

    $usuarios = [];

    while ($fila = $resultado->fetch_assoc()) {
        $usuarios[] = $fila;
    }

    echo json_encode([
        "ok" => true,
        "usuarios" => $usuarios
    ]);

    exit;
}

echo json_encode([
    "ok" => false,
    "mensaje" => "Método no permitido"
]);

?>