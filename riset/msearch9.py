import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "kemenkop 2026 jumlah koperasi terdaftar total 2025 157 ribu tidak aktif pembubaran",
 "digitalisasi koperasi 2025 jumlah koperasi aplikasi digital dashkop kemenkop",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:150])
    except Exception as e: print("ERR",e)
