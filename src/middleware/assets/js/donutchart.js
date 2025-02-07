
var xValues = ["No Reference", "Website", "Test", "BSS", "BSS 1","Onsite standee","Devesh Bss",];
var yValues = [362,323, 52, 24, 15,6,0];
var barColors = [
  "blue",
  "orange",
  "purple",
  "brown",
  "red",
  "pink"
];

new Chart("donutChart", {
  type: "doughnut",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },

});