<?php

require_once "conexion.php";

header("Content-Type: application/json; charset=UTF-8");


/* =========================
   COMPROBAR MÉTODO
========================= */

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido"
    ]);

    exit;
}


/* =========================
   OBTENER ID DEL USUARIO
========================= */

$usuario_id =
    intval($_GET["usuario_id"] ?? 0);


if ($usuario_id <= 0) {

    echo json_encode([
        "ok" => false,
        "mensaje" => "Falta el ID del usuario"
    ]);

    exit;
}


/* =========================
   BUSCAR USUARIO
========================= */

$stmt = $conexion->prepare(
    "SELECT
        id,
        nombre,
        avatar,
        puntos,
        nivel,
        fecha_registro
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
   CONTAR PARTIDAS
========================= */

$stmt = $conexion->prepare(
    "SELECT COUNT(*) AS total
     FROM participantes
     WHERE usuario_id = ?"
);


$stmt->bind_param(
    "i",
    $usuario_id
);


$stmt->execute();


$resultado =
    $stmt->get_result();


$fila =
    $resultado->fetch_assoc();


$partidas =
    intval($fila["total"]);


$stmt->close();


/* =========================
   CONTAR RETOS
========================= */

$stmt = $conexion->prepare(
    "SELECT COUNT(*) AS total
     FROM participantes_retos
     WHERE usuario_id = ?"
);


$stmt->bind_param(
    "i",
    $usuario_id
);


$stmt->execute();


$resultado =
    $stmt->get_result();


$fila =
    $resultado->fetch_assoc();


$retos =
    intval($fila["total"]);


$stmt->close();


/* =========================
   RETOS COMPLETADOS
========================= */

$stmt = $conexion->prepare(
    "SELECT COUNT(*) AS total
     FROM retos
     INNER JOIN participantes_retos
        ON retos.id = participantes_retos.reto_id
     WHERE participantes_retos.usuario_id = ?
     AND retos.estado = 'completado'"
);


$stmt->bind_param(
    "i",
    $usuario_id
);


$stmt->execute();


$resultado =
    $stmt->get_result();


$fila =
    $resultado->fetch_assoc();


$retosCompletados =
    intval($fila["total"]);


$stmt->close();


/* =========================
   PARTIDAS CREADAS
========================= */

$stmt = $conexion->prepare(
    "SELECT COUNT(*) AS total
     FROM partidas
     WHERE creador_id = ?"
);


$stmt->bind_param(
    "i",
    $usuario_id
);


$stmt->execute();


$resultado =
    $stmt->get_result();


$fila =
    $resultado->fetch_assoc();


$partidasCreadas =
    intval($fila["total"]);


$stmt->close();


/* =========================
   RESPUESTA
========================= */

echo json_encode([

    "ok" => true,

    "usuario" => $usuario,

    "estadisticas" => [

        "partidas" =>
            $partidas,

        "partidas_creadas" =>
            $partidasCreadas,

        "retos" =>
            $retos,

        "retos_completados" =>
            $retosCompletados

    ]

], JSON_UNESCAPED_UNICODE);

?>