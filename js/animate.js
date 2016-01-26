$(window).scroll(function() {
	console.log("Running");
	myOffset = 10;
	$(".animateEntrance").each(function(){
            if ($(window).scrollTop() > $(this).offset().top - $(window).height() - myOffset && $(window).scrollTop() < $(this).offset().top ) {
                $(this).css({
                    "opacity" : "1",
                    "transform" : "translateY(0%)"
                });   
            }
	});
});