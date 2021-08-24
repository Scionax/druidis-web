import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

/*
	URL: /post/{forum}?category={category}&url={url}
*/

export default class PostController extends WebController {
	
	// Cached HTML
	static html = "";
	static postPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(PostController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// Cache Extras
		PostController.postPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/post.html`));
		
		// Cache Full Page
		PostController.html = `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		<div class="RInner">
			Post in this forum.
		</div>
		${WebController.panelClose}
		${PostController.postPage}
		${WebController.pageClose}
		${WebController.footer}`;
	}
}