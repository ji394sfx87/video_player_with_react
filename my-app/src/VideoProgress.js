import React, {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";
import styled from "styled-components";

const ProgressBar = styled.div`
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    background-color: #f26f21;
    transform-origin: left;
`

const ProgressBuffered = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
`

const ProgressDotBall = styled.div`
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #f26f21;
    transform: scale(0);
    opacity: 0;
    transition: opacity .2s, transform .3s;
`;

const ProgressDot = styled.div`
    position: absolute;
    top: -2px;
    left: -8px;
    display: block;
    width: 16px;
    height: 16px;
    pointer-events: none;
`

const ProgressFrame = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.2);
    transform: scaleY(0.4);
    transition: transform .3s;
`

const Progress = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px 0;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    cursor: pointer;

    &:hover {
        ${ProgressFrame} {
            transform: scaleY(1);
        }

        ${ProgressDotBall} {
            opacity: 1;
            transform scale(1);
        }
    }
`

// 進度條控制
const useVideoProgress = ({
    videoElem = null,
    loadStart = false,
    ProgressFrameElem = null,
    ProgressBufferedElem = null,
    ProgressBarElem = null,
    ProgressDotElem = null
}) => {
    const [bufferedContext, setBufferedContext] = useState(null);

    const getProgressScale = useCallback(({
        time = 0
    }) => {
        if(videoElem) {
            const duration = videoElem.duration;
            return time / duration;
        }
        return 0;
    }, [videoElem]);

    useEffect(() => {
        if(ProgressBufferedElem) {
            setBufferedContext(ProgressBufferedElem.getContext('2d'));
        }
    }, [ProgressBufferedElem, bufferedContext]);

    const timeupdate = useCallback((e) => {
        if(videoElem) {
            if(ProgressBarElem && ProgressDotElem) {
                const progressScale = getProgressScale({
                    time: videoElem.currentTime
                })
                const progressPosX = ProgressFrameElem.offsetWidth * progressScale
                ProgressBarElem.style.transform = `scaleX(${progressScale})`
                ProgressDotElem.style.transform = `translateX(${progressPosX}px)`
            }

            if(bufferedContext && videoElem.buffered.length) {
                const scale = ProgressBufferedElem.width / videoElem.duration;
                bufferedContext.clearRect(0, 0, ProgressBufferedElem.width, ProgressBufferedElem.height);
                bufferedContext.strokeWidth = 0;

                for (let i = 0; i < videoElem.buffered.length; i++) {
                    var startX = videoElem.buffered.start(i) * scale;
                    var endX = videoElem.buffered.end(i) * scale;
                    var width = endX - startX;

                    bufferedContext.fillStyle = 'rgba(242,111,33,0.3)';
                    bufferedContext.fillRect(startX, 0, width, ProgressBufferedElem.height);
                    bufferedContext.rect(startX, 0, width, ProgressBufferedElem.height);
                }
            }
        }
    }, [videoElem, ProgressFrameElem, ProgressBarElem, ProgressDotElem, getProgressScale, ProgressBufferedElem, bufferedContext]);

    useEffect((e) => {
        if(loadStart) {
            timeupdate();
        }
    }, [loadStart, timeupdate]);

    useEffect(() => {
        if(videoElem) {
            videoElem.addEventListener("timeupdate", timeupdate);
        }

        return (() => {
            if(videoElem) {
                videoElem.removeEventListener("timeupdate", timeupdate);
            }
        })
    }, [videoElem, timeupdate]);
}

// 滑鼠控制
const useMouse = ({
    VideoFrameElem = null,
    videoElem = null,
    ProgressFrameElem = null
}) => {
    const [progressMouseDown, setProgressMouseDown] = useState(false);

    const handleProgressClick = useCallback((e) => {
        if(videoElem && ProgressFrameElem) {
            const frameRect = ProgressFrameElem.getBoundingClientRect();
            const posX = e.clientX - frameRect.left;
            const scale = posX / ProgressFrameElem.offsetWidth;
            const time = videoElem.duration * scale
            videoElem.currentTime = time
        }
    }, [videoElem, ProgressFrameElem]);

    const handleProgressMouseDown = useCallback(() => {
        setProgressMouseDown(true)
    }, [setProgressMouseDown]);

    const handleProgressMouseUp = useCallback(() => {
        setProgressMouseDown(false)
    }, [setProgressMouseDown]);

    const videoFrameMouseMove = useCallback((e) => {
        if(progressMouseDown) {
            if(videoElem && ProgressFrameElem) {
                const frameRect = ProgressFrameElem.getBoundingClientRect();
                const posX = e.clientX - frameRect.left;
                const scale = posX / ProgressFrameElem.offsetWidth;
                const time = videoElem.duration * scale
                videoElem.currentTime = time
            }
        }
    }, [progressMouseDown, videoElem, ProgressFrameElem]);

    const videoFrameMouseUp = useCallback((e) => {
        setProgressMouseDown(false)
    }, [setProgressMouseDown]);

    useEffect(() => {
        if(VideoFrameElem) {
            VideoFrameElem.addEventListener("mousemove", videoFrameMouseMove);
            VideoFrameElem.addEventListener("mouseup", videoFrameMouseUp);
        }

        return (() => {
            if(VideoFrameElem) {
                VideoFrameElem.removeEventListener("mousemove", videoFrameMouseMove);
                VideoFrameElem.removeEventListener("mouseup", videoFrameMouseUp);
            }
        })
    }, [VideoFrameElem, videoFrameMouseMove, videoFrameMouseUp])

    return {
        handleProgressClick,
        handleProgressMouseDown,
        handleProgressMouseUp
    }
}

const VideoProgress = ({
    VideoFrameRef = null,
    videoRef = null,
    loadStart = false
}) => {
    const ProgressFrameRef = useRef();
    const ProgressBufferedRef = useRef();
    const ProgressBarRef = useRef();
    const ProgressDotRef = useRef();

    // 進度條控制
    useVideoProgress({
        videoElem: videoRef.current,
        loadStart: loadStart,
        ProgressFrameElem: ProgressFrameRef.current,
        ProgressBufferedElem: ProgressBufferedRef.current,
        ProgressBarElem: ProgressBarRef.current,
        ProgressDotElem: ProgressDotRef.current
    });

    // 滑鼠控制
    const {
        handleProgressClick,
        handleProgressMouseDown,
        handleProgressMouseUp
    } = useMouse({
        VideoFrameElem: VideoFrameRef.current,
        videoElem: videoRef.current,
        ProgressFrameElem: ProgressFrameRef.current
    });

    return (
        <Progress
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
        >
            <ProgressFrame
                ref={ProgressFrameRef}
            >
                <ProgressBuffered
                    ref={ProgressBufferedRef}
                ></ProgressBuffered>
                <ProgressBar
                    ref={ProgressBarRef}
                ></ProgressBar>
                <ProgressDot
                    ref={ProgressDotRef}
                >
                    <ProgressDotBall></ProgressDotBall>
                </ProgressDot>
            </ProgressFrame>
        </Progress>
    );
}

export default VideoProgress;