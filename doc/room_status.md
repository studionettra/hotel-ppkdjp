# Status Room dalam Hotel

## Status Kamar

  -----------------------------------------------------------------------
  Status                  Singkatan               Keterangan
  ----------------------- ----------------------- -----------------------
  Vacant Clean            VC                      Kamar kosong dan sudah
                                                  dibersihkan, siap
                                                  dijual.

  Vacant Dirty            VD                      Kamar kosong tetapi
                                                  belum dibersihkan.

  Vacant Inspected        VI                      Kamar kosong, sudah
                                                  dibersihkan dan
                                                  diperiksa.

  Occupied Clean          OC                      Kamar ditempati dan
                                                  sudah dibersihkan hari
                                                  ini.

  Occupied Dirty          OD                      Kamar ditempati namun
                                                  belum dibersihkan hari
                                                  ini.

  Occupied Do Not Disturb O-DND                   Tamu memasang tanda
                                                  DND.

  Occupied Sleep Out      OSO                     Tamu terdaftar tetapi
                                                  tidak tidur di kamar
                                                  semalam.

  On Change               OCG                     Sedang dipersiapkan
                                                  setelah check-out.

  Out of Order            OOO                     Tidak dapat dijual
                                                  karena perbaikan besar.

  Out of Service          OOS                     Tidak dijual sementara
                                                  karena alasan
                                                  operasional.

  Blocked                 BLK                     Diblokir untuk
                                                  keperluan tertentu.

  Pick Up                 PU                      Sedang dibersihkan.
  -----------------------------------------------------------------------

## Status Okupansi

  Status        Keterangan
  ------------- ----------------------------
  Reserved      Sudah dipesan.
  Due In        Jadwal check-in hari ini.
  Checked In    Sudah check-in.
  Stay Over     Masih menginap.
  Due Out       Jadwal check-out hari ini.
  Checked Out   Sudah check-out.
  No Show       Tidak datang.
  Cancelled     Reservasi dibatalkan.
  Walk In       Datang tanpa reservasi.

## Status Housekeeping

-   Clean
-   Dirty
-   Inspected
-   Cleaning
-   Turndown Done
-   Maintenance Requested
-   Laundry Pending
-   Deep Cleaning

## Status Maintenance

-   Under Maintenance
-   Waiting Spare Part
-   Testing
-   Ready

## Status Reservasi

-   Pending
-   Confirmed
-   Guaranteed
-   Waitlist
-   Cancelled
-   No Show

## Alur Status

``` text
VC
↓ Booking
Reserved
↓ Check In
OC
↓ Housekeeping
OD → OC
↓ Check Out
VD
↓ Dibersihkan
VC

atau

VC
↓
OOO/OOS
↓
VC
```

## Rekomendasi untuk Website Hotel

### Status Reservasi

-   Pending
-   Confirmed
-   Checked In
-   Checked Out
-   Cancelled
-   No Show

### Status Kamar

-   Available
-   Occupied
-   Cleaning
-   Maintenance
-   Reserved
