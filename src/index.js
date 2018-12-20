import React from "react";
import ReactDOM from "react-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import "./index.css";

class App extends React.Component {
  state = {
    users: [],
    topFiveDonators: [],
    newUsers: [],
    legend: { display: true },
    currentDate: new Date()
  };

  componentDidMount() {
    fetch("https://5bfd357c827c3800139ae907.mockapi.io/treefund/user")
      .then(res => res.json())
      .then(data => {
        //Creates array containing an array of donations per user
        let userdonations = data.map((user, index) => {
          return user.donations;
        });
        //Array of all donations
        let donations = [].concat.apply([], userdonations);
        //
        let donationCat = donations.map(d => {
          return {
            category: d.category,
            trees: d.trees,
            month: new Date(d.date).getMonth()
          };
        });
        //Number of new users this month
        let newUserThisMonth = 0;

        data.forEach(user => {
          let createdMonth = new Date(user.date).getMonth();

          if (this.state.currentDate.getMonth() === createdMonth) {
            newUserThisMonth++;
          }
        });

        //Creates array of users with total amount donated
        let topdonators = [];
        userdonations.forEach(donations => {
          let userId = 0;
          let totalTreesUser = 0;
          let donatorUsername = "";
          donations.forEach(donation => {
            totalTreesUser = totalTreesUser + donation.trees;
            userId = donation.userId;
          });
          data.forEach(user => {
            if (user.id === userId) {
              donatorUsername = user.username;
            }
          });

          topdonators.push({
            userId: userId,
            username: donatorUsername,
            totalTreesDonated: totalTreesUser * 10
          });
        });

        //Sorts by total amount of donations and gets the first five
        let topDon = topdonators
          .sort((a, b) => b.totalTreesDonated - a.totalTreesDonated)
          .slice(0, 5);

        //Merges all donations array by category (forest)
        //https://stackoverflow.com/questions/33850412/merge-javascript-objects-in-array-with-same-key
        let output = [];
        donationCat.forEach(function(item) {
          let existing = output.filter(function(v, i) {
            return v.category == item.category;
          });
          if (existing.length) {
            let existingIndex = output.indexOf(existing[0]);

            output[existingIndex].trees += item.trees;
          } else {
            if (typeof item.value === "string") item.value = [item.value];
            output.push(item);
          }
        });

        //Creates array of donations per month 0-11 by order
        let outputMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        donationCat.forEach(function(item) {
          let existingMonth = outputMonth.filter(function(v, i) {
            return v.month == item.month;
          });
          if (existingMonth.length) {
            let existingIndexMonth = outputMonth.indexOf(existingMonth[0]);
            outputMonth[existingIndexMonth].trees += item.trees;
          } else {
            if (typeof item.value === "string") item.value = [item.value];
            outputMonth[item.month] += item.trees;
          }
        });

        //creates array of categories
        const labels = output.map(f => {
          return f.category;
        });
        //creates array of values of donations same order as categories
        const amountsPerForest = output.map(a => {
          return a.trees;
        });

        //creates array of dontaions just the amount of trees
        const donationAmounts = donations.map(d => {
          return d.trees;
        });

        //Sums all the donation values
        const totalAmount = donationAmounts.reduce(add, 0);

        function add(a, b) {
          return a + b;
        }

        this.setState({
          users: data,
          numUsers: data.length,
          donations: donations,
          topFiveDonators: topDon,
          total: totalAmount * 10,
          average: Math.floor((totalAmount * 10) / donationAmounts.length),
          newUsers: newUserThisMonth,
          //donByMonth: outputMonth,
          barChartData: {
            labels: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ],
            datasets: [
              {
                lable: "Donation per Month",
                data: outputMonth,
                backgroundColor: [
                  "#0C5250",
                  "#086965",
                  "#A8D498",
                  "#5DBB99",
                  "#0C5250",
                  "#086965",
                  "#A8D498",
                  "#5DBB99",
                  "#0C5250",
                  "#086965",
                  "#A8D498",
                  "#5DBB99"
                ]
              }
            ]
          },
          chartData: {
            labels: labels,

            datasets: [
              {
                lable: "Donations per Forest",
                data: amountsPerForest,
                backgroundColor: ["#0C5250", "#086965", "#A8D498", "#5DBB99"]
              }
            ]
          }
        });
      });
  }
  render() {
    const topUsers = this.state.topFiveDonators.map(userDon => {
      return (
        <User
          username={userDon.username}
          totalDonation={userDon.totalTreesDonated}
        />
      );
    });

    return (
      <div className="main">
        <div className="number-div">
          <h2 className="currentDate">
            {this.state.currentDate.toDateString()}
          </h2>

          <h2>
            Total amount: <span>{this.state.total}kr.</span>
          </h2>

          <h2>
            Average donation: <span>{this.state.average}kr.</span>
          </h2>

          <h2>
            Number of users: <span>{this.state.numUsers}</span>
          </h2>
          <h2>
            New Users this month: <span>{this.state.newUsers}</span>
          </h2>
        </div>
        <div className="topDonators-div">
          <ol className="topDonators">
            <h1>Top 5 Donators</h1>
            {topUsers}
          </ol>
        </div>

        <div className="chart-div">
          <h1>Donations per forest</h1>
          <Chart className="doughnutChart" data={this.state.chartData} />
        </div>
        <div className="barchart-div">
          <h1>Donations per Month</h1>
          <BarChart legend={this.state.legend} data={this.state.barChartData} />
        </div>
      </div>
    );
  }
}
function Chart(props) {
  return <Doughnut data={props.data} />;
}
function BarChart(props) {
  return <Bar legend={props.legend} data={props.data} />;
}
function User(props) {
  return (
    <li>
      <h1>
        Username: <span>{props.username}</span>
      </h1>
      <h1>
        Total donations:<span>{props.totalDonation}kr.</span>
      </h1>
    </li>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
