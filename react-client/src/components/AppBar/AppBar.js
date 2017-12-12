import React from 'react';
import AppBarMUI from 'material-ui/AppBar';
import Drawer from './Drawer';

const styles = {
  appbar: {
    height: 60,
    "padding-right": 65,
    margin: 0,
    button: {
      "margin-top": "0",
    },
  },
  appbar_title: {
    "align-self": "centre",
  }
};

export default class AppBar extends React.Component {

constructor(props) {
  super(props);
  this.state = {
    open: false
  }
  this.props = {
    title: ""
  }
  this.toggleDrawer = this.toggleDrawer.bind(this);
  this.handleClose = this.handleClose.bind(this);
}
// Toggle function (open/close Drawer)
toggleDrawer() {
  this.setState({
    open: !this.state.open
  })
}

handleClose() {
  this.setState({
    open: false
  })
}

render() {
  return (
    <div>
      <AppBarMUI title={this.props.title} style={styles.appbar} titleStyle={styles.appbar_title} onLeftIconButtonClick={this.toggleDrawer}/>
      <Drawer open={this.state.open} handleClose={this.handleClose} onToggleDrawer={this.toggleDrawer}/>
    </div>)
}
}