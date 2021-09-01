import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

/*
	URL: /post/{forum}?category={category}&url={url}
*/

export default class PostController extends WebController {
	
	// Cached HTML
	static postPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(PostController.postPage);
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		PostController.postPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/post.html`));
	}
}