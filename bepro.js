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
