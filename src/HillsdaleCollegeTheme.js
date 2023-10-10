jQuery(document).ready(function ($) {

	// Close the main navigation if a click event occurs outside of the navigation panel
	$(document).click(function (event) {
		var clickover = $(event.target);
		var $navbar = $("#primary-nav");
		var _opened = $navbar.hasClass("active");

		if (clickover.closest(".navbar").length == 0) {
			$(".submenu.collapse.show").removeClass("show");

			if (_opened === true) {
				$("#sidebarCollapse").click();
			}
		}
	});

	// Manage the main navigation hamburger menu click
	$("#sidebarCollapse").on("click", function () {
		$(this).toggleClass("active");
		$("#primary-nav").toggleClass("active");
		$(".screen-overlay").toggleClass("active");

		$("#primary-nav").attr('aria-expanded', function (i, attr) { return attr == 'true' ? 'false' : 'true' });
	});

	// Mobile side-nav
	// if (window.matchMedia('(max-width: 1199.98px)').matches) {
	//     // Instantiate the scrollbar for the main navigation on mobile
	//     $("#primary-nav").mCustomScrollbar({
	//         theme: "minimal"
	//     });
	// }

	// Hide carousel navigation if only one carousel item exists
	$(".carousel").each(function () {
		if ($(this).find(".carousel-inner > .carousel-item").length == 1) {
			$(this).find(".carousel-control-prev").hide();
			$(this).find(".carousel-control-next").hide();
		}
	});

	// Adjust upper padding of main nav based on height of other header elements
	// $(window).on('load resize', function () {
	// 	var lwHeight = $("#logo-wrapper").outerHeight(false);
	// 	var snHeight = $("#site-nav").outerHeight(false);
	// 	var newHeight = snHeight > lwHeight ? snHeight : lwHeight;

	// 	$("body").css("padding-top", newHeight + "px");

	// 	if (window.matchMedia('(max-width: 1199.98px)').matches) {
	// 		$("#primary-nav").css("padding-top", newHeight + "px");
	// 	} else {
	// 		$("#primary-nav").css("padding-top", "0");
	// 	}
	// });

});
