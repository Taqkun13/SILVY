const { Controller, Response } = require("pepesan");
const f = require("../utils/Formatter");
const fs = require("fs");

module.exports = class BotController extends Controller {
    // SILVY Siantar Interactive Ledger & Virtual Yield-Assistant

    async showwavename(request) {
        const scriptURL = "https://script.google.com/macros/s/AKfycbyNXn1eyMtNVySTxx9x5aXRZRjpwPPnYoYvof-m0I8Pv4aEdYkmHsiOBxmJ5tSKjU-UVg/exec?access=iamyourdeveloper";
    
        try {
            // Fetch data dari Google Apps Script
            const response = await fetch(scriptURL);
            const data = await response.json();
    
            // Pastikan data berbentuk array
            if (!Array.isArray(data) || data.length === 0) {
                return this.reply("⚠️ Tidak ada sheet yang tersedia.");
            }
    
            // Format daftar nama sheet sebagai teks
            const sheetList = data.map((name, index) => `📌 ${index + 1}. ${name}`).join("\n");
    
            // Kirim daftar nama sheet sebagai teks ke WhatsApp
            return this.reply(`📋 *Daftar Nama Sheet:*\n\n${sheetList}`);
    
        } catch (error) {
            console.error("Gagal mengambil nama sheet:", error);
            return this.reply("⚠️ Gagal mengambil data dari server, coba lagi nanti.");
        }
    }

    // Fungsi untuk memilih sapaan acak agar menghindari blokir
    getRandomGreeting() {
        const greetings = [
            "✨ Halo kak",
            "👋 Hai kak",
            "😊 Hai, semoga harimu menyenangkan kak",
            "🌸 Halo, apa kabar kak"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    
    async sentslip(request) {
        const sheetName = request.text;
        const scriptDataUser = `https://script.google.com/macros/s/AKfycbyNXn1eyMtNVySTxx9x5aXRZRjpwPPnYoYvof-m0I8Pv4aEdYkmHsiOBxmJ5tSKjU-UVg/exec?access=iamyourdeveloper&sheetName=${encodeURIComponent(sheetName)}`;
        const scriptDataSheet = "https://script.google.com/macros/s/AKfycbyNXn1eyMtNVySTxx9x5aXRZRjpwPPnYoYvof-m0I8Pv4aEdYkmHsiOBxmJ5tSKjU-UVg/exec?access=iamyourdeveloper";
    
        try {
            const res = await fetch(scriptDataSheet);
            const validAccess = await res.json();
    
            if (!validAccess.includes(sheetName)) return;
    
            try {
                const response = await fetch(scriptDataUser);
                const data = await response.json();
    
                if (!Array.isArray(data) || data.length === 0) {
                    return this.reply("⚠️ Data tidak ditemukan atau kosong.");
                }
    
                for (const row of data) {
                    // Buat nama file
                    const namaFile = `${row[3] || "default"}${row[9] || "default"}.pdf`;
                    const filePath = `public/${namaFile}`;
    
                    // Cek apakah file tersedia di server lokal
                    if (!fs.existsSync(filePath)) {
                        console.warn(`❌ File tidak ditemukan: ${filePath}. Melewati nomor ini.`);
                        continue; // SKIP nomor ini dan lanjut ke row berikutnya
                    }
    
                    // Validasi nomor tujuan
                    let nomorTujuan = row[7] ? String(row[7]).replace(/\D/g, '') : null;
                    if (!nomorTujuan || nomorTujuan.length < 10) {
                        console.warn(`⚠️ Nomor tidak valid: ${row[7]}. Melewati nomor ini.`);
                        continue; // SKIP jika nomor tidak valid
                    }
    
                    nomorTujuan = `${nomorTujuan}@s.whatsapp.net`;
    
                    const greeting = this.getRandomGreeting();
                    const nama = row[5] ? String(row[5]) : "Kak";
                    const periodeGaji = row[8] ? `${row[8]}` : "*Belum tersedia*";
    
                    console.log(`📨 Mengirim pesan ke: ${nomorTujuan} dengan file ${namaFile}`);
    
                    await this.send(nomorTujuan, [
                        `${greeting} *${nama}*,`,
                        `📜 Berikut ini adalah slip gaji kamu untuk periode *${periodeGaji}*.\nSilakan cek file berikut ya kak! 😊`,
                        Response.document.fromURL(filePath, "application/pdf"),
                        "📌 *Mohon simpan nomor ini dengan nama _SILVY_ agar kakak lebih mudah mendapatkan slip gaji ke depannya ya kak.*\n🙏 _Mohon tidak membalas pesan ini ya kak. Terima kasih!_"
                    ]);
    
                    console.log(`✅ Pesan terkirim ke: ${nomorTujuan}`);
    
                    // Delay sebelum mengirim ke orang berikutnya
                    const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                    console.log(`⏳ Menunggu ${delay / 1000} detik sebelum mengirim ke nomor berikutnya...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
    
                return "✅ Semua pesan telah dikirim.";
    
            } catch (error) {
                console.error("❌ Gagal mengambil data:", error);
                return this.reply("⚠️ Terjadi kesalahan saat mengambil data, coba lagi nanti.");
            }
        } catch (error) {
            return;
        }
    }
    
    
    
    
}