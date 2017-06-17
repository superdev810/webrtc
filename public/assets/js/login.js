jQuery(document).ready(function ($) {
	var index = 0;
	var changeImg = function() {
		if(index % 2 == 0) {
			$('#logo-img').attr('src', 'assets/image/first_icon_enable.png');
		}else {
			$('#logo-img').attr('src', 'assets/image/first_icon_disable.png');
		}
		index++;
		setTimeout(changeImg, 1000);
	};
	setTimeout(changeImg, 1000);
	
	$(".make-room-btn").on("click", function(){
		location.href = "4.html";
	});
	
	$(".top-label").on("click", function(){
		location.href = "8.html";
	});
});