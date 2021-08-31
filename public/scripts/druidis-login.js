
function resetSubmissionContent() {
	
	// Reset Input Fields
	const elUsername = document.getElementById("username");
	const elEmail = document.getElementById("email");
	const elPassword = document.getElementById("password");
	const elTos = document.getElementById("tos");
	const elPrivacy = document.getElementById("privacy");
	const elSubmit = document.getElementById("signUpSubmit");
	
	elUsername.value = "";
	elEmail.value = "";
	elPassword.value = "";
	elTos.checked = false;
	elPrivacy.checked = false;
	elSubmit.value = "Sign Up";
	
	resetPostDisplay();
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
	
	if(!data.username) { alert("Must provide a username."); return; }
	if(data.username.length < 6) { alert("Username for new users must be between 6 and 16 characters."); return; }
	if(!data.email || !data.email.match(/^\S+@\S+\.\S+$/)) { alert("Must provide a valid email."); return; }
	if(!data.pass || data.pass.length < 8) { alert("Password must be at least eight characters."); return; }
	if(!data.tos.checked) { alert("Must agree to the Terms of Service."); return; }
	if(!data.privacy.checked) { alert("Must agree to the Privacy Policy."); return; }
	
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
	
	if(!json) { console.error("Post submission response was empty or invalid."); return; }
	
	console.log(json);
});
