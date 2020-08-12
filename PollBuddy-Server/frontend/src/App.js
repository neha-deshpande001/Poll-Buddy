import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {MDBContainer} from "mdbreact";

import Group from "./pages/Groups/Groups";
import Homepage from "./pages/Homepage/Homepage";
import Login from "./pages/Login/Login";
import GroupCreation from "./pages/GroupCreation/GroupCreation";
import GroupPolls from "./pages/GroupPolls/GroupPolls";
import PollEditor from "./pages/PollEditor/PollEditor";
import Notfound from "./pages/Error404/Error404";
import Template from "./pages/Template/Template";
import FAQ from "./pages/FAQ/FAQ";
import AccountInfo from "./pages/AccountInfo/AccountInfo";
import Privacy from "./pages/Privacy/Privacy";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import RegisterDefault from "./pages/RegisterDefault/RegisterDefault";
import RegisterWithSchool from "./pages/RegisterWithSchool/RegisterWithSchool";
import RegisterWithPollBuddy from "./pages/RegisterWithPollBuddy/RegisterWithPollBuddy";
import PollViewer from "./pages/PollViewer/PollViewer";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import PollDataView from "./pages/PollResults/PollResults";

import Header from "./components/header/header.js";
import Footer from "./components/footer/footer.js";

import "./styles/main.scss";
import groupEditor from "./components/groupEditor/groupEditor";

export default class App extends React.Component {

  state = {
    pageTitle: "",
    userInfo: {
      sessionIdentifier: ""
    }
  };

  updateTitle(t) {
    this.setState({pageTitle: t});
    document.title = t + " - Poll Buddy";
  }

  render() {
    this.updateTitle = this.updateTitle.bind(this);
    return (
      <BrowserRouter>

        <MDBContainer id="wrapper">

          <Header title={this.state.pageTitle} userInfo={this.state.userInfo} />

          {/*
            Using React BrowserRouter now

            See https://codeburst.io/getting-started-with-react-router-5c978f70df91
            We will likely want to nest a lot of these later, this link has some details how
          */}

          <Switch>
            <Route exact path="/">
              <Homepage updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/privacy">
              <Privacy updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/faq">
              <FAQ updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/groups">
              <Group updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/groups/polls">
              <GroupPolls updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/groups/new">
              <GroupCreation updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/poll/:pollID/view">
              <PollViewer updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/pollEditor/:pollID/edit">
              <PollEditor updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/polls/:pollID/results">
              <PollDataView updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/login">
              <Login updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/login/forgot">
              <ForgotPassword updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/login/reset">
              <ResetPassword updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/register">
              <RegisterDefault updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/register/school">
              <RegisterWithSchool updateTitle={this.updateTitle} />
            </Route>
            <Route exact path="/register/pollbuddy">
              <RegisterWithPollBuddy updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/account">
              <AccountInfo updateTitle={this.updateTitle} />
            </Route>

            <Route exact path="/template">
              <Template updateTitle={this.updateTitle} />
            </Route>

            {/* Default route/error page */}
            <Route>
              <Notfound updateTitle={this.updateTitle} />
            </Route>
          </Switch>

          <Footer/>

        </MDBContainer>

      </BrowserRouter>

    );
  }
}
