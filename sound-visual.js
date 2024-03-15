let canvas;
let form;
let gradientBox;
let square; 
let indexSequence = [];
let indexSequenceList = [];
let materials = [];
let materialsList = [];
let colors = [];
let pointsList = [];
let colorsList = [];
let colorCount;
let indexList = [];
let removedTrack;
let indexListOriginal = []
let colorsListOriginal = []
let materialsListOriginal = []
let trackList = []
let trackListCopy = []
let grid = [];
let isDragging = false
let isMinimized = false


function setup() {
    form = document.getElementById('form');
    
    gradientBox = document.getElementById('graph');
    gradientBox.style.height = (window.innerWidth * .4 * .164) + "px";

    canvas = createCanvas(gradientBox.offsetWidth, gradientBox.offsetHeight);
    canvas.parent('gradientBox');

    // set color for each represented material
    materials = ['copper', 'bronze', 'brass', 'steel', 'silver', 'aluminum'];
    colors = [
        [245, 135, 2], // copper
        [205, 127, 50],   // bronze
        [181, 166, 66],   // brass
        [150, 150, 150],  // steel
        [202, 204, 206],  // silver
        [169, 169, 169]   // aluminum
    ];
    
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 100; j++) {
            pointsList.push(j);
        }
    }

    // initialize index and color lists
    for (let i = 0; i < 6; i++) {
        const startRange = i * 100;
        const endRange = (i + 1) * 100;
        for (let j = startRange; j < endRange; j++) {
            indexList.push(j);
            colorsList.push(colors[i]);
            materialsList.push(materials[i]);
        }
    }
    
    indexListOriginal = indexList 
    colorsListOriginal = colorsList
    materialsListOriginal = materialsList

    // duplicate index list for sequence
    indexSequenceList = Array.from({ length: 600 }, (_, i) => indexList[i]);

    initializeGrid();
}


function draw() {
    background(255,255,0); 
    let colorValues = [100, 80, 60, 0]
    let colorVal = 0
    for (let i = 0; i < grid.length; i++) {
        let square = grid[i];
        strokeWeight(2)
            
        if (trackListCopy.includes((square.index))) {
            let indexInTrackList = trackListCopy.indexOf((square.index));
            let colorValue = colorValues[indexInTrackList % colorValues.length];
            strokeWeight(0)
            fill(255, colorValue, colorValue);

        } else {
            strokeWeight(.7)
            //fill(square.color[0]+colorVal, square.color[1]+colorVal, square.color[2]-colorVal);
            fill(square.color[0], square.color[1], square.color[2]);
        }
        colorVal += 1
        if (colorVal === 100) {
            colorVal = 0
            stroke(128, 128, 128)
        }
        rect(square.x, square.y, square.width, square.height);
    }
}

function randomizeMaterials() {
    const randomIndices = Array.from({ length: 600 }, (_, i) => i);
    shuffleArray(randomIndices);

    materialsList = shuffleArrayWithIndices(materialsList, randomIndices);
    colorsList = shuffleArrayWithIndices(colorsList, randomIndices);
    players = shuffleArrayWithIndices(players, randomIndices);
    pointsList = shuffleArrayWithIndices(pointsList, randomIndices);

    trackList = [];
    trackListCopy = [];
    initializeGrid();
}

function shuffleMaterials() {
    const segmentOrder = Array.from({ length: Math.ceil(colorsList.length / 100) }, (_, index) => index);
    shuffleArray(segmentOrder);

    colorsList = colorsListOriginal
    materialsList = materialsListOriginal
    players = playersOriginal

    colorsList = shuffleSegments(colorsList, 100, segmentOrder);
    players = shuffleSegments(players, 100, segmentOrder);
    materialsList = shuffleSegments(materialsList, 100, segmentOrder);
    pointsList = shuffleSegments(pointsList, 100, segmentOrder);

    trackList = [];
    trackListCopy = [];
    initializeGrid();
}

function shuffleSegments(list, segmentSize, segmentOrder) {
    const segments = [];
    for (let i = 0; i < list.length; i += segmentSize) {
        segments.push(list.slice(i, i + segmentSize));
    }
    const shuffledSegments = segmentOrder.map(index => segments[index]);
    return [].concat(...shuffledSegments);
}

