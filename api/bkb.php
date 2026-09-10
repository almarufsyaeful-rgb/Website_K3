<?php
/**
 * api/bkb.php
 * REST API for Kelompok BKB (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    $stmt = $db->query("SELECT id, nama_kelompok AS namaKelompok, alamat, ketua, jumlah_anggota AS jumlahAnggota, tahun FROM bkb_data ORDER BY id DESC");
    sendJsonResponse(["success" => true, "data" => $stmt->fetchAll()]);
}

// POST
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['namaKelompok']) || empty($input['alamat']) || empty($input['ketua']) || empty($input['tahun'])) {
        sendJsonResponse(["success" => false, "error" => "Harap lengkapi semua data wajib"], 400);
    }

    $nama = $input['namaKelompok'];
    $alamat = $input['alamat'];
    $ketua = $input['ketua'];
    $anggota = (int)($input['jumlahAnggota'] ?? 0);
    $tahun = $input['tahun'];

    $stmt = $db->prepare("
        INSERT INTO bkb_data (nama_kelompok, alamat, ketua, jumlah_anggota, tahun)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$nama, $alamat, $ketua, $anggota, $tahun]);
    $newId = $db->lastInsertId();

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Menambah kelompok BKB: {$nama}", "Hari ini", "Admin"]);

    sendJsonResponse([
        "success" => true,
        "message" => "Data kelompok berhasil disimpan",
        "data" => [
            "id" => (int)$newId,
            "namaKelompok" => $nama,
            "alamat" => $alamat,
            "ketua" => $ketua,
            "jumlahAnggota" => $anggota,
            "tahun" => $tahun
        ]
    ], 201);
}

// PUT
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Kelompok dibutuhkan"], 400);
    }

    $nama = $input['namaKelompok'];
    $alamat = $input['alamat'];
    $ketua = $input['ketua'];
    $anggota = (int)($input['jumlahAnggota'] ?? 0);
    $tahun = $input['tahun'];

    $stmt = $db->prepare("
        UPDATE bkb_data
        SET nama_kelompok = ?, alamat = ?, ketua = ?, jumlah_anggota = ?, tahun = ?
        WHERE id = ?
    ");
    $stmt->execute([$nama, $alamat, $ketua, $anggota, $tahun, $id]);

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Mengubah data kelompok BKB: {$nama}", "Hari ini", "Admin"]);

    sendJsonResponse(["success" => true, "message" => "Data kelompok berhasil diperbarui"]);
}

// DELETE
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Kelompok dibutuhkan"], 400);
    }

    $stmt = $db->prepare("DELETE FROM bkb_data WHERE id = ?");
    $stmt->execute([$id]);
    sendJsonResponse(["success" => true, "message" => "Data kelompok berhasil dihapus"]);
}
