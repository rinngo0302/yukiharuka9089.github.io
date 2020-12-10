// Remote Example1 - controller

//チャンネル一覧
const TEAM_A_SUMOU_WITCH_PLAYER = "TEAM_A_SUMOU_WITCH_PLAYER";
const TEAM_A_SUMOU_PLAYER_DATA = "TEAM_A_SUMOU_PLAYER_DATA";

//Player
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

let channelCode;
let outChannel
let getChannel;

let sending = {
	player1_exist: false,
	player2_exist: false
};

let microbit;
let gpioPort0;
let microBitBle;
async function connect()
{	  
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
let mdata;
function getMessage(msg)
{
	mdata = msg.data;
	
	let setPlayer;

	switch (mdata.witchPlayer)
	{
		case PLAYER1:
			setPlayer = "player1"; 
			sending.player1_exist = true;
			break;

		case PLAYER2:
			sending.player2_exist = true;
			setPlayer = "player2";
			break;
	}
}

function clickChannel()
{
	let inputChannel = document.getElementById("channelCode");
	inputChannel.value = "";
}

function gameStart()
{
	let inputChannel = document.getElementById("channelCode");
	channelCode = inputChannel.value;
	sendPlayer();
}

//センサの値を取得 + 表示
function getMBitSensor(player)
{	
	let usernameT = document.getElementById(setPlayer + "_name");
	let temperatureT = document.getElementById(setPlayer + "_temperature");
	let brightnessT = document.getElementById(setPlayer + "_brightness");
	let buttonT = document.getElementById(setPlayer + "_button");
	let accelT = document.getElementById(setPlayer + "_accel");
	let timeT = document.getElementById(setPlayer + "_time");

	let resultT = document.getElementById(setPlayer + "_result");

	username = mdata.userId;
	temperature = mdata.sensorData.temperature;
	brightness = mdata.sensorData.brightness;
	button = mdata.sensorData.button;
	accelX = mdata.sensorData.acceleration.x;
	accelY = mdata.sensorData.acceleration.y;
	accelZ = mdata.sensorData.acceleration.z;
	let time = mdata.time;

	acc = {
		x: accelX,
		y: accelY,
		z: accelZ,
	}

	usernameT.innerText = mdata.userId;
	temperatureT.innerText = mdata.sensorData.temperature;
	brightnessT.innerText = mdata.sensorData.brightness;
	buttonT.innerText = mdata.sensorData.button;
	accelT.innerText = `x: ${accelX} y: ${accelY} z: ${accelZ}`;
	timeT.innerText = time;

	resultT.innerHTML = `username: ${username}<br>
				temperature: ${temperature}<br>
				brightness: ${brightness}<br>
				button: ${button}<br>
				acceleration: x: ${accelX} y: ${accelY} z: ${accelZ}<br>
				time: ${time}`;

	console.log("取得");
}

function moveMotor()
{
	var accel = evalAccel(acc);
	if (accel > 2000) {
	  //AuserTd.style.backgroundColor = "red";
	  switch (mdata.witchPlayer) {
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

async function sendPlayer()
{
	let relay = RelayServer("achex", "chirimenSocket" );
	outChannel = await relay.subscribe(channelCode + TEAM_A_SUMOU_WITCH_PLAYER);

	while (true)
	{
		outChannel.send(sending);

		await sleep(500);
	}
}

function evalAccel(acc) {
	return Math.abs(acc.x) + Math.abs(acc.y) + 1023 - Math.abs(acc.z);
}