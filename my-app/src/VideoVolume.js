import React, {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";
import styled from "styled-components";

const VolumeValue = styled.div`
    position: relative;
    display: block;
    width: 8px;
    height: 100%;
    background-color: #fff;
`

const VolumeDot = styled.div`
    position: absolute;
    top: -7px;
    left: 0;
    right: 0;
    margin: auto;
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #fff;
`

const VolumeBarFrame = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 6px;
    height: 100%;
    background-color: rgba(255,255,255,0.2);
    border-radius: 4px;
`

const VolumeBar = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
`

const Volume = styled.div`
    position: absolute;
    bottom: 100%;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
    width: 100%;
    height: 100px;
    background-color: rgba(0,0,0,0.6);
    box-sizing: border-box;
    cursor: default;
    opacity: 0;
    pointer-events: none;
    transform: translateY(20%);
    transition: opacity .3s, transform .3s;
`

const ButtonFrame = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`

const VolumeButton = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    &:hover {
        ${Volume} {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }
    }
`

// 音量控制
const useVolume = ({
    videoElem = null
}) => {
    const [volume, setVolume] = useState(1);
    const [muteStatus, setMuteStatus] = useState(false);

    useEffect(() => {
        if(videoElem) {
            videoElem.volume = volume;
        }
    }, [videoElem, volume]);

    useEffect(() => {
        if(videoElem) {
            if(muteStatus) {
                videoElem.muted = true;
            } else {
                videoElem.muted = false;
            }
        }
    }, [videoElem, muteStatus]);

    const handleMute = useCallback(() => {
        setMuteStatus(!muteStatus)
    }, [muteStatus])

    return {
        volume,
        setVolume,
        muteStatus,
        setMuteStatus,
        handleMute
    }
}

// 滑鼠控制
const useMouse = ({
    videoElem = null,
    VolumeBarElem = null,
    VolumeValueElem = null,
    VolumeDotElem = null,
    volume = 1,
    setVolume = null,
    muteStatus = false,
    setMuteStatus = null
}) => {
    const [mouseDown, setMouseDown] = useState(false);

    useEffect(() => {
        if(VolumeBarElem) {
            const total = VolumeBarElem.offsetHeight;
            const move = total - total * volume;

            if(VolumeValueElem) {
                if(muteStatus) {
                    VolumeValueElem.style.transform = `translateY(${total}px)`;
                } else {
                    VolumeValueElem.style.transform = `translateY(${move}px)`;
                }
            }

            if(VolumeDotElem) {
                if(muteStatus) {
                    VolumeDotElem.style.transform = `translateY(${total}px)`;
                } else {
                    VolumeDotElem.style.transform = `translateY(${move}px)`;
                }
            }
        }
    }, [VolumeBarElem, VolumeValueElem, VolumeDotElem, volume, muteStatus]);

    const countVolume = useCallback(({
        pos = 0
    }) => {
        let posScale = 1
        if(VolumeBarElem) {
            if(pos >= 0 && pos < VolumeBarElem.offsetHeight) {
                posScale = 1 - pos / VolumeBarElem.offsetHeight;
            } else if(pos < 0) {
                posScale = 0
            } else if(pos >= VolumeBarElem.offsetHeight) {
                posScale = 0
            }
        }
        return posScale;
    }, [VolumeBarElem]);

    const handleMouseDown = useCallback((e) => {
        setMouseDown(true);
        if(VolumeBarElem) {
            if(muteStatus) {
                setMuteStatus(false);
            }
            const VolumeBarElemRect = VolumeBarElem.getBoundingClientRect();
            const volumeResult = countVolume({
                pos: e.clientY - VolumeBarElemRect.top
            });
            setVolume(volumeResult);
        }
    }, [VolumeBarElem, setVolume, countVolume, muteStatus, setMuteStatus]);

    const handleMouseMove = useCallback((e) => {
        if(VolumeBarElem && mouseDown) {
            const VolumeBarElemRect = VolumeBarElem.getBoundingClientRect();
            let posY = e.clientY - VolumeBarElemRect.top;
            if(posY >= VolumeBarElem.offsetHeight) {
                posY = VolumeBarElem.offsetHeight;
            } else if (posY <= 0) {
                posY = 0;
            }
            const volumeResult = countVolume({
                pos: posY
            });
            setVolume(volumeResult);
        }
    }, [VolumeBarElem, mouseDown, setVolume, countVolume]);

    const handleMouseUp = useCallback((e) => {
        setMouseDown(false);
    }, [setMouseDown]);

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    }
}

