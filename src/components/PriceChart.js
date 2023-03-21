import { connect } from 'react-redux';
import Chart from 'react-apexcharts';
import { chartOptions, dummyData } from './PriceChart.config';
import Spinner from './Spinner';

const showPriceChart = () => {
	return (
		<div className='price-chart'>
			<Chart options={chartOptions} series={dummyData} type='candlestick' width='100%' height='100%' />
		</div>
	);
};

const PriceChart = () => {
	return (
		<div className='card bg-dark text-white'>
			<div className='card-header'>Price Chart</div>
			<div className='card-body price-chart'>{showPriceChart()}</div>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		// TODO...
	};
}

export default connect(mapStateToProps)(PriceChart);
