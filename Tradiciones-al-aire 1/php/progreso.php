<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");


/* =========================
   COMPROBAR MÉTODO
========================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido"
    ]);

    exit;
}


/* =========================
   RECIBIR DATOS
========================= */

$datos = json_decode(
    file_get_contents("php://input"),
    true
);


$usuario_id =
    intval($datos["usuario_id"] ?? 0);


$puntos =
    intval($datos["puntos"] ?? 0);


$motivo =
    trim($datos["motivo"] ?? "");


/* =========================
   VALIDAR
========================= */

if ($usuario_id <= 0) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Usuario no válido"
    ]);

    exit;
}


if ($puntos <= 0) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Los puntos deben ser mayores que cero"
    ]);

    exit;
}


/* =========================
   BUSCAR USUARIO
========================= */

$stmt = $conexion->prepare(
    "SELECT puntos, nivel
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
        "mensaje" => "Usuario no encontrado"
    ]);

    $stmt->close();

    exit;
}


$usuario =
    $resultado->fetch_assoc();


$stmt->close();


/* =========================
   CALCULAR NUEVOS PUNTOS
========================= */

$puntosActuales =
    intval($usuario["puntos"]);


$nuevosPuntos =
    $puntosActuales + $puntos;


/* =========================
   CALCULAR NIVEL
========================= */

$nuevoNivel =
    floor($nuevosPuntos / 100) + 1;


/* =========================
   ACTUALIZAR USUARIO
========================= */

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
        "mensaje" => "No se pudieron actualizar los puntos"
    ]);

    $stmt->close();

    exit;
}


$stmt->close();


/* =========================
   RESPUESTA
========================= */

echo json_encode([

    "ok" => true,

    "puntos_anteriores" =>
        $puntosActuales,

    "puntos_ganados" =>
        $puntos,

    "puntos_totales" =>
        $nuevosPuntos,

    "nivel" =>
        $nuevoNivel,

    "motivo" =>
        $motivo,

    "mensaje" =>
        "¡Puntos agregados correctamente! 🎉"

], JSON_UNESCAPED_UNICODE);

?>