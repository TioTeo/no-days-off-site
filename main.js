// main.js
(function () {
  const header = document.querySelector("header");
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");

  // Add subtle header shadow on scroll
  const onScroll = () => {
    header.style.boxShadow =
      window.scrollY > 6 ? "0 4px 14px rgba(0,0,0,.06)" : "none";
  };
  onScroll();
  window.addEventListener("scroll", onScroll);

  // Toggle mobile menu
  const lockScroll = (locked) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
  };

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    lockScroll(open);
  });

  // Auto-close on nav link click & smooth scroll for hash links
  nav?.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // only intercept same-page hash links
    if (link.getAttribute("href").startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }

    // always close mobile nav after click
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    lockScroll(false);
  });

  // ✅ Highlight current page link
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll("nav a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
    // highlight index.html when you're on root domain
    if (!currentPage && link.getAttribute("href") === "index.html") {
      link.classList.add("active");
    }
  });
})();
