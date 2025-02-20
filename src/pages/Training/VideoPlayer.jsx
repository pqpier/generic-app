import { EnterFullScreenIcon } from "@radix-ui/react-icons";
import { PlayCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import YouTube from "react-youtube";
import { Slider } from "@/shadcn/components/ui/slider";

const VideoPlayer = ({ videoId, videoThumb, isPaused, setIsPaused }) => {
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
      controls: 0, // Remove os controles do player
      color: "white",
      showinfo: 0, // Remove as informações do vídeo
      modestbranding: 1, // Remove a marca do YouTube
      rel: 0, // Não mostra vídeos relacionados ao final
      iv_load_policy: 3, // Remove anotações
      fs: 0,
      playsinline: 1,
      disablekb: 1,
    },
  };

  const onPlayerReady = (event) => {
    const player = event.target;
    setPlayer(player);
    setDuration(player.getDuration());
    // player.setPlaybackRate(1); // Define a taxa de reprodução para 1.5x
  };

  const onPlayerStateChange = (event) => {
    const playerState = event.data;
    if (playerState === 1) {
      setIsPaused(false); // O vídeo está tocando
    } else {
      setIsPaused(true); // O vídeo está pausado ou finalizado
    }
  };

  const togglePlayPause = () => {
    setLoading(true);
    if (player) {
      if (isPaused) {
        setIsPaused(false);
        player.playVideo();
      } else {
        setIsPaused(true);
        player.pauseVideo();
      }
    }
    setLoading(false);
  };

  const toggleFullScreen = () => {
    const iframe = document.querySelector(".vds-youtube");
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  };

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [player]);

  const getProgress = () => {
    if (duration === 0) {
      return;
    }
    return (currentTime / duration) * 100;
  };

  const handleSliderChange = (value) => {
    if (player && duration > 0) {
      const newTime = (value / 100) * duration;
      setCurrentTime(newTime);
      player.seekTo(newTime, true);
    }
  };

  return (
    <div className="relative">
      <img
        className={`w-full absolute ${
          isPaused || loading ? "absolute" : "hidden"
        }`}
        src={videoThumb}
        alt="thumb"
      />

      <YouTube
        videoId={videoId}
        opts={opts}
        iframeClassName="vds-youtube"
        className={`youtube-container ${isPaused ? "invisible" : ""}`}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />
      {/* <div
        className="bottom-0 absolute h-3 bg-green-500"
        style={{ width: getProgress() }}
      ></div> */}
      <Slider
        className="absolute z-30 bottom-0 left-0 w-full rounded-b-sm"
        defaultValue={[getProgress()]}
        value={[getProgress()]}
        max={100}
        step={1}
        onValueChange={(value) => handleSliderChange(value[0])}
      />
      <div
        className="top-0 left-0 z-20 absolute h-full w-full cursor-pointer"
        onClick={togglePlayPause}
      ></div>
      {isPaused && (
        <button
          className="h-40 w-44 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand/75 text-white p-2 gap-2 rounded-lg flex flex-col justify-center items-center"
          onClick={togglePlayPause}
        >
          <PlayCircleIcon className="h-20 w-20" />
          <h3 className="font-semibold text-sm">Clique para assistir</h3>
        </button>
      )}
      <button
        className={`absolute top-2 right-2 bg-white/75 p-2 rounded-md flex gap-2 ${
          isPaused ? "" : "z-30"
        }`}
        onClick={toggleFullScreen}
      >
        <p className="text-xs">Tela cheia</p>
        <EnterFullScreenIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default VideoPlayer;
