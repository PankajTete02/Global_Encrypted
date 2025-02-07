
var xValues = ["Completed", "Pending", "Red"];
var yValues = [770, 382,0];
var barColors = [
  "green",
  "orange",
  "red",

];

new Chart("pieChart", {
  type: "pie",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },

});



