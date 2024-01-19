const ipc = require('electron').ipcRenderer
const { off } = require('hammerjs');
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: '',
  clientSecret: '',
  redirectUri: 'http://localhost:8888/callback'
});

spotifyApi.setAccessToken('');

var covers = []
var previews = []
var artists = []
var songnames = []
var current_history = 0
var remove_ids = []
var ids_in_history = []
var ids = []
var cont = 0
var offset = 0

function removeAction(index) {
    remove_ids.splice(index, 1)
    var acciones = document.getElementsByClassName('history-action');
    acciones[index].style.setProperty('text-decoration', 'line-through');
    acciones[index].style.setProperty('text-decoration-color', 'red');
}

function addToHistory(accion, num) {
    var imagenes = document.getElementsByClassName('added-picture');
    var artistas = document.getElementsByClassName('history-artist');
    var nombres_canciones = document.getElementsByClassName('history-song');
    var acciones = document.getElementsByClassName('history-action');
    var botones = document.getElementsByClassName('history-button');
    let cancion = songnames[num-2]
    if (songnames[num-2].length >= 16) {
        cancion = songnames[num-2].substring(0,12)+"..."
    }
    if (current_history >= 3) {

        imagenes[2].src = imagenes[1].src
        artistas[2].innerHTML = artistas[1].innerHTML
        nombres_canciones[2].innerHTML = nombres_canciones[1].innerHTML
        acciones[2].innerHTML = acciones[1].innerHTML
        if (acciones[2].getAttribute("style") != null) {
            acciones[2].removeAttribute("style")
        }
        ids_in_history[2] = ids_in_history[1]

        imagenes[1].src = imagenes[0].src
        artistas[1].innerHTML = artistas[0].innerHTML
        nombres_canciones[1].innerHTML = nombres_canciones[0].innerHTML
        acciones[1].innerHTML = acciones[0].innerHTML
        if (acciones[1].getAttribute("style") != null) {
            acciones[1].removeAttribute("style")
            acciones[2].style.setProperty('text-decoration', 'line-through');
            acciones[2].style.setProperty('text-decoration-color', 'red');
        }
        ids_in_history[1] = ids_in_history[0]

        imagenes[0].src = covers[num-2]
        artistas[0].innerHTML = artists[num-2]
        nombres_canciones[0].innerHTML =cancion
        acciones[0].innerHTML = accion
        if (acciones[0].getAttribute("style") != null) {
            acciones[0].removeAttribute("style")
            acciones[1].style.setProperty('text-decoration', 'line-through');
            acciones[1].style.setProperty('text-decoration-color', 'red');
        }
        ids_in_history[0] = ids[num-2]

    } else if (current_history == 2) {

        imagenes[2].src = covers[num-2]
        artistas[2].innerHTML = artists[num-2]
        nombres_canciones[2].innerHTML = cancion
        acciones[2].innerHTML = accion
        ids_in_history[2] = ids[num-2]
        botones[2].style.display = "block"
    } else if (current_history == 1) {
        imagenes[1].src = covers[num-2]
        artistas[1].innerHTML = artists[num-2]
        nombres_canciones[1].innerHTML = cancion
        acciones[1].innerHTML = accion
        ids_in_history[1] = ids[num-2]
        botones[1].style.display = "block"
    } else if (current_history == 0) {
        imagenes[0].src  = covers[num-2]
        artistas[0].innerHTML  = artists[num-2]
        nombres_canciones[0].innerHTML  = cancion
        acciones[0].innerHTML = accion
        ids_in_history[0] = ids[num-2]
        botones[0].style.display = "block"
    }
    current_history++;
}

function isMultiple(x, y) {
    var remainder = x % y;
    if (remainder == 0){
        return true;
    } else {
        return false;
    }
}

function getTrackInfo(offset, limit) {
    spotifyApi.getMySavedTracks({
        limit : limit,
        offset: offset
      })
      .then(function(data) {
          for(let i=0;i<49; i++) {
            artists.push(data.body.items[i].track.artists[0].name)
            songnames.push(data.body.items[i].track.name)
            covers.push(data.body.items[i].track.album.images[1].url)
            previews.push(data.body.items[i].track.preview_url)
            ids.push(data.body.items[i].track.id)
          }
      }, function(err) {
        console.log('Something went wrong!', err);
    });
}

function removeFromLibrary(array_ids) {
    spotifyApi.removeFromMySavedTracks(array_ids)
}

getTrackInfo(0, 50)

// MENU

function closeApp(e) {
    e.preventDefault()
    ipc.send('close')
}

function minimizeWindow(e) {
    e.preventDefault()
    ipc.send('minimize')
}

function maximizeWindow(e) {
    e.preventDefault()
    ipc.send('expand')
}

function openDevMode(e) {
    e.preventDefault()
    ipc.send('dev')
}

/** 
document.getElementById("close-btn").addEventListener("click", closeApp);    
document.getElementById("min-btn").addEventListener("click", minimizeWindow);    
document.getElementById("max-btn").addEventListener("click", maximizeWindow);    
document.getElementById("dev-btn").addEventListener("click", openDevMode);
*/

function getUrl(value) {
    string = "url(" + covers[value] + ")"
    return string
}

function getPreview(value) {
    string = previews[value]
    return string
}

