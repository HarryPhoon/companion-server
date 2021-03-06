import React from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';

import ResponsiveDrawer from '../components/ResponsiveDrawer/ResponsiveDrawer';
import DialForm from '../components/Forms/DialForm';

const styles = theme => ({
  
});

class DialerPage extends React.Component {
  constructor(props) {
    super(props);
    // set the initial component state
    this.state = {
      title: 'Dialer',
      "data": {
        "type": "",
        "song": "",
        "verse": "",
        "psalmtext": "",
      },
      "message": {
        "type": "",
        "number": ""
      }
    };
    this.onMessage = this.onMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  };
  
  componentWillMount() {
    var query = "token=" +  JSON.parse(sessionStorage.getItem("jwt")).token;
    this.socket = new WebSocket("ws://localhost:3001/api/ws?" + query);
    this.socket.addEventListener("message", this.onMessage);
    query = null;
  }
  
  componentWillUnmount() {
    if (this.socket !== null) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  // Event based functions
  
  onMessage(event) {
    var data = JSON.parse(event.data);
    console.log(data);
    if (data.type === "song") {
      this.setState(prevState => ({ data: { type: data.type, song: data.id, verse: data.verse, psalmtext: ""}}));
    };
    
    if (data.type === "psalm") {
      this.setState(prevState => ({"data": { type: data.type, song: "", verse: "", "psalmtext": data.text}}));
    };
  }
  
  sendMessage(event) {
    var msg = {
      type: this.state.message.type,
      number: this.state.message.number
    }
    this.socket.send(JSON.stringify(msg));
    this.setState({ message: { type: "", number: ""}});
  }
  
  handleClick(event) {
    event.preventDefault();
    switch (event.target.id) {
      case 'number':
        if (this.state.message.type !== "") {
          var newNumber = event.target.value;
          this.setState(prevState => ({ message: { type: prevState.message.type, number: prevState.message.number.concat([newNumber]) }}));
        }
        break;
        
      case 'backspace':
        this.setState(prevState => ({ message: { type: prevState.message.type, number: prevState.message.number.slice(0, -1)}}));
        break;
        
      case 'init_song':
        if (this.state.message.type === "") {
          var newType = event.target.value;
          this.setState(prevState => ({ message: { type: prevState.message.type.concat([newType]), number: prevState.message.number }}));
        }
        else if (this.state.message.type === "song") {
          this.sendMessage();
        }
        break;
        
      case 'init_psalm':
        if (this.state.message.type === "") {
          var newType = event.target.value;
          this.setState(prevState => ({ message: { type: prevState.message.type.concat([newType]), number: prevState.message.number }}));
        }
        else if (this.state.message.type === "psalm") {
          this.sendMessage();
        }
        break;
      default:
        console.log("Error.")
        break;
    }
  }
  
  render() {
    const { classes } = this.props;
    
    return (
    <div className='page-parent'>
      <header className='navbar'>
        <ResponsiveDrawer title={this.state.title}/>
      </header>
      <Grid container justify='center' alignItems='center' direction='column' className='container-full'>
        <Grid item >
          <p>{this.state.data.song} {this.state.data.psalmtext}</p>
        </Grid>
        <Grid item className='container-dialer'>
          <DialForm data={this.state.message} onClick={this.handleClick} onSubmit={this.sendMessage} />
        </Grid>
      </Grid>
    </div>
    )
  }
}

export default withStyles(styles)(DialerPage);

/*
<Card className={classes.card}>
  <CardContent>
      <TextField className={classes.textField} value={this.state.data.number} margin="normal" />
      <TextField className={classes.textField} value={this.state.data.psalmtext} margin="normal" />
      <TextField className={classes.textField} value={this.state.temporary} margin="normal" />
  </CardContent>
</Card>
*/
