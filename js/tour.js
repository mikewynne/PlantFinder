// Instance the tour
var tour = new Tour({
  storage: false, // set storage to false during development
});

tour.addSteps([
  {
    element: ".stepWelcome",
    placement: 'right',
    title: "Welcome to the Plant Finder",
    content: "Do you need some help using the Plant Finder? Press Next to continue and press End Tour if you know what you're looking for!"
  },
  {
    element: ".stepLocation",
    placement: 'left',
    title: "Search by Location",
    content: "Enter where you'd like to plant and click on the Search button."
  },
  {
    element: ".stepStartSearch",
    placement: 'left',
    title: "Or Search by Plant Types",
    content: "Start with an existing plant list or browse the entire database."
  },
  {
    element: ".stepCityLists",
    placement: 'left',
    title: "You Can Search by City Lists",
    content: "Use the filters to refine your list for habitat-friendly plants after starting with one of these City List categories."
  },
  {
    element: ".stepPlantPalettes",
    placement: 'left',
    title: "You Can Search by Plant Palettes",
    content: "Shorter, pre-selected palettes to give you good ideas for appropriate species for landscaping in San Francisco."
  },
  {
    element: ".stepAbout",
    placement: 'left',
    title: "Learn More",
    content: "Visit the About page to learn more about the Plant Finder, download the data set and give feedback."
  },
  {
    element: ".stepGlossary",
    placement: 'left',
    title: "Learn More",
    content: "Check out the Glossary page to speak plant lingo fluently."
  },
  {
    element: ".stepResources",
    title: "Learn More",
    content: "Information on Plant Palettes, City Lists and much more are found in Resources page."
  }
])


// Start the tour with the button
$('.start-tour').click(function(){
  tour.init();
  tour.restart();
});