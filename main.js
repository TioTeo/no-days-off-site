/// NoDaysOff — Responsive Header + Smooth Scroll
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

  // Auto-close on nav link click
  nav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      lockScroll(false);
    }
  });
})();
