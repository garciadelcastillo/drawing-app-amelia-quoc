function newDrawing(data) {
    cRe = '#E0C84A';
    // // console.log(cRe);
    // // console.log(data);
    // index = userID.indexof(data.user);
  
    // console.log("index ");
    // console.log(index);
  
    // cRe = color(colorarr[index]); //color received
    // // console.log("color " + cRe);
  
    stroke(cRe);
    strokeWeight(strokeW);
    //parse back data into data.x, data.y
    line(data.x, data.y, data.px, data.py);
    // ellipse(data.x,data.y,30,30);
    //try rect, or ellipse or circle
  
  }