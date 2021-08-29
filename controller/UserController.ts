import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class UserController extends WebController {
	
	// Cached HTML
	static userPage = "";
	static loginPage = "";
	
	// Cached CSS
	static css = `
	<style>
	</style>
	`;
	
	async runHandler(conn: Conn): Promise<Response> {
		
		// if(!conn.url2) { return await conn.sendHTML(UserController.userPage); }
		if(conn.url2 === "login") { return await conn.sendHTML(UserController.loginPage); }
		
		return await conn.send404(WebController.bad404);
	}
	
	static async initialize() {
		// UserController.userPage = await UserController.cachePage(`/public/pages/user/user.html`, "");
		UserController.loginPage = await UserController.cachePage(`/public/pages/user/login.html`, "/login");
	}
	
	static async cachePage(htmlPath: string, _activedUrl: string) {
		const decoder = new TextDecoder("utf-8");
		const html = decoder.decode(await Deno.readFile(`${Deno.cwd()}${htmlPath}`));
		
		return `
		${WebController.header}
		${WebController.headerCloser}
		${WebController.panelOpen}
		${WebController.panelClose}
		${UserController.css}
		
		<!-- Layout: About Section -->
		<div id="main-section" class="layoutMain">
			${html}
		</div>
	
		${WebController.pageClose}
		${WebController.footer}`;
	}
}
