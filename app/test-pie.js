const React = require('react');
const { PieChart } = require('recharts');
const { renderToStaticMarkup } = require('react-dom/server');

try {
  renderToStaticMarkup(React.createElement(PieChart, { className: "h-16 w-16 mb-4 opacity-20" }));
  console.log("No crash!");
} catch (e) {
  console.error("Crash!", e.message);
}
