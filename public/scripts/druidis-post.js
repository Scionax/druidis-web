
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
		const post = {
			fullImg: metaData.image.url,
			w: metaData.image.width,
			h: metaData.image.height,
			title: metaData.title,
			content: metaData.content,
			url: metaData.url,
		};
		
		const feedElement = buildPost(post);
		
		// Attach Created Elements to Feed Section
		const feedSection = document.getElementById("main-section");
		feedSection.appendChild(feedElement);
	}
}

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

// Draw Forum List
function updateForumSelect() {
	const sel = document.getElementById("forumSelect");
	
	for (const [key, fData] of Object.entries(config.forumSchema)) {
	
		// Only Find the Parent Forums
		if(fData.parent.length !== 0) { continue; }
		
		const option = document.createElement("option");
		option.value = key;
		option.text = key;
		option.style = "font-weight: bold; font-size: 1.2em;";
		sel.add(option);
		
		for (const [childKey, value] of Object.entries(config.forumSchema[key].children)) {
			const option = document.createElement("option");
			option.value = childKey;
			option.text = ` - ${childKey}`;
			sel.add(option);
		}
	}
}

updateForumSelect();