import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class AboutController extends WebController {
	
	// Cached HTML
	static html = "";
	static aboutPage = "";
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendHTML(AboutController.html);
	}
	
	static async initialize() {
		
		const decoder = new TextDecoder("utf-8");
		
		// // Cache Extras
		AboutController.aboutPage = decoder.decode(await Deno.readFile(`${Deno.cwd()}/public/pages/about.html`));
		
		// Cache Full Page
		AboutController.html = `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${AboutController.aboutPage}
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
