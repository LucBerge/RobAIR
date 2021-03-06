function setArrowActive(arrow) {
    $("#" + arrow).removeClass("btn-default");
    $("#" + arrow).addClass("active");
    $("#" + arrow).addClass("btn-primary");
}

function setArrowDanger(arrow, on) {
    if(on)
    {
      $("#" + arrow).removeClass("btn-default");
      $("#" + arrow).removeClass("active");
      $("#" + arrow).removeClass("btn-primary");
      $("#" + arrow).addClass("btn-danger");
    }
    else {
        $("#" + arrow).removeClass("btn-danger");
        $("#" + arrow).addClass("btn-default");
    }
}

var left = function() {
    stop();
    setArrowActive("left");
    robairros.left();
}

var right = function() {
    stop();
    setArrowActive("right");
    robairros.right();
}

var foward = function() {
    stop();
    setArrowActive("foward");
    robairros.foward();
}

var backward = function() {
    stop();
    setArrowActive("backward");
    robairros.backward();
}

var stop = function() {
    $(".active").removeClass("btn-primary");
    $(".active").addClass("btn-default");
    $(".active").removeClass("active");
    robairros.stop();
}



var setSpeed = function(speed) {
    robairros.setSpeed(speed);
    $('#speed').val(robairros.speed);
}
$('#speed').val(robairros.speed);

//Gestion evenement utilisateur

$('#speed').on("change", function() {
    setSpeed($(this).val());
});

var lastkeydown = 0;

$(document).keydown(function(e) {

    if (lastkeydown != e.which) {
        //console.log(e.which);
        switch (e.which) {
            case 37: // left
                left();
                lastkeydown = e.which;
                break;
            case 38: // up
                foward();
                lastkeydown = e.which;
                break;
            case 39: // right
                right();
                lastkeydown = e.which;
                break;
            case 40: // down
                backward();
                lastkeydown = e.which;
                break;
            case 107: // down
                setSpeed(robairros.speed + 5);
                break;
            case 109: // down
                setSpeed(robairros.speed - 5);
                break;
            case 79: // down
                robairros.setHead(5);
                break;
            case 80: // down
                turnheadleft();
                break;
            case 73: // down
                turnheadright();
                break;
            default:
                return; // exit this handler for other keys
        }
    }
    if (e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40 || e.which == 107 || e.which == 109 || e.which == 73 || e.which == 79 || e.which == 80) {
        e.preventDefault(); // prevent the default action (scroll / move caret)
    }
});

$(document).keyup(function(e) {
    switch (e.which) {
        case 37:
        case 38: // up
        case 39: // right
        case 40: // down
            lastkeydown = 0;
            stop();
            e.preventDefault(); // prevent the default action (scroll / move caret)
            break;
        case 79: // down
        case 80: // down
        case 73: // down
            lastkeydown = 0;
            turnheadstop();
            e.preventDefault(); // prevent the default action (scroll / move caret)
            break;
        default:
            return; // exit this handler for other keys
    }
});


$('#left').mousedown(left).mouseup(stop);
$('#right').mousedown(right).mouseup(stop);
$('#foward').mousedown(foward).mouseup(stop);
$('#backward').mousedown(backward).mouseup(stop);
$('#refresh').click(function()
{
  robairros.reboot();
  $('#rebootModal').modal();
  var count =5;
  setInterval(function(){
    count--;
    $('#rebootCount').html(""+count);
  },1000)
});





////////////////////////////// EVENT ROS /////////////////////////////////////

robairros.batteryChange = function(battery) {
    if (battery > 26) battery = 26;
    else if (battery < 21) battery = 21;
    $("#battery").removeClass();
    $("#battery").addClass("fa fa-battery-" + (battery - 21));
}

var sendPing = function()
{
  robairros.sendPing();
  robairros.pingTimeout = setTimeout(function() {
    robairros.pingChange(3000);
    sendPing();
  }, 3000);
}

sendPing();

robairros.pongChange = function() {
    var ping= $.now()-robairros.ping;
    clearTimeout(robairros.pingTimeout);
    if(ping < 1000)
    {
      setTimeout(function(){
        sendPing();
      },1000-ping);
    }else {
      sendPing();
    }
    if (ping > 500)
        $("#ping").css('color', 'red');
    else if (ping > 200)
        $("#ping").css('color', 'orange');
    else {
        $("#ping").css('color', 'black');
    }
    $("#pingtxt").text(ping);
}
    /////////////////////////////YEUX//////////////////////////////

robairros.eyesChange = function(id) {
    Eyes.drawEyes(id);
}

var eyesCanvas = $("#eyesCanvas");
eyesCanvas.on("click", function(e) {
    var posX = (e.pageX - $(this).offset().left) / $(this).width(),
        posY = (e.pageY - $(this).offset().top) / $(this).height();

    if (posX < 0.25) {
        //Eyes.drawEyes(Eyes.EYESLEFT);
        robairros.setEyes(Eyes.EYESLEFT);
    } else if (posX > 0.75) {
        //Eyes.drawEyes(Eyes.EYESRIGHT);
        robairros.setEyes(Eyes.EYESRIGHT);
    } else if (posY < 0.25) {
        //Eyes.drawEyes(Eyes.EYESTOP);
        robairros.setEyes(Eyes.EYESTOP);
    } else if (posY > 0.75) {
        //Eyes.drawEyes(Eyes.EYESBOTTOM);
        robairros.setEyes(Eyes.EYESBOTTOM);
    } else {
        //Eyes.drawEyes(Eyes.EYESSTRAIGHT);
        robairros.setEyes(Eyes.EYESSTRAIGHT);
    }
});


//////////////////////HEAD////////////////


