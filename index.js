document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://api.coingecko.com/api/v3/coins/markets";
  const params = {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: 10, // Number of coins per page
    page: 1,
  };

  const searchInput = document.getElementById("search");
  let debounceTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      params.page = 1;
      fetchCoins(searchInput.value);
    }, 300);
  });

  const fetchCoins = async (searchQuery = "") => {
    try {
      const response = await fetch(
        `${apiUrl}?vs_currency=${params.vs_currency}&order=${params.order}&per_page=${params.per_page}&page=${params.page}`
      );
      const data = await response.json();
      displayCoins(
        data.filter((coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setupPagination(5); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const displayCoins = (coins) => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const cryptoList = document.getElementById("crypto-list");
    cryptoList.innerHTML = coins
      .map((coin) => {
        const isFavorite = favorites.includes(coin.id);

        // Determine text color based on 24h change percentage
        let changeColor = "";
        if (coin.price_change_percentage_24h > 0) {
          changeColor = "green";
        } else if (coin.price_change_percentage_24h < 0) {
          changeColor = "red";
        }

        return `
                <tr class="crypto-item" onclick="window.location.href='coins.html?id=${
                  coin.id
                }'">
                    <td><img src="${coin.image}" alt="${
          coin.name
        }" width="30"></td>
                    <td>${coin.name}</td>
                    <td>$${coin.current_price}</td>
                    <td style="color: ${changeColor};">${coin.price_change_percentage_24h.toFixed(
          2
        )}%</td>
                    <td><button class="fav-button ${
                      isFavorite ? "remove" : "add"
                    }" onclick="window.toggleFavorite('${coin.id}', event)">${
          isFavorite ? "Remove" : "Add to Favorites"
        }</button></td>
                </tr>
            `;
      })
      .join("");
  };

  const setupPagination = (totalPages) => {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = `
      <nav aria-label="Page navigation">
        <ul class="pagination">
          ${Array.from({ length: totalPages }, (_, i) => i + 1)
            .map(
              (page) => `
            <li class="page-item ${params.page === page ? "active" : ""}">
              <a class="page-link" href="#" onclick="changePage(${page})">${page} ${
                params.page === page ? '<span class="sr-only"></span>' : ""
              }</a>
            </li>
          `
            )
            .join("")}
        </ul>
      </nav>
    `;
  };

  window.changePage = (page) => {
    if (page < 1 || page > 5) return; // Assume 5 pages for demo purposes
    params.page = page;
    fetchCoins(searchInput.value);
  };

  const toggleFavorite = (coinId, event) => {
    event.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const coinIndex = favorites.indexOf(coinId);

    if (coinIndex === -1) {
      favorites.push(coinId);
    } else {
      favorites.splice(coinIndex, 1);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    fetchCoins(searchInput.value);
  };

  window.toggleFavorite = toggleFavorite; // Ensure toggleFavorite is available globally
  fetchCoins();
});
