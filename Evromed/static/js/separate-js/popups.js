var cartAnalyzesEl = $('.cart-analyzes strong');


//POPUPS
$('.add-analysis').on('click', function(event){
    event.preventDefault();

    var $thisTr = $(this).parent().parent();
    if($thisTr.find('span').length) {

        $('.form__analysis__one .analysis__one').remove();

        if($(window).outerWidth() > 779) {
            $('<table class="analysis__one temp1"><tr><td class="name-analyzes"></td><td class="time-analyzes"></td><td class="price-analysis"></td><td><a href="#" class="choose-this-analysis">Выбрать</a></td></tr></table>').appendTo('.form__analysis__one');
            $('<table class="analysis__one temp2"><tr><td class="name-analyzes"></td><td class="time-analyzes"></td><td class="price-analysis"></td><td><a href="#" class="choose-this-analysis">Выбрать</a></td></tr></table>').appendTo('.form__analysis__one');
            $('.form__analysis__one .analysis__one.temp1 .name-analyzes').text($thisTr.find('.name-analyzes').text());
            $('.form__analysis__one .analysis__one.temp2 .name-analyzes').text($thisTr.find('.name-analyzes').text() + ' срочный');
        } else {
            $('<table class="analysis__one temp1"><tr><td colspan="3" class="name-analyzes"></td></tr></table>').appendTo('.form__analysis__one');
            $('<tr><td class="time-analyzes"></td><td class="price-analysis"></td><td><a href="#" class="choose-this-analysis">Выбрать</a></td></tr>').appendTo('.analysis__one.temp1');
            $('<table class="analysis__one temp2"><tr><td colspan="3" class="name-analyzes"></td></tr></table>').appendTo('.form__analysis__one');
            $('<tr><td class="time-analyzes"></td><td class="price-analysis"></td><td><a href="#" class="choose-this-analysis">Выбрать</a></td></tr>').appendTo('.analysis__one.temp2');
            $('.form__analysis__one .analysis__one.temp1 .name-analyzes').text($thisTr.prev().prev().find('.name-analyzes').text());
            $('.form__analysis__one .analysis__one.temp2 .name-analyzes').text($thisTr.prev().prev().find('.name-analyzes').text() + ' срочный');
        }
        $('.form__analysis__one .analysis__one.temp1 .time-analyzes').text($thisTr.find('.time-analyzes').text());
        $('.form__analysis__one .analysis__one.temp1 .price-analysis').text($thisTr.find('.price-analysis').text());
        var regexpTime2 = /[0-9]+[\s]{1}[а-я]+/i;
        var tempText2 = $thisTr.find('.status-analyzes strong').text();
        var timeAnal2 = tempText2.match(regexpTime2)[0];
        var priceAnal2 = tempText2.replace(timeAnal2, '');
        $('.form__analysis__one .analysis__one.temp2 .time-analyzes').text(timeAnal2);
        $('.form__analysis__one .analysis__one.temp2 .price-analysis').text(priceAnal2);


        if(window.innerWidth < 350) {
            var autosizeD = false,
                widthD = 320;
        }
        if(window.innerWidth < 982) {
            var custom = [40, 0, 40, 0];
        }

        $.fancybox.open({
            padding: 0,
            content: $('#popup__choose-analyzes'),
            closeBtn: true,
            topRatio: 0.5,
            scrolling: 'NO',
            openEffect: 'fade',
            openSpeed: 600,
            margin: custom || [
                20, 20, 20, 20
            ],
            autoWidth: autosizeD || true,
            minWidth: 320,
            width: widthD || 'auto',
            helpers: {
                overlay: {
                    locked: true
                }
            }
        });
    } else {
        var thisTr = $(this).parent().parent();
        if($(window).outerWidth() > 779) {
            $('<table class="chose-analysis__one temp"><tr><td class="name-analyzes"></td><td class="time-analyzes"></td><td class="status-analyzes"></td><td class="price-analysis"></td><td class="del-analyzes"><a href="#" class="delete-this-analysis"></a></td></tr></table>').insertBefore('.sum-analyzes');
            $('.chose-analysis__one.temp .name-analyzes').text(thisTr.find('.name-analyzes').text());
            $('.chose-analysis__one.temp .time-analyzes').text(thisTr.find('.time-analyzes').text());
            $('.chose-analysis__one.temp .price-analysis').text(thisTr.find('.price-analysis').text());
        } else {
            $('<table class="chose-analysis__one temp"><tr><td colspan="4" class="name-analyzes"></td></tr><tr><td class="time-analyzes"></td><td class="status-analyzes"></td><td class="price-analysis"></td><td class="del-analyzes"><a href="#" class="delete-this-analysis"></a></td></tr></table>').insertBefore('.sum-analyzes');
            $('.chose-analysis__one.temp .name-analyzes').text(thisTr.prev().prev().find('.name-analyzes').text());
            var regexpTime = /[0-9]+[\s]{1}[а-я]+/i;
            var tempText = thisTr.find('.urgently').text();
            var timeAnal = tempText.match(regexpTime)[0];
            var priceAnal = tempText.replace(timeAnal, '');
            $('.chose-analysis__one.temp .time-analyzes').text(timeAnal);
            $('.chose-analysis__one.temp .price-analysis').text(priceAnal);

        }

        var cartAnalyzesNum = cartAnalyzesEl.text();
        $('.chose-analysis__one').removeClass('temp');
        cartAnalyzesEl.text(+cartAnalyzesNum + 1);
    }
});



