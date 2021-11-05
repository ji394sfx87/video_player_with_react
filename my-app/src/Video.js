import React, {
        useState,
        useEffect,
        useRef,
        useCallback
    } from "react";
import styled from "styled-components";
import classNames from "classnames";

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

const ControlsLeft = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1 1 auto;
`

const ControlsRight = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 1 auto;
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

    &.-show-control {
        ${VideoControl} {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &:not(.-show-control) {
        &.-playing {
            cursor: none;
    
            video {
                cursor: none;
            }
        }
    }

    video {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
    }

    ${VideoControl} {
        opacity: 0;
        transform: translateY(100%);
        transition: opacity .3s, transform .3s;
    }
`

// 控制器
const useVideoControlShow = () => {
    const [controlShow, setControlShow] = useState(true);
    return {
        controlShow,
        setControlShow
    }
}

// 播放器播放控制
const useVideoPlayStatus = ({videoElem = null, setControlShow = null}) => {
    const [playStatus, setPlayStatus] = useState(false);
    
    const handleSwitchButton = (e) => {
        setPlayStatus(!playStatus);
    }

    const handleVideoEnded = (e) => {
        setPlayStatus(false);
    }

    useEffect(() => {
        if(videoElem && setControlShow) {
            if (playStatus && (videoElem.paused || videoElem.ended)) {
                videoElem.play();
            } else {
                videoElem.pause();
                setControlShow(true);
            }
        }
    }, [playStatus, videoElem, setControlShow]);

    return {
        playStatus,
        setPlayStatus,
        handleSwitchButton,
        handleVideoEnded
    }
}

// 滑鼠操作
const useVideoFrameMouse = ({videoElem = null, controlShow = false, setControlShow = null}) => {
    const [mouseIn, setMouseIn] = useState(false);
    const [mouseMove, setMouseMove] = useState(0);
    const [mouseDown, setMouseDown] = useState(false);
    
    const handleMouseEnterVideoFrame = (e) => {
        setMouseIn(true);
        if(!controlShow) {
            setControlShow(true);
        }
    }
    
    const handleMouseMoveVideoFrame = (e) => {
        setMouseMove(mouseMove + 1);
        if(!controlShow) {
            setControlShow(true);
        }
    }
    
    const handleMouseLeaveVideoFrame = (e) => {
        setMouseIn(false);
        setMouseMove(0);
        if(controlShow && !videoElem.paused && !videoElem.ended) {
            setControlShow(false);
        }
    }
    
    const handleMouseDownVideoFrame = (e) => {
        console.log('down')
        setMouseDown(true);
    }

    const handleMouseUpVideoFrame = useCallback(() => {
        console.log('up')
        setMouseDown(false);
    }, []);

    return {
        mouseIn,
        setMouseIn,
        mouseMove,
        setMouseMove,
        mouseDown,
        setMouseDown,
        handleMouseEnterVideoFrame,
        handleMouseMoveVideoFrame,
        handleMouseLeaveVideoFrame,
        handleMouseDownVideoFrame,
        handleMouseUpVideoFrame
    }
}

// 控制器顯示控制
const useVideoControlShowStatus = ({playStatus = false, setControlShow = null, mouseIn = false, mouseMove = 0, mouseDown = false}) => {
    const actTimeout = useRef();

    useEffect(() => {
        if(actTimeout) {
            clearTimeout(actTimeout.current);
        }
        actTimeout.current = setTimeout(() => {
            if(playStatus && !mouseDown) {
                setControlShow(false);
            }
        }, 2000);
    }, [playStatus, mouseIn, mouseMove, mouseDown, setControlShow]);

    return {
        actTimeout
    }
}

const Video = ({
    src = "",
}) => {
    const videoRef = useRef();

    // 控制器
    const {controlShow, setControlShow} = useVideoControlShow();

    // 播放器播放控制
    const {playStatus, handleSwitchButton, handleVideoEnded} = useVideoPlayStatus({
        videoElem: videoRef.current,
        setControlShow: setControlShow
    });

    // 滑鼠控制
    const {
        mouseIn,
        mouseMove,
        mouseDown,
        handleMouseEnterVideoFrame,
        handleMouseMoveVideoFrame,
        handleMouseLeaveVideoFrame,
        handleMouseDownVideoFrame,
        handleMouseUpVideoFrame
    } = useVideoFrameMouse({
        videoElem: videoRef.current,
        controlShow: controlShow,
        setControlShow: setControlShow
    });

    // 控制器顯示控制
    useVideoControlShowStatus({
        videoElem: videoRef.current,
        playStatus: playStatus,
        setControlShow: setControlShow,
        mouseIn: mouseIn,
        mouseMove: mouseMove,
        mouseDown: mouseDown
    });

    return (
        <VideoFrame
            onClick={handleSwitchButton}
            onMouseEnter={handleMouseEnterVideoFrame}
            onMouseMove={handleMouseMoveVideoFrame}
            onMouseLeave={handleMouseLeaveVideoFrame}
            onMouseDown={handleMouseDownVideoFrame}
            onMouseUp={handleMouseUpVideoFrame}
            className={classNames({
                "-show-control": controlShow,
                '-playing': playStatus,
            })}
        >
            <video
                ref={videoRef}
                playsInline
                onEnded={handleVideoEnded}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support HTML video.
            </video>
            <VideoControl>
                <Progress>

                </Progress>
                <Controls>
                    <ControlsLeft>
                        <Button
                            onClick={handleSwitchButton}
                        >
                            {playStatus &&
                                <svg viewBox="0 0 36 36">
                                    <path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z" fill="currentColor"></path>
                                </svg>
                            }
                            {!playStatus &&
                                <svg viewBox="0 0 36 36">
                                    <path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" fill="currentColor"></path>
                                </svg>
                            }
                        </Button>
                    </ControlsLeft>
                    <ControlsRight>
                    </ControlsRight>
                </Controls>
            </VideoControl>
        </VideoFrame>
    );
}

export default Video;