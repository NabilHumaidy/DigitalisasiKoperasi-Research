import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "kredit pembiayaan UMKM 2025 OJK perbankan triliun persentase total kredit",
 "QRIS transaksi 2026 Bank Indonesia nilai triliun merchant",
 "koperasi sehat 2024 jumlah koperasi sehat nasional sertifikat",
 "World Co-operative Monitor 2024 Indonesia koperasi terbesar 300",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
