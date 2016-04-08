var FormattedSelectorSequence = React.createClass({
  handleValidInput: function(valid) {
    this.props.onValidInput(valid);
  },
  
  render: function() {
    var selectors = this.props.selectors;
    
    if (selectors && selectors.invalidSequenceArray) {
      var
        invalidSequence = new Array(selectors.invalidSequenceArray.length),
        urlParts = ""
      ;
      
      selectors.invalidSequenceArray.forEach(function(selectorObj, index) {
        urlParts += selectorObj.text;
        
        if (selectorObj.text) {
          if (selectorObj.valid)
            invalidSequence.push(
              <span key={index} className="text-muted">{selectorObj.text}</span>
            );
          else 
            invalidSequence.push(
              <span key={index} className="invalid-selector-part">{selectorObj.text}</span>
            );
        }
      });
      
      return (
        <div id="formatted-selector-area">
          <div className="alert alert-danger">
            <i className="fa fa-exclamation-circle"></i> The passed-in selector is invalid.
          </div>
          <p>Invalid parts are highlighted below:</p>
          <pre>{invalidSequence}</pre>
          <div className="alert alert-warning">
            <i className="fa fa-warning"></i> In-depth information as to <em>why</em> this selector sequence is invalid is outside of the scope of selectors.io until a later release. If you believe this selector <em>is</em> valid and that this error has been generated incorrectly, please raise an issue on the GitHub repository at <i className="fa fa-bug"></i> <a href="https://github.com/selectors/selectors.io/issues">github.com/selectors/selectors.io/issues</a>, remembering to include the exact selector you used to generate this message so that it can be replicated.
          </div>
        </div>
      );
    }
    else if (!selectors || !selectors.elements || !selectors.elements.detailed || !selectors.elements.detailed.length)
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
      
      if (first.type === "combinator" && (first.selector === " " || first.selector === ">"))
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