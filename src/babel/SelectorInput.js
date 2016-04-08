var SelectorInput = React.createClass({
  getInitialState: function() {    
    return {
      lastValue: "",
      msRemaining: 0,
      url: ""
    }
  },
  
  tick: function() {
    this.setState({
      msRemaining: ((this.state.msRemaining * 10) - 1) / 10
    });
    
    if (this.state.msRemaining <= 0) {
      clearInterval(this.interval);
      
      this.setState({
        msRemaining: 0
      });
    }
  },
  
  handleChange: function() {
    this.update(this.refs.input.value);
  },
  
  clear: function() {
    this.setState({
      lastValue: this.refs.input.value,
      url: ""
    });
    
    if (history && history.replaceState)
      history.replaceState({}, "Selectors.io", "?s=");
    
    this.props.onUserInput("");
    ReactDOM.findDOMNode(this.refs.input).focus(); 
  },
  
  redo: function() {
    this.update(this.state.lastValue);
  },
  
  update: function(value) {
    clearInterval(this.interval);
      
    this.setState({
      lastValue: this.refs.input.value,
      msRemaining: 1.0,
      url: encodeURIComponent(value)
    });
    
    this.interval = setInterval(this.tick, 100);
    
    this.props.onUserInput(value);
  },
  
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  
  render: function() {
    var
      cooldownClass = this.state.msRemaining > 0.1 ? 'active cooldown' : 'cooldown',
      cooldownText = this.state.msRemaining === 1 ? "1.0" : this.state.msRemaining
    ;
    
    return (
      <div className="row">
        <div className="col-lg-11 col-sm-10 col-xs-9">
          <form>
            <textarea
              autoFocus
              className="form-control"
              placeholder="Type or paste in your CSS selector here..."
              value={this.props.input}
              ref="input"
              onChange={this.handleChange}
            />
            <span className={cooldownClass}>{cooldownText}s until content updates</span>
          </form>
        </div>
        <div className="col-lg-1 col-sm-2 col-xs-3">
          <button className="btn btn-danger form-control" title="Undo Input" disabled={!this.props.input || this.state.msRemaining > 0} onClick={this.clear}>
            <i className="fa fa-close"></i>
          </button>
          <button className="btn btn-primary form-control" title="Redo Removed Input" disabled={!!this.props.input || !this.state.lastValue || this.state.msRemaining > 0} onClick={this.redo}>
            <i className="fa fa-repeat"></i>
          </button>
        </div>
      </div>
    );
  }
});