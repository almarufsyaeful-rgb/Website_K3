<?php
/**
 * api/dokumen.php
 * REST API for Dokumen K3 with File Upload & Download (PHP & MySQL)
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$uploadDir = __DIR__ . '/../uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Parse JSON input once if provided
$jsonInput = [];
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            $jsonInput = $decoded;
        }
    }
}

$action = $_GET['action'] ?? $_POST['action'] ?? ($jsonInput['action'] ?? null);
$reqId = $_GET['id'] ?? $_POST['id'] ?? ($jsonInput['id'] ?? null);

// DELETE: Handle deletion via HTTP DELETE or POST with action=delete
if ($method === 'DELETE' || ($method === 'POST' && ($action === 'delete' || $action === 'delete_dokumen'))) {
    if (!$reqId) {
        sendJsonResponse(["success" => false, "error" => "ID Dokumen dibutuhkan"], 400);
    }

    $stmt = $db->prepare("SELECT * FROM dokumen WHERE id = ?");
    $stmt->execute([$reqId]);
    $doc = $stmt->fetch();

    if ($doc && !empty($doc['file_path']) && file_exists($uploadDir . $doc['file_path'])) {
        @unlink($uploadDir . $doc['file_path']);
    }

    try {
        if ($doc) {
            $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
            $logStmt->execute(["Menghapus dokumen: {$doc['nama_file']}", "Hari ini", "Admin"]);
        }
    } catch (Exception $e) {}

    $delStmt = $db->prepare("DELETE FROM dokumen WHERE id = ?");
    $delStmt->execute([$reqId]);
    sendJsonResponse(["success" => true, "message" => "Dokumen berhasil dihapus"]);
}

// Download request
if (in_array($method, ['GET', 'HEAD']) && isset($_GET['download'])) {
    $id = $reqId;
    $stmt = $db->prepare("SELECT * FROM dokumen WHERE id = ?");
    $stmt->execute([$id]);
    $doc = $stmt->fetch();

    if (!$doc) {
        sendJsonResponse(["success" => false, "error" => "Dokumen tidak ditemukan"], 404);
    }

    $fileName = $doc['nama_file'];
    $filePath = $doc['file_path'] ? $uploadDir . $doc['file_path'] : null;

    if ($filePath && file_exists($filePath)) {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls' => 'application/vnd.ms-excel',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc' => 'application/msword',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'ppt' => 'application/vnd.ms-powerpoint',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'txt' => 'text/plain',
            'csv' => 'text/csv'
        ];
        $contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . basename($fileName) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));
        ob_clean();
        flush();
        readfile($filePath);
        exit();
    } else {
        // Generate simulated file content if physical file doesn't exist
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        echo "Dokumen Resmi Bidang K3 Disdalduk KB Kota Semarang\n";
        echo "Nama File: " . $fileName . "\n";
        echo "Judul: " . $doc['judul'] . "\n";
        echo "Kategori: " . $doc['kategori'] . "\n";
        echo "Tanggal Upload: " . $doc['tanggal_upload'] . "\n";
        echo "Deskripsi: " . $doc['deskripsi'] . "\n";
        exit();
    }
}

// GET: List or single
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT id, nama_file AS namaFile, judul, kategori, jenis, icon, icon_color AS iconColor, ukuran, tanggal_upload AS tanggalUpload, pengunggah, deskripsi, file_path AS filePath FROM dokumen WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJsonResponse(["success" => false, "error" => "Dokumen tidak ditemukan"], 404);
        }
        sendJsonResponse(["success" => true, "data" => $row]);
    } else {
        $kategori = $_GET['kategori'] ?? 'SEMUA';
        $search = $_GET['search'] ?? '';

        $sql = "SELECT id, nama_file AS namaFile, judul, kategori, jenis, icon, icon_color AS iconColor, ukuran, tanggal_upload AS tanggalUpload, pengunggah, deskripsi, file_path AS filePath FROM dokumen WHERE 1=1";
        $params = [];

        if ($kategori !== 'SEMUA') {
            $sql .= " AND kategori = ?";
            $params[] = $kategori;
        }

        if (!empty($search)) {
            $sql .= " AND (LOWER(nama_file) LIKE ? OR LOWER(judul) LIKE ? OR LOWER(jenis) LIKE ?)";
            $s = "%" . strtolower($search) . "%";
            $params[] = $s;
            $params[] = $s;
            $params[] = $s;
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        sendJsonResponse(["success" => true, "data" => $stmt->fetchAll()]);
    }
}

// POST: Upload document
if ($method === 'POST') {
    $input = !empty($jsonInput) ? $jsonInput : $_POST;
    $namaFile = $input['namaFile'] ?? '';
    $judul = $input['judul'] ?? $namaFile;
    $kategori = $input['kategori'] ?? 'BKB';
    $jenis = $input['jenis'] ?? 'PDF';
    $deskripsi = $input['deskripsi'] ?? 'Dokumen resmi Bidang K3 Disdalduk KB Kota Semarang.';
    $pengunggah = $input['pengunggah'] ?? 'Admin K3';

    $storedFileName = null;
    $ukuranStr = '2.4 MB';

    // Handle physical file upload if provided
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $uploaded = $_FILES['file'];
        $origName = $uploaded['name'];
        $ext = pathinfo($origName, PATHINFO_EXTENSION);
        $storedFileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($origName, PATHINFO_FILENAME)) . '.' . $ext;
        move_uploaded_file($uploaded['tmp_name'], $uploadDir . $storedFileName);
        $namaFile = $origName;
        $ukuranStr = $uploaded['size'] < 1024 * 1024 
            ? round($uploaded['size'] / 1024, 1) . ' KB' 
            : round($uploaded['size'] / (1024 * 1024), 1) . ' MB';
    }

    if (empty($namaFile)) {
        sendJsonResponse(["success" => false, "error" => "Nama dokumen wajib diisi"], 400);
    }

    $id = !empty($input['id']) ? $input['id'] : ('doc-' . round(microtime(true) * 1000));

    $icon = 'fa-file-pdf';
    $iconColor = '#ea4335';
    if ($jenis === 'Excel') { $icon = 'fa-file-excel'; $iconColor = '#107c41'; }
    if ($jenis === 'Word') { $icon = 'fa-file-word'; $iconColor = '#2b579a'; }
    if ($jenis === 'PPT') { $icon = 'fa-file-powerpoint'; $iconColor = '#d24726'; }

    $now = new DateTime();
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $dateDisplay = $now->format('j') . ' ' . $months[(int)$now->format('n') - 1] . ' ' . $now->format('Y');

    $stmt = $db->prepare("
        INSERT INTO dokumen (id, nama_file, judul, kategori, jenis, icon, icon_color, ukuran, tanggal_upload, pengunggah, deskripsi, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $namaFile, $judul, $kategori, $jenis, $icon, $iconColor, $ukuranStr, $dateDisplay, $pengunggah, $deskripsi, $storedFileName]);

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Upload dokumen: {$namaFile}", $dateDisplay, "Admin"]);

    sendJsonResponse([
        "success" => true,
        "message" => "Dokumen berhasil diunggah",
        "data" => [
            "id" => $id,
            "namaFile" => $namaFile,
            "judul" => $judul,
            "kategori" => $kategori,
            "jenis" => $jenis,
            "icon" => $icon,
            "iconColor" => $iconColor,
            "ukuran" => $ukuranStr,
            "tanggalUpload" => $dateDisplay,
            "pengunggah" => $pengunggah,
            "deskripsi" => $deskripsi,
            "filePath" => $storedFileName
        ]
    ], 201);
}

// PUT: Update
if ($method === 'PUT') {
    $id = $reqId;
    $input = !empty($jsonInput) ? $jsonInput : $_POST;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Dokumen dibutuhkan"], 400);
    }

    $namaFile = $input['namaFile'] ?? '';
    $judul = $input['judul'] ?? $namaFile;
    $kategori = $input['kategori'] ?? 'BKB';
    $jenis = $input['jenis'] ?? 'PDF';
    $deskripsi = $input['deskripsi'] ?? '';

    $icon = 'fa-file-pdf';
    $iconColor = '#ea4335';
    if ($jenis === 'Excel') { $icon = 'fa-file-excel'; $iconColor = '#107c41'; }
    if ($jenis === 'Word') { $icon = 'fa-file-word'; $iconColor = '#2b579a'; }
    if ($jenis === 'PPT') { $icon = 'fa-file-powerpoint'; $iconColor = '#d24726'; }

    $stmt = $db->prepare("
        UPDATE dokumen
        SET nama_file = ?, judul = ?, kategori = ?, jenis = ?, icon = ?, icon_color = ?, deskripsi = ?
        WHERE id = ?
    ");
    $stmt->execute([$namaFile, $judul, $kategori, $jenis, $icon, $iconColor, $deskripsi, $id]);

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Mengubah dokumen: {$namaFile}", "Hari ini", "Admin"]);

    sendJsonResponse(["success" => true, "message" => "Dokumen berhasil diperbarui"]);
}
