import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "BPS Statistik Indonesia 2025 jumlah koperasi menurut jenis simpan pinjam konsumsi produksi jasa",
 "koperasi sehat 2025 jumlah koperasi sehat Kemenkop UKM sertifikat standar",
 " jumlah anggota koperasi indonesia 2025 kemenkop ukm juta",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
