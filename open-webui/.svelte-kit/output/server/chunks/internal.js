import { r as root } from "./root.js";
import "./environment.js";
let public_env = {};
function set_private_env(environment) {
}
function set_public_env(environment) {
  public_env = environment;
}
let read_implementation = null;
function set_read_implementation(fn) {
  read_implementation = fn;
}
function set_manifest(_) {
}
const options = {
  app_template_contains_nonce: false,
  async: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  csrf_trusted_origins: [],
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hash_routing: false,
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root,
  service_worker: false,
  service_worker_options: void 0,
  server_error_boundaries: false,
  templates: {
    app: ({ head, body, assets, nonce, env }) => `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" type="image/png" href="/static/favicon.png" crossorigin="use-credentials" />
		<link
			rel="icon"
			type="image/png"
			href="/static/favicon-96x96.png"
			sizes="96x96"
			crossorigin="use-credentials"
		/>
		<link
			rel="icon"
			type="image/svg+xml"
			href="/static/favicon.svg"
			crossorigin="use-credentials"
		/>
		<link rel="shortcut icon" href="/static/favicon.ico" crossorigin="use-credentials" />
		<link
			rel="apple-touch-icon"
			sizes="180x180"
			href="/static/apple-touch-icon.png"
			crossorigin="use-credentials"
		/>
		<link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
		/>
		<meta name="theme-color" content="#171717" />
		<meta name="robots" content="noindex,nofollow" />

		<script src="/static/loader.js" defer crossorigin="use-credentials"><\/script>
		<link rel="stylesheet" href="/static/custom.css" crossorigin="use-credentials" />

		<script>
			function resizeIframe(obj) {
				obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
			}
		<\/script>

		<script>
			// On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
			(() => {
				const metaThemeColorTag = document.querySelector('meta[name="theme-color"]');
				const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

				if (!localStorage?.theme) {
					localStorage.theme = 'system';
				}

				if (localStorage.theme === 'system') {
					document.documentElement.classList.add(prefersDarkTheme ? 'dark' : 'light');
					metaThemeColorTag.setAttribute('content', prefersDarkTheme ? '#171717' : '#ffffff');
				} else if (localStorage.theme === 'oled-dark') {
					document.documentElement.style.setProperty('--color-gray-800', '#101010');
					document.documentElement.style.setProperty('--color-gray-850', '#050505');
					document.documentElement.style.setProperty('--color-gray-900', '#000000');
					document.documentElement.style.setProperty('--color-gray-950', '#000000');
					document.documentElement.classList.add('dark');
					metaThemeColorTag.setAttribute('content', '#000000');
				} else if (localStorage.theme === 'light') {
					document.documentElement.classList.add('light');
					metaThemeColorTag.setAttribute('content', '#ffffff');
				} else if (localStorage.theme === 'her') {
					document.documentElement.classList.add('her');
					metaThemeColorTag.setAttribute('content', '#983724');
				} else {
					document.documentElement.classList.add('dark');
					metaThemeColorTag.setAttribute('content', '#171717');
				}

				window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
					if (localStorage.theme === 'system') {
						if (e.matches) {
							document.documentElement.classList.add('dark');
							document.documentElement.classList.remove('light');
							metaThemeColorTag.setAttribute('content', '#171717');
						} else {
							document.documentElement.classList.add('light');
							document.documentElement.classList.remove('dark');
							metaThemeColorTag.setAttribute('content', '#ffffff');
						}
					}
				});
				const isDarkMode = document.documentElement.classList.contains('dark');

				const logo = document.createElement('img');
				logo.id = 'logo';
				logo.style =
					'position: absolute; width: auto; height: 6rem; top: 44%; left: 50%; transform: translateX(-50%); display:block;';
				logo.src = isDarkMode ? '/static/splash-dark.png' : '/static/splash.png';

				document.addEventListener('DOMContentLoaded', function () {
					const splash = document.getElementById('splash-screen');
					if (document.documentElement.classList.contains('her')) {
						return;
					}

					if (splash) splash.prepend(logo);
				});
			})();
		<\/script>

		<title>Open WebUI</title>

		` + head + '\n	</head>\n\n	<body data-sveltekit-preload-data="hover">\n		<div style="display: contents">' + body + '</div>\n\n		<div\n			id="splash-screen"\n			style="position: fixed; z-index: 100; top: 0; left: 0; width: 100%; height: 100%"\n		>\n			<style type="text/css" nonce="">\n				html {\n					overflow-y: scroll !important;\n				}\n			</style>\n\n			<div\n				style="\n					position: absolute;\n					top: 33%;\n					left: 50%;\n\n					width: 24rem;\n					transform: translateX(-50%);\n\n					display: flex;\n					flex-direction: column;\n					align-items: center;\n				"\n			>\n				<img\n					id="logo-her"\n					style="width: auto; height: 13rem"\n					src="/static/splash.png"\n					class="animate-pulse-fast"\n				/>\n\n				<div style="position: relative; width: 24rem; margin-top: 0.5rem">\n					<div\n						id="progress-background"\n						style="\n							position: absolute;\n							width: 100%;\n							height: 0.75rem;\n\n							border-radius: 9999px;\n							background-color: #fafafa9a;\n						"\n					></div>\n\n					<div\n						id="progress-bar"\n						style="\n							position: absolute;\n							width: 0%;\n							height: 0.75rem;\n							border-radius: 9999px;\n							background-color: #fff;\n						"\n						class="bg-white"\n					></div>\n				</div>\n			</div>\n\n			<!-- <span style="position: absolute; bottom: 32px; left: 50%; margin: -36px 0 0 -36px">\n				Footer content\n			</span> -->\n		</div>\n	</body>\n\n	<style type="text/css" nonce="">\n		html {\n			overflow-y: hidden !important;\n			overscroll-behavior-y: none;\n		}\n\n		#splash-screen {\n			background: #fff;\n		}\n\n		html.dark #splash-screen {\n			background: #000;\n		}\n\n		html.her #splash-screen {\n			background: #983724;\n		}\n\n		#logo-her {\n			display: none;\n		}\n\n		#progress-background {\n			display: none;\n		}\n\n		#progress-bar {\n			display: none;\n		}\n\n		html.her #logo {\n			display: none;\n		}\n\n		html.her #logo-her {\n			display: block;\n			filter: invert(1);\n		}\n\n		html.her #progress-background {\n			display: block;\n		}\n\n		html.her #progress-bar {\n			display: block;\n		}\n\n		@media (max-width: 24rem) {\n			html.her #progress-background {\n				display: none;\n			}\n\n			html.her #progress-bar {\n				display: none;\n			}\n		}\n\n		@keyframes pulse {\n			50% {\n				opacity: 0.65;\n			}\n		}\n\n		.animate-pulse-fast {\n			animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n		}\n	</style>\n</html>\n',
    error: ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
  },
  version_hash: "cr2dth"
};
async function get_hooks() {
  let handle;
  let handleFetch;
  let handleError;
  let handleValidationError;
  let init;
  let reroute;
  let transport;
  return {
    handle,
    handleFetch,
    handleError,
    handleValidationError,
    init,
    reroute,
    transport
  };
}
export {
  set_public_env as a,
  set_read_implementation as b,
  set_manifest as c,
  get_hooks as g,
  options as o,
  public_env as p,
  read_implementation as r,
  set_private_env as s
};
//# sourceMappingURL=internal.js.map
