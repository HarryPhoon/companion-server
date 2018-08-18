import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import AppDrawer from '../components/ResponsiveDrawer/ResponsiveDrawer';
import DialForm from '../components/Forms/DialForm';
import ErrorForm from '../components/Forms/ErrorForm';

import AuthService from '../services/AuthService';

const styles = theme => ({
  
});

class DialerPage extends React.Component {
  constructor(props) {
    super(props);
    // set the initial component state
    this.state = {
      "title": "Dialer",
      "data": {
        "type": "",
        "song": "",
        "verse": "",
        "activeverse": "",
        "psalmtext": "",
      },
      "message": {
        "type": "",
        "number": "",
        "verse": [],
      },
      "status": {
        "isLoggedIn": false,
        "isError": false
      }
    };
    this.onMessage = this.onMessage.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onError = this.onError.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.openConnection = this.openConnection.bind(this);
    this.menuActions = this.menuActions.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  };
  
  componentDidMount() {
    AuthService.verifyToken((valid, message) => {
      if (valid) {
        this.openConnection();
        this.verifyToken();
        AuthService.getUserData();
      }
      else {
        console.log(message);
	      this.props.history.push('/');
      }
    })
  }

  componentWillUnmount() {
    if (this.socket != null || this.socket != undefined) {
      this.socket.close();
      this.socket = null;
    }
    console.log(this.verificationTimer);
    if (this.verificationTimer != null || this.verificationTimer != undefined) {
      this.verificationTimer = null;
    }
  }
  
  // Event based functions
  
  onMessage(event) {
    var data = JSON.parse(event.data);
    if (data.type === "song") {
      this.setState(prevState => ({
        data: {
          type: data.type,
          song: data.id,
          verse: data.verse,
          activeverse: data.activeverse,
          psalmtext: null
        }
      }));
    }
    
    if (data.type === "psalm") {
      this.setState(prevState => ({
        data: {
          type: data.type,
          song: null,
          verse: null,
          activeverse: null,
          psalmtext: data.psalmtext
        }
      }));
    }
    
    if (data.type === "verse") {
      this.setState(prevState => ({
        data: {
          type: prevState.data.type,
          song: prevState.data.song,
          verse: data.verse,
          activeverse: data.activeverse,
          psalmtext: prevState.data.psalmtext
        }
      }));
    }
    
    if (data.type === "blank") {
      this.setState(prevState => ({
        data: {
          type: null,
          song: data.id,
          verse: data.verse,
          activeverse: data.activeverse,
          psalmtext: null
        }
      }))
    }
  }
  
  onError(event) {
    // this.props.history.push("/auth/login");
    this.setState(prevState => ({
      status: {
        isLoggedIn: prevState.status.isLoggedIn,
        isConnected: prevState.status.isConnected,
        isError: true,
      }
    }));
  }
  
  onOpen(event) {
    this.setState(prevState => ({
      status: {
        isLoggedIn: true,
        isConnected: true,
        isError: false
      }
    }))
  }
  
  onClose(event) {
    this.verifyToken();
    this.setState(prevState => ({
      status: {
        isLoggedIn: prevState.status.isLoggedIn,
        IsConnected: false,
        isError: prevState.status.isError
      }
    }))
  }

  verifyToken() {
    AuthService.verifyToken((valid, message) => {
      if (valid) {
        this.setState(prevState => ({
          status: {
            isLoggedIn: true,
            isConnected: prevState.status.isConnected,
            isError: prevState.status.isError
          }
        }));
        this.verificationTimer = setTimeout(this.verifyToken, 30000);
      }
      else {
        this.setState(prevState => ({
          status: {
            isLoggedIn: false,
            isConnected: prevState.status.isConnected,
            isError: prevState.status.isError
          },
        }))
        this.verificationTimer = null;
      }
    })
  }
  
  openConnection() {
    var query = "token=" +  AuthService.getToken();
    
    try {
      this.socket = new WebSocket("ws://localhost:3001/api/ws?" + query);
    }
    finally {
      if (this.socket != undefined) {
        this.socket.onopen = this.onOpen;
        this.socket.onerror = this.onError;
        this.socket.onclose = this.onClose;
        this.socket.onmessage = this.onMessage;
      }
    }
    
  }
  
