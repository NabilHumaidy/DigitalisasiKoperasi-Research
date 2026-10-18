import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "OJK statististik fintech lending Juli 2026 outstanding pinjaman perusahaan berizin",
 "nilai transaksi QRIS 2025 Bank Indonesia triliun merchant juta",
 "BI-FAST transaksi 2025 nilai jumlah Bank Indonesia",
 "APJII survei internet indonesia 2025 penetrasi pengguna",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:150])
    except Exception as e: print("ERR",e)
