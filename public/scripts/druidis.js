
function addFeedPost() {
	const copy = document.getElementById("feed-copy").cloneNode(true);
	copy.style.display = "block";
	
	// Locate the feed-header
	const elements = copy.querySelectorAll('div.feed-header > div.h3');
	elements[0].innerHTML = "Header Top Section";
	
	for(const elem of elements) {
		console.log(elem.innerHTML);
	}
	
	var feedSection = document.getElementById("feed-section");
	feedSection.appendChild(copy);
}

async function fetchForumPost(forum, idHigh = -1, idLow = -1, scan = "new") {
	
	// TODO: Improve our method of handling the domain (must work locally).
	const domain = `http://api.${location.hostname}`;
	
	// Build Query String
	let query;
	
	if(scan === "new") {
		if(idHigh > -1) { query = `?h=${idHigh}`; }
	} else if(scan === "asc") {
		query = `s=asc`;
		if(idHigh > -1) { query += `&h=${idHigh}`; } 
	} else {
		query = `s=desc`;
		if(idLow > -1) { query += `&l=${idLow}`; }
	}
	
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
		
		// If we haven't pulled in at least five minutes, grab a new set.
		if(!lastPull || lastPull < (Math.floor(Date.now() / 1000) - 300)) {
			
			// Fetch recent forum feed data.
			try {
				const postResponse = await fetchForumPost(forum, idHigh, idLow);
				
				// Cache Results
				cacheForumPosts(forum, postResponse);
				window.localStorage.setItem(`lastPull:${forum}`, Math.floor(Date.now() / 1000));
			} catch {
				console.error(`Error with response in forum: ${forum}`)
			}
		}
		
		// Display Cached Data
		
	}
	
	/*
		// Procedure on forum load:
		- Check if the user has cached content already.
			- If so, check the last timestamp a request was made for this forum.
			- If last request time was over five minutes ago, request new content update.
				- New Content Update should include `idHigh` as the closest cached result. This helps identify how the server should respond.
		
		// Procedure on scrolling:
		- Check if the user scrolls near an unknown ID range / non-cached results.
		- Load the most recent 10 posts in the forum.
		- Update the ID range that the user has retrieved.
		
		// Server Calls
		/forum/:forum --> returns [{"title":"First Post", ...}, {"title":"Second Post", ...}, ...]
	*/
};