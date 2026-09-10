<?php
/**
 * routes/programs.php
 * REST API untuk Program K3 (Versi PHP / XAMPP MySQL)
 * Menggantikan routes/programs.js untuk lingkungan PHP
 */

// Muat konfigurasi database XAMPP
require_once __DIR__ . '/../api/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Membaca payload input (baik JSON body maupun form POST)
$rawInput = file_get_contents('php://input');
$jsonInput = !empty($rawInput) ? json_decode($rawInput, true) : [];
$input = is_array($jsonInput) && !empty($jsonInput) ? $jsonInput : $_POST;

$action = $_GET['action'] ?? $input['action'] ?? null;
$reqId = $_GET['id'] ?? $input['id'] ?? null;

// =========================================================================
// 1. GET: Ambil Semua Program atau Program Berdasarkan ID (?id=...)
// =========================================================================
if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM programs WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $prog = $stmt->fetch();
        if (!$prog) {
            sendJsonResponse(["success" => false, "error" => "Program tidak ditemukan"], 404);
        }
        $prog['kegiatanTerkait'] = !empty($prog['kegiatan_terkait']) 
            ? json_decode($prog['kegiatan_terkait'], true) 
            : [];
        sendJsonResponse(["success" => true, "data" => $prog]);
    } else {
        $stmt = $db->query("SELECT * FROM programs ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['kegiatanTerkait'] = !empty($r['kegiatan_terkait']) 
                ? json_decode($r['kegiatan_terkait'], true) 
                : [];
        }
        sendJsonResponse(["success" => true, "data" => $rows]);
    }
}

// =========================================================================
// 2. POST: Tambah Program Baru (atau Fallback Action)
// =========================================================================
if ($method === 'POST') {
    // Fallback Hapus via POST (action=delete)
    if ($action === 'delete' || $action === 'delete_program') {
        if (!$reqId) {
            sendJsonResponse(["success" => false, "error" => "ID Program dibutuhkan"], 400);
        }
        $stmt = $db->prepare("DELETE FROM programs WHERE id = ?");
        $stmt->execute([$reqId]);
        try {
            $log = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
            $log->execute(["Menghapus program ID: {$reqId}", "Hari ini", "Admin"]);
        } catch (Exception $e) {}
        sendJsonResponse(["success" => true, "message" => "Program berhasil dihapus"]);
    }

    // Validasi Kolom Wajib
    if (empty($input['nama']) || empty($input['kategori'])) {
        sendJsonResponse(["success" => false, "error" => "Nama dan kategori wajib diisi"], 400);
    }

    $id = !empty($input['id']) ? $input['id'] : ('prog-' . round(microtime(true) * 1000));
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

    // Catat log aktivitas
    try {
        $log = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
        $log->execute(["Menambah program baru: {$nama}", "Hari ini", "Admin"]);
    } catch (Exception $e) {}

    sendJsonResponse([
        "success" => true,
        "message" => "Program berhasil dibuat",
        "data" => ["id" => $id, "nama" => $nama]
    ], 201);
}

// =========================================================================
// 3. PUT: Perbarui Program
// =========================================================================
if ($method === 'PUT') {
    $id = $reqId;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Program dibutuhkan"], 400);
    }

    $stmt = $db->prepare("
        UPDATE programs
        SET nama = ?, kategori = ?, deskripsi = ?, ringkasan = ?, pelaksana = ?, tahun = ?, icon = ?, kegiatan_terkait = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $input['nama'] ?? '',
        $input['kategori'] ?? '',
        $input['deskripsi'] ?? '',
        $input['ringkasan'] ?? ($input['deskripsi'] ?? ''),
        $input['pelaksana'] ?? 'Bidang K3',
        $input['tahun'] ?? 2025,
        $input['icon'] ?? 'fa-shield-heart',
        json_encode($input['kegiatanTerkait'] ?? []),
        $id
    ]);

    try {
        $log = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
        $log->execute(["Mengubah data program: " . ($input['nama'] ?? $id), "Hari ini", "Admin"]);
    } catch (Exception $e) {}

    sendJsonResponse(["success" => true, "message" => "Program berhasil diperbarui"]);
}

// =========================================================================
// 4. DELETE: Hapus Program
// =========================================================================
if ($method === 'DELETE') {
    $id = $reqId;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Program dibutuhkan"], 400);
    }

    $stmt = $db->prepare("DELETE FROM programs WHERE id = ?");
    $stmt->execute([$id]);

    try {
        $log = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
        $log->execute(["Menghapus program ID: {$id}", "Hari ini", "Admin"]);
    } catch (Exception $e) {}

    sendJsonResponse(["success" => true, "message" => "Program berhasil dihapus"]);
}
