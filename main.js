let img;
let imgSize = {x: 400 , y: 250};
let imgPosition;
let frequency = 8;
let t = 0, td = 0;
let dt;
let amplitude;
let cc;
let c;
let pointSources = [];
let animateButton, jitterButton;
let animateFlag = false, jitterFlag = false;
let frequencySlider, phaseSlider, orientationSlider, amplitudeSlider, selectSourceType, GUIOptionSlider;
let clearButton, clearAllButton;
let selectedIndex;
let flagChangeAll, flagDisplaySelectedBox, flagDisplaySourceCenter = true;
let displayTime = 0.5;
let mainFont = 'Consolas';
let tempColor, selectColor;
let scaleWeight = {
    red: [0,1],
    green: [1,-1],
    blue: [0,0],
    alpha: [0,0]
};
let colorSliders = {
    red: {
        a: [],
        b: []
    },
    green: {
        a: [],
        b: []
    }
};
let animationSpeed = 16;
let mouseGUIOption = 0;
let propButtonColor = 0;
let jitterButtonColor = 0;

function setup(){
    createCanvas(windowWidth,windowHeight);
    img = createImage(imgSize.x,imgSize.y);
    imgPosition = {x: (windowWidth - imgSize.x)/2  , y: windowHeight*0.035};
    textFont(mainFont);
    dt = 1/(animationSpeed*frequency);
    amplitude = imgSize.x;
    selectedIndex = 0;
    tempColor = color(135,185,155,200);
    createGUIElements();
    flagChangeAll = false;    
}

function draw(){
    tempColor = selectColor.color();
    background(255);
    noStroke();
    fill(240);
    rect(imgPosition.x,0,imgSize.x,windowHeight);
    
    scaleWeight.red = [colorSliders.red.a.value(), colorSliders.red.b.value()];
    scaleWeight.green = [colorSliders.green.a.value(), colorSliders.green.b.value()];

    setParameters();
    img.loadPixels();
    for(let y = 0; y < imgSize.y; y++){
        for(let x = 0; x < imgSize.x ; x++){
            let index = (x + y*imgSize.x)*4;
            let sum = 0;
            if(pointSources.length){
                    pointSources.forEach(source => {
                    sum += source.value(x+imgPosition.x,y+imgPosition.y,t);
                });
            };
            cc = map(sum,-pointSources.length,pointSources.length,0,1);
            img.pixels[index] = tempColor.levels[0]*(scaleWeight.red[0] + scaleWeight.red[1]*cc);
            img.pixels[index+1] = tempColor.levels[1]*(scaleWeight.green[0] + scaleWeight.green[1]*cc);

            img.pixels[index+2] = tempColor.levels[2];
            img.pixels[index+3] = tempColor.levels[3];
        }
    }
    img.updatePixels();
    image(img,imgPosition.x,imgPosition.y);

    if(!pointSources.length){
        fill(255);
        noStroke();
        textAlign(CENTER);
        text('CLICK ON THIS AREA TO CREATE SOURCES:',
                imgPosition.x + imgSize.x*0.125,
                imgPosition.y + imgSize.y*0.5,
                imgSize.x*0.75
            );
    } 
    
    if(animateFlag){
        if (t < 100000){
            t += dt;
        } else {
            t = 0;
        }
    } 

    if(jitterFlag){
        addPhaseJitter();
    }

    if(flagDisplaySourceCenter){
        drawPointSources();
    }

    dt = 1/(animationSpeed*frequency);

    if(flagDisplaySelectedBox && (td < displayTime) && pointSources.length ){
        let displaySize = 40;
        fill(255,255,255,80);
        stroke(0,0,0,120);
        strokeWeight(2);
        rect(pointSources[selectedIndex-1].position.x - displaySize/2,
                pointSources[selectedIndex-1].position.y - displaySize/2,
                displaySize,displaySize);
        fill(0);
        noStroke();
        textSize(12);
        text(selectedIndex.toString(),
            pointSources[selectedIndex-1].position.x,
            pointSources[selectedIndex-1].position.y)
        td += dt*getFrameRate();
    }  else {
        flagDisplaySelectedBox = false;
    }

    drawGUILabels();

    mouseGUIOption = GUIOptionSlider.value();
    
    fill(255);
    rect(0,0,imgPosition.x,windowHeight);
    rect((imgPosition.x + imgSize.x),0,windowWidth - (imgPosition.x + imgSize.x),windowHeight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    imgPosition = {x: (windowWidth - imgSize.x)/2  , y: windowHeight*0.035};
    updateGUIElementsPosition();
  }

  function updateGUIElementsPosition(){
    let yInit = 1.05;
    let dy = 0.125;
    GUIOptionSlider.position(imgPosition.x + imgSize.x*0.235,imgPosition.y + imgSize.y*yInit);
    clearButton.position(imgPosition.x + imgSize.x*0.6125,imgPosition.y + imgSize.y*yInit + 3);
    clearAllButton.position(imgPosition.x + imgSize.x*0.78,imgPosition.y + imgSize.y*yInit + 3);
    yInit += dy + 0.01;
    selectSourceID.position(imgPosition.x + imgSize.x*0.235,imgPosition.y + imgSize.y*yInit);
    selectSourceType.position(imgPosition.x + imgSize.x*0.6125,imgPosition.y + imgSize.y*yInit);
    yInit += dy + 0.025;
    frequencySlider.position(imgPosition.x + imgSize.x*0.25,imgPosition.y + imgSize.y*yInit);
    amplitudeSlider.position(imgPosition.x + imgSize.x*0.75,imgPosition.y + imgSize.y*yInit);
    yInit += dy;
    phaseSlider.position(imgPosition.x + imgSize.x*0.2,imgPosition.y + imgSize.y*yInit);
    orientationSlider.position(imgPosition.x + imgSize.x*0.75,imgPosition.y + imgSize.y*yInit);
    yInit += dy - 0.03;
    changeAllcheckbox.position(imgPosition.x + imgSize.x*0.035,imgPosition.y + imgSize.y*yInit);
    displaySourceCenterCheckbox.position(imgPosition.x + imgSize.x*0.525,imgPosition.y + imgSize.y*yInit);
    yInit += dy;
    let dx = 0.075;
    animateButton.position(imgPosition.x + imgSize.x*(0.25 + dx),imgPosition.y + imgSize.y*yInit);
    jitterButton.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    yInit += 1*dy + 0.025;
    selectColor.position(imgPosition.x + imgSize.x*0.5,imgPosition.y + imgSize.y*yInit);
    yInit += dy;// - 0.025;
    dx = -0.1;
    colorSliders.red.a.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.red.b.position(imgPosition.x + imgSize.x*(0.75 + dx),imgPosition.y + imgSize.y*yInit);
    yInit += dy;
    colorSliders.green.a.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.green.b.position(imgPosition.x + imgSize.x*(0.75 + dx),imgPosition.y + imgSize.y*yInit);
  }

function createGUIElements(){
    let sliderWidth = 0.25*imgSize.x;
    let yInit = 1.05;
    let dy = 0.125;
    
    GUIOptionSlider = createSlider(0,1,0,1);
    GUIOptionSlider.style('width',(sliderWidth*0.4).toString()+'px');
    GUIOptionSlider.position(imgPosition.x + imgSize.x*0.235,imgPosition.y + imgSize.y*yInit);
    GUIOptionSlider.class("switch");

    clearButton = createButton("CLEAR");
    clearButton.position(imgPosition.x + imgSize.x*0.6125,imgPosition.y + imgSize.y*yInit + 3);
    clearButton.style('background-color',color(20,240));
    clearButton.elt.style.color = color(255,255);
    clearButton.style('font-family', mainFont);
    clearButton.mousePressed(clearSelectedSource);

    clearAllButton = createButton("CLEAR ALL");
    clearAllButton.position(imgPosition.x + imgSize.x*0.78,imgPosition.y + imgSize.y*yInit + 3);
    clearAllButton.style('background-color',color(20,240));
    clearAllButton.elt.style.color = color(255,255);
    clearAllButton.style('font-family', mainFont);
    clearAllButton.mousePressed(clearAllSources);

    yInit += dy + 0.01;

    selectSourceID = createSelect();
    selectSourceID.position(imgPosition.x + imgSize.x*0.235,imgPosition.y + imgSize.y*yInit);
    selectSourceID.mousePressed(selectSource);
    selectSourceID.style('font-family', mainFont);

    // yInit += dy ;
    
    selectSourceType = createSelect();
    selectSourceType.position(imgPosition.x + imgSize.x*0.6125,imgPosition.y + imgSize.y*yInit);
    selectSourceType.option("monopole");
    selectSourceType.option("dipole");
    selectSourceType.option("quadrupole");
    selectSourceType.option("octopole");
    selectSourceType.style('font-family', mainFont);

    yInit += dy + 0.025;

    frequencySlider = createSlider(1,24,16,1);
    frequencySlider.position(imgPosition.x + imgSize.x*0.25,imgPosition.y + imgSize.y*yInit);
    frequencySlider.style('width',sliderWidth.toString()+'px');
    frequencySlider.style('border-radius','5px');
    frequencySlider.class("slider");

    // yInit += dy;

    amplitudeSlider = createSlider(0,4*imgSize.x,imgSize.x,imgSize.x/50);
    amplitudeSlider.position(imgPosition.x + imgSize.x*0.75,imgPosition.y + imgSize.y*yInit);
    amplitudeSlider.style('width',sliderWidth.toString()+'px');
    amplitudeSlider.class("slider");

    yInit += dy;

    phaseSlider = createSlider(0,3.14,0,0.0314);
    phaseSlider.position(imgPosition.x + imgSize.x*0.2,imgPosition.y + imgSize.y*yInit);
    phaseSlider.style('width',sliderWidth.toString()+'px');
    phaseSlider.class("slider");

    // yInit += dy;

    orientationSlider = createSlider(0,6.28,0,0.0314);
    orientationSlider.position(imgPosition.x + imgSize.x*0.75,imgPosition.y + imgSize.y*yInit);
    orientationSlider.style('width',sliderWidth.toString()+'px');
    orientationSlider.class("slider");

    yInit += dy - 0.03;

    changeAllcheckbox = createCheckbox(" ", false);
    changeAllcheckbox.position(imgPosition.x + imgSize.x*0.035,imgPosition.y + imgSize.y*yInit);
    changeAllcheckbox.changed(changeAll);

    // yInit += dy;

    displaySourceCenterCheckbox = createCheckbox(" ", true);
    displaySourceCenterCheckbox.position(imgPosition.x + imgSize.x*0.525,imgPosition.y + imgSize.y*yInit);
    displaySourceCenterCheckbox.changed(displaySourceCenter);

    yInit += dy;
    let dx = 0.075;

    animateButton = createButton("PROPAGATE");
    animateButton.position(imgPosition.x + imgSize.x*(0.25 + dx),imgPosition.y + imgSize.y*yInit);
    animateButton.style('background-color',color(20,240));
    animateButton.elt.style.color = color(255,255);
    animateButton.style('font-family', mainFont);
    animateButton.mousePressed(animateMap);

    jitterButton = createButton("PHASE JITTER");
    jitterButton.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    jitterButton.style('background-color',color(20,240));
    jitterButton.elt.style.color = color(255,255);
    jitterButton.style('font-family', mainFont);
    jitterButton.mousePressed(activateJitter);

    yInit += 1*dy + 0.025;

    selectColor = createColorPicker(tempColor);
    selectColor.position(imgPosition.x + imgSize.x*0.5,imgPosition.y + imgSize.y*yInit);
    selectColor.style('width',(sliderWidth).toString()+'px');
    selectColor.style('height','10px');

    yInit += dy;// - 0.025;

    // colorSliders.red = createSlider(0,1,1,0.025);
    // colorSliders.red.style('width',(sliderWidth*0.75).toString()+'px');
    // colorSliders.red.position(imgPosition.x + imgSize.x*0.5,imgPosition.y + imgSize.y*yInit);
    dx = -0.1;

    colorSliders.red.a = createSlider(-0.5,0.5,0,0.025);
    colorSliders.red.a.style('width',(sliderWidth*0.8).toString()+'px');
    colorSliders.red.a.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.red.a.class("slider");

    colorSliders.red.b = createSlider(-0.5,0.5,0.5,0.025);
    colorSliders.red.b.style('width',(sliderWidth*0.8).toString()+'px');
    colorSliders.red.b.position(imgPosition.x + imgSize.x*(0.75 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.red.b.class("slider");

    yInit += dy;

    // colorSliders.green = createSlider(0,1,1,0.025);
    // colorSliders.green.style('width',(sliderWidth*0.75).toString()+'px');
    // colorSliders.green.position(imgPosition.x + imgSize.x*0.5,imgPosition.y + imgSize.y*yInit);

    colorSliders.green.a = createSlider(-0.5,0.5,0.5,0.025);
    colorSliders.green.a.style('width',(sliderWidth*0.8).toString()+'px');
    colorSliders.green.a.position(imgPosition.x + imgSize.x*(0.5 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.green.a.class("slider");

    colorSliders.green.b = createSlider(-0.5,0.5,-0.5,0.025);
    colorSliders.green.b.style('width',(sliderWidth*0.8).toString()+'px');
    colorSliders.green.b.position(imgPosition.x + imgSize.x*(0.75 + dx),imgPosition.y + imgSize.y*yInit);
    colorSliders.green.b.class("slider");

}

function drawGUILabels(){
    textAlign(LEFT);
    let yInit = 1.075;
    let dy = 0.125;
    strokeWeight(0.5);
    fill(0,0,50);
    textSize(16)
    text('waves on canvas',imgPosition.x + imgSize.x*0.025,windowHeight*0.01,imgSize.x*0.75);
    
    fill(220);
    rect(imgPosition.x,imgPosition.y + imgSize.y,0.55*imgSize.x,imgSize.y*dy);
    textSize(12);
    highlightGUIOption(mouseGUIOption);
    text('ADD SOURCE',imgPosition.x + imgSize.x*0.025,imgPosition.y + imgSize.y*yInit);
    highlightGUIOption(!mouseGUIOption);
    text('MOVE SOURCE',imgPosition.x + imgSize.x*0.335,imgPosition.y + imgSize.y*yInit);
    fill(190);
    rect(imgPosition.x + imgSize.x*0.55,imgPosition.y + imgSize.y,0.45*imgSize.x,imgSize.y*dy);

    
    yInit += dy;
    fill(180);
    rect(imgPosition.x,imgPosition.y + imgSize.y*(1 + dy),0.315*imgSize.x,imgSize.y*dy);
    fill(150);
    rect(imgPosition.x + 0.315*imgSize.x,imgPosition.y + imgSize.y*(1 + dy),0.685*imgSize.x,imgSize.y*dy);
    fill(0,0,50);
    text('SOURCE ID:',imgPosition.x + imgSize.x*0.025,imgPosition.y + imgSize.y*yInit);
    text('SOURCE TYPE:',imgPosition.x + imgSize.x*0.335,imgPosition.y + imgSize.y*yInit);
    
    yInit += dy + 0.01;
    fill(220);
    rect(imgPosition.x,imgPosition.y + imgSize.y*(1 + 2*dy),0.5*imgSize.x,imgSize.y*dy);
    fill(0,0,50);
    text('FREQUENCY:',imgPosition.x + imgSize.x*0.025,imgPosition.y + imgSize.y*yInit);
    text('AMPLITUDE:',imgPosition.x + imgSize.x*0.525,imgPosition.y + imgSize.y*yInit);
    
    yInit += dy;
    fill(220);
    rect(imgPosition.x + imgSize.x*0.475,imgPosition.y + imgSize.y*(1 + 3*dy),0.525*imgSize.x,imgSize.y*dy);
    fill(0,0,50);
    text('PHASE:',imgPosition.x + imgSize.x*0.025,imgPosition.y +imgSize.y*yInit);
    text('ORIENTATION:',imgPosition.x + imgSize.x*0.5,imgPosition.y + imgSize.y*yInit);
    
    yInit += dy - 0.005;
    fill(200);
    rect(imgPosition.x,imgPosition.y + imgSize.y*(1 + 4*dy),imgSize.x*0.5,imgSize.y*dy);
    fill(0,0,50);
    text('CHANGE ALL SOURCES',imgPosition.x + imgSize.x*0.075,imgPosition.y + imgSize.y*yInit);
    fill(240);
    rect(imgPosition.x + imgSize.x*0.475,imgPosition.y + imgSize.y*(1 + 4*dy),imgSize.x*0.525,imgSize.y*dy);
    fill(0,0,50);
    text('DISPLAY SOURCE CENTER',imgPosition.x + imgSize.x*0.575,imgPosition.y + imgSize.y*yInit);

    yInit += dy;
    fill(150);
    rect(imgPosition.x,imgPosition.y + imgSize.y*(1 + 5*dy),imgSize.x,imgSize.y*dy);
    fill(0,0,50);
    text('ANIMATION:',imgPosition.x + imgSize.x*0.1,imgPosition.y + imgSize.y*yInit);
    
    let dx = -0.1;
    yInit += 1*dy;
    fill(220);
    rect(imgPosition.x,imgPosition.y + imgSize.y*(1 + 6*dy),imgSize.x,imgSize.y*3*dy);
    fill(0,0,50);
    text('COLOR SCALE:',imgPosition.x + imgSize.x*0.025,imgPosition.y + imgSize.y*yInit);
    text('BASE',imgPosition.x + imgSize.x*0.35,imgPosition.y + imgSize.y*yInit);
    yInit += 1*dy;
    fill(255,0,0);
    text('RED',imgPosition.x + imgSize.x*(0.35 + dx),imgPosition.y + imgSize.y*yInit);
    yInit += 0.5*dy;
    fill(0,0,50);
    text('A + BX',imgPosition.x + imgSize.x*(0.2 + dx),imgPosition.y + imgSize.y*yInit);
    // textAlign(CENTER);
    text('- A +',imgPosition.x + imgSize.x*(0.535 + dx),imgPosition.y + imgSize.y*yInit);
    text('- B +',imgPosition.x + imgSize.x*(0.785 + dx),imgPosition.y + imgSize.y*yInit);
    // yInit += dy;
    
    
    yInit += 0.5*dy;
    fill(0,155,0);
    text('GREEN',imgPosition.x + imgSize.x*(0.35 + dx),imgPosition.y + imgSize.y*yInit);
    
}

function highlightGUIOption(option){
    if(option){
        fill(150);
    }
    else {
        fill(0,0,50);
    }
}

function mousePressed(){
    if(mouseX < (imgPosition.x + imgSize.x) && 
        mouseX > (imgPosition.x) && 
        mouseY < (imgPosition.y + imgSize.y) && 
        mouseY > (imgPosition.y) ){
        if(!mouseGUIOption){
            let position = {x: mouseX, y: mouseY};
            pointSources.push(new PointSource(amplitude,0,frequency,position,selectSourceType.value(),0));
            selectedIndex = pointSources.length;
            selectSourceID.option(selectedIndex);
            selectSourceID.elt.value = selectedIndex;
            td = 0;
            flagDisplaySelectedBox = true;
        } else {
            moveSource(mouseX,mouseY)
        }
            
    }
}

function moveSource(x,y){
    if(pointSources.length){
        pointSources[selectedIndex-1].position.x = x;
        pointSources[selectedIndex-1].position.y = y;
        td = 0;
        flagDisplaySelectedBox = true;
    }
    
    
}

function drawPointSources(){
    noStroke();
    fill(255);
    if(pointSources.length){
        pointSources.forEach(source => {
        ellipse(source.position.x,source.position.y,10,10);
        });
    };
}

function displaySourceCenter(){
    if(this.checked()){
        flagDisplaySourceCenter = true;
    } else {
        flagDisplaySourceCenter = false;
    }
}

function animateMap(){
    if(animateFlag){
        animateFlag = false;
        animateButton.style('background-color',color(20,240));
    } else {
        animateFlag = true;
        animateButton.style('background-color',color(0,180,0,200));
    }
}

function activateJitter(){
    if(jitterFlag){
        jitterFlag = false;
        jitterButton.style('background-color',color(20,240));
    } else {
        jitterFlag = true;
        jitterButton.style('background-color',color(0,180,0,200));
    }
}

function addPhaseJitter(){
    if(pointSources.length){
        // for(let idx = 0; idx < pointSources.length; idx++){
        //     pointSources[idx].phase = random(0.25*PI);
        // }
        pointSources.forEach(source => {
            source.phase = random(0.1*PI);
        });
    }
}

function clearSelectedSource(){
    if(pointSources.length > 1){
        if(selectedIndex == pointSources.length){
            selectedIndex -= 1;
        }
        pointSources.pop();
        selectSourceID.elt.remove(pointSources.length);
    } else {
        clearAllSources();
    }
}

function clearAllSources() {
    pointSources = [];
    selectedIndex = 0;
    removeOptions(selectSourceID.elt);
    GUIOptionSlider.elt.value = 0;
    animateFlag = false;
    jitterFlag = false;
}

function changeAll(){
    if (this.checked()){
        flagChangeAll = true;
    } else {
        flagChangeAll = false;
    }
}

function removeOptions(selectElement) {
    for(let idx = selectElement.options.length - 1; idx >= 0; idx--) {
       selectElement.remove(idx);
    }
 }

function setParameters(){
    if(pointSources.length){
        if(flagChangeAll){
            pointSources.forEach(source => {
                source.frequency = frequencySlider.value();
                if(!jitterFlag){
                    source.phase = phaseSlider.value();
                }
                source.orientation = orientationSlider.value();
                source.amplitude = amplitudeSlider.value();
                source.type = selectSourceType.value();
            });
        } else {
            pointSources[selectedIndex-1].frequency = frequencySlider.value();
            if(!jitterFlag){
                pointSources[selectedIndex-1].phase = phaseSlider.value();
            }
            pointSources[selectedIndex-1].orientation = orientationSlider.value();
            pointSources[selectedIndex-1].amplitude = amplitudeSlider.value();
            pointSources[selectedIndex-1].type = selectSourceType.value();
        }
        
    };
}

function selectSource(){
    selectedIndex = parseInt(selectSourceID.value());
    if(pointSources.length){
        frequencySlider.elt.value = pointSources[selectedIndex-1].frequency;
        if(!jitterFlag){
            phaseSlider.elt.value = pointSources[selectedIndex-1].phase;
        }
        orientationSlider.elt.value = pointSources[selectedIndex-1].orientation;
        amplitudeSlider.elt.value = pointSources[selectedIndex-1].amplitude;
        selectSourceType.elt.value = pointSources[selectedIndex-1].type;
    }
    td = 0;
    flagDisplaySelectedBox = true;
}


