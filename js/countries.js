const visitedCountries = ["PT"];
const dreamCountries = ["GR", "HW-1", "IT", "SE", "FR"];

fetch("svg/world.svg")
  .then((response) => response.text())
  .then((svg) => {
    const container = document.getElementById("world-map-container");
    container.innerHTML = svg;

    // Now the SVG is in the DOM, safe to add classes
    visitedCountries.forEach((code) => {
      container.querySelector(`#${code}`)?.classList.add("visited");
    });

    dreamCountries.forEach((code) => {
      container.querySelector(`#${code}`)?.classList.add("dream");
    });
  });

const tooltip = document.getElementById("map-tooltip");

document
  .getElementById("world-map-container")
  .addEventListener("mousemove", (e) => {
    const target = e.target;
    if (target.tagName === "path") {
      tooltip.textContent = target.getAttribute("name");
      tooltip.style.left = e.pageX + 10 + "px"; // offset from cursor
      tooltip.style.top = e.pageY + 10 + "px";
      tooltip.style.opacity = 1;
    } else {
      tooltip.style.opacity = 0;
    }
  });
