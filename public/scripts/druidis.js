
function addFeedPost(post) {
	
	// Feed Icon
	const feedIconImg = createElement("amp-img", {"width": 48, "height": 48, "src": `./public/images/logo/logo-48.png`});
	const feedIcon = createElement("div", {"class": "feed-icon"}, [feedIconImg]);
	
	// Feed Header
	const feedHeaderTitle = createElement("div", {"class": "h3"});
	feedHeaderTitle.innerHTML = "Author Name or Title";
	
	const feedHeaderSubNote = createElement("div", {"class": "note"});
	feedHeaderSubNote.innerHTML = "Source or other note";
	
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
		feedHeaderSubNote.innerHTML = post.comment;
	}
	
	// Feed Image
	const feedImageImg = createElement("amp-img", {"layout": "responsive", "max-width": 680, "width": 680, "height": 500, "src": `./public/images/delete/test.jpg`});
	const feedImageInner = createElement("div", {"class": "feed-image-inner"}, [feedImageImg]);
	const feedImage = createElement("div", {"class": "feed-image"}, [feedImageInner]);
	
	// Feed Title
	const feedTitleTitle = createElement("h2");
	feedTitleTitle.innerHTML = post.title;
	
	const feedTitleComment = createElement("p");
	feedTitleComment.innerHTML = post.comment;
	
	const feedSocial = createElement("div", {"class": "feed-social"});
	feedSocial.innerHTML = "Social Stuff";
	
	const feedTitle = createElement("div", {"class": "feed-title"}, [feedTitleTitle, feedTitleComment]);
	
	// Finalize New Post Feed
	const feedPost = createElement("div", {"class": "feed-wrap"}, [feedTop, feedComment, feedImage, feedTitle, feedSocial]);
	
	// Attach Created Elements to Feed Section
	var feedSection = document.getElementById("feed-section");
	console.log(feedPost);
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
	
	if(scanType === 0) {
		if(idHigh > -1) { query = `?h=${idHigh}`; }
	} else if(scanType === 1) {
		query = `?s=asc`;
		if(idHigh > -1) { query += `&h=${idHigh}`; } 
	} else if(scanType) {
		query = `?s=desc`;
		if(idLow > -1) { query += `&l=${idLow}`; }
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

window.onload = async function() {
	const segments = getUrlSegments();
	console.log('segments');
	console.log(segments);
	// Forum Handling
	if(segments.length >= 2 && segments[0] === "forum" && typeof segments[1] === "string") {
		const forum = segments[1];
		
		// TODO: Step #1: Verify that `forum` is valid.
		// {stuff here}
		
		// Get Cached Data
		const cachedPosts = getCachedPosts(forum);
		let lastPull = window.localStorage.getItem(`lastPull:${forum}`);
		const {idHigh, idLow} = getIdRangeOfCachedPosts(cachedPosts);
		
		// Determine what type of Request to Run
		if(lastPull) { lastPull = Number(lastPull); }
		
		let willFetch = false;
		let scanType = 0; // 0 = new, 1 = asc, -1 = desc
		
		// If we haven't pulled in at least five minutes, we'll make sure a new fetch happens.
		if(!lastPull || lastPull < (Math.floor(Date.now() / 1000) - 300)) {
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
				cacheForumPosts(forum, postResponse);
				window.localStorage.setItem(`lastPull:${forum}`, Math.floor(Date.now() / 1000));
			} catch {
				console.error(`Error with response in forum: ${forum}`)
			}
		}
		
		// Display Cached Data
		for (const [_key, post] of Object.entries(cachedPosts)) {
			if(!post.id) { return; }
			addFeedPost(post);
		}
	}
	
	/*
		// Procedure on scrolling:
		- Check if the user scrolls near an unknown ID range / non-cached results.
		- Load the most recent 10 posts in the forum.
		- Update the ID range that the user has retrieved.
		
		// Server Calls
		/forum/:forum --> returns [{"title":"First Post", ...}, {"title":"Second Post", ...}, ...]
	*/
};