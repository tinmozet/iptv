let player;
let currentSource = '';

const channels = {
    'CHANNEL1_M3U8': 'http://iptv.prosto.tv:7000/ch163/video.m3u8',
    'CHANNEL2_M3U8': 'http://iptv.prosto.tv:7000/ch164/video.m3u8',
    'CHANNEL3_M3U8': 'http://iptv.prosto.tv:7000/ch165/video.m3u8'
};

// Initialize Video.js
function initPlayer() {
    player = videojs('my-video', {
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
            hls: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                smoothQualityChange: true
            }
        }
    });

    // HLS.js Integration
    if (Hls.isSupported()) {
        player.ready(() => {
            const video = player.el().querySelector('video');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.attachMedia(video);
            window.hls = hls;
        });
    }
}

// Channel Switch
document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.channel-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const src = btn.dataset.src;
        loadChannel(src);
    });
});

function loadChannel(channelKey) {
    if (!channels[channelKey]) return;
    
    currentSource = channels[channelKey];
    player.src({ src: currentSource, type: 'application/x-mpegURL' });
    player.play();
}

// Custom URL
function loadCustom() {
    const url = document.getElementById('custom-url').value.trim();
    if (url) {
        currentSource = url;
        player.src({ src: url, type: 'application/x-mpegURL' });
        player.play();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    loadChannel('CHANNEL1_M3U8'); // Default channel
});
