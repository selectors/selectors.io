var SelectorsIOMain = React.createClass({
  updateTimer: null,
  
  getInitialState: function() {
    return this.setInitialState();
  },
  
  setInitialState: function() {
    var s = window.location.search ? decodeURIComponent(window.location.search.replace('\\#', '#').substr(3, window.location.search.length)) : "";
    
    if (!s)
      return {
        activeIndex: 0,
        input: "",
        inputCooldownActive: false,
        data: null,
        canDeconstruct: false,
        sequences: null,
        selectors: null
      }
      
    var data = new core.SelectorsIO(s);
    data.changeActiveSelectorSequence(0);
      
    return {
      activeIndex: 0,
      input: s,
      inputCooldownActive: false,
      data: data,
      canDeconstruct: false,
      sequences: data.selectorSequences,
      selectors: data.selectors
    }
  },
  
  handleUserInput: function(input) {
    if (!input) {
      this.setState({
        activeIndex: 0,
        data: null,
        input: '',
        inputCooldownActive: false,
        sequences: null,
        canDeconstruct: false
      });
    }
    else {
      this.setState({
        input: input
      })
      
      if (this.updateTimer) {
        window.clearTimeout(this.updateTimer);
        this.updateTimer = null;
      }
      else {
        this.setState({
          inputCooldownActive: true
        });
      }
      
      var self = this;
      
      this.updateTimer = setTimeout(function() {
        var data = new core.SelectorsIO(input);
        
        self.updateTimer = null;
        
        self.setState({
          activeIndex: 0,
          data: data,
          inputCooldownActive: false,
          sequences: data.selectorSequences,
          canDeconstruct: false
        });
        
        self.handleSequenceClick(0);
      }, 1000);
    }
  },
  
  handleSequenceClick: function(index) {    
    this.state.data.changeActiveSelectorSequence(index);
    
    this.setState({
      selectors: this.state.data.selectors
    });
  },
  
  deconstruct: function(isValid) {
    this.setState({
      canDeconstruct: isValid
    });
  },
  
  setSelectorInput: function(value) {
    this.setState({
      input: value
    });
    
    if (history && history.replaceState)
      history.replaceState({}, "Selectors.io", "?s=" + encodeURIComponent(value));
    
    if (this.updateTimer) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    else {
      this.setState({
        inputCooldownActive: true
      });
    }
    
    var self = this;
    
    this.updateTimer = setTimeout(function() {
      var data = new core.SelectorsIO(value);
       
      self.updateTimer = null;
      
      self.setState({
        activeIndex: 0,
        data: data,
        inputCooldownActive: false,
        sequences: data.selectorSequences,
        canDeconstruct: false
      });
      
      self.handleSequenceClick(0);
    }, 1000);
  },

  render: function() {
    var
      selectorInput,
      mediaQueryNotice,
      selectorSequences,
      formattedSelectorSequence,
      deconstructionPane,
      deconstruction
    ;
    
    if (this.state.data && this.state.input && !this.state.inputCooldownActive) {      
      if (this.state.data.hasMediaQuery)
        mediaQueryNotice = (
          <div className="alert alert-warning">
            <i className="fa fa-warning"></i> The <code>{this.state.data.hasMediaQuery}</code> &lsquo;at keyword&rsquo; has been ignored ignored. <abbr title="'at keywords' are outside of the scope of selectors.io until a later release">Why?</abbr>
          </div>
        );
        
      if (this.state.canDeconstruct && this.state.selectors)
        deconstruction = (
          <article id="deconstruction-summary">
            <h3>Summary</h3>
            <SelectorSequenceSummary selectors={this.state.selectors} />
          </article>
        );
      
      if (this.state.sequences)
        selectorSequences = (
          <nav id="sequence-list">
            <SelectorSequences
              onSequenceClick={this.handleSequenceClick}
              sequences={this.state.sequences}
            />
            {mediaQueryNotice}
          </nav>
        );
      
      if (this.state.selectors)
        formattedSelectorSequence = (
          <section id="deconstructed-area">
            <FormattedSelectorSequence
              selectors={this.state.selectors}
              onValidInput={this.deconstruct}
            />
          </section>
        );
        
      deconstructionPane = (
        <div className="row">
          <div className="col-md-4">
            {selectorSequences}
          </div>
          <div className="col-md-8">
            {formattedSelectorSequence}
            {deconstruction}
          </div>
        </div>
      );
    }
    else if (this.state.inputCooldownActive) {
      deconstructionPane = (
        <div className="alert alert-warning">
          <i className="fa fa-cog fa-spin"></i> Processing...
        </div>
      )
    }
    else {
      var 
        self = this,
        popularExamples = [],
        popularSelectors = [
          {
            description: "Bootstrap",
            selectorSequence: ".list-group-item > .badge + .badge"
          },
          {
            description: "<a href='http://stackoverflow.com/q/3859101/1317805'>This</a> Stack Overflow question",
            selectorSequence: "a[href^=\"http:\"]"
          },
          {
            description: "The Selectors Level 3 W3C Recommendation",
            selectorSequence: "ns|*"
          },
          {
            description: "Normalize.css",
            selectorSequence: "audio:not([controls])"
          }
        ]
      ;
      
      popularSelectors.forEach(function(popular, index) {
        popularExamples.push(
          <p key={index}>
            <strong>
              <a className="selector" onClick={function() { self.setSelectorInput(popular.selectorSequence) }}>
                {popular.selectorSequence}
              </a>
            </strong>
            <small dangerouslySetInnerHTML={ { __html: popular.description }}></small>
          </p>
        );
      });
      
      deconstructionPane = (
        <div className="row" id="splash">
          <div className="col-md-12">
            <article id="start-here">
              <span className="text-success">
                <p className="arrows lead text-center"><i className="fa fa-arrow-up"></i><i className="fa fa-arrow-up"></i><i className="fa fa-arrow-up"></i></p>
                <p className="lead text-center">Start by typing or pasting in any CSS selector you like into the above text input field</p>
              </span>
            </article>
            <hr/>
            <article id="welcome">
              <h2>Welcome</h2>
              <p>
                <strong>Selectors.io</strong> has only recently been launched and is still in a very beta-esque state.
              </p>
              <p>
                It's open-sourced on <i className="fa fa-github"></i> GitHub at <a href="https://github.com/selectors/selectors.io">github.com/selectors/selectors.io</a>.
                <br/>
                If you find any bugs, feel free to report them at <i className="fa fa-bug"></i> <a href="https://github.com/selectors/selectors.io/issues">github.com/selectors/selectors.io/issues</a>.
              </p>
            </article>
            <h4>Examples</h4>
            <p>
              If you're lost for inspiration, you can click on any of the below examples to give Selectors.io a try!
              <br/>
              <span className="text-muted">Note that you can get back to this list at any point by clicking the <i className="fa fa-undo"></i> button.</span>
            </p>
            <blockquote>
              {popularExamples}
            </blockquote>
          </div>
        </div>
      )
    }
    
    return (
      <div>
        <div id="selector-input">
          <SelectorInput
            input={this.state.input}
            onUserInput={this.handleUserInput}
          />
        </div>
        {deconstructionPane}
      </div>
    );
  }
});