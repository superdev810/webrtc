$(document).ready(function(){
	$(".checkbox").click(function(){
		if($(this).hasClass("checked"))
		{
			$(this).removeClass("checked");
			$(this).find("input:checkbox").prop("checked", false);
		}
		else
		{
			$(this).addClass("checked");
			$(this).find("input:checkbox").prop("checked", true);
		}
	});
	$("#btn-create").on("click", function(){
		location.href = "5.html";
	});
	$("#log-out a").on("click", function(){
		location.href = "3.html";
	});
});