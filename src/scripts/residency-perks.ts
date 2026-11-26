const directory = document.querySelector<HTMLElement>(".residency-perks-page");

if (directory) {
  const form = directory.querySelector<HTMLFormElement>(".filter-form")!;
  const search = directory.querySelector<HTMLInputElement>("#perk-search")!;
  const list = directory.querySelector<HTMLElement>(".perk-list")!;
  const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-perk-id]"));
  const filters = Array.from(form.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const sortOptions = Array.from(form.querySelectorAll<HTMLInputElement>("[name=sort]"));
  const count = directory.querySelector<HTMLElement>("#result-count")!;
  const empty = directory.querySelector<HTMLElement>(".empty-state")!;
  const reset = directory.querySelector<HTMLButtonElement>("[data-reset]")!;
  let category = "";
  let sort = "alphabetical";

  function update(updateUrl = true) {
    const words = search.value.toLowerCase().trim().split(/\s+/);
    let visible = 0;
    for (const row of rows) {
      row.hidden = Boolean(category && row.dataset.category !== category) || !words.every(word => row.dataset.search!.includes(word));
      if (row.hidden) row.querySelector("details")!.open = false;
      else visible += 1;
    }
    for (const button of filters) {
      const selected = button.dataset.filter === category;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    for (const option of sortOptions) option.checked = option.value === sort;
    rows.sort((a, b) =>
      (sort === "category" ? Number(a.dataset.categoryOrder) - Number(b.dataset.categoryOrder) : 0)
      || Number(a.dataset.nameOrder) - Number(b.dataset.nameOrder),
    );
    list.append(...rows);
    count.textContent = `${visible} ${visible === 1 ? "partner" : "partners"}`;
    empty.hidden = visible > 0;
    if (updateUrl) {
      const url = new URL(location.href);
      for (const [key, value] of [["q", search.value.trim()], ["category", category], ["sort", sort === "category" ? sort : ""]]) {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      history.replaceState(null, "", url);
    }
  }

  function restore() {
    const url = new URL(location.href);
    search.value = url.searchParams.get("q") || "";
    category = filters.some(button => button.dataset.filter === url.searchParams.get("category")) ? url.searchParams.get("category")! : "";
    sort = url.searchParams.get("sort") === "category" ? "category" : "alphabetical";
    update(false);
    const selected = rows.find(row => `#${row.dataset.perkId}` === url.hash);
    if (selected && !selected.hidden) selected.querySelector("details")!.open = true;
  }

  search.addEventListener("input", () => update());
  form.addEventListener("submit", event => { event.preventDefault(); update(); });
  filters.forEach(button => button.addEventListener("click", () => { category = button.dataset.filter!; update(); }));
  sortOptions.forEach(option => option.addEventListener("change", () => { if (option.checked) { sort = option.value; update(); } }));
  reset.addEventListener("click", () => { search.value = ""; category = ""; update(); search.focus(); });
  window.addEventListener("popstate", restore);
  restore();
  form.hidden = false;
}
