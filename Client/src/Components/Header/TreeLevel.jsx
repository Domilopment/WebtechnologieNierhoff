import React from "react";
import TreeAdd from "./TreeAdd";

export default class TreeLevel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      nodes: [
        <TreeAdd
          createNodeForLevel={this.createNode}
          addChild={this.createLevel}
        />
      ]
    };
    this.limit = props.limit;
    this.onClick = props.onClick;
    this.parent = props.parent;
  }
  createNode = () => {
    console.log("creating node for this level");
    if (this.limit)
      this.setState((state, props) => ({
        nodes: state.nodes.concat([
          <TreeAdd
            createNodeForLevel={this.createNode}
            addChild={this.createLevel}
          />
        ])
      }));
  };

  createLevel = node_id => {
    console.log(`Creating new level for ${node_id}`);
    this.setState((state, props) => ({
      active: true
    }));
    this.onClick(node_id);
    console.table(this.state);
  };
  render() {
    return (
      <tr>
        <center>
          {
            //this.state.nodes.length < 1 ? (
            //<NormalButton
            //text="Add Level"
            //className="rootNode"
            //onClick={() => this.createLevel(this.parent)}
            //>
            //) : (
            this.state.nodes
          }
        </center>
      </tr>
    );
  }
}
