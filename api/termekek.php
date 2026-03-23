<?php
header('Content-Type: application/json; charset=utf-8');

$host = "127.0.0.1";
$user = "root";
$password = "mysql";
$db = "technős";

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Kapcsolódási hiba: " . $conn->connect_error]));
}

// Magyar ékezetek miatt kötelező:
$conn->set_charset("utf8");

$sql = "SELECT * FROM termekek";
$result = $conn->query($sql);

$termekek = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $termekek[] = $row;
    }
}

echo json_encode($termekek);
$conn->close();
?>