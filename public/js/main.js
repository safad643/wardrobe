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
	const title = document.querySelector('.title');
	if (title.innerHTML === 'Login') {
		document.getElementById('errp').innerHTML = '';
		document.querySelector('.txt').innerHTML = '— Or Register With —';
		document.querySelector('.form').action = '/user/register';
		document.querySelector('.form').onsubmit = conformpass;
		document.querySelector('.forgot').innerHTML = '';
		title.innerHTML = 'Register';
		document.getElementById('bb').innerHTML = 'Register';
		document.querySelector('h5').innerHTML = 'have an account?';
	} else {
		document.getElementById('errp2').innerHTML = '';
		document.querySelector('.form').onsubmit = null;
		document.querySelector('.txt').innerHTML = '— Or Log In With —';
		document.querySelector('.form').action = '/user/login';
		document.querySelector('.forgot').innerHTML = 'Forgot Password';
		document.getElementById('bb').innerHTML = 'Login';
		title.innerHTML = 'Login';
		document.querySelector('h5').innerHTML = 'Don\'t have an account?';
	}

	const form = document.querySelector('.signin-form');
	const button = document.getElementById('btn');
	const emailInput = form.querySelector('.a'); // Assuming email input has class 'a'
	const passwordInput = form.querySelector('.b'); // Assuming password input has class 'b'

	if (!document.querySelector('.new-input')) {
		// Create the Name input field
		const nameInput = document.createElement('input');
		nameInput.name = 'name';
		nameInput.type = 'text';
		nameInput.className = 'form-control new-input mb-3';
		nameInput.placeholder = 'Name';
		nameInput.required = false;

		// Create the Confirm Password input field
		const confirmPasswordInput = document.createElement('input');
		confirmPasswordInput.id = 'cpass';
		confirmPasswordInput.type = 'password';
		confirmPasswordInput.name = 'cpassword';
		confirmPasswordInput.className = 'form-control new-input mb-3';
		confirmPasswordInput.placeholder = 'Confirm Password';
		confirmPasswordInput.required = false;

		// Insert the Name input at the top of the form
		form.insertBefore(nameInput, form.firstChild); // Insert nameInput at the very top
		// Insert the Confirm Password input before the button
		form.insertBefore(confirmPasswordInput, button);

		// Add visibility with a slight delay
		setTimeout(() => {
			nameInput.classList.add('visible');
			confirmPasswordInput.classList.add('visible');
		}, 10);
	} else {
		const inputs = form.querySelectorAll('.new-input');
    
    // Fade out both inputs
    inputs.forEach(input => input.classList.remove('visible'));
    
    // Remove after transition
    setTimeout(() => {
        inputs.forEach(input => form.removeChild(input));
    }, 0);
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
		document.getElementById('errp5').innerHTML='password not strong'
		e.preventDefault()
	}
	else{
		return true
	}
}


document.addEventListener('DOMContentLoaded', function () {
	const form = document.querySelector('.signin-form');
	const emailField = document.getElementById('email-field');
	const passwordField = document.getElementById('password-field');
	const errorMessage = document.getElementById('errp');
	const errorMessage2 = document.getElementById('errp2');

	form.addEventListener('submit', function (event) {
			let isValid = true;
			errorMessage.textContent = ''; // Clear previous error messages
			errorMessage2.textContent = ''; // Clear previous error messages

			// Validate Email
			if (!emailField.value) {
					emailField.classList.add('invalid');
					errorMessage.textContent = 'Email is required.'; // Specific error message
					isValid = false;
			} else if (!validateEmail(emailField.value)) {
					emailField.classList.add('invalid');
					errorMessage.textContent = 'Invalid email format.'; // Specific error message
					isValid = false;
			} else {
					emailField.classList.remove('invalid');
			}

			// Validate Password
			if (!passwordField.value) {
					passwordField.classList.add('invalid');
					errorMessage2.textContent = 'Password is required.'; // Specific error message
					isValid = false;
			} else {
					passwordField.classList.remove('invalid');
			}

			// If form is not valid, prevent submission
			if (!isValid) {
					event.preventDefault();
			}
	});

	// Function to validate email format
	function validateEmail(email) {
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return re.test(String(email).toLowerCase());
	}

	
});
function forgot(){
	
	if(document.getElementById('email-field').value===''){
		document.getElementById('errp').innerHTML='enter email to reset password'
	}else{
		window.location.href='/user/forgot/'+document.getElementById('email-field').value
	}
}
