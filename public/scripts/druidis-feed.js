
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
	
	const response = await fetch(`${config.api}/forum/${forum}${query}`, { headers:{
		'Content-Type': 'application/json',
		'Credentials': 'include', // Needed or Cookies will not be sent.
		// 'Content-Type': 'application/x-www-form-urlencoded',
	}});
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
		if(config.schema && !config.schema[forum]) {
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

loadFeed();