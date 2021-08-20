
console.log(window.location);

var pathname = window.location.pathname;

fetch('http://api.dev.druidis/data/forums/Travel')
	.then(response => response.json())
	.then(data => console.log(data));


function addFeedPost() {
	const copy = document.getElementById("feed-copy").cloneNode(true);
	copy.style.display = "block";
	
	// Locate the feed-header
	const elements = copy.querySelectorAll('div.feed-header > div.h3');
	elements[0].innerHTML = "BWAHAHAHAHA";
	
	for(const elem of elements) {
		console.log(elem.innerHTML);
	}
	
	var feedSection = document.getElementById("feed-section");
	feedSection.appendChild(copy);
}

window.onload = function() {
	setTimeout(addFeedPost, 1000);
	setTimeout(addFeedPost, 2000);
	setTimeout(addFeedPost, 3000);
};