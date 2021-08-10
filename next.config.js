const nextTranslate = require("next-translate");

module.exports = nextTranslate({
  reactStrictMode: true,
  async rewrites(){
    return [{
      source: '/uploads/:path*',
      destination: "/api/uploads/:path*"
    }]
  }
});
