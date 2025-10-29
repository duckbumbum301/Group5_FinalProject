import { RECIPES } from "../js/data.js";
let currentPage = 1;
const recipesPerPage = 9;

function renderRecipeCard(recipe) {
  const ingredients = recipe.items
    .map(
      (item) =>
        `<span style="background: #f0f9f4; color: #065f46; padding: 6px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">${item.match}</span>`
    )
    .join("");

  return `
          <div class="recipe-card" data-recipe-name="${recipe.name.replace(
            /"/g,
            "&quot;"
          )}" 
               style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); transition: transform 0.3s ease; cursor: pointer;" 
               onmouseover="this.style.transform='translateY(-8px)'" 
               onmouseout="this.style.transform='translateY(0)'">
            <div style="position: relative; padding-top: 66.67%; overflow: hidden;">
              <img src="${recipe.image}" 
                   alt="${recipe.name}" 
                   style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                   onerror="this.src='../images/brand/LogoVVV1.jpg';"
              />
            </div>
            <div style="padding: 24px;">
              <h3 style="font-size: 22px; font-weight: 700; color: #065f46; margin: 0 0 16px;">${
                recipe.name
              }</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${ingredients}
              </div>
              <button class="btn btn--pri add-recipe-btn" style="width: 100%; margin-top: 16px; padding: 12px;">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        `;
}

function renderPage(page) {
  const recipeGrid = document.getElementById("recipeGrid");
  if (!recipeGrid) return;

  const startIndex = (page - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const recipesToShow = RECIPES.slice(startIndex, endIndex);

  recipeGrid.innerHTML = recipesToShow
    .map((recipe) => renderRecipeCard(recipe))
    .join("");
}

function renderPagination() {
  const totalPages = Math.ceil(RECIPES.length / recipesPerPage);
  const pageNumbers = document.getElementById("pageNumbers");
  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (!pageNumbers) return;

  // Update page info
  if (pageInfo) {
    pageInfo.textContent = `Trang ${currentPage} của ${totalPages}`;
  }

  // Update navigation buttons
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? "0.5" : "1";
    prevBtn.style.cursor = currentPage === 1 ? "not-allowed" : "pointer";
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
    nextBtn.style.cursor =
      currentPage === totalPages ? "not-allowed" : "pointer";
  }

  // Render page number buttons
  let html = "";
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btnClass = i === currentPage ? "btn btn--pri" : "btn btn--outline";
    html += `<button class="${btnClass}" data-page="${i}">${i}</button>`;
  }

  pageNumbers.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderPage(currentPage);
  renderPagination();

  // Scroll to top of recipes section
  const section = document.getElementById("allRecipesSection");
  if (section) {
    window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
  }
}

window.selectRecipe = function (recipeName) {
  const input = document.getElementById("recipeInput");
  if (input) {
    input.value = recipeName;
    // Trigger add to cart
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderPage(currentPage);
  renderPagination();

  // Add event listeners for pagination controls
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const pageNumbers = document.getElementById("pageNumbers");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(RECIPES.length / recipesPerPage);
      if (currentPage < totalPages) goToPage(currentPage + 1);
    });
  }

  // Add event delegation for page number buttons
  if (pageNumbers) {
    pageNumbers.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-page]");
      if (btn) {
        const page = parseInt(btn.getAttribute("data-page"));
        if (page && page !== currentPage) {
          goToPage(page);
        }
      }
    });
  }

  // Add event delegation for recipe cards
  const recipeGrid = document.getElementById("recipeGrid");
  if (recipeGrid) {
    recipeGrid.addEventListener("click", (e) => {
      // Handle "Add to Cart" button clicks
      if (e.target.classList.contains("add-recipe-btn")) {
        e.stopPropagation();
        const card = e.target.closest(".recipe-card");
        const recipeName = card.getAttribute("data-recipe-name");
        if (recipeName) {
          selectRecipe(recipeName);
        }
      }

      // Handle card clicks to select recipe
      if (e.target.closest(".recipe-card")) {
        const card = e.target.closest(".recipe-card");
        const recipeName = card.getAttribute("data-recipe-name");
        if (recipeName && !e.target.classList.contains("add-recipe-btn")) {
          selectRecipe(recipeName);
        }
      }
    });
  }
});
