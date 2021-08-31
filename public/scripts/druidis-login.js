
function displayJoinErrors(errors) {
	const info = document.getElementById("signUpAlerts");
	info.innerHTML = "";
	
	// Loop through each error and display it in its own alert field.
	for(let i = 0;i < errors.length;i++) {
		const alert = createElement("div", {"class": "alert alert-fail"});
		alert.innerHTML = errors[i];
		info.appendChild(alert);
	}
}

document.getElementById("signUpSubmit").addEventListener("click", async () => {
	if(!config.api) { console.error("Unable to post. `config.api` is not set."); return; }
	
	const elSubmit = document.getElementById("signUpSubmit");
	
	// Prevent re-submissions.
	if(elSubmit.value !== "Sign Up") { return; }
	
	// Make sure there is content to submit:
	const elUsername = document.getElementById("username");
	const elEmail = document.getElementById("email");
	const elPassword = document.getElementById("password");
	const elTos = document.getElementById("tos");
	const elPrivacy = document.getElementById("privacy");
	
	const data = {
		"username": elUsername.value,
		"email": elEmail.value,
		"pass": elPassword.value,
		"tos": elTos.checked ? true : false,
		"privacy": elPrivacy.checked ? true : false,
	};
	
	const errors = [];
	
	if(!data.username) { errors.push("Must provide a username."); }
	else if(data.username.length < 6) { errors.push("Username must be between 6 and 16 characters."); }
	if(!data.email || !data.email.match(/^\S+@\S+\.\S+$/)) { errors.push("Must provide a valid email."); }
	if(!data.pass || data.pass.length < 8) { errors.push("Password must be at least eight characters."); }
	if(!data.tos) { errors.push("Must agree to the Terms of Service."); }
	if(!data.privacy) { errors.push("Must agree to the Privacy Policy."); }
	
	displayJoinErrors(errors);
	if(errors.length > 0) { return; }
	
	elSubmit.value = "Submitting...";
	
	// Submit Content to API
	const response = await fetch(`${config.api}/data/test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
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
	
	console.log(json);
});
