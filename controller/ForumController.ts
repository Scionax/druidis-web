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
	static html = "";
	static feedPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(ForumController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// Cache Extras
		ForumController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
		
		// Cache Full Page
		ForumController.html = `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${ForumController.feedPage}
		${WebController.pageClose}
		<script>
		window.onload = function() {
			loadFeed();
		};
		</script>
		${WebController.footer}`;
	}
}