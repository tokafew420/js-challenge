(function (window, $) {
    "use strict";
    var app = window.app = window.app || {};

    // https://davidwalsh.name/function-debounce
    app.debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    app.backdrop = {
        show: function (selector) {
            selector = selector || 'body';
            var $container = $(selector);
            var $backdrop = $('.modal-backdrop', $container);

            if ($backdrop.length === 0) {
                $backdrop = $('<div class="modal-backdrop fade"></div>');
                $backdrop.appendTo($container);
            }

            setTimeout(function () {
                $backdrop.addClass('show');
            }, 0);
        },
        hide: function (selector) {
            selector = selector || 'body';
            var $container = $(selector);
            var $backdrop = $('.modal-backdrop', $container);

            if ($backdrop.length) {
                $backdrop.removeClass('show');
            }

            setTimeout(function () {
                $backdrop.remove();
            }, 150);
        }
    };

    var $progress = $('.progress-wrapper');
    var $progressbar = $('.progress-bar', $progress);
    app.progress = {
        show: function() {
            app.backdrop.show();
            app.progress.update(0);
            $progress.show();
        },
        hide: function() {
            $progress.hide();
            app.progress.update(0);
            app.backdrop.hide();
        },
        update: function(precent) {
            precent = ((precent || 0) * 100).toFixed(2);
            $progressbar.width(precent + '%').attr('aria-valuenow', precent).text(precent + '%');
        }
    };

    // Collapse Navbar
    var navbarCollapse = function () {
        $('.navbar-collapse').collapse('hide');
    };

    // Collapse now if page is not at top
    navbarCollapse();

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        var $this = $(this);
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            var $target = $(this.hash);
            $target = $target.length ? $target : $('[name=' + this.hash.slice(1) + ']');
            if ($target.length) {
                $('html, body').animate({
                    scrollTop: $target.offset().top - 74
                }, 1000, "easeInOutExpo");

                $('.nav-item', $this.closest('.navbar-nav')).removeClass('active').find('.sr-only').remove();
                $this.closest('.nav-item').addClass('active').find('.nav-link').append('<span class="sr-only">(current)</span>');

                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(navbarCollapse);

    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);

    $('body').scrollspy({
        target: '.navbar',
        offset: 74
    });

    // https://github.com/twbs/bootstrap/issues/20086
    $(window).on('activate.bs.scrollspy', function () {
        var $activated = $('.navbar .nav-link.active');

        if ($activated.length) {
            $('.navbar .nav-item').removeClass('active').find('.sr-only').remove();
            $activated.closest('.nav-item').addClass('active');
            $activated.append('<span class="sr-only">(current)</span>');
        }
    });

    $("[data-toggle=popover]").popover();

    $('footer #year').text(new Date().getFullYear());
})(window, jQuery);