// 鍵盤操作
const useKeyboard = ({
    volume = 0,
    setVolume = null,
    muteStatus = false,
    setMuteStatus = null,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const keydownWithMute = useCallback(() => {
        setMuteStatus(!muteStatus);
        if(setFunctionKeyDown) {
            setFunctionKeyDown(true);
        }
    }, [muteStatus, setMuteStatus, setFunctionKeyDown]);

    const keydownWithVolumeChange = useCallback((type) => {
        let fixVolume = 0.1;
        if(type === "minus") {
            fixVolume = -0.1;
        }
        let newVolume = volume + fixVolume;
        if(newVolume >= 0 && newVolume <= 1) {
            setVolume(newVolume);
        } else if(newVolume < 0) {
            setVolume(0);
        } else {
            setVolume(1);
        }
        if(setFunctionKeyDown) {
            setFunctionKeyDown(true);
        }
    }, [volume, setVolume, setFunctionKeyDown]);

    const keydown = useCallback((e) => {
        if(e.code === "KeyM") {
            keydownWithMute();
        } else if(e.code === "ArrowUp") {
            keydownWithVolumeChange("plus");
        } else if(e.code === "ArrowDown") {
            keydownWithVolumeChange("minus");
        }
    }, [keydownWithMute, keydownWithVolumeChange]);

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

const VideoVolume = ({
    videoRef = null,
    functionKeyDown = false,
    setFunctionKeyDown = null
}) => {
    const VolumeBarRef = useRef();
    const VolumeValueRef = useRef();
    const VolumeDotRef = useRef();

    // 音量控制
    const {
        volume,
        setVolume,
        muteStatus,
        setMuteStatus,
        handleMute
    } = useVolume({
        videoElem: videoRef.current,
    });

    // 滑鼠控制
    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    } = useMouse({
        videoElem: videoRef.current,
        VolumeBarElem: VolumeBarRef.current,
        VolumeValueElem: VolumeValueRef.current,
        VolumeDotElem: VolumeDotRef.current,
        volume: volume,
        setVolume: setVolume,
        muteStatus: muteStatus,
        setMuteStatus: setMuteStatus
    });

    // 鍵盤操作
    useKeyboard({
        volume: volume,
        setVolume: setVolume,
        muteStatus: muteStatus,
        setMuteStatus: setMuteStatus,
        functionKeyDown: functionKeyDown,
        setFunctionKeyDown: setFunctionKeyDown
    });

    return (
        <VolumeButton>
            <ButtonFrame
                title={muteStatus ? '解除靜音' : '靜音'}
                onClick={handleMute}
            >
                {muteStatus &&
                    <svg viewBox="0 0 36 36">
                        <path d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z" fill="currentColor"></path>
                    </svg>
                }
                {!muteStatus &&
                    <svg viewBox="0 0 36 36">
                        <defs>
                            <clipPath id="svg-volume-mask">
                                <path d="m 14.35,-0.14 -5.86,5.86 20.73,20.78 5.86,-5.91 z"></path>
                                <path d="M 7.07,6.87 -1.11,15.33 19.61,36.11 27.80,27.60 z"></path>
                                <path d="M 9.09,5.20 6.47,7.88 26.82,28.77 29.66,25.99 z" transform="translate(0, 0)"></path>
                            </clipPath>
                            <clipPath id="svg-volume-slash-mask">
                                <path d="m -11.45,-15.55 -4.44,4.51 20.45,20.94 4.55,-4.66 z" transform="translate(0, 0)"></path>
                            </clipPath>
                        </defs>
                        <path clipPath="url(#svg-volume-mask)" d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z" fill="currentColor"></path>
                    </svg>
                }
            </ButtonFrame>
            <Volume>
                <VolumeBar
                    ref={VolumeBarRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <VolumeBarFrame>
                        <VolumeValue
                            ref={VolumeValueRef}
                        ></VolumeValue>
                    </VolumeBarFrame>
                    <VolumeDot
                        ref={VolumeDotRef}
                    ></VolumeDot>
                </VolumeBar>
            </Volume>
        </VolumeButton>
    );
}

export default VideoVolume;