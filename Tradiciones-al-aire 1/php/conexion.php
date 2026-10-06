<?php

$servidor = "localhost";
$usuario = "root";
$contrasena = "";
$baseDatos = "tradiciones_al_aire";

$conexion = new mysqli(
    $servidor,
    $usuario,
    $contrasena,
    $baseDatos
);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");

?>