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
	
	static schema: { [forum: string]: string } = {"Business":"News","Economic":"News","Environment":"News","Legal":"News","Politics":"News","Social Issues":"News","World News":"News","Education":"Informative","History":"Informative","Science":"Informative","Technology":"Informative","Books":"Entertainment","Gaming":"Entertainment","Movies":"Entertainment","Music":"Entertainment","People":"Entertainment","Shows":"Entertainment","Sports":"Entertainment","Tabletop Games":"Entertainment","Virtual Reality":"Entertainment","Fashion":"Lifestyle","Fitness":"Lifestyle","Food":"Lifestyle","Health":"Lifestyle","Recipes":"Lifestyle","Relationships":"Lifestyle","Social Life":"Lifestyle","Travel":"Lifestyle","Ask":"Fun","Cosplay":"Fun","Cute":"Fun","Forum Games":"Fun","Funny":"Fun","Artwork":"Creative","Crafts":"Creative","Design":"Creative","Writing":"Creative"};
	
	async runHandler(conn: Conn): Promise<Response> {
		
		// Go to /forum (navigation center)
		if(!conn.url2) { return await conn.sendHTML(ForumController.forumNav); }
		
		// If the forum doesn't exist, send a 404.
		if(!ForumController.schema[conn.url2]) {
			return await conn.notFound();
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