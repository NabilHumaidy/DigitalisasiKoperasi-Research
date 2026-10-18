import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "e-Conomy SEA 2025 Indonesia GMV US$100 miliar ekonomi digital Indonesia 2025",
 "koperasi sektor simpan pinjam konsumsi produksi jasa pemasaran jumlah 2024 kemenkop",
 "koperasi sehat sertifikasi jumlah koperasi bersertifikat 2025",
 "BPS transformasi digital UMKM 2024 survei e-commerce persentase",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
