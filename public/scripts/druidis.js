
function displayFeedPost(post) {
	
	// Prepare Values
	const imgPage = Math.ceil(post.id/1000);
	const imgPath = `${post.forum}/${imgPage}/${post.img}`;
	
	// Feed Icon
	const feedIconImg = createElement("amp-img", {"width": 48, "height": 48, "src": `/public/images/logo/logo-48.png`});
	const feedIcon = createElement("div", {"class": "feed-icon"}, [feedIconImg]);
	
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
	
	const feedHeader = createElement("div", {"class": "feed-header"}, [feedHeaderTitle, feedHeaderSubNote]);
	
	// Feed Menu
	const feedMenuInner = createElement("div", {"class": "feed-menu-inner"});
	feedMenuInner.innerHTML = "&#8226;&#8226;&#8226;";
	
	const feedMenu = createElement("div", {"class": "feed-menu"}, [feedMenuInner]);
	
	// Feed Top (full top line; includes Icon, Header, Menu)
	const feedTop = createElement("div", {"class": "feed-top"}, [feedIcon, feedHeader, feedMenu]);
	
	// Feed Comment
	let feedComment;
	if(post.comment) {
		feedComment = createElement("div", {"class": "feed-comment"});
		feedComment.innerHTML = post.comment;
	}
	
	// Feed Image
	const feedImageImg = createElement("amp-img", {
		"layout": "responsive", "max-width": Number(post.w), "width": Number(post.w), "height": Number(post.h),
		"src": `https://us-east-1.linodeobjects.com/druidis-cdn/${imgPath}`
	});
	
	const feedImageInner = createElement("div", {"class": "feed-image-inner"}, [feedImageImg]);
	const feedImage = createElement("div", {"class": "feed-image"}, [feedImageInner]);
	
	// Feed Title
	const feedTitleTitle = createElement("h2");
	feedTitleTitle.innerHTML = post.title;
	
	const feedTitleComment = createElement("p");
	feedTitleComment.innerHTML = post.content;
	
	const feedTitle = createElement("div", {"class": "feed-title"}, [feedTitleTitle, feedTitleComment]);
	
	// Feed Link (Applies to Media & Title + Content)
	const feedHov = createElement("a", {"class": "feed-hov", "href": post.url}, [feedImage, feedTitle]);
	
	// Social Options
	const feedSocial = createElement("div", {"class": "feed-social"});
	feedSocial.innerHTML = "Social Stuff";
	
	// Finalize New Post Feed
	const feedPost = createElement("div", {"class": "feed-wrap"}, [feedTop, feedComment, feedHov, feedSocial]);
	
	// Attach Created Elements to Feed Section
	var feedSection = document.getElementById("main-section");
	
	feedSection.appendChild(feedPost);
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
	
	// TODO: Improve our method of handling the domain (must work locally).
	const domain = `http://api.${location.hostname}`;
	
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
	console.log(`${domain}/forum/${forum}${query}`);
	
	const response = await fetch(`${domain}/forum/${forum}${query}`);
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

function getUrlSegments() {
	const url = location.pathname.split("/");
	if(url.length > 0) { url.shift(); }
	return url;
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

async function loadForumData() {
	const segments = getUrlSegments();
	
	// Forum Handling
	if(segments.length >= 2 && segments[0] === "forum" && typeof segments[1] === "string") {
		const forum = segments[1];
		
		// TODO: Step #1: Verify that `forum` is valid.
		// {stuff here}
		
		// Get Cached Data
		let cachedPosts = getCachedPosts(forum);
		let lastPull = window.localStorage.getItem(`lastPull:${forum}`);
		const {idHigh, idLow} = getIdRangeOfCachedPosts(cachedPosts);
		
		// Determine what type of Request to Run
		if(lastPull) { lastPull = Number(lastPull); }
		
		let willFetch = idHigh === -1 ? false : true;
		let scanType = 0; // 0 = new, 1 = asc, -1 = desc
		
		// If we haven't pulled in at least five minutes, we'll make sure a new fetch happens.
		if(willFetch === false && (!lastPull || lastPull < (Math.floor(Date.now() / 1000) - 300))) {
			willFetch = true;
			scanType = 1;
			
			// If we haven't pulled in 12 hours, run a new fetch to ensure content isn't stale.
			if(lastPull < (Math.floor(Date.now() / 1000) - (60 * 60 * 24))) {
				scanType = 0;
			}
		}
		
		// Fetch recent forum feed data.
		if(willFetch) {
			try {
				const postResponse = await fetchForumPost(forum, idHigh, idLow, scanType);
				console.info(postResponse);
				// Cache Results
				cachedPosts = cacheForumPosts(forum, postResponse);
				window.localStorage.setItem(`lastPull:${forum}`, Math.floor(Date.now() / 1000));
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

// Main Menu Clickable
document.getElementById("menuClick").addEventListener("click", function() {
	var menu = document.getElementById("menuMain");
	menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});