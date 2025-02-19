// 这里编写自定义js脚本；将被静态引入到页面中
// 这里编写自定义js脚本；将被静态引入到页面中
var OriginTitile = document.title;
var jiao;

document.addEventListener('visibilitychange', function () {
		if (document.visibilityState === undefined || document.visibilityState === 'visible') {
				document.title = '(^∇^*)欢迎肥来！' + OriginTitile;
				jiao = setTimeout(function () {
						document.title = OriginTitile;
				}, 4000);
		} else {
				document.title = '你怎么跑啦w(ﾟДﾟ)w';
				clearTimeout(jiao);
		}
});
