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
    
    this.props.onSequenceClick(
      clickedIndex
    );
  },
  
  render: function() {
    var selectorSequences = this.props.sequences;
      
    if (!selectorSequences || !selectorSequences.length)
      return null
      
    var
      count = selectorSequences.length,
      sequences = new Array(count),
      sequencesPlural = "Sequence" + (count !== 1 ? "s" : "")
      self = this
    ;
      
    selectorSequences.forEach(function (sequence, index) {
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

var FormattedSelectorValidation = React.createClass({
  componentDidMount: function() {
    console.info("DID MOUNT");
    
    var domNode = ReactDOM.findDOMNode(this)
    
    if (!domNode)
      return;
      
    this.props.onValidInput(domNode.className === "alert alert-success");
  },
  
  render: function() {    
    var 
      invalid = [],
      elements = this.props.elements,
      elementCount = elements.length,
      pseudoElements = [],
      pseudoNotAtEnd = [],
      self = this
    ;
    
    elements.forEach(function(selectors, index) {
      var 
        currentElement = index + 1,
        types = [],
        ids = []
      ;
      
      selectors.forEach(function(selector, subIndex) {
        if (selector.type === "type" || selector.type === "universal")
          types.push(selector);
        else if (selector.type === "id" && ids.indexOf(selector.selector) === -1)
          ids.push(selector.selector);
        else if (selector.type === "pseudo-element") {
          pseudoElements.push(selector.selector);
          
          if (subIndex !== selectors.length - 1 || index != elementCount - 1)
            pseudoNotAtEnd.push(selector.selector);
        }
      });
      
      if (types.length > 1) {
        var
          t1 = types[0].selector,
          t1Class = "selector " + types[0].type,
          t2 = types[1].selector,
          t2Class = "selector " + types[1].type,
          more = types.length > 2 ? types.length - 2 : false
        ;
          
        if (!more)
          invalid.push(
            <li>
              Selectors should only ever include <strong>one</strong> type <em>or</em> universal selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className={t1Class}>{t1}</code> and <code className={t2Class}>{t2}</code>.</em>
            </li>
          );
          
        else
          invalid.push(
            <li>
              Selectors should only ever include <strong>one</strong> type <em>or</em> universal selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className={t1Class}>{t1}</code>, <code className={t2Class}>{t2}</code> and {more} other(s).</em>
            </li>
          );
      }
      
      if (ids.length > 1) {
        var 
          id1 = ids[0],
          id2 = ids[1],
          more = ids.length > 2 ? ids.length - 2 : false
        ;
        
        if (!more)
          invalid.push(
            <li>
              Selectors should only ever include <strong>one</strong> unique<sup>&#8224;</sup> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className="selector id">{id1}</code> and <code className="selector id">{id2}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
        
        else
          invalid.push(
            <li>
              Selectors should only ever include <strong>one</strong> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector id">{id1}</code>, <code className="selector id">{id2}</code> and {more} other(s).</em>
              <br/>
              <small className="text-muted">Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
      }
    });
    
    if (pseudoElements.length > 1) {
      var 
        pe1 = pseudoElements[0],
        pe2 = pseudoElements[1],
        more = pseudoElements.length > 2 ? pseudoElements.length - 2 : false
      ;
      
      if (!more)
        invalid.push(
          <li>
            Selectors should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes both <code className="selector pseudo-element">{pe1}</code> and <code className="selector pseudo-element">{pe2}</code>.</em>
          </li>
        );
      
      else
        invalid.push(
          <li>
            Selector sequences should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes <code className="selector pseudo-element">{pe1}</code>, <code className="selector pseudo-element">{pe2}</code> and {more} other(s).</em>
          </li>
        );
    }
    
    if (pseudoNotAtEnd.length && pseudoElements.length === 1) {
      var pe = pseudoNotAtEnd[pseudoNotAtEnd.length - 1];
      
      invalid.push(
        <li>
          Pseudo-elements must be placed at the very end of a selector sequence.
          <br/>
          <em className="text-info"><code className="selector pseudo-element">{pe}</code> is not the final selector attached to Element {elementCount}.</em>
        </li>
      )
    }
    
    if (!invalid.length) {          
      return (
        <div className="alert alert-success">
          <p><i className="fa fa-check"></i> This selector sequence is valid and will select <strong>Element {elementCount}</strong>.</p>
        </div>
      )
    }
      
    var errorCount = invalid.length;
    
    return (
      <div className="alert alert-danger">
        <p><i className="fa fa-warning"></i> This selector sequence is not valid (<strong>{errorCount} errors</strong>):</p>
        <div className="alert alert-warning">
          <ol className="text-danger">{invalid}</ol>
        </div>
      </div>
    )
  }
});

var FormattedElement = React.createClass({
  render: function() {
    var selectors = this.props.selectors;
      
    var
      formatted = new Array(selectors.length),
      marginLeft = { marginLeft: this.props.margin + "px" }
    ;
    
    selectors.forEach(function(s, index) {
      var
        className = "selector " + s.type + (s.type === "combinator" && s.selector === " " ? " space" : ""),
        selector = s.selector
      ;
      
      formatted[index] = (
        <span className={className} key={index}>
          {selector}
        </span>
      )
    });
    
    return (
      <div className="formatted-element" style={marginLeft}>
        {formatted}
      </div>
    )
  }
});

var FormattedSelectorSequence = React.createClass({
  handleValidInput: function(valid) {
    console.info(valid);
  },
  
  render: function() {
    var selectors = this.props.selectors;
    
    if (!selectors || !selectors.elements || !selectors.elements.detailed || !selectors.elements.detailed.length)
      return (<div id="formatted-selector-area"></div>);
      
    var
      onValidInput = this.props.onValidInput,
      elements = selectors.elements.detailed,
      formatted = new Array(elements.length),
      margin = 0,
      marginIncrement = 6,
      elementCount = elements.length
    ;
    
    elements.forEach(function(selectors, index) {
      var first = elements[index][0];
      
      if (first.type === "combinator" && first.selector === " ")
        margin += marginIncrement;
      
      formatted[index] = (
        <FormattedElement margin={margin} selectors={selectors} index={index} total={elementCount} key={index} />
      );
    });
    
    return (
      <div id="formatted-selector-area">
        <pre>{formatted}</pre>
        <FormattedSelectorValidation elements={elements} onValidInput={this.handleValidInput} />
      </div>
    )
  }
});

var Deconstructed = React.createClass({
  render: function() {
    var elements = this.props.elements;
    
    if (!elements || !elements.length)
      return null;
      
    return (
      <div>Foo</div>
    )
  }
});

var SelectorsIOMain = React.createClass({
  updateTimer: null,
  
  getInitialState: function() {
    var data = new core.SelectorsIO("div#foo[role=main] > *.bar:hover [href^=\"#\"]::before, div#foo[role=main] > *.bar:hover [href^=\"#\"]::after");
    data.changeActiveSelectorSequence(0);
    
    return {
      activeIndex: 0,
      input: '',
      inputCooldownActive: false,
      data: data,
      canDeconstruct: false,
      sequences: data.selectorSequences,
      selectors: data.selectors
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
    else {
      this.setState({
        selectors: null,
      });
    }
    
    var self = this;
    
    this.updateTimer = setTimeout(function() {
      var data = new core.SelectorsIO(input);
      
      self.updateTimer = null;
      
      self.setState({
        activeIndex: 0,
        data: data,
        sequences: data.selectorSequences,
        canDeconstruct: false
      });
      
      self.handleSequenceClick(0);
    }, 1000);
  },
  
  handleSequenceClick: function(index) {    
    this.state.data.changeActiveSelectorSequence(index);
    
    this.setState({
      selectors: this.state.data.selectors
    });
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
              <SelectorSequences
                onSequenceClick={this.handleSequenceClick}
                sequences={this.state.sequences}
              />
            </nav>
          </div>
          <div className="col-lg-8">
            <section id="deconstructed-area">
              <FormattedSelectorSequence
                selectors={this.state.selectors}
                onValidInput={this.deconstruct}
              />
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