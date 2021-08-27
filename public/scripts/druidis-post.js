
// metaData: Data Structure for an OpenGraph Page
class ogMetaData {
	
	constructor() {
		this.url = "";
		this.title = "";
		this.image = new ogMetaVisual();
		this.video = new ogMetaVisual();
		// this.audio = new metaAudio;
		this.content = "";
		this.comment = "";
		
		// Miscellaneous
		this.determiner = "";			// Word that appears before object's title in a sentence. Enum of (a, an, the, "", auto).
		this.locale = "";
		this.site_name = "";
		this.type = "";					// video, article, book, profile, website (default)
		this.mediaClass = null;			// Contains data related to the 'type' property.
	}
	
	async getImageSize(url) {
		const img = new Image();
		img.src = url;
		await img.decode();
		this.image.width = img.width;
		this.image.height = img.height;
	}
}

// ogMetaVisual: Data Structure for Images and Videos
class ogMetaVisual {
	
	constructor() {
		this.url = "";
		this.mimeType = "";
		this.width = 0;
		this.height = 0;
		this.alt = "";
		this.locked = false;
	}
	
	setUrl(url) { this.url = url; }
	setMimeType(mimeType) { this.mimeType = mimeType; }
	setWidth(width) { this.width = width; }
	setHeight(height) { this.height = height; }
	setAlt(alt) { this.alt = alt; }
	
	lock() { this.locked = true; }
	
	isSmall() {
		if(this.width && this.width < 300) { return true; }
		if(this.height && this.height < 200) { return true; }
		return false;
	}
}

async function parseOpenGraph(doc, metaData) {
	
	// Trackers
	let scanForType = "";	// As we loop through meta tags, some are based on the last ones located (such as 'image' and 'video'), so track the 'current' set.
	const metaElements = doc.getElementsByTagName("meta");
	
	// Loop through every meta value.
	for(a = 0; a < metaElements.length; a++) {
		
		// Get the MetaTag Data
		const metaVals = metaElements[a];
		const metaName = metaVals.getAttribute("property") ? metaVals.getAttribute("property") : metaVals.name;
		if(!metaName || !metaVals.content) { continue; }
		const metaContent = metaVals.content;
		
		// Split to detect sets:
		const s = metaName.split(":");		// Splits into 2 or 3 parts. Ex: "og:image:width" -> ['og', 'image', 'width']
		const name = s[1];
		const nameProp = s[2];
		
		// Apply Detected Content to Values
		if(name == "url") { metaData.url = metaContent; scanForType = ""; }
		if(name == "title") { metaData.title = metaContent; scanForType = ""; }
		if(name == "description") { metaData.content = metaContent.substring(0, 256); scanForType = ""; }
		if(name == "determiner") { metaData.determiner = metaContent; scanForType = ""; }
		if(name == "locale") { metaData.locale = metaContent; scanForType = ""; }
		if(name == "site_name") { metaData.site_name = metaContent; scanForType = ""; }
		
		// Special Image & Video Behaviors
		// If the visual (image or video) is locked, it cannot be changed. This happens because we've cycled to the NEXT image or video.
		if((name == "image" || name == "video") && !metaData[name].locked) {
			
			// If there is a property attached to the name (such as image.width), then we need to consider the previous meta tag.
			if(nameProp) {
				if(nameProp == "url") { metaData[name].setUrl(metaContent); }
				if(nameProp == "secure_url" && !metaData[name].url) { metaData[name].setImage(metaContent); }
				if(nameProp == "type") { metaData[name].setMimeType(metaContent); }
				if(nameProp == "width") { metaData[name].setWidth(metaContent); }
				if(nameProp == "height") { metaData[name].setHeight(metaContent); }
				if(nameProp == "alt") { metaData[name].setAlt(metaContent); }
			} else {
				
				// Make sure we didn't switch to a new visual (image or video). If we did, lock this one so it can't change now.
				if(scanForType == name) { metaData[name].lock(); }
				
				// Otherwise, assign the URL.
				else { metaData[name].setUrl(metaContent); }
			}
			
			scanForType = name;	// The next tags might be properties of the same metatag type (image or video), so we have to track this.
		}
	}
	
	// Set Image Size Correctly
	if(metaData.image && metaData.image.url) {
		await metaData.getImageSize(metaData.image.url);
	}
}

