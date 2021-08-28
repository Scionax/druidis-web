
const config = {};
loadConfig();

function loadConfig() {
	
	// Load the config if it hasn't been loaded yet.
	if(!config.api) {
		
		// .api
		if(location.hostname.indexOf("dev") > -1) { config.api = `http://api.${location.hostname}`; }
		else { config.api = `https://api.druidis.org`; }
		
		// .urlSegments
		config.urlSegments = getUrlSegments();
		
		// .forum
		config.forum = "";
		if(config.urlSegments[0] === "forum" && config.urlSegments.length > 1) { config.forum = decodeURI(config.urlSegments[1]); }
		
		// .schema
		config.schema = {"News":{"children":["Business","Economic","Environment","Legal","Politics","Social Issues","World News"]},"Business":{"parent":"News"},"Economic":{"parent":"News"},"Environment":{"parent":"News"},"Legal":{"parent":"News"},"Politics":{"parent":"News"},"Social Issues":{"parent":"News"},"World News":{"parent":"News"},"Informative":{"children":["Education","History","Science","Technology"]},"Education":{"parent":"Informative"},"History":{"parent":"Informative"},"Science":{"parent":"Informative"},"Technology":{"parent":"Informative"},"Entertainment":{"children":["Books","Gaming","Movies","Music","People","Shows","Sports","Tabletop Games","Virtual Reality"]},"Books":{"parent":"Entertainment"},"Gaming":{"parent":"Entertainment"},"Movies":{"parent":"Entertainment"},"Music":{"parent":"Entertainment"},"People":{"parent":"Entertainment"},"Shows":{"parent":"Entertainment"},"Sports":{"parent":"Entertainment"},"Tabletop Games":{"parent":"Entertainment"},"Virtual Reality":{"parent":"Entertainment"},"Lifestyle":{"children":["Fashion","Fitness","Food","Health","Recipes","Social Life","Relationships","Travel"]},"Fashion":{"parent":"Lifestyle"},"Fitness":{"parent":"Lifestyle"},"Food":{"parent":"Lifestyle"},"Health":{"parent":"Lifestyle"},"Recipes":{"parent":"Lifestyle"},"Relationships":{"parent":"Lifestyle"},"Social Life":{"parent":"Lifestyle"},"Travel":{"parent":"Lifestyle"},"Fun":{"children":["Ask","Cosplay","Cute","Forum Games","Funny"]},"Ask":{"parent":"Fun"},"Cosplay":{"parent":"Fun"},"Cute":{"parent":"Fun"},"Forum Games":{"parent":"Fun"},"Funny":{"parent":"Fun"},"Creative":{"children":["Artwork","Crafts","Design","Writing"]},"Artwork":{"parent":"Creative"},"Crafts":{"parent":"Creative"},"Design":{"parent":"Creative"},"Writing":{"parent":"Creative"}};
	}
}

function getUrlSegments() {
	const url = location.pathname.split("/");
	if(url.length > 0) { url.shift(); }
	return url;
}

