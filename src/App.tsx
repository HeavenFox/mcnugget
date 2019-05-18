import React, { PureComponent } from "react";
import * as _ from "lodash";
import "./App.css";

type DPStates = [number, number, number][];

function calculateOptimal(pricing: [number, number][], maxCount: number) {
  const f: DPStates = [[0, 0, 0]];
  for (let i = 1; i <= maxCount; i++) {
    let minPrice = Infinity;
    let decision = 0;
    let prevState = 0;

    for (let j = 0; j < i; j++) {
      for (const [count, price] of pricing) {
        if (i - j <= count && f[j][0] + price < minPrice) {
          prevState = j;
          decision = count;
          minPrice = f[j][0] + price;
        }
      }
    }

    f[i] = [minPrice, decision, prevState];
  }

  return f;
}

function parseState(f: DPStates, count: number): [number, [number, number][]] {
  const counts: number[] = [];
  let i = count;
  while (i > 0) {
    counts[f[i][1]] = (counts[f[i][1]] || 0) + 1;
    i = f[i][2];
  }

  const result: [number, number][] = [];
  counts.forEach((value, index) => result.push([index, value]));
  return [f[count][0], result];
}

interface CalculatorProps {
  f: DPStates;
}

interface CalculatorState {
  count: number;
}

class Calculator extends PureComponent<CalculatorProps, CalculatorState> {
  state = {
    count: 10
  };

  render() {
    const [price, counts] = parseState(this.props.f, this.state.count);
    let sumCount = counts.reduce((prev, [cnt, num]) => prev + cnt * num, 0);

    return (
      <div>
        <input
          className="count-slider"
          type="range"
          min="1"
          max="40"
          value={this.state.count}
          step="1"
          onChange={e => this.setState({ count: +e.currentTarget.value })}
        />
        <p>
          You need <em>${price.toFixed(2)}</em> for {this.state.count} nuggets:
        </p>
        <ul>
          {counts.map(([count, numToBuy]) => (
            <li key={count}>
              {count} nuggests x {numToBuy}
            </li>
          ))}
        </ul>
        <p>You will get {sumCount} nuggets.</p>
      </div>
    );
  }
}

interface AppState {
  pricing: { [count: number]: number };
}

const SAMPLE_PRICING_1 = {
  4: 1.29,
  6: 3.69,
  10: 4.79,
  20: 5
};

export default class App extends PureComponent<{}, AppState> {
  state = { pricing: SAMPLE_PRICING_1 };

  onPriceChange = (count: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({
      pricing: {
        ...this.state.pricing,
        [count]: +e.currentTarget.value
      }
    });
  };

  render() {
    const pricingList: [number, number][] = [];
    _.forEach(this.state.pricing, (price, count) =>
      pricingList.push([+count, price])
    );
    const f = calculateOptimal(pricingList, 40);
    return (
      <div>
        <h2>Step 1: Enter Menu Prices</h2>
        <ul className="pricing-list">
          {pricingList.map(([count, price]) => (
            <li key={count}>
              <div className="count">{count} nuggets</div>
              <div className="price">
                $
                <input
                  value={price}
                  type="number"
                  onChange={this.onPriceChange(count)}
                />
              </div>
              <div className="unit-price">
                (${(price / count).toFixed(2)} ea)
              </div>
            </li>
          ))}
        </ul>
        <h2>Step 2: Enjoy</h2>
        <Calculator f={f} />
      </div>
    );
  }
}
