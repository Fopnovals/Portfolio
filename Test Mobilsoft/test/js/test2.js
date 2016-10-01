var roulette = new fabric.StaticCanvas('roulette');
var topImg = 200,
    arrayElements = [],
    groupElements,
    flag = true;

//Create a random sequence and output the window
var randomCard;
var Cards = document.getElementsByClassName('arrCards');
var allCards = function() {
    if (!flag) {
        arrayElements = [];
    }
        for (var i=0; i<Cards.length; i++) {
            randomCard = Math.round(Math.random()*(Cards.length-1));
            outputImg(Cards[randomCard]);
        }
        outputImg(Cards[1]);
        outputImg(Cards[1]);
        outputImg(Cards[12]);

    groupElements = new fabric.Group(arrayElements, {
        top: -1300,
        left: 0
    });
    roulette.add(groupElements);
};

allCards();
function outputImg (e) {
    var imgInstance = new fabric.Image(e, {
        left:0,
        top:topImg
    });
    arrayElements.push(imgInstance);
    //roulette.add(imgInstance);
    topImg -=100;
}


var startMove = document.getElementById('start');
startMove.addEventListener('click', function() {
    if (!flag) {
        allCards();
    }
    groupElements.animate({ top: 0 }, {
        easing: fabric.util.ease.easeOutCubic,
        duration: 5000,
        onChange: roulette.renderAll.bind(roulette)
    });
    flag = false;
});