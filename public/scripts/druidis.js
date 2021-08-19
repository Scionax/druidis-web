
console.log(window.location);

var pathname = window.location.pathname;


// fetch('http://api.dev.druidis/data/forums/Travel')
fetch('http://api.dev.druidis/data/forums/blurb')
	.then(response => response.json())
	.then(data => console.log(data));
