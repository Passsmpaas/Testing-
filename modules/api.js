
import fetch from "node-fetch";

function buildHeaders(ins, userid, token) {
    return {
        "Client-Service": "Appx",
        "Auth-Key": "appxapi",
        "User-ID": userid,
        "Authorization": token,
        "User_app_category": "",
        "Language": "en",
        "Host": ins,
        "User-Agent": "okhttp/4.9.1",
    };
}

export async function fetchBatches(req, res) {
    try {
        const { ins, userid, token } = req.body;
        if (!ins || !userid || !token) return res.status(400).json({error:"Institute, UserID, and Token required"});
        const hdr = buildHeaders(ins, userid, token);
        const response = await fetch(`https://${ins}/get/mycourse?userid=${userid}`, { headers: hdr });
        const data = await response.json();
        if(!data.data) return res.status(404).json({error:"No batches found"});
        res.json(data.data);
    } catch(err) { console.error(err); res.status(500).json({error:"Failed to fetch batches"}); }
}

export async function fetchSubjects(req,res) {
    try {
        const { ins, userid, token, courseid } = req.body;
        if (!ins||!userid||!token||!courseid) return res.status(400).json({error:"Institute, UserID, Token, and CourseID required"});
        const hdr = buildHeaders(ins, userid, token);
        const response = await fetch(`https://${ins}/get/allsubjectfrmlivecourseclass?courseid=${courseid}`, { headers: hdr });
        const data = await response.json();
        if(!data.data) return res.status(404).json({error:"No subjects found"});
        res.json(data.data);
    } catch(err){console.error(err); res.status(500).json({error:"Failed to fetch subjects"});}
}

export async function fetchTopics(req,res){
    try{
        const { ins, userid, token, courseid, subjectid } = req.body;
        if(!ins||!userid||!token||!courseid||!subjectid) return res.status(400).json({error:"Institute, UserID, Token, CourseID, and SubjectID required"});
        const hdr = buildHeaders(ins, userid, token);
        const response = await fetch(`https://${ins}/get/alltopicfrmlivecourseclass?courseid=${courseid}&subjectid=${subjectid}`, {headers: hdr});
        const data = await response.json();
        if(!data.data) return res.status(404).json({error:"No topics found"});
        const topics = data.data.map(topic=>{
            let videos=[];
            let possibleLinks=[];
            ["download_link","file_url","stream_url","videopath","video_link","playback_url","url","s3_url"].forEach(k=>{ if(topic[k]) possibleLinks.push(topic[k]);});
            if(topic.bitrate_urls && Array.isArray(topic.bitrate_urls)) topic.bitrate_urls.forEach(b=>{if(b.url) possibleLinks.push(b.url); if(b.link) possibleLinks.push(b.link);});
            const validLinks = possibleLinks.filter(u=>u && u.includes("transcoded-videos.securevideo.in") && !u.includes("drm"));
            validLinks.forEach(u=>{let resLabel="Auto"; if(u.includes("1080")) resLabel="1080p"; else if(u.includes("720")) resLabel="720p"; else if(u.includes("480")) resLabel="480p"; else if(u.includes("360")) resLabel="360p"; videos.push({quality:resLabel,url:u});});
            return {topicid:topic.topicid, topic_name:topic.topic_name, videos};
        });
        res.json(topics);
    } catch(err){console.error(err); res.status(500).json({error:"Failed to fetch topics"});}
}
