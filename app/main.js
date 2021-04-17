let DECK = {}
let DECK_ID = ""


let DEALERS_CARDS = []
let PLAYERS_CARDS = []

let PLAYER_SCORE = 0
let DEALER_SCORE = 0

const PLAYER_SCORE_HEADER = document.getElementById("h2PlayerScore")
const DEALER_SCORE_HEADER = document.getElementById("h2DealerScore")
const RESULTS_HEADER = document.getElementById("h2Results")
const DRAW_BUTTON = document.getElementById("btnDrawCard")
const PLAY_AGAIN_BUTTON = document.getElementById("btnPlayAgain")
const STAY_BUTTON = document.getElementById("btnStay")
const PLAYER_CARDS_DIV = document.getElementById("divPlayerCards")
const DEALER_CARDS_DIV = document.getElementById("divDealerCards")

const GET_INITIAL_DECK_ENDPOINT = "https:deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6"
let DRAW_DEALER_CARDS = "https://deckofcardsapi.com/api/deck/temp/draw/?count=5"
let DRAW_INITIAL_CARDS = "https://deckofcardsapi.com/api/deck/temp/draw/?count=3"
let DRAW_ONE_CARD = "https://deckofcardsapi.com/api/deck/temp/draw/?count=1"

//Explicitly call the function to run the first time the page loads
GetDeck()