async function getOpenGraphData(url) {
	
	// TODO: Improve our method of handling the domain (must work locally).
	const domain = `http://api.${location.hostname}`;
	
	// Fetch the HTML from a given URL
	const response = fetch(`${domain}/data/html?url=${encodeURIComponent(url)}`);
	const data = await (await response).json();
	
	// Parse the HTML into a valid DOM
	let pass = false;
	const metaData = new ogMetaData();
	
	try {
		const dom = new DOMParser().parseFromString(data.d, "text/html");
		await parseOpenGraph(dom, metaData); // Parse the DOM for it's OpenGraph Metadata. Updates `metaData`
		pass = true;
		
	} catch (error) {
		pass = false;
		console.error(error.message);
	}
	
	// If the HTML was parsed successfully:
	if(pass) {
		
		// Build the Post Variable
		config.post = {
			origImg: metaData.image.url,
			w: metaData.image.width,
			h: metaData.image.height,
			title: metaData.title,
			content: metaData.content,
			url: metaData.url,
		};
		
		const feedElement = buildPost(config.post);
		
		// Attach Created Elements to Feed Section
		resetPostDisplay();
		const feedSection = document.getElementById("main-section");
		feedSection.appendChild(feedElement);
	}
}

function resetSubmissionContent() {
	
	// Reset Input Fields
	const submitElement = document.getElementById("postSubmit");
	const urlElement = document.getElementById("postUrl");
	const forumElement = document.getElementById("postForum");
	
	urlElement.value = "";
	forumElement.value = "";
	submitElement.value = "Submit Post";
	
	resetPostDisplay();
}

function resetPostDisplay() {
	
	// Clear any post details:
	const feedSection = document.getElementById("main-section");
	for(let i = feedSection.children.length - 1; i > 0; i--) {
		const child = feedSection.children[i];
		
		if(child.classList.contains("feed-contain")) {
			feedSection.removeChild(child);
		}
	}
}

// Draw Forum List
function updateForumSelect() {
	const sel = document.getElementById("postForum");
	
	for (const [key, fData] of Object.entries(config.forumSchema)) {
	
		// Only Find the Parent Forums
		if(fData.parent.length !== 0) { continue; }
		
		const option = document.createElement("option");
		option.value = key;
		option.text = key;
		option.style = "font-weight: bold; font-size: 1.2em;";
		sel.add(option);
		
		for (const [childKey, _value] of Object.entries(config.forumSchema[key].children)) {
			const option = document.createElement("option");
			option.value = childKey;
			option.text = ` - ${childKey}`;
			sel.add(option);
		}
	}
}

window.onload = function() {
	
	updateForumSelect();
	
	document.getElementById("postUrl").addEventListener("click", () => {
		document.getElementById("postUrl").value = "";
	});

	document.getElementById("postUrl").addEventListener("paste", () => {
		
		// We need a timeout here, since we actually want to check AFTER the paste event.
		setTimeout(function() {
			const urlInput = document.getElementById("postUrl");
			const urlInfo = new URL(urlInput.value);
			try {
				if(urlInfo.pathname !== "/") {
					getOpenGraphData(urlInput.value);
				}
			} catch {
				console.error("not able to make a url", urlInput.value);
			}
		}, 10);
	});

	document.getElementById("postSubmit").addEventListener("click", async () => {
		if(!config.api) { console.error("Unable to post. `config.api` is not set."); return; }
		
		const submitElement = document.getElementById("postSubmit");
		
		// Prevent re-submissions.
		if(submitElement.value !== "Submit Post") { return; }
		
		// Make sure there is content to submit:
		const urlElement = document.getElementById("postUrl");
		const forumElement = document.getElementById("postForum");
		
		if(!urlElement.value) { alert("Must provide a URL."); return; }
		if(!forumElement.value) { alert("Must select a forum to post to."); return; }
		
		// Make sure the post content is loaded:
		if(!config.post) { alert("Submission must contain a valid post."); return; }
		if(!config.post.title) { alert("Requires a title."); return; }
		if(!config.post.origImg) { alert("Requires a valid image."); return; }
		if(!config.post.w || !config.post.h) { alert("Error: The system failed to identify image width and height."); return; }
		
		// Make sure the forum is valid.
		if(!config.forumSchema || !config.forumSchema[forumElement.value]) { alert("Error: The forum selected is considered invalid."); return; }
		
		// Assign the forum to our post content:
		config.post.forum = forumElement.value;
		
		submitElement.value = "Submitting...";
		console.log(config.post);
		// Submit Content to API
		const response = await fetch(`${config.api}/post`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			  // 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify(config.post)
		});
		
		// Retrieve Response
		const data = await response.json();
		const json = data.d;
		
		if(!json) { console.error("Post submission response was empty or invalid."); return; }
		
		alert("Post was successful!");
		
		// Clear All Submission Contenet
		resetSubmissionContent();
		
		console.log(json);
	});

};
