
class Config {
	
	static urlSegments: string[];
	static forum: string;
	static schema: { [id: string]: { children?: string[], parent?: string } };
	
	static initialize() {
		
		// .urlSegments
		Config.urlSegments = Config.getUrlSegments();
		
		// .forum
		Config.forum = "";
		if(Config.urlSegments[0] === "forum" && Config.urlSegments.length > 1) { Config.forum = decodeURI(Config.urlSegments[1]); }
		
		// .schema
		Config.schema = {"News":{"children":["Business","Economic","Environment","Legal","Politics","Social Issues","World News"]},"Business":{"parent":"News"},"Economic":{"parent":"News"},"Environment":{"parent":"News"},"Legal":{"parent":"News"},"Politics":{"parent":"News"},"Social Issues":{"parent":"News"},"World News":{"parent":"News"},"Informative":{"children":["Education","History","Science","Technology"]},"Education":{"parent":"Informative"},"History":{"parent":"Informative"},"Science":{"parent":"Informative"},"Technology":{"parent":"Informative"},"Entertainment":{"children":["Books","Gaming","Movies","Music","People","Shows","Sports","Tabletop Games","Virtual Reality"]},"Books":{"parent":"Entertainment"},"Gaming":{"parent":"Entertainment"},"Movies":{"parent":"Entertainment"},"Music":{"parent":"Entertainment"},"People":{"parent":"Entertainment"},"Shows":{"parent":"Entertainment"},"Sports":{"parent":"Entertainment"},"Tabletop Games":{"parent":"Entertainment"},"Virtual Reality":{"parent":"Entertainment"},"Lifestyle":{"children":["Fashion","Fitness","Food","Health","Recipes","Social Life","Relationships","Travel"]},"Fashion":{"parent":"Lifestyle"},"Fitness":{"parent":"Lifestyle"},"Food":{"parent":"Lifestyle"},"Health":{"parent":"Lifestyle"},"Recipes":{"parent":"Lifestyle"},"Relationships":{"parent":"Lifestyle"},"Social Life":{"parent":"Lifestyle"},"Travel":{"parent":"Lifestyle"},"Fun":{"children":["Ask","Cosplay","Cute","Forum Games","Funny"]},"Ask":{"parent":"Fun"},"Cosplay":{"parent":"Fun"},"Cute":{"parent":"Fun"},"Forum Games":{"parent":"Fun"},"Funny":{"parent":"Fun"},"Creative":{"children":["Artwork","Crafts","Design","Writing"]},"Artwork":{"parent":"Creative"},"Crafts":{"parent":"Creative"},"Design":{"parent":"Creative"},"Writing":{"parent":"Creative"}};
	
	}
	
	static getUrlSegments(): string[] {
		const url = location.pathname.split("/");
		if(url.length > 0) { url.shift(); }
		return url;
	}
}

class API {
	
	static url: string;					// URL to the API server; e.g. localhost/api, druidis.org/api, etc.
	
	static initialize() {
		
		// .url
		if(location.hostname.indexOf("local") > -1) { API.url = `http://localhost/api`; }
		else { API.url = `https://druidis.org/api`; }
	}
	
