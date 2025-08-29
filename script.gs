// Deklarasi konstanta untuk nama Spreadsheet dan Sheet.
// Ganti 'ID_SPREADSHEET_ANDA' dengan ID Spreadsheet Google Anda.
// ID bisa ditemukan di URL Spreadsheet, antara '/d/' dan '/edit'.
const SPREADSHEET_ID = 'SPREADSHEET_ID';
const SHEET_NAME = 'SHEET_NAME';

// Konstanta untuk ID folder Google Drive tempat gambar akan disimpan.
// Ganti 'ID_FOLDER_DRIVE_ANDA' dengan ID folder Drive yang Anda inginkan.
// ID bisa ditemukan di URL folder Drive Anda.
const DRIVE_FOLDER_ID = 'FOLDER_ID';

// Konstanta untuk Fonnte API Token.
// Ganti 'TOKEN_FONNTE_ANDA' dengan token API dari akun Fonnte Anda.
const FONNTE_API_TOKEN = 'TOKEN_FONNTE';

/**
 * Fungsi doGet() akan dipicu saat Web App diakses dengan metode GET.
 * Fungsi ini menangani permintaan untuk mengambil semua data atau
 * data spesifik berdasarkan parameter NOP.
 *
 * @param {object} e - Objek event yang berisi parameter permintaan.
 * @return {object} - Output JSON dari data.
 */
function doGet(e) {
  // Buka Spreadsheet berdasarkan ID.
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // Ambil Sheet berdasarkan nama.
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Jika tidak ada sheet, kembalikan response error.
  if (!sheet) {
    return createJsonResponse({
      status: 'error',
      message: 'Sheet tidak ditemukan.'
    });
  }

  // Ambil semua data dari sheet, mulai dari baris 2 (untuk melewatkan header).
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Siapkan array untuk menyimpan data dalam format objek JSON.
  let result = [];
  
  // Jika ada parameter NOP di URL, cari data yang cocok.
  // Contoh URL: .../exec?nop=33210100010001
  if (e.parameter.nop) {
    const nopToSearch = String(e.parameter.nop).trim();
    
    // Iterasi setiap baris data untuk mencari NOP yang cocok.
    for (let i = 0; i < data.length; i++) {
      // Data NOP ada di kolom pertama (indeks 0).
      if (String(data[i][0]).trim() === nopToSearch) {
        // Jika cocok, buat objek data untuk baris ini.
        let rowObject = {};
        for (let j = 0; j < headers.length; j++) {
          // Buat kunci objek dari header, diubah ke huruf kecil dan tanpa spasi.
          const key = headers[j].toLowerCase().replace(/\s/g, '');
          rowObject[key] = data[i][j];
        }
        result.push(rowObject);
        // Hentikan loop setelah data ditemukan (asumsi NOP unik).
        break;
      }
    }
    
    // Jika data ditemukan, kembalikan response sukses.
    if (result.length > 0) {
      return createJsonResponse({ status: 'success', data: result });
    } else {
      // Jika tidak ada data yang cocok, kembalikan response error.
      return createJsonResponse({ status: 'error', message: 'Data tidak ditemukan.' });
    }
  } else {
    // Jika tidak ada parameter NOP, kembalikan semua data.
    // Iterasi setiap baris data untuk membuat array objek.
    for (let i = 0; i < data.length; i++) {
      let rowObject = {};
      for (let j = 0; j < headers.length; j++) {
        // Buat kunci objek dari header, diubah ke huruf kecil dan tanpa spasi.
        const key = headers[j].toLowerCase().replace(/\s/g, '');
        rowObject[key] = data[i][j];
      }
      result.push(rowObject);
    }
    
    return createJsonResponse({ status: 'success', data: result });
  }
}

/**
 * Fungsi doPost() akan dipicu saat Web App diakses dengan metode POST.
 * Fungsi ini digunakan untuk menambahkan data baru ke Spreadsheet,
 * termasuk status lunas dan bukti gambar yang diunggah ke Google Drive.
 *
 * @param {object} e - Objek event yang berisi data POST.
 * @return {object} - Output JSON dari status operasi.
 */
