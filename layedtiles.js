
  function clearLayedTiles() {
    var layedTilesElement = document.getElementById("rightlayed");
    cleanElement(layedTilesElement);
    layedTilesElement = document.getElementById("leftlayed");
    cleanElement(layedTilesElement);
    layedTilesElement = document.getElementById("acrosslayed");
    cleanElement(layedTilesElement);
    var layedTilesElement = document.getElementById("mylayed");
    cleanElement(layedTilesElement);
  }

  function updateSelfLayedTiles(tiles){
    var layedTilesElement = document.getElementById("mylayed");
    for (let i = 0; i < tiles.length; i++) {
      var currentTile = document.createElement("div")
      currentTile.style.border = 'none';
      var tileNo = tiles[i].n != undefined ? tiles[i].n : tiles[i];
      currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${tileNo}.png)`;
      layedTilesElement.appendChild(currentTile);
    }
    var space = document.createElement("div")
    space.style.width = "40px";
    layedTilesElement.appendChild(space);
  }

  function addLayedTilesToRight(tiles) {
    var layedTilesElement = document.getElementById("rightlayed");
      for (let i = 0; i < tiles.length; i++) {
        var currentTile = document.createElement("div")
        currentTile.style.border = 'none';

        var tileNo = tiles[i].n != undefined ? tiles[i].n : tiles[i];
        currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${tileNo}.png)`
        layedTilesElement.appendChild(currentTile);
      }
      var space = document.createElement("div")
      space.style.width = "10px";
      layedTilesElement.appendChild(space);
      selectedTiles = [];
  }

  function addLayedTilesToLeft(tiles){
    var layedTilesElement = document.getElementById("leftlayed");
    for (let i = 0; i < tiles.length; i++) {
      var currentTile = document.createElement("div")
      currentTile.style.border = 'none';
      var tileNo = tiles[i].n != undefined ? tiles[i].n : tiles[i];
      currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${tileNo}.png)`
      layedTilesElement.appendChild(currentTile);
    }
    var space = document.createElement("div")
    space.style.width = "10px";
    layedTilesElement.appendChild(space);
    selectedTiles = [];
  }

  function addLayedTilesToAcross(tiles){
    var layedTilesElement = document.getElementById("acrosslayed");
    for (let i = 0; i < tiles.length; i++) {
      var currentTile = document.createElement("div")
      currentTile.style.border = 'none';
      var tileNo = tiles[i].n != undefined ? tiles[i].n : tiles[i];
      currentTile.style.backgroundImage = `url(./imgs/tiles_lying/${tileNo}.png)`
      layedTilesElement.appendChild(currentTile);
    }
    var space = document.createElement("div")
    space.style.width = "10px";
    layedTilesElement.appendChild(space);
    selectedTiles = [];
  }