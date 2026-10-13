import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "jumlah koperasi sehat sertifikat 2025 kemenkop ukm standar nasional",
 "koperasi digital transformasi digital koperasi 2025 jumlah koperasi digital",
 "World Co-operative Monitor Indonesia koperasi terbesar ranking 2024",
 "jumlah koperasi anggota indonesia 2025 juta orang kemenkop",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q): print(u); print("    "+t[:140])
    except Exception as e: print("ERR",e)
