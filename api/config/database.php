<?php
/**
 * api/config/database.php
 * Database connection using PDO for MySQL (XAMPP default settings)
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "localhost";
    private $db_name = "db_webk3";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch(PDOException $exception) {
            http_response_code(500);
            header("Content-Type: application/json; charset=UTF-8");
            echo json_encode([
                "success" => false,
                "error" => "Koneksi database gagal: " . $exception->getMessage(),
                "hint" => "Pastikan MySQL di XAMPP sudah di-start (running) dan database 'db_webk3' sudah di-import."
            ]);
            exit();
        }
        return $this->conn;
    }
}

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit();
}
