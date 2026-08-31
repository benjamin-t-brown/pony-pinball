export const setupEmscriptenModule = (lib, params = { loadTimeout: -1 }) => {
  /** @type {any} */
  const localWindow = window;
  // Emscripten module
  const Module = {
    arguments: ['--language ' + lib.getConfig().language],
    jsLoaded: function () {
      Module.preRun[0]();
    },
    preRun: [
      function () {
        clearTimeout(params.loadTimeout);
      },
    ],
    postRun: [
      function () {
        lib.hideLoading();
        lib.showGame();

        if (lib.getConfig().shouldStartMuted) {
          // HACK: delayed because the WASM is sometimes not ready to accept the call
          // to mute it
          setTimeout(() => {
            Module.ccall('disableSound');
            lib.invokeEvent('onToggleSound', lib.getConfig().soundEnabled);
          }, 300);
        }

        if (lib.getConfig().isArcadeCabinet) {
          lib.disableModuleControls();
        }
      },
    ],
    canvas: (function () {
      const canvas = lib.getCanvas();
      if (canvas) {
        canvas.addEventListener(
          'webglcontextlost',
          function (e) {
            console.error(
              '[LIB] WebGL context lost. You will need to reload the page.'
            );
            lib.hideLoading();
            lib.showError();
            e.preventDefault();
          },
          false
        );
        if (lib.getConfig().isArcadeCabinet) {
          canvas.style.border = 'unset';
        }
      }

      return canvas;
    })(),
    onAbort: function () {
      console.error('[LIB] Program encountered an unknown error.');
      lib.showError();
      lib.hideLoading();
      lib.hideGame();
    },
    totalDependencies: 0,
    ccall: function (...args) {},
  };
  localWindow.Module = Module;
};
