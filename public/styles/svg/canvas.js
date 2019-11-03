var img1 = document.createElement('img'),
    img2 = document.createElement('img')
    count = 2;

/// image loading is async, make sure they are loaded
img1.onload = img2.onload = function() {
    count--;
    if (count === 0) drawImages();
}
img1.src = './bQ.svg';
img2.src = './board.svg';

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

/// when loaded, draw them somewhere on the canvas
function drawImages() {
    ctx.drawImage(img2, 0, 0);
    ctx.drawImage(img1, 50, 0);
}

drawImages();
para = document.createElement('p');
para.innerText = 'Test';
document.body.append(para);
