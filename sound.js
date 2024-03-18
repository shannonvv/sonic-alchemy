let players = []
let playersOriginal = []
let timeoutID;
let volume;
let offset = 5;
let isLoopPlaying = false;
let totalDuration;
let activePlayers = [];
let currentPlayer;
let isMuted = false;
let isLoaded = false;

function loadPlayers(name, url, pan) {

    const player = new Tone.Player({
        url: url,
        loop: false,
        fadeIn: .1,
        fadeOut: 1.
    });

    volume = new Tone.Volume();
    player.connect(volume);
    player.toDestination();
    players.push(player);
    return { player };
};

function createPlaylist() {
    for (let i = 1; i < 600; i++) {
        filePath = 'https://github.com/shannonvv/sonic-alchemy/raw/main/MAT-FINAL/'
        fileName = filePath + i + ".mp3"
        loadPlayers(i, fileName, 0)
    }

    if (players.length === 599) {
    console.log("Players are loaded.")
    playersOriginal = players
    } 
};


const playerManager = {
    maxPlayers: 4,
    
    addPlayer(player) {
        if (!isMuted) {
            if (activePlayers.length === 0) {
                Tone.Master.volume.rampTo(-Infinity, .1);
                Tone.Transport.stop();
            }

            if (activePlayers.length < 1) { 
                Tone.Transport.start();
                Tone.Master.volume.rampTo(-6, .1);
            }

            if (activePlayers.length < this.maxPlayers) {
                activePlayers.push(player);
                player.start(offset);
                player.volume.rampTo(-6, .1);
            } 

            } else {
                activePlayers[0].volume.rampTo(-Infinity, .1)
                activePlayers.splice(0, 1);
                activePlayers.push(player);
                player.start(offset); 
                player.volume.rampTo(-6, .1);

            } 
        }
}

scratchPlayers = []


function playInitialLoop(playlist, startPosition) {
    currentPlayer = players[playlist]

    try {

    if (isLoaded && !isMuted && isDragging) {
        if (scratchPlayers.length === 0) {
            Tone.Master.volume.rampTo(-Infinity, .1);
            Tone.Transport.stop();
        }
        if (scratchPlayers.length < 1) { 
            Tone.Transport.start();
            Tone.Master.volume.rampTo(-6, .1);
        }

        if (scratchPlayers.length < 4) {
            scratchPlayers.push(currentPlayer);
            
            if (currentPlayer.state === 'stopped') {
                currentPlayer.volume.rampTo(-6, .1);
                currentPlayer.start(offset);
            }
        } 
        
        if (scratchPlayers.length >= 4 && isDragging === true) {
            scratchPlayers[0].volume.rampTo(-Infinity, .1)
            scratchPlayers[0].stop();
            scratchPlayers.splice(0, 1);
            scratchPlayers.push(currentPlayer);
            if (currentPlayer != null) {
                if (currentPlayer.state === 'stopped') {
                    currentPlayer.volume.rampTo(-6, .1);
                    currentPlayer.start(offset);
                }
        }
        }
        
        if (scratchPlayers.length >= 4 && isDragging === false) {
            scratchPlayers[0].volume.rampTo(-Infinity, .1)
            scratchPlayers[0].stop()
            scratchPlayers.splice(0, 1);
            scratchPlayers.push(currentPlayer);
            if (currentPlayer.state === 'stopped') {
                currentPlayer.volume.rampTo(-6, .1);
                currentPlayer.start(offset);
            }
        }
} 
} catch (error) {
    handleAudioError(error);
}

} 

function handleAudioError() {
    console.error(error);
}


currentList = []
function playNextLoop() {

    if (isLoaded && !isDragging  && trackListCopy.length > 0) {
        uniforms.sampleDuration  = 50
        totalDuration = trackListCopy.length * uniforms.sampleDuration  
        Tone.Master.volume.rampTo(-Infinity, 1.);                
        Tone.Transport.stop();    


        for (let i = 0; i < trackListCopy.length; i++) {
            setTimeout(function() {
                Tone.Master.volume.rampTo(-Infinity, .1);                
                Tone.Transport.stop();
                activePlayers = [];

                let currentPlayer = players[trackListCopy[i]]; 

                playerManager.addPlayer(currentPlayer);

                uniforms.previousMetalType.value = uniforms.metalType
                uniforms.previousPointCount.value = uniforms.pointCount
                uniforms.metalType.value = materials.indexOf(grid[trackListCopy[i]].material)
                uniforms.pointCount.value = grid[trackListCopy[i]].points

            }, (uniforms.sampleDuration * i));
        }
        timeoutID = setTimeout(playNextLoop, totalDuration * 10);        
    } 
}

function stopNextLoop() {
    clearTimeout(timeoutID);
}


function resetPlayer() {
    colorsList = colorsListOriginal
    materialsList = materialsListOriginal
    players = playersOriginal

    Tone.Transport.stop;
    isLoopPlaying = false;

    trackList = [];
    trackListCopy = [];
    initializeGrid()

}

function toggleLoop() {
    const toggleButton = document.getElementById('mute_button');
    if (isMuted === false && players.length === 0) {
        toggleButton.classList.add('selected_button')
        createPlaylist();

        // wait for the buffers to load
        setTimeout(() => {
        Tone.Master.volume.value = -6;
        isLoaded = true;
        isMuted = false;
        }, 500);

   } else if (isMuted === false) {
        toggleButton.classList.add('selected_button')
        Tone.Master.volume.value = -Infinity;
        isMuted = true;
   } else if (isMuted === true) {
        toggleButton.classList.remove('selected_button')
       isMuted = false;
       isLoopPlaying = true;
       Tone.Master.volume.value = -6;
    }
}

function toggleSelect(buttonType) {
    let randomButton = document.getElementById('random_button');
    let shuffleButton = document.getElementById('shuffle_button');

    if (buttonType === 'random_button') {
        randomButton.classList.add('selected_button');
        shuffleButton.classList.remove('selected_button');
        shuffleButton.classList.add('unselected_button'); 
    } else {
        randomButton.classList.remove('selected_button');
        shuffleButton.classList.add('selected_button'); 
    }    
}

document.getElementById("mute_button").addEventListener("click", () => toggleLoop());
document.getElementById("shuffle_button").addEventListener("click", () => shuffleMaterials());
document.getElementById("random_button").addEventListener("click", () => randomizeMaterials());




