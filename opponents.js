
function redrawAccross(count) {
    var accrossDeckElement = document.getElementById("acrossdeck");
    cleanElement(accrossDeckElement);
    for (let i = 0; i < count; i++) {
        var node = document.createElement("div")
        node.style.backgroundImage = `url(./imgs/b.png)`
        accrossDeckElement.appendChild(node);
    }
}

function redrawLeft(count) {
    var leftDeckElement = document.getElementById("leftdeck");
    cleanElement(leftDeckElement);
    for (let i = 0; i < count; i++) {
        var node = document.createElement("div")
        node.style.backgroundImage = `url(./imgs/b.png)`
        leftDeckElement.appendChild(node);
    }
}

function redrawRight(count) {
    var rightDeckElement = document.getElementById("rightdeck");
    cleanElement(rightDeckElement);
    for (let i = 0; i < count; i++) {
        var node = document.createElement("div")
        node.style.backgroundImage = `url(./imgs/b.png)`
        rightDeckElement.appendChild(node);
    }
}