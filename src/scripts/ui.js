var SelectorInput = React.createClass({
  getInitialState: function() {
    return {
      msRemaining: 0
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
    clearInterval(this.interval);
      
    this.setState({
      msRemaining: 1.0
    });
    
    this.interval = setInterval(this.tick, 100);
    
    this.props.onUserInput(
      this.refs.input.value
    );
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
      <form>
        <textarea
          className="form-control"
          placeholder="Enter your CSS selector here..."
          value={this.props.input}
          ref="input"
          onChange={this.handleChange}
        />
        <span className={cooldownClass}>{cooldownText}s until content updates</span>
      </form>
    );
  }
});

var SelectorSequences = React.createClass({
  getInitialState: function() {
    return {
      activeIndex: 0
    }
  },
  
  handleClick: function(clickedIndex) {    
    this.setState({
      activeIndex: clickedIndex
    });
  },
  
  render: function() {
    var data = this.props.data;
      
    if (!data || !data.selectorSequences || !data.selectorSequences.length)
      return null
      
    var
      count = data.selectorSequences.length,
      sequences = new Array(count),
      sequencesPlural = "Sequence" + (count !== 1 ? "s" : "")
      self = this
    ;
      
    data.selectorSequences.forEach(function (sequence, index) {
      var className = self.state.activeIndex === index ? "active" : "";
      
      sequences[index] = (
        <li
          className={className}
          key={index}
          onClick={self.handleClick.bind(this, index)}
        >
          {sequence}
        </li>
      )
    });
      
    return (
      <span>
        <dl>
          <dt>{count} Selector {sequencesPlural} found...</dt>
          <dd className="text-muted">Click on a tab below to view deconstructed information.</dd>
        </dl>
        <ul>
          {sequences}
        </ul>
      </span>
    )
  }
});

var FormattedSelector = React.createClass({
  render: function() {
    var data = this.props.data;
    
    if (!data || !data.selectors || !data.selectors.length)
      return null;
      
    var
      formatted = [],
      margin = 0,
      marginIncrement = 6
    ;
    
    data.selectors.forEach(function(selector, index) {
      var type;
      
      try {
        type = s.getType(selector);
      }
      catch (e) {
        type = "invalid";
      }
      
      var className = "selector " + type;
      
      if (type === "combinator") {
        var brKey = 9999 - index;
        formatted.push(<br key={brKey} />);
        
        if (selector.trim() === "") {
          className += " space";
          margin += marginIncrement;
        }
      
        var style = { marginLeft: margin + "px" }
      
        formatted.push(
          <span
            className={className}
            key={index}
            style={style}
          >
            <span>{selector}</span>
          </span>
        );
      } else {
        formatted.push(
          <span
            className={className}
            key={index}
          >
            {selector}
          </span>
        );
      }
    });
    
    return (
      <pre id="formatted-selector">{formatted}</pre>
    )
  }
})

var SelectorsIOMain = React.createClass({
  updateTimer: null,
  
  getInitialState: function() {
    return {
      activeIndex: 0,
      input: '',
      data: new core.SelectorsIO("div#foo[role=main] > *.bar:hover [href^=\"#\"]::before, div#foo[role=main] > *.bar:hover [href^=\"#\"]::after")
    }
  },
  
  handleUserInput: function(input) {
    this.setState({
      input: input
    })
    
    if (this.updateTimer) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    var self = this;
    
    this.updateTimer = setTimeout(function() {
      self.setState({
        activeIndex: 0,
        data: new core.SelectorsIO(input)
      });
    }, 1000);
  },

  render: function() {
    return (
      <div>
        <div id="selector-input">
          <SelectorInput
            input={this.state.input}
            onUserInput={this.handleUserInput}
          />
        </div>
        <div className="row">
          <div className="col-lg-4">
            <nav id="sequence-list">
              <SelectorSequences data={this.state.data} />
            </nav>
          </div>
          <div className="col-lg-8">
            <section id="deconstructed-area">
              <FormattedSelector data={this.state.data} />
            </section>
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <SelectorsIOMain />,
  document.getElementById('main-area')
);