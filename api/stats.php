<?php
/**
 * api/stats.php
 * REST API for Admin Dashboard Statistics & Activity Logs (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['aktivitas'])) {
        $stmt = $db->query("SELECT * FROM aktivitas ORDER BY id DESC LIMIT 10");
        sendJsonResponse(["success" => true, "data" => $stmt->fetchAll()]);
    } else {
        $progCount = $db->query("SELECT COUNT(*) as c FROM programs")->fetch()['c'];
        $kegCount = $db->query("SELECT COUNT(*) as c FROM kegiatan")->fetch()['c'];
        $docCount = $db->query("SELECT COUNT(*) as c FROM dokumen")->fetch()['c'];
        $turunanSum = $db->query("SELECT SUM(total_kelompok) as s FROM turunan")->fetch()['s'] ?? 0;
        $bkbCount = $db->query("SELECT COUNT(*) as c FROM bkb_data")->fetch()['c'];

        sendJsonResponse([
            "success" => true,
            "data" => [
                "totalPrograms" => (int)$progCount,
                "totalKegiatan" => (int)$kegCount,
                "totalDokumen" => (int)$docCount,
                "totalKelompok" => (int)($turunanSum ?: ($bkbCount + 137))
            ]
        ]);
    }
}
