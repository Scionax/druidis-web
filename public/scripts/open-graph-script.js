
/*
	Instructions:
		1. Go to https://javascript-minifier.com/ and minimize the file.
		2. Wrap the minified script with: javascript: (() => { CONTENT_GOES_HERE })();
		3. Apply the script to a bookmark.
		4. Press the bookmark when visiting a website that you want content from.
*/

const zqqConfig = {
	host: "http://api.dev.druidis",
	forum: "Technology",
	categories: ["News", "Events", "Other"],
	defaultCategory: "Events",
	autoSubmit: false,
	allowComments: false,
};

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
	
	imageDimensions = (url) => 
		new Promise((resolve, reject) => {
			const img = new Image();
			
			img.onload = () => {
				const { naturalWidth: width, naturalHeight: height } = img;
				resolve({ width, height });
			}
			
			img.onerror = () => { reject('There was some problem with the image.'); }
			
			img.src = url;
		}
	)
	
	getImageSize = async () => {
		try {
			const dimensions = await this.imageDimensions(this.image.url);
			this.image.width = dimensions.width;
			this.image.height = dimensions.height;
		} catch(error) {
			console.error(error);
		}
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

function zqqParseMetaTags(metaData) {
	
	// Trackers
	let scanForType = "";	// As we loop through meta tags, some are based on the last ones located (such as 'image' and 'video'), so track the 'current' set.
	const metaElements = document.getElementsByTagName("meta");
	
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
	if(metaData.image) {
		metaData.getImageSize();
	}
	
	return false;
}

const submitContent = async () => {
	
	// Run Meta Tag Parser
	var metaData = new ogMetaData();
	zqqParseMetaTags(metaData);
	console.log(metaData);
	
	// Gather Config Data for this site, if possible.
	loadSiteConfig(config);
	
	// Submit Post
    const response = await fetch(host + "/post", {
        method: "POST",
		mode: 'no-cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
            // "Content-Type": "plain/text",
            "Content-Type": "application/json",
        },
		body: JSON.stringify(metaData) // body data type must match "Content-Type" header
    });
    
	var html = await response.json(); // For JSON Response
    // var html = await response.text(); // For HTML or Text Response
	console.log(html);
}

// submitContent();

function zqqSubmitPost() {
	const category = document.getElementById("zqqCategory");
	confirm("Submit data?");
	console.log("Category", category.value);
}

function createElement(element, attribute, inner) {
	if(typeof(element) === "undefined") { return false; }
	if(typeof(inner) === "undefined") { inner = ""; }
	
	const el = document.createElement(element);
	if(typeof(attribute) === 'object') {
		for(const attKey in attribute) {
			el.setAttribute(attKey, attribute[attKey]);
		}
	}
	
	if(!Array.isArray(inner)) { inner = [inner]; }
	
	for(let k = 0; k < inner.length; k++) {
		if(!inner[k]) { continue; }
		if(inner[k].tagName) {
			el.appendChild(inner[k]);
		} else {
			el.appendChild(document.createTextNode(inner[k]));
		}
	}
	
	return el;
}

function zqqDisplayModal() {
	
	// Run Meta Tag Parser
	var metaData = new ogMetaData();
	zqqParseMetaTags(metaData);
	console.log(metaData);
	
	// Prepare HTML
	let configOpts = "";
	
	if(zqqConfig.categories) {
		for(let i = 0; i < zqqConfig.categories.length; i++) {
			const defSelect = zqqConfig.defaultCategory === zqqConfig.categories[i] ? ` selected="selected"` : "";
			configOpts += `<option value="${zqqConfig.categories[i]}"${defSelect}>${zqqConfig.categories[i]}</option>`;
		}
	}
	
	const comments = zqqConfig.allowComments ? `
	<div style="font-weight:bold;font-familiy:Arial;font-size:1.2rem;padding-top:25px;">Comment</div>
	<div>
		<textarea id="zqqComment" name="zqqComment" style="overflow:hidden;maxlength:250;border:solid 1px #bbbbbb;width:100%;min-height:120px;"></textarea>
	</div>` : "";
	
	// Prepare Modal
	const modalContent = createElement("div", {
		"style": "position:absolute; z-index: 9999999; left:50%;top:50%;transform:translate(-50%,-50%);width:300px;min-height:400px;padding:16px;background-color:white;border-radius:10px;border:solid 1px #dddddd;",
	}, []);		// feedTop, feedComment, feedHov, feedSocial
	
	modalContent.innerHTML = `
	<div style="font-weight:bold;font-familiy:Arial;font-size:1.2rem;text-align:center;">${metaData.title}</div>
	
	<div style="font-weight:bold;font-familiy:Arial;font-size:1.2rem;padding-top:25px;">Forum</div>
	<div><input type="text" id="zqqForum" name="zqqForum" value="${zqqConfig.forum}" readonly="readonly" style="border:solid 1px #bbbbbb;width:100%;" /></div>
	
	<div style="font-weight:bold;font-familiy:Arial;font-size:1.2rem;padding-top:25px;">Category</div>
	<div>
		<select id="zqqCategory" name="zqqCategory" style="border:solid 1px #bbbbbb;width:100%;">
			<option value="">-- No Category --</option>
			${configOpts}
		</select>
	</div>
	${comments}
	<div style="padding-top:25px;">
		<button onclick="zqqSubmitPost" style="width:100%;min-height:50px;background-color:#eeeeee;border:solid 1px #bbbbbb;">Submit</button>
	</div>
	`;
	
	const modal = createElement("div", {
		"style": "position:fixed; z-index: 999999; left:0;top:0;width:100%;height:100%;background-color: rgba(0, 0, 0, 0.5);",
	}, [modalContent]);
	
	// Attach Created Elements to Feed Section
	const body = document.body;
	body.append(modal);
}

zqqDisplayModal();