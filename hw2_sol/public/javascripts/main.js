const fetchWithBody = (path, body, method) =>
  fetch(path, {
    method: method ?? 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })

const resultList = document.getElementById('result-list')
function displayResult(response, result) {
  const newItem = document.createElement('li')
  newItem.innerText = `${new Date().toDateString()}: ${response.status} ${result}`
  resultList.prepend(newItem)
}

const samplePlaylist = {
  name: 'Sample Playlist',
  isPublic: true,
}
document.getElementById('create-playlist').onclick = async () => {
  const response = await fetchWithBody('/playlists', samplePlaylist)
  const result = await response.text()
  displayResult(response, result)
}

let trackId = 1
document.getElementById('add-track').onclick = async () => {
  const response = await fetchWithBody(`/playlists/${selectedPlaylistId}/tracks`, {
    trackId: `${trackId++}`,
  })
  const result = await response.text()
  displayResult(response, result)
}

document.getElementById('reorder-tracks').onclick = async () => {
  const response = await fetchWithBody(
    '/playlists/67a8e4b064551dd8d02635f3/tracks',
      {
      trackId: '2',
      position: 0,
    },
    'PATCH'
  )
  const result = await response.text()
  displayResult(response, result)
}

let selectedPlaylistId

const playlistsList = document.getElementById('playlists-list')
const selectedPlaylistDisplay = document.getElementById('selected-playlist')
document.getElementById('playlist-refresh').onclick = async () => {
  const response = await fetch('/playlists')
  const result = await response.json()
  playlistsList.innerHTML = ''
  result.forEach(playlist => {
    const newItem = document.createElement('li')
    newItem.innerText = JSON.stringify(playlist, null, 2)
    newItem.onclick = () => {
      selectedPlaylistId = playlist._id
      selectedPlaylistDisplay.innerText = selectedPlaylistId
    }
    playlistsList.appendChild(newItem)
  })
}

const tags = ['edgy', 'cool', 'slow', 'motivational', 'meme', 'upbeat', 'intense']
document.getElementById('add-tag').onclick = async () => {
  const response = await fetchWithBody(
    `/tracks/1/tags`,
    tags[Math.floor(Math.random() * tags.length)],
  )
  const result = await response.text()
  displayResult(response, result)
}

const tagsList = document.getElementById('tags-list')
document.getElementById('tag-search').onclick = async () => {
  const trackId = document.getElementById('tag-search-track-id').value
  const response = await fetch(`/tracks/${trackId}/tags`)
  const result = await response.json()
  result.forEach(tag => {
    const newItem = document.createElement('li')
    newItem.innerText = tag
    const upvoteButton = document.createElement('button')
    upvoteButton.innerText = '👍'
    newItem.appendChild(upvoteButton)
    upvoteButton.onclick = () => {
      fetchWithBody(
        `/tracks/1/tags/${tag}/user-votes/my`,
        true,
        'PUT'
      )
    }
    const downvoteButton = document.createElement('button')
    downvoteButton.innerText = '👎'
    newItem.appendChild(downvoteButton)
    downvoteButton.onclick = () => {
      fetchWithBody(
        `/tracks/1/tags/${tag}/user-votes/my`,
        false,
        'PUT'
      )
    }
    tagsList.appendChild(newItem)
  })
}

const recommendedTracksList = document.getElementById('recommended-tracks-list')
document.getElementById('recommended-tracks-refresh').onclick = async () => {
  const tag = document.getElementById('recommended-tracks-search').value
  const response = await fetch(`/recommended-tracks?tag=${tag}`)
  const result = await response.json()
  recommendedTracksList.innerHTML = ''
  result.forEach(track => {
    const newItem = document.createElement('li')
    newItem.innerText = JSON.stringify(track, null, 2)
    recommendedTracksList.appendChild(newItem)
  })
}