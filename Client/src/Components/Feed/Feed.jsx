import React from "react";
import { FeedPicture } from "./FeedPicture.jsx";
import { Text, View, ScrollView } from "react-native";
import "./Feed.css";
import { newest } from "../../server";

const axios = require("axios");

export class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      json: [],
      feedPictures: []
    };
    this.onClick = props.onclick;
    this.serarchFav = props.serarchFav;
  }

  componentDidMount() {
    this.getPost();
  }

  jsonToHTML() {
    for (var i =0; i <this.state.json.length;i++) {
      console.log(this.state.json[i]);
      var x = this.state.json[i];
      this.setState(prevState => {
        return {
          feedPictures: prevState.feedPictures.concat(
            <View key={x["_id"]} className="item">
              <FeedPicture
                videoId={x["link"]}
                id={x["_id"]}
                onclick={this.onClick}
              />
              <Text id="text" className="text">
                <h4>{x["title"]}</h4>
                <font size="1">by: {x["author_name"]}</font>
                <p className="FeedP">{x["text"]}</p>
              </Text>
            </View>
          )
        };
      });
    }
  }

  async getPost() {
    await axios.get(newest).then(response => {
      this.setState({ json: response.data });
    });
    await this.jsonToHTML();
  }

  render() {
    return (
      <div id="feedRoot">
        <ScrollView
          horizontal={true}
          className="FeedScrollView"
          showsHorizontalScrollIndicator={false}
        >
          {this.state.feedPictures}
        </ScrollView>
      </div>
    );
  }
}
