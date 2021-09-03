import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

/*
	// Caching with localStorage
	- posts:{forum}				// Posts already received from the server.
	- lastPull:{forum}			// Last Timestamp that NEW posts were requested.
	
	// Generate Variables On Load
	- idHigh		// Highest ID of cached posts.
	- idLow			// Lowest ID of cached posts.
	
	// Procedure on forum load:
	- Check if the user has cached content already.
		- If so, check the last timestamp a request was made for this forum.
		- If last request time as over 5 minutes ago, request an ascending update. Include `idHigh` as closest cached result to identify return values.
		- If last request time was over 12 hours ago, request new content update.
			- New Content Update should include `idHigh` as the closest cached result. This helps identify how the server should respond.
	
	// Procedure on scrolling:
	- Check if the user scrolls near an unknown ID range / non-cached results.
	- Load the most recent 10 posts in the forum.
	- Update the ID range that the user has retrieved.
	
	// Server Calls
	/forum/:forum --> returns [{"title":"First Post", ...}, {"title":"Second Post", ...}, ...]
*/

export default class ForumController extends WebController {
	
	// Cached HTML
	static feedPage = "";
	static forumNav = "";
	
	static schema: { [id: string]: { children?: string[], parent?: string } } = {"News":{"children":["Business","Economic","Environment","Legal","Politics","Social Issues","World News"]},"Business":{"parent":"News"},"Economic":{"parent":"News"},"Environment":{"parent":"News"},"Legal":{"parent":"News"},"Politics":{"parent":"News"},"Social Issues":{"parent":"News"},"World News":{"parent":"News"},"Informative":{"children":["Education","History","Science","Technology"]},"Education":{"parent":"Informative"},"History":{"parent":"Informative"},"Science":{"parent":"Informative"},"Technology":{"parent":"Informative"},"Entertainment":{"children":["Books","Gaming","Movies","Music","People","Shows","Sports","Tabletop Games","Virtual Reality"]},"Books":{"parent":"Entertainment"},"Gaming":{"parent":"Entertainment"},"Movies":{"parent":"Entertainment"},"Music":{"parent":"Entertainment"},"People":{"parent":"Entertainment"},"Shows":{"parent":"Entertainment"},"Sports":{"parent":"Entertainment"},"Tabletop Games":{"parent":"Entertainment"},"Virtual Reality":{"parent":"Entertainment"},"Lifestyle":{"children":["Fashion","Fitness","Food","Health","Recipes","Social Life","Relationships","Travel"]},"Fashion":{"parent":"Lifestyle"},"Fitness":{"parent":"Lifestyle"},"Food":{"parent":"Lifestyle"},"Health":{"parent":"Lifestyle"},"Recipes":{"parent":"Lifestyle"},"Relationships":{"parent":"Lifestyle"},"Social Life":{"parent":"Lifestyle"},"Travel":{"parent":"Lifestyle"},"Fun":{"children":["Ask","Cosplay","Cute","Forum Games","Funny"]},"Ask":{"parent":"Fun"},"Cosplay":{"parent":"Fun"},"Cute":{"parent":"Fun"},"Forum Games":{"parent":"Fun"},"Funny":{"parent":"Fun"},"Creative":{"children":["Artwork","Crafts","Design","Writing"]},"Artwork":{"parent":"Creative"},"Crafts":{"parent":"Creative"},"Design":{"parent":"Creative"},"Writing":{"parent":"Creative"}};
	
	async runHandler(conn: Conn): Promise<Response> {
		
		// Go to /forum (navigation center)
		if(!conn.url2) { return await conn.sendHTML(ForumController.forumNav); }
		
		// If the forum doesn't exist, send a 404.
		if(!ForumController.schema[conn.url2]) {
			return await conn.send404();
		}
		
		// Load a forum feed
		return await conn.sendHTML(ForumController.feedPage);
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		ForumController.forumNav = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/forum-nav.html`));
		ForumController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
	}
}