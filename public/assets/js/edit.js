$(document).ready(function(){
	$(".hand-cursor").click(function(){
		var parent = $(this).parent().parent();
		var name = parent.find('td').eq(1).text();
		var email = parent.find('td').eq(2).text();
		$('.name-txt').val(name);
		$('.email-txt').val(email);
		console.log(name + ', ' + email);
	});
});
