
function displayJoinErrors(errors) {
	const info = document.getElementById("alertBox");
	info.innerHTML = "";
	
	// Loop through each error and display it in its own alert field.
	for(let i = 0;i < errors.length;i++) {
		const alert = createElement("div", {"class": "alert alert-fail"});
		alert.innerHTML = errors[i];
		info.appendChild(alert);
	}
}

// Log In Submission
const elLogin = document.getElementById("loginSubmit");

if(elLogin) {
	elLogin.addEventListener("click", async () => {
		if(!config.api) { console.error("Unable to post. `config.api` is not set."); return; }
		
		// Prevent re-submissions.
		if(elLogin.value !== "Log In") { return; }
		
		// Make sure there is content to submit:
		const elUsername = document.getElementById("user");
		const elPassword = document.getElementById("pass");
		
		const data = {
			"user": elUsername.value,
			"pass": elPassword.value,
		};
		
		const errors = [];
		
		if(!data.user) { errors.push("Please provide a username."); }
		if(!data.pass) { errors.push("Please provide a password."); }
		
		displayJoinErrors(errors);
		if(errors.length > 0) { return; }
		
		elLogin.value = "Submitting...";
		
		// Submit Content to API
		const response = await fetch(`${config.api}/user/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Credentials': 'include', // Needed or Cookies will not be sent.
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify(data)
		});
		
		// Retrieve Response
		const respData = await response.json();
		const json = respData.d;
		
		if(!json) {
			errors.push("Error: Server response was invalid. May need to contact the webmaster.");
			displayJoinErrors(errors);
			return;
		}
		
		// Verify the data, to see if there's final success.
		// TODO: VERIFY
		
		// Success
		
		// TODO: Redirect, Process, etc.
		// document.cookie = `login="${json}"; Max-Age=86400; HttpOnly;`;
		
		console.log(json);
	});
}

// Sign Up Submission
const elSignUp = document.getElementById("signUpSubmit");

if(elSignUp) {
	elSignUp.addEventListener("click", async () => {
		if(!config.api) { console.error("Unable to post. `config.api` is not set."); return; }
		
		// Prevent re-submissions.
		if(elSignUp.value !== "Sign Up") { return; }
		
		// Make sure there is content to submit:
		const elUsername = document.getElementById("user");
		const elEmail = document.getElementById("email");
		const elPassword = document.getElementById("pass");
		const elTos = document.getElementById("tos");
		const elPrivacy = document.getElementById("privacy");
		
		const data = {
			"user": elUsername.value,
			"email": elEmail.value,
			"pass": elPassword.value,
			"tos": elTos.checked ? true : false,
			"privacy": elPrivacy.checked ? true : false,
		};
		
		const errors = [];
		
		if(!data.username) { errors.push("Must provide a username."); }
		else if(data.user.length < 6) { errors.push("Username must be between 6 and 16 characters."); }
		if(!data.email || !data.email.match(/^\S+@\S+\.\S+$/)) { errors.push("Must provide a valid email."); }
		if(!data.pass || data.pass.length < 8) { errors.push("Password must be at least eight characters."); }
		if(!data.tos) { errors.push("Must agree to the Terms of Service."); }
		if(!data.privacy) { errors.push("Must agree to the Privacy Policy."); }
		
		displayJoinErrors(errors);
		if(errors.length > 0) { return; }
		
		elSignUp.value = "Submitting...";
		
		// Submit Content to API
		const response = await fetch(`${config.api}/user/sign-up`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Credentials': 'include', // Needed or Cookies will not be sent.
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify(data)
		});
		
		// Retrieve Response
		const respData = await response.json();
		const json = respData.d;
		
		if(!json) {
			errors.push("Error: Server response was invalid. May need to contact the webmaster.");
			displayJoinErrors(errors);
			return;
		}
		
		// Verify the data, to see if there's final success.
		// TODO: VERIFY
		
		// Success
		
		// TODO: Redirect, Process, etc.
		
		console.log(json);
	});
}