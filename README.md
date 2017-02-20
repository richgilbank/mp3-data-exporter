# MP3 Data Exporter
This app allows you to extract metadata from your mp3 collection, so it
can be exported for use with other services. I built it to import my own
MP3 collection into Spotify. It loops through the audio files in a given
folder, then extracts data from their ID3 tags, giving you the ability
to export a CSV file from it.

Once you have a CSV, you can use a free tool like [Playlist Converter](http://www.playlist-converter.net/#/) to import it into Spotify or another service.

#### Screenshots:
![](https://s3.amazonaws.com/mp3-data-exporter/screens.jpg)

**Note:** This was built for my own purposes. It may work for yours, it
may not. It's a quick-and-dirty way to do this, so it's pretty far from
being bug-free.

### Binaries
* [OSX .app binary (in a zip file)](https://s3.amazonaws.com/mp3-data-exporter/mp3-data-exporter.app.zip)
* I haven't yet built one for Windows, but it should be as simple as running `npm i && npm run build` from a Windows machine

### Usage
`npm i && npm start`
