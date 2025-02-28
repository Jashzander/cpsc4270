const albums = {
    [0]: {
        name: 'Black Holes and Revelations',
        yearReleased: 2006,
        genre: 'Rock',
    },
    [1]: {
        name: 'Torches',
        yearReleased: 2011,
        genre: 'Indie Pop',
    },
    [2]: {
        name: 'A Rush of Blood to the Head',
        yearReleased: 2002,
        genre: 'Alternative',
    }
}
let nextId = 0
Object.values(albums).forEach(album => {
    album.id = nextId++
})

export function getAlbums() {
    return Object.values(albums)
}

export function addAlbum(album) {
    const id = nextId++
    album.id = id
    albums[id] = album
    return id
}

export function getAlbumById(id) {
    return albums[id]
}

export function deleteAlbum(id) {
    delete albums[id]
}