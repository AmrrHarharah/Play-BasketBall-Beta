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
   Scroll Effects: progress bar, header blur, cards parallax
   - Lightweight, uses requestAnimationFrame and respects reduced-motion
   ============================= */
(function scrollEffects() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  // create progress bar
  let prog = document.getElementById("scroll-progress");
  if (!prog) {
    prog = document.createElement("div");
    prog.id = "scroll-progress";
    document.body.appendChild(prog);
  }

  const header = document.getElementById("site-header");
  const cards = document.getElementById("cards");

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY || window.pageYOffset;

      // progress
      const docH =
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        ) - window.innerHeight;
      const pct =
        docH > 0 ? Math.min(100, Math.max(0, (scrollY / docH) * 100)) : 0;
      prog.style.width = pct + "%";

      // header blur / shadow toggle
      if (header) header.classList.toggle("scrolled", scrollY > 18);

      // cards subtle parallax rotation: base -6deg plus small offset
      if (cards) {
        const base = -6;
        const rect = cards.getBoundingClientRect();
        const centerOffset =
          rect.top + rect.height / 2 - window.innerHeight / 2;
        const pctOff = Math.max(
          -1,
          Math.min(1, centerOffset / window.innerHeight),
        );
        const delta = pctOff * 6; // +/-6deg
        cards.style.transform = `rotate(${base + delta}deg)`;
      }

      ticking = false;
    });
  }

  // init and attach
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();

/* =============================
   Extra polish: ripple buttons, back-to-top, lazy img, tag parallax
   ============================= */
(function extras() {
  // lazy load images
  document.querySelectorAll("img").forEach((img) => {
    try {
      img.loading = "lazy";
    } catch (e) {}
  });

  // ripple effect for clickable elements
  const ripples = document.querySelectorAll(".btn, .cta, button, .icon-btn, a");
  ripples.forEach((el) => {
    el.classList.add("ripple");
    el.addEventListener("click", function (e) {
      const rect = el.getBoundingClientRect();
      const span = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.2;
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - rect.left - size / 2 + "px";
      span.style.top = e.clientY - rect.top - size / 2 + "px";
      span.style.transition = "transform 420ms ease, opacity 420ms ease";
      el.appendChild(span);
      requestAnimationFrame(() => (span.style.transform = "scale(1)"));
      setTimeout(() => {
        span.style.opacity = "0";
      }, 300);
      setTimeout(() => {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 760);
    });
  });

  // back to top
  const back = document.getElementById("back-to-top");
  if (back) {
    const onScrollBackToTop = () => {
      const show = window.scrollY > 500;
      back.classList.toggle("show", show);
    };
    back.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
    window.addEventListener("scroll", onScrollBackToTop, { passive: true });
    onScrollBackToTop();
  }

  // tag parallax handled on scrollEffects; enhance here by moving slightly on mousemove too
  const tags = $$(".tag");
  if (tags.length) {
    document.addEventListener(
      "mousemove",
      (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        tags.forEach((t) => {
          const speed = parseFloat(t.dataset.speed) || 1;
          const dx = (e.clientX - cx) * 0.01 * speed;
          const dy = (e.clientY - cy) * 0.008 * speed;
          if (
            t.classList.contains("tag-left") ||
            t.classList.contains("tag-right")
          ) {
            t.style.transform = `translateY(${dy}px)`;
          } else {
            t.style.transform = `translateX(-50%) translateY(${dy}px)`;
          }
        });
      },
      { passive: true },
    );
  }
})();

/* =============================
   Smooth transform-based scrolling (slowmo)
   - Wraps visual content in #smooth-wrap and lerps transform toward window.scrollY
   - Respects prefers-reduced-motion
   ============================= */
(function smoothScroller() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  const wrap = document.getElementById("smooth-wrap");
  if (!wrap) return;

  const setBodyHeight = () => {
    document.body.style.height = wrap.getBoundingClientRect().height + "px";
  };

  let current = 0;
  let target = 0;
  const ease = 0.08; // lower = stronger slowmo

  const onResize = () => setBodyHeight();

  const raf = () => {
    target = window.scrollY || window.pageYOffset;
    current += (target - current) * ease;
    const rounded = Math.round(current * 100) / 100;
    wrap.style.transform = `translate3d(0, ${-rounded}px, 0)`;
    requestAnimationFrame(raf);
  };

  // init
  setBodyHeight();
  window.addEventListener("resize", onResize);
  requestAnimationFrame(raf);
})();
/* =============================
   Mobile Navigation
   ============================= */