  sendMessage(event) {
    if (this.state.message.type === "song" || this.state.message.type === "psalm") {
      var msg = {
        type: this.state.message.type,
        number: this.state.message.number,
        verse: this.state.message.verse
      }
      this.socket.send(JSON.stringify(msg));
      this.setState({ message: { type: "", number: "", verse: ""}});
    }
    else if (event.type === "verse") {
      this.socket.send(JSON.stringify(event));
    }
  }
  
  handleClick(event) {
    event.preventDefault();
    var message = this.state.message;
    switch (event.target.id) {
      case 'number':
        if (message.type !== "") {
          if (message.number.length < 3) {
            var newNumber = event.target.value;
            this.setState(prevState => ({
              message: {
                type: prevState.message.type,
                number: prevState.message.number.concat([newNumber]),
              }
            }));
          }
        }
        break;
        
      case 'backspace':
        this.setState(prevState => ({
          message: {
            type: prevState.message.type,
            number: prevState.message.number.slice(0, -1),
            verse: prevState.message.verse
          }
        }));
        break;
        
      case 'delete':
        let blankMessage = {
          type: "blank"
        };
        this.socket.send(JSON.stringify(blankMessage));
        break;
        
      case 'init_song':
        if (message.type === "") {
          var newType = event.target.value;
          this.setState(prevState => ({
            message: {
              type: prevState.message.type.concat([newType]),
              number: prevState.message.number,
              verse: prevState.message.verse
            }
          }));
        }
        else if (message.type === "song" && message.number != "") {
          this.sendMessage();
        }
        else {
          this.setState({ message: { type: "", number: "", verse: ""}});
        }
        break;
        
      case 'init_psalm':
        if (message.type === "") {
          var newType = event.target.value;
          this.setState(prevState => ({
            message: {
              type: prevState.message.type.concat([newType]),
              number: prevState.message.number,
              verse: prevState.message.verse
            }
          }));
        }
        else if (message.type === "psalm" && message.number != "") {
          this.sendMessage();
        }
        else {
          this.setState({ message: { type: "", number: "", verse: ""}});
        }
        break;
        
      case 'verse':
        var newType = event.target.id;
        var message = {};
        if (this.state.data.activeverse == undefined || this.state.data.activeverse.indexOf(parseInt(event.target.value)) === -1) {
          message = {
            type: event.target.id,
            subtype: "add",
            verse: event.target.value
          }
        }
        else {
          message = {
            type: event.target.id,
            subtype: "del",
            verse: event.target.value
          }
        }
        this.sendMessage(message);
        break;
        
      default:
        console.log("Error.")
        break;
    }
  }
  
  menuActions(event) {
    event.preventDefault();

    switch (event.target.id) {
      case "reconnect":
      try {
        this.socket.close();
        this.socket = null;
      }
      finally {
        this.openConnection();
      }
        break;
      case "relogin":
        var token = AuthService.getToken();
        var body = { token: token };
        
        fetch('http://90.178.223.199:50505/api/relogin', {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
          .then(response => {
            if (response.success) {
              AuthService.setToken(response.token);
              this.props.history.push('/app');
            }
            else {
              this.props.history.push('/');
            }
          })
        break;
    }
  }
  render() {
    const { classes } = this.props;
    
    let drawerOnClick = {
      login: () => {this.props.history.push("/")},
      reconnect: () => {
        if (this.socket != undefined || this.socket != null) {
          try {
            this.socket.close();
          }
          finally {
            this.openConnection()
          }
        }
        else this.openConnection()
      }
    };
    
    return (
    <div className='page-parent'>
      <header className='navbar'>
        <AppDrawer title={this.state.data.song ? (this.state.data.song) : (this.state.data.psalmtext)} status={this.state.status} onClick={this.menuActions}/>
      </header>
      <Grid container justify='center' alignItems='center' direction='column' spacing='16' className='container-full'>
        <Grid item className='container-dialer'>
          {(this.state.error ?
            <ErrorForm onClick={this.openConnection} />
            :
            <DialForm message={this.state.message} data={this.state.data} onClick={this.handleClick} onSubmit={this.sendMessage} />
          )}
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
