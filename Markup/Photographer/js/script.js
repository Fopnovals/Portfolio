/**
 * Created by Вячеслав Дом on 21.03.2016.
 */


$(function(){
    //PRELOADER
    $(window).ready(function(){
        $('.preloader').css({'visibility': 'hidden'});
        $('#perspective').css({'visibility': 'visible'});
    });


    //CLOUDS
    $('.layer1').plaxmove({ratioH:0.05,ratioV:0.06});
    $('.layer2').plaxmove({ratioH:0.01,ratioV:0.08});
    $('.layer3').plaxmove({ratioH:0.01,ratioV:0.03});
    $('.layer4').plaxmove({ratioH:0.07,ratioV:0.03});
    $('.layer5').plaxmove({ratioH:0.02,ratioV:0.015})
});

