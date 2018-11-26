function main(param) {
	var scene = new g.Scene({game: g.game, assetIds: ["heart", "spade", "sparkle"]});
	var color = "heart";
	scene.loaded.add(function() {
		function generateHeart(x, y, color) {
			// heart変数にheart画像のSpriteを追加
			var heart = new g.Sprite({
				scene: scene,
				src: scene.assets[color],
				parent: container,
				x: x,
				y: y,
				tag: {
					counter: 0
				}
			});
			// 毎フレーム実行されるイベントであるupdateにイベントを登録
			heart.update.add(function(e) {
				// 毎フレームカウンタを追加
				heart.tag.counter++;
				if (heart.tag.counter > 100) {
					// カウンタが100を超えていたら削除する
					heart.destroy();
				} else if (heart.tag.counter > 50) {
					// カウンタが50を超えていたら半透明にしていく
					heart.opacity = (100 - heart.tag.counter) / 50;
					// このエンティティが変更されたという通知
					heart.modified();
				}
			});
		}
		// イベント取得用に、ローカルエンティティを透明で作成
		var container = new g.E({
			scene: scene,
			x: 0,
			y: 0,
			width: g.game.width,
			height: g.game.height,
			touchable: true,
			local: true,
			parent: scene
		});
		// ローカルエンティティのpointDownトリガーに関数を登録
		container.pointDown.add(function(e) {
			// タッチされたらローカル情報と座標情報を基にイベントを生成
			g.game.raiseEvent(new g.MessageEvent({
				type: "generate-heart",
				color: color,
				x: e.point.x - scene.assets["heart"].width / 2,
				y: e.point.y - scene.assets["heart"].height / 2
			}));
		});
		// Messageイベントを受け取るためのハンドラを登録
		scene.message.add(function(e) {
			// イベント種別を見て
			var data = e.data;
			if (data.type === "generate-heart") {
				// 色と座標情報を基にハートを作成
				generateHeart(
					data.x,
					data.y,
					data.color
				);
			}
		});
		// ---- ここからコントロールパネル。基本は全てローカルエンティティとして処理
		// コントロールパネルを作成。クリッピングをするためPaneを使う
		var controlPanel = new g.Pane({
			scene: scene,
			x: g.game.width - 48,
			y: 32,
			width: 32,
			height: 32,
			local: true,
			tag: {
				expand: false
			},
			parent: scene
		});
		// コントロールパネルの開閉スイッチを配置
		var panelSwitch = new g.FilledRect({
			scene: scene,
			x: 0,
			y: 0,
			width: 32,
			height: 32,
			cssColor: "#ccc",
			local: true,
			touchable: true,
			parent: controlPanel
		});
		// 選択されているツールにつける枠
		var activeTool = new g.FilledRect({
			scene: scene,
			x: 0,	// 座標はオープン時に計算するので仮
			y: 0,
			cssColor: "#f79",
			width: 34,
			height: 34,
			opacity: 0.5,
			local: true,
			parent: controlPanel
		});
		// コントロールパネルに表示するツールアイコンを作成する関数
		function createTool(assetId, y) {
			var tool = new g.Sprite({
				scene: scene,
				src: scene.assets[assetId],
				x: 8,
				y: y,
				parent: controlPanel,
				local: true,
				touchable: true,
				tag: {
					selected: true,
					assetId: assetId
				}
			});
			// ツールアイコンは使いまわすのでリサイズしておく
			tool.width = 32;
			tool.height = 32;
			tool.invalidate();
			// このツールを選択した結果を反映
			tool.pointDown.add(function(e) {
				color = tool.tag.assetId;
				activeTool.x = e.target.x - 1;
				activeTool.y = e.target.y - 1;
				activeTool.modified();
			});
			return tool;
		}
		var tools = [];
		// 用意するツールは三種類
		tools.push(createTool("heart", 48));
		tools.push(createTool("spade", 96));
		tools.push(createTool("sparkle", 144));
		// 開閉スイッチに触れたらコントロールパネルを開く
		panelSwitch.pointDown.add(function(e) {
			controlPanel.tag.expand = !controlPanel.tag.expand;
			if (controlPanel.tag.expand) {
				// 展開する
				controlPanel.height = 192;
				controlPanel.width = 48;
			} else {
				// 折りたたむ
				controlPanel.height = 32;
				controlPanel.width = 32;
			}
			controlPanel.invalidate();
		});
		// ここまでコントロールパネル ---- 

		// 最初に中心にハートを出現させる
		generateHeart(
			g.game.width / 2 - scene.assets["heart"].width / 2,
			g.game.height / 2 - scene.assets["heart"].height / 2,
			color
		);
	});
	g.game.pushScene(scene);
}

module.exports = main;