# KoperasiFintech — Struktur Folder

Proyek makalah & presentasi mata kuliah **Manajemen Koperasi**:
"Strategi Modernisasi dan Digitalisasi Koperasi, Digitalisasi Layanan Koperasi (Koperasi Modern), dan Integrasi Teknologi Keuangan (Fintech)".

---

## Struktur

```
KoperasiFintech/
├── makalah/                          Dokumen utama (markdown)
├── presentasi/                       Slide web + PDF presentasi
│   ├── versi_lama/                   Presentasi dari makalah lama (Makalah_Digitalisasi…)
│   └── versi_baru/                   Presentasi dari makalah baru (Strategi_Digitalisasi…)
├── sumber_data/                      Hasil unduhan data & artikel (raw)
│   ├── bps/                          Badan Pusat Statistik
│   ├── kemenkop/                     Kementerian Koperasi & Kemen UMKM
│   ├── ojk/                          OJK (LPBBTI, SNLIK, SPIP)
│   ├── bank_indonesia/               Bank Indonesia (QRIS, siaran pers)
│   ├── media/                        Media & portal (Kompas, Katadata, APJII, e-Conomy SEA)
│   ├── global/                       Data internasional (World Co-operative Monitor 2025)
│   └── gagal/                        Unduhan gagal (Cloudflare/404/halaman error) — bisa dihapus
├── skrip_riset/                      Skrip Python scraper (brave.py, msearch*.py)
├── .gitignore
└── README.md
```

## Isi Folder

### `makalah/`
- **`Makalah_Digitalisasi_Koperasi_dan_Fintech.md`** — makalah awal (fokus Koperasi Desa/Kelurahan Merah Putih).
- **`Strategi_Digitalisasi_Koperasi_dan_Fintech_-_Perspektif_Umum.md`** — makalah baru, perspektif **koperasi secara umum** (BAB I–V, daftar pustaka, dan lampiran rangka presentasi). File ini yang digunakan untuk makalah/presentasi final.
- **`Integrasi_Teknologi_Keuangan_Fintech_pada_Koperasi.md`** — makalah pendalaman tema **integrasi fintech pada koperasi** (BAB I–X: pendahuluan, landasan teori, regulasi pasca-UU P2SK/POJK 40 & 47/2024/SEOJK 19/2025, data industri LPBBTI–QRIS–SNLIK–KUR–LPDB, 7 model integrasi, risiko & tata kelola, kajian ilmiah 2021–2026, perspektif internasional, sintesis & rekomendasi, daftar pustaka 101 entri). Semua data periode 2021–2026; klaim tak terverifikasi ditandai.

### `presentasi/`
Dipecah menjadi dua subfolder, satu untuk tiap versi makalah:

#### `versi_lama/` — presentasi dari **Makalah_Digitalisasi_Koperasi_dan_Fintech.md** (fokus Koperasi Desa/Kelurahan Merah Putih)
- `index.html` + `style.css` + `visualisasi.js` — slide web interaktif (buka `index.html` di browser).
- `slides.html` — versi cadangan slide.
- `Slide_Presentasi_Koperasi_Fintech.pdf` — versi cetak/PDF presentasi.

#### `versi_baru/` — presentasi dari **Strategi_Digitalisasi_Koperasi_dan_Fintech_-_Perspektif_Umum.md** (koperasi secara umum)
- `Slide_Presentasi.html` — 12 slide, gaya *consulting* (palet Goldman Sachs: navy `#051C2C`/biru, hairline, tanpa gradient/emoji), grafik SVG inline (bar, grouped bar, horizontal bar, line+area, progress bar).
- `Slide_Presentasi_Strategi_Digitalisasi.pdf` — PDF final 13 halaman (1280×720), di-*render* dari HTML di atas.
- Struktur mengikuti **LAMPIRAN: RANGKA PRESENTASI** di akhir makalah (12 slide untuk ±20 menit).

### `sumber_data/`
Salinan laman dan data mentah yang dirujuk makalah. Setiap klaim di makalah tetap mencantumkan tautan sumber aslinya; folder ini hanya untuk arsip/verifikasi.
- `bps/` — statistik koperasi & ekonomi (Statistik Indonesia 2025).
- `kemenkop/` — laman Kemenkop UKM dan Kemen UMKM.
- `ojk/` — direktori & statistik LPBBTI, SNLIK, SPIP (HTML + `ojk_lpbbti_des25.xlsx`).
- `bank_indonesia/` — siaran pers & laman QRIS.
- `media/` — artikel media, Katadata (Databoks), APJII, e-Conomy SEA, hasil *search scrape*.
- `global/` — `wcm2025.txt` (World Co-operative Monitor 2025, ICA/ICETT).
- `gagal/` — unduhan yang tidak berhasil (halaman blokir Cloudflare, "Request Rejected", 404, file kosong). **Tidak ada data di sini — aman dihapus.**

### `skrip_riset/`
Skrip scraper Python yang dipakai saat pengumpulan data (`brave.py`, `msearch.py` … `msearch10.py`).

## Catatan
- Data terbaru per **Oktober 2026**; periode data utama 2020–2026.
- Sumber utama makalah: BPS, OJK, Bank Indonesia, Kemenkop, ICA, MONDRAGON, Google–Temasek–Bain (*e-Conomy SEA 2025*), serta media kredibel (ANTARA, Kompas, Kontan, detik, CNBC).
