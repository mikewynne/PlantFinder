// Instance the tour
var tour = new Tour({
  steps: [
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
],
  // Set this option as true to show a dark backdrop behind the popover and its element, highlighting the current step.
  backdrop: false,
  // Set this option as false to disable storage persistence, i.e. the tour starts from beginning every time the page is loaded.
  // storage: false
});

// Initialize the tour
tour.init();

// Start the tour
tour.start();