function getUserGameProfile() {
  try {
    const userGameProfile = JSON.parse(localStorage.getItem('userGameProfile'));
    if (userGameProfile && userGameProfile.wishlist && Array.isArray(userGameProfile.wishlist)) {
      if (userGameProfile.wishlist.length > 0 && typeof userGameProfile.wishlist[0] === 'object') {
        // Caso venha no formato antigo com objetos, extrair só os ids
        userGameProfile.wishlist = userGameProfile.wishlist.map(item => item.id);
      }
      return userGameProfile;
    }
  } catch (error) {
    console.error("Erro ao carregar perfil do usuário:", error);
  }
  return { wishlist: [] };
}

function saveUserGameProfile(profile) {
  try {
    localStorage.setItem('userGameProfile', JSON.stringify(profile));
  } catch (error) {
    console.error("Erro ao salvar perfil do usuário:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFavorites();

  const wishlistTab = document.getElementById('wishlist');
  if (wishlistTab) {
    updateFavoritesTab();

    const wishlistTabButton = document.querySelector('[data-tab="wishlist"]');
    if (wishlistTabButton) {
      wishlistTabButton.addEventListener('click', () => updateFavoritesTab());
    }
  }
});

function initializeFavorites() {
  const userProfile = getUserGameProfile();
  const gameCards = document.querySelectorAll('.game-card-immersive, .game-card');

  gameCards.forEach(card => {
    const gameId = card.getAttribute('data-game-id');
    const wishlistBtn = card.querySelector('.wishlist-button, .add-to-wishlist');

    if (wishlistBtn && gameId) {
      const isInWishlist = userProfile.wishlist.includes(gameId);
      const icon = wishlistBtn.querySelector('i');

      if (icon) {
        icon.classList.toggle('fas', isInWishlist);
        icon.classList.toggle('far', !isInWishlist);
      }

      // Remove listeners antigos e adiciona novos para evitar duplicidade
      const newWishlistBtn = wishlistBtn.cloneNode(true);
      wishlistBtn.parentNode.replaceChild(newWishlistBtn, wishlistBtn);

      newWishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(newWishlistBtn);
      });
    }
  });
}

function toggleFavorite(button) {
  if (window.auth && !window.auth.isUserLoggedIn()) {
    window.auth.requireLogin(null, true);
    return;
  }

  const icon = button.querySelector('i');
  let gameId = button.dataset.gameId || button.getAttribute('data-game-id') || button.dataset.id || button.getAttribute('data-id');

  if (!gameId) {
    const gameCard = button.closest('.game-card-immersive, .game-card, .cart-item');
    if (gameCard) {
      gameId = gameCard.dataset.gameId || gameCard.getAttribute('data-game-id');
    }
  }

  if (!gameId) {
    console.error("Não foi possível identificar o ID do jogo para favoritar.");
    return;
  }

  const userProfile = getUserGameProfile();
  const existingIndex = userProfile.wishlist.indexOf(gameId);

  if (existingIndex === -1) {
    userProfile.wishlist.push(gameId);
    if (icon) {
      icon.classList.remove('far');
      icon.classList.add('fas');
    }

    if (window.auth && typeof window.auth.addUserXP === 'function') {
      window.auth.addUserXP(5, 'Adicionou um jogo à lista de desejos');
    } else if (typeof addUserXP === 'function') {
      addUserXP(5, 'Adicionou um jogo à lista de desejos');
    }

    if (typeof showNotification === 'function') {
      showNotification('Adicionado à lista de desejos', 'success');
    }

  } else {
    userProfile.wishlist.splice(existingIndex, 1);
    if (icon) {
      icon.classList.remove('fas');
      icon.classList.add('far');
    }

    if (typeof showNotification === 'function') {
      showNotification('Removido da lista de desejos', 'info');
    }

    if (document.getElementById('wishlist')?.classList.contains('active')) {
      const wishlistGrid = document.getElementById('wishlistGrid');
      const cardToRemove = wishlistGrid?.querySelector(`[data-game-id="${gameId}"]`);
      if (cardToRemove) cardToRemove.remove();

      if (userProfile.wishlist.length === 0) {
        showEmptyFavoritesState(wishlistGrid);
        updateWishlistSummary(0, 0, 0);
      } else {
        updateWishlistSummary(userProfile.wishlist.length);
      }
    }
  }

  saveUserGameProfile(userProfile);

  if (document.getElementById('wishlist')) {
    updateFavoritesTab();
  }

  document.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: userProfile.wishlist } }));
}