	static async callPostAPI(path: string, data: Record<string, unknown>) {
		
		// Submit Content to API
		const response = await fetch(`${API.url}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Credentials': 'include', // Needed or Cookies will not be sent.
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify(data)
		});
		
		// Retrieve Response
		const responseData = await response.json();
		return responseData.d;
	}
}

class Alerts {
	
	static info: string[];
	static errors: string[];
	
	static hasAlerts() { return (Alerts.errors.length > 0 || Alerts.info.length > 0) ? true : false; }
	static hasErrors() { return Alerts.errors.length === 0 ? false : true; }
	static purgeAlerts() { Alerts.errors = []; Alerts.info = []; }
	
	static error(assert: boolean, message: string, purge = false) {
		if(purge) { Alerts.purgeAlerts(); }
		if(assert) { Alerts.errors.push(message); }
	}
	
	static displayAlerts() {
		
		if(!Alerts.hasAlerts()) { return; }
		
		
		const info = document.getElementById("alertBox") as HTMLDivElement;
		
		const isAlertBox = info ? true : false;
		
		if(isAlertBox) {
			info.innerHTML = "";
		}
		
		// Display Info Alerts
		for(let i = 0; i < Alerts.info.length; i++) {
			
			// Post all alerts in the console.
			console.log(Alerts.info[i]);
			
			// Check if there is an alert box. If so, post alerts.
			if(isAlertBox) {
				const alert = createElement("div", {"class": "alert alert-info"});
				alert.innerHTML = Alerts.info[i];
				info.appendChild(alert);
			}
		}
		
		// Display Errors
		for(let i = 0; i < Alerts.errors.length; i++) {
			
			// Post all alerts in the console.
			console.log(Alerts.errors[i]);
			
			// Check if there is an alert box. If so, post alerts.
			if(isAlertBox) {
				const alert = createElement("div", {"class": "alert alert-fail"});
				alert.innerHTML = Alerts.errors[i];
				info.appendChild(alert);
			}
		}
	}
}

class Webpage {
	
	static clearMainSection() {
		const mainSection = document.getElementById("main-section") as HTMLElement;
		
		for(let i = mainSection.children.length - 1; i >= 0; i--) {
			const child = mainSection.children[i];
			mainSection.removeChild(child);
		}
	}
	
	static addBlock(element: HTMLElement) {
		const mainSection = document.getElementById("main-section") as HTMLElement;
		if(mainSection !== null) { mainSection.appendChild(element); }
	}
	
	static clearBlock(blockId: string) {
		const mainSection = document.getElementById("main-section") as HTMLElement;
		
		for(let i = mainSection.children.length - 1; i >= 0; i--) {
			const child = mainSection.children[i];
			if(child.classList.contains(blockId)) {
				mainSection.removeChild(child);
			}
		}
	}
}

Config.initialize();
API.initialize();

interface AmpTagName extends HTMLElementTagNameMap {
    "amp-img": HTMLElement;
}

function createElement<K extends keyof AmpTagName>(element: K, attribute: Record<string, string> | false = false, inner: HTMLElement[] | null = null) {
	
	const el = document.createElement(element);
	
	if(typeof(attribute) === 'object') {
		for(const attKey in attribute) {
			el.setAttribute(attKey, attribute[attKey]);
		}
	}
	
	if(inner !== null) {
		for(let k = 0; k < inner.length; k++) {
			if(!inner[k]) { continue; }
			if(inner[k].tagName) { el.appendChild(inner[k]); }
			// else { el.appendChild(document.createTextNode(inner[k])); }
		}
	}
	
	return el;
}

interface PostData {
	id?: number,		// ID of the post.
	forum?: string,		// Forum that the post is applied to.
	url: string,		// URL that the post links to.
	title: string,		// Title of the post.
	content: string,	// Content or description included with the post.
	origImg?: string,	// URL of the original image (such as npr.com/images/someimage.png)
	img?: string,		// Image pathname for internal use (such as img-105-ojfs.webp)
	w?: number,			// Width of Image
	h?: number,			// Height of Image
}

// 	.origImg					// A fully qualified URL to an image.
// 	.forum, .id, .img			// A relative path to the image based on forum+id.
function buildPost(post: PostData) {
	
	// --------------------- //
	// ----- Left Tray ----- //
	// --------------------- //
	
	// Feed Icon
	const feedIconImg = createElement("amp-img", {"width": "48", "height": "48", "src": `/public/images/logo/logo-48.png`});
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
	
	// ----- Left Section ----- //
	
	const feedWrapChildren = [feedTop] as HTMLElement[];
	
	// Feed Image
	if(post.img || post.origImg) {
		let feedImageImg;
		
		if(post.origImg) {
			feedImageImg = createElement("amp-img", {
				"layout": "responsive", "max-width": `${post.w}`, "width": `${post.w}`, "height": `${post.h}`,
				"src": post.origImg
			});
		} else if(post.id) {
			const imgPage = Math.ceil(post.id/1000);
			const imgPath = `${post.forum}/${imgPage}/${post.img}`;
			
			feedImageImg = createElement("amp-img", {
				"layout": "responsive", "max-width": `${post.w}`, "width": `${post.w}`, "height": `${post.h}`,
				"src": `https://us-east-1.linodeobjects.com/druidis-cdn/${imgPath}`
			});
		}
		
		if(feedImageImg) {
			const feedImageInner = createElement("div", {"class": "feed-image-inner"}, [feedImageImg]);
			const feedImage = createElement("div", {"class": "feed-image"}, [feedImageInner]);
			
			// Feed Link (Applies to Media & Title + Content)
			const feedHov = createElement("a", {"class": "feed-hov", "href": post.url}, [feedImage]);
			feedWrapChildren.push(feedHov);
		}
	}
	
	// Create Feed Wrap (not including "Extra")
	const feedWrap = createElement("div", {"class": "feed-wrap"}, feedWrapChildren);
	
	// ----- Right Section ----- //
	
	// "Extra" Body
	const extraTitle = createElement("h2");
	extraTitle.innerHTML = post.title;
	
	const extraContent = createElement("p");
	extraContent.innerHTML = post.content;
	
	const extraBody = createElement("div", {"class": "extra-body"}, [extraTitle, extraContent]);
	const extraWrapLink = createElement("a", {"class": "feed-hov", href: post.url}, [extraBody]);
	
	// Breadcrumbs
	const breadcrumbs = createElement("div", {"class": "breadcrumbs"});
	
	// Check for forum parent. If present, link the parent in the breadcrumb.
	const sch = post.forum ? Config.schema[post.forum] : null;
	
	if(sch && sch.parent && sch.parent !== Config.forum) {
		const crumb = createElement("a", {"class": "crumb", "href": `/forum/${sch.parent}`});
		crumb.innerHTML = sch.parent;
		breadcrumbs.appendChild(crumb);
	}
	
	if(post.forum && post.forum !== Config.forum) {
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

function displayFeedPost(post: PostData) {
	
	const feedElement = buildPost(post);
	
	// Attach Created Elements to Feed Section
	const feedSection = document.getElementById("main-section");
	if(feedSection !== null) { feedSection.appendChild(feedElement); }
}

// Main Menu Clickable
document.getElementById("menuClick").addEventListener("click", function() {
	var menu = document.getElementById("menuMain");
	menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});
