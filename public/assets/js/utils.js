(() => {
  const yearEl = document.getElementById("y");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
})();
