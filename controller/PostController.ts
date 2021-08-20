import Conn from "../core/Conn.ts";
import WebController from "./WebController.ts";

export default class AboutController extends WebController {
	
	async runHandler(conn: Conn): Promise<Response> {
		return await conn.sendFail("Method Not Allowed", 405);
	}
}