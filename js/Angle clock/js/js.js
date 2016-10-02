/**
 * Created by Вячеслав on 06.09.2016.
 */
var oneMinuteAngle = 360/60,
    oneHoursAngle = 360/12,
    angleOfOneMinute = oneHoursAngle / 60;

var button = document.getElementsByClassName('button')[0];
button.addEventListener('click', function(){
    var inputHours = document.getElementById('hours').value || 0,
        inputMinute = document.getElementById('minutes').value || 0,
        bigArrow = document.getElementsByClassName('big-arrow')[0],
        smallArrow = document.getElementsByClassName('small-arrow')[0];

    if(inputHours > 12 && inputHours <24) {
        inputHours -= 12;
    }
    if(inputHours == 24) {
        inputHours = 0;
    }
    if(inputMinute > 60 || inputHours > 24 || inputMinute < 0 || inputHours < 0) {
        alert('Введите корректные данные');
        return;
    }
    var degHours = inputHours * oneHoursAngle + angleOfOneMinute * inputMinute,
        degMinute = inputMinute * oneMinuteAngle + inputHours * 360,
        outResult = document.getElementsByClassName('result')[0],
        result;


    bigArrow.style.transform = 'rotate(' + degMinute + 'deg)';
    smallArrow.style.transform = 'rotate(' + degHours + 'deg)';

    result = degHours - inputMinute * oneMinuteAngle;
    if(result < 0) {
        result += 360;
    }
    if(result > 180) {
        result = 360 - result;
    }
    setTimeout(function(){
        outResult.innerText = result + ' град.';
    }, 2000);
});

