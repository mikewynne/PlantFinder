// Instance the tour
var tour = new Tour({
  storage: false, // set storage to false during development
});

tour.addSteps([
  // {
  //   element: ".stepOne",
  //   title: "Welcome to the Plant Finder",
  //   content: "Do you need some help finding plants? Press End Tour if you know what you're looking for!"
  // },
  {
    element: ".stepTwo",
    title: "Search by Location",
    content: "Enter where you'd like to plant."
  },
  {
    element: ".stepThree",
    title: "Or Choose From an Existing List",
    content: "Start with an existing plant palette or browse the entire database."
  },
    {
    element: ".stepPlantPalettes",
    title: "You Can Search by Plant Palettes",
    content: "Shorter, pre-selected palettes to give you good ideas for appropriate species for landscaping in San Francisco."
  },
  {
    element: ".stepCityLists",
    title: "You Can Search by City Lists",
    content: "Use the filters to refine your list for habitat-friendly plants after starting with one of these City List categories."
  },
  {
    element: ".stepFour",
    title: "Learn More",
    content: "City Lists details are found in Resources."
  }
])


// Start the tour with the button
$('.start-tour').click(function(){
  tour.init();
  tour.start();
});