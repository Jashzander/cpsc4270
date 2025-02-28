const artists = {}
let nextId = 0

export function getArtists() {
    return Object.values(artists)
}

export function addArtist(artist) {
    const id = nextId++
    artist.id = id
    artists[id] = artist
    return id
}

export function updateArtist(id, newFields) {
    const artist = artists[id]
    if(artist) {
        // could alternatively do shallow clone: artist = { ...artist, ...newFields } 
        Object.assign(artist, newFields)
    }
    return !!artist
}