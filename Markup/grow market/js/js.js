$(document).ready(function() {
    $('.search a').on('click',function(){
        $('.form-search input').toggleClass('active');
        $('.search a').toggleClass('active');
	if(!$('.cart').css('opacity') || $('.cart').css('opacity') == 0) {$('.cart').css('opacity',1); $('.autorisation a').css('opacity',1)} else {$('.cart').css('opacity',0); $('.autorisation a').css('opacity',0)};
console.log(!$('.cart').css('opacity'));
        $('.form-search').toggleClass('active');
    });
    $('.buy').mouseenter(function(){
        if(!$(this).parent().hasClass('absent'))
        $(this).parent().addClass('hover');
    });
    $('.buy').mouseleave(function(){
        $(this).parent().removeClass('hover');
    })

    //VALIDATION FORM

    $('.form-reviews').find('input[type="submit"]').click(function() {
        var inpEmail = $('.form-reviews').find('input[name="email"]');
        var inpName = $('.form-reviews').find('input[name="name"]');
        if(!/.+@.+\..+/i.test(inpEmail.val())) {
            inpEmail.css('border-color', 'red').val('').attr('placeholder', 'Введите правильный Email');
            return false;
        } else {
            inpEmail.css('border-color', 'green');
        }
        if(!inpName.val()) {
            inpName.css('border-color', 'red').val('').attr('placeholder', 'Введите имя');
            return false;
        } else {
            inpName.css('border-color', 'green');
        }
        return true;
    });

    //STARS HOVER
    function stars () {
        var starsArr = document.getElementsByClassName('star');

        function activeStar(e) {
            numberStar = ''+this.id.replace(/\D+/g,"");
            for(var j=0; j<numberStar; j++) {
                starsArr[j].classList.add('active');
            }
        }

        function unActiveStar () {
            for(var j=0; j<starsArr.length; j++) {
                starsArr[j].classList.remove('active');
            }
        }

        for(var i=0; i<starsArr.length; i++) {
            starsArr[i].addEventListener('mouseover', activeStar);
            starsArr[i].addEventListener('mouseout', unActiveStar);
        }

    }
    stars();
});