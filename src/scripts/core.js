var core = {};

core.SelectorsIO = function(selectorsGroup) {
  this.selectorSequences = s.getSequences(selectorsGroup);
  
  if (this.selectorSequences.length) {
    this.selectors = s.getSelectors(this.selectorSequences[0])
  } else {
    this.selectors = [];
  }
}

core.SelectorsIO.prototype.changeActiveSelectorSequence = function(index) {
  if (this.selectorSequences.length && this.selectorSequences[index])
    this.selectors = s.getSelectors(this.selectorSequences[index]);
}