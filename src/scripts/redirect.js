const destination = document.querySelector("[data-redirect-destination]")?.getAttribute("href");

if (destination) {
  window.location.replace(`${destination}${window.location.search}${window.location.hash}`);
}
