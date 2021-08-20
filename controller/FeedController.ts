import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class FeedController extends WebController {
	
	// Cached HTML
	static html = "";
	static feedPage = "";
	static emptyFeed = "";
	static emptyFeedTwo = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(FeedController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// Cache Extras
		FeedController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
		FeedController.emptyFeed = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/empty-feed.html`));
		FeedController.emptyFeedTwo = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/empty-feed-two.html`));
		
		// Cache Full Page
		FeedController.html = `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.midStart}
		${FeedController.feedPage}
		${WebController.midEnd}
		${WebController.footer}
		${FeedController.emptyFeed}
		${FeedController.emptyFeedTwo}
		${WebController.footerCloser}`;
	}
}