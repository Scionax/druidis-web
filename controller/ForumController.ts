import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class ForumController extends WebController {
	
	// Cached HTML
	static html = "";
	static feedPage = "";
	static emptyFeed = "";
	static emptyFeedTwo = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(ForumController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// Cache Extras
		ForumController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
		ForumController.emptyFeed = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/empty-feed.html`));
		ForumController.emptyFeedTwo = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/empty-feed-two.html`));
		
		// Cache Full Page
		ForumController.html = `
		${WebController.header}
		<meta name="robots" content="noindex">
		${WebController.headerCloser}
		${WebController.midStart}
		${ForumController.feedPage}
		${WebController.midEnd}
		${WebController.footer}
		${ForumController.emptyFeed}
		${ForumController.emptyFeedTwo}
		${WebController.footerCloser}`;
	}
}