function doPost(e) {
  // Pastikan data POST dalam format JSON.
  if (e.postData.type === 'application/json') {
    try {
      // Parsing data JSON dari body permintaan.
      const data = JSON.parse(e.postData.contents);
      
      const nopToUpdate = data.nop || '';
      const whatsappNumber = data.wa || '';
      
      // Jika tidak ada NOP, kembalikan error.
      if (!nopToUpdate) {
        return createJsonResponse({ status: 'error', message: 'NOP wajib diisi.' });
      }

      // Buka Spreadsheet dan Sheet.
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME);
      const sheetData = sheet.getDataRange().getValues();

      // Cari baris yang cocok dengan NOP.
      let rowIndex = -1;
      let rowData = null;
      for (let i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]).trim() === String(nopToUpdate).trim()) {
          rowIndex = i;
          rowData = sheetData[i];
          break;
        }
      }

      // Jika NOP ditemukan, lakukan pembaruan.
      if (rowIndex !== -1) {
        let buktiGambarUrl = '';
        const buktiGambarBase64 = data.bukti_gambar || '';
        
        // Unggah gambar jika ada.
        if (buktiGambarBase64) {
          buktiGambarUrl = saveImageToDrive(buktiGambarBase64, nopToUpdate);
        }

        // Perbarui status Lunas dan Tanggal Lunas.
        // Asumsi kolom "Lunas" di indeks 5 dan "Tanggal Lunas" di indeks 6.
        rowData[5] = 'Lunas';
        const tanggalLunas = Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "dd/MM/yyyy HH:mm:ss");
        rowData[6] = tanggalLunas;
        
        // Jika ada bukti gambar, perbarui URL-nya.
        // Asumsi kolom "Bukti Gambar" di indeks 7.
        if (buktiGambarUrl) {
          rowData[7] = buktiGambarUrl;
        }
        
        // Setel kembali nilai-nilai ke baris yang ditemukan.
        // Plus 1 karena getRange() dimulai dari 1, sedangkan array dimulai dari 0.
        sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);

        // Kirim pesan WhatsApp jika nomor WA tersedia.
        if (whatsappNumber) {
          const namaWajibPajak = rowData[1];
          const nominalPajak = rowData[3];
          const tahunPajak = rowData[4];
          let pesan = `Hai ${namaWajibPajak}, pembayaran pajak NOP ${nopToUpdate} untuk tahun ${tahunPajak} sebesar ${nominalPajak} telah lunas. Terima kasih.`;

          // Tambahkan URL bukti gambar jika tidak ada kesalahan
          if (buktiGambarUrl && !buktiGambarUrl.includes('URL Gagal')) {
            pesan += `\n\nBukti pembayaran:\n${buktiGambarUrl}`;
          }

          sendWhatsappMessage(whatsappNumber, pesan);
        }

        return createJsonResponse({ status: 'success', message: `Data untuk NOP ${nopToUpdate} berhasil diperbarui.` });

      } else {
        // Jika NOP tidak ditemukan, kembalikan error.
        return createJsonResponse({ status: 'error', message: `Data untuk NOP ${nopToUpdate} tidak ditemukan.` });
      }

    } catch (error) {
      // Tangani kesalahan.
      return createJsonResponse({ status: 'error', message: 'Gagal memproses permintaan.', details: error.message });
    }
  } else {
    // Jika format data bukan JSON, kembalikan error.
    return createJsonResponse({ status: 'error', message: 'Hanya menerima data JSON.' });
  }
}

/**
 * Fungsi helper untuk mengirim pesan WhatsApp melalui Fonnte API.
 *
 * @param {string} targetNumber - Nomor telepon target.
 * @param {string} messageText - Isi pesan yang akan dikirim.
 */
function sendWhatsappMessage(targetNumber, messageText) {
  // URL API Fonnte
  const apiUrl = 'https://api.fonnte.com/send';

  // Payload data untuk permintaan POST
  const payload = {
    target: targetNumber,
    message: messageText,
    countryCode: '62',
    typing: false,
    delay: 2
  };
  
  const options = {
    'method': 'post',
    'payload': payload,
    'headers': {
      'Authorization': FONNTE_API_TOKEN
    }
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    Logger.log('Fonnte API response: ' + response.getContentText());
  } catch (e) {
    Logger.log('Error sending WhatsApp message: ' + e.message);
  }
}

/**
 * Fungsi helper untuk mengunggah gambar Base64 ke Google Drive.
 *
 * @param {string} base64Data - String Base64 dari file gambar.
 * @param {string} fileNamePrefix - Awalan nama file, misalnya NOP.
 * @return {string} - URL langsung (direct) dari gambar yang diunggah.
 */
function saveImageToDrive(base64Data, fileNamePrefix) {
  try {
    // Menghapus awalan 'data:image/jpeg;base64,' jika ada.
    const base64Cleaned = base64Data.split(',')[1] || base64Data;
    
    // Mendekode string Base64.
    const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Cleaned), MimeType.JPEG, `${fileNamePrefix}_bukti_pembayaran.jpg`);
    
    // Mengakses folder Google Drive.
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Mengunggah file ke folder Drive.
    const file = folder.createFile(decodedBlob);
    
    // Mengatur izin akses file agar dapat dilihat publik.
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    // Mengembalikan URL "direct" atau URL untuk melihat file.
    // URL direct lebih mudah diproses oleh aplikasi.
    return file.getUrl();

  } catch (error) {
    // Menangani error saat mengunggah ke Drive.
    Logger.log('Gagal mengunggah gambar: ' + error.message);
    return 'URL Gagal: ' + error.message;
  }
}

/**
 * Fungsi helper untuk membuat output JSON yang rapi.
 *
 * @param {object} obj - Objek yang akan diubah menjadi JSON.
 * @return {object} - Objek ContentService dengan output JSON.
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
