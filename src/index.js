import React from "react";
import ReactDOM from "react-dom";
import { Doughnut } from "react-chartjs-2";
import "./index.css";

class App extends React.Component {
  state = {
    users: []
  };

  componentDidMount() {
    fetch("https://5bfd357c827c3800139ae907.mockapi.io/treefund/user")
      .then(res => res.json())
      .then(data => {
        let userdonations = data.map((user, index) => {
          return user.donations;
        });
        console.log(userdonations);
        let donations = [].concat.apply([], userdonations);
        let donationCat = donations.map(d => {
          return {
            category: d.category,
            trees: d.trees,
            month: new Date(d.date).getMonth()
          };
        });

        let topdonators = [];
        userdonations.forEach(donations => {
          console.log(donations);
          let userId = 0;
          let totalTreesUser = 0;
          let donatorUsername = "";
          donations.forEach(donation => {
            console.log(donation.trees);
            totalTreesUser = totalTreesUser + donation.trees;
            userId = donation.userId;
          });
          data.forEach(user => {
            if (user.id === userId) {
              donatorUsername = user.username;
            }
          });
          console.log(totalTreesUser);
          topdonators.push({
            userId: userId,
            username: donatorUsername,
            totalTreesDonated: totalTreesUser
          });
        });
        console.log(topdonators);

        let topDon = topdonators
          .sort((a, b) => b.totalTreesDonated - a.totalTreesDonated)
          .slice(0, 5);
        console.log(topDon);

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

        // let outputMonth = [];
        // donationCat.forEach(function(item) {
        //   let existing = outputMonth.filter(function(v, i) {
        //     return v.month == item.month;
        //   });
        //   if (existing.length) {
        //     let existingIndex = outputMonth.indexOf(existing[0]);
        //     output[existingIndex].trees += item.trees;
        //   } else {
        //     if (typeof item.value === "string") item.value = [item.value];
        //     outputMonth.push(item);
        //   }
        // });

        const labels = output.map(f => {
          return f.category;
        });
        const amounts = output.map(a => {
          return a.trees;
        });
        const totalAmount = amounts.reduce(add, 0);

        function add(a, b) {
          return a + b;
        }
        console.log(output);

        this.setState({
          users: data,
          numUsers: data.length,
          donations: donations,
          topFiveDonators: topDon,
          total: totalAmount * 5,
          average: (totalAmount * 5) / amounts.length,
          //donByMonth: outputMonth,
          chartData: {
            labels: labels,

            datasets: [
              {
                lable: "Donations",
                data: amounts,
                backgroundColor: ["#0C5250", "#086965", "#A8D498", "#5DBB99"]
              }
            ]
          }
        });
      });
  }
  render() {
    const users = this.state.users.map(user => {
      return (
        <Post username={user.username} donations={user.donations.length} />
      );
    });

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
        <div>
          <h2>
            Total amount: <span>{this.state.total}kr.</span>
          </h2>
        </div>
        <div>
          <h2>
            Average donation: <span>{this.state.average}kr.</span>
          </h2>
        </div>
        <div>
          <h2>
            Number of users: <span>{this.state.numUsers}</span>
          </h2>
        </div>

        <div className="chart-div">
          <h1>Donations per forest</h1>
          <Chart className="doughnutChart" data={this.state.chartData} />
        </div>
      </div>
    );
  }
}
function Chart(props) {
  return <Doughnut data={props.data} />;
}
function User(props) {
  return (
    <div>
      <h1>{props.username}</h1>
      <h1>{props.totalDonation}</h1>
    </div>
  );
}

function Post(props) {
  return (
    <div className="user">
      <h1>{props.username}</h1>
      <h2>{props.donations}</h2>>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
