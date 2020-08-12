import React, {Component} from "react";
import {Link} from "react-router-dom";
import {MDBContainer} from "mdbreact";

export default class GroupPolls extends Component {
  constructor(props){//shouldn't this be dependent on the class???? thats why i included a constructor.
    super(props);
    //need to connect to backend probably here and then store data until it can be stored in state.
    //problem is there is no find in backend rn... frontend could do find but probably more resource intensive?
    this.state = {
      //need to put in groupID from backend
      //need to get other shit like pollIDs and their respective information...
    };
  }
  componentDidMount(){
    this.props.updateTitle("Polls");
  }
  render() {
    return (
      <MDBContainer className="page">
        <p className="width-90 fontSizeLarge">
                    Welcome to the polls page!
        </p>

        <Link to={"/PollEditor/123"}>
          <button className="btn button">Lesson 123</button>
        </Link>
        <Link to={"/PollEditor/420"}>
          <button className="btn button">Lesson 420</button>
        </Link>
        <Link to={"/PollEditor/666"}>
          <button className="btn button">Lesson 666</button>
        </Link>

      </MDBContainer>
    );
  }
}