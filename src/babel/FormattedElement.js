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