import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class FeedController extends WebController {
	
	// Cached HTML
	static feedPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(FeedController.feedPage);
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		FeedController.feedPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/feed.html`));
	}
}