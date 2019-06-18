import React from "react";
import { NormalButton } from "../StyledButton/StyledButton";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import {postAll} from "../../server";

const axios = require("axios");


export default class TreeAdd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      hasLevel: false,
      suggestions: [],
      title: "",
      id: -1,
      search: "",
      posts:[]
    };
    this.onClick = props.createNodeForLevel;
    this.addChild = props.addChild;
    }

  componentDidMount() {
    this.getPost()

  }
  async getPost() {
    await axios.get(postAll).then(avc => {
      this.setState({suggestions: avc.data.map(e => e.title),posts:avc.data});
    });
  };

  createNode = () => {
    let id = this.state.posts.filter(
      e => this.state.search === e.title
    )[0]._id;
    if (this.state.search !== null)
      this.setState((state, props) => ({
        active: true,
        title: state.search,
        id: id
      }));
    console.log(id);
    this.onClick({"id":id,"title":this.state.search});
  };
  render() {
	  
    if (!this.state.active)
      return (
        <td>
          <center>
            <AutoComplete
              data={this.state.suggestions.filter(s =>
                s.includes(this.state.search)
              )}
              placeholder="e.g. React"
              onChange={e => this.setState({ search: e.target.value })}
			  className="TreeAdd"
            />
            <NormalButton
              text="Add Node"
              className="rootNode"
              onClick={this.createNode}
            />
          </center>
        </td>
      );
    return (
      <td>
        <center>{this.state.title}</center>
        {!this.state.hasLevel ? (
          <NormalButton
            text="Add Level"
            className="rootNode"
            onClick={() => {
              this.setState({ hasLevel: true });
              this.addChild(this.state.id);
            }}
          />
        ) : (
          ""
        )}
      </td>
    );
  }
}
