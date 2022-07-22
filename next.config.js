const withTM = require("next-transpile-modules")(["ol", "jsts"]);
module.exports = withTM({
    reactStrictMode: true,
    productionBrowserSourceMaps: true,
});
