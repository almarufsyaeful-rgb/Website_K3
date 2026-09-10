<?php
/**
 * api/programs.php
 * REST API for Program K3 (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET: All or by ID
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM programs WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $prog = $stmt->fetch();
        if (!$prog) {
            sendJsonResponse(["success" => false, "error" => "Program tidak ditemukan"], 404);
        }
        $prog['kegiatanTerkait'] = !empty($prog['kegiatan_terkait']) ? json_decode($prog['kegiatan_terkait']) : [];
        sendJsonResponse(["success" => true, "data" => $prog]);
    } else {
        $stmt = $db->query("SELECT * FROM programs ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['kegiatanTerkait'] = !empty($r['kegiatan_terkait']) ? json_decode($r['kegiatan_terkait']) : [];
        }
        sendJsonResponse(["success" => true, "data" => $rows]);
    }
}

// POST: Create
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['nama']) || empty($input['kategori'])) {
        sendJsonResponse(["success" => false, "error" => "Nama dan kategori wajib diisi"], 400);
    }

    $id = 'prog-' . round(microtime(true) * 1000);
    $nama = $input['nama'];
    $kategori = $input['kategori'];
    $deskripsi = $input['deskripsi'] ?? '';
    $ringkasan = $input['ringkasan'] ?? $deskripsi;
    $pelaksana = $input['pelaksana'] ?? 'Bidang K3';
    $tahun = $input['tahun'] ?? 2025;
    $icon = $input['icon'] ?? 'fa-shield-heart';
    $kegiatanTerkait = json_encode($input['kegiatanTerkait'] ?? []);

    $stmt = $db->prepare("
        INSERT INTO programs (id, nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatan_terkait)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $nama, $kategori, $deskripsi, $ringkasan, $pelaksana, $tahun, $icon, $kegiatanTerkait]);

    // Log activity
    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Menambah program: {$nama}", "Hari ini", "Admin"]);

    sendJsonResponse(["success" => true, "message" => "Program berhasil dibuat", "data" => ["id" => $id, "nama" => $nama]], 201);
}

// PUT: Update
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Program dibutuhkan"], 400);
    }

    $stmt = $db->prepare("
        UPDATE programs
        SET nama = ?, kategori = ?, deskripsi = ?, ringkasan = ?, pelaksana = ?, tahun = ?, icon = ?, kegiatan_terkait = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $input['nama'],
        $input['kategori'],
        $input['deskripsi'] ?? '',
        $input['ringkasan'] ?? '',
        $input['pelaksana'] ?? 'Bidang K3',
        $input['tahun'] ?? 2025,
        $input['icon'] ?? 'fa-shield-heart',
        json_encode($input['kegiatanTerkait'] ?? []),
        $id
    ]);

    sendJsonResponse(["success" => true, "message" => "Program berhasil diperbarui"]);
}

// DELETE
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Program dibutuhkan"], 400);
    }

    $stmt = $db->prepare("DELETE FROM programs WHERE id = ?");
    $stmt->execute([$id]);
    sendJsonResponse(["success" => true, "message" => "Program berhasil dihapus"]);
}
