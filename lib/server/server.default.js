module.exports = {
	"case_sensitive_routing": true,
	"compression": false,
	"port": 80,
	"trust_proxy": true,
	"statics": [
		{
			"relpath": "assets",
			"route": "assets"
		}
	],
	"strict_routing": true,
	"method_override": true,
	"routers": [
		{
			"relpath": "routers"
		}
	],
	"templates": [
		{
			"relpath": "views",
			"route": "app",
			"renderer": "nunjucks"
		}
	],
	"socketfile": null
}
