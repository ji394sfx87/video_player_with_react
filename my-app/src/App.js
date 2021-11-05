import styled from "styled-components";
import Video from "./Video";

const VideoPlayer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: #fff;
`

const VideoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1200px;
  height: 640px;
  max-width: 100%;
  max-height: 100%;
  background-color: #000;
`

function App() {
  return (
    <VideoPlayer>
      <VideoContainer>
        <Video src="/example2.mp4"/>
      </VideoContainer>
    </VideoPlayer>
  );
}

export default App;
