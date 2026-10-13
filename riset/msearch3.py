import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "SnI 2024 OJK survei nasional literasi inklusi keuangan persentase",
 "e-Conomy SEA 2025 Indonesia GMV digital economy report",
 "APJII profil internet indonesia 2025 jumlah pengguna penetrasi",
 "pembiayaan UMKM bank 2025 OJK kredit persentase",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
