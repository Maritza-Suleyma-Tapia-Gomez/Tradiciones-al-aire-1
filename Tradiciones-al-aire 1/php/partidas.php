<?php

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
       CREAR PARTIDA
    ================================================= */

    if ($accion === "crear") {

        $juego = trim(
            $datos["juego"] ?? ""
        );

        $max_jugadores = intval(
            $datos["max_jugadores"] ?? 4
        );


        if ($usuario_id <= 0 || $juego === "") {

            echo json_encode([
                "ok" => false,
                "mensaje" => "Faltan datos para crear la partida"
            ]);

            exit;
        }


        if (
            $max_jugadores < 2 ||
            $max_jugadores > 10
        ) {

            $max_jugadores = 4;
        }


        $codigo = strtoupper(
            substr(
                bin2hex(random_bytes(5)),
                0,
                8
            )
        );


        $stmt = $conexion->prepare(
            "INSERT INTO partidas
            (codigo, creador_id, juego, max_jugadores)
            VALUES (?, ?, ?, ?)"
        );


        $stmt->bind_param(
            "sisi",
            $codigo,
            $usuario_id,
            $juego,
            $max_jugadores
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "No se pudo crear la partida"
            ]);

            exit;
        }


        $partida_id = $stmt->insert_id;

        $stmt->close();


        /* El creador entra automáticamente */

        $stmt = $conexion->prepare(
            "INSERT INTO participantes
            (partida_id, usuario_id)
            VALUES (?, ?)"
        );


        $stmt->bind_param(
            "ii",
            $partida_id,
            $usuario_id
        );


        $stmt->execute();

        $stmt->close();


        echo json_encode([
            "ok" => true,
            "partida_id" => $partida_id,
            "codigo" => $codigo,
            "juego" => $juego,
            "max_jugadores" => $max_jugadores,
            "mensaje" => "Partida creada correctamente"
        ]);

        exit;
    }


    /* =================================================
       UNIRSE A PARTIDA
    ================================================= */

    if ($accion === "unirse") {

        $codigo = strtoupper(
            trim(
                $datos["codigo"] ?? ""
            )
        );


        if (
            $usuario_id <= 0 ||
            $codigo === ""
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "Faltan datos para unirse"
            ]);

            exit;
        }


        $stmt = $conexion->prepare(
            "SELECT
                id,
                juego,
                max_jugadores,
                estado
             FROM partidas
             WHERE codigo = ?"
        );


        $stmt->bind_param(
            "s",
            $codigo
        );


        $stmt->execute();

        $resultado = $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "No existe una partida con ese código"
            ]);

            exit;
        }


        $partida = $resultado->fetch_assoc();

        $stmt->close();


        if ($partida["estado"] !== "esperando") {

            echo json_encode([
                "ok" => false,
                "mensaje" => "Esta partida ya comenzó o terminó"
            ]);

            exit;
        }


        /* Contar participantes */

        $stmt = $conexion->prepare(
            "SELECT COUNT(*) AS total
             FROM participantes
             WHERE partida_id = ?"
        );


        $stmt->bind_param(
            "i",
            $partida["id"]
        );


        $stmt->execute();

        $resultado = $stmt->get_result();

        $fila = $resultado->fetch_assoc();

        $total = intval($fila["total"]);

        $stmt->close();


        if (
            $total >=
            intval($partida["max_jugadores"])
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "La partida está llena"
            ]);

            exit;
        }


        /* Comprobar si ya estaba */

        $stmt = $conexion->prepare(
            "SELECT id
             FROM participantes
             WHERE partida_id = ?
             AND usuario_id = ?"
        );


        $stmt->bind_param(
            "ii",
            $partida["id"],
            $usuario_id
        );


        $stmt->execute();

        $resultado = $stmt->get_result();


        if ($resultado->num_rows > 0) {

            echo json_encode([
                "ok" => true,
                "ya_estaba" => true,
                "partida_id" => $partida["id"],
                "juego" => $partida["juego"],
                "total" => $total,
                "max_jugadores" =>
                    intval($partida["max_jugadores"]),
                "mensaje" =>
                    "Ya formas parte de esta partida"
            ]);

            exit;
        }


        $stmt->close();


        /* Insertar participante */

        $stmt = $conexion->prepare(
            "INSERT INTO participantes
            (partida_id, usuario_id)
            VALUES (?, ?)"
        );


        $stmt->bind_param(
            "ii",
            $partida["id"],
            $usuario_id
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "No se pudo unir a la partida"
            ]);

            exit;
        }


        $total++;

        $stmt->close();


        echo json_encode([
            "ok" => true,
            "ya_estaba" => false,
            "partida_id" => $partida["id"],
            "juego" => $partida["juego"],
            "total" => $total,
            "max_jugadores" =>
                intval($partida["max_jugadores"]),
            "mensaje" =>
                "Te uniste a la partida"
        ]);

        exit;
    }


    /* =================================================
       FINALIZAR PARTIDA
    ================================================= */

    if ($accion === "finalizar") {

        $partida_id = intval(
            $datos["partida_id"] ?? 0
        );

        $ganador_id = intval(
            $datos["ganador_id"] ?? 0
        );


        if (
            $usuario_id <= 0 ||
            $partida_id <= 0
        ) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Faltan datos para finalizar la partida"
            ]);

            exit;
        }


        /* Buscar partida */

        $stmt = $conexion->prepare(
            "SELECT
                id,
                juego,
                estado
             FROM partidas
             WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $partida_id
        );


        $stmt->execute();

        $resultado = $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" => "La partida no existe"
            ]);

            exit;
        }


        $partida = $resultado->fetch_assoc();

        $stmt->close();


        /* Evitar dar puntos dos veces */

        if ($partida["estado"] === "finalizada") {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "Esta partida ya fue finalizada"
            ]);

            exit;
        }


        /* Comprobar que el usuario participa */

        $stmt = $conexion->prepare(
            "SELECT id
             FROM participantes
             WHERE partida_id = ?
             AND usuario_id = ?"
        );


        $stmt->bind_param(
            "ii",
            $partida_id,
            $usuario_id
        );


        $stmt->execute();

        $resultado = $stmt->get_result();


        if ($resultado->num_rows === 0) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No perteneces a esta partida"
            ]);

            exit;
        }


        $stmt->close();


        /* Marcar partida como finalizada */

        $stmt = $conexion->prepare(
            "UPDATE partidas
             SET estado = 'finalizada'
             WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $partida_id
        );


        if (!$stmt->execute()) {

            echo json_encode([
                "ok" => false,
                "mensaje" =>
                    "No se pudo finalizar la partida"
            ]);

            exit;
        }


        $stmt->close();


        /* =================================================
           DAR PUNTOS A PARTICIPANTES
        ================================================= */

        $stmt = $conexion->prepare(
            "SELECT usuario_id
             FROM participantes
             WHERE partida_id = ?"
        );


        $stmt->bind_param(
            "i",
            $partida_id
        );


        $stmt->execute();

        $resultado = $stmt->get_result();


        $ganadores = [];


        while ($fila = $resultado->fetch_assoc()) {

            $idJugador =
                intval($fila["usuario_id"]);


            /* Puntos por participar */

            $puntos = 10;


            /* Puntos extra por ganar */

            if (
                $ganador_id > 0 &&
                $idJugador === $ganador_id
            ) {

                $puntos += 20;

                $ganadores[] = $idJugador;
            }


            /* Buscar puntos actuales */

            $consulta = $conexion->prepare(
                "SELECT puntos
                 FROM usuarios
                 WHERE id = ?"
            );


            $consulta->bind_param(
                "i",
                $idJugador
            );


            $consulta->execute();

            $resultadoUsuario =
                $consulta->get_result();


            if (
                $resultadoUsuario->num_rows === 0
            ) {

                $consulta->close();

                continue;
            }


            $usuario =
                $resultadoUsuario->fetch_assoc();


            $consulta->close();


            $puntosActuales =
                intval($usuario["puntos"]);


            $nuevosPuntos =
                $puntosActuales + $puntos;


            $nuevoNivel =
                floor(
                    $nuevosPuntos / 100
                ) + 1;


            /* Actualizar usuario */

            $actualizar = $conexion->prepare(
                "UPDATE usuarios
                 SET puntos = ?, nivel = ?
                 WHERE id = ?"
            );


            $actualizar->bind_param(
                "iii",
                $nuevosPuntos,
                $nuevoNivel,
                $idJugador
            );


            $actualizar->execute();

            $actualizar->close();
        }


        $stmt->close();


        echo json_encode([

            "ok" => true,

            "partida_id" =>
                $partida_id,

            "juego" =>
                $partida["juego"],

            "ganador_id" =>
                $ganador_id,

            "mensaje" =>
                "¡Partida finalizada y puntos entregados! 🏆"

        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /* =================================================
       ACCIÓN NO VÁLIDA
    ================================================= */

    echo json_encode([
        "ok" => false,
        "mensaje" => "Acción no válida"
    ]);

    exit;
}


/* =====================================================
   GET — CONSULTAR PARTIDA
===================================================== */

if ($metodo === "GET") {

    $codigo = strtoupper(
        trim(
            $_GET["codigo"] ?? ""
        )
    );


    if ($codigo === "") {

        echo json_encode([
            "ok" => false,
            "mensaje" => "Falta el código"
        ]);

        exit;
    }


    $stmt = $conexion->prepare(
        "SELECT
            partidas.id,
            partidas.codigo,
            partidas.juego,
            partidas.max_jugadores,
            partidas.estado,
            usuarios.nombre AS creador
         FROM partidas
         INNER JOIN usuarios
            ON partidas.creador_id = usuarios.id
         WHERE partidas.codigo = ?"
    );


    $stmt->bind_param(
        "s",
        $codigo
    );


    $stmt->execute();

    $resultado = $stmt->get_result();


    if ($resultado->num_rows === 0) {

        echo json_encode([
            "ok" => false,
            "mensaje" => "Partida no encontrada"
        ]);

        exit;
    }


    $partida = $resultado->fetch_assoc();

    $stmt->close();


    /* Participantes */

    $stmt = $conexion->prepare(
        "SELECT
            usuarios.id,
            usuarios.nombre,
            usuarios.avatar
         FROM participantes
         INNER JOIN usuarios
            ON participantes.usuario_id = usuarios.id
         WHERE participantes.partida_id = ?
         ORDER BY participantes.id ASC"
    );


    $stmt->bind_param(
        "i",
        $partida["id"]
    );


    $stmt->execute();

    $resultado = $stmt->get_result();


    $participantes = [];


    while ($fila = $resultado->fetch_assoc()) {

        $participantes[] = $fila;
    }


    $stmt->close();


    echo json_encode([

        "ok" => true,

        "partida" =>
            $partida,

        "participantes" =>
            $participantes

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