$(document).on('click', '.choose-this-analysis', function(event) {
    event.preventDefault();
    $.fancybox.close();
    if($(window).outerWidth() >= 780) {
        $('<table class="chose-analysis__one temp"><tr><td class="name-analyzes"></td><td class="time-analyzes"></td><td class="status-analyzes"></td><td class="price-analysis"></td><td class="del-analyzes"><a href="#" class="delete-this-analysis"></a></td></tr></table>').insertBefore('.sum-analyzes');
    } else {
        $('<table class="chose-analysis__one temp"><tr><td colspan="3" class="name-analyzes"></td></tr><tr><td class="time-analyzes"></td><td class="status-analyzes"></td><td class="price-analysis"></td><td class="del-analyzes"><a href="#" class="delete-this-analysis"></a></td></tr></table>').insertBefore('.sum-analyzes');
    }

    var thisTr = $(this).parent().parent();
    if(thisTr.find('.name-analyzes').text().indexOf('срочный') + 1) {
        var tempText = thisTr.find('.name-analyzes').text().replace('(срочный)', '');
        $('.chose-analysis__one.temp .status-analyzes').text('срочный');
        $('.chose-analysis__one.temp .name-analyzes').text(tempText);
    } else {
            $('.chose-analysis__one.temp .name-analyzes').text(thisTr.find('.name-analyzes').text());
        }
    $('.chose-analysis__one.temp .time-analyzes').text(thisTr.find('.time-analyzes').text());
    $('.chose-analysis__one.temp .price-analysis').text(thisTr.find('.price-analysis').text());

    if($(window).outerWidth() <= 779) {
        var thisTr = $(this).parent().parent().prev();
        if(thisTr.find('.name-analyzes').text().indexOf('срочный') + 1) {
            var tempText = thisTr.find('.name-analyzes').text().replace('(срочный)', '');
            $('.chose-analysis__one.temp .status-analyzes').text('срочный');
            $('.chose-analysis__one.temp .name-analyzes').text(tempText);
        } else {
            $('.chose-analysis__one.temp .name-analyzes').text(thisTr.find('.name-analyzes').text());
        }
        $('.chose-analysis__one.temp .time-analyzes').text(thisTr.next().find('.time-analyzes').text());
        $('.chose-analysis__one.temp .price-analysis').text(thisTr.next().find('.price-analysis').text());

    }

    $('.chose-analysis__one').removeClass('temp');
    var cartAnalyzesNum = cartAnalyzesEl.text();
    cartAnalyzesEl.text(+cartAnalyzesNum + 1);
});



