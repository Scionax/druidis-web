import Conn from "../core/Conn.ts";

export default class WebController {
	
	// Cached Layouts
	static layoutOpen: string;
	static layoutClose: string;
	
	// Cached Pages
	static bad404: string;
	
	// This only exists here as an interface, but is important for running RouteMap[url], which points to a WebRouter class.
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.send404();
	}
	
	static async initialize() {
		const decoder = new TextDecoder("utf-8");
		
		WebController.layoutOpen = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/layout-open.html`));
		WebController.layoutClose = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/html/layout-close.html`));
		
		// 404 Page
		WebController.bad404 = `
		${WebController.layoutOpen}
		Error 404: Page does not exist.
		${WebController.layoutClose}`;
	}
}
