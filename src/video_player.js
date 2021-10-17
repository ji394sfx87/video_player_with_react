class VideoPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>Video Player</div>
        );
    }
}

const videoPlayerContainer = document.querySelector('#video_player');
ReactDOM.render(
    <VideoPlayer/>,
    videoPlayerContainer
);