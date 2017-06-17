$(document).ready(function (){
	var resizeVideo = function(){
		var w = $(document).width();
		var h = $(document).height();
		var vw = 0;
		var vh = 0;
		if (w > h)
		{
			vh = h * 0.7;
			vw = vh * 4 / 3;
		} else {
			vw = w * 0.9;
			vh = vw * 3 / 4;
		}
		$(".video-frame").css("width", vw);
		$(".video-frame").css("height", vh + 80);
		$(".video-content").css("height", vh);
		$(".video-frame").css("margin-top", ((h - vh) / 2 - 60) + "px");
	};
	$(window).on("resize", resizeVideo);
	resizeVideo();
	$(".video-power").on("click", function(){
		location.href = "5.html";
	});
});