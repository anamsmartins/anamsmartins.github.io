// =====================
// Generate Project Cards
// =====================
function renderProjects() {
  const container = document.getElementById("projects-container");
  container.innerHTML = ""; // Clear existing content
  projects.forEach((proj) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4 project-card";
    col.setAttribute("data-tags", proj.tags.join(" "));

    col.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${proj.title}</h5>
                    <p class="card-text">${proj.description}</p>
                    <div class="project-tags">
                        ${proj.tags.map((tag) => `<span>${tag}</span>`).join(" ")}
                    </div>
                    <a href="${proj.link}" class="btn btn-sm mt-2">View Project</a>
                </div>
            </div>
        `;
    container.appendChild(col);
  });
}

// =====================
// Filter Functionality
// =====================
function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-buttons button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      // Filter projects first
      const filteredProjects =
        filter === "all"
          ? projects
          : projects.filter((p) => p.tags.includes(filter));

      // Re-render carousel with filtered projects
      renderCarouselProjects(filteredProjects);
    });
  });
}

function renderCarouselProjects(projectArray = projects) {
  const carouselInner = document.getElementById("carousel-inner");
  const indicators = document.getElementById("carousel-indicators");

  carouselInner.innerHTML = "";
  indicators.innerHTML = "";

  const chunkSize = 3;
  let slideIndex = 0;

  for (let i = 0; i < projectArray.length; i += chunkSize) {
    const slideProjects = projectArray.slice(i, i + chunkSize);
    const isActive = slideIndex === 0 ? "active" : "";

    // ----- INDICATOR -----
    const indicator = document.createElement("li");
    indicator.setAttribute("data-target", "#projects-carousel");
    indicator.setAttribute("data-slide-to", slideIndex);
    indicator.className = isActive;
    indicators.appendChild(indicator);

    // ----- SLIDE -----
    const slide = document.createElement("div");
    slide.className = `carousel-item ${isActive}`;

    const row = document.createElement("div");
    row.className = "row";

    slideProjects.forEach((proj) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-3";

      col.innerHTML = `
                <div class="card shadow-sm project-card">
                    <div class="card-body project-card-body">
                        <h5 class="card-title">${proj.title}</h5>
                        <p class="card-text">${proj.description}</p>
                        <div class="project-tags">
                            ${proj.tags.map((tag) => `<span>${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`).join(" ")}
                        </div>
                        <a href="${proj.link}" class="btn btn-outline-primary btn-sm mt-2" target="_blank">View Project</a>
                    </div>
                    <div class="wave"></div> 
                </div>
            `;
      row.appendChild(col);
    });

    slide.appendChild(row);
    carouselInner.appendChild(slide);
    slideIndex++;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCarouselProjects();
  setupFilters();
});
