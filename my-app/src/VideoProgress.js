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
    }
`

// 進度條控制
const useVideoProgress = ({
    videoElem = null,
    loadStart = false,
    ProgressFrameElem = null,
    ProgressBarElem = null
}) => {
    const getProgressScale = useCallback(({
        time = 0
    }) => {
        if(videoElem) {
            const duration = videoElem.duration;
            return time / duration;
        }
        return 0;
    }, [videoElem]);

    const timeupdate = useCallback((e) => {
        if(videoElem && ProgressBarElem) {
            const progressScale = getProgressScale({
                time: videoElem.currentTime
            })
            ProgressBarElem.style.transform = `scaleX(${progressScale})`
        }
    }, [videoElem, ProgressBarElem, getProgressScale]);

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
    videoElem = null,
    ProgressFrameElem = null
}) => {
    const handleProgressClick = useCallback((e) => {
        if(videoElem && ProgressFrameElem) {
            const frameRect = ProgressFrameElem.getBoundingClientRect();
            const posX = e.clientX - frameRect.left;
            const scale = posX / ProgressFrameElem.offsetWidth;
            const time = videoElem.duration * scale
            videoElem.currentTime = time
        }
    }, [videoElem, ProgressFrameElem]);

    return {
        handleProgressClick
    }
}

const VideoProgress = ({
    videoRef = null,
    loadStart = false
}) => {
    const ProgressFrameRef = useRef();
    const ProgressBarRef = useRef();

    // 進度條控制
    useVideoProgress({
        videoElem: videoRef.current,
        loadStart: loadStart,
        ProgressFrameElem: ProgressFrameRef.current,
        ProgressBarElem: ProgressBarRef.current
    });

    const {
        handleProgressClick
    } = useMouse({
        videoElem: videoRef.current,
        ProgressFrameElem: ProgressFrameRef.current
    });

    return (
        <Progress
            onClick={handleProgressClick}
        >
            <ProgressFrame
                ref={ProgressFrameRef}
            >
                <ProgressBar
                    ref={ProgressBarRef}
                ></ProgressBar>
            </ProgressFrame>
        </Progress>
    );
}

export default VideoProgress;