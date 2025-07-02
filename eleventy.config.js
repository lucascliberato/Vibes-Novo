module.exports = function(eleventyConfig) {
  // Copia as pastas de assets para o site final.
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  // CRIA A COLEÇÃO DE ARTISTAS ÚNICOS
  eleventyConfig.addCollection("artists", function(collectionApi) {
    let artistSet = new Set();
    // Pega todos os itens com a tag "songs"
    collectionApi.getFilteredByTag("songs").forEach(function(item) {
      if (item.data.artist) {
        artistSet.add(item.data.artist);
      }
    });
    return [...artistSet].sort();
  });

  // Define as pastas de trabalho.
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes" 
    }
  };
};