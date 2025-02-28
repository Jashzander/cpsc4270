const concerts = [
    {
        startTime: new Date(2024, 12, 14, 19),
        duration: 120,
        primaryArtist: 'Seattle Symphony',
    },
    {
        startTime: new Date(2025, 2, 1, 12),
        duration: 150,
        primaryArtist: 'The Beatles',
        additionalArtists: ['The Rolling Stones']
    }
]
concerts.forEach((concert, index) => { 
    concert.id = index 
})

export function getConcerts(startDate, endDate) {
    return concerts.filter(concert => concert.startTime >= startDate && concert.startTime <= endDate)
}

export function updateConcertStartTime(id, startTime) {
    const concert = concerts[id]
    if(concert) {
        concert.startTime = startTime
    }
    return !!concert
}