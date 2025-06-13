// js/main.js

const BASE_SERVER_URL = 'http://127.0.0.1:5000'; // PASTIKAN INI SESUAI DENGAN ALAMAT BACKEND ANDA

function showMessage(elementId, msg, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.innerHTML = msg; // Menggunakan innerHTML untuk mendukung tag HTML seperti <strong>
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 8000); // Pesan akan hilang setelah 8 detik
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const stuntingPredictForm = document.getElementById('stuntingPredictForm');
    const predictionResultDiv = document.getElementById('predictionResult');

    if (stuntingPredictForm) {
        stuntingPredictForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Mencegah halaman refresh saat form disubmit

            // Ambil nilai dari input Nama
            const childName = document.getElementById('childName').value.trim(); // .trim() untuk menghapus spasi di awal/akhir
            const ageMonths = parseFloat(document.getElementById('ageMonths').value);
            const heightCm = parseFloat(document.getElementById('heightCm').value);
            const weightKg = parseFloat(document.getElementById('weightKg').value);

            // Validasi input di frontend
            if (!childName || childName === '') {
                 showMessage('predictionResult', 'Mohon masukkan <strong>Nama Anak / Pengisi Form</strong>.', 'error');
                 return;
            }
            if (isNaN(ageMonths) || isNaN(heightCm) || isNaN(weightKg)) {
                showMessage('predictionResult', 'Mohon lengkapi <strong>Usia, Tinggi Badan, dan Berat Badan</strong> dengan angka yang valid.', 'error');
                return;
            }
            if (ageMonths < 0 || heightCm < 0 || weightKg < 0) {
                 showMessage('predictionResult', 'Nilai Usia, Tinggi Badan, dan Berat Badan tidak boleh negatif.', 'error');
                 return;
            }
            // Tambahkan validasi rentang data sesuai yang diharapkan model Anda
            if (ageMonths > 60 || heightCm > 120 || weightKg > 30 || ageMonths === 0 || heightCm === 0 || weightKg === 0) {
                 showMessage('predictionResult', 'Nilai input <strong>Usia (0-60), Tinggi Badan (cm > 0), dan Berat Badan (kg > 0)</strong> harus dalam rentang yang wajar.', 'error');
                 return;
            }


            try {
                // Kirim permintaan POST ke endpoint /predict di backend
                const response = await fetch(`${BASE_SERVER_URL}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Memberi tahu server bahwa kita mengirim JSON
                    },
                    // Kirim data nama bersama dengan data prediksi lainnya
                    body: JSON.stringify({
                        nama: childName, // Kirim nama
                        umur: ageMonths,
                        tinggi_badan: heightCm,
                        berat_badan: weightKg
                    })
                });

                const result = await response.json(); // Menguraikan respons JSON dari server

                if (response.ok) { // Jika status HTTP adalah 2xx (misalnya 200 OK)
                    // Tampilkan hasil prediksi, termasuk nama yang dikembalikan dari backend
                    let messageText = `Hasil Prediksi untuk <strong>${result.nama}</strong>: <br>Status Gizi: <strong>${result.prediksi_status_gizi}</strong>`;
                    showMessage('predictionResult', messageText, 'success');
                    
                    stuntingPredictForm.reset(); // Mengosongkan form setelah berhasil
                    console.log('Respons Backend:', result); // Untuk debugging di konsol browser
                } else {
                    // Jika ada error dari server (misalnya 400 Bad Request, 500 Internal Server Error)
                    // Menampilkan pesan error dari backend jika tersedia
                    showMessage('predictionResult', `Gagal memprediksi: <strong>${result.error || response.statusText}</strong>`, 'error');
                    console.error('Error dari Backend:', result);
                }
            } catch (error) {
                // Menangani error jaringan atau error lainnya yang terjadi sebelum respons diterima
                showMessage('predictionResult', 'Terjadi kesalahan jaringan. Pastikan <strong>backend berjalan di ' + BASE_SERVER_URL + ' dan CORS sudah diatur</strong>.', 'error');
                console.error('Fetch Error:', error);
            }
        });
    }
});