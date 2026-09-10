<?php
/**
 * api/turunan.php
 * REST API for Turunan Bidang K3 (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM turunan WHERE id = ? OR kode = ?");
        $stmt->execute([$_GET['id'], $_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJsonResponse(["success" => false, "error" => "Turunan tidak ditemukan"], 404);
        }
        if (!empty($row['tujuan'])) $row['tujuan'] = json_decode($row['tujuan'], true);
        if (!empty($row['layanan'])) $row['layanan'] = json_decode($row['layanan'], true);
        sendJsonResponse(["success" => true, "data" => $row]);
    } else {
        $stmt = $db->query("SELECT * FROM turunan ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            if (!empty($r['tujuan'])) $r['tujuan'] = json_decode($r['tujuan'], true);
            if (!empty($r['layanan'])) $r['layanan'] = json_decode($r['layanan'], true);
        }
        sendJsonResponse(["success" => true, "data" => $rows]);
    }
}
