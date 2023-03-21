import { connect } from 'react-redux';
import Chart from 'react-apexcharts';
import { chartOptions, dummyData } from './PriceChart.config';
import Spinner from './Spinner';
import { priceChartLoadedSelector, priceChartSelector } from '../store/selectors';

const priceSymbol = (lastPriceChange) => {
	let output;
	if (lastPriceChange === '-') {
		output = <span className='text-success'>&#9650;</span>; // Green up triangle
	} else {
		output = <span className='text-danger'>&#9660;</span>; // red down triangle
	}
	return output;
};

const showPriceChart = (priceChart) => {
	return (
		<div className='price-chart'>
			<div className='price'>
				<h4>
					XTK/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}
				</h4>
			</div>
			<Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
		</div>
	);
};

const PriceChart = ({ priceChart, priceChartLoaded }) => {
	return (
		<div className='card bg-dark text-white'>
			<div className='card-header'>Price Chart</div>
			<div className='card-body price-chart'>{priceChartLoaded ? showPriceChart(priceChart) : <Spinner />}</div>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		priceChartLoaded: priceChartLoadedSelector(state),
		priceChart: priceChartSelector(state),
	};
}

export default connect(mapStateToProps)(PriceChart);
