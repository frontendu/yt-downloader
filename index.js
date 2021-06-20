const http = require('http');
const ytdl = require('ytdl-core');
const got = require('got');

const port = process.env.PORT;
const channelId = process.env.YT_CHANNEL_ID;
const key = process.env.YT_KEY;

const getActivities = async () => {
  return JSON.parse((await got(`https://www.googleapis.com/youtube/v3/activities`, {
    searchParams: {
      channelId,
      key,
      part: 'contentDetails'
    }
  })).body);
}

http.createServer(async (req, res) => {
  try {
    const activities = await getActivities();
    const {contentDetails: {upload: {videoId}}} = activities.items.find(i => Boolean(i.contentDetails.upload));
    const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);

    res.statusCode = 301;
    res.setHeader('Location', (videoInfo.formats.find(f => f.mimeType.includes('audio/mp4')).url));

    res.end();
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
  }
}).listen(port);