var headcur = 0;
robairros.headChange = function(deg) {
    headcur=deg;
    setHeadTheta(deg);
}

function setHeadTheta(val) {
    var srotate = "rotate(" + val + "deg)";
    $("#head").css({
        "-webkit-transform": srotate,
        "transform": srotate,
        "-webkit-transform-origin": "50% 100%",
        "transform-origin": "50% 100%"
    });

}
var turnheadright = function() {

  robairros.setEyes(Eyes.EYESLEFT);
    robairros.setHead(90);
}
var turnheadleft = function() {

  robairros.setEyes(Eyes.EYESRIGHT);
  robairros.setHead(-90);
}
var turnheadstop = function() {
  robairros.setHead(headcur);
  robairros.setEyes(Eyes.EYESSTRAIGHT);
}

var analogGamepad = function (dx, dy) {

    var kx = robairros.speed / 100;
    var ky = robairros.speed / 100;

    var v, speed1, speed2;

    speed1 = 0;
    speed2 = 0;

    dx=-dx;
    var theta = Math.atan(dy / dx); // En radian
    if (dx <= 0 && dy >= 0) {
        theta = theta + Math.PI;
    } else if (dx <= 0 && dy <= 0) {
        theta = theta + Math.PI;
    } else if (dx >= 0 && dy <= 0) {
        theta = theta + 2 * Math.PI;
    }

    if (theta >= 0 && theta <= Math.PI / 2) { // 1er cadran
        if (theta <= Math.PI / 4) { // 1ère moitié du 1er cadran
            v = dx * kx;
            speed1 = v * Math.sin(theta + Math.PI / 4);
            speed2 = v * Math.sin(theta * 2 - Math.PI / 4);
        } else {
            v = dy * ky;
            speed1 = v;
            speed2 = v * Math.sin(theta);
        }

    } else if (theta > Math.PI / 2 && theta <= Math.PI) { // 2ème cadran
        if (theta <= 3 * Math.PI / 4) { // 1ère moitié du 2ème cadran
            v = dy * ky;
            speed1 = v * Math.sin(theta);
            speed2 = v;
        } else {
            v = -dx * kx;
            speed1 = v * Math.sin(theta * 2 - 3 * Math.PI / 4);
            speed2 = v * Math.sin(theta - Math.PI / 4);
        }

    } else if (theta > Math.PI && theta <= 3 * Math.PI / 2) { // 3ème cadran
        if (theta <= 5 * Math.PI / 4) { // 1ère moitié du 3ème cadran
            v = dx * kx;
            speed2 = v * Math.sin(theta * 3 - 5 * Math.PI / 4);
            speed1 = v * Math.sin(Math.PI / 4);
        } else {
            v = dy * ky;
            speed1 = -v * Math.sin(theta);
            speed2 = v;
        }

    } else { // 4ème cadran
        if (theta <= 7 * Math.PI / 4) { // 1ère moitié du 4ème cadran
            v = dy * ky;
            speed1 = v;
            speed2 = -v * Math.sin(theta);
        } else {
            v = -dx * kx;
            speed1 = -v * Math.sin(theta * 3 - 7 * Math.PI / 4);
            speed2 = v * Math.sin(Math.PI / 4);
        }

    }

    if (speed1 >= robairros.speed) {
        speed1 = robairros.speed;
    }

    if (speed1 <= -robairros.speed) {
        speed1 = -robairros.speed;
    }

    if (speed2 >= robairros.speed) {
        speed2 = robairros.speed;
    }

    if (speed2 <= -robairros.speed) {
        speed2 = -robairros.speed;
    }

    return [Math.round(speed1*100), Math.round(speed2*100)];
}


Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

var headCanvas = $("#overlay");
console.log(headCanvas);
headMouseDown = false;

headCanvas.on("mouseup touchend mouseleave", function(e) {
    headMouseDown = false;
    robairros.stop();
});
headCanvas.on("mousedown touchstart", function(e) {

        headMouseDown = true;
        var posX = (e.pageX - $(this).offset().left) / headCanvas.width(),
            posY = (e.pageY - $(this).offset().top) / headCanvas.height();
            posX = posX * 2 - 1;
            posY = (posY * 2 - 1)*-1;

        var speeds = analogGamepad(posX, posY);
        robairros.sendSpeed(speeds[0], speeds[1]);
});
headCanvas.on("mousemove touchmove", function(e) {
    if (headMouseDown) {
        var posX = (e.pageX - $(this).offset().left) / headCanvas.width(),
            posY = (e.pageY - $(this).offset().top) / headCanvas.height();
            posX = posX * 2 - 1;
            posY = (posY * 2 - 1)*-1;

        var speeds = analogGamepad(posX, posY);
        robairros.sendSpeed(speeds[0], speeds[1]);
    }
    e.preventDefault();
    e.stopPropagation();
});
//////////////////////////////Bumper ///////////////////////

robairros.bumper_front_change =function (on){
  if(on)
  {
    $('#bumperFront').show();
  }
  else
  {
    $('#bumperFront').hide();
  }
  setArrowDanger('foward', on);
}
robairros.bumper_rear_change =function (on){
  if(on) $('#bumperRear').show();
  else $('#bumperRear').hide();
  setArrowDanger('backward', on);
}

$('#bumperRear').hide();
$('#bumperFront').hide();

//////////////////////////////Bumper ///////////////////////

robairros.touch_left_change =function (on){
  if(on) $('#touchLeft').addClass('touched');
  else $('#touchLeft').removeClass('touched');
}
robairros.touch_right_change =function (on){
  if(on) $('#touchRight').addClass('touched');
  else $('#touchRight').removeClass('touched');
}
