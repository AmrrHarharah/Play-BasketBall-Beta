/* =============================
   Helper selectors
   ============================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =============================
   Go Back Button
   ============================= */
function goBack() {
  window.history.back();
}

/* =============================
   Fade-in on Load
   ============================= */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("show");
});

/* =============================
   Parallax Hero Background
   ============================= */
document.addEventListener("scroll", () => {
  const bg = $(".hero-bg");
  if (!bg) return;
  const speed = bg.dataset.speed || 0.2;
  const y = window.scrollY * speed;
  bg.style.transform = `translateY(${y}px) scale(1.2)`;
});

/* =============================
   Mobile Navigation
   ============================= */
(function mobileNav() {
  const menuToggle = $("#menu-toggle");
  const mobileNav = $("#mobile-nav");

  if (!menuToggle || !mobileNav) return;

  menuToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    mobileNav.setAttribute("aria-hidden", (!open).toString());
    menuToggle.classList.toggle("active", open);
  });

  $$("#mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      mobileNav.setAttribute("aria-hidden", "true");
      menuToggle.classList.remove("active");
    }),
  );
})();

/* =============================
   Dark Mode (with storage)
   ============================= */
const DARK_KEY = "site-dark-mode";

(function initDarkMode() {
  const darkToggle = $("#dark-toggle");
  if (!darkToggle) return;

  const saved = localStorage.getItem(DARK_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (saved === "enabled" || (!saved && prefersDark)) {
    document.body.classList.add("dark");
  }

  darkToggle.addEventListener("click", () => {
    const on = document.body.classList.toggle("dark");
    localStorage.setItem(DARK_KEY, on ? "enabled" : "disabled");
    darkToggle.setAttribute("aria-pressed", String(on));
  });
})();

/* =============================
   Brand Auto-Scroll Loop
   ============================= */

/* =============================
   Animated Counters
   ============================= */
(function counters() {
  const els = $$(".count");
  if (!els.length) return;

  const runCounter = (el) => {
    const target = Number(el.dataset.target) || 0;
    const start = performance.now();
    const duration = 1500;
    const from = 0;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(from + (target - from) * eased);
      el.textContent = value.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          runCounter(en.target);
          o.unobserve(en.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  els.forEach((e) => obs.observe(e));
})();

/* =============================
   Tilt Hover for Testimonials & Pricing
   ============================= */
(function smallTilt() {
  const items = $$(".testi, .plan");
  if (!items.length) return;

  items.forEach((item) => {
    const orig = window.getComputedStyle(item).transform;
    item.dataset._orig = orig === "none" ? "" : orig;

    item.addEventListener("mousemove", (ev) => {
      const r = item.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (py - 0.5) * -6;
      item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
      item.style.transition = "transform 0.06s linear";
      item.style.boxShadow = "0 18px 40px rgba(0,0,0,0.12)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = item.dataset._orig || "";
      item.style.transition = "transform 0.4s cubic-bezier(.2,.9,.2,1)";
      item.style.boxShadow = "";
    });
  });
})();

/* =============================
   FAQ Accordion
   ============================= */
(function faqAccordion() {
  const toggles = $$(".acc-toggle");
  if (!toggles.length) return;

  toggles.forEach((btn) => {
    const panel = btn.nextElementSibling;
    panel.style.maxHeight = btn.classList.contains("open")
      ? panel.scrollHeight + "px"
      : "0px";

    btn.addEventListener("click", () => {
      const isOpen = btn.classList.contains("open");

      toggles.forEach((t) => {
        t.classList.remove("open");
        const p = t.nextElementSibling;
        if (p) p.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
})();

/* =============================
   Lightbox for Gallery
   ============================= */
(function lightbox() {
  const lb = $("#lightbox");
  const lbImg = $("#lightbox-img");
  if (!lb || !lbImg) return;

  const openLightbox = (src) => {
    lbImg.src = src;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  $$(".gallery-card").forEach((card) => {
    const src = card.dataset.img;
    if (!src) return;
    card.style.cursor = "zoom-in";
    card.addEventListener("click", () => openLightbox(src));
  });

  $$("img[data-light]").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img.src));
  });

  const close = () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  };

  $(".lightbox .close", lb)?.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* =============================
   Scroll Reveal Animation
   ============================= */
(function scrollReveal() {
  const elems = $$(
    ".section-title, .brand-item, .stat-card, .testi, .plan, .accordion-item",
  );
  if (!elems.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  elems.forEach((e) => obs.observe(e));
})();

/* =============================
   Footer Year
   ============================= */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =============================
   Pause animations when tab inactive
   ============================= */
document.addEventListener("visibilitychange", () => {
  document.documentElement.style.scrollBehavior = document.hidden
    ? "auto"
    : "smooth";
});

/* =============================
   Top Player Stories Modal
   ============================= */
const playerStories = {
  kobe: {
    title: "Kobe Bryant — The Mamba Mentality",
    text: `
Kobe Bryant dikenal sebagai simbol kerja keras, disiplin ekstrem, dan fokus tanpa kompromi.

• 5× NBA Champion
• 2008 MVP
• Salah satu scorer paling teknikal
• Filosofi “Mamba Mentality”
    `,
  },

  curry: {
    title: "Stephen Curry — The King of Shooting",
    text: `
Curry merevolusi basket modern lewat shooting jarak jauh.

• 4× NBA Champion
• 2× MVP
• All-time 3PT Leader
    `,
  },

  giannis: {
    title: "Giannis — From Nothing to MVP",
    text: `
Giannis tumbuh sebagai imigran miskin namun menjadi legenda.

• 2× MVP
• NBA Champion & Finals MVP (2021)
    `,
  },
};

(function storyModalSystem() {
  const storyModal = $("#story-modal");
  const storyTitle = $("#story-title");
  const storyText = $("#story-text");
  const storyClose = $("#story-close");

  if (!storyModal) return;

  $$(".story-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.player;
      const data = playerStories[id];
      if (!data) return;

      storyTitle.textContent = data.title;
      storyText.textContent = data.text;
      storyModal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  const close = () => {
    storyModal.classList.remove("open");
    document.body.style.overflow = "";
  };

  storyClose?.addEventListener("click", close);
  storyModal.addEventListener("click", (e) => {
    if (e.target === storyModal) close();
  });
})();

(function pageTransitionLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  const showLoader = () => {
    loader.classList.add("active");
    loader.setAttribute("aria-hidden", "false");
  };

  const hideLoader = () => {
    loader.classList.remove("active");
    loader.setAttribute("aria-hidden", "true");
  };

  const isSkippable = (href) =>
    !href ||
    href === "#" ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    if (link.target === "_blank") return;

    const href = link.getAttribute("href");
    if (isSkippable(href)) return;
    if (link.origin !== window.location.origin) return;

    showLoader();
    event.preventDefault();
    setTimeout(() => {
      window.location.href = href;
    }, 180);
  });

  window.addEventListener("pageshow", hideLoader);
  window.addEventListener("DOMContentLoaded", hideLoader);
})();
