//チャンネル一覧
const SUMOU_NG_FROM_JOIN = "SUMOU_NG_FROM_JOIN";
const SUMOU_NG_FROM_HOST = "SUMOU_NG_FROM_HOST";
const SUMOU_NG_HOSTMESSAGE_PLAYER1 = "SUMOU_NG_HOSTMESSAGE_PLAYER1";
const SUMOU_NG_HOSTMESSAGE_PLAYER2 = "SUMOU_NG_HOSTMESSAGE_PLAYER2";
const SUMOU_NG_WINJUDGE = "SUMOU_NG_WINJUDGE";

//Player定数
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

//チャンネル
let channelCode;
let outChannel;
let inChannel;
let outHostMessage;
let outJudge;
//let inMBitSensorDataChannel;//(2020/12/27時点: 未使用)

//リレー
let relay;

//ログ
let log;

//join.jsへ送るデータを格納する変数(オブジェクト型)
let sendingWhichPlayer = {
	player1_exist: false,
	player2_exist: false
};

//ホスト側のmicro:bitの設定等の変数(L57 ~ L62)
let microbit;
let gpioPort0;
let gpioPort1;
let microBitBle;
async function connect()
{	  
	setLoading();

	channelCode = document.getElementById("channelCode").value;//チャンネルコードの取得
	console.log("channelCode: " + channelCode);

	log = document.getElementById("log");
	log.innerText = "少々お待ちください...";
	
	//プレイヤーのmicro:bitの値を取得するときの設定
	//onload内↓
	// webSocketリレーの初期化
	relay = await RelayServer("achex", "chirimenSocket" );
	console.log("achex web socketリレーサービスに接続しました");
	//await setChannel();//onloadじゃない(使えないかも)

	inChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_JOIN);//join.jsのmicro:bitのデータを取得する用のチャンネルを設定
	inChannel.onmessage = getMessage;//join.jsからデータを取得したとき
	//onload内↑

	outJudge = await relay.subscribe(channelCode + SUMOU_NG_WINJUDGE);

	//ホスト側のmicro:bit(モータで動かすやつ)の設定
	microBitBle = await microBitBleFactory.connect();
  	console.log("micro:bitと接続しました");
  	var gpioAccess = await microBitBle.requestGPIOAccess();
  	var mbGpioPorts = gpioAccess.ports;
	gpioPort0 = mbGpioPorts.get(0);
	gpioPort1 = mbGpioPorts.get(1);
	await gpioPort0.export("out");
	await gpioPort1.export("out");

	deleteLoading();
	alert("準備ができました！！\nチャンネルコード: " + channelCode);
	log.innerHTML = "準備ができました。<br>チャンネルコード: <strong>" + channelCode + "</strong>";
	  
	sendWhichPlayer();//プレイヤーの空き具合をjoin.jsへ送信する関数を呼び出す(while)

}

function motor0(s) {
	if(s==true){
		gpioPort0.write(1);
	} else {
		gpioPort0.write(0);
	}
}
function motor1(s) {
	if(s==true){
		gpioPort1.write(1);
	} else {
		gpioPort1.write(0);
	}
}

//micro:bitの値を格納する変数
let username;
let temperature;
let brightness;
let button;
let accelX;
let accelY;
let accelZ;
let acc;
let motor;

let getData;
function getMessage(msg)
{
	getData = msg.data;
	
	let setPlayer;//"player1" か "player2" かを格納するローカル変数(string型)

	switch (getData.whichPlayer)
	{
		case PLAYER1:
			setPlayer = "player1"; 
			sendingWhichPlayer.player1_exist = true;
			break;

		case PLAYER2:
			sendingWhichPlayer.player2_exist = true;
			setPlayer = "player2";
			break;
	}

	//console.log(getData);

	getMBitSensor(setPlayer);//プレイヤーのmicro:bitのセンサのデータを表示(第一引数: playerの種類, 第二引数: micro:bitのセンサなどのデータ)
}

