(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$(".toggle-password").click(function() {

	  $(this).toggleClass("fa-eye fa-eye-slash");
	  var input = $($(this).attr("toggle"));
	  if (input.attr("type") == "password") {
	    input.attr("type", "text");
	  } else {
	    input.attr("type", "password");
	  }
	});

})(jQuery);
function addInputs() {
	const title=document.querySelector('.title')
	if(title.innerHTML==='Login'){
		document.getElementById('errp').innerHTML=''
		document.querySelector('.txt').innerHTML='— Or Register With —'
		document.querySelector('.form').action='/user/register'
		document.querySelector('.form').onsubmit=conformpass
		document.querySelector('.forgot').innerHTML=''
		title.innerHTML='Register'
		document.getElementById('bb').innerHTML='Register'
	}
	else{
		document.getElementById('errp2').innerHTML=''
		document.querySelector('.form').onsubmit=null
		document.querySelector('.txt').innerHTML='— Or Log In With —'
		document.querySelector('.form').action='/user/login'
		document.querySelector('.forgot').innerHTML='Forgot Password'
		document.getElementById('bb').innerHTML='Login'
		title.innerHTML='Login'
	}
	const form = document.querySelector('.signin-form');
	const button = document.getElementById('btn');
	const emailInput = form.querySelector('.a')
	console.log(emailInput);
	
	const confirmPasswordInput = form.querySelector('.b');

	if (!document.querySelector('.new-input')) {
		const emailInput = document.createElement('input');
		emailInput.name='name'
		emailInput.type = 'text';
		emailInput.className = 'form-control new-input mb-3 a';
		emailInput.placeholder = 'name';
		emailInput.required = true;

		
		const confirmPasswordInput = document.createElement('input');
		confirmPasswordInput.id='cpass'
		confirmPasswordInput.type = 'password';
		confirmPasswordInput.name='cpassword'
		confirmPasswordInput.className = 'form-control new-input b mb-3';
		confirmPasswordInput.placeholder = 'Confirm Password';
		confirmPasswordInput.required = true;

		
		
		form.insertBefore(confirmPasswordInput,button );
		form.insertBefore(emailInput,button );

		
		setTimeout(() => {
			emailInput.classList.add('visible');
			confirmPasswordInput.classList.add('visible');
		}, 10);
	}else {
	
	emailInput.classList.remove('visible');
	confirmPasswordInput.classList.remove('visible');

	
	setTimeout(() => {
		form.removeChild(emailInput);
		form.removeChild(confirmPasswordInput);
	}, 400);
}
}

function conformpass(e){
	console.log('h8iokn');
	
	
	const cpass = document.getElementById('cpass').value
	const pass = document.getElementById('password-field').value
	const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
	
	if(!(cpass===pass)){
		document.getElementById('errp2').innerHTML='passpord didnt match'
		e.preventDefault()
	}
	else if(!strongPasswordRegex.test(pass)){
		alert('passwords not strong')
		e.preventDefault()
	}
	else{
		return true
	}
}


