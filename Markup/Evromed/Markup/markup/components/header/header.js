/**
 * Created by Viacheslav on 22.12.2016.
 */
$(window).load(function() {

    var heightSlide;

    if($(window).outerWidth() >= 580) {
        var wasRebuild580 = false;
    } else {
        var wasRebuild580 = true;
    }

    if($(window).outerWidth() > 780) {
        var wasRebuild780 = false;
    } else {
        var wasRebuild780 = true;
    }


    //VALIDATION EMAIL IN CONTACTS
    var patternEmail = /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i;
    $('#input-email').on('blur', function() {
        if(patternEmail.test($(this).val())) {
            $(this).removeClass('error');
        } else {
            $(this).addClass('error');
        }
    });


    //VISIBLE SEARCH FIELD ON CLICK .search-laptop__button
    $('.search-laptop__button').on('click', function(e) {
        e.preventDefault();
        $('.search-laptop__box.mobile-version').height($('body').outerHeight() - parseInt($('.search-laptop__box').css('top')));
        if($('.search-laptop__box.mobile-version').hasClass('active')) {
            $('.search-laptop__box.mobile-version').removeClass('active');
        } else {
            $('.search-laptop__box.mobile-version').addClass('active');
        }
    });


    //var nP = navigator.platform;
    //if (nP == "iPad" || nP == "iPhone" || nP == "iPod" || nP == "iPhone Simulator" || nP == "iPad Simulator"){
    //    $('select option[disabled]').remove();
    //}



    //BUTTON TURN
    $('.turn__item').on('click',function(e) {
        var $this = $(this);
        e.preventDefault();
        $this.toggleClass('active');
        if(!$this.parent().next('.doctors').length) {
            $this.parent().next().slideToggle();
        }
        $this.parent().prev('.gastro-simptoms, .advantages__left').slideToggle();
        if($this.hasClass('active')) {
            $this.text('Развернуть');
        } else {
            $this.text('Свернуть');
        }
    });
    $('.turn__item_ld').on('click',function(e) {
        var $this = $(this);
        e.preventDefault();
        $this.toggleClass('active').parent().next().slideToggle();
        $this.parent().prev().slideToggle();
        if($this.hasClass('active')) {
            $this.text('Развернуть');
        } else {
            $this.text('Свернуть');
        }
    });



    //ANSWER
    $('.question-title').on('click', function(){
        $('.answer-box').slideUp();
        if($(this).hasClass('opened')) {
            $(this).removeClass('opened');
            $(this).next('.answer-box').slideUp();
        } else {
            $('.question-title').removeClass('opened');
            $(this).next('.answer-box').slideDown();
            $(this).addClass('opened');
        }
    });


    //WIDTH SEARCH FORM
    $('.search__input')
                        .on('focus', function(){
                            $(this).addClass('active');
                        })
                        .on('blur', function(){
                            if(!$(this).val()) {
                                $(this).removeClass('active');
                            }
                        });



    /*SLIDERS*/
    $('.slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        infinity: true,
        autoplay: true,
        prevArrow: '<span type="button" class="slick-prev"></span>',
        nextArrow: '<span type="button" class="slick-next"></span>'
    });


    //SET HEIGHT SLIDES AS BIGGEST SLIDE
    function heightPopServ() {
        heightSlide = 0;
        $('.popular-services__slide').each(function(i,el){
            $(this).css({'height': 'auto'});
            if($(this).outerHeight() > heightSlide) {
                heightSlide = $(this).outerHeight();
            }
        });
        $('.popular-services__slide').each(function(i,el) {
            $(el).height(heightSlide);
        });
    }
    heightPopServ();
    $('.popular-services__slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        vertical: true,
        infinite: false,
        swipe: false,
        appendArrows: '.arrows__container',
        appendDots: '.dots__container',
        prevArrow: '<span type="button" class="slick-prev"></span>',
        nextArrow: '<span type="button" class="slick-next"></span>'
    });
    //SCROLL DOTS IF ITEMS ARE MORE THAN 7
    function scrollDots() {
        if($(window).outerWidth() > 380) {
            $('.popular-services__slider').next('.total__container').find('.slick-prev, .slick-next').on('click', function(){
                var activePopularServices = $('.popular-services__slider').next('.total__container').find('li.slick-active'),
                    activePopularServicesNumber = +activePopularServices.text(),
                    topPositionUl = activePopularServicesNumber * (activePopularServices.outerHeight()+12) - (activePopularServices.outerHeight()+12) * 7,
                    moveDots = (activePopularServicesNumber - 7) * (activePopularServices.outerHeight()+12);
                if(topPositionUl >= 0) {
                    $('.popular-services__slider').next('.total__container').find('.slick-dots').css({'top': -moveDots});
                }
            });
        } else {
            $('.popular-services__slider').next('.total__container').find('.slick-prev, .slick-next').on('click', function(){
                var activePopularServices = $('.popular-services__slider').next('.total__container').find('li.slick-active'),
                    activePopularServicesNumber = +activePopularServices.text(),
                    topPositionUl = activePopularServicesNumber * (activePopularServices.outerHeight()+12) - (activePopularServices.outerHeight()+12) * 7,
                    moveDots = (activePopularServicesNumber - 7) * (activePopularServices.outerHeight()+12);
                if(topPositionUl >= 0) {
                    $('.popular-services__slider').next('.total__container').find('.slick-dots').css({'top': -moveDots});
                }
            });
        }
    }
    //ADD '0' FOR BUTTON OF DOT
    var buttonsPopularServices = document.querySelectorAll('.popular-services .slick-dots li button');
    for(var i=0; i<buttonsPopularServices.length; i++) {
        if(i<9) {
            buttonsPopularServices[i].innerHTML = '0' + buttonsPopularServices[i].innerHTML;
        }
    }


    //SHOW MORE ANALYZES ON CLICK BUTTON ПОДРОБНЕЕ
    $('.show-more-analysis').on('click', function(event){
        event.preventDefault();
        $(this).parent().parent().next('.more-about-analysis').toggle('.active');
    });


    //HIDE ROWS IF DESCRIPTION IS ABSENT
    $('.complex-programs__block__table tr').each(function(i,el) {
        if($(el).find('p').length || $(el).find('ul').length) {
            $(el).find('p, ul').css('display','block');
            $(el).hide();
        }
    });
    //SHOW ABOUT ANALYZES ON CLICK BUTTON ПОДРОБНЕЕ IN COMPLEX PROGRAMS BOX
    $('.complex-programs__block__table .show-about-analysis').on('click', function(event) {
        event.preventDefault();
        $(this).closest('tr').toggleClass('border-none').next().toggle('.active');
    });


    //CUSTOM SELECTS
    $('select').styler();


    //TABS
    var tabsContentArr = $('.tabs-info__item');
    tabsContentArr.hide().filter(':first').show();

    $('.tabs-title__box').on('click', '.tabs__item', function(){
        $('.tabs__item').removeClass('active');
        $(this).addClass('active');
        tabsContentArr.hide();
        tabsContentArr.eq($('.tabs__item').index(this)).show();

    });


    //AUTOCOMPLITE
