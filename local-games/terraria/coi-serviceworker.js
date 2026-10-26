(() => {
    const headers = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin",
    };

    if (typeof window === "undefined") {
        self.addEventListener("install", () => self.skipWaiting());
        self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

        self.addEventListener("fetch", (event) => {
            if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;

            event.respondWith((async () => {
                const response = await fetch(event.request);
                if (response.status === 0) return response;

                const nextHeaders = new Headers(response.headers);
                for (const [key, value] of Object.entries(headers)) nextHeaders.set(key, value);

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: nextHeaders,
                });
            })());
        });
        return;
    }

    if (!("serviceWorker" in navigator) || window.crossOriginIsolated) return;

    navigator.serviceWorker.register("coi-serviceworker.js", { scope: "./" }).then((registration) => {
        const refresh = () => {
            if (!window.crossOriginIsolated) window.location.reload();
        };

        if (registration.active && navigator.serviceWorker.controller) {
            refresh();
            return;
        }

        navigator.serviceWorker.addEventListener("controllerchange", refresh, { once: true });
    }).catch((error) => {
        console.error("Failed to install cross-origin isolation service worker:", error);
    });
})();
