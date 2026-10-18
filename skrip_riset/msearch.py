import sys
sys.path.insert(0,'/e/KoperasiFintech/riset')
from brave import brave
qs = [
 "jumlah total koperasi indonesia 2025 kemenkop 157 ribu aktif tidak aktif",
 "kontribusi koperasi terhadap PDB Indonesia persentase 2024 2025",
 "Indeks Pembangunan Koperasi IPK 2025 kemenkop",
 "koperasi sehat sertifikasi jumlah koperasi bersertifikat 2025",
]
for q in qs:
    print("##### "+q)
    try:
        for u,t in brave(q):
            print(u); print("    "+t[:150])
    except Exception as e:
        print("ERR",e)