//Function to get a new deck, and update the URLS with the new deckid
function GetDeck() 
{   
    try
    {
        //gets a deck from the api
        fetch("https:deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
        .then(response => response.json() )
        .then(deck => {

            //extracts the deck id from the retrieved deck
            DECK = deck
            DECK_ID = DECK.deck_id

            //updates the urls to have the new deck id
            DRAW_ONE_CARD = DRAW_ONE_CARD.replace("temp",DECK_ID)
            DRAW_INITIAL_CARDS = DRAW_INITIAL_CARDS.replace("temp",DECK_ID)
            DRAW_DEALER_CARDS = DRAW_DEALER_CARDS.replace("temp",DECK_ID)
    
            //calls a function to draw 2 initial player cards and 1 dealer card
            DrawInitialCards()
        })
    }
    catch(error)
    {
        RESULTS_HEADER.textContent = "We had some trouble retrieving your cards, please try again"
        EndOfHandUpdateButtons()
    }
}

//Function to draw the initial 2 player cards and 1 dealer card
function DrawInitialCards()
{
    try
    {
        //uses the URL to draw 3 cards - 2 player and 1 dealer
        fetch(DRAW_INITIAL_CARDS)
        .then(response => response.json() )
        .then(json =>{
            let cards = json
            
            //pushes the first 2 cards retrieved from the JSON to the array of player cards
            PLAYERS_CARDS.push(cards.cards[0] )
            PLAYERS_CARDS.push(cards.cards[1] )

            //calls function to update the players hand score, passing in a card object
            UpdatePlayerHandScore(cards.cards[0] )
            UpdatePlayerHandScore(cards.cards[1] )
            
            //pushes the last card from the JSON to the dealer hand
            DEALERS_CARDS.push(cards.cards[2] )
            
            //calls function to update the dealers hand value, passing in a card object
            UpdateDealerHandScore(cards.cards[2] )

            //calls a function to create and show the card images in the DOM
            ShowInitialCards()
            
            //checks to see if the player hit blackjack
            if(PLAYER_SCORE == 21)
            {
                //calls a function to show the results of the passed in string
                ShowResult("playerBlackjack")
            }
    
        } )
    }
    catch(error)
    {
        RESULTS_HEADER.textContent = "We had some trouble retrieving your cards, please try again"
        EndOfHandUpdateButtons()
    }
    
}

//Function to update the DOM by adding card images to the screen
function ShowInitialCards()
{
    //creates new DOM image elements
    let playercard1 = document.createElement("img")
    let playercard2 = document.createElement("img")
    let dealercard1 = document.createElement("img")
    let faceDownCard = document.createElement("img")
    let dealercard2 = document.createElement("img")

    //since this function only gets called at the start of the hand,
    //hard code the first cards images from the dealer and player arrays 
    playercard1.src = PLAYERS_CARDS[0].image
    playercard2.src = PLAYERS_CARDS[1].image
    dealercard1.src = DEALERS_CARDS[0].image

    //use a custom card for the dealers face down card
    //Note: the face down card currently has no actual value tied to it, and is purely visual
    faceDownCard.src = "images/face_down_card_resized.jpg"
    faceDownCard.id = "faceDownDealerCard"

    //appends all the created images to their respective DIV elements
    PLAYER_CARDS_DIV.appendChild(playercard1)
    PLAYER_CARDS_DIV.appendChild(playercard2)
    DEALER_CARDS_DIV.appendChild(dealercard1)
    DEALER_CARDS_DIV.appendChild(faceDownCard)
}

//Function to update the value of the dealers hand. Takes a card object as a parameter
function UpdateDealerHandScore(card)
{
    //If the value of the card is not a number (i.e KING,QUEEN,JACK,ACE)
    if(isNaN(card.value) )
    {
        //If the cards value is not an ace, has to be a king queen or jack
        if(card.value != "ACE")
        {
            DEALER_SCORE += 10
        }
        else //the card is an ace
        {
            //if the ace will not make the player bust, add 11 to the score
            if(11 + DEALER_SCORE <= 21)
            {
                DEALER_SCORE += 11
            }
            else //if the ace will make the player bust, count it as a 1
            {
                DEALER_SCORE += 1
            }

        }
    }
    else //the value is a number
    {
        DEALER_SCORE += Number(card.value)
    }

    //update the header to show the dealers score
    DEALER_SCORE_HEADER.innerText = "DEALER: " + DEALER_SCORE
}

//Function called whenever the player stands.
//To limit API calls, the function will draw 5 cards at once from the deck,
//but only adds however many cards it takes for the dealer to win or bust
function DealerDrawCards()
{
    try
    {
        //Deletes the facedown card from the screen
        DEALER_CARDS_DIV.removeChild(DEALER_CARDS_DIV.lastChild)

        //Calls the API, fetching 5 cards at once
        fetch(DRAW_DEALER_CARDS)
        .then(response => response.json() )
        .then(json => {
            //counter used for inside the while loop
            let counter = 0

            //save the json as a local variable
            let cards = json

            //while the dealer hasn't busted but score is less than the players
            while(DEALER_SCORE < 21 && DEALER_SCORE <= PLAYER_SCORE)
            {
                //Push the nth card into the dealers deck
                DEALERS_CARDS.push(cards.cards[counter])

                //Update the score of the dealers hand
                UpdateDealerHandScore(cards.cards[counter] )

                //creates a DOM node using the current card and appends it to the dealers div
                let dealerCard = document.createElement("img")
                dealerCard.src = cards.cards[counter].image
                DEALER_CARDS_DIV.appendChild(dealerCard)

                //increments the counter
                counter++
            }

            //After the while loop, checks to see if the dealer won or busted
            if(DEALER_SCORE > 21)
            {
                ShowResult("dealerBusted")
            }
            else if(DEALER_SCORE > PLAYER_SCORE)
            {
                ShowResult("dealerWins")
            }
        })
    }
    catch(error)
    {
        RESULTS_HEADER.textContent = "We had some trouble retrieving your cards, please try again"
        EndOfHandUpdateButtons()
    }
}


//Function called whenever the player hits to draw one card from the deck
function DrawOneCard()
{
    try
    {
        fetch(DRAW_ONE_CARD)
        .then(response => response.json() )
        .then(json => {
            cards = json

            //Push the fetched card into the array of player cards
            PLAYERS_CARDS.push(cards.cards[0] )

            //Update the value of the players hand
            UpdatePlayerHandScore(cards.cards[0])

            //Creates a DOM node and adds the image to the players div
            let playerCard = document.createElement("img")
            playerCard.src = cards.cards[0].image
            PLAYER_CARDS_DIV.appendChild(playerCard)
            
            //Checks to see if the player busted or hit 21
            if(PLAYER_SCORE > 21)
            {
                ShowResult("playerBust")
            }
            else if(PLAYER_SCORE == 21)
            {
                ShowResult("player21")
            }
        })
    }
    catch(error)
    {
        RESULTS_HEADER.textContent = "We had some trouble retrieving your cards, please try again"
        EndOfHandUpdateButtons()
    }
}

//Updates the score of the players hand, taking a card object as a parameter
function UpdatePlayerHandScore(card)
{

    if(isNaN(card.value) ) // (i.e the card is a King, Queen, Jack, or Ace)
    {
        if(card.value != "ACE") //if it's not an ace, the value must be +10
        {
            PLAYER_SCORE += 10
        }
        else //the card is an ace
        {
            if(11 + PLAYER_SCORE <= 21) //if the players current hand + 11 won't bust him, counts the ace as an 11
            {
                PLAYER_SCORE += 11
            }
            else //counts the ace as a one
            {
                PLAYER_SCORE += 1
            }

        }
    }
    else //the cards value is a number
    {
        PLAYER_SCORE += Number(card.value)
    }

    //updates the players header
    PLAYER_SCORE_HEADER.textContent ="PLAYER: " + PLAYER_SCORE
}

//Updates the results header based on the string passed in as a parameter
function ShowResult(result)
{
    if(result == "playerBust")
    {
        RESULTS_HEADER.textContent = "BUST"
        EndOfHandUpdateButtons()
    }
    else if(result == "player21")
    {
        RESULTS_HEADER.textContent = "YOU GOT 21 !!!"
        EndOfHandUpdateButtons()
    }
    else if(result == "dealerWins")
    {
        RESULTS_HEADER.textContent = "THE HOUSE ALWAYS WINS"
        EndOfHandUpdateButtons()
    }
    else if(result == "dealerBusted")
    {
        RESULTS_HEADER.textContent = "THE HOUSE BUSTED"
        EndOfHandUpdateButtons()
    }
    else if(result == "playerBlackjack")
    {
        RESULTS_HEADER.textContent = "BLACKJACK!!!"
        EndOfHandUpdateButtons()
    }
}

//Called whenever the current hand is done, and updates the clickability of the three buttons
function EndOfHandUpdateButtons()
{
    DRAW_BUTTON.disabled = true
    STAY_BUTTON.disabled = true
    PLAY_AGAIN_BUTTON.disabled = false
}

//Called at the end of a hand, to start a new game
function RestartGame()
{
    //Empties out the player and dealers array of cards and zeroes their scores
    PLAYER_SCORE = 0
    PLAYERS_CARDS = []

    DEALER_SCORE = 0
    DEALERS_CARDS = []
    
    //Enables the stay/draw buttons and disables the playagain button
    PLAY_AGAIN_BUTTON.disabled = true
    DRAW_BUTTON.disabled = false
    STAY_BUTTON.disabled = false

    //Empties the text of the result
    RESULTS_HEADER.textContent = ""

    //Calls a function to delete all elements in the player and dealer divs 
    ClearDivElements()

    //Gets a new deck
    GetDeck()
}

//Called at the end of a hand to clear the div elements
function ClearDivElements()
{
    //While the div has any child, delete the last child node in the branch
    while(PLAYER_CARDS_DIV.firstChild)
    {
        PLAYER_CARDS_DIV.removeChild(PLAYER_CARDS_DIV.lastChild)
    }

    while(DEALER_CARDS_DIV.firstChild)
    {
        DEALER_CARDS_DIV.removeChild(DEALER_CARDS_DIV.lastChild)
    }
}

//Called whenever the player wants to stay
function Stay()
{
    //Disables the ability to draw more cards
    DRAW_BUTTON.disabled = true

    //Calls the function to let the dealer draw their cards
    DealerDrawCards()
}