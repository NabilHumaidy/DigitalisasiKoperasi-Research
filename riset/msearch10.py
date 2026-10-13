import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "BPS survei e-commerce 2024 UMKM jualan online persentase transformasi digital",
 "jumlah kopdes merah putih aktif oktober 2025 kemenkop",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:150])
    except Exception as e: print("ERR",e)