// массив строк
    var availableTags = [
        "Смирнова",
        "Ковалева",
        "Иванова",
        "Сидорова",
        "Михайлова"
    ];

    $('#autocomplite').autocomplete({
        source: availableTags,
        appendTo: '.cover-autocomplite',
        autoFocus: true
    });


    //OPEN CONTRACTS NEW WINDOW
    //$('.download-contract').on('click', function(e){
    //    e.preventDefault();
    //    window.open($(this).attr('href'));
    //});


    //DELETE CHOSE ANALYZES
    $(document).on('click', '.delete-this-analysis', function(event) {
        event.preventDefault();
        if($(window).outerWidth() > 780) {
            $(this).parent().parent().remove();
        } else {
            $(this).parent().parent().prev().remove();
            $(this).parent().parent().remove();
        }
        var newSumm = parseInt($('.sum-analyzes span').text()) - parseInt($(this).parent().parent().find('.price-analysis').text());
        $('.sum-analyzes span').text(newSumm);
        var summToCart = +$('.cart-analyzes strong').text();
        $('.cart-analyzes strong').text(summToCart - 1);
    });

var count = true;
    function clickTitle() {
        if(count) {
            if($(window).width() <= 450) {
                //TURNING .one-column in services box
                $('.srv .title-services').each(function(i,el) {
                    if(i>0) {
                        $(el).addClass('turned');
                    }
                });
                $('.srv .title-services').on('click',function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if($(this).hasClass('turned')) {
                        $(this).removeClass('turned');
                    } else {
                        $(this).addClass('turned');
                    }
                });
                count = false;
            } else {
                $('.title-services').removeClass('turned').unbind('click');
                count = true;
            }


            //TURN .directions__box .womens, .directions__box .mens, .directions__box .childrens
            if($(window).outerWidth() <= 580) {
                $('.directions__box .womens, .directions__box .mens, .directions__box .childrens').addClass('turned').find('ul').slideUp();
                $('.directions__box .womens>a').on('click',function(e) {
                    turned.call(this);
                    e.preventDefault();
                });
                $('.directions__box .mens>a').on('click',function(e) {
                    turned.call(this);
                    e.preventDefault();
                });
                $('.directions__box .childrens>a').on('click',function(e) {
                    turned.call(this);
                    e.preventDefault();
                });
                count = false;
            } else {
                $('.directions__box .womens, .directions__box .mens, .directions__box .childrens').removeClass('turned').find('ul').slideDown();
                $('.directions__box .womens a').unbind('click');
                $('.directions__box .mens a').unbind('click');
                $('.directions__box .childrens a').unbind('click');
                count = true;
            }

            function turned() {
                var _this = this;
                if($(this).parent().hasClass('turned')) {
                    $(this).parent().addClass('mb').find('ul').slideDown();
                    setTimeout(function() {
                        $(_this).parent().removeClass('turned');
                    },400);
                } else {
                    $(this).parent().removeClass('mb').find('ul').slideUp();
                    setTimeout(function() {
                        $(_this).parent().addClass('turned');
                    },400);
                }
            }
        }
    }

    clickTitle();
    $(window).on('orientationchange',clickTitle());


    laptopF();
    $(window).on('resize',laptopF);
    $(window).on('orientationchange',laptopF);

    function laptopF() {

        scrollDots();
        heightPopServ();


        if($(window).outerWidth() > 580) {
            //BORDER FOR SLIDER__NEWS
            $('.slide__info').each(function(i,el) {
                if($(el).outerHeight() > $(el).next('.slide__image').find('img').outerHeight()) {
                    $(this).addClass('big').parent('.slide__box').addClass('big');
                } else {
                    $(this).removeClass('big').parent('.slide__box').removeClass('big');
                }
            });
        }



        //MOBILE MENU
        if($(window).outerWidth() <= 780) {


            // MOBILE MENU
            var needHeightMenu = $('.navigation').height() + parseInt($('.navigation').css('padding-top')) + parseInt($('.navigation').css('padding-bottom')) + $('.nav .header__right__contacts').outerHeight() + parseInt($('.nav .header__right__contacts').css('margin-top')) + 50;
            $('.nav, .nav .container').height(needHeightMenu);

            function mobileMenu() {
                if(needHeightMenu < $(window).outerHeight()) {
                    $('.nav, .nav .container').outerHeight($(window).outerHeight());
                    if($('body').hasClass('menu-opened')) {
                        $('body, html').outerHeight($(window).outerHeight());
                    } else {
                        $('body, html').css('height', 'auto');
                    }
                } else {
                    $('.nav, .nav .container,body, html').outerHeight(needHeightMenu);
                    if($('body').hasClass('menu-opened')) {
                        $('body, html').outerHeight(needHeightMenu);
                    } else {
                        $('body, html').css('height', 'auto');
                    }
                }
            }

            mobileMenu();

            $('a.mobile-button').click(function (e) {
                e.preventDefault();
                $('.nav').addClass('active');
                $('body').addClass('menu-opened');
                mobileMenu();
            });
            $('.close-menu__button').on('click', function(e) {
                e.preventDefault();
                $('.nav').removeClass('active');
                $('body').removeClass('menu-opened');
                mobileMenu();
            });


            //CHANGE PLACEHOLDER .search__submit
            document.querySelector('.search__input').placeholder = 'Найдите свою услугу';


            wasRebuild780 = true;
        } else if(wasRebuild780) {

            // MOBILE MENU (NAV)
            $('.nav, .nav .container').css({'height': 'auto'});


            //CHANGE PLACEHOLDER .search__submit
            document.querySelector('.search__input').placeholder = 'Найти';
        }


        if($(window).outerWidth() <= 580) {

            if(!$('.news__cover').hasClass('slick-initialized')) {
                $('.news__cover').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    infinity: true,
                    autoplay: false,
                    prevArrow: false,
                    nextArrow: '<span type="button" class="next-news"></span>',
                    responsive: {
                        'resize': true
                    }
                });
            }

            var maxHeightNewsSlide = 0;
            $('.ind .news__one').each(function(i,el){
                $(this).css({'height': 'auto'});
                if($(this).outerHeight() > maxHeightNewsSlide) {
                    maxHeightNewsSlide = $(this).outerHeight();
                }
            });
            $('.news__cover .news__one').each(function(i,el) {
                $(el).height(maxHeightNewsSlide);
            });



            //CUSTOM .choose-radio
            $('.choose-radio').styler();


            //MOVE .one-doctor__buttons if resolution is <= 579
            $('.one-doctor__buttons').each(function(i,el) {
                $(this).appendTo($(this).closest('.one-doctor'));
            });


            //MOVE CART ANALYZES IF RESOLUTION IS <= 580
            $('.cart-analyzes').insertBefore('.title-services-specialists .container');


            wasRebuild580 = true;

        } else if(wasRebuild580) {

            $('.news__cover').slick('unslick');


            //MOVE .one-doctor__buttons if resolution is > 579
            $('.one-doctor__buttons').each(function(i,el) {
                $(this).appendTo($(this).parent('.one-doctor').find('.one-doctor__info'));
            });


            //MOVE CART ANALYZES IF RESOLUTION IS > 580
            $('.cart-analyzes').appendTo('body');
        }
    }

});
