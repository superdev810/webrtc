$(document).ready(function(){
	$(".checkbox").click(function(){
		if($(this).hasClass("checked"))
		{
			$(this).removeClass("checked");
			$(this).find("input:checkbox").attr("checked", false);
		}
		else
		{
			$(this).addClass("checked");
			$(this).find("input:checkbox").attr("checked", true);
		}
	});
	$("#log-out").on("click", function(){
		location.href = "/auth/signout";
	});
});
