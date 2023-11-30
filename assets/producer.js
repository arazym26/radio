selectedDJ = "Not selected";
selectedTime = "Not selected";

function generalSearch(context) {
    let searchText = context["generalSearchInput"].value;
    if (searchText.length < 1 || searchText.trim() === "") {
        alert("Please enter a search term before searching!");
        return false;
    }
    return true;
}

function listPlaylist() {
    let playlistSongs = document.getElementById('listofsongs').children;
    let playlistString = "";
    for (i = 0; i < playlistSongs.length; i++) {
        let song = playlistSongs[i].textContent.slice(0, -1);
        playlistString += song + "\n";
    }
    return playlistString;
}

function outputPlaylist() {
    playlist = {
        djName: selectedDJ,
        timeslot: selectedTime,
        songs: []
    }

    let playlistSongs = document.getElementById('listofsongs').children;
    for (i = 0; i < playlistSongs.length; i++) {
        let song = playlistSongs[i].textContent.slice(0, -1);
        playlist.songs.push(song);
    }

    // update playlist on server
    fetch('/playlistupdate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(playlist)
    })
    .then((response) => console.log(response));

    // update new playlist internally
    for(let i = 0; i < djs.length; i++) {
        if(djs[i].name == selectedDJ) {
            for(let j = 0; j < djs[i].times.length; j++) {
                djs[i].times[j].songs = playlist.songs;
                return;
            }
        }
    }
}

function searchSongListeners() {
    let playlistSongs = document.getElementById('listofsongs').children;

    // Search Songs
    let searchSongs = document.getElementById('searchsongs').children;
    for (i = 0; i < searchSongs.length; i++) {
        let element = searchSongs[i];

        if (element.children[0].innerHTML.indexOf("➕") !== -1) {
            element.addEventListener('click', function() {
                if(playlistSongs.length > 0) {
                    playlistSongs[playlistSongs.length - 1].after(element);
                } else {
                    document.getElementById('listofsongs').appendChild(element);
                }

                element.innerHTML = element.innerHTML.replace("➕", "➖");
                element.addEventListener('click', function() {
                    element.remove();
                });
            });
        }
    }
}

function populatePlaylist(DJName, selectedTime, songs) {
    let playlistSongs = document.getElementById('listofsongs');
    playlistSongs.innerHTML = "";

    for(let i = 0; i < songs.length; i++) {
            let songList = document.getElementById("listofsongs");
            let songItem = document.createElement("li");
            let songSpan = document.createElement("span");

            songSpan.setAttribute("class", "listicon");
            songSpan.appendChild(document.createTextNode("➖"));

            songItem.appendChild(document.createTextNode(songs[i]));
            songItem.appendChild(songSpan);

            songList.appendChild(songItem);


            songItem.addEventListener('click', function() {
                songItem.remove();
            });
    }
}

addEventListener("DOMContentLoaded", (event) => {
    // Load DJs
    let djList = document.getElementById("listofdjs");
    for (let i = 0; i < djs.length; i++) {
        djs[i].listed = true;

        let djListItem = document.createElement("li");
        djListItem.appendChild(document.createTextNode(djs[i].name));
        djList.appendChild(djListItem);

        djListItem.addEventListener("click", function(e) {
            if(e.target) {
                let DJName = e.target.textContent;
                for(let i = 0; i < djs.length; i++) {
                    if(djs[i].name == DJName) {
                        selectedDJ = DJName;
                        let timelist = document.getElementById("listoftimes");
                            timelist.innerHTML = "";
                            for(let j = 0; j < djs[i].times.length; j++) {
                                let tempLI = document.createElement("li");
                                tempLI.appendChild(document.createTextNode(djs[i].times[j].timeslot));
                                timelist.appendChild(tempLI);

                                tempLI.addEventListener("click", function(e) {
                                    if(e.target) {
                                        let timeText = e.target.textContent;
                                        selectedTime = timeText;

                                        /* populate playlist */
                                        populatePlaylist(DJName, selectedTime, djs[i].times[j].songs);
                                    }
                                });
                            }
                        break;
                    }
                }
                e.target.style.backgroundColor = "lightblue";
            }
        });
    }

    let searchInput = document.getElementById('songsearchinput');
    searchInput.addEventListener("keyup", function () {
        let searchTerm = searchInput.value;

        if (searchTerm.length < 1 || searchTerm.value === "banana") return;

        let results = [];
        songs.forEach((value, index) => {
            if (value.title.toLowerCase().includes(searchTerm)) results.push(index);
        });

        let currentSearches = document.getElementById("searchsongs").children;
        if(currentSearches.length > 0) {
            currentSearches[0].style.visibility = "hidden";
            for (let i = 1; i < currentSearches.length; i++) {
                currentSearches[i].remove();
            }
        }

        // add new songs
        for (let i = 0; i < results.length; i++) {
            let songList = document.getElementById("searchsongs");
            let songItem = document.createElement("li");
            let songSpan = document.createElement("span");

            songSpan.setAttribute("class", "listicon");
            songSpan.appendChild(document.createTextNode("➕"));

            songItem.appendChild(document.createTextNode(songs[results[i]].title));
            songItem.appendChild(songSpan);

            songList.appendChild(songItem);
        }

        searchSongListeners();
    });

    searchSongListeners();
});