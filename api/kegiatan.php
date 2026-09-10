<?php
/**
 * api/kegiatan.php
 * REST API for Kegiatan K3 with Photo Documentation Upload (PHP & MySQL)
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
if ($method === 'DELETE' || ($method === 'POST' && ($action === 'delete' || $action === 'delete_kegiatan'))) {
    if (!$reqId) {
        sendJsonResponse(["success" => false, "error" => "ID Kegiatan dibutuhkan"], 400);
    }

    $findStmt = $db->prepare("SELECT * FROM kegiatan WHERE id = ?");
    $findStmt->execute([$reqId]);
    $keg = $findStmt->fetch();

    if ($keg) {
        if (!empty($keg['dokumentasi'])) {
            $docs = json_decode($keg['dokumentasi'], true);
            if (is_array($docs)) {
                foreach ($docs as $photo) {
                    if (is_string($photo) && str_starts_with($photo, 'uploads/')) {
                        $filePath = __DIR__ . '/../' . $photo;
                        if (file_exists($filePath)) @unlink($filePath);
                    }
                }
            }
        }
        try {
            $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
            $logStmt->execute(["Menghapus kegiatan: {$keg['nama']}", "Hari ini", "Admin"]);
        } catch (Exception $e) {}
    }

    $stmt = $db->prepare("DELETE FROM kegiatan WHERE id = ?");
    $stmt->execute([$reqId]);
    sendJsonResponse(["success" => true, "message" => "Kegiatan berhasil dihapus"]);
}

// ACTION: Photo upload or photo management
if ($method === 'POST' && !empty($action)) {
    $kegId = $reqId;

    if (!$kegId) {
        sendJsonResponse(["success" => false, "error" => "ID Kegiatan dibutuhkan"], 400);
    }

    $stmt = $db->prepare("SELECT * FROM kegiatan WHERE id = ?");
    $stmt->execute([$kegId]);
    $keg = $stmt->fetch();
    if (!$keg) {
        sendJsonResponse(["success" => false, "error" => "Kegiatan tidak ditemukan"], 404);
    }

    $currentDocs = !empty($keg['dokumentasi']) ? json_decode($keg['dokumentasi'], true) : [];
    if (!is_array($currentDocs)) $currentDocs = [];

    // Sub-action: Upload file photo
    if ($action === 'upload_foto') {
        $added = false;

        // Physical file upload
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $uploaded = $_FILES['foto'];
            $ext = strtolower(pathinfo($uploaded['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (!in_array($ext, $allowed)) {
                sendJsonResponse(["success" => false, "error" => "Format file gambar tidak didukung. Gunakan JPG, PNG, atau WEBP."], 400);
            }

            $newFileName = 'keg_' . time() . '_' . rand(100, 999) . '.' . $ext;
            move_uploaded_file($uploaded['tmp_name'], $uploadDir . $newFileName);
            $photoPath = 'uploads/' . $newFileName;
            array_unshift($currentDocs, $photoPath);
            $added = true;
        }

        // URL image input fallback
        if (!empty($_POST['fotoUrl'])) {
            $photoUrl = trim($_POST['fotoUrl']);
            array_unshift($currentDocs, $photoUrl);
            $added = true;
        }

        if (!$added) {
            sendJsonResponse(["success" => false, "error" => "Pilih berkas foto atau masukkan link URL foto."], 400);
        }

        $docsJson = json_encode(array_values($currentDocs));
        $updateStmt = $db->prepare("UPDATE kegiatan SET dokumentasi = ? WHERE id = ?");
        $updateStmt->execute([$docsJson, $kegId]);

        $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
        $logStmt->execute(["Upload foto kegiatan: {$keg['nama']}", "Hari ini", "Admin"]);

        sendJsonResponse([
            "success" => true,
            "message" => "Foto dokumentasi berhasil ditambahkan!",
            "data" => $currentDocs
        ]);
    }

    // Sub-action: Delete specific photo
    if ($action === 'delete_foto') {
        $photoIndex = isset($_POST['index']) ? (int)$_POST['index'] : -1;
        $photoUrl = $_POST['url'] ?? '';

        if ($photoIndex >= 0 && isset($currentDocs[$photoIndex])) {
            $removed = array_splice($currentDocs, $photoIndex, 1);
            // If local file, delete it
            if (!empty($removed[0]) && str_starts_with($removed[0], 'uploads/')) {
                $filePath = __DIR__ . '/../' . $removed[0];
                if (file_exists($filePath)) unlink($filePath);
            }
        } elseif (!empty($photoUrl)) {
            $currentDocs = array_filter($currentDocs, function($u) use ($photoUrl) {
                return $u !== $photoUrl;
            });
            if (str_starts_with($photoUrl, 'uploads/')) {
                $filePath = __DIR__ . '/../' . $photoUrl;
                if (file_exists($filePath)) unlink($filePath);
            }
        }

        $docsJson = json_encode(array_values($currentDocs));
        $updateStmt = $db->prepare("UPDATE kegiatan SET dokumentasi = ? WHERE id = ?");
        $updateStmt->execute([$docsJson, $kegId]);

        sendJsonResponse([
            "success" => true,
            "message" => "Foto berhasil dihapus.",
            "data" => array_values($currentDocs)
        ]);
    }

    // Sub-action: Replace specific photo by index
    if ($action === 'replace_foto') {
        $photoIndex = isset($_POST['index']) ? (int)$_POST['index'] : 0;
        $newPath = '';

        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $uploaded = $_FILES['foto'];
            $ext = strtolower(pathinfo($uploaded['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (!in_array($ext, $allowed)) {
                sendJsonResponse(["success" => false, "error" => "Format file gambar tidak didukung. Gunakan JPG, PNG, atau WEBP."], 400);
            }

            $newFileName = 'keg_' . time() . '_' . rand(100, 999) . '.' . $ext;
            move_uploaded_file($uploaded['tmp_name'], $uploadDir . $newFileName);
            $newPath = 'uploads/' . $newFileName;
        } elseif (!empty($_POST['fotoUrl'])) {
            $newPath = trim($_POST['fotoUrl']);
        }

        if (empty($newPath)) {
            sendJsonResponse(["success" => false, "error" => "Pilih berkas foto baru atau masukkan link URL foto."], 400);
        }

        if (isset($currentDocs[$photoIndex])) {
            $old = $currentDocs[$photoIndex];
            if (!empty($old) && str_starts_with($old, 'uploads/')) {
                $oldFile = __DIR__ . '/../' . $old;
                if (file_exists($oldFile)) unlink($oldFile);
            }
            $currentDocs[$photoIndex] = $newPath;
        } else {
            $currentDocs[] = $newPath;
        }

        $docsJson = json_encode(array_values($currentDocs));
        $updateStmt = $db->prepare("UPDATE kegiatan SET dokumentasi = ? WHERE id = ?");
        $updateStmt->execute([$docsJson, $kegId]);

        $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
        $logStmt->execute(["Mengubah foto kegiatan: {$keg['nama']}", "Hari ini", "Admin"]);

        sendJsonResponse([
            "success" => true,
            "message" => "Foto berhasil diubah!",
            "data" => array_values($currentDocs)
        ]);
    }

    // Sub-action: Replace all photos
    if ($action === 'set_dokumentasi') {
        $newDocs = json_decode($_POST['dokumentasi'] ?? '[]', true);
        $docsJson = json_encode(is_array($newDocs) ? $newDocs : []);
        $updateStmt = $db->prepare("UPDATE kegiatan SET dokumentasi = ? WHERE id = ?");
        $updateStmt->execute([$docsJson, $kegId]);

        sendJsonResponse(["success" => true, "message" => "Dokumentasi diperbarui", "data" => $newDocs]);
    }

    // Sub-action: Delete entire kegiatan via POST
    if ($action === 'delete' || $action === 'delete_kegiatan') {
        if (!empty($currentDocs) && is_array($currentDocs)) {
            foreach ($currentDocs as $photo) {
                if (is_string($photo) && str_starts_with($photo, 'uploads/')) {
                    $filePath = __DIR__ . '/../' . $photo;
                    if (file_exists($filePath)) @unlink($filePath);
                }
            }
        }
        try {
            $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
            $logStmt->execute(["Menghapus kegiatan: {$keg['nama']}", "Hari ini", "Admin"]);
        } catch (Exception $e) {}

        $deleteStmt = $db->prepare("DELETE FROM kegiatan WHERE id = ?");
        $deleteStmt->execute([$kegId]);
        sendJsonResponse(["success" => true, "message" => "Kegiatan berhasil dihapus"]);
    }
}

// GET
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM kegiatan WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $keg = $stmt->fetch();
        if (!$keg) {
            sendJsonResponse(["success" => false, "error" => "Kegiatan tidak ditemukan"], 404);
        }
        $keg['dokumentasi'] = !empty($keg['dokumentasi']) ? json_decode($keg['dokumentasi']) : [];
        sendJsonResponse(["success" => true, "data" => $keg]);
    } else {
        $search = $_GET['search'] ?? '';
        $tahun = $_GET['tahun'] ?? 'all';
        $lokasi = $_GET['lokasi'] ?? 'all';

        $sql = "SELECT * FROM kegiatan WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (LOWER(nama) LIKE ? OR LOWER(lokasi) LIKE ? OR LOWER(deskripsi) LIKE ?)";
            $s = "%" . strtolower($search) . "%";
            $params[] = $s;
            $params[] = $s;
            $params[] = $s;
        }

        if ($tahun !== 'all') {
            $sql .= " AND tahun = ?";
            $params[] = $tahun;
        }

        if ($lokasi !== 'all') {
            $sql .= " AND lokasi LIKE ?";
            $params[] = "%" . $lokasi . "%";
        }

        $sql .= " ORDER BY tanggal DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['dokumentasi'] = !empty($r['dokumentasi']) ? json_decode($r['dokumentasi']) : [];
        }
        sendJsonResponse(["success" => true, "data" => $rows]);
    }
}

// POST: Create Kegiatan
if ($method === 'POST' && empty($action)) {
    $input = !empty($jsonInput) ? $jsonInput : $_POST;
    if (empty($input['nama']) || empty($input['tanggal']) || empty($input['lokasi'])) {
        sendJsonResponse(["success" => false, "error" => "Nama, tanggal, dan lokasi wajib diisi"], 400);
    }

    $id = !empty($input['id']) ? $input['id'] : ('keg-' . round(microtime(true) * 1000));
    $nama = $input['nama'];
    $tanggal = $input['tanggal'];
    $lokasi = $input['lokasi'];
    $peserta = $input['peserta'] ?? '50 orang';
    $deskripsi = $input['deskripsi'] ?? 'Kegiatan pembinaan dan edukasi keluarga Kota Semarang.';

    $dateObj = new DateTime($tanggal);
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $display = $dateObj->format('j') . ' ' . $months[(int)$dateObj->format('n') - 1] . ' ' . $dateObj->format('Y');
    $yearStr = $dateObj->format('Y');

    $defaultDocs = [
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    ];
    $dokumentasi = json_encode($input['dokumentasi'] ?? $defaultDocs);

    $stmt = $db->prepare("
        INSERT INTO kegiatan (id, nama, tanggal, tanggal_display, tahun, lokasi, peserta, deskripsi, dokumentasi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $nama, $tanggal, $display, $yearStr, $lokasi, $peserta, $deskripsi, $dokumentasi]);

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Menambah kegiatan: {$nama}", $display, "Admin"]);

    sendJsonResponse([
        "success" => true,
        "message" => "Kegiatan berhasil disimpan",
        "data" => [
            "id" => $id,
            "nama" => $nama,
            "tanggal" => $tanggal,
            "tanggal_display" => $display,
            "tahun" => $yearStr,
            "lokasi" => $lokasi,
            "peserta" => $peserta,
            "deskripsi" => $deskripsi,
            "dokumentasi" => json_decode($dokumentasi, true)
        ]
    ], 201);
}

// PUT: Update Kegiatan
if ($method === 'PUT') {
    $input = !empty($jsonInput) ? $jsonInput : [];
    $id = $_GET['id'] ?? $input['id'] ?? null;
    if (!$id) {
        sendJsonResponse(["success" => false, "error" => "ID Kegiatan dibutuhkan"], 400);
    }

    $nama = $input['nama'] ?? '';
    $tanggal = $input['tanggal'] ?? '';
    $lokasi = $input['lokasi'] ?? '';
    $peserta = $input['peserta'] ?? '50 orang';
    $deskripsi = $input['deskripsi'] ?? '';

    $display = $tanggal;
    $yearStr = date('Y');
    if (!empty($tanggal)) {
        try {
            $dateObj = new DateTime($tanggal);
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            $display = $dateObj->format('j') . ' ' . $months[(int)$dateObj->format('n') - 1] . ' ' . $dateObj->format('Y');
            $yearStr = $dateObj->format('Y');
        } catch (Exception $e) {}
    }

    if (isset($input['dokumentasi'])) {
        $docsJson = json_encode($input['dokumentasi']);
        $stmt = $db->prepare("
            UPDATE kegiatan
            SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ?, dokumentasi = ?
            WHERE id = ?
        ");
        $stmt->execute([$nama, $tanggal, $display, $yearStr, $lokasi, $peserta, $deskripsi, $docsJson, $id]);
    } else {
        $stmt = $db->prepare("
            UPDATE kegiatan
            SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ?
            WHERE id = ?
        ");
        $stmt->execute([$nama, $tanggal, $display, $yearStr, $lokasi, $peserta, $deskripsi, $id]);
    }

    $logStmt = $db->prepare("INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)");
    $logStmt->execute(["Mengubah data kegiatan: {$nama}", $display, "Admin"]);

}
