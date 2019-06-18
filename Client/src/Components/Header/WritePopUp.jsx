import React from "react";
import ReactModal from "react-modal";
import {
  NormalButton,
  ExitButton,
  ShareButton
} from "../StyledButton/StyledButton";
import DataInput from "../StyledInput/StyledInput";
import FormControl from "@material-ui/core/FormControl";
import "./Header.css";
import TagManager from "../TagManager/TagManager.jsx";
import { Tab, TabList, Tabs, TabPanel } from "react-tabs";
import TreeWrite from "./TreeWrite.jsx";
import { post, section } from "../../server";
import { AutoComplete } from "@progress/kendo-react-dropdowns";


const axios = require("axios");
export class WritePopUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      link: "",
      text: "",
      tags: [],
      ort: "",
      suggestions: [{ name: "Ort", _id: null }]
    };
    this.main = props.showModal;
    this.handleCloseModal = props.handleCloseModal;
    this.handleOpenModal = props.handleOpenModal;
    this.updateInput = this.updateInput.bind(this);
    this.post = this.post.bind(this);
  }
  componentDidMount() {
	this.getAllSections();
  }
  async getAllSections() {
	  await axios.get(section).then(avc=>{
      this.setState({suggestions: avc.data})

   });
  }
  getCookie() {
    var cookieList = document.cookie ? document.cookie.split(";") : [];
    var cookieValues = {};
    for (var i = 0, n = cookieList.length; i !== n; ++i) {
      var cookie = cookieList[i];
      var f = cookie.indexOf("=");
      if (f >= 0) {
        var cookieName = cookie.substring(0, f);
        var cookieValue = cookie.substring(f + 1);

        console.log("cookieName=" + cookieName + " cookieValue=" + cookieValue);

        if (!cookieValues.hasOwnProperty(cookieName)) {
          cookieValues[cookieName] = cookieValue;
        }
      }
    }
    return cookieValues;
  }

  //TODO: Aufräumen
  async post() {
    var cookieList = await this.getCookie();
    fetch(post, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify({
        title: this.state.title,
        link: this.state.link,
        text: this.state.text,
        post_date: new Date(),
        tags: this.state.tags,
        author: cookieList[" user"],
        section: this.state.suggestions.find(e => e.name === this.state.ort)
          ._id,
        token: cookieList[" token"]
      })
    });
  }

  updateTags = tags => {
    console.log(`Added new Tags ${tags}`);
    this.setState({ tags: tags });
  };
  render() {
    return (
      <div>
        <ShareButton onClick={this.handleOpenModal} />
        <ReactModal
          isOpen={this.main.state.showWriteModal}
          contentLabel="Minimal Modal Example"
          className="Modal"
          overlayClassName="Overlay"
          onRequestClose={this.handleCloseModal}
        >
          <ExitButton onClick={this.handleCloseModal} /> <br />
          <Tabs>
            <TabList>
              <Tab>Post</Tab>
              <Tab>Tree</Tab>
            </TabList>
            <TabPanel>
              <FormControl className="Posting">
                <br />
                <b id="formText">Titel</b>
                <br />
                <DataInput
                  placeholder="Title"
                  name="title"
                  onChange={this.updateInput}
                />
                <br />
                <b id="formText">Beschreibung</b>
                <br />
                <DataInput
                  placeholder="Text"
                  name="text"
                  onChange={this.updateInput}
                />
                <br />
                <b id="formText">Link</b>
                <br />
                <DataInput
                  placeholder="https://www.youtube.com/watch?v=example"
                  name="link"
                  onChange={this.updateInput}
                />
                <br />
                <b id="formText">Section</b>
                <br />
                  <AutoComplete
                    data={this.state.suggestions
                      .map(s => s.name)
                      .filter(s => s.includes(this.state.ort))}
                    placeholder="Ort"
                    name="ort"
                    onChange={this.updateInput}
                    id="Input"
                    className="k-Input"/>
             
                <br />
                <b id="formText">Tags</b>
                <br />
                <TagManager onFinish={this.updateTags} />
                <br />
              </FormControl>
              <br />
              <div>
                <NormalButton
                  text="Posten"
                  onClick={this.post}
                  className="Poster"
                />
              </div>
            </TabPanel>
            <TabPanel>
              <TreeWrite close={this.handleCloseModal} />
            </TabPanel>
          </Tabs>
        </ReactModal>
      </div>
    );
  }

  updateInput(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
}