//センサの値を取得 + 表示
function getMBitSensor(player)
{
	let usernameT = document.getElementById(player + "_name");
	let temperatureT = document.getElementById(player + "_temperature");
	let brightnessT = document.getElementById(player + "_brightness");
	let buttonT = document.getElementById(player + "_button");
	let accelT = document.getElementById(player + "_accel");
	let timeT = document.getElementById(player + "_time");

	username = getData.userId;
	temperature = getData.sensorData.temperature;
	brightness = getData.sensorData.brightness;
	button = getData.sensorData.button;
	accelX = getData.sensorData.acceleration.x;
	accelY = getData.sensorData.acceleration.y;
	accelZ = getData.sensorData.acceleration.z;
	let time = getData.time;

	acc = {
		x: accelX,
		y: accelY,
		z: accelZ,
	}

	usernameT.innerText = getData.userId;
	temperatureT.innerText = getData.sensorData.temperature;
	brightnessT.innerText = getData.sensorData.brightness;
	buttonT.innerText = getData.sensorData.button;
	accelT.innerText = `x: ${accelX} y: ${accelY} z: ${accelZ}`;
	timeT.innerText = time;

	//console.log("micro:bitの値を取得！");

	moveMotor();
}

function moveMotor()
{
	let player1_motor = document.getElementById("player1_motor");
	let player2_motor = document.getElementById("player2_motor");

	var accel = evalAccel(acc);
	if (accel > 2000) {
	  //AuserTd.style.backgroundColor = "red";
	  switch (getData.whichPlayer) {
		case PLAYER1:
			player1_motor.innerText = "〇";
		  	motor0(true);
		  	break;
  
		case PLAYER2:
			player2_motor.innerText = "〇";
		  	motor1(true);
		  	break;
	  }
	} else {
	  switch (getData.whichPlayer)
	  {
		case PLAYER1:
			motor0(false);
			player1_motor.innerText = "×"; break;

		case PLAYER2:
			motor1(false);
			player2_motor.innerText = "×"; break;
	  }
	}
}

//join.jsへプレイヤーの空きを送信する
async function sendWhichPlayer()//connect関数内で呼ぶ出される
{
	outChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_HOST);//join.jsにプレイヤーの空き具合を送信する
	console.log("送信します。");
	while (true)
	{
		outChannel.send(sendingWhichPlayer);//プレイヤーの空きを送信する(to join.js)
		//console.log("送信...");

		await sleep(500);
	}
}

function evalAccel(acc) {
	return Math.abs(acc.x) + Math.abs(acc.y) + 1023 - Math.abs(acc.z);
}

async function reload()
{
	let username1 = document.getElementById("player1_name");
	let temperature1 = document.getElementById("player1_temperature");
	let brightness1 = document.getElementById("player1_brightness");
	let button1 = document.getElementById("player1_button");
	let accel1 = document.getElementById("player1_accel");
	let time1 = document.getElementById("player1_time");
	let username2 = document.getElementById("player2_name");
	let temperature2 = document.getElementById("player2_temperature");
	let brightness2 = document.getElementById("player2_brightness");
	let button2 = document.getElementById("player2_button");
	let accel2 = document.getElementById("player2_accel");
	let time2 = document.getElementById("player2_time");
	let motor1 = document.getElementById("player1_motor");
	let motor2 = document.getElementById("player2_motor");

	username1.innerText = "-";
	temperature1.innerText = "-";
	brightness1.innerText = "-";
	button1.innerText = "-";
	accel1.innerText = "-";
	time1.innerText = "-";
	username2.innerText = "-";
	temperature2.innerText = "-";
	brightness2.innerText = "-";
	button2.innerText = "-";
	accel2.innerText = "-";
	time2.innerText = "-";
	motor1.innerText = "-";
	motor2.innerText = "-";

	sendingWhichPlayer.player1_exist = false;
	sendingWhichPlayer.player2_exist = false;

	alert("リロードしました。");
}

async function judge(which)
{
	outJudge = await relay.subscribe(channelCode + SUMOU_NG_WINJUDGE);
	console.log("勝敗を決めます");
	outJudge.send(which);

	sendWhichPlayer();//帰ってくる
}

async function sendHostMessage(which)
{
	console.log("メッセージを送信します。");
	let message = document.getElementById("hostMessage").value;

	switch (which)
	{
		case PLAYER1:
			console.log("PLAYER1");
			outHostMessage = await relay.subscribe(channelCode + SUMOU_NG_HOSTMESSAGE_PLAYER1); break;

		case PLAYER2:
			outHostMessage = await relay.subscribe(channelCode + SUMOU_NG_HOSTMESSAGE_PLAYER2); break;
	}

	outHostMessage.send(message);
	console.log(message);

	sendWhichPlayer();//帰ってくる
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
