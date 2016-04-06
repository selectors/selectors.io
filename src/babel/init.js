var splashArea = document.getElementById('splash-area');
splashArea.parentElement.removeChild(splashArea);
  
ReactDOM.render(
  <SelectorsIOMain />,
  document.getElementById('main-area')
);