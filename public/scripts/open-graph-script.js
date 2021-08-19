
/*
	Instructions:
		1. Go to https://javascript-minifier.com/ and minimize the file.
		2. Wrap the minified script with: javascript: (() => { CONTENT_GOES_HERE })();
		3. Apply the script to a bookmark.
		4. Press the bookmark when visiting a website that you want content from.
*/

const DruidisHost = "http://api.dev.druidis";

// metaData: Data Structure for an OpenGraph Page
class ogMetaData {
	
	constructor() {
		this.url = "";
		this.title = "";
		this.image = new metaVisual();
		this.video = new metaVisual();
		// this.audio = new metaAudio;
		this.description = "";
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

// metaVisual: Data Structure for Images and Videos
class metaVisual {
	
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

function parseMetaTags(metaData) {
	
	// Trackers
	var scanForType = "";	// As we loop through meta tags, some are based on the last ones located (such as 'image' and 'video'), so track the 'current' set.
	
	// Loop through every meta value.
	for(var b = document.getElementsByTagName("meta"), a = 0; a < b.length; a++) {
		
		// Get the MetaTag Data
		var metaVals = b[a];
		var metaName = metaVals.getAttribute("property") ? metaVals.getAttribute("property") : metaVals.name;
		if(!metaName || !metaVals.content) { continue; }
		var metaContent = metaVals.content;
		
		// Split to detect sets:
		var s = metaName.split(":");		// Splits into 2 or 3 parts. Ex: "og:image:width" -> ['og', 'image', 'width']
		var name = s[1];
		var nameProp = s[2];
		
		// Apply Detected Content to Values
		if(name == "url") { metaData.url = metaContent; scanForType = ""; }
		if(name == "title") { metaData.title = metaContent; scanForType = ""; }
		if(name == "description") { metaData.description = metaContent; scanForType = ""; }
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
		console.log("update image size");
		metaData.getImageSize();
	}
	
	return false;
}

// Run Meta Tag Parser
var metaData = new ogMetaData();
parseMetaTags(metaData);


const githubResponse = async () => {
    const response = await fetch(DruidisHost + "/post", {
        method: "GET",
		mode: 'no-cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
            "Content-Type": "plain/text",
            // "Content-Type": "application/json",
        },
		// body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    
	// return response.json(); // For JSON Response
    var html = await response.text(); // For HTML or Text Response
	console.log(html);
}

// githubResponse();
