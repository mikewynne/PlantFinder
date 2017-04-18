// Instance the tour
var tour = new Tour({
  storage: false, // set storage to false during development
});

tour.addSteps([
  {
    element: ".stepOne",
    title: "Welcome to the Plant Finder",
    content: "Do you need some help finding plants? Press End Tour if you know what you're looking for!"
  },
  {
    element: ".stepTwo",
    title: "Search by location",
    content: "Enter where you'd like to plant."
  },
  {
    element: ".stepThree",
    title: "Or choose from one of these lists",
    content: "Start with an existing plant palette or browse the entire database."
  },
  {
    element: ".stepFour",
    title: "Learn more",
    content: "City Lists details are found in Resources ."
  }
])


// Start the tour with the button
$('.start-tour').click(function(){
  tour.init();
  tour.start();
});