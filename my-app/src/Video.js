import React, {
        useState,
        useEffect,
        useRef
    } from "react";
import styled from "styled-components";

const Button = styled.button`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 1 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    color: #fff;
    background-color: transparent;
    border: 0;
    cursor: pointer;

    svg {
        display: block;
        width: 100%;
        height: 100%;
    }
`

const Progress = styled.div`
    position: relative;
    display: block;
    width: 100%;
    height: 20px;
`

const Controls = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`

const VideoControl = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: block;
    width: 100%;
    background: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
`

const VideoFrame = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background-color: #000;
    overflow: hidden;

    video {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
    }
`

const Video = ({
    src = "",
}) => {
    const videoRef = useRef();
    const [playStatus, setPlayStatus] = useState(false);

    useEffect(() => {
        if (playStatus && (videoRef.current.paused || videoRef.current.ended)) videoRef.current.play();
        else videoRef.current.pause();
    }, [playStatus, setPlayStatus])
    
    const handleSwitchButton = (e) => {
        setPlayStatus(!playStatus)
    }

    return (
        <VideoFrame
            onClick={handleSwitchButton}
        >
            <video
                ref={videoRef}
                playsInline
            >
                <source src={src} type="video/mp4" />
                Your browser does not support HTML video.
            </video>
            <VideoControl>
                <Progress>

                </Progress>
                <Controls>
                    <Button
                        onClick={handleSwitchButton}
                    >
                        {playStatus
                            ?   <svg viewBox="0 0 36 36">
                                    <path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z" fill="currentColor"></path>
                                </svg>
                            :   <svg viewBox="0 0 36 36">
                                    <path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" fill="currentColor"></path>
                                </svg>
                        }
                    </Button>
                </Controls>
            </VideoControl>
        </VideoFrame>
    );
}

export default Video;