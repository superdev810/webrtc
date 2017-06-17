$(document).ready(function (){
	var humanCount = 10;
	var humanBarWidth = 0;
	var resizeHumanBar = function(){
		humanBarWidth = 154 * humanCount;
		$("#humans-bar").css("width", humanBarWidth);
	};
	var addHumanItems = function() {
		for (var i = 0; i < humanCount; i++)
		{
			$("#humans-bar").append("<button id='human_" + i + "' class='human'>");
		}
		resizeHumanBar();
	};
	var mouseLock = false;
	var originPosX = 0;
	var originMouseX = 0;
	$("#humans-bar").on("mousedown", function(event){
		if (mouseLock) return;
		mouseLock = true;
		originMouseX = event.clientX;
	});
	$("#humans-bar").on("mousemove", function(event){
		if (!mouseLock) return;
		var posX = originPosX + (event.clientX - originMouseX);
		if (posX <= -humanBarWidth + $(".bottom-background").width() + 10)
			posX = -humanBarWidth + $(".bottom-background").width() + 10;
		if (posX >= 0)
			posX = 0;
			
		$("#humans-bar").css("left", posX + "px");
	});
	$("#humans-bar").on("mouseup", function(event){
		if (!mouseLock) return;
		var posX = originPosX + (event.clientX - originMouseX);
		if (posX <= -humanBarWidth + $(".bottom-background").width() + 10)
			posX = -humanBarWidth + $(".bottom-background").width() + 10;
		if (posX >= 0)
			posX = 0;
		originPosX = posX;
		$("#humans-bar").css("left", originPosX + "px");
		mouseLock = false;
	});
	addHumanItems();
	
	var resizeWindow = function(){
		var h = $(document).height();
		var w = $(document).width();
		console.log(h);
		if (h > 800 && w > 991)
		{
			$(".humans-bar-top").css("position", "absolute");
		} else {
			$(".humans-bar-top").css("position", "relative");
		}
	};
	$(window).on("resize", resizeWindow);
	resizeWindow();
	
	$(".upload-btn").on("click", function(){
		$(".upload-dialog").show();
	});
	$(".btn-close").on("click", function(){
		$(".upload-dialog").hide();
	});
	$(".human").on("dblclick", function(){
		location.href = "7.html";
	});
	$(".button2").on("click", function(){
		location.href = "3.html";
	});
});