$('.cart-analyzes').on('click', function(event){
    event.preventDefault();

    //SUM ANALYSYS IN POPUP CHOSE ANALYSES
    var sumAnalys = 0;
    $('#popup__chose-analyzes .price-analysis').each(function(i, el) {
        sumAnalys += parseInt($(el).text());
    });
    $('.sum-analyzes span').text(sumAnalys);

    if(window.innerWidth < 350) {
        var autosizeD = false,
            widthD = 320;
    }
    if(window.innerWidth < 982) {
        var custom = [40, 0, 40, 0];
    }
    if($(this).find('strong').text() > 0) {
        $.fancybox.open({
            padding: 0,
            content: $('#popup__chose-analyzes'),
            autoWidth: autosizeD || true,
            minWidth: 320,
            topRatio: 0.5,
            scrolling: 'NO',
            openEffect: 'fade',
            openSpeed: 600,
            margin: custom || [
                20, 20, 20, 20
            ],
            width: widthD || 'auto',
            helpers: {
                overlay: {
                    locked: true
                }
            }
        })
    } else {
        $.fancybox.close();
    }
});



$('.home-analyzes').on('click', function(event){
    event.preventDefault();
    if(window.innerWidth < 350) {
        var autosizeD = false,
            widthD = 320;
    }
    if(window.innerWidth < 982) {
        var custom = [40, 0, 40, 0];
    }
    $.fancybox.open({
        padding: 0,
        content: $('.home-tests'),
        autoWidth: autosizeD || true,
        minWidth: 320,
        topRatio: 0.5,
        scrolling: 'NO',
        openEffect: 'fade',
        openSpeed: 600,
        margin: custom || [
            20, 20, 20, 20
        ],
        width: widthD || 'auto',
        helpers: {
            overlay: {
                locked: true
            }
        }
    })
});



$('.submit-request').on('click', function(event){
    event.preventDefault();
    if(window.innerWidth < 350) {
        var autosizeD = false,
            widthD = 320;
    }
    if(window.innerWidth < 982) {
        var custom = [40, 0, 40, 0];
    }
    $.fancybox.open({
        padding: 0,
        content: $('.complex-program-popup'),
        autoWidth: autosizeD || true,
        minWidth: 320,
        topRatio: 0.5,
        scrolling: 'NO',
        openEffect: 'fade',
        openSpeed: 600,
        margin: custom || [
            20, 20, 20, 20
        ],
        width: widthD || 'auto',
        helpers: {
            overlay: {
                locked: true
            }
        }
    })
});



$('.header__right__appointment__info, .sign-up-doctor-button, .make-appoint, .enroll, .enroll-gastro').on('click', function(event){
    event.preventDefault();
    if(window.innerWidth < 350) {
        var autosizeD = false,
            widthD = 320;
    }
    if(window.innerWidth < 982) {
        var custom = [40, 0, 40, 0];
    }
    $.fancybox.open({
        padding: 0,
        content: $('.sign-up-doctor'),
        autoWidth: autosizeD || true,
        minWidth: 320,
        scrolling: 'NO',
        openEffect: 'fade',
        openSpeed: 600,
        margin: custom || [
            20, 20, 20, 20
        ],
        width: widthD || 'auto',
        helpers: {
            overlay: {
                locked: true
            }
        }
    })
});



$('.subscribe__cover .subm__cover').on('click', function(event){
    if(window.innerWidth < 350) {
        var autosizeD = false,
            widthD = 320;
    }
    if(window.innerWidth < 982) {
        var custom = [40, 0, 40, 0];
    }
    $.fancybox.open({
        padding: 0,
        content: $('.news-subscription__popup'),
        closeBtn: false,
        topRatio: 0.5,
        scrolling: 'NO',
        openEffect: 'fade',
        openSpeed: 600,
        autoWidth: autosizeD || true,
        minWidth: 320,
        margin: custom || [
            20, 20, 20, 20
        ],
        width: widthD || 'auto',
        helpers: {
            overlay: {
                locked: true
            }
        }
    })
});
