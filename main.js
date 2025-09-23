// main.js
(function () {
  const header = document.querySelector("header");
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");

  // subtle header shadow on scroll
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 6 ? "0 4px 14px rgba(0,0,0,.06)" : "none";
  };
  onScroll();
  window.addEventListener("scroll", onScroll);

  // lock/unlock page scroll when menu opens
  const lockScroll = (locked) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
  };

  // toggle mobile menu
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    lockScroll(open);
  });

  // close menu on any link click; allow normal navigation except for hash links
  nav?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    nav.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    lockScroll(false);
  });

  // highlight the current page link
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });
})();
