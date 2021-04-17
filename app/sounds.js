import Soundbox from "../node_modules/sound-box/soundbox.mjs"


window.addEventListener("load", function(event){

    //using an external JS library (see link below) loads in our sound files
    window.soundbox = new Soundbox()
    soundbox.load("deal1","sounds/card_deal.mp3")
    soundbox.load("shuffle1","sounds/card_shuffle.mp3")

    //plays a drawing sound whenever the user clicks draw
    document.getElementById("btnDrawCard")
    .addEventListener("click",function() {
        soundbox.play("deal1",null,0.15)
    })

    //plays a shuffling sound when the user clicks play again
    document.getElementById("btnPlayAgain")
    .addEventListener("click",function() {
        soundbox.play("shuffle1",null,0.15)
    })
} )

//Soundbox taken from https://github.com/sbrl/soundbox
