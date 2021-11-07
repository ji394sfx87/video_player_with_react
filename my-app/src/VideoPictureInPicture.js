import React, {
    useState,
    useEffect,
    useCallback
} from "react";
import styled from "styled-components";

const PictureInPicture = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`

const usePictureInPicture = ({
    videoElem = null
}) => {
    const [picInPicStatus, setPicInPicStatus] = useState(false);

    useEffect(() => {
        if(videoElem && document.pictureInPictureEnabled) {
            if(picInPicStatus) {
                videoElem.requestPictureInPicture();
            } else if(document.pictureInPictureElement) {
                document.exitPictureInPicture();
            }
        }
    }, [videoElem, picInPicStatus]);

    const enterpictureinpicture = useCallback(() => {
        if(videoElem) {
            setPicInPicStatus(true);
        }
    }, [videoElem]);

    const leavepictureinpicture = useCallback(() => {
        if(videoElem) {
            setPicInPicStatus(false);
        }
    }, [videoElem]);

    useEffect(() => {
        if(videoElem) {
            videoElem.addEventListener("enterpictureinpicture", enterpictureinpicture);
            videoElem.addEventListener("leavepictureinpicture", leavepictureinpicture);
        }

        return (() => {
            if(videoElem) {
                videoElem.removeEventListener("enterpictureinpicture", enterpictureinpicture);
                videoElem.removeEventListener("leavepictureinpicture", leavepictureinpicture);
            }
        })
    }, [videoElem, enterpictureinpicture, leavepictureinpicture]);

    const handleClick = useCallback(() => {
        setPicInPicStatus(!picInPicStatus);
    }, [picInPicStatus]);

    return {
        picInPicStatus,
        setPicInPicStatus,
        handleClick
    }
}

// 鍵盤操作
const useKeyboard = ({
    picInPicStatus = false,
    setPicInPicStatus = null,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const keydownWithPicInPic = useCallback(() => {
        setPicInPicStatus(!picInPicStatus);
    }, [picInPicStatus, setPicInPicStatus]);

    const keydown = useCallback((e) => {
        if(e.code === "KeyI") {
            keydownWithPicInPic();
        }
    }, [keydownWithPicInPic]);

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

const VideoPictureInPicture = ({
    videoRef = null,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const {
        picInPicStatus,
        setPicInPicStatus,
        handleClick
    } = usePictureInPicture({
        videoElem: videoRef.current
    });

    // 鍵盤操作
    useKeyboard({
        picInPicStatus: picInPicStatus,
        setPicInPicStatus: setPicInPicStatus,
        functionKeyDown: functionKeyDown,
        setFunctionKeyDown: setFunctionKeyDown
    });

    return (
        <PictureInPicture
            title={picInPicStatus ? "關閉子母畫面(I)" : "子母畫面(I)"}
            onClick={handleClick}
        >
            <svg viewBox="0 0 36 36">
                <path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="currentColor"></path>
            </svg>
        </PictureInPicture>
    );
}

export default VideoPictureInPicture;