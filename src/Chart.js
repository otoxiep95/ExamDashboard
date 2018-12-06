import React, { Component } from "react";

import { Doughnut } from "react-chartjs-2";

class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: {
        labels: props.cats,

        datasets: [
          {
            lable: "Donations",
            data: [],
            backgroundColor: "grey"
          }
        ]
      }
    };
  }

  render() {
    return <Doughnut data={this.state.chartData} />;
  }
}

export default Chart;
