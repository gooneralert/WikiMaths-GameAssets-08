(function bootUnity() {
  let build = null;
  try {
    build = JSON.parse(
      document.getElementById("unity-build")?.textContent ?? "null",
    );
  } catch {
    build = null;
  }
  const canvas = document.getElementById("unity-canvas");
  if (!build || !canvas) {
    fail("The game build is unavailable");
    return;
  }
  const script = document.createElement("script");
  script.src = build.loader;
  script.onerror = () =>
    console.error("The game loader could not be downloaded");
  script.onload = () => {
    const start = globalThis.createUnityInstance;
    if (typeof start !== "function") {
      console.error("The game loader is unavailable");
      return;
    }
    const config = {
      ...build.config,
      showBanner: (message, kind) => {
        if (kind === "error") console.error(message);
        else console.warn(message);
      },
    };
    let percent = -1;
    const onProgress = (progress) => {
      const next = Math.floor(progress * 100);
      if (next === percent) return;
      percent = next;
    };
    Promise.resolve()
      .then(() => start(canvas, config, onProgress))
      .then((error) =>
        console.error(error instanceof Error ? error.message : String(error)),
      );
  };
  document.body.append(script);
})();