/* =============================
   Mobile Navigation (simple)
   - Beginner-friendly: no arrows, clear steps
*/
(function mobileNav() {
  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (!menuToggle || !mobileNav) return;

  var icon = menuToggle.querySelector("i");

  // helper to update toggle icon
  function setIcon(open) {
    if (!icon) return;
    // closed state shows basketball, open state shows close (x)
    icon.classList.toggle("fa-basketball-ball", !open);
    icon.classList.toggle("fa-times", open);
  }

  // helper to toggle body scrolling
  function updateBodyScroll(open) {
    document.body.style.overflow = open ? "hidden" : "";
  }

  // Toggle menu open / close
  menuToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.contains("open");
    if (isOpen) {
      mobileNav.classList.remove("open");

      menuToggle.classList.remove("open");
      updateBodyScroll(false);
    } else {
      mobileNav.classList.add("open");
    }
  });

  // click backdrop (panel itself) closes
  mobileNav.addEventListener("click", function (e) {
    if (e.target === mobileNav) {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
      setIcon(false);
      menuToggle.classList.remove("open");
      updateBodyScroll(false);
    }
  });

  // Close when a link is clicked
  var links = mobileNav.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
      setIcon(false);
      menuToggle.classList.remove("open");
    });
  }

  // Optional close button inside mobile menu
  var closeBtn = document.getElementById("mobile-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
      setIcon(false);
      menuToggle.classList.remove("open");
    });
  }
})();

/* =============================
   Dark Mode (with storage)
   ============================= */
const DARK_KEY = "site-dark-mode";
const NEON_KEY = "site-neon-theme";

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
    // If enabling dark mode, disable neon theme to avoid conflicting palettes
    if (on) {
      localStorage.setItem(NEON_KEY, "disabled");
      document.body.classList.remove("neon");
      const neonBtn = $("#neon-toggle");
      if (neonBtn) {
        neonBtn.setAttribute("aria-pressed", "false");
        neonBtn.classList.remove("active");
      }
    }
  });
})();

/* =============================
   Neon Theme (single vibrant theme)
   - Stored in localStorage under `site-neon-theme`
   - Enabling neon will disable dark mode to keep a single active theme
   ============================= */
(function initNeonTheme() {
  const neonToggle = $("#neon-toggle");
  if (!neonToggle) return;

  const saved = localStorage.getItem(NEON_KEY);

  if (saved === "enabled") {
    document.body.classList.add("neon");
    neonToggle.classList.add("active");
    neonToggle.setAttribute("aria-pressed", "true");
    // ensure dark is off when neon was saved on
    document.body.classList.remove("dark");
    localStorage.setItem(DARK_KEY, "disabled");
  }

  neonToggle.addEventListener("click", () => {
    const on = document.body.classList.toggle("neon");
    neonToggle.classList.toggle("active", on);
    neonToggle.setAttribute("aria-pressed", String(on));
    localStorage.setItem(NEON_KEY, on ? "enabled" : "disabled");

    if (on) {
      // switch off dark mode to avoid style conflicts
      document.body.classList.remove("dark");
      localStorage.setItem(DARK_KEY, "disabled");
      const darkBtn = $("#dark-toggle");
      if (darkBtn) darkBtn.setAttribute("aria-pressed", "false");
    }
  });
})();

/* =============================
   Brand Auto-Scroll Loop (Clean & Simple)
   ============================= */
(function brandAutoScroll() {
  const container = document.querySelector(".brand-container");
  const track = document.getElementById("brand-track");

  if (!container || !track) return;

  const items = track.querySelectorAll(".brand-item");
  if (items.length === 0) return;

  // Clone items 4 times for seamless infinite loop
  const cloneItems = () => {
    for (let i = 0; i < 4; i++) {
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
      });
    }
  };

  cloneItems();

  let position = 0;
  const speed = 0.15; // pixels per frame - reduced for smoother, slower animation
  const originalWidth = track.offsetWidth / 5; // 1/5 of total (5x items: original + 4 clones)

  const animate = () => {
    position -= speed;

    // Reset seamlessly when looped one set
    if (Math.abs(position) >= originalWidth) {
      position = 0;
    }

    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  };

  // Wait for layout to be ready
  setTimeout(() => {
    animate();
  }, 100);
})();

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
    ".section-title, .stat-card, .testi, .plan, .accordion-item",
  );
  if (!elems.length) return;
  // mark as revealable and use staggered reveal for a polished feel
  elems.forEach((el) => el.classList.add("reveal"));

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          // compute index for stagger (stable order)
          const list = Array.from(elems);
          const idx = list.indexOf(en.target);
          const delay = Math.min(10, Math.max(0, idx)) * 75; // ms
          setTimeout(() => {
            en.target.classList.add("visible");
          }, delay);
          o.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  elems.forEach((e) => obs.observe(e));
})();

/* =============================
   Custom cursor and anchor hash handling
   - Adds a small trailing cursor and enlarges over interactive elements
   - Intercepts internal hash links and scrolls to target (works with smooth wrapper)
   ============================= */
(function uiPolish() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  // create cursor elements
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  document.body.appendChild(cursor);

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let tx = cx;
  let ty = cy;
  const ease = 0.18;

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    cursor.style.opacity = "1";
  }

  function raf() {
    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(raf);
  }
  window.addEventListener("mousemove", onMove, { passive: true });
  requestAnimationFrame(raf);

  // enlarge cursor on interactive elements
  const interactive = "a, button, .cta, .btn, input, textarea, .card";
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("enlarge"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("enlarge"));
  });

  // anchor/hash handling so clicks jump properly when using smooth wrapper
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
      // update hash without jump
      history.replaceState(null, "", "#" + id);
    });
  });
})();

/* =============================
   Page Transition Loader
   ============================= */
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
