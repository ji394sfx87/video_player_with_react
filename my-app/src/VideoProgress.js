import React, {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";
import styled from "styled-components";
import classNames from "classnames";

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

const ProgressHintTimeBox = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    color: #ddd;
    line-height: 1;
    font-size: 14px;
    font-family: Arial;
    background-color: rgba(0,0,0,0.6);
    border-radius: 5px;
    box-sizing: border-box;
`

const ProgressHintTime = styled.div`
    position: absolute;
    bottom: 100%;
    left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s;

    &.-show {
        opacity: 1;
    }
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

// 進度條提示時間
const useHintTime = ({
    ProgressFrameElem = null,
    ProgressHintTimeBoxElem = null
}) => {
    const [hintTime, setHintTime] = useState('');
    const [hintTimePos, setHintTimePos] = useState(0);

    useEffect(() => {
        if(ProgressFrameElem && ProgressHintTimeBoxElem) {
            ProgressHintTimeBoxElem.style.transform = `translateX(${hintTimePos}px)`;
        }
    }, [ProgressFrameElem, ProgressHintTimeBoxElem, hintTimePos]);

    return {
        hintTime,
        setHintTime,
        hintTimePos,
        setHintTimePos
    };
}

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
    setHintTime = null,
    setHintTimePos = null,
    VideoFrameElem = null,
    videoElem = null,
    ProgressFrameElem = null,
    ProgressHintTimeBoxElem = null
}) => {
    const [progressMouseIn, setProgressMouseIn] = useState(false);
    const [progressMouseDown, setProgressMouseDown] = useState(false);

    const getTimeString = useCallback((time) => {
        const hours = Math.floor(time / 60 / 60);
        const minutes = Math.floor((time - hours * 60 * 60) / 60);   
        const seconds = Math.floor(time - minutes * 60);

        let houtString = "";
        if(hours > 0) {
            houtString = hours < 10 ? "0" + hours : hours;
        }
        let minuteString = minutes < 10 ? "0" + minutes : minutes;
        let secondString = seconds < 10 ? "0" + seconds : seconds;

        let timeString = "";
        timeString += houtString ? `${houtString}:` : "";
        timeString += `${minuteString}:`;
        timeString += `${secondString}`;
        return timeString;
    }, []);

    const setMousePos = useCallback((posX) => {
        if(ProgressFrameElem && ProgressHintTimeBoxElem) {
            const ProgressFrameElemWidth = ProgressFrameElem.offsetWidth;
            const ProgressHintTimeBoxElemWidth = ProgressHintTimeBoxElem.offsetWidth;
            const boxHalfWidth = ProgressHintTimeBoxElemWidth / 2;
            if(posX < boxHalfWidth) {
                setHintTimePos(boxHalfWidth);
            } else if((ProgressFrameElemWidth - posX) < boxHalfWidth) {
                setHintTimePos(ProgressFrameElemWidth - boxHalfWidth);
            } else {
                setHintTimePos(posX);
            }
        }
    }, [ProgressFrameElem, ProgressHintTimeBoxElem, setHintTimePos]);

    const getMousePos = useCallback((e) => {
        if(ProgressFrameElem) {
            const frameRect = ProgressFrameElem.getBoundingClientRect();
            const frameWidth = ProgressFrameElem.offsetWidth;
            let posX = e.clientX - frameRect.left;
            if(posX < 0) {
                posX = 0;
            } else if (posX > frameWidth) {
                posX = frameWidth;
            }
            setMousePos(posX);
            return posX;
        }
        return 0;
    }, [ProgressFrameElem, setMousePos]);

    const getMousePosTime = useCallback((e) => {
        if(videoElem && ProgressFrameElem) {
            const frameWidth = ProgressFrameElem.offsetWidth;
            const posX = getMousePos(e);
            const scale = posX / frameWidth;
            const time = videoElem.duration * scale;
            return time;
        }
        return 0;
    }, [videoElem, ProgressFrameElem, getMousePos]);

    const handleProgressClick = useCallback((e) => {
        videoElem.currentTime = getMousePosTime(e);
    }, [videoElem, getMousePosTime]);

    const handleProgressMouseMove = useCallback((e) => {
        const timeString = getTimeString(getMousePosTime(e));
        if(setHintTime) {
            setHintTime(timeString);
        }
    }, [getMousePosTime, getTimeString, setHintTime]);

    const handleProgressMouseDown = useCallback(() => {
        setProgressMouseDown(true)
    }, [setProgressMouseDown]);

    const handleProgressMouseUp = useCallback(() => {
        setProgressMouseDown(false)
    }, [setProgressMouseDown]);

    const handleProgressMouseEnter = useCallback(() => {
        setProgressMouseIn(true);
    }, []);

    const videoFrameMouseMove = useCallback((e) => {
        if(progressMouseDown) {
            videoElem.currentTime = getMousePosTime(e);
        }
    }, [progressMouseDown, videoElem, getMousePosTime]);

    const handleProgressMouseLeave = useCallback(() => {
        setProgressMouseIn(false);
    }, []);

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
        progressMouseIn,
        handleProgressClick,
        handleProgressMouseEnter,
        handleProgressMouseMove,
        handleProgressMouseLeave,
        handleProgressMouseDown,
        handleProgressMouseUp
    }
}

