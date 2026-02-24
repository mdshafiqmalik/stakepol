var container = $("#container");
const hamburger = $("#hamburger");
const sidebarList = $("#sidebarList")

hamburger.click(function () {
    if (container.attr('data_sidebar') === 'deactive') {
        // remove inline style from hamburger
        sidebarList.removeAttr('style');
        // set active
        container.attr('data_sidebar', 'active');
    } else {
        // add style
        sidebarList.attr('style', 'transform:translateX(0);pointer-events:unset;');
        // set deactive
        container.attr('data_sidebar', 'deactive');
    }
});

$("#togglebtn").click(function () {
    $("#sidebar").toggleClass("sidebar_collapsed")
});