/* ============================================================
   Visualisasi Data — Makalah Digitalisasi Koperasi & Fintech
   SVG murni, tanpa pustaka. Palet divalidasi CVD (lihat style.css).
   Setiap grafik punya kembaran tabel; tooltip hanya menambah, tidak
   menggembok nilai.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- token warna dari CSS (reset otomatis saat tema ganti) ---------- */
  function prop(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  var C = {
    series: function (i) { return prop("--series-" + (i + 1)); },
    ink: function () { return prop("--ink"); },
    ink2: function () { return prop("--ink-2"); },
    muted: function () { return prop("--muted"); },
    grid: function () { return prop("--gridline"); },
    base: function () { return prop("--baseline"); },
    surface: function () { return prop("--surface-1"); },
    critical: function () { return prop("--status-critical"); },
    good: function () { return prop("--status-good"); },
    ramp: function (step) { return prop("--ramp-" + step); }
  };
  var isDark = function () {
    var h = document.body;
    return h.dataset.theme === "dark" ||
      (h.dataset.theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  /* ---------- util SVG ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function g(attrs) { return el("g", attrs); }

  /* ---------- format ---------- */
  var NF = new Intl.NumberFormat("id-ID");
  function fmtInt(v) { return NF.format(Math.round(v)); }
  function fmtDec(v, d) {
    return new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  }
  function compact(v) {
    if (v >= 1000000) return fmtDec(v / 1000000, 1).replace(",0", "") + " jt";
    if (v >= 1000) return fmtDec(v / 1000, 0).replace(",0", "") + " rb";
    return fmtInt(v);
  }
  function pct(v, d) { return fmtDec(v, d == null ? 2 : d) + "%"; }

  /* ---------- skala ---------- */
  function niceScale(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    var span = max - min;
    var step0 = span / count;
    var mag = Math.pow(10, Math.floor(Math.log10(step0)));
    var norm = step0 / mag, step;
    if (norm < 1.5) step = mag;
    else if (norm < 3) step = 2 * mag;
    else if (norm < 7) step = 5 * mag;
    else step = 10 * mag;
    var lo = Math.floor(min / step) * step;
    var hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step * 0.5; v += step) ticks.push(v);
    return { lo: lo, hi: hi, step: step, ticks: ticks };
  }

  /* ---------- tooltip bersama ---------- */
  var tip = document.getElementById("tooltip");
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var px = x + 16, py = y + 14;
    if (px + w > window.innerWidth - 10) px = x - w - 16;
    if (py + h > window.innerHeight - 10) py = y - h - 14;
    tip.style.left = px + "px";
    tip.style.top = py + "px";
  }
  function hideTip() { tip.hidden = true; }
  function tipRows(cat, rows) {
    var html = '<div class="t-cat"></div>';
    for (var i = 0; i < rows.length; i++) {
      html += '<div class="t-row"><span class="t-key" style="background:' + rows[i].color + '"></span>' +
        '<span class="t-name"></span><span class="t-val"></span></div>';
    }
    showTip(html, 0, 0);
    tip.querySelector(".t-cat").textContent = cat;
    var r = tip.querySelectorAll(".t-row");
    for (var j = 0; j < rows.length; j++) {
      r[j].querySelector(".t-name").textContent = rows[j].name;
      r[j].querySelector(".t-val").textContent = rows[j].value;
    }
  }
  function placeAtPoint(clientX, clientY, cat, rows) {
    tipRows(cat, rows);
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var px = clientX + 16, py = clientY - h - 10;
    if (px + w > window.innerWidth - 10) px = clientX - w - 16;
    if (py < 8) py = clientY + 18;
    tip.style.left = px + "px";
    tip.style.top = py + "px";
  }

  /* ---------- sumbu & grid ----------
     plot: {x,y,w,h} dalam satuan SVG */
  function drawYAxis(svg, plot, scale, fmt, unit) {
    for (var i = 0; i < scale.ticks.length; i++) {
      var v = scale.ticks[i];
      var y = plot.y + plot.h - (v - scale.lo) / (scale.hi - scale.lo) * plot.h;
      if (y < plot.y - 0.5 || y > plot.y + plot.h + 0.5) continue;
      if (v !== scale.lo) svg.appendChild(el("line", { x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y, "class": "grid-line" }));
      var t = el("text", { x: plot.x - 8, y: y + 3.5, "text-anchor": "end", "class": "axis-tick" }, fmt(v));
      svg.appendChild(t);
    }
    svg.appendChild(el("line", { x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h, "class": "base-line" }));
    if (unit) svg.appendChild(el("text", {
      x: plot.x, y: plot.y - 10, "class": "axis-label"
    }, unit));
  }

  /* ---------- legenda: garis kunci untuk garis, kotak untuk batang ---------- */
  function drawLegend(svg, series, x, y, asLine) {
    var cx = x;
    for (var i = 0; i < series.length; i++) {
      var item = g({ "class": "legend-item", "data-i": i });
      if (asLine) {
        item.appendChild(el("line", { x1: cx, x2: cx + 18, y1: y - 4, y2: y - 4, stroke: series[i].color, "stroke-width": 2.5, "stroke-linecap": "round" }));
      } else {
        item.appendChild(el("rect", { x: cx, y: y - 9, width: 11, height: 11, rx: 2, fill: series[i].color }));
      }
      var t = el("text", { x: cx + (asLine ? 24 : 17), y: y, "class": "legend-text" }, series[i].name);
      item.appendChild(t);
      cx += (asLine ? 26 : 19) + t.getComputedTextLength ? 0 : 0;
      svg.appendChild(item);
      cx += measure(t);
    }
    return cx;
  }
  function measure(textNode) {
    try { return textNode.getComputedTextLength() + 14; } catch (e) { return textNode.textContent.length * 6.2 + 24; }
  }

  /* ============================================================
     GRAFIK BATANG TEGAK (tunggal / kelompok)
     ============================================================ */
  function renderColumn(host, spec) {
    var W = 720, H = spec.h || 300;
    var m = { t: 26, r: 14, b: spec.tallLabels ? 46 : 34, l: spec.leftPad || 56 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var n = spec.categories.length, s = spec.series.length;
    var scale = niceScale(0, spec.yMax, 5);
    var series = spec.series.map(function (sr, i) { return { name: sr.name, color: sr.color || C.series(i) }; });

    host.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    svg.setAttribute("aria-label", spec.aria || spec.title || "");
    host.appendChild(svg);
    var plot = { x: m.l, y: m.t, w: pw, h: ph };
    drawYAxis(svg, plot, scale, spec.tickFmt || fmtInt, spec.unit);

    var groupW = pw / n;
    var barWMax = (groupW * 0.72) / s;
    var barW = Math.min(barWMax, 52);

    /* area sentuh per kategori (lebih besar dari batang) */
    for (var ci = 0; ci < n; ci++) {
      (function (catIdx) {
        var gx = m.l + catIdx * groupW;
        var rows = [];
        for (var si = 0; si < s; si++) rows.push({ name: series[si].name, color: series[si].color, value: spec.valueFmt(spec.values[si][catIdx], si) });
        var hit = el("rect", {
          x: gx, y: m.t, width: groupW, height: ph, "class": "hit-area",
          tabindex: "0", role: "img"
        });
        hit.setAttribute("aria-label", spec.categories[catIdx] + " — " + rows.map(function (r) { return r.name + " " + r.value; }).join(", "));
        var show = function (ev) { placeAtPoint(ev.clientX, ev.clientY, spec.categories[catIdx], rows); };
        hit.addEventListener("pointermove", show);
        hit.addEventListener("pointerdown", show);
        hit.addEventListener("focus", function (ev) {
          var r = hit.getBoundingClientRect();
          placeAtPoint(r.left + r.width / 2, r.top, spec.categories[catIdx], rows);
        });
        hit.addEventListener("blur", hideTip);
        hit.addEventListener("pointerleave", hideTip);
        svg.appendChild(hit);
      })(ci);
    }

    for (var ci2 = 0; ci2 < n; ci2++) {
      var gx2 = m.l + ci2 * groupW + (groupW - barW * s - 2 * (s - 1)) / 2;
      for (var si2 = 0; si2 < s; si2++) {
        var v = spec.values[si2][ci2];
        if (v == null) continue;
        var bh = (v - scale.lo) / (scale.hi - scale.lo) * ph;
        var bx = gx2 + si2 * (barW + 2), by = m.t + ph - bh;
        svg.appendChild(el("rect", { x: bx, y: by, width: barW, height: Math.max(bh, 1.5), rx: 2, fill: series[si2].color, "class": "bar-mark" }));

        /* label nilai: ujung saja, atau semua jika diminta */
        var doLabel = (spec.labelAll && spec.labelAll(si2, ci2)) ||
          (spec.labelEndOnly && (si2 === spec.labelSeries) && ci2 === n - 1) ||
          (!spec.labelEndOnly && spec.labelAll);
        if (doLabel) {
          var lbl = el("text", {
            x: bx + barW / 2, y: by - 6, "text-anchor": "middle", "class": "value-label"
          }, spec.valueFmt(v, si2));
          svg.appendChild(lbl);
        }
      }
      /* label kategori */
      var cx = m.l + ci2 * groupW + groupW / 2;
      var ty = m.t + ph + 18;
      if (spec.tallLabels) {
        var words = spec.categories[ci2].split(" ");
        var lines = [], cur = "";
        for (var wi = 0; wi < words.length; wi++) {
          if ((cur + " " + words[wi]).trim().length > 12 && cur) { lines.push(cur.trim()); cur = words[wi]; }
          else cur += " " + words[wi];
        }
        lines.push(cur.trim());
        for (var li = 0; li < lines.length; li++) {
          svg.appendChild(el("text", { x: cx, y: ty + li * 13, "text-anchor": "middle", "class": "cat-label" }, lines[li]));
        }
      } else {
        svg.appendChild(el("text", { x: cx, y: ty, "text-anchor": "middle", "class": "cat-label" }, spec.categories[ci2]));
      }
    }

    if (s > 1) drawLegend(svg, series, m.l, m.t - 12, false);
    if (spec.caption) svg.appendChild(el("text", { x: m.l, y: H - 4, "class": "sub-note" }, spec.caption));

    /* penanda rata-rata / ambang batas */
    if (spec.thresholds) {
      for (var ti = 0; ti < spec.thresholds.length; ti++) {
        var th = spec.thresholds[ti];
        var ty2 = m.t + ph - (th.value - scale.lo) / (scale.hi - scale.lo) * ph;
        svg.appendChild(el("line", { x1: m.l, x2: m.l + pw, y1: ty2, y2: ty2, "class": "threshold-line" }));
        svg.appendChild(el("text", { x: m.l + pw + 2, y: ty2 + 3.5, "text-anchor": "end", "class": "threshold-label" }, th.label));
      }
    }
  }

  /* ============================================================
     GRAFIK BATANG MENDATAR — corong adopsi, satu seri
     ============================================================ */
  function renderBars(host, spec) {
    var W = 720, H = spec.h || 300;
    var m = { t: 18, r: 96, b: 30, l: spec.leftPad || 176 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var n = spec.categories.length;
    var scale = niceScale(0, spec.values[0] ? maxArr(spec.values[0]) : 1, 5);

    host.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    svg.setAttribute("aria-label", spec.aria || spec.title || "");
    host.appendChild(svg);
    var plot = { x: m.l, y: m.t, w: pw, h: ph };

    /* grid vertikal */
    for (var i = 0; i < scale.ticks.length; i++) {
      var v = scale.ticks[i];
      var x = plot.x + (v - scale.lo) / (scale.hi - scale.lo) * plot.w;
      if (v !== scale.lo) svg.appendChild(el("line", { x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h, "class": "grid-line" }));
      svg.appendChild(el("text", { x: x, y: plot.y + plot.h + 18, "text-anchor": "middle", "class": "axis-tick" }, spec.tickFmt ? spec.tickFmt(v) : compact(v)));
    }

    var rowH = ph / n;
    var barH = Math.min(rowH * 0.58, 30);

    for (var ci = 0; ci < n; ci++) {
      var cy = plot.y + ci * rowH + (rowH - barH) / 2;
      var v = spec.values[0][ci];
      var bw = (v - scale.lo) / (scale.hi - scale.lo) * plot.w;

      var catLabel = el("text", { x: plot.x - 10, y: cy + barH / 2 + 4, "text-anchor": "end", "class": "cat-label" }, spec.categories[ci]);
      svg.appendChild(catLabel);

      var rows = [{ name: spec.categories[ci], color: spec.barColor || C.series(0), value: spec.valueFmt(v) }];
      var hit = el("rect", { x: 0, y: cy - 6, width: W, height: barH + 12, "class": "hit-area", tabindex: "0" });
      hit.setAttribute("aria-label", spec.categories[ci] + ": " + rows[0].value);
      (function (r, label) {
        var show = function (ev) { placeAtPoint(ev.clientX, ev.clientY, label, r); };
        hit.addEventListener("pointermove", show);
        hit.addEventListener("pointerdown", show);
        hit.addEventListener("focus", function () {
          var b = hit.getBoundingClientRect();
          placeAtPoint(b.left + b.width / 2, b.top, label, r);
        });
        hit.addEventListener("blur", hideTip);
        hit.addEventListener("pointerleave", hideTip);
      })(rows, spec.categories[ci]);
      svg.appendChild(hit);

      svg.appendChild(el("rect", {
        x: plot.x, y: cy, width: Math.max(bw, 2), height: barH, rx: 2,
        fill: spec.barColor || C.series(0), "class": "bar-mark"
      }));

      /* label nilai di luar ujung batang */
      var lx = plot.x + Math.max(bw, 2) + 8;
      svg.appendChild(el("text", { x: lx, y: cy + barH / 2 + 4, "class": "bar-label-out" }, spec.valueFmt(v)));

      /* catatan proporsi (opsional) */
      if (spec.shareOf && spec.shareOf[ci] != null) {
        svg.appendChild(el("text", { x: lx, y: cy + barH / 2 + 17, "class": "sub-note" }, spec.shareOf[ci]));
      }
    }

    if (spec.caption) svg.appendChild(el("text", { x: m.l, y: H - 4, "class": "sub-note" }, spec.caption));
  }
  function maxArr(a) { return Math.max.apply(null, a); }

  /* ============================================================
     GRAFIK GARIS — satu atau beberapa seri, area wash pada seri 0,
     crosshair menyasar X
     ============================================================ */
  function renderLine(host, spec) {
    var W = 720, H = spec.h || 300;
    var m = { t: 26, r: spec.rightPad || 78, b: 34, l: spec.leftPad || 54 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var n = spec.categories.length, s = spec.series.length;
    var scale = niceScale(0, spec.yMax, 5);
    var series = spec.series.map(function (sr, i) { return { name: sr.name, color: sr.color || C.series(i) }; });

    host.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    svg.setAttribute("aria-label", spec.aria || spec.title || "");
    host.appendChild(svg);
    var plot = { x: m.l, y: m.t, w: pw, h: ph };
    drawYAxis(svg, plot, scale, spec.tickFmt || fmtInt, spec.unit);

    var xs = [];
    for (var i = 0; i < n; i++) xs.push(n === 1 ? m.l + pw / 2 : m.l + i * pw / (n - 1));
    var ys = function (v) { return m.t + ph - (v - scale.lo) / (scale.hi - scale.lo) * ph; };

    for (var si = 0; si < s; si++) {
      var vals = spec.values[si];
      /* area wash 10% hanya untuk seri pertama */
      if (si === 0 && spec.area !== false) {
        var d = "M" + xs[0] + "," + (m.t + ph);
        for (var k = 0; k < n; k++) d += " L" + xs[k] + "," + ys(vals[k]);
        d += " L" + xs[n - 1] + "," + (m.t + ph) + " Z";
        svg.appendChild(el("path", { d: d, fill: series[si].color, "class": "series-area" }));
      }
      var pd = "M" + xs[0] + "," + ys(vals[0]);
      for (var k2 = 1; k2 < n; k2++) pd += " L" + xs[k2] + "," + ys(vals[k2]);
      svg.appendChild(el("path", { d: pd, stroke: series[si].color, "class": "series-line" }));

      for (var k3 = 0; k3 < n; k3++) {
        if (vals[k3] == null) continue;
        skip: {
          if (spec.sparseDots && spec.sparseDots.indexOf(k3) === -1) break skip;
          svg.appendChild(el("circle", {
            cx: xs[k3], cy: ys(vals[k3]), r: spec.dotR || 4,
            fill: series[si].color, "class": "series-dot-ring",
            stroke: C.surface(), "stroke-width": 2
          }));
        }
      }

      /* label nilai pada titik yang diminta (default: titik terakhir) */
      var labelIdx = spec.labelIdx ? spec.labelIdx(si) : (si === 0 ? [n - 1] : []);
      for (var li = 0; li < labelIdx.length; li++) {
        var idx = labelIdx[li];
        var ly = ys(vals[idx]);
        var lx = xs[idx];
        var anchor = (idx === n - 1) ? "end" : "middle";
        var off = (idx === n - 1) ? -10 : 0;
        var t = el("text", {
          x: lx + off, y: ly - 11, "text-anchor": anchor, "class": "end-label", fill: series[si].color
        }, spec.valueFmt(vals[idx], si));
        svg.appendChild(t);
      }
    }

    /* label kategori pada sumbu X */
    var step = Math.ceil(n / 10);
    for (var ci = 0; ci < n; ci += step) {
      var textAlign = ci === 0 ? "start" : (ci >= n - 1 ? "end" : "middle");
      var xOff = ci === 0 ? 0 : (ci >= n - 1 ? 0 : 0);
      svg.appendChild(el("text", { x: xs[ci] + xOff, y: m.t + ph + 18, "text-anchor": textAlign, "class": "cat-label" }, spec.categories[ci]));
    }

    /* ambang batas */
    if (spec.thresholds) {
      for (var ti = 0; ti < spec.thresholds.length; ti++) {
        var th = spec.thresholds[ti];
        var ty = ys(th.value);
        if (ty < m.t - 2 || ty > m.t + ph + 2) continue;
        svg.appendChild(el("line", { x1: m.l, x2: m.l + pw, y1: ty, y2: ty, "class": "threshold-line" }));
        svg.appendChild(el("text", { x: m.l + pw - 3, y: ty - 6, "text-anchor": "end", "class": "threshold-label" }, th.label));
      }
    }

    /* crosshair */
    var cross = el("line", { x1: 0, x2: 0, y1: m.t, y2: m.t + ph, stroke: C.ink2(), "stroke-width": 1, opacity: 0, "stroke-dasharray": "3 3" });
    svg.appendChild(cross);
    var focusDots = [];
    for (var fi = 0; fi < s; fi++) {
      var fd = el("circle", { r: 5.5, fill: series[fi].color, stroke: C.surface(), "stroke-width": 2, opacity: 0 });
      focusDots.push(fd);
      svg.appendChild(fd);
    }

    function nearest(ev) {
      var rect = svg.getBoundingClientRect();
      var mx = (ev.clientX - rect.left) / rect.width * W;
      var best = 0, bd = 1e9;
      for (var i2 = 0; i2 < n; i2++) {
        var d2 = Math.abs(xs[i2] - mx);
        if (d2 < bd) { bd = d2; best = i2; }
      }
      return best;
    }
    var overlay = el("rect", { x: m.l - 8, y: m.t - 8, width: pw + 16, height: ph + 16, "class": "hit-area", tabindex: "0" });
    svg.appendChild(overlay);
    overlay.setAttribute("aria-label", "Grafik garis. Gunakan tab untuk menelusuri titik data.");
    function focus(idx, ev) {
      cross.setAttribute("x1", xs[idx]); cross.setAttribute("x2", xs[idx]);
      cross.setAttribute("opacity", 1);
      var rows2 = [];
      for (var fi2 = 0; fi2 < s; fi2++) {
        var v = spec.values[fi2][idx];
        focusDots[fi2].setAttribute("cx", xs[idx]);
        focusDots[fi2].setAttribute("cy", ys(v));
        focusDots[fi2].setAttribute("opacity", 1);
        rows2.push({ name: series[fi2].name, color: series[fi2].color, value: spec.valueFmt(v, fi2) });
      }
      if (ev) placeAtPoint(ev.clientX, ev.clientY, spec.categories[idx], rows2);
      else {
        var rect2 = svg.getBoundingClientRect();
        placeAtPoint(rect2.left + (xs[idx] / W) * rect2.width, rect2.top + (m.t / H) * rect2.height, spec.categories[idx], rows2);
      }
    }
    overlay.addEventListener("pointermove", function (ev) { focus(nearest(ev), ev); });
    overlay.addEventListener("pointerleave", function () {
      cross.setAttribute("opacity", 0);
      for (var i3 = 0; i3 < s; i3++) focusDots[i3].setAttribute("opacity", 0);
      hideTip();
    });
    overlay.addEventListener("focus", function () { focus(n - 1); });
    overlay.addEventListener("blur", function () {
      cross.setAttribute("opacity", 0);
      for (var i4 = 0; i4 < s; i4++) focusDots[i4].setAttribute("opacity", 0);
      hideTip();
    });

    if (s > 1) drawLegend(svg, series, m.l, m.t - 12, true);
    if (spec.caption) svg.appendChild(el("text", { x: m.l, y: H - 4, "class": "sub-note" }, spec.caption));
  }

  /* ============================================================
     METER
     ============================================================ */
  function renderMeters(host, spec) {
    host.innerHTML = "";
    for (var i = 0; i < spec.meters.length; i++) {
      var m = spec.meters[i];
      var node = document.createElement("div");
      node.className = "meter";
      var top = document.createElement("div");
      top.className = "meter-top";
      var nm = document.createElement("p");
      nm.className = "meter-name";
      nm.textContent = m.name;
      var vl = document.createElement("p");
      vl.className = "meter-num";
      vl.textContent = m.display;
      top.appendChild(nm); top.appendChild(vl);
      node.appendChild(top);

      var track = document.createElement("div");
      track.className = "meter-track";
      var fill = document.createElement("div");
      fill.className = "meter-fill";
      fill.style.width = Math.min(100, m.pct) + "%";
      fill.style.background = m.color || C.series(0);
      track.appendChild(fill);
      m.bands.forEach(function (b) {
        var band = document.createElement("div");
        band.className = "meter-band";
        band.style.left = b.from + "%";
        band.style.width = (b.to - b.from) + "%";
        track.appendChild(band);
      });
      node.appendChild(track);

      var scaleEl = document.createElement("div");
      scaleEl.className = "meter-scale";
      scaleEl.textContent = "0%";
      var end = document.createElement("span");
      end.textContent = "100%";
      scaleEl.appendChild(end);
      node.appendChild(scaleEl);

      if (m.note) {
        var nt = document.createElement("p");
        nt.className = "meter-note";
        nt.textContent = m.note;
        node.appendChild(nt);
      }
      host.appendChild(node);
    }
  }

  /* ============================================================
     TABEL KEMBAR
     ============================================================ */
  function renderTable(host, spec) {
    host.innerHTML = "";
    var tbl = document.createElement("table");
    var caption = document.createElement("caption");
    caption.textContent = spec.caption || spec.title;
    tbl.appendChild(caption);
    var thead = document.createElement("thead");
    var htr = document.createElement("tr");
    var th0 = document.createElement("th");
    th0.scope = "col";
    th0.textContent = spec.colName || "Periode";
    htr.appendChild(th0);
    spec.series.forEach(function (sr) {
      var th = document.createElement("th");
      th.scope = "col";
      th.textContent = sr.name;
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    tbl.appendChild(thead);
    var tbody = document.createElement("tbody");
    for (var i = 0; i < spec.categories.length; i++) {
      var tr = document.createElement("tr");
      var td0 = document.createElement("th");
      td0.scope = "row";
      td0.textContent = spec.categories[i];
      tr.appendChild(td0);
      for (var j = 0; j < spec.series.length; j++) {
        var td = document.createElement("td");
        var v = spec.values[j][i];
        td.textContent = v == null ? "—" : spec.cellFmt ? spec.cellFmt(v, j) : String(v);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    if (spec.foot) {
      var tfoot = document.createElement("tfoot");
      var ftr = document.createElement("tr");
      var fth = document.createElement("th");
      fth.textContent = spec.foot.label;
      ftr.appendChild(fth);
      for (var k = 0; k < spec.series.length; k++) {
        var ftd = document.createElement("td");
        ftd.textContent = spec.foot.values[k];
        ftr.appendChild(ftd);
      }
      tfoot.appendChild(ftr);
      tbl.appendChild(tfoot);
    }
    host.appendChild(tbl);
  }

  /* ============================================================
     DATA
     ============================================================ */
  var D = {};

  /* ---- Tabel 3.1 — jumlah koperasi aktif ---- */
  D.koperasi = {
    categories: ["2021", "2022", "2023", "2024"],
    series: [{ name: "Koperasi aktif (unit)" }],
    values: [[127846, 130354, 130119, 131617]],
    yMax: 135000,
    cellFmt: function (v) { return fmtInt(v) + " unit"; },
    foot: { label: "Perubahan 2021→2024", values: ["+3.771 unit (+2,95%)"] }
  };

  /* ---- §3.1 — komposisi pekerja per jenis koperasi (Des 2025) ---- */
  D.komposisi = {
    categories: ["Simpan Pinjam", "Konsumen", "Produsen", "Jasa", "Pemasaran", "Desa & Kelurahan Merah Putih"],
    series: [{ name: "Pekerja" }],
    values: [[127534, 84806, 27527, 16891, 3970, 157]],
    yMax: 140000,
    tallLabels: true,
    cellFmt: function (v) { return fmtInt(v) + " orang"; },
    foot: { label: "Total", values: ["260.885 orang"] }
  };

  /* ---- Tabel 3.4 — adopsi platform KDKMP ---- */
  D.kdkmp = {
    categories: [
      "Kopdes Merah Putih berbadan hukum",
      "Memiliki akun Simkopdes",
      "Memperbarui informasi gerai",
      "Memperbarui profil microsite",
      "Mengajukan proposal kemitraan"
    ],
    series: [{ name: "Koperasi" }],
    values: [[81485, 42349, 9938, 9317, 368]],
    shareOf: [
      "100% (basis)",
      "51,9% dari yang berbadan hukum",
      "12,2%",
      "11,4%",
      "0,45% — 2.256 proposal diajukan"
    ],
    cellFmt: function (v) { return fmtInt(v); },
    foot: { label: "Titik potong", values: ["Data per 15 September 2025"] }
  };

  /* ---- Tabel 3.5 — QRIS diindeks (Smt I 2025 = 100) ---- */
  D.qris = (function () {
    var raw = {
      "Pengguna (juta)": [57, 66],
      "Merchant (juta)": [39.3, 44.86],
      "Jumlah transaksi (miliar)": [6.05, 12.55],
      "Nilai transaksi (Rp T)": [579, 600.69]
    };
    var cats = ["Semester I 2025", "Semester I 2026"];
    var names = Object.keys(raw);
    var idx = names.map(function (k) { return [100, raw[k][1] / raw[k][0] * 100]; });
    return {
      categories: cats,
      series: names.map(function (k) { return { name: k }; }),
      values: idx,
      yMax: 230,
      cellFmt: function (v, j) {
        var k = names[j], r = raw[k];
        var rawAt = v === 100 ? r[0] : r[1];
        return (k.indexOf("Rp T") > -1 ? "Rp " + fmtDec(rawAt, 2) + " T"
          : k.indexOf("juta") > -1 ? fmtDec(rawAt, rawAt < 100 ? 2 : 0).replace(",00", "") + " juta"
          : fmtDec(rawAt, 2) + " miliar") + "  (indeks " + fmtDec(v, 0) + ")";
      },
      tickFmt: function (v) { return fmtInt(v); },
      foot: { label: "Indeks", values: ["100 = Semester I 2025", "100 = Semester I 2025", "100 = Semester I 2025", "100 = Semester I 2025"] }
    };
  })();

  /* ---- §3.14.2 — BI-FAST ---- */
  D.bifast = {
    categories: ["Oktober 2025", "Triwulan II 2026"],
    series: [
      { name: "Jumlah transaksi (juta)" },
      { name: "Nilai transaksi (Rp T)" }
    ],
    values: [[446.77, 1530], [1115.09, 3777]],
    yMax: 4000,
    cellFmt: function (v, j) {
      return j === 0 ? fmtDec(v, 2).replace(",00", "") + " juta transaksi" : "Rp " + fmtDec(v, 2) + " T";
    },
    foot: { label: " pertumbuhan YoY", values: ["+31,96%", "+38,09%"] }
  };

  /* ---- §3.13/3.19 — jaringan fisik ---- */
  D.agen = {
    categories: ["Agen BRILink (BRI)", "Koperasi aktif (BPS)", "Penerima LPDB (koperasi)", "Agen BNI Agen46", "Kopdes MP kemitraan BRI"],
    series: [{ name: "Unit / titik" }],
    values: [[1200000, 131617, 3929, 226143, 306]],
    h: 300,
    leftPad: 216,
    tickFmt: function (v) { return compact(v); },
    cellFmt: function (v) { return fmtInt(v) + " unit"; },
    foot: { label: "Sumber", values: ["BRI, BPS, LPDB, BNI — periode berbeda, lihat subjudul"] }
  };

  /* ---- Tabel 3.6 — outstanding LPBBTI ---- */
  D.lpbbti = {
    categories: ["Jan 25", "Mar 25", "Apr 25", "Nov 25", "Des 25", "Mar 26", "Mei 26", "Jun 26", "Jul 26", "Agu 26"],
    series: [
      { name: "Outstanding (Rp T)" },
      { name: "Pertumbuhan YoY (%)" }
    ],
    values: [
      [78.50, 80.02, 80.94, 94.85, 96.62, 101.00, 103.73, 105.14, 105.63, 106.94],
      [null, 28.72, 29.01, 25.45, 25.44, 26.00, 25.60, 25.88, 24.76, 22.07]
    ],
    yMax: 115,
    h: 320,
    cellFmt: function (v, j) {
      if (v == null) return "—";
      return j === 0 ? "Rp " + fmtDec(v, 2) + " T" : fmtDec(v, 2) + "%";
    },
    foot: { label: "Periode", values: ["Januari 2025 — Agustus 2026 (jarak antar titik tidak sama)"] }
  };

  /* ---- Tabel 3.6 — TWP90 ---- */
  D.twp = {
    categories: ["Mar 25", "Apr 25", "Nov 25", "Des 25", "Jun 26", "Agu 26"],
    series: [{ name: "TWP90 (%)" }],
    values: [[2.70, 2.93, 4.33, 4.32, 4.26, 4.73]],
    yMax: 5.5,
    h: 260,
    leftPad: 44,
    thresholds: [{ value: 5, label: "Batas maksimal OJK 5,00%" }],
    cellFmt: function (v) { return fmtDec(v, 2) + "%"; },
    foot: { label: "Sumber", values: ["OJK, tambah analisis makalah §3.18.2"] }
  };

  /* ---- Tabel 3.8 — SNLIK ---- */
  D.snlik = {
    categories: ["2024", "2025", "2026"],
    series: [{ name: "Literasi keuangan (%)" }, { name: "Inklusi keuangan (%)" }],
    values: [[65.43, 66.46, 69.57], [75.02, 80.51, 93.61]],
    yMax: 100,
    cellFmt: function (v) { return fmtDec(v, 2) + "%"; },
    foot: { label: "Metode", values: ["Metode Keberlanjutan (2025) — lihat catatan data"] }
  };

  /* ---- §3.18.3–3.18.4 — meter ---- */
  D.meters = {
    meters: [
      {
        name: "Pendanaan industri pindar dari perbankan",
        display: "75,59%",
        pct: 75.59,
        color: null,
        bands: [],
        note: "April 2026 — Rp 66,25 triliun dari total pendanaan. Lender individu hanya Rp 3,33 triliun (3,8%). Model telah bergeser dari crowdfunding rakyat ke saluran distribusi kredit perbankan."
      },
      {
        name: "Porsi pembiayaan ke sektor produktif/UMKM",
        display: "35,38% (Apr 2025)",
        pct: 35.38,
        color: null,
        bands: [{ from: 40, to: 50 }],
        note: "Pita terarsir: target Fase 2 roadmap OJK (40–50%, 2025–2026). Capaian 35,38% (Rp 28,63 T, April 2025) masih di bawah ambang minimum. Per November 2024 baru 30,91%."
      }
    ]
  };

  /* ============================================================
     PASANG
   ============================================================ */
  function renderAll() {
    var set = function (id, fn, spec) {
      var host = document.getElementById(id);
      if (!host) return;
      fn(host, spec);
    };

    set("viz-koperasi", renderColumn, Object.assign({
      title: "Jumlah koperasi aktif",
      leftPad: 64,
      labelEndOnly: false,
      labelAll: function () { return true; },
      tickFmt: function (v) { return compact(v); }
    }, D.twin(D.koperasi, "Jumlah koperasi aktif"),
      { unit: "jumlah unit (BPS, per Desember tiap tahun)" }));

    set("viz-komposisi", renderColumn, Object.assign({
      title: "Komposisi tenaga kerja koperasi",
      leftPad: 56,
      tallLabels: true,
      labelAll: function (si, ci) { return [0, 1, 2].indexOf(ci) > -1; },
      tickFmt: function (v) { return compact(v); }
    }, D.twin(D.komposisi, "Tenaga kerja per jenis koperasi", false),
      { unit: "orang (Kemenkop, Desember 2025)" }));

    set("viz-kdkmp", renderBars, Object.assign({
      title: "Adopsi digital Kopdes Merah Putih",
      barColor: C.series(0),
      valueFmt: function (v) { return fmtInt(v); },
      tickFmt: function (v) { return compact(v); },
      caption: "Data per 15 September 2025 — Kemenkop."
    }, D.twin(D.kdkmp, "Adopsi digital KDKMP")));

    set("viz-qris", renderColumn, Object.assign({
      title: "QRIS terindeks",
      leftPad: 52,
      labelEndOnly: false,
      labelAll: function (si, ci) { return ci === 1; },
      tickFmt: function (v) { return fmtInt(v); },
      valueFmt: function (v) { return fmtDec(v, 0); }
    }, D.twin(D.qris, "QRIS terindeks"),
      { unit: "indeks (Semester I 2025 = 100)" }));

    set("viz-bifast", renderColumn, Object.assign({
      title: "BI-FAST",
      leftPad: 60,
      labelEndOnly: false,
      labelAll: function () { return true; },
      tickFmt: function (v) { return compact(v); },
      valueFmt: function (v) { return compact(v); }
    }, D.twin(D.bifast, "BI-FAST"),
      { unit: "satuan berbeda — lihat legenda" }));

    set("viz-agen", renderBars, Object.assign({
      title: "Jaringan agen dan koperasi",
      leftPad: 250,
      valueFmt: function (v) { return fmtInt(v); },
      tickFmt: function (v) { return compact(v); },
      caption: "Periode pelaporan berbeda-beda (2005–2026); grafik membandingkan skala, bukan tren waktu.",
      h: 300
    }, D.twin(D.agen, "Jaringan agen dan koperasi")));

    set("viz-lpbbti", renderLine, Object.assign({
      title: "Outstanding LPBBTI",
      leftPad: 58,
      sparseDots: null,
      valueFmt: function (v, si) { return si === 0 ? "Rp " + fmtDec(v, 2) + " T" : fmtDec(v, 2) + "%"; },
      tickFmt: function (v) { return fmtInt(v); },
      labelIdx: function (si) { return si === 0 ? [9] : []; },
      caption: "Garis abu-abu putus-putus menandai titik data; jarak antar periode sebenarnya tidak sama (1–7 bulan).",
      h: 330
    }, D.twin(D.lpbbti, "Outstanding LPBBTI", false)));

    set("viz-twp", renderLine, Object.assign({
      title: "TWP90",
      leftPad: 46,
      valueFmt: function (v) { return fmtDec(v, 2) + "%"; },
      tickFmt: function (v) { return fmtDec(v, 1).replace(",0", "") + "%"; },
      labelIdx: function () { return [5]; },
      thresholds: [{ value: 5, label: "Batas maksimal OJK: 5,00%" }],
      caption: "Naik 2,03 poin dalam 17 bulan. OJK: batas maksimal TWP90 industri sebesar 5%.",
      h: 275
    }, D.twin(D.twp, "TWP90", false)));

    set("viz-snlik", renderColumn, Object.assign({
      title: "SNLIK",
      leftPad: 52,
      labelEndOnly: true,
      labelSeries: 1,
      tickFmt: function (v) { return fmtInt(v) + "%"; },
      valueFmt: function (v) { return fmtDec(v, 2) + "%"; }
    }, D.twin(D.snlik, "SNLIK"),
      { unit: "% penduduk usia 15–79 tahun" }));

    set("viz-meters", renderMeters, D.meters);
  }

  /* ---- jembatan data grafik <-> tabel ----
     grafik pakai skala indeks untuk QRIS; tabel memakai nilai mentah.
     twin() memakai data apa adanya (cellFmt menangani konversi). */
  D.twin = function (spec, caption, useScaleValues) {
    return {
      categories: spec.categories,
      series: spec.series,
      values: spec.values,
      cellFmt: spec.cellFmt,
      caption: caption,
      foot: spec.foot
    };
  };

  /* ============================================================
     KONTROL
   ============================================================ */
  /* pasang tabel kembar */
  function setupToggles() {
    var buttons = document.querySelectorAll(".data-toggle");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var target = document.getElementById(btn.getAttribute("data-table"));
          if (!target) return;
          var wrap = target.parentElement;
          var open = wrap.classList.toggle("is-open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = open ? "Sembunyikan tabel" : "Tampilkan tabel";
        });
      })(buttons[i]);
    }
  }

  /* saring bagian */
  function setupFilters() {
    var chips = document.querySelectorAll("[data-filter]");
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        for (var j = 0; j < chips.length; j++) {
          chips[j].classList.remove("is-active");
          chips[j].setAttribute("aria-pressed", "false");
        }
        this.classList.add("is-active");
        this.setAttribute("aria-pressed", "true");
        document.body.dataset.filter = this.getAttribute("data-filter");
      });
    }
  }

  /* tema */
  function setupTheme() {
    var buttons = document.querySelectorAll("[data-theme-set]");
    function apply(name) {
      document.body.dataset.theme = name;
      localStorage.setItem("viz-theme", name);
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var on = b.getAttribute("data-theme-set") === name;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
      renderAll();
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () { apply(this.getAttribute("data-theme-set")); });
    }
    var saved = localStorage.getItem("viz-theme");
    apply(saved || "auto");
    if (!saved) apply("auto"); /* pastikan render awal */
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (document.body.dataset.theme === "auto") renderAll();
    });
  }

  /* ============================================================
     JALANKAN
   ============================================================ */
  document.body.dataset.filter = "all";
  setupToggles();
  setupFilters();
  setupTheme();
})();
