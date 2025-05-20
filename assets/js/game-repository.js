/**
 * Game Repository
 * Central repository for all game data
 */

window.gameRepository = (function() {
  // Game data
  const games = [
    {
      id: '1',
      title: 'God of War Ragnarok',
      description: 'Embarque com Kratos e Atreus em uma jornada épica em busca de respostas antes do profetizado Ragnarök. Juntos, pai e filho devem arriscar tudo nos Nove Reinos.',
      image: '../assets/images/game12.png',
      price: 124.95,
      originalPrice: 249.90,
      discount: 50,
      rating: 4.5,
      platforms: ['PlayStation', 'PC'],
      genres: ['Ação', 'Aventura', 'RPG'],
      releaseDate: '2022-11-09',
      developer: 'Santa Monica Studio',
      publisher: 'Sony Interactive Entertainment',
      tags: ['featured', 'bestseller']
    },
    {
      id: '2',
      title: 'Ghost of Tsushima',
      description: 'No final do século XIII, o império mongol devastou nações inteiras. A Ilha de Tsushima é tudo o que está entre o Japão continental e uma gigantesca frota invasora mongol.',
      image: '../assets/images/game13.png',
      price: 49.99,
      originalPrice: 199.99,
      discount: 75,
      rating: 4.9,
      platforms: ['PlayStation', 'PC'],
      genres: ['Ação', 'Mundo Aberto', 'Samurai'],
      releaseDate: '2020-07-17',
      developer: 'Sucker Punch Productions',
      publisher: 'Sony Interactive Entertainment',
      tags: ['new']
    },
    {
      id: '3',
      title: 'The Witcher 3: Wild Hunt',
      description: 'Você é Geralt de Rívia, mercenário matador de monstros. Diante de você está um continente devastado pela guerra e infestado de monstros para você explorar à vontade.',
      image: '../assets/images/game4.png',
      price: 79.99,
      originalPrice: 199.99,
      discount: 60,
      rating: 5.0,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['RPG', 'Fantasia', 'Aventura'],
      releaseDate: '2015-05-19',
      developer: 'CD Projekt RED',
      publisher: 'CD Projekt',
      tags: ['featured', 'bestseller']
    },
    {
      id: '4',
      title: 'Mortal Kombat 1',
      description: 'Descubra um Universo Mortal Kombat renascido, criado pelo Deus do Fogo Liu Kang. O Mortal Kombat 1 inaugura um novo era da franquia icônica com um novo sistema de luta e modos de jogo.',
      image: '../assets/images/game14.png',
      price: 99.90,
      originalPrice: 299.90,
      discount: 67,
      rating: 4.7,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['Luta', 'Ação', 'Violência'],
      releaseDate: '2023-09-19',
      developer: 'NetherRealm Studios',
      publisher: 'Warner Bros. Games',
      tags: ['featured', 'new']
    },
    {
      id: '5',
      title: 'Cyberpunk 2077',
      description: 'Cyberpunk 2077 é um RPG de ação e aventura de mundo aberto ambientado em Night City, uma megalópole obcecada por poder, glamour e modificação corporal.',
      image: '../assets/images/game2.png',
      price: 149.90,
      originalPrice: 199.90,
      discount: 25,
      rating: 4.0,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['RPG', 'Ação', 'Futurista', 'Ficção Científica'],
      releaseDate: '2020-12-10',
      developer: 'CD Projekt RED',
      publisher: 'CD Projekt',
      tags: ['featured']
    },
    {
      id: '6',
      title: 'Grand Theft Auto 5',
      description: 'Quando um jovem traficante, um ladrão de bancos aposentado e um psicopata aterrorizante se veem encrencados com algumas das figuras mais assustadoras do submundo do crime, o governo dos EUA e a indústria do entretenimento, eles devem realizar uma série de golpes ousados para sobreviver.',
      image: '../assets/images/game3.png',
      price: 89.90,
      originalPrice: 129.90,
      discount: 30,
      rating: 4.7,
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genres: ['Ação', 'Mundo Aberto'],
      releaseDate: '2013-09-17',
      developer: 'Rockstar North',
      publisher: 'Rockstar Games',
      tags: ['bestseller']
    }
  ];

  // Public API
  return {
    /**
     * Get all games
     */
    getAllGames: function() {
      return [...games];
    },
    
    /**
     * Get game by ID
     */
    getGameById: function(id) {
      return games.find(game => game.id === id);
    },
    
    /**
     * Get games by tag
     */
    getGamesByTag: function(tag) {
      return games.filter(game => game.tags.includes(tag));
    },
    
    /**
     * Get featured games
     */
    getFeaturedGames: function() {
      return games.filter(game => game.tags.includes('featured'));
    },
    
    /**
     * Get new games
     */
    getNewGames: function() {
      return games.filter(game => game.tags.includes('new'));
    },
    
    /**
     * Get bestseller games
     */
    getBestsellerGames: function() {
      return games.filter(game => game.tags.includes('bestseller'));
    }
  };
})(); 