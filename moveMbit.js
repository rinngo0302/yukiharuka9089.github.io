let reley;
let channel;

const START_MOTOR = 2000;

let tmpX, tmpY, tmpZ;

onload = function()
{
    relay = await RelayServer("achex", "chirimenSocket" );
    channel = await relay.subscribe("sumou_getSensorData");

    tmpX = 0; tmpY = 0; tmpZ = 0;
    
    channel.onmessage(getSensorData);
}

function getSensorData(msg)
{
    let mdata = msg.data;

    
}

function calc(accelData)
{
    if (accelData.x )
}