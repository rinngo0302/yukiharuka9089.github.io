//チャンネル一覧
const SUMOU_NG_FROM_JOIN = "SUMOU_NG_FROM_JOIN";
const SUMOU_NG_FROM_HOST = "SUMOU_NG_FROM_HOST";
const SUMOU_NG_HOSTMESSAGE_PLAYER1 = "SUMOU_NG_HOSTMESSAGE_PLAYER1";
const SUMOU_NG_HOSTMESSAGE_PLAYER2 = "SUMOU_NG_HOSTMESSAGE_PLAYER2";
const SUMOU_NG_WINJUDGE = "SUMOU_NG_WINJUDGE";

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
let inJudgeChannel;
let inHostMessageChannel;

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
	whichPlayer: undefined
	//あとmicro:bit
};

let player;

let isWatch = false;

let Log;

async function connect()
{
	setLoading();

	channelCode = document.getElementById("channelCode").value;//チャンネルコードの取得
	console.log("channelCode: " + channelCode);

	relay = await RelayServer("achex", "chirimenSocket" );//リレーの設定
	//await setChannel();//チャンネルの設定
	inChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_HOST);//host.jsのプレイヤーの空き具合を取得するためのチャンネル
	inChannel.onmessage = setPlayer;

	Log = document.getElementById("log");//結果をユーザーに示すためのタグを取得

	Log.innerHTML = "少々お待ちください...";

	alert("micro:bitと接続してください");

	// chirimen with micro:bitの初期化
	microBitBle = await microBitBleFactory.connect();

	console.log("micro:bitとのBLE接続が完了しました。");
	Log.innerHTML = "少々お待ちください...";

	if (!await canConnect())//接続できたかできていないかの取得
	{
		deleteLoading();
		alert("Error: 接続できませんでした！");
		Log.innerHTML = "Error: 接続できませんでした。";
		return;
	}

	if (player == SPECTATOR)
	{
		deleteLoading();
		alert("申し訳ありませんが、プレイヤーは満員でした。")
		Log.innerHTML = "プレイヤーが抜けてから、入り直してください。";
		return;
	}

	inJudgeChannel = await relay.subscribe(channelCode + SUMOU_NG_WINJUDGE);
	inJudgeChannel.onmessage = getJudge;

	switch (player)
	{
		case PLAYER1:
			inHostMessageChannel = await relay.subscribe(channelCode + SUMOU_NG_HOSTMESSAGE_PLAYER1); break;

		case PLAYER2:
			inHostMessageChannel = await relay.subscribe(channelCode + SUMOU_NG_HOSTMESSAGE_PLAYER2); break;
	}
	inHostMessageChannel.onmessage = getHostMessage;

	deleteLoading();

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

async function canConnectWait()//getWhichPlayer関数で呼び出し済み
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
			if (!mdata.player2_exist)
			{
				player = PLAYER2;
			} else {
				player = SPECTATOR;
			}
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
		sending.whichPlayer = player;

		sending.sensorData = sensorData;
		sending.time = time;

		console.log(`name: ${sending.userId}\nwhichPlayer: ${sending.whichPlayer}`);

		outChannel.send(sending);

		await sleep(1000);
	}
}

async function getJudge(msg)
{
	if (msg.data == player)
	{
		alert("あなたの勝利です！");
		Log.innerHTML = "勝利！！";
	} else if (msg.data != player)
	{
		alert("あなたの敗北です。")
		Log.innerHTML = "敗北";
	}
}

async function getHostMessage(msg)
{
	alert("ホストからのメッセージ\n" + msg.data);
	Log.innerHTML = "ホストからのメッセージ<div>" + msg.data;
}

async function setLoading()
{
	let loadingArea = document.getElementById("loadArea");

	let mainLoading = document.createElement("div");
	mainLoading.id = "mainLoading";
	mainLoading.className = "sk-chase";
	loadingArea.appendChild(mainLoading);

	let getMainLoading = document.getElementById("mainLoading");
	let loading = new Array;
	for (let i = 0; i < 6; i++)
	{
		loading.push(document.createElement("div"));
		loading[i].className = "sk-chase-dot";
		getMainLoading.appendChild(loading[i]);
	}
}
async function deleteLoading()
{
	let getMainLoading = document.getElementById("mainLoading");
	getMainLoading.remove();
}