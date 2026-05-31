/* =====================================================================
   NDO Health homepage — interactions
   - builds the ring system (week rings, step rings, stat rings, coins,
     section-header progress rings) so the HTML stays lean
   - count-ups, scroll-reveal
   - the "Two Doors" cursor-following cards (HERO + FOOTER only)
   - mobile nav + header scroll shadow
   ===================================================================== */
(function () {
  "use strict";
  var GREEN = "#5E9472", IVORY = "#F3EEE0", GOLD = "#D6A24A";
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var SVGNS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------- a single progress ring (animates on reveal) ---------- */
  function makeRing(size, stroke, progress, color, track, delay) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r;
    var svg = svgEl("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size });
    svg.style.transform = "rotate(-90deg)";
    svg.appendChild(svgEl("circle", { cx: size/2, cy: size/2, r: r, fill: "none", stroke: track, "stroke-width": stroke }));
    var prog = svgEl("circle", { cx: size/2, cy: size/2, r: r, fill: "none", stroke: color, "stroke-width": stroke, "stroke-linecap": "round", "stroke-dasharray": c });
    prog.setAttribute("stroke-dashoffset", c);
    prog.style.transition = "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1) " + (delay || 0) + "s";
    prog.dataset.target = c * (1 - progress);
    svg.appendChild(prog);
    return svg;
  }
  function revealRings(scope) {
    scope.querySelectorAll("circle[data-target]").forEach(function (c) {
      c.setAttribute("stroke-dashoffset", c.dataset.target);
    });
  }

  /* ---------- week rings ---------- */
  var DAYS = ["M","T","W","T","F","S","S"];
  function buildWeek(el) {
    var dark = el.hasAttribute("data-dark");
    var mini = el.hasAttribute("data-mini");
    var pattern = el.getAttribute("data-week");
    var fills = pattern === "full" ? [1,1,1,1,1,1,1] : [1,1,1,1,1,.55,0];
    var ringColor = dark ? IVORY : GREEN;
    var track = dark ? "rgba(243,238,224,.16)" : "rgba(30,32,25,.10)";
    var size = mini ? 20 : (el.hasAttribute("data-hero") ? 52 : 42);
    var stroke = mini ? 3 : (el.hasAttribute("data-hero") ? 5 : 3.8);
    var showLabels = !mini;
    var days = document.createElement("div"); days.className = "days";
    days.style.gap = mini ? "9px" : "clamp(7px,.9vw,12px)";
    DAYS.forEach(function (d, i) {
      var col = document.createElement("div"); col.className = "day";
      var holder = document.createElement("div");
      holder.style.position = "relative"; holder.style.width = size + "px"; holder.style.height = size + "px";
      var ring = makeRing(size, stroke, fills[i], ringColor, track, .1 + i * .09);
      holder.appendChild(ring);
      if (fills[i] >= 1 && !mini) {
        var chk = svgEl("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size, fill: "none" });
        chk.style.position = "absolute"; chk.style.inset = "0"; chk.style.opacity = "0";
        chk.style.transition = "opacity .3s ease " + (.45 + i * .09) + "s";
        chk.classList.add("wk-check");
        chk.appendChild(svgEl("polyline", { points: (size*.34)+","+(size*.51)+" "+(size*.45)+","+(size*.62)+" "+(size*.66)+","+(size*.39), stroke: ringColor, "stroke-width": 2.9, "stroke-linecap": "round", "stroke-linejoin": "round" }));
        holder.appendChild(chk);
      }
      col.appendChild(holder);
      if (showLabels) { var lab = document.createElement("span"); lab.textContent = d; col.appendChild(lab); }
      days.appendChild(col);
    });
    el.appendChild(days);
    // streak block (HiW beat)
    if (el.hasAttribute("data-streak")) {
      var div = document.createElement("div"); div.className = "div"; el.appendChild(div);
      var s = document.createElement("div"); s.className = "streak";
      s.innerHTML = '<b><span data-countup="' + el.getAttribute("data-streak") + '">0</span><i>WK</i></b><small>CURRENT STREAK</small>';
      el.appendChild(s);
    }
  }

  /* ---------- step rings (How it works) ---------- */
  function buildSteps() {
    document.querySelectorAll(".step-ring").forEach(function (el) {
      var i = parseInt(el.getAttribute("data-step"), 10), total = 4;
      var last = i === total - 1, size = 80, stroke = 4.5;
      var color = last ? GOLD : GREEN, numCol = last ? "#A9792B" : "#1E2019";
      el.appendChild(makeRing(size, stroke, (i + 1) / total, color, "rgba(30,32,25,.10)", .15 + i * .13));
      var num = document.createElement("div"); num.className = "num"; num.textContent = i + 1; num.style.color = numCol;
      el.appendChild(num);
    });
  }

  /* ---------- stat strip (HiW compound) ---------- */
  var STATS = [
    { label: "BALANCE", value: 18920, unit: "PTS", progress: .86, caption: "Compounding", delta: "+340 ↑", gold: true },
    { label: "STREAK", value: 18, unit: "WKS", progress: .69, caption: "Unbroken", delta: "+1 ↑", gold: false },
    { label: "ADHERENCE", value: 92, unit: "%", progress: .92, caption: "Plan done", delta: "+4 ↑", gold: false }
  ];
  function buildStats() {
    document.querySelectorAll("[data-stats]").forEach(function (el) {
      STATS.forEach(function (s, i) {
        var col = document.createElement("div"); col.className = "statcol" + (s.gold ? " gold" : "");
        var ring = makeRing(36, 5, s.progress, IVORY, "rgba(243,238,224,.16)", .1 + i * .12);
        var top = document.createElement("div"); top.className = "top";
        var lbl = document.createElement("span"); lbl.className = "lbl"; lbl.textContent = s.label;
        top.appendChild(lbl); top.appendChild(ring);
        var fig = document.createElement("div"); fig.className = "fig";
        fig.innerHTML = '<b><span data-countup="' + s.value + '"' + (s.value > 999 ? ' data-comma' : '') + '>0</span></b><small>' + s.unit + '</small>';
        var sub = document.createElement("div"); sub.className = "sub";
        sub.innerHTML = '<span class="cap">' + s.caption + '</span><span class="delta">' + s.delta + '</span>';
        col.appendChild(top); col.appendChild(fig); col.appendChild(sub);
        el.appendChild(col);
      });
    });
  }

  /* ---------- reward coins (HiW earn) ---------- */
  function buildCoins() {
    document.querySelectorAll("[data-rewards]").forEach(function (el) {
      // earned coin
      var c1 = document.createElement("div"); c1.className = "coin";
      c1.innerHTML = '<div class="disc"><div class="earned"><span class="star">★</span><span class="e">EARNED</span></div></div>' +
        '<div><div class="label">Free 1:1 Session</div><div class="req earned-txt">★ EARNED · 12-WK</div></div>' +
        '<a href="reserve.html" class="btn btn--accent btn--sm"><span>Claim reward <span class="arrow">→</span></span></a>';
      el.appendChild(c1);
      // locked coin
      var c2 = document.createElement("div"); c2.className = "coin";
      var disc = document.createElement("div"); disc.className = "disc";
      var ring = makeRing(104, 5, .67, IVORY, "rgba(243,238,224,.16)", .2);
      ring.querySelector("circle").setAttribute("fill", "#1E3A2C"); // filled face on track circle
      disc.appendChild(ring);
      var face = document.createElement("div"); face.className = "lockface";
      face.innerHTML = '<span class="n">08/12</span><span class="l">LOCKED</span>';
      disc.appendChild(face);
      c2.appendChild(disc);
      var meta = document.createElement("div");
      meta.innerHTML = '<div class="label">Supplement Drop</div><div class="req">12-WEEK STREAK</div>';
      c2.appendChild(meta);
      var keep = document.createElement("div"); keep.className = "keep"; keep.textContent = "KEEP DEPOSITING";
      c2.appendChild(keep);
      el.appendChild(c2);
    });
  }

  /* ---------- section-header progress rings ---------- */
  function buildHeaderRings() {
    document.querySelectorAll(".hring").forEach(function (el) {
      var idx = parseInt(el.getAttribute("data-idx"), 10), total = parseInt(el.getAttribute("data-total"), 10);
      var complete = idx >= total, color = complete ? GOLD : GREEN;
      el.appendChild(makeRing(60, 4, idx / total, color, "rgba(30,32,25,.12)", .1));
      var frac = document.createElement("div"); frac.className = "frac";
      frac.textContent = ("0" + idx).slice(-2) + "/" + ("0" + total).slice(-2);
      frac.style.color = complete ? "#A9792B" : "#1E2019";
      el.appendChild(frac);
    });
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var target = parseInt(el.getAttribute("data-countup"), 10);
    var comma = el.hasAttribute("data-comma");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = comma ? target.toLocaleString() : target; return;
    }
    var dur = 1300, t0 = Date.now();
    var id = setInterval(function () {
      var p = clamp((Date.now() - t0) / dur, 0, 1);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = comma ? v.toLocaleString() : v;
      if (p >= 1) clearInterval(id);
    }, 33);
  }

  /* ---------- reveal (scroll-position based — fail-safe) ---------- */
  function setupReveal() {
    var els = [].slice.call(document.querySelectorAll(".rise, .section-header, [data-stats], [data-rewards]"));
    function revealOne(t) {
      t.classList.add("in");
      revealRings(t);
      t.querySelectorAll(".wk-check").forEach(function (c) { c.style.opacity = "1"; });
      t.querySelectorAll("[data-countup]").forEach(countUp);
    }
    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els = els.filter(function (t) {
        var r = t.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { revealOne(t); return false; }
        return true;
      });
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // safety net: if anything is still hidden after load, reveal it
    window.addEventListener("load", function () { setTimeout(check, 200); });
  }

  /* ---------- THE TWO DOORS — cursor-following cards ---------- */
  function setupDoors(stage, sides) {
    if (!stage) return;
    var mouse = { x: 0, y: 0, inside: false };
    var st = sides.map(function () { return { x: 0, y: 0, o: 0, tx: null, ty: null, placed: false }; });
    stage.addEventListener("mousemove", function (e) {
      var sr = stage.getBoundingClientRect();
      mouse = { x: e.clientX - sr.left, y: e.clientY - sr.top, inside: true };
    });
    stage.addEventListener("mouseleave", function () { mouse.inside = false; });

    function frame() {
      var sr = stage.getBoundingClientRect(), W = sr.width, H = sr.height;
      var yOf = function (el, edge) {
        if (!el) return 0; var r = el.getBoundingClientRect();
        return (edge === "bottom" ? r.bottom : r.top) - sr.top;
      };
      sides.forEach(function (side, i) {
        var s = st[i], node = side.card, hint = side.hint;
        if (!node) return;
        if (getComputedStyle(node).display === "none") { node.style.opacity = "0"; if (hint) hint.style.opacity = ".9"; return; }
        var fw = node.offsetWidth, fh = node.offsetHeight;
        var fb = {
          xMin: W * side.xMin, xMax: W * side.xMax,
          yMin: yOf(side.topEl, "bottom") + 16,
          yMax: yOf(side.botEl, "top") - 14
        };
        if (fb.yMax <= fb.yMin) fb.yMax = H - Math.min(168, H * .3);
        if (!s.placed && fw > 0) {
          s.x = (fb.xMin + fb.xMax) / 2 - fw / 2;
          s.y = clamp((fb.yMin + fb.yMax) / 2 - fh / 2, fb.yMin, Math.max(fb.yMin, fb.yMax - fh));
          s.placed = true;
        }
        var overForm = mouse.inside && mouse.x >= s.x - 10 && mouse.x <= s.x + fw + 10 && mouse.y >= s.y - 10 && mouse.y <= s.y + fh + 10;
        var inBand = mouse.inside && mouse.x >= fb.xMin && mouse.x <= fb.xMax && mouse.y >= fb.yMin && mouse.y <= fb.yMax;
        var active = inBand || (s.o > .5 && overForm);
        s.o += ((active ? 1 : 0) - s.o) * .16;
        if (active) {
          if (!overForm) {
            s.tx = clamp(mouse.x + 18, fb.xMin, Math.max(fb.xMin, fb.xMax - fw));
            s.ty = clamp(mouse.y - fh / 2, fb.yMin, Math.max(fb.yMin, fb.yMax - fh));
          }
          if (s.tx == null) { s.tx = s.x; s.ty = s.y; }
          s.x += (s.tx - s.x) * .17;
          s.y += (s.ty - s.y) * .17;
        }
        node.style.opacity = s.o.toFixed(3);
        node.style.transform = "translate3d(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px,0) scale(" + (.965 + .035 * s.o).toFixed(3) + ")";
        node.style.pointerEvents = s.o > .55 ? "auto" : "none";
        if (hint) hint.style.opacity = (.9 * (1 - s.o)).toFixed(3);
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function wireDoors() {
    var hero = document.getElementById("heroDoors");
    if (hero) {
      var hl = hero.querySelector(".door-light"), hd = hero.querySelector(".door-dark");
      setupDoors(hero, [
        { card: document.getElementById("cardL"), hint: document.getElementById("hintL"),
          topEl: hl.querySelector(".week"), botEl: hl.querySelector(".door-foot"), xMin: .045, xMax: .455 },
        { card: document.getElementById("cardR"), hint: document.getElementById("hintR"),
          topEl: hd.querySelector(".week"), botEl: hd.querySelector(".door-foot"), xMin: .545, xMax: .955 }
      ]);
    }
    var footer = document.getElementById("footerDoors");
    if (footer) {
      var fl = footer.querySelector(".door-light"), fr = footer.querySelector(".door-r");
      var base = footer.querySelector(".footer-baseline");
      setupDoors(footer, [
        { card: document.getElementById("fcardL"), hint: document.getElementById("fhintL"),
          topEl: fl.querySelector(".footer-content"), botEl: base, xMin: .045, xMax: .47 },
        { card: document.getElementById("fcardR"), hint: document.getElementById("fhintR"),
          topEl: fr.querySelector(".footer-content"), botEl: base, xMin: .53, xMax: .955 }
      ]);
    }
  }

  /* ---------- pills (toggle selected) ---------- */
  function wirePills() {
    document.querySelectorAll(".door-card .pills").forEach(function (group) {
      group.addEventListener("click", function (e) {
        var b = e.target.closest(".pill"); if (!b) return;
        group.querySelectorAll(".pill").forEach(function (p) { p.classList.toggle("sel", p === b); });
      });
    });
  }

  /* ---------- header scroll + mobile nav ---------- */
  function wireHeader() {
    var header = document.getElementById("siteHeader");
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 6); };
    onScroll(); window.addEventListener("scroll", onScroll);
    var toggle = document.getElementById("navToggle"), menu = document.getElementById("mobileMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        document.documentElement.style.overflow = open ? "hidden" : "";
      });
      menu.addEventListener("click", function (e) {
        var a = e.target.closest("a"); if (!a) return;
        menu.classList.remove("open"); toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false"); document.documentElement.style.overflow = "";
      });
    }
    // smooth-scroll same-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }
      });
    });
  }

  /* ---------- init ---------- */
  function init() {
    document.querySelectorAll("[data-week]").forEach(buildWeek);
    buildSteps(); buildStats(); buildCoins(); buildHeaderRings();
    setupReveal(); wireDoors(); wirePills(); wireHeader();
    // hero is above the fold — reveal immediately
    var hero = document.querySelector(".hero-doors");
    if (hero) { hero.classList.add("in"); revealRings(hero); hero.querySelectorAll(".wk-check").forEach(function (c){ c.style.opacity = "1"; }); hero.querySelectorAll("[data-countup]").forEach(countUp); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