// 鍵盤操作
const useKeyboard = ({
    videoElem = null,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const keydownWithCurrentTimeChange = useCallback((moveTime = 0) => {
        if(videoElem) {
            const duration = videoElem.duration;
            const currentTime = videoElem.currentTime;
            let toTime = currentTime + moveTime;
            if(toTime < 0) {
                toTime = 0;
            } else if(toTime > duration) {
                toTime = duration;
            }
            videoElem.currentTime = toTime;
        }
    }, [videoElem]);

    const keydown = useCallback((e) => {
        if(e.code === "KeyL") {
            keydownWithCurrentTimeChange(10);
        } else if(e.code === "KeyJ") {
            keydownWithCurrentTimeChange(-10);
        } else if(e.code === "ArrowRight") {
            keydownWithCurrentTimeChange(5);
        } else if(e.code === "ArrowLeft") {
            keydownWithCurrentTimeChange(-5);
        }
    }, [keydownWithCurrentTimeChange]);

    const keyup = useCallback((e) => {
        if(functionKeyDown) {
            setFunctionKeyDown(false);
        }
    }, [functionKeyDown, setFunctionKeyDown]);

    useEffect(() => {
        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);

        return (() => {
            document.removeEventListener("keydown", keydown);
            document.removeEventListener("keyup", keyup);
        });
    }, [keydown, keyup]);
}

const VideoProgress = ({
    VideoFrameRef = null,
    videoRef = null,
    loadStart = false,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const ProgressRef = useRef();
    const ProgressFrameRef = useRef();
    const ProgressBufferedRef = useRef();
    const ProgressBarRef = useRef();
    const ProgressDotRef = useRef();
    const ProgressHintTimeBoxRef = useRef();

    // 進度條提示時間
    const {
        hintTime,
        setHintTime,
        setHintTimePos
    } = useHintTime({
        ProgressFrameElem: ProgressFrameRef.current,
        ProgressHintTimeBoxElem: ProgressHintTimeBoxRef.current
    });

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
        progressMouseIn,
        handleProgressClick,
        handleProgressMouseEnter,
        handleProgressMouseMove,
        handleProgressMouseLeave,
        handleProgressMouseDown,
        handleProgressMouseUp
    } = useMouse({
        setHintTime: setHintTime,
        setHintTimePos: setHintTimePos,
        VideoFrameElem: VideoFrameRef.current,
        videoElem: videoRef.current,
        ProgressFrameElem: ProgressFrameRef.current,
        ProgressHintTimeBoxElem: ProgressHintTimeBoxRef.current
    });

    // 鍵盤操作
    useKeyboard({
        videoElem: videoRef.current,
        functionKeyDown: functionKeyDown,
        setFunctionKeyDown: setFunctionKeyDown
    });

    return (
        <Progress
            ref={ProgressRef}
            onClick={handleProgressClick}
            onMouseEnter={handleProgressMouseEnter}
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={handleProgressMouseLeave}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
        >
            <ProgressHintTime
                className={classNames({
                    "-show": progressMouseIn
                })}
            >
                <ProgressHintTimeBox
                    ref={ProgressHintTimeBoxRef}
                >{hintTime}</ProgressHintTimeBox>
            </ProgressHintTime>
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