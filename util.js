
  function cleanElement(parent){
    while (parent.firstChild) {
      parent.firstChild.remove();
    }
  }
  
  function getChildValues(parent){
    var children = parent.children;
    var result = [];
    for (var i = 0; i < children.length; i++) {
      var text = children[i].textContent;
      result.push(text);
    }
  
    return result;
  }
  
  function getSelectedTileValues(){
    var result = [];
    for (var i = 0; i < selectedTiles.length; i++) {
      var text = selectedTiles[i].textContent;
      result.push(text);
    }
  
    return result;
  }