/*
	Image Options:
		.origImg					// A fully qualified URL to an image.
		.forum, .id, .img			// A relative path to the image based on forum+id.
*/
function buildPost(post) {
	
	// --------------------- //
	// ----- Left Tray ----- //
	// --------------------- //
	
	// Feed Icon
	const feedIconImg = createElement("amp-img", {"width": 48, "height": 48, "src": `/public/images/logo/logo-48.png`});
	const feedIcon = createElement("div", {"class": "tray-icon"}, [feedIconImg]);
	
	// Feed Header
	const feedHeaderTitle = createElement("div", {"class": "h3"});
	feedHeaderTitle.innerHTML = "Author Name or Title";
	
	const feedHeaderSubNote = createElement("div", {"class": "note"});
	
	try {
		const urlInfo = new URL(post.url);
		feedHeaderSubNote.innerHTML = `Source: ${urlInfo.hostname}`;
	} catch {
		// Do nothing
	}
	
	const feedHeader = createElement("div", {"class": "tray-mid"}, [feedHeaderTitle, feedHeaderSubNote]);
	
	// Feed Menu
	const feedMenuInner = createElement("div", {"class": "tray-menu-inner"});
	feedMenuInner.innerHTML = "&#8226;&#8226;&#8226;";
	
	const feedMenu = createElement("div", {"class": "tray-menu"}, [feedMenuInner]);
	
	// Feed Top (full top line; includes Icon, Header, Menu)
	const feedTop = createElement("div", {"class": "tray"}, [feedIcon, feedHeader, feedMenu]);
	
	// ------------------------ //
	// ----- Left Section ----- //
	// ------------------------ //
	
	let feedHov;
	
	// Feed Image
	if(post.img || post.origImg) {
		let feedImageImg;
		
		if(post.origImg) {
			feedImageImg = createElement("amp-img", {
				"layout": "responsive", "max-width": Number(post.w), "width": Number(post.w), "height": Number(post.h),
				"src": post.origImg
			});
		} else {
			const imgPage = Math.ceil(post.id/1000);
			const imgPath = `${post.forum}/${imgPage}/${post.img}`;
			
			feedImageImg = createElement("amp-img", {
				"layout": "responsive", "max-width": Number(post.w), "width": Number(post.w), "height": Number(post.h),
				"src": `https://us-east-1.linodeobjects.com/druidis-cdn/${imgPath}`
			});
		}
		
		const feedImageInner = createElement("div", {"class": "feed-image-inner"}, [feedImageImg]);
		const feedImage = createElement("div", {"class": "feed-image"}, [feedImageInner]);
		
		// Feed Link (Applies to Media & Title + Content)
		feedHov = createElement("a", {"class": "feed-hov", "href": post.url}, [feedImage]);
	}
	
	// Create Feed Wrap (not including "Extra")
	const feedWrap = createElement("div", {"class": "feed-wrap"}, [feedTop, feedHov]);
	
	// ---------------------- //
	// ----- Right Tray ----- //
	// ---------------------- //
	
	// // Feed Icon
	// const rightIconImg = createElement("amp-img", {"width": 48, "height": 48, "src": `/public/images/logo/logo-48.png`});
	// const rightIcon = createElement("div", {"class": "tray-icon"}, [rightIconImg]);
	
	// // Feed Header
	// const rightHeaderTitle = createElement("div", {"class": "h3"});
	// rightHeaderTitle.innerHTML = "Author Name or Title";
	
	// const rightHeaderSubNote = createElement("div", {"class": "note"});
	
	// try {
	// 	const urlInfo = new URL(post.url);
	// 	rightHeaderSubNote.innerHTML = `Source: ${urlInfo.hostname}`;
	// } catch {
	// 	// Do nothing
	// }
	
	// const rightHeader = createElement("div", {"class": "tray-mid"}, [rightHeaderTitle, rightHeaderSubNote]);
	
	// // Feed Menu
	// const rightMenuInner = createElement("div", {"class": "tray-menu-inner"});
	// rightMenuInner.innerHTML = "&#8226;&#8226;&#8226;";
	
	// const rightMenu = createElement("div", {"class": "tray-menu"}, [rightMenuInner]);
	
	// // Feed Top (full top line; includes Icon, Header, Menu)
	// const rightTop = createElement("div", {"class": "tray"}, [rightIcon, rightHeader, rightMenu]);
	
	// ------------------------- //
	// ----- Right Section ----- //
	// ------------------------- //
	
	// "Extra" Body
	const extraTitle = createElement("h2");
	extraTitle.innerHTML = post.title;

	const extraContent = createElement("p");
	extraContent.innerHTML = post.content;
	
	const extraBody = createElement("div", {"class": "extra-body"}, [extraTitle, extraContent]);
	const extraWrapLink = createElement("a", {"class": "feed-hov", href: "http://example.com"}, [extraBody]);
	
	// Breadcrumbs
	const breadcrumbs = createElement("div", {"class": "breadcrumbs"});
	
	// Check for forum parent. If present, link the parent in the breadcrumb.
	const sch = config.schema[post.forum];
	
	if(sch && sch.parent && sch.parent !== config.forum) {
		const crumb = createElement("a", {"class": "crumb", "href": `/forum/${sch.parent}`});
		crumb.innerHTML = sch.parent;
		breadcrumbs.appendChild(crumb);
	}
	
	if(post.forum && post.forum !== config.forum) {
		const crumb = createElement("a", {"class": "crumb", "href": `/forum/${post.forum}`});
		crumb.innerHTML = post.forum;
		breadcrumbs.appendChild(crumb);
	}
	
	const extraFoot = createElement("div", {"class": "extra-foot"}, [breadcrumbs]);
	
	// Create "Extra" Wrapper
	const extraWrap = createElement("div", {"class": "extra-wrap"}, [extraWrapLink, extraFoot]);
	
	// Fulfill Post Container
	const feedContainer = createElement("div", {"class": "feed-contain"}, [feedWrap, extraWrap]);
	
	return feedContainer;
}

function displayFeedPost(post) {
	
	const feedElement = buildPost(post);
	
	// Attach Created Elements to Feed Section
	const feedSection = document.getElementById("main-section");
	feedSection.appendChild(feedElement);
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

// Main Menu Clickable
document.getElementById("menuClick").addEventListener("click", function() {
	var menu = document.getElementById("menuMain");
	menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});