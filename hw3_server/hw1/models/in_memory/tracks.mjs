const tracksByAlbumId = {
    [0]: [
        {
            name: 'Take a Bow',
            duration: '4:35',
            primaryArtist: 'Muse',
        },
        {
            name: 'Starlight',
            duration: '3:59',
            primaryArtist: 'Muse',
        },
        {
            name: 'Supermassive Black Hole',
            duration: '3:29',
            primaryArtist: 'Muse',
        },
        {
            name: 'Map of the Problematique',
            duration: '4:18',
            primaryArtist: 'Muse',
        },
        {
            name: 'Soldier\'s Poem',
            duration: '2:03',
            primaryArtist: 'Muse',
        },
        {
            name: 'Invincible',
            duration: '5:00',
            primaryArtist: 'Muse',
        },
        {
            name: 'Assassin',
            duration: '3:31',
            primaryArtist: 'Muse',
        },
        {
            name: 'Exo-Politics',
            duration: '3:53',
            primaryArtist: 'Muse',
        },
        {
            name: 'City of Delusion',
            duration: '4:48',
            primaryArtist: 'Muse',
        },
        {
            name: 'Hoodoo',
            duration: '3:43',
            primaryArtist: 'Muse',
        },
        {
            name: 'Knights of Cydonia',
            duration: '6:07',
            primaryArtist: 'Muse',
        }
    ],
    [1]: [
        {
            name: 'Helena Beat',
            duration: '4:36',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Pumped Up Kicks',
            duration: '4:00',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Call It What You Want',
            duration: '4:01',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Don\'t Stop (Color on the Walls)',
            duration: '2:56',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Waste',
            duration: '3:24',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'I Would Do Anything for You',
            duration: '3:35',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Houdini',
            duration: '3:23',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Life on the Nickel',
            duration: '3:36',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Miss You',
            duration: '3:36',
            primaryArtist: 'Foster the People',
        },
        {
            name: 'Warrant',
            duration: '5:22',
            primaryArtist: 'Foster the People',
        }
    ],
    [2]: [
        {
            name: 'Politik',
            duration: '5:18',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'In My Place',
            duration: '3:48',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'God Put a Smile upon Your Face',
            duration: '4:57',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'The Scientist',
            duration: '5:09',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'Clocks',
            duration: '5:07',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'Daylight',
            duration: '5:27',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'Green Eyes',
            duration: '3:43',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'Warning Sign',
            duration: '5:31',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'A Whisper',
            duration: '3:58',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'A Rush of Blood to the Head',
            duration: '5:51',
            primaryArtist: 'Coldplay',
        },
        {
            name: 'Amsterdam',
            duration: '5:19',
            primaryArtist: 'Coldplay',
        }
    ]
}

Object.values(tracksByAlbumId).forEach(tracks => {
    tracks.forEach((track, index) => {
        track.trackNumber = index + 1
    })
})

export function addTrack(albumId, track) {
    const tracks = tracksByAlbumId[albumId] ??= []
    track.trackNumber = tracks.length
    tracks.push(track)
}

export function getTracksForAlbum(albumId) {
    return tracksByAlbumId[albumId] || []
}

export function deleteTrack(albumId, trackNumber) {
    const tracks = tracksByAlbumId[albumId]
    if(tracks) {
        tracks.splice(trackNumber, 1)
    }
}

export function deleteAllTracksForAlbum(albumId) {
    delete tracksByAlbumId[albumId]
}