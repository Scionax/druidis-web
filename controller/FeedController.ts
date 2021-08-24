import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class FeedController extends WebController {
	
	// Cached HTML
	static html = "";
	static feedPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(FeedController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// Cache Extras
		FeedController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
		
		// Cache Full Page
		FeedController.html = `
		${WebController.header}
		<meta name="robots" content="noindex">
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${FeedController.feedPage}
		${WebController.pageClose}
		${WebController.footer}`;
	}
}