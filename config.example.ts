
export const config = {
	serverLocal: {
		// POSSIBLE: Using hostname: "localhost" rejects access because BINDING or some $#!^. Leaving it empty works.
		port: 8060,		// A different port is used on local so we don't conflict with nginx.
		certFile: "",
		keyFile: "",
	},
	server: {
		// POSSIBLE: Using hostname: "localhost" rejects access because BINDING or some $#!^. Leaving it empty works.
		port: 80,
		certFile: "",
		keyFile: "",
	},
	local: false,
	prod: true,
	debug: {
        logging: true,
        verbose: true,		// Provide extra logging details.
	},
	cookies: {
		password: "amFm3KdMdre_ns6teI2x4o4KjEvmsa0on",
	},
}
