//チャンネル一覧
const SUMOU_NG_FROM_JOIN = "SUMOU_NG_FROM_JOIN";
const SUMOU_NG_FROM_HOST = "SUMOU_NG_FROM_HOST";

//Player定数
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

//チャンネル
let channelCode;
let outChannel;
let inChannel;
//let inMBitSensorDataChannel;//(2020/12/27時点: 未使用)

//リレー
let relay;

//join.jsへ送るデータを格納する変数(オブジェクト型)
let sendingWhichPlayer = {
	player1_exist: false,
	player2_exist: false
};

//ホスト側のmicro:bitの設定等の変数(L57 ~ L62)
let microbit;
let gpioPort0;
let microBitBle;
async function connect()
{	  
	channelCode = document.getElementById("channelCode").value;//チャンネルコードの取得
	console.log("channelCode: " + channelCode);
	
	//プレイヤーのmicro:bitの値を取得するときの設定
	//onload内↓
	// webSocketリレーの初期化
	relay = await RelayServer("achex", "chirimenSocket" );
	console.log("achex web socketリレーサービスに接続しました");
	//await setChannel();//onloadじゃない(使えないかも)

	inChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_JOIN);//join.jsのmicro:bitのデータを取得する用のチャンネルを設定
	inChannel.onmessage = getMessage;//join.jsからデータを取得したとき

	sendWhichPlayer();//プレイヤーの空き具合をjoin.jsへ送信する関数を呼び出す(while)
	//onload内↑

	//ホスト側のmicro:bit(モータで動かすやつ)の設定
	microBitBle = await microBitBleFactory.connect();
  	console.log("micro:bitと接続しました");
  	var gpioAccess = await microBitBle.requestGPIOAccess();
  	var mbGpioPorts = gpioAccess.ports;
  	gpioPort0 = mbGpioPorts.get(0);
  	await gpioPort0.export("out");
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

	console.log(getData);

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

	let resultT = document.getElementById(player + "_result");

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

	resultT.innerHTML = `username: ${username}<br>
				temperature: ${temperature}<br>
				brightness: ${brightness}<br>
				button: ${button}<br>
				acceleration: x: ${accelX} y: ${accelY} z: ${accelZ}<br>
				time: ${time}`;

	console.log("micro:bitの値を取得！");
}

function moveMotor()
{
	var accel = evalAccel(acc);
	if (accel > 1500) {
	  //AuserTd.style.backgroundColor = "red";
	  switch (getData.whichPlayer) {
		case PLAYER1:
		  motor0(true);
		  break;
  
		case PLAYER2:
		  motor1(true);
		  break;
	  }
	} else {
	  motor0(false);
	  motor1(false);
	}
}

//join.jsへプレイヤーの空きを送信する
async function sendWhichPlayer()//connect関数内で呼ぶ出される
{
	outChannel = await relay.subscribe(channelCode + SUMOU_NG_FROM_HOST);//join.jsにプレイヤーの空き具合を送信する
	while (true)
	{
		outChannel.send(sendingWhichPlayer);//プレイヤーの空きを送信する(to join.js)
		console.log("送信...");

		await sleep(500);
	}
}

function evalAccel(acc) {
	return Math.abs(acc.x) + Math.abs(acc.y) + 1023 - Math.abs(acc.z);
}
