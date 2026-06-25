Berikut adalah alur simulasi penggunaan sistem manajemen hotel (Hotel Management System) ini, dimulai dari saat ada tamu _walk-in_ (datang langsung tanpa pemesanan sebelumnya) hingga tamu tersebut selesai menginap dan _check-out_:

### 1. Front Office: Tamu Walk-in & Reservasi

- Tamu datang ke meja resepsionis dan ingin menyewa kamar.
- Resepsionis (login dengan role **Front Office**) membuka menu **Reservasi**.
- Resepsionis menekan tombol **Tambah Reservasi Baru**.
- Resepsionis mengisi data tamu (jika tamu baru, data akan didaftarkan; jika sudah pernah menginap, tinggal dicari datanya).
- Resepsionis memilih tipe kamar yang tersedia, tanggal masuk (_check-in_ hari ini), dan tanggal keluar (_check-out_).
- Status reservasi awal biasanya akan langsung dibuat menjadi `confirmed`.

### 2. Front Office: Proses Check-in

- Karena tamu sudah ada di tempat (walk-in), resepsionis dapat langsung memproses **Check-In**.
- Resepsionis memilih reservasi yang tadi dibuat dan mengklik tombol **Check-In**.
- Sistem akan meminta resepsionis untuk:
    - Memilih nomor kamar fisik yang tersedia sesuai dengan tipe kamar yang dipesan.
    - Menerima deposit awal (jika ada ketentuan deposit).
- Setelah check-in berhasil:
    - Status kamar akan otomatis berubah dari _Vacant Clean (VC)_ menjadi _Occupied Clean (OC)_ atau terisi.
    - Sistem otomatis membuatkan **Guest Folio** (buku tagihan tamu) yang akan mencatat semua biaya dan pembayaran tamu selama menginap. Biaya sewa kamar akan otomatis masuk ke dalam Folio ini.

### 3. F&B (Food & Beverage): Pemesanan Restoran/Layanan Kamar

- Saat menginap, tamu memesan makanan dari restoran hotel atau _room service_.
- Staf Restoran (login dengan role **F&B**) membuka sistem dan menginput pesanan tamu tersebut.
- Tagihan makanan dapat dibayar langsung oleh tamu (tunai/kartu) atau **dibebankan ke kamar (Charge to Room)**.
- Jika dibebankan ke kamar, tagihan F&B tersebut otomatis masuk ke dalam **Guest Folio** tamu yang bersangkutan, sehingga nanti ditagih saat check-out.

### 4. Housekeeping: Pembersihan Kamar Harian

- Keesokan harinya, tamu meminta kamarnya dibersihkan.
- Staf **Housekeeping** melihat jadwal/tugas pembersihan kamar di dashboard mereka.
- Status kamar mungkin tercatat sebagai _Occupied Dirty (OD)_.
- Setelah dibersihkan, staf Housekeeping mengupdate status kamar menjadi _Occupied Clean (OC)_ di dalam sistem agar resepsionis tahu kamar sudah rapi.

### 5. Front Office: Proses Check-Out & Pembayaran

- Tibalah saatnya tamu untuk pulang. Tamu datang ke resepsionis untuk _Check-Out_.
- Resepsionis (Front Office) membuka menu **Check-Out** untuk kamar/reservasi tersebut.
- Sistem akan menampilkan **Guest Folio** tamu, yang menjumlahkan:
    - Biaya sewa kamar (Room Rate).
    - Biaya F&B (jika sebelumnya ada pesanan yang di-charge ke kamar).
    - Layanan tambahan lainnya (laundry, spa, dll).
    - Dikurangi dengan deposit yang sudah dibayar di awal (jika ada).
- Tamu melunasi sisa tagihan akhir. Resepsionis mencatat pembayaran (metode tunai/transfer/kartu) di sistem.
- Resepsionis menyelesaikan proses Check-Out.

### 6. Sistem & Housekeeping: Pasca Check-Out

- Setelah check-out sukses ditekan, sistem secara otomatis:
    1. Mengubah status kamar dari terisi (_Occupied_) menjadi kosong kotor / _Vacant Dirty (VD)_.
    2. Mengubah status reservasi menjadi `checked_out`.
    3. **Otomatis membuat Housekeeping Task** (Tugas Kebersihan) dengan prioritas `high` yang berisi instruksi: "Auto-created setelah check-out kamar [Nomor Kamar]". (Ini adalah fitur yang baru saja kita perbaiki error-nya tadi).
- Staf **Housekeeping** melihat ada tugas baru masuk di dashboard mereka untuk membersihkan kamar yang baru saja ditinggalkan tamu.
- Setelah staf Housekeeping selesai membersihkan, mereka menyelesaikan tugas (Task Completed) dan mengubah status kamar menjadi _Vacant Clean (VC)_.
- Kamar kini siap disewakan kembali ke tamu berikutnya!

Alur ini memastikan semua departemen (Front Office, F&B, dan Housekeeping) saling terhubung dan data tagihan tamu tercatat secara tersentralisasi di dalam _Guest Folio_. Ada yang ingin disimulasikan lebih spesifik?
