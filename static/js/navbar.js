var startY = 80;
function checkScroll() {
    //The point where the navbar changes in px
    if ($(window).scrollTop() > startY) {
        $('.navbar').addClass("scrolled");
        return true
    } else {
        $('.navbar').removeClass("scrolled");
        return false
    }
}

$(document).ready(function () {
    $('.navbar > button').on('click', function () {
        $('.navbar-dark').toggleClass('expanded');
    });
    if ($('.navbar').length > 0) {
        $(window).on("scroll load resize", function () {
            checkScroll();
        });
    }
    // Add slideDown animation to Bootstrap dropdown when expanding.
    $('.dropdown').on('show.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideUp animation to Bootstrap dropdown when collapsing.
    $('.dropdown').on('hide.bs.dropdown', function () {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });
});

function searchExpand(element) {
    let query = $("form#main-search input.search").val()
    if ($(element).hasClass("search-expanded") && query && query != "") {
        $(element).closest('form#main-search').submit()
    } else {
        $(element).toggleClass("search-expanded");
        $("form#main-search input.search").toggleClass("search-active").focus()
        $(element).val("");
    }
}