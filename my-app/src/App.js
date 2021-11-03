import styled from "styled-components";

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

  video {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
`

function App() {
  return (
    <VideoPlayer>
      <VideoContainer>
        <video controls>
          <source src="/example.mp4" type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </VideoContainer>
    </VideoPlayer>
  );
}

export default App;