function showEmptyFavoritesState(container) {
  container.innerHTML = `
    <div class="empty-collection">
      <i class="fas fa-heart"></i>
      <p>Você ainda não adicionou jogos aos favoritos</p>
      <a href="games.html" class="btn-explore">Explorar jogos</a>
    </div>
  `;
}

function createFavoriteGameCard(game) {
  const card = document.createElement('div');
  card.className = 'cart-item'; // manter estilo igual ao carrinho
  card.setAttribute('data-game-id', game.id);

  const title = game.title || `Game #${game.id}`;
  const imageSrc = game.image || '../assets/images/placeholder-game.jpg';
  const platforms = game.platforms?.join(', ') || '';

  card.innerHTML = `
    <div class="cart-item-image">
      <img src="${imageSrc}" alt="${title}" onerror="this.src='../assets/images/placeholder-game.jpg'">
    </div>
    <div class="cart-item-details">
      <h3 class="cart-item-title">${title}</h3>
      <p class="cart-item-platforms">${platforms}</p>
    </div>
    <button type="button" class="remove-from-favorites" data-id="${game.id}" title="Remover dos favoritos">
      <i class="fas fa-heart"></i>
    </button>
  `;

  card.querySelector('.remove-from-favorites').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(card.querySelector('.remove-from-favorites'));
  });

  return card;
}

function updateFavoritesTab() {
  if (!window.location.pathname.includes('profile.html')) return;

  const wishlistContainer = document.getElementById('wishlist');
  if (!wishlistContainer) return;

  const wishlistGrid = document.getElementById('wishlistGrid');
  if (!wishlistGrid) return;

  wishlistGrid.innerHTML = '';

  const userProfile = getUserGameProfile();
  const favoritedGameIds = userProfile.wishlist || [];

  if (favoritedGameIds.length === 0) {
    showEmptyFavoritesState(wishlistGrid);
    updateWishlistSummary(0, 0, 0);
    return;
  }

  // Create cart-style container instead of grid
  const cartContainer = document.createElement('div');
  cartContainer.className = 'cart-container';
  wishlistGrid.appendChild(cartContainer);

  // Aqui só mudamos para usar window.gamesData ao invés do gamesRepository
  if (!window.gamesData || !Array.isArray(window.gamesData)) {
    console.warn("window.gamesData não encontrado ou não é um array.");
    showEmptyFavoritesState(wishlistGrid);
    return;
  }

  favoritedGameIds.forEach(gameId => {
    // Buscar jogo no array window.gamesData
    const game = window.gamesData.find(g => String(g.id) === String(gameId));

    if (game) {
      // Ajustar caminho da imagem para o profile.html
      if (game.image && !game.image.startsWith('http')) {
        if (window.location.pathname.includes('profile.html') && !game.image.startsWith('../')) {
          game.image = '../' + game.image;
        }
      }
      const gameCard = createFavoriteGameCard(game);
      cartContainer.appendChild(gameCard);
    } else {
      // Se não encontrar jogo, criar card genérico
      const placeholderGame = {
        id: gameId,
        title: `Game #${gameId}`,
        image: '../assets/images/placeholder-game.jpg'
      };
      const gameCard = createFavoriteGameCard(placeholderGame);
      cartContainer.appendChild(gameCard);
    }
  });

  updateWishlistSummary(favoritedGameIds.length);
}

function updateWishlistSummary(itemCount, totalValue = 0, potentialSavings = 0) {
  const wishlistTotal = document.getElementById('wishlistTotal');
  const wishlistValue = document.getElementById('wishlistValue');
  const wishlistSavings = document.getElementById('wishlistSavings');

  if (wishlistTotal) wishlistTotal.textContent = itemCount;
  if (wishlistValue) wishlistValue.textContent = totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (wishlistSavings) wishlistSavings.textContent = potentialSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
