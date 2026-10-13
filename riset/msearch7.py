import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "BI-FAST transaksi 2026 nilai triliun pertumbuhan Bank Indonesia",
 "World Co-operative Monitor 2025 Indonesia koperasi top 300 turnover",
 "APJII survei 2026 pengguna internet indonesia",
 "koperasi konsumsi simpan pinjam produksi jasa pemasaran jumlah unit statistik koperasi indonesia",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
