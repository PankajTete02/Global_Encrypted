
// Sample data (replace this with your actual data)
const ctx = document.getElementById('wasteCollectionChart');
const data = [

    { date: '2023/02/13', options: { completed: 30, pending: 0 } },

    { date: '2023/03/02', options: { completed: 0, pending: 0 } },

    { date: '2023/03/19', options: { completed: 7, pending: 0 } },

    { date: '2023/04/05', options: { completed: 0, pending: 0 } },

    { date: '2023/04/22', options: { completed: 70, pending: 20, } },

    { date: '2023/05/09', options: { completed: 55, pending: 25 } },

    { date: '2023/05/26', options: { completed: 40, pending: 30 } },

    { date: '2023/06/12', options: { completed: 65, pending: 15 } },

    { date: '2023/06/29', options: { completed: 50, pending: 20 } },

    { date: '2023/07/16', options: { completed: 75, pending: 10 } }

];



// Create a stacked bar chart



new Chart(ctx, {

    type: 'bar',

    data: {

        labels: data.map(entry => entry.date),

        datasets: [

            {

                label: 'Completed',

                data: data.map(entry => entry.options.completed),

                backgroundColor: 'Green', // Green color for completed

                borderWidth: 1

            },

            {

                label: 'Pending',

                data: data.map(entry => entry.options.pending),

                backgroundColor: 'orange', // Yellow color for pending

                borderWidth: 1

            }

        ]

    },

    options: {

        scales: {

            x: {

                stacked: true // Stack the bars horizontally

            },

            y: {

                stacked: true // Stack the bars vertically

            }

        }

    }

});

