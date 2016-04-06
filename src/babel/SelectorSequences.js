var SelectorSequences = React.createClass({
  getInitialState: function() {
    return {
      activeIndex: 0
    }
  },
  
  handleClick: function(e, clickedIndex) {    
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
      
      
    if (history && history.replaceState)
      history.replaceState({}, "Selectors.io", "?s=" + encodeURIComponent(selectorSequences.join(',')));
        
    var count = selectorSequences.length;
    var sequences = new Array(count);
    var sequencesPlural = "Sequence" + (count !== 1 ? "s" : "");
    var self = this;
      
    selectorSequences.forEach(function (sequence, index) {
      var className = typeof self.state.activeIndex === "number" && self.state.activeIndex === index ? "active" : "";
      
      sequences[index] = (
        <li
          className={className}
          key={index}
          onClick={self.handleClick.bind(null, this, index)}
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