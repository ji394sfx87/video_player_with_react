import React, {
    useState,
    useEffect,
    useCallback,
} from "react";
import styled from "styled-components";

const TimeFont = styled.div`
    font-size: 14px;
    font-family: Arial;
`

const TimerTime = styled(TimeFont)`
    position: relative;
    display: block;
    flex: 0 0 auto;
    white-space: nowrap;
`

const TimerSeperate = styled(TimeFont)`
    position: relative;
    display: block;
    flex: 0 0 auto;
    margin: 0 5px;
    white-space: nowrap;
`

const Timer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #ddd;
`

// 影片時間控制
const useTimer = ({
    videoElem = null,
    loadStart = false
}) => {
    const [currentTime, setCurrentTime] = useState('');
    const [durationTime, setDurationTime] = useState('');

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

    const timeupdate = useCallback(() => {
        if(videoElem) {
            const videoCurrentTimeFormat = getTimeString(videoElem.currentTime);
            setCurrentTime(videoCurrentTimeFormat);
        }
    }, [videoElem, getTimeString]);

    useEffect(() => {
        if(videoElem) {
            const timeFormat = getTimeString(videoElem.duration);
            setDurationTime(timeFormat);
        }
    }, [videoElem, loadStart, getTimeString]);

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

    useEffect((e) => {
        if(loadStart) {
            timeupdate();
        }
    }, [loadStart, timeupdate]);

    return {
        currentTime,
        durationTime
    };
}

const VideoTimer = ({
    videoRef = null,
    loadStart = false
}) => {
    // 影片時間控制
    const {
        currentTime,
        durationTime
    } = useTimer({
        videoElem: videoRef.current,
        loadStart: loadStart
    });

    return (
        <Timer>
            <TimerTime>{currentTime}</TimerTime>
            <TimerSeperate>/</TimerSeperate>
            <TimerTime>{durationTime}</TimerTime>
        </Timer>
    );
}

export default VideoTimer;