setTimeout(() => {

/* LikeCarousel (c) 2019 Simone P.M. github.com/simonepm - Licensed MIT */
    class Carousel {

        constructor(element) {
    
            this.board = element
    
            // add first two cards programmatically
            this.push()
            this.push()
    
            // handle gestures
            this.handle()
    
        }
    
        handle() {
    
            // list all cards
            this.cards = this.board.querySelectorAll('.card')

            // get audio player
            this.audio = this.board.querySelector('#audio-element')
            // get top card
            this.topCard = this.cards[this.cards.length - 1]
    
            // get next card
            this.nextCard = this.cards[this.cards.length - 2]
    
            // if at least one card is present
            if (this.cards.length > 0) {
    
                // set default top card position and scale
                this.topCard.style.transform =
                    'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
    
                // destroy previous Hammer instance, if present
                if (this.hammer) this.hammer.destroy()
    
                // listen for tap and pan gestures on top card
                this.hammer = new Hammer(this.topCard)
                this.hammer.add(new Hammer.Tap())
                this.hammer.add(new Hammer.Pan({
                    position: Hammer.position_ALL,
                    threshold: 0
                }))
    
                // pass events data to custom callbacks
                this.hammer.on('tap', (e) => {
                    this.onTap(e)
                })
                this.hammer.on('pan', (e) => {
                    this.onPan(e)
                })
    
            }
    
        }
    
        onTap(e) {
            // get finger position on top card
            let propX = (e.center.x - e.target.getBoundingClientRect().left) / e.target.clientWidth
    
            // get rotation degrees around Y axis (+/- 15) based on finger position
            let rotateY = 15 * (propX < 0.05 ? -1 : 1)
    
            // enable transform transition
            this.topCard.style.transition = 'transform 100ms ease-out'
    
            // apply rotation around Y axis
            this.topCard.style.transform =
                'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(' + rotateY + 'deg) scale(1)'
    
            // wait for transition end
            setTimeout(() => {
                // reset transform properties
                this.topCard.style.transform =
                    'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
            }, 100)
    
        }
    
        onPan(e) {
            this.audio.style.display = "none";
            if (!this.isPanning) {
    
                this.isPanning = true
    
                // remove transition properties
                this.topCard.style.transition = null
                if (this.nextCard) this.nextCard.style.transition = null
    
                // get top card coordinates in pixels
                let style = window.getComputedStyle(this.topCard)
                let mx = style.transform.match(/^matrix\((.+)\)$/)
                this.startPosX = mx ? parseFloat(mx[1].split(', ')[4]) : 0
                this.startPosY = mx ? parseFloat(mx[1].split(', ')[5]) : 0
    
                // get top card bounds
                let bounds = this.topCard.getBoundingClientRect()
    
                // get finger position on top card, top (1) or bottom (-1)
                this.isDraggingFrom =
                    (e.center.y - bounds.top) > this.topCard.clientHeight / 2 ? -1 : 1
    
            }
    
            // get new coordinates
            let posX = e.deltaX + this.startPosX
            let posY = e.deltaY + this.startPosY
    
            // get ratio between swiped pixels and the axes
            let propX = e.deltaX / this.board.clientWidth
            let propY = e.deltaY / this.board.clientHeight
    
            // get swipe direction, left (-1) or right (1)
            let dirX = e.deltaX < 0 ? -1 : 1
    
            // get degrees of rotation, between 0 and +/- 45
            let deg = this.isDraggingFrom * dirX * Math.abs(propX) * 45
    
            // get scale ratio, between .95 and 1
            let scale = (95 + (5 * Math.abs(propX))) / 100
    
            // move and rotate top card
            this.topCard.style.transform =
                'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg) rotateY(0deg) scale(1)'
    
            // scale up next card
            if (this.nextCard) this.nextCard.style.transform =
                'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(' + scale + ')'
    
            if (e.isFinal) {
                this.isPanning = false
    
                let successful = false
    
                // set back transition properties
                this.topCard.style.transition = 'transform 200ms ease-out'
                if (this.nextCard) this.nextCard.style.transition = 'transform 100ms linear'
    
                // check threshold and movement direction
                if (propX > 0.25 && e.direction == Hammer.DIRECTION_RIGHT) {
    
                    successful = true
                    // get right border position
                    posX = this.board.clientWidth
    
                } else if (propX < -0.25 && e.direction == Hammer.DIRECTION_LEFT) {
    
                    successful = true
                    // get left border position
                    posX = -(this.board.clientWidth + this.topCard.clientWidth)
                    addToHistory("Remove song", cont)
                    remove_ids.push(ids[cont-2])

                } else if (propY < -0.25 && e.direction == Hammer.DIRECTION_UP) {
    
                    successful = true
                    // get top border position
                    posY = -(this.board.clientHeight + this.topCard.clientHeight)
                    addToHistory("Add to playlist", cont)
    
                }

                this.audio.style.display = "block";
    
                if (successful) {
                    // throw card in the chosen direction
                    this.topCard.style.transform =
                        'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg)'
    
                    // wait transition end
                    setTimeout(() => {
                        // remove swiped card
                        this.board.removeChild(this.topCard)
                        // add new card
                        this.push()
                        // handle gestures on new top card
                        this.handle()
                    }, 200)
    
                } else {
    
                    // reset cards position and size
                    this.topCard.style.transform =
                        'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
                    if (this.nextCard) this.nextCard.style.transform =
                        'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)'
    
                }
    
            }
    
        }
    
        push() {
            document.getElementById("audio-element").src=getPreview(cont-1)
            let card = document.createElement('div')
    
            card.classList.add('card')
            card.style.cssText = 'background-repeat: no-repeat; background-size: 500px;'
            card.style.backgroundImage =
                getUrl(cont)
            this.board.insertBefore(card, this.board.firstChild)
            cont++
            if(isMultiple(cont, 48)) {
                offset = offset+49
                getTrackInfo(offset, 50)
            }
        }
    
    }
    
    let board = document.querySelector('#card-wrapper')
    
    let carousel = new Carousel(board)

}, 300);