function shuffleArrayWithIndices(array, indices) {
    return indices.map(i => array[i]);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeGrid() {
    background(255);
    let squareWidth = canvas.width/60
    let squareHeight = squareWidth

    let gridWidth =  60 
    let gridHeight = 10 

    colorIndex = 0
    pointIndex = 0

    grid = []

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          let xPos = x * squareWidth;
          let yPos = y * squareHeight;

        square = {
            x: xPos,
            y: yPos,
            width: squareWidth,
            height: squareHeight,
            color: colorsList[colorIndex],
            material: materialsList[colorIndex],
            points: pointsList[colorIndex],
            selected: false,
            index: indexList.indexOf(colorIndex),
        };
        
        grid.push(square);
        
        let rValue, gValue, bValue;
        if (typeof square.color !== 'undefined') {
            rValue = square.color[0];
            gValue = square.color[1];
            bValue = square.color[2];
        } 

        fill(rValue, gValue, bValue);
        stroke(128, 128, 128);
        strokeWeight(0);
        rect(xPos, yPos, squareWidth, squareHeight);
        colorIndex += 1;
        pointIndex += 1;

        if (colorIndex >= 600) {
             return
        }
        if (pointIndex >= 100) {
            pointIndex = 0
        }
      }
    }
}




function mouseDragged() {
    isDragging = true
    stopNextLoop()

    for (let i = 0; i < grid.length; i++) {
      let square = grid[i];
      if (square.index === removedTrack) {
        square.selected = false; 
        }

      if (mouseX >= square.x && mouseX <= square.x + square.width &&
        mouseY >= square.y && mouseY <= square.y + square.height) {
            

            //uniforms.previousMetalType = uniforms.metalType
            //uniforms.previousPointCount = uniforms.pointCount
            uniforms.pointCount.value = square.points
            uniforms.metalType.value = materials.indexOf(square.material)

            
            // maintain a maximum of four players 
            if (!trackList.includes(square.index)) {
                trackList.push(square.index)

                if (trackList.length > 4){
                    removedTrack = trackList[0]
                    trackList.splice(0,1);
                } 

                trackListCopy = trackList;
                playInitialLoop(square.index);
                square.selected = true; 
            }  
    }    
}
}

function quitPlayer() {
    players.forEach(player => player.stop());
    players.forEach(player => player.pause = true);
    Tone.Transport.stop;
    isLoopPlaying = false;
    isMuted = true;
    Tone.Master.volume.value = -Infinity;
}

function mousePressed() {
     if (isMinimized === false) {

         // confirm if action occured in the canvas
         for (let i = 0; i < grid.length; i++) {
             let square = grid[i];
             if (mouseX >= square.x && mouseX <= square.x + square.width &&
             mouseY >= square.y && mouseY <= square.y + square.height) {

                trackList = [];
                activePlayers = [];

                // Resetting grid selection
                for (let i = 0; i < grid.length; i++) {
                    let square = grid[i];
                    square.selected = false; 
                }
                //isMuted = false;
                isLoopPlaying = false;

     } 
 }
 }
 }


function mouseReleased(event) {
    if (isMinimized === false) { 

        // confirm if action occured in the canvas
        for (let i = 0; i < grid.length; i++) {
            let square = grid[i];
            if (mouseX >= square.x && mouseX <= square.x + square.width &&
                mouseY >= square.y && mouseY <= square.y + square.height) {
        
                    isDragging = false
                    playNextLoop(trackList)
            }
        }
    }
}

let resizeTimeout;

function windowResized() {
    
    const form = document.getElementById('form');
    const newWidth = (window.innerWidth * .4) + "px";
    form.style.width = newWidth;
    
    resizeCanvas(form.offsetWidth, form.offsetWidth * .168);

    section.clientWidth = window.innerWidth
    section.clientHeight = window.innerHeight

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)

    initializeGrid()
}



const minimizeButton = document.getElementById('minimize_button');

minimizeButton.addEventListener('click', function() {
    
     gradientBox.classList.toggle('minimized');
     if (gradientBox.classList.contains('minimized')) {  
        minimizeButton.classList.add('unselected_button');
        minimizeButton.classList.remove('selected_button');
        isMinimized = true
     } else {
        minimizeButton.classList.add('selected_button');
        minimizeButton.classList.remove('unselected_button');

        isMinimized = false
     }
 });




