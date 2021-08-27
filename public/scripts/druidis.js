
const config = {};
loadConfig();

function loadConfig() {
	
	// .api
	if(location.hostname.indexOf("dev") > -1) { config.api = `http://api.${location.hostname}`; }
	else { config.api = `https://api.druidis.org`; }
	
	// .forumSchema
	loadForumSchema();
	
	// .urlSegments
	config.urlSegments = getUrlSegments();
	
	// .forum
	config.forum = "";
	if(config.urlSegments[0] === "forum" && config.urlSegments.length > 1) { config.forum = decodeURI(config.urlSegments[1]); }
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
	const sch = config.forumSchema[post.forum];
	
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

// scanType
//		0 = New Scan. Finds new content, starting from the very top.
//		1 = Ascending Scan. Used to find recent updates when your cache is already well-updated. Uses High ID range.
//		-1 = Descending Scan. Used for auto-loading, when user is scrolling down. Uses Low ID range.
async function fetchForumPost(forum, idHigh = -1, idLow = -1, scanType = 1) {
	
	// Build Query String
	let query;
	
	if(scanType === 1) {
		query = `?s=asc`;
		if(idHigh > -1) { query += `&h=${idHigh}`; } 
	} else if(scanType === -1) {
		query = `?s=desc`;
		if(idLow > -1) { query += `&l=${idLow}`; }
	} else {
		query = (idHigh > -1) ? `?h=${idHigh}` : "";
	}
	
	console.log("--- Fetching Results ---");
	console.log(`${config.api}/forum/${forum}${query}`);
	
	const response = await fetch(`${config.api}/forum/${forum}${query}`);
	return await response.json();
}

function getCachedPosts(forum) {
	let cachedPosts = window.localStorage.getItem(`posts:${forum}`);
	
	if(cachedPosts) {
		try {
			cachedPosts = JSON.parse(cachedPosts);
		} catch {
			cachedPosts = {};
		}
	} else {
		cachedPosts = {};
	}
	
	return cachedPosts;
}

function cacheForumPosts(forum, postResponse) {
	const cachedPosts = getCachedPosts(forum);
	const rawPosts = postResponse && postResponse.d ? postResponse.d : [];
	
	// Loop through all entries in the post data, and append to cached posts.
	for(let i = 0; i < rawPosts.length; i++) {
		const rawPost = rawPosts[i];
		
		// Make sure there's a valid ID
		const id = Number(rawPost.id);
		if(!id) { continue; }
		
		// Check if Cached Posts already contains this entry. Add if it doesn't.
		if(!cachedPosts[id]) {
			cachedPosts[id] = rawPost;
			window.localStorage.setItem(`posts:${forum}`, JSON.stringify(cachedPosts));
		}
	}
	
	return cachedPosts;
}

function getIdRangeOfCachedPosts(cachedPosts) {
	let high = -1;
	let low = Infinity;
	
	for (const [key, post] of Object.entries(cachedPosts)) {
		if(!post.id) { return; }
		const num = Number(key);
		if(num > high) { high = num; }
		if(num < low) { low = num; }
	}
	
	return {idHigh: high, idLow: low};
}

async function loadFeed() {
	
	// Forum Handling
	if(config.forum) {
		const forum = config.forum;
		
		const curTime = Math.floor(Date.now() / 1000);
		let willFetch = false;
		let scanType = 0; // 0 = new, 1 = asc, -1 = desc
		
		// Verify that `forum` is valid.
		if(config.forumSchema && !config.forumSchema[forum]) {
			console.error(`"${forum}" forum was not detected. Cannot load feed.`);
			return;
		}
		
		// Get Cached Data
		let cachedPosts = getCachedPosts(forum);
		let lastPull = window.localStorage.getItem(`lastPull:${forum}`);
		
		// Determine what type of Request to Run
		lastPull = Number(lastPull) || 0;
		
		// If we haven't located cached IDs, then idHigh will be -1, and we must fore a fetch.
		const {idHigh, idLow} = getIdRangeOfCachedPosts(cachedPosts);
		if(idHigh === -1) { willFetch = true; }
		
		// If we haven't pulled in at least five minutes, we'll make sure a new fetch happens.
		if(willFetch === false && lastPull < curTime - 300) {
			willFetch = true;
			scanType = 1;
			
			// If we haven't pulled in 12 hours, run a "new" scan (instead of ascending) to force newest reset.
			if(lastPull < curTime - (60 * 60 * 24)) {
				scanType = 0;
				
				// Clear out stale data.
				window.localStorage.removeItem(`posts:${forum}`);
			}
		}
		
		// Fetch recent forum feed data.
		if(willFetch) {
			try {
				const postResponse = await fetchForumPost(forum, idHigh, idLow, scanType);
				console.info(postResponse);
				// Cache Results
				cachedPosts = cacheForumPosts(forum, postResponse);
				window.localStorage.setItem(`lastPull:${forum}`, curTime);
			} catch {
				console.error(`Error with response in forum: ${forum}`)
			}
		}
		
		// Display Cached Data
		for (const [_key, post] of Object.entries(cachedPosts)) {
			if(!post.id) { return; }
			displayFeedPost(post);
		}
	}
	
	/*
		// Procedure on scrolling:
		- Check if the user scrolls near an unknown ID range / non-cached results.
		- Load the most recent 10 posts in the forum.
		- Update the ID range that the user has retrieved.
	*/
}

// Load Forum Data
async function loadForumSchema() {
	
	const curTime = Math.floor(Date.now() / 1000);
	
	// Check if we already have forum data:
	const forumSchema = window.localStorage.getItem(`forumSchema`);
	config.forumSchema = forumSchema ? JSON.parse(forumSchema) : {};
	
	// If we have the forum data, but it's been stale for two days, fetch new result.
	if(forumSchema) {
		let lastPull = window.localStorage.getItem(`lastPull:_forumSchema`);
		lastPull = Number(lastPull) || 0;
		if(lastPull > (curTime - 3600 * 24 * 2)) { return; }
	}
	
	// Fetch recent forum data.
	try {
		
		console.log("--- Fetching /data/forums ---");
		const response = await fetch(`${config.api}/data/forums`);
		const json = await response.json();
		
		// Cache Results
		if(json && json.d) {
			config.forumSchema = json.d;
			window.localStorage.setItem(`forumSchema`, JSON.stringify(config.forumSchema));
			window.localStorage.setItem(`lastPull:_forumSchema`, curTime);
		} else {
			console.error("Data from /data/forums returned invalid.");
		}
		
	} catch {
		console.error(`Error with response in /data/forums.`)
	}
}

// Main Menu Clickable
document.getElementById("menuClick").addEventListener("click", function() {
	var menu = document.getElementById("menuMain");
	menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});
