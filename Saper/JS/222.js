var field = [];
var checked = [];
var repeat=0, x=0, y=0, n=0, spaceField=0;

function startgame () {
	x = document.getElementById("widthfield").value;
	y = document.getElementById("heigthfield").value;
	n = document.getElementById("totalbomb").value;
	spaceField = x*y - n;
	create(x,y,n);
	show ();
}

function ifNotChecked(x, y) {
	for (var index = 0; index < checked.length; index++) {
		if (checked[index].x === x && checked[index].y === y) {
			return false;
		}
	}
	return true;
}

//Строим поле
function create (x,y,n) {
	console.log("ширина "+x);
	console.log("высота "+y);
	console.log("Бомб "+n);
	for (var i = 0; i < y; i++) {
		var row = [];
		field[i] = row;
		for (var j = 0; j < x; j++) {
			row.push("");
		}
	}


//Наполняем поле бомбами
//Рандомим координаты для установки мины
	var installMine = function (max) {
		return Math.floor(Math.random() * max);
	};
//Ставим мины
	for (var m = 0; m < n; m++) {
		var x_Koordinat = installMine(x);
		var y_Koordinat = installMine(y);
		if (field[y_Koordinat][x_Koordinat] === "x") {
			m -= 1;
		} else {
			field[y_Koordinat][x_Koordinat] = "x";
		}
	}
}

//Выводим поле на экран
function show () {
	var fieldTotal = document.getElementById("total");
	fieldTotal.style.display = "block";
	fieldTotal.style.width = (20+2)*x+16+"px";
	for (var k=0; k<y; k++) {
		for (var l=0; l<x; l++) {
			var fieldOne = document.createElement("DIV");
			fieldOne.className = "fieldonewar "+"x"+l+"y"+k;
			fieldOne.setAttribute("onclick","controlMine("+l+","+k+")");
			fieldOne.setAttribute("oncontextmenu","markerMine("+l+","+k+"); return false");
			total.insertBefore(fieldOne, null);
		}
	}
}


//Проверяем наличие бомбы по клику
function controlMine (x_x,y_y){
	if (field[y_y][x_x] === "x") {
		if (confirm("Вы взорвались. Начать игру заново?") ? window.location.reload() : window.close());
	} else {
		controlErrorBomb (x_x,y_y);
	}
}


//Считаем бомбы вокруг кликнутого поля
function controlErrorBomb (x_x,y_y) {

	var numbB = 0;
	for (var i = y_y - 1; i <= y_y + 1; i++) {
		if (field[i]) {
			for (var j = x_x - 1; j <= x_x + 1; j++) {
				if (field[i][j] === "x") {
					numbB += 1;
				}
			}
		}
	}
	var inputNumberBomb = document.getElementsByClassName("x" + x_x + "y" + y_y)[0];
	if (inputNumberBomb.innerHTML === "") {
		inputNumberBomb.innerHTML = numbB;
		spaceField -= 1;
	}
	if (spaceField === 0) {
		alert("ПОБЕДА!!!");
	}
	if (numbB === 0) {
		for (i = y_y - 1; i <= y_y + 1; i++) {
			if (field[i]) {
				for (j = x_x - 1; j <= x_x + 1; j++) {
					if (field[i][j] !== undefined && ifNotChecked(j, i)) {
						checked.push({
							x: j,
							y: i
						});

						controlErrorBomb(j, i);
					}
				}
			}
		}
	}
}

//Ставим метку о наличии мины
function markerMine (x_x,y_y) {
	var inputMarkerBomb = document.getElementsByClassName("x"+x_x+"y"+y_y)[0];
	if (inputMarkerBomb.innerHTML === "B") {
		inputMarkerBomb.innerHTML = "";
		inputMarkerBomb.style.backgroundColor = "#fff";
	} else {
		inputMarkerBomb.innerHTML = "B";
		inputMarkerBomb.style.backgroundColor = "#777";
	}
}