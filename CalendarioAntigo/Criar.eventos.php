<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Eventos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
        }
                 .header {
                position: relative;
                background-color: #FFFFFF;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                z-index: 10;
                margin-bottom: 35px;
            }
            
            .header img {
                position: absolute;
                left: 24px;
                top: 50%;
                transform: translateY(-50%);
                height: 40px;
            }
            
            .header h1 {
                font-size: 22px;
                color: #004161;
                font-weight: 600;
                margin: 0;
            }
        .container {
            display: flex;
            justify-content: space-between;
            padding: 20px;
        }
        .form-section, .image-section {
            width: 48%;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .form-section input, .form-section select, .form-section textarea, .form-section button {
            width: 100%;
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .image-section img {
            max-width: 100%;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <header class="header">
        <img src="logo_eniac.png" alt="ENIAC" />
        <h1>Criar eventos </h1>
    </header>
    <div class="container">
        <div class="form-section">
            <form action="criar.eventos.php" method="POST" enctype="multipart/form-data">
                <label for="nome_evento">Nome do Evento:</label>
                <input type="text" id="nome_evento" name="nome_evento" required>

                <label for="categoria">Categoria:</label>
                <select id="categoria" name="categoria" required>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminário">Seminário</option>
                    <option value="Conferência">Conferência</option>
                </select>

                <label for="publico_alvo">Público-Alvo:</label>
                <input type="text" id="publico_alvo" name="publico_alvo" required>

                <label for="data">Data:</label>
                <input type="date" id="data" name="data" required>

                <label for="horario">Horário:</label>
                <input type="time" id="horario" name="horario" required>

                <label for="imagem">Imagem do Evento:</label>
                <input type="file" id="imagem" name="imagem" accept="image/*" required>

                <label for="descricao">Descrição:</label>
                <textarea id="descricao" name="descricao" rows="4" required></textarea>

                <button type="submit" name="criar_evento">Criar Evento</button>
            </form>
        </div>
        <div class="image-section">
            <h3>Pré-visualização da Imagem</h3>
            <img src="placeholder.jpg" alt="Imagem do Evento">
        </div>
    </div>
</body>
</html>

<?php
// Conexão com o banco de dados
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'calendario';

$conn = new mysqli($host, $user, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Processa o formulário
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['criar_evento'])) {
    $nome_evento = $conn->real_escape_string($_POST['nome_evento']);
    $categoria = $conn->real_escape_string($_POST['categoria']);
    $publico_alvo = $conn->real_escape_string($_POST['publico_alvo']);
    $data = $conn->real_escape_string($_POST['data']);
    $horario = $conn->real_escape_string($_POST['horario']);
    $descricao = $conn->real_escape_string($_POST['descricao']);

    $imagem = $_FILES['imagem']['name'];
    $target_dir = "uploads/";
    $target_file = $target_dir . basename($imagem);

    // Faz o upload da imagem
    if (move_uploaded_file($_FILES['imagem']['tmp_name'], $target_file)) {
        $sql = "INSERT INTO eventos (nome_evento, categoria, publico_alvo, data, horario, imagem, descricao) 
                VALUES ('$nome_evento', '$categoria', '$publico_alvo', '$data', '$horario', '$target_file', '$descricao')";

        if ($conn->query($sql) === TRUE) {
            echo "<script>alert('Evento criado com sucesso!');</script>";
        } else {
            echo "Erro: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "Erro ao fazer upload da imagem.";
    }
}

$conn->close();
?>
