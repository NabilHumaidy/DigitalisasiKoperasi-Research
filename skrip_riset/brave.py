import subprocess, re, html, sys, urllib.parse

def brave(q, n=15):
    url = "https://search.brave.com/search?q=" + urllib.parse.quote(q) + "&source=web"
    out = subprocess.run(["curl","-sk","-m","45","-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "-L", url], capture_output=True).stdout.decode("utf-8","ignore")
    # results are in <a> with href containing redirect
    res = []
    for m in re.finditer(r'<div[^>]*class="[^"]*snippet[^"]*"[^>]*>(.*?)</div>', out, flags=re.S):
        seg = m.group(1)
        href = re.search(r'href="([^"]+)"', seg)
        txt = re.sub(r'<[^>]+>', ' ', seg)
        txt = html.unescape(re.sub(r'\s+', ' ', txt)).strip()
        if href:
            res.append((href.group(1), txt[:200]))
    if not res:
        for m in re.finditer(r'<a[^>]+href="((?:https?://|/redirect)[^"]+)"[^>]*>(.*?)</a>', out, flags=re.S):
            u, t = m.group(1), m.group(2)
            t = html.unescape(re.sub(r'<[^>]+>', ' ', t)).strip()
            if len(t) > 15 and 'brave.com' not in u:
                res.append((u, t[:200]))
    return res[:n]

if __name__ == "__main__":
    q = sys.argv[1]
    for u, t in brave(q):
        print(u)
        print("   ", t)
