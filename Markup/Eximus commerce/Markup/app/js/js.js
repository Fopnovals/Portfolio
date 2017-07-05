'use strict';

$(document).ready(function () {

    /*SLIDER*/
    $('.slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        prevArrow: '<span type="button" class="slick-prev"></span>',
        nextArrow: '<span type="button" class="slick-next"></span>',
        responsive: [{
            breakpoint: 661,
            settings: {
                arrows: false
            }
        }]
    });

    //SLIDER INTERESTING
    $('.interesting-items').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        appendArrows: $(".arrows-interesting"),
        prevArrow: '<span class="go go-to-left"></span>',
        nextArrow: '<span class="go go-to-right"></span>',
        responsive: [{
            breakpoint: 480,
            settings: {
                slidesToShow: 1
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 2
            }
        }]
    });

    //SLIDER RELATED
    $('.related-items').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        appendArrows: $(".arrows-interesting"),
        prevArrow: '<span class="go go-to-left"></span>',
        nextArrow: '<span class="go go-to-right"></span>',
        responsive: [{
            breakpoint: 380,
            settings: {
                slidesToShow: 1
            }
        }, {
            breakpoint: 550,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 767,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 910,
            settings: {
                slidesToShow: 4
            }
        }]
    });

    //SLIDER DETAILS
    $('.gorizontal-slider').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        dots: false,
        initialSlide: 0,
        focusOnSelect: true,
        infinite: false,
        //variableWidth: true,
        appendArrows: $(".arrows-detail, .popup-arrows"),
        prevArrow: '<span class="details-left"></span>',
        nextArrow: '<span class="details-right active"></span>',
        responsive: [{
            breakpoint: 1100,
            settings: {
                variableWidth: true
            }
        }]
    });

    $('.vertical-slider').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        dots: false,
        vertical: 'true',
        initialSlide: 0,
        focusOnSelect: true,
        infinite: false,
        appendArrows: $(".arrows-detail, .popup-arrows"),
        prevArrow: '<span class="details-left"></span>',
        nextArrow: '<span class="details-right active"></span>'
    });
    if ($('.vertical-slider').length) {
        var slider = '.vertical-slider';
    } else if ($('.gorizontal-slider').length) {
        var slider = '.gorizontal-slider';
    }

    //show big image on click arrows
    $(document).on('click', '.details-left', function () {
        var currentSlide = $(slider).find('.one-slide.slick-current'),
            currentSlideIndex = currentSlide.index(),
            sliderLength = $(slider + ' .one-slide').length - 1;
        if (currentSlideIndex < sliderLength) {
            $('.details-right').addClass('active');
        }
        if (!currentSlideIndex) {
            $(this).removeClass('active');
        }
        showBigImage.call(currentSlide.find('img'));
    });
    $(document).on('click', '.details-right', function () {
        var currentSlide = $(slider).find('.one-slide.slick-current'),
            currentSlideIndex = currentSlide.index(),
            sliderLength = $(slider + ' .one-slide').length - 1;
        if (currentSlideIndex) {
            $('.details-left').addClass('active');
        }
        if (currentSlideIndex == sliderLength) {
            $(this).removeClass('active');
        }
        showBigImage.call(currentSlide.find('img'));
    });

    //close popup on click body
    $('html, body').on('click', function (e) {
        //e.stopPropagation();
        if (!$(e.target).closest('.popup-slider').length && $('.popup-slider.active').length) {
            $('.popup-slider').removeClass('active');
        }
    });

    //show big image on click thumbnails
    $('.one-slide img').on('click', function () {
        showBigImage.call(this);
        setTimeout(function () {
            var currentSlide = $(slider).find('.one-slide.slick-current'),
                currentSlideIndex = currentSlide.index(),
                sliderLength = $(slider + ' .one-slide').length - 1;
            if (currentSlideIndex) {
                $('.details-left').addClass('active');
            } else {
                $('.details-left').removeClass('active');
            }
            if (currentSlideIndex == sliderLength) {
                $('.details-right').removeClass('active');
            } else {
                $('.details-right').addClass('active');
            }
        }, 300);
    });

    //function which get path from thumbnails, replace directory and add this path to big current slide
    function showBigImage() {
        var thisSrc = $(this).attr('src'),
            bigImage = thisSrc.replace('thumbnails', 'forslider');
        $('.current-image-a').attr('style', 'background-image: url(' + bigImage + ')');
    }

    //show popup on click big image
    $(document).on('click', '.current-image-a', function (e) {
        e.preventDefault();
        setPopupImage.call(this);
    });

    function setPopupImage() {
        var src = $(this).attr('style'),
            newSrc = src.replace('forslider', 'forpopup');
        if (!$('.popup-slider.active').length) {
            $('.popup-slider').addClass('active');
        }
        $('.popup-image').attr('style', newSrc);
    }

    //init click on slider arrows when clicked on popup arrows
    $(document).on('click', '.popup-arrows .slick-arrow', function (e) {
        e.preventDefault();
        if ($(this).hasClass('details-left')) {
            $('.arrows-detail .details-left').trigger('click');
            $('.current-image-a').trigger('click');
        } else {
            $('.arrows-detail .details-right').trigger('click');
            $('.current-image-a').trigger('click');
        }
    });

    //tabs
    $('.tabs-title').on('click', function () {
        $('.tabs-title').removeClass('active');
        $(this).addClass('active');
        var indexThis = $(this).index();
        $('.tabs-item').removeClass('active').eq(indexThis).addClass('active');
    });

    //compare table - set same height of table
    function setHeight() {
        var rows = $('.compare-table tr'),
            rowsSecond = $('.first-col');
        rowsSecond.each(function (i, el) {
            if ($(el).outerHeight() < rows.eq(i).outerHeight()) {
                $(el).outerHeight(rows.eq(i).outerHeight());
            } else {
                rows.eq(i).outerHeight($(el).outerHeight());
            }
        });
    }
    setTimeout(function () {
        setHeight();
    }, 800);

    //roll up filters in catalogs and bind click for open this filters
    if ($(window).outerWidth() <= 560) {
        rollUpFilters();
    } else {
        rollDownFilters();
    }

    $(window).on('resize', function () {
        if ($(window).outerWidth() <= 560) {
            rollUpFilters();
        } else {
            rollDownFilters();
        }
    });

    function rollUpFilters() {
        $('.filter-item:not(:first-of-type)').addClass('rolled');
        $('.filter-item:not(:first-of-type) .box-name').on('click', function () {
            if ($(this).parent().hasClass('rolled')) {
                $(this).parent().removeClass('rolled');
            } else {
                $(this).parent().addClass('rolled');
            }
        });
    }

    function rollDownFilters() {
        $('.filter-item').removeClass('rolled');
        $('.box-name').unbind('click');
    }

    //mobile menu
    $('.burger').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $('.header-bottom').toggleClass('active');
        var _this = $(this);
        setTimeout(function () {
            if (_this.hasClass('active')) {
                $('body, html').outerHeight($('.header-bottom').outerHeight()).css('overflow', 'hidden');
            } else {
                $('body, html').css({ 'height': 'auto', 'overflow-y': 'auto' });
            }
        }, 400);
    });

    //tabs-sliders

    function setActiveTab(activeTab) {
        var slidersTabs = $('.slider-items-container'),
            titlesTabs = $('.filter-list');

        slidersTabs.hide();

        titlesTabs.each(function (i, el) {
            if ($(el).hasClass('active')) {
                activeTab = i;
                slidersTabs.eq(i).show();
                /*SLIDER ITEMS*/
                $('.slider-items-container').eq(i).find('.slider-items').slick({
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    dots: false,
                    appendArrows: $(".arrows-items"),
                    prevArrow: '<span class="go go-to-left"></span>',
                    nextArrow: '<span class="go go-to-right"></span>',
                    responsive: [{
                        breakpoint: 380,
                        settings: {
                            slidesToShow: 1
                        }
                    }, {
                        breakpoint: 550,
                        settings: {
                            slidesToShow: 2
                        }
                    }, {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: 3
                        }
                    }, {
                        breakpoint: 910,
                        settings: {
                            slidesToShow: 4
                        }
                    }]
                });
            } else {
                if ($('.slider-items-container').eq(i).find('.slider-items').hasClass('slick-initialized')) {
                    $('.slider-items-container').eq(i).find('.slider-items').slick('unslick');
                }
            }
        });
    }

    setActiveTab();

    $('.filter-list').on('click', function (e) {
        e.preventDefault();
        var numberActive;
        $('.filter-list').each(function (i, el) {
            if ($(el).hasClass('active')) {
                numberActive = i;
            }
        });
        $('.filter-list').removeClass('active');
        $(this).addClass('active');
        $('.filter-list').each(function (i, el) {
            if ($(el).hasClass('active')) {
                if (numberActive !== i) {
                    setActiveTab();
                }
            }
        });
    });
});