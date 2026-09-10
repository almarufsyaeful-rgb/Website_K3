<?php
/**
 * api/news.php
 * REST API for News & Information (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("SELECT * FROM news ORDER BY id ASC");
sendJsonResponse(["success" => true, "data" => $stmt->fetchAll()]);
