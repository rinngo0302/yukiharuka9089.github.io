//チャンネル一覧
const SUMOU_NG_FROM_JOIN = "SUMOU_NG_FROM_JOIN";
const SUMOU_NG_FROM_HOST = "SUMOU_NG_FROM_HOST";

//プレイヤーの定数
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

//micro:bit
let microBitBle;

//接続できたか
let getData = false;

//チャンネル
let inChannel;
let outChannel;
let channelCode;

//リレー
let relay;

//host.jsから取得するプレイヤーの空き具合を格納する変数(オブジェクト型)
let mdata = {
	player1_exist: false,
	player2_exist: false
};

//host.jsへ送信する変数(オブジェクト型)
let sending = {
	userId: "default",
	whitchPlayer: SPECTATOR
	//あとmicro:bit
};

let player;

let isWatch = false;

async function connect()
{
	channelCode = document.getElementById("channelCode").value;//チャンネルコードの取得
	console.log("channelCode: " + channelCode);

	relay = await RelayServer("achex", "chirimenSocket" );//リレーの設定
	//await setChannel();//チャンネルの設定
	inChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_HOST);//host.jsのプレイヤーの空き具合を取得するためのチャンネル
	inChannel.onmessage = setPlayer;

	var Log = document.getElementById("log");//結果をユーザーに示すためのタグを取得

	Log.innerHTML = "少々お待ちください...";

	alert("micro:bitと接続してください");

	// chirimen with micro:bitの初期化
	microBitBle = await microBitBleFactory.connect();

	console.log("micro:bitとのBLE接続が完了しました。");
	Log.innerHTML = "少々お待ちください...";

	if (!await canConnect())//接続できたかできていないかの取得
	{
		alert("Error: 接続できませんでした！");
		Log.innerHTML = "Error: 接続できませんでした。";
		return;
	}

	alert("準備が整いました！");
	Log.innerHTML = `${document.getElementById("userName").value} さん、それではお楽しみください！`;

	sendingData();
}

async function canConnect()//connect関数で呼び出し済み
{
	await canConnectWait();//result定数は関係ない

	if (!getData)
	{
		console.log("データは送信されませんでした");
		return false;
	}
	return true;
}

async function canConnectWait()//getWhitchPlayer関数で呼び出し済み
{
	for (let i = 0; i < 1000; i++)//データが来るまで待機
	{
		if (getData)
		{
			console.log("データが来ました");
			break;
		}
	
		if (i % 500 === 0)
		{
			console.log(i / 500);
		}
			
		await sleep(1);
	}
}

//"player1" か "player2" を決める
function setPlayer(msg)
{
	getData = true;
	mdata = msg.data;

	if (player == undefined)
	{
		console.log("プレイヤーを決めます");
		if (mdata.player1_exist)
		{
			player = PLAYER2;
		} else {
			player = PLAYER1;
		}
	}
}

async function sendingData()//データをhost.jsへ送信
{
	outChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_JOIN);//micro:bitのセンサをhost.jsへ送信するためのチャンネル

	let getUserName = document.getElementById("userName").value;
	let username = getUserName;
	
	while (true)
	{
		let sensorData = await microBitBle.readSensor();
		let time = new Date().toString();

		sending.userId = username;
		sending.whitchPlayer = player;

		sending.sensorData = sensorData;
		sending.time = time;

		console.log(`name: ${sending.userId}\nwhitchPlayer: ${sending.whitchPlayer}`);

		outChannel.send(sending);

		await sleep(1000);
	}
}