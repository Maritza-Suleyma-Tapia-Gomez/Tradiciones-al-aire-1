<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido"
    ]);
    exit;
}

$sql = "SELECT id, nombre, avatar, puntos, nivel
        FROM usuarios
        ORDER BY id DESC
        LIMIT 1";

$resultado = $conexion->query($sql);

if (!$resultado) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error al consultar usuarios"
    ]);
    exit;
}

$usuario = $resultado->fetch_assoc();

if (!$usuario) {
    echo json_encode([
        "ok" => false,
        "mensaje" => "Todavía no hay usuarios registrados"
    ]);
    exit;
}

echo json_encode([
    "ok" => true,
    "usuario" => $usuario
]);

?>