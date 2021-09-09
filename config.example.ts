
export const config = {
	serverLocal: {
		// POSSIBLE: Using hostname: "localhost" rejects access because BINDING or some $#!^. Leaving it empty works.
		port: 8060,		// A different port is used on local so we don't conflict with nginx.
		certFile: "",
		keyFile: "",
	},
	server: {
		// POSSIBLE: Using hostname: "localhost" rejects access because BINDING or some $#!^. Leaving it empty works.
		port: 8060,
		// port: 443,
		certFile: "/etc/letsencrypt/live/api.druidis.org/fullchain.pem",
		keyFile: "/etc/letsencrypt/live/api.druidis.org/privkey.pem",
	},
	local: false,
	prod: true,
}
