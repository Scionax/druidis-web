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
		
		<!-- The core Firebase JS SDK is always required and must be listed first -->
		<script src="https://www.gstatic.com/firebasejs/8.9.1/firebase-app.js"></script>
		<script src="https://www.gstatic.com/firebasejs/8.9.1/firebase-auth.js"></script>
		
		<!-- Firebase UI -->
		<script src="https://www.gstatic.com/firebasejs/ui/4.8.1/firebase-ui-auth.js"></script>
		<link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/4.8.1/firebase-ui-auth.css" />
		
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${AboutController.aboutPage}
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
