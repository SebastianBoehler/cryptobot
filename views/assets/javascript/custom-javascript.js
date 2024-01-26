

/* -------------------- Navbar Setting -------------------- */

$(window).scroll(function () {
    $(".navbar").toggleClass("scroll", $(this).scrollTop() > 1)
    $("#scroll-top").toggleClass("scroll", $(this).scrollTop